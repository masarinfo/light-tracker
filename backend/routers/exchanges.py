from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/exchanges",
    tags=["exchanges"]
)

def _compute_exchange_aggregates(db: Session, ex: models.Exchange) -> schemas.ExchangeResponse:
    # Compute transfer out
    transfers_out = sum(t.amount + t.fee for t in ex.wallet_transactions if t.type == "TRANSFER")
    
    # Compute transfer in (where this exchange is the destination)
    transfers_in_records = db.query(models.WalletTransaction).filter(
        models.WalletTransaction.to_exchange_id == ex.id,
        models.WalletTransaction.type == "TRANSFER"
    ).all()
    transfers_in = sum(t.amount for t in transfers_in_records)
    
    resp = schemas.ExchangeResponse.model_validate(ex)
    resp.total_transfers_out = transfers_out
    resp.total_transfers_in = transfers_in
    return resp

@router.get("/", response_model=List[schemas.ExchangeResponse])
def get_exchanges(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_subscriber)
):
    exchanges = db.query(models.Exchange).filter(models.Exchange.user_id == current_user.id).all()
    return [_compute_exchange_aggregates(db, ex) for ex in exchanges]

@router.post("/", response_model=schemas.ExchangeResponse)
def create_exchange(
    exchange: schemas.ExchangeCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_subscriber)
):
    db_exchange = models.Exchange(**exchange.model_dump(), user_id=current_user.id)
    db.add(db_exchange)
    db.commit()
    db.refresh(db_exchange)
    return _compute_exchange_aggregates(db, db_exchange)

@router.put("/{exchange_id}", response_model=schemas.ExchangeResponse)
def update_exchange(
    exchange_id: int, 
    exchange: schemas.ExchangeUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_subscriber)
):
    db_exchange = db.query(models.Exchange).filter(
        models.Exchange.id == exchange_id, 
        models.Exchange.user_id == current_user.id
    ).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Exchange not found")
    
    for key, value in exchange.model_dump().items():
        setattr(db_exchange, key, value)
        
    db.commit()
    db.refresh(db_exchange)
    return _compute_exchange_aggregates(db, db_exchange)

@router.delete("/{exchange_id}")
def delete_exchange(
    exchange_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_subscriber)
):
    db_exchange = db.query(models.Exchange).filter(
        models.Exchange.id == exchange_id,
        models.Exchange.user_id == current_user.id
    ).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Exchange not found")
    
    db.delete(db_exchange)
    db.commit()
    return {"ok": True}
