from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from services.groq_service import ask_groq

router = APIRouter()


class PromptRequest(BaseModel):
    prompt: str


@router.post("/test-ai")
def test_ai(body: PromptRequest):
    try:
        response = ask_groq(body.prompt)
        return {"success": True, "data": {"response": response}}
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Unable to generate response."},
        )