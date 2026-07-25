from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from models.interview_session import SessionQuestion
from services.analytics_service import calculate
from services.report_service import generate_report
from services.resource_service import recommend_resources
from ..auth import verify_token

router = APIRouter()


class QuestionEntry(BaseModel):
    question: str
    difficulty: str
    score: int
    expected_topics: List[str]
    missing_topics: List[str]
    question_category: Optional[str] = ""


class DashboardRequest(BaseModel):
    role: str
    topic: str
    questions: List[QuestionEntry]


@router.post("/dashboard")
def get_dashboard(body: DashboardRequest, user: dict = Depends(verify_token)):
    try:
        session_questions = [SessionQuestion(**q.model_dump()) for q in body.questions]

        stats = calculate(session_questions)
        report = generate_report(body.role, body.topic, session_questions)

        weak_topics = report.get("weaknesses", [])
        resources = recommend_resources(weak_topics)

        # Build question history with full details for timeline
        history = [
            {
                "question_number": i + 1,
                "question": q.question,
                "difficulty": q.difficulty,
                "score": q.score,
                "expected_topics": q.expected_topics,
                "missing_topics": q.missing_topics,
                "question_category": q.question_category or "",
            }
            for i, q in enumerate(session_questions)
        ]

        return {
            "success": True,
            "data": {
                "role": body.role,
                "topic": body.topic,
                "stats": stats,
                "history": history,
                "report": {
                    "summary": report.get("summary", ""),
                    "strengths": report.get("strengths", []),
                    "weaknesses": report.get("weaknesses", []),
                    "recommendations": report.get("recommendations", []),
                    "study_plan": report.get("study_plan", ""),
                    "confidence_level": report.get("confidence_level", "Medium"),
                },
                "resources": resources.get("resources", []),
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
            content={"success": False, "message": "Unable to generate dashboard."},
        )