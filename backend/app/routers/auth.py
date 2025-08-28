from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from ..schemas import UserCreate, UserRead, UserLogin, TokenResponse
from ..core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=payload.email, name=payload.name, password_hash=get_password_hash(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead(id=user.id, email=user.email, name=user.name)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")
    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user=UserRead(id=user.id, email=user.email, name=user.name),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(body: dict):
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing refresh_token")
    payload = decode_token(token, expected_type="refresh")
    user_id = int(payload.get("sub"))
    new_access = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)
    return TokenResponse(access_token=new_access, refresh_token=new_refresh)


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return UserRead(id=user.id, email=user.email, name=user.name)


@router.post("/logout")
def logout():
    # Stateless JWT cannot be invalidated server-side without a token store/denylist.
    # Keep endpoint for symmetry; client should drop tokens.
    return {"ok": True}

