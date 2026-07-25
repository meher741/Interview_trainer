from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from models.interview_session import InterviewSession, SessionQuestion
from services.skill_analyzer import analyze
from services.adaptive_engine import next_difficulty
from services.question_service import generate_personalized_question

router = APIRouter()


class QuestionEntry(BaseModel):
    question: str
    difficulty: str
    score: int
    expected_topics: List[str]
    missing_topics: List[str]


class NextQuestionRequest(BaseModel):
    role: str
    topic: str
    questions: List[QuestionEntry]


@router.post("/generate-next-question")
def generate_next_question(body: NextQuestionRequest):
    try:
        session = InterviewSession(
            role=body.role,
            topic=body.topic,
            questions=[SessionQuestion(**q.model_dump()) for q in body.questions],
        )
        session.total_score = sum(q.score for q in session.questions)
        session.question_number = len(session.questions) + 1

        skills = analyze(session.questions)
        session.weak_topics = skills["weak_topics"]
        session.strong_topics = skills["strong_topics"]

        diff = next_difficulty(session.average_score, session.weak_topics)
        session.current_difficulty = diff

        data = generate_personalized_question(
            role=session.role,
            topic=session.topic,
            difficulty=diff,
            weak_topics=session.weak_topics or [session.topic],
            average_score=session.average_score,
            question_history=session.question_history,
        )

        return {
            "success": True,
            "data": {
                "question": data,
                "current_difficulty": diff,
                "question_number": session.question_number,
                "average_score": session.average_score,
                "weak_topics": session.weak_topics,
                "strong_topics": session.strong_topics,
            },
        }
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Unable to generate next question."},
        )
