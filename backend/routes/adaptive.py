from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from models.interview_session import InterviewSession, SessionQuestion
from services.skill_analyzer import analyze
from services.question_service import generate_personalized_question

router = APIRouter()


class QuestionEntry(BaseModel):
    question: str
    difficulty: str
    score: int
    expected_topics: List[str]
    missing_topics: List[str]
    question_category: Optional[str] = ""


class NextQuestionRequest(BaseModel):
    role: str
    topic: str
    difficulty: str = "Easy"
    questions: List[QuestionEntry]
    used_categories: Optional[List[str]] = None


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

        # Use the original difficulty selected by the user (not adaptive)
        user_difficulty = body.difficulty
        session.current_difficulty = user_difficulty

        used_cats = body.used_categories or []
        used_cats_from_questions = [
            q.question_category for q in body.questions if q.question_category
        ]
        all_used = list(set(used_cats + used_cats_from_questions))

        data = generate_personalized_question(
            role=session.role,
            topic=session.topic,
            difficulty=user_difficulty,
            weak_topics=session.weak_topics or [session.topic],
            average_score=session.average_score,
            question_history=session.question_history,
            used_categories=all_used,
        )

        return {
            "success": True,
            "data": {
                "question": data,
                "current_difficulty": user_difficulty,
                "question_number": session.question_number,
                "average_score": session.average_score,
                "weak_topics": session.weak_topics,
                "strong_skills": session.strong_topics,
            },
        }
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Unable to generate next question."},
        )