
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analysis import router as analysis_router
from app.routes.documents import router as documents_router
from app.routes.history import router as history_router

from app.database.database import initialize_database

# Initialize SQLite database
initialize_database()

app = FastAPI(
    title="ReqFlow AI",
    description="AI-powered Client Requirement Analyzer",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://reqflow-ai-seven.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(
    analysis_router,
    prefix="/api",
    tags=["Requirement Analysis"]
)

app.include_router(
    documents_router,
    prefix="/api",
    tags=["Document Processing"]
)

app.include_router(
    history_router,
    prefix="/api",
    tags=["Analysis History"]
)

@app.get("/")
def home():
    return {
        "message": "Welcome to ReqFlow AI",
        "status": "Running successfully"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}