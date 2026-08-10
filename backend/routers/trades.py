from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth
from logger import log_action
from database import get_db

router = APIRouter(
    prefix="/trades",
    tags=["trades"]
)

@router.get("/", response_model=List[schemas.TradeResponse])
def get_trades(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Trade).filter(models.Trade.user_id == current_user.id).order_by(models.Trade.created_at.desc()).all()

@router.post("/", response_model=schemas.TradeResponse)
def create_trade(
    trade: schemas.TradeCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_trade = models.Trade(
        user_id=current_user.id,
        symbol=trade.symbol,
        strategy_id=trade.strategy_id,
        exchange_id=trade.exchange_id,
        order_type=trade.order_type,
        entry_price=trade.entry_price,
        amount_usd=trade.amount_usd,
        quantity=trade.quantity,
        calculated_fee=trade.calculated_fee,
        status=trade.status
    )
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    
    # Create associated targets
    for target_dict in trade.targets:
        db_target = models.TradeTarget(
            trade_id=db_trade.id,
            type=target_dict.get('type'),
            stage=target_dict.get('stage'),
            target_price=target_dict.get('targetPrice'),
            quantity_to_sell=target_dict.get('quantityToSell'),
            status=target_dict.get('status', 'PENDING')
        )
        db.add(db_target)
        
    db.commit()
    db.refresh(db_trade)
    
    # Detailed log
    targets_info = f"Targets: {len(db_trade.targets)}"
    log_details = f"Symbol: {db_trade.symbol} | Amount: ${db_trade.amount_usd:.2f} | Qty: {db_trade.quantity:.4f} | Entry: ${db_trade.entry_price:.2f} | {targets_info}"
    log_action(db, current_user.id, "CREATE_TRADE", log_details)
    
    return db_trade

@router.put("/{trade_id}", response_model=schemas.TradeResponse)
def update_trade(
    trade_id: int, 
    trade: schemas.TradeUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    if not db_trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    db_trade.symbol = trade.symbol
    db_trade.strategy_id = trade.strategy_id
    db_trade.exchange_id = trade.exchange_id
    db_trade.order_type = trade.order_type
    db_trade.entry_price = trade.entry_price
    db_trade.amount_usd = trade.amount_usd
    db_trade.quantity = trade.quantity
    db_trade.calculated_fee = trade.calculated_fee
    db_trade.status = trade.status
    
    if trade.targets is not None:
        # Clear existing targets
        db.query(models.TradeTarget).filter(models.TradeTarget.trade_id == trade_id).delete()
        # Recreate targets
        for t_dict in trade.targets:
            db.add(models.TradeTarget(
                trade_id=trade_id,
                type=t_dict.get('type'),
                stage=t_dict.get('stage'),
                target_price=t_dict.get('target_price') or t_dict.get('targetPrice') or 0.0,
                quantity_to_sell=t_dict.get('quantity_to_sell') or t_dict.get('quantityToSell') or 0.0,
                status=t_dict.get('status', 'PENDING')
            ))
            
    db.commit()
    db.refresh(db_trade)
    
    # Detailed log
    targets_info = f"Targets: {len(db_trade.targets)}" if db_trade.targets else "No targets changed"
    log_details = f"Symbol: {db_trade.symbol} | Status: {db_trade.status} | Amount: ${db_trade.amount_usd:.2f} | Qty: {db_trade.quantity:.4f} | Entry: ${db_trade.entry_price:.2f} | {targets_info}"
    log_action(db, current_user.id, "UPDATE_TRADE", log_details)
    
    return db_trade

@router.delete("/{trade_id}")
def delete_trade(
    trade_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    if not db_trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    symbol = db_trade.symbol
    amount = db_trade.amount_usd
    db.delete(db_trade)
    db.commit()
    
    log_details = f"Trade ID: #{trade_id} | Symbol: {symbol} | Amount: ${amount:.2f}"
    log_action(db, current_user.id, "DELETE_TRADE", log_details)
    
    return {"message": "Trade deleted successfully"}
