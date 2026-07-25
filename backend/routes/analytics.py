import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.interview_models import InterviewSession as DBSession, QuestionAttempt
from auth_utils import decode_token
from services.analytics_service import (
    get_user_stats,
    get_topic_performance,
    get_weak_strong_topics,
    get_recent_sessions,
    save_attempt,
    finish_session,
    create_session,
    get_improvement_trend,
    get_learning_streak,
)
from services.progress_service import get_progress_report
from services.recommendation_service import generate_recommendations

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(401, "Invalid token")
    email = payload.get("sub")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")
    return user


class StartSessionRequest(BaseModel):
    role: str
    topic: str


class SaveAttemptRequest(BaseModel):
    session_id: Optional[str] = None
    role: str
    topic: str
    difficulty: str
    question_text: str
    answer_text: str
    score: int
    strengths: List[str] = []
    weaknesses: List[str] = []
    missing_topics: List[str] = []
    expected_topics: List[str] = []
    question_category: str = ""
    confidence: str = ""
    next_difficulty: str = ""


class FinishSessionRequest(BaseModel):
    session_id: str


@router.post("/interview/start")
async def start_interview(body: StartSessionRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        result = await create_session(db, user.email, body.role, body.topic)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error("Error starting interview: %s", str(e), exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


@router.post("/interview/save")
async def save_attempt_route(body: SaveAttemptRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        result = await save_attempt(
            db=db,
            user_email=user.email,
            session_id=body.session_id,
            role=body.role,
            topic=body.topic,
            difficulty=body.difficulty,
            question_text=body.question_text,
            answer_text=body.answer_text,
            score=body.score,
            strengths=body.strengths,
            weaknesses=body.weaknesses,
            missing_topics=body.missing_topics,
            expected_topics=body.expected_topics,
            question_category=body.question_category,
            confidence=body.confidence,
            next_difficulty=body.next_difficulty,
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error("Error saving attempt: %s", str(e), exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


@router.post("/interview/finish")
async def finish_interview_route(body: FinishSessionRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        session = await finish_session(db, body.session_id)
        if not session:
            return JSONResponse(status_code=404, content={"success": False, "message": "Session not found"})
        return {
            "success": True,
            "data": {
                "session_id": session.id,
                "average_score": session.average_score,
                "question_count": session.question_count,
                "total_score": session.total_score,
            }
        }
    except Exception as e:
        logger.error("Error finishing interview: %s", str(e), exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


@router.get("/analytics/dashboard")
async def get_dashboard_analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        stats = await get_user_stats(db, user.email)
        topic_perf = await get_topic_performance(db, user.email)
        weak_strong = await get_weak_strong_topics(db, user.email)
        recent = await get_recent_sessions(db, user.email, limit=5)
        trend = await get_improvement_trend(db, user.email)
        streak = await get_learning_streak(db, user.email)
        progress = await get_progress_report(db, user.email)

        recent_sessions = []
        for s in recent:
            recent_sessions.append({
                "id": s.id,
                "role": s.role,
                "topic": s.topic,
                "average_score": s.average_score,
                "question_count": s.question_count,
                "completed": s.completed,
                "created_at": s.created_at.isoformat() if s.created_at else "",
            })

        return {
            "success": True,
            "data": {
                "stats": stats,
                "topic_performance": topic_perf,
                "weak_topics": weak_strong["weak_topics"],
                "strong_topics": weak_strong["strong_topics"],
                "recent_sessions": recent_sessions,
                "improvement_trend": trend,
                "learning_streak": streak,
                "progress": progress,
            }
        }
    except Exception as e:
        logger.error("Error fetching dashboard analytics: %s", str(e), exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


@router.get("/analytics/history")
async def get_interview_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        sessions = await get_recent_sessions(db, user.email, limit=50)
        history = []
        for s in sessions:
            attempts_result = await db.execute(
                select(QuestionAttempt).where(QuestionAttempt.session_id == s.id).order_by(QuestionAttempt.created_at.asc())
            )
            attempts = attempts_result.scalars().all()
            history.append({
                "id": s.id,
                "role": s.role,
                "topic": s.topic,
                "average_score": s.average_score,
                "question_count": s.question_count,
                "completed": s.completed,
                "created_at": s.created_at.isoformat() if s.created_at else "",
                "attempts": [
                    {
                        "id": a.id,
                        "difficulty": a.difficulty,
                        "question_text": a.question_text,
                        "score": a.score,
                        "expected_topics": a.expected_topics,
                        "missing_topics": a.missing_topics,
                        "question_category": a.question_category,
                    }
                    for a in attempts
                ],
            })
        return {"success": True, "data": {"sessions": history}}
    except Exception as e:
        logger.error("Error fetching history: %s", str(e), exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


@router.get("/analytics/recommendations")
async def get_recommendations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        stats = await get_user_stats(db, user.email)
        topic_perf = await get_topic_performance(db, user.email)
        weak_strong = await get_weak_strong_topics(db, user.email)
        progress = await get_progress_report(db, user.email)
        trend = await get_improvement_trend(db, user.email)

        trend_summary = "No trend data available"
        if trend:
            scores = [t["average_score"] for t in trend if t["average_score"] > 0]
            if scores:
                if len(scores) >= 2:
                    direction = "improving" if scores[-1] > scores[0] else "needs focus"
                else:
                    direction = "just starting"
                trend_summary = f"{direction} (latest: {scores[-1] if scores else 0}/10)"

        recs = await generate_recommendations(
            total_questions=stats["total_questions"],
            average_score=stats["average_score"],
            consistency_score=progress["consistency_score"],
            sessions_count=stats["sessions_count"],
            topic_performance=topic_perf,
            weak_areas=weak_strong["weak_topics"],
            strong_areas=weak_strong["strong_topics"],
            improvement_trend=trend_summary,
        )

        return {"success": True, "data": recs}
    except Exception as e:
        logger.error("Error generating recommendations: %s", str(e), exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})
