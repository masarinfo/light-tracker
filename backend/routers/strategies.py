from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth
from logger import log_action
from database import get_db

router = APIRouter(
    prefix="/strategies",
    tags=["strategies"]
)

@router.get("/", response_model=List[schemas.StrategyResponse])
def get_strategies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Strategy).filter(models.Strategy.user_id == current_user.id).all()

@router.post("/", response_model=schemas.StrategyResponse)
def create_strategy(
    strategy: schemas.StrategyCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_strategy = models.Strategy(
        user_id=current_user.id,
        name=strategy.name,
        category=strategy.category,
        default_exchange_id=strategy.default_exchange_id,
        default_order_type=strategy.default_order_type,
        tp_rules=[r.model_dump() for r in strategy.tp_rules],
        sl_rules=[r.model_dump() for r in strategy.sl_rules]
    )
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    
    log_details = f"Strategy: {db_strategy.name} | Category: {db_strategy.category} | TP: {len(db_strategy.tp_rules)} | SL: {len(db_strategy.sl_rules)}"
    log_action(db, current_user.id, "CREATE_STRATEGY", log_details)
    
    return db_strategy

@router.put("/{strategy_id}", response_model=schemas.StrategyResponse)
def update_strategy(
    strategy_id: int, 
    strategy: schemas.StrategyUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_strategy = db.query(models.Strategy).filter(
        models.Strategy.id == strategy_id,
        models.Strategy.user_id == current_user.id
    ).first()
    if not db_strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    db_strategy.name = strategy.name
    db_strategy.category = strategy.category
    db_strategy.default_exchange_id = strategy.default_exchange_id
    db_strategy.default_order_type = strategy.default_order_type
    db_strategy.tp_rules = [r.model_dump() for r in strategy.tp_rules]
    db_strategy.sl_rules = [r.model_dump() for r in strategy.sl_rules]
        
    db.commit()
    db.refresh(db_strategy)
    
    log_details = f"Strategy ID #{strategy_id}: {db_strategy.name} | Category: {db_strategy.category} | TP: {len(db_strategy.tp_rules)} | SL: {len(db_strategy.sl_rules)}"
    log_action(db, current_user.id, "UPDATE_STRATEGY", log_details)
    
    return db_strategy

@router.delete("/{strategy_id}")
def delete_strategy(
    strategy_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_strategy = db.query(models.Strategy).filter(
        models.Strategy.id == strategy_id,
        models.Strategy.user_id == current_user.id
    ).first()
    if not db_strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    name = db_strategy.name
    db.delete(db_strategy)
    db.commit()
    
    log_details = f"Strategy ID: #{strategy_id} | Name: {name}"
    log_action(db, current_user.id, "DELETE_STRATEGY", log_details)
    
    return {"message": "Strategy deleted successfully"}
