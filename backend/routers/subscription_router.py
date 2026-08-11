from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

import database
import models
import auth
from services.payment_adapter_trc20 import TRC20Adapter
from services.payment_orchestrator import PaymentOrchestrator

router = APIRouter(
    prefix="/subscriptions",
    tags=["subscriptions"]
)

@router.post("/refresh-payments")
def refresh_payments(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Triggers the blockchain payment poller to check for any incoming payments.
    Instead of running infinitely in the background, this is called on-demand to save resources.
    """
    orchestrator = PaymentOrchestrator(db)
    orchestrator.poll_for_payments()
    return {"message": "Payment polling triggered successfully"}

@router.get("/plans")
def get_plans(db: Session = Depends(database.get_db)):
    plans = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.is_active == True).all()
    return plans

@router.post("/subscribe/{plan_id}")
def subscribe_to_plan(plan_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    plan = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    # Check if user already has an active subscription
    existing_sub = db.query(models.Subscription).filter(
        models.Subscription.customer_id == current_user.id,
        models.Subscription.status == 'ACTIVE'
    ).first()
    
    if existing_sub:
        raise HTTPException(status_code=400, detail="User already has an active subscription")

    # Create Subscription record
    new_sub = models.Subscription(
        customer_id=current_user.id,
        plan_id=plan.id,
        status='PENDING_INITIAL_PAYMENT'
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)

    # If the plan is free, activate it immediately
    if plan.price_usd == 0:
        new_sub.status = 'ACTIVE'
        new_sub.current_period_start = datetime.utcnow()
        new_sub.current_period_end = datetime.utcnow() + timedelta(days=plan.billing_cycle_days)
        db.commit()
        return {"message": "Free plan activated successfully", "subscription": new_sub}

    # If it's a paid plan, generate an Invoice
    # Default to TRC20 USDT for Phase 1
    network = db.query(models.Network).filter(models.Network.code == "TRC20").first()
    asset = db.query(models.NetworkAsset).filter(models.NetworkAsset.asset_symbol == "USDT", models.NetworkAsset.network_id == network.id).first()
    
    new_invoice = models.Invoice(
        reference_type="SUBSCRIPTION",
        reference_id=new_sub.id,
        amount_usd=plan.price_usd,
        selected_network_id=network.id,
        selected_asset_symbol=asset.asset_symbol,
        expected_crypto_amount=plan.price_usd, # 1 USDT = 1 USD for simplicity in MVP
        status='AWAITING_PAYMENT'
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    # Generate Wallet Address for payment using TRC20 Adapter
    adapter = TRC20Adapter()
    address_info = adapter.generate_address(new_invoice.id)
    
    new_wallet = models.WalletAddress(
        network_id=network.id,
        address=address_info['address'],
        derivation_path=address_info.get('derivation_path'),
        invoice_id=new_invoice.id
    )
    db.add(new_wallet)
    db.commit()

    return {
        "message": "Invoice created",
        "subscription_id": new_sub.id,
        "invoice_id": new_invoice.id,
        "payment_details": {
            "amount_crypto": new_invoice.expected_crypto_amount,
            "asset": asset.asset_symbol,
            "network": network.code,
            "deposit_address": new_wallet.address
        }
    }

@router.get("/me")
def get_my_subscriptions(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Get all subscriptions for user
    subs = db.query(models.Subscription).filter(models.Subscription.customer_id == current_user.id).order_by(models.Subscription.created_at.desc()).all()
    
    result = []
    for sub in subs:
        plan = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.id == sub.plan_id).first()
        
        # Get invoices linked to this subscription
        invoices = db.query(models.Invoice).filter(
            models.Invoice.reference_type == 'SUBSCRIPTION',
            models.Invoice.reference_id == sub.id
        ).order_by(models.Invoice.created_at.desc()).all()
        
        inv_list = []
        for inv in invoices:
            wallet = db.query(models.WalletAddress).filter(models.WalletAddress.invoice_id == inv.id).first()
            inv_list.append({
                "id": inv.id,
                "amount_usd": inv.amount_usd,
                "expected_crypto_amount": inv.expected_crypto_amount,
                "asset": inv.selected_asset_symbol,
                "status": inv.status,
                "created_at": inv.created_at,
                "deposit_address": wallet.address if wallet else None
            })
            
        result.append({
            "id": sub.id,
            "plan_name": plan.name if plan else "Unknown",
            "status": sub.status,
            "current_period_start": sub.current_period_start,
            "current_period_end": sub.current_period_end,
            "invoices": inv_list
        })
        
    return result

@router.post("/mock-pay/{invoice_id}")
def mock_pay_invoice(invoice_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    from services.payment_orchestrator import PaymentOrchestrator
    
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    # Mark invoice as PAID
    invoice.status = 'PAID'
    db.commit()
    
    # Process the paid invoice
    orchestrator = PaymentOrchestrator(db)
    orchestrator.process_paid_invoice(invoice)
    
    return {"message": "Invoice marked as PAID and processed successfully"}
