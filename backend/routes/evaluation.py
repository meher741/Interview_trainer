from fastapi import APIRouter
from fastapi.responses import JSONResponse
from models.evaluation_models import EvaluationRequest
from services.evaluation_service import evaluate_answer

router = APIRouter()


@router.post("/evaluate-answer")
def evaluate_answer_route(body: EvaluationRequest):
    try:
        data = evaluate_answer(body.question, body.expected_topics, body.answer)
        return {"success": True, "data": data}
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Unable to evaluate answer."},
        )
