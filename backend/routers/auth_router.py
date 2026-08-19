from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import database
import models
import schemas
import auth
from logger import log_action

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username, 
        password_hash=hashed_password,
        email=user.email,
        phone=user.phone,
        primary_role="CUSTOMER"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # If a referral code was passed, we'll store it (Affiliate logic goes here later)
    # TODO: link referral code
    
    log_action(db, db_user.id, "REGISTER", f"User registered: {user.username}")
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.status != "ACTIVE":
        raise HTTPException(status_code=403, detail="Account is not active")
        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.primary_role}, 
        expires_delta=access_token_expires
    )
    
    log_action(db, user.id, "LOGIN", f"User logged in: {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_profile(
    profile_data: schemas.UserUpdate, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    if profile_data.new_password:
        if not profile_data.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password")
        if not auth.verify_password(profile_data.current_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect current password")
        current_user.password_hash = auth.get_password_hash(profile_data.new_password)
    
    if profile_data.email is not None:
        current_user.email = profile_data.email
        
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
        
    db.commit()
    db.refresh(current_user)
    log_action(db, current_user.id, "UPDATE_PROFILE", "User updated profile")
    return current_user
