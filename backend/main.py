from dotenv import load_dotenv
from fastapi import FastAPI
from routes.ai import router as ai_router
from routes.question import router as question_router

load_dotenv()

app = FastAPI()

app.include_router(ai_router)
app.include_router(question_router)


@app.get("/")
def home():
    return {"success": True, "data": {"message": "Backend is running"}}


@app.get("/health")
def health():
    return {"success": True, "data": {"status": "OK"}}
