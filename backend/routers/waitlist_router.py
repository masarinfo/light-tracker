from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import WaitlistCreate, WaitlistResponse
from routers.auth_router import get_current_user

router = APIRouter(prefix="/api/waitlist", tags=["Waitlist"])

@router.post("", response_model=WaitlistResponse)
def join_waitlist(entry: WaitlistCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(models.WaitlistEntry).filter(models.WaitlistEntry.email == entry.email).first()
    if existing:
        # Idempotent response or error
        return existing
    
    new_entry = models.WaitlistEntry(email=entry.email)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.get("/admin", response_model=list[WaitlistResponse])
def get_waitlist_admin(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Only superadmin can view
    if current_user.primary_role != 'SUPER_ADMIN' and not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(models.WaitlistEntry).order_by(models.WaitlistEntry.created_at.desc()).all()
