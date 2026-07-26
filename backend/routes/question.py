import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from models.question_models import QuestionRequest
from services.question_service import generate_question
from dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate-question")
def generate_question_route(body: QuestionRequest, _user=Depends(get_current_user)):
    try:
        data = generate_question(body.role, body.topic, body.difficulty, used_categories=body.used_categories)
        return {"success": True, "data": data}
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    except Exception as e:
        logger.error("Error generating question: %s", str(e), exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Unable to generate question: {str(e)}"},
        )
