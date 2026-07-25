from collections import defaultdict
from models.interview_session import SessionQuestion
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.interview_models import QuestionAttempt, InterviewSession as DBSession
from typing import Optional


def calculate(questions: list[SessionQuestion]) -> dict:
    if not questions:
        return {
            "overall_score": 0,
            "average_score": 0,
            "questions_answered": 0,
            "highest_score": 0,
            "lowest_score": 0,
            "easy_count": 0,
            "medium_count": 0,
            "hard_count": 0,
            "topic_performance": [],
        }

    scores = [q.score for q in questions]
    topic_map = defaultdict(list)

    for q in questions:
        for topic in q.expected_topics:
            topic_map[topic].append(q.score)

    topic_performance = [
        {"topic": topic, "average": round(sum(scores_list) / len(scores_list), 1)}
        for topic, scores_list in sorted(topic_map.items(), key=lambda x: -sum(x[1]) / len(x[1]))
    ]

    return {
        "overall_score": round(sum(scores) / len(scores), 1),
        "average_score": round(sum(scores) / len(scores), 1),
        "questions_answered": len(questions),
        "highest_score": max(scores),
        "lowest_score": min(scores),
        "easy_count": sum(1 for q in questions if q.difficulty == "Easy"),
        "medium_count": sum(1 for q in questions if q.difficulty == "Medium"),
        "hard_count": sum(1 for q in questions if q.difficulty == "Hard"),
        "topic_performance": topic_performance,
    }


async def get_user_stats(db: AsyncSession, user_email: str) -> dict:
    result = await db.execute(
        select(func.count(QuestionAttempt.id), func.sum(QuestionAttempt.score))
        .where(QuestionAttempt.user_email == user_email)
    )
    count, total_score = result.one()
    count = count or 0
    total_score = total_score or 0

    result = await db.execute(
        select(func.count(QuestionAttempt.id.distinct()))
        .where(QuestionAttempt.user_email == user_email)
    )
    sessions_count = result.scalar() or 0

    return {
        "total_questions": count,
        "total_score": total_score,
        "average_score": round(total_score / count, 1) if count > 0 else 0,
        "sessions_count": sessions_count,
    }


async def get_topic_performance(db: AsyncSession, user_email: str) -> list:
    attempts = await db.execute(
        select(QuestionAttempt).where(QuestionAttempt.user_email == user_email)
    )
    rows = attempts.scalars().all()

    topic_map = defaultdict(list)
    for a in rows:
        for topic in (a.expected_topics or []):
            topic_map[topic].append(a.score)

    return [
        {"topic": topic, "average": round(sum(scores) / len(scores), 1)}
        for topic, scores in sorted(topic_map.items(), key=lambda x: -sum(x[1]) / len(x[1]))
    ]


async def get_weak_strong_topics(db: AsyncSession, user_email: str, strong_threshold: float = 7.0, weak_threshold: float = 5.0) -> dict:
    topic_data = await get_topic_performance(db, user_email)
    strong = [t["topic"] for t in topic_data if t["average"] >= strong_threshold]
    weak = [t["topic"] for t in topic_data if t["average"] < weak_threshold]
    return {"strong_topics": strong, "weak_topics": weak}


async def get_recent_sessions(db: AsyncSession, user_email: str, limit: int = 10):
    result = await db.execute(
        select(DBSession)
        .where(DBSession.user_email == user_email)
        .order_by(DBSession.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def save_attempt(
    db: AsyncSession,
    user_email: str,
    role: str,
    topic: str,
    difficulty: str,
    question_text: str,
    answer_text: str,
    score: int,
    strengths: list,
    weaknesses: list,
    missing_topics: list,
    expected_topics: list,
    question_category: str = "",
    confidence: str = "",
    next_difficulty: str = "",
    session_id: Optional[str] = None,
) -> dict:
    attempt = QuestionAttempt(
        user_email=user_email,
        session_id=session_id,
        role=role,
        topic=topic,
        difficulty=difficulty,
        question_text=question_text,
        answer_text=answer_text,
        score=score,
        strengths=strengths,
        weaknesses=weaknesses,
        missing_topics=missing_topics,
        expected_topics=expected_topics,
        question_category=question_category,
        confidence=confidence,
        next_difficulty=next_difficulty,
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return {"attempt_id": attempt.id, "session_id": session_id}


async def finish_session(db: AsyncSession, session_id: str):
    result = await db.execute(
        select(DBSession).where(DBSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        return None

    attempts_result = await db.execute(
        select(QuestionAttempt).where(QuestionAttempt.session_id == session_id)
    )
    attempts = attempts_result.scalars().all()

    if attempts:
        scores = [a.score for a in attempts]
        session.total_score = sum(scores)
        session.average_score = round(sum(scores) / len(scores), 1)
        session.question_count = len(attempts)
    session.completed = 1
    await db.commit()
    await db.refresh(session)
    return session


async def create_session(db: AsyncSession, user_email: str, role: str, topic: str) -> dict:
    session = DBSession(
        user_email=user_email,
        role=role,
        topic=topic,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"session_id": session.id}


async def get_improvement_trend(db: AsyncSession, user_email: str) -> list:
    sessions = await get_recent_sessions(db, user_email, limit=20)
    trend = []
    for s in reversed(sessions):
        if s.question_count > 0:
            trend.append({
                "session_id": s.id,
                "date": s.created_at.isoformat() if s.created_at else "",
                "average_score": s.average_score,
                "question_count": s.question_count,
                "role": s.role,
                "topic": s.topic,
            })
    return trend


async def get_learning_streak(db: AsyncSession, user_email: str) -> dict:
    result = await db.execute(
        select(func.date(QuestionAttempt.created_at).distinct())
        .where(QuestionAttempt.user_email == user_email)
        .order_by(func.date(QuestionAttempt.created_at).desc())
    )
    dates = [row[0] for row in result.fetchall()]
    if not dates:
        return {"current_streak": 0, "longest_streak": 0, "total_practice_days": 0}

    current = 0
    longest = 0
    streak = 0
    from datetime import date, timedelta
    today = date.today()

    for i, d in enumerate(dates):
        expected = today - timedelta(days=i)
        if d == expected:
            current += 1
        else:
            break
    streak = 0
    prev = None
    for d in dates:
        if prev is None:
            streak = 1
        else:
            diff = (prev - d).days
            if diff == 1:
                streak += 1
            else:
                longest = max(longest, streak)
                streak = 1
        prev = d
    longest = max(longest, streak)

    return {
        "current_streak": current,
        "longest_streak": longest,
        "total_practice_days": len(dates),
    }
