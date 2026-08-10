from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth
from database import get_db
from logger import log_action

router = APIRouter(
    prefix="/wallet",
    tags=["wallet"]
)

@router.get("/transactions", response_model=List[schemas.WalletTransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    transactions = db.query(models.WalletTransaction).filter(
        models.WalletTransaction.user_id == current_user.id
    ).order_by(models.WalletTransaction.timestamp.desc()).all()
    
    # Attach exchange names for UI convenience
    for tx in transactions:
        tx.exchange_name = tx.exchange.name if tx.exchange else None
        tx.to_exchange_name = tx.to_exchange.name if tx.to_exchange else None
        
    return transactions

def calculate_live_balance(db: Session, ex: models.Exchange, user_id: int) -> float:
    # 1. Total purchases and sales from trades
    trades = db.query(models.Trade).filter(
        models.Trade.exchange_id == ex.id,
        models.Trade.user_id == user_id
    ).all()
    
    total_purchases = 0.0
    total_sales = 0.0
    
    for t in trades:
        total_purchases += (t.quantity * t.entry_price) + t.calculated_fee
        for tgt in t.targets:
            if tgt.status == 'EXECUTED':
                total_sales += (tgt.quantity_to_sell * tgt.target_price) - tgt.executed_fee

    # 2. Deposits and Withdrawals
    deposits = sum(tx.amount for tx in ex.wallet_transactions if tx.type == "DEPOSIT")
    withdrawals = sum(tx.amount for tx in ex.wallet_transactions if tx.type == "WITHDRAW")

    # 3. Transfers
    transfers_out = sum(tx.amount + tx.fee for tx in ex.wallet_transactions if tx.type == "TRANSFER")
    
    transfers_in_records = db.query(models.WalletTransaction).filter(
        models.WalletTransaction.to_exchange_id == ex.id,
        models.WalletTransaction.type == "TRANSFER"
    ).all()
    transfers_in = sum(tx.amount for tx in transfers_in_records)
    
    initial = ex.initial_cash_balance or 0.0
    
    return initial + deposits - withdrawals + transfers_in - transfers_out - total_purchases + total_sales

@router.post("/transactions", response_model=schemas.WalletTransactionResponse)
def create_transaction(
    transaction: schemas.WalletTransactionCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify primary exchange belongs to user
    primary_ex = db.query(models.Exchange).filter(
        models.Exchange.id == transaction.exchange_id,
        models.Exchange.user_id == current_user.id
    ).first()
    
    if not primary_ex:
        raise HTTPException(status_code=404, detail="Primary exchange not found or unauthorized")
        
    if transaction.type in ("WITHDRAW", "TRANSFER"):
        live_balance = calculate_live_balance(db, primary_ex, current_user.id)
        if (transaction.amount + transaction.fee) > live_balance:
            raise HTTPException(status_code=400, detail="Insufficient available balance")

    if transaction.type == "TRANSFER":
        if not transaction.to_exchange_id:
            raise HTTPException(status_code=400, detail="Transfer requires a destination exchange")
        if transaction.to_exchange_id == transaction.exchange_id:
            raise HTTPException(status_code=400, detail="Cannot transfer to the same exchange")
            
        dest_ex = db.query(models.Exchange).filter(
            models.Exchange.id == transaction.to_exchange_id,
            models.Exchange.user_id == current_user.id
        ).first()
        
        if not dest_ex:
            raise HTTPException(status_code=404, detail="Destination exchange not found or unauthorized")
            
    db_tx = models.WalletTransaction(**transaction.model_dump(), user_id=current_user.id)
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    
    # Detailed log
    if db_tx.type == "TRANSFER":
        dest_name = dest_ex.name
        log_msg = f"TRANSFERRED ${db_tx.amount:.2f} (Fee: ${db_tx.fee:.2f}) from {primary_ex.name} to {dest_name}"
    else:
        log_msg = f"{db_tx.type} ${db_tx.amount:.2f} on {primary_ex.name}"
        
    log_action(db, current_user.id, f"WALLET_{db_tx.type}", log_msg)
    
    db_tx.exchange_name = primary_ex.name
    db_tx.to_exchange_name = db_tx.to_exchange.name if db_tx.to_exchange else None
    
    return db_tx

@router.delete("/transactions/{tx_id}")
def delete_transaction(
    tx_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_tx = db.query(models.WalletTransaction).filter(
        models.WalletTransaction.id == tx_id,
        models.WalletTransaction.user_id == current_user.id
    ).first()
    
    if not db_tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx_type = db_tx.type
    tx_amount = db_tx.amount
    ex_name = db_tx.exchange.name if db_tx.exchange else "Unknown"
        
    db.delete(db_tx)
    db.commit()
    
    log_action(db, current_user.id, "DELETE_WALLET_TX", f"Deleted {tx_type} of ${tx_amount:.2f} on {ex_name}")
    
    return {"message": "Transaction deleted successfully"}
