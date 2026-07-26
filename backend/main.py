import logging
from dotenv import load_dotenv
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables from the .env file in the backend directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db
from routes.ai import router as ai_router
from routes.question import router as question_router
from routes.evaluation import router as evaluation_router
from routes.adaptive import router as adaptive_router
from routes.dashboard import router as dashboard_router
from routes.auth import router as auth_router
from routes.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(question_router)
app.include_router(evaluation_router)
app.include_router(adaptive_router)
app.include_router(dashboard_router)
app.include_router(analytics_router)

# Handle CORS preflight at the app level for any unhandled OPTIONS requests
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    from fastapi.responses import Response
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        },
    )


@app.get("/")
def home():
    return {"success": True, "data": {"message": "Backend is running"}}


@app.get("/health")
def health():
    return {"success": True, "data": {"status": "OK"}}