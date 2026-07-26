from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth_utils import decode_token
from database import get_db
from models.session import Session
from models.user import User


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    session_id = payload.get("sid")
    if not email or not session_id:
        raise HTTPException(status_code=401, detail="Invalid session token")

    session_result = await db.execute(
        select(Session).where(Session.id == session_id, Session.user_email == email)
    )
    session = session_result.scalar_one_or_none()
    if not session or not session.is_valid():
        raise HTTPException(status_code=401, detail="Session expired or revoked")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
