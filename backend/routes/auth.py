from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.session import Session
from auth_utils import create_access_token, create_refresh_token, decode_token
from dependencies import get_current_user
import os

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    email: str
    created_at: str

class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    message: str

@router.post("/signup", response_model=AuthResponse)
async def signup(data: SignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")
    
    user = User(email=data.email)
    user.set_password(data.password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    session = Session.create(user.email)
    db.add(session)
    await db.commit()
    await db.refresh(session)

    access_token = create_access_token(data={"sub": user.email, "sid": session.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "sid": session.id})
    
    response.set_cookie(
        "refresh_token", refresh_token,
        httponly=True, secure=COOKIE_SECURE, samesite="lax", max_age=604800
    )
    
    return {
        "user": {"email": user.email, "created_at": user.created_at.isoformat()},
        "access_token": access_token,
        "message": "Account created successfully"
    }

@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.verify_password(data.password):
        raise HTTPException(401, "Invalid email or password")
    
    session = Session.create(user.email)
    db.add(session)
    await db.commit()
    await db.refresh(session)

    access_token = create_access_token(data={"sub": user.email, "sid": session.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "sid": session.id})
    
    response.set_cookie(
        "refresh_token", refresh_token,
        httponly=True, secure=COOKIE_SECURE, samesite="lax", max_age=604800
    )
    
    return {
        "user": {"email": user.email, "created_at": user.created_at.isoformat()},
        "access_token": access_token,
        "message": "Login successful"
    }

@router.post("/logout")
async def logout(response: Response, request: Request, db: AsyncSession = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload:
            session_id = payload.get("sid")
            query = delete(Session).where(Session.user_email == payload.get("sub"))
            if session_id:
                query = query.where(Session.id == session_id)
            await db.execute(query)
            await db.commit()
    
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.post("/refresh")
async def refresh_token(response: Response, request: Request, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(401, "No refresh token")
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")
    
    email = payload.get("sub")
    session_id = payload.get("sid")
    if not email or not session_id:
        raise HTTPException(401, "Invalid refresh session")

    session_result = await db.execute(
        select(Session).where(Session.id == session_id, Session.user_email == email)
    )
    session = session_result.scalar_one_or_none()
    if not session or not session.is_valid():
        raise HTTPException(401, "Session expired or revoked")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(401, "User not found")
    
    new_access_token = create_access_token(data={"sub": user.email, "sid": session.id})
    new_refresh_token = create_refresh_token(data={"sub": user.email, "sid": session.id})
    
    response.set_cookie(
        "refresh_token", new_refresh_token,
        httponly=True, secure=COOKIE_SECURE, samesite="lax", max_age=604800
    )
    
    return {
        "access_token": new_access_token,
        "message": "Token refreshed"
    }

@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return {"email": user.email, "created_at": user.created_at.isoformat()}
