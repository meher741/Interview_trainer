from fastapi import APIRouter
from fastapi.responses import JSONResponse
from services.evaluation_service import evaluate_answer as evaluate

router = APIRouter()


@router.post("/evaluate-answer")
def evaluate_answer(body: dict):
    try:
        question = body.get("question")
        expected_topics = body.get("expected_topics", [])
        answer = body.get("answer")
        if not question or not answer:
            raise ValueError("Question and answer are required")
        data = evaluate(question, expected_topics, answer)
        return {"success": True, "data": data}
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Unable to evaluate answer."},
        )