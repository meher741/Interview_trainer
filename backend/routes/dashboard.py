from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from models.interview_session import SessionQuestion
from services.analytics_service import calculate
from services.report_service import generate_report
from services.resource_service import recommend_resources

router = APIRouter()


class QuestionEntry(BaseModel):
    question: str
    difficulty: str
    score: int
    expected_topics: List[str]
    missing_topics: List[str]


class DashboardRequest(BaseModel):
    role: str
    topic: str
    questions: List[QuestionEntry]


@router.post("/dashboard")
def get_dashboard(body: DashboardRequest):
    try:
        session_questions = [SessionQuestion(**q.model_dump()) for q in body.questions]

        stats = calculate(session_questions)
        report = generate_report(body.role, body.topic, session_questions)

        weak_topics = report.get("weaknesses", [])
        resources = recommend_resources(weak_topics)

        return {
            "success": True,
            "data": {
                "stats": stats,
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
