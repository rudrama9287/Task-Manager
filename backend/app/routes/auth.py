from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import User
from ..schemas.user_schema import UserCreate, UserLogin, Token, UserResponse
from ..middleware.auth_middleware import get_current_admin
from typing import List
from ..utils.password_handler import get_password_hash, verify_password
from ..utils.jwt_handler import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if user.role not in ["admin", "member"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be admin or member.")
    
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role, "id": db_user.id})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": db_user.role,
        "name": db_user.name,
        "email": db_user.email
    }

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    return db.query(User).all()
