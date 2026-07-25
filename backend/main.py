from dotenv import load_dotenv
from fastapi import FastAPI
from routes.ai import router as ai_router
from routes.question import router as question_router
from routes.evaluation import router as evaluation_router
from routes.adaptive import router as adaptive_router
from routes.dashboard import router as dashboard_router

load_dotenv()

app = FastAPI()

app.include_router(ai_router)
app.include_router(question_router)
app.include_router(evaluation_router)
app.include_router(adaptive_router)
app.include_router(dashboard_router)


@app.get("/")
def home():
    return {"success": True, "data": {"message": "Backend is running"}}


@app.get("/health")
def health():
    return {"success": True, "data": {"status": "OK"}}
