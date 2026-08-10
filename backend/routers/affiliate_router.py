from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

import database
import models
import auth

router = APIRouter(
    prefix="/affiliate",
    tags=["affiliate"]
)

@router.get("/profile")
def get_affiliate_profile(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Create profile if not exists
    profile = db.query(models.AffiliateProfile).filter(models.AffiliateProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.AffiliateProfile(
            user_id=current_user.id,
            referral_code=str(uuid.uuid4())[:8].upper()
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return profile

@router.get("/commissions")
def get_commissions(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    commissions = db.query(models.AffiliateCommission).filter(models.AffiliateCommission.affiliate_user_id == current_user.id).all()
    
    total_cleared = sum(c.commission_amount_usd for c in commissions if c.status == 'CLEARED')
    total_pending = sum(c.commission_amount_usd for c in commissions if c.status == 'PENDING_CLEARANCE')
    
    return {
        "total_cleared": total_cleared,
        "total_pending": total_pending,
        "history": commissions
    }

@router.post("/withdraw")
def request_withdrawal(address: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # This is a placeholder for actual withdrawal request logic. 
    # Usually you'd create a PayoutRequest record.
    return {"message": "Withdrawal requested successfully", "address": address}
