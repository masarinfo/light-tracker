from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas, auth

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

def verify_superadmin(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_superadmin)
):
    users = db.query(models.User).all()
    result = []
    for u in users:
        # Check active subscription
        sub = db.query(models.Subscription).filter(
            models.Subscription.customer_id == u.id,
            models.Subscription.status == 'ACTIVE'
        ).first()
        
        plan_name = "None"
        if sub:
            plan = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.id == sub.plan_id).first()
            if plan:
                plan_name = plan.name

        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "primary_role": u.primary_role,
            "is_superadmin": u.is_superadmin,
            "active_plan": plan_name,
            "created_at": u.created_at
        })
    return result

@router.get("/logs", response_model=List[schemas.ActionLogResponse])
def get_all_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_superadmin)
):
    return db.query(models.ActionLog).order_by(models.ActionLog.created_at.desc()).limit(limit).all()

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_superadmin)
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.put("/users/{user_id}/promote")
def promote_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_superadmin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_superadmin = not user.is_superadmin
    db.commit()
    return {"message": f"User role updated. Superadmin: {user.is_superadmin}"}

@router.get("/coupons")
def get_coupons(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_superadmin)
):
    return db.query(models.CouponCode).all()

@router.post("/coupons")
def create_coupon(
    data: schemas.CouponCreate = Depends(),
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_superadmin)
):
    new_coupon = models.CouponCode(
        code=data.code.upper(),
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        created_by_affiliate_id=admin.id
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

@router.delete("/coupons/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_superadmin)
):
    coupon = db.query(models.CouponCode).filter(models.CouponCode.id == coupon_id).first()
    if coupon:
        db.delete(coupon)
        db.commit()
    return {"message": "Coupon deleted"}
