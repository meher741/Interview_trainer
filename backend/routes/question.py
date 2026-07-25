from fastapi import APIRouter
from fastapi.responses import JSONResponse
from models.question_models import QuestionRequest
from services.question_service import generate_question

router = APIRouter()


@router.post("/generate-question")
def generate_question_route(body: QuestionRequest):
    try:
        data = generate_question(body.role, body.topic, body.difficulty, used_categories=body.used_categories)
        return {"success": True, "data": data}
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Unable to generate question."},
        )
