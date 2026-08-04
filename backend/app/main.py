import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import logger
from app.core.database import engine, Base
# Import all models explicitly to ensure they register on Base
from app.models.user import User, UserRole
from app.models.audit import AuditLog, TokenBlacklist
from app.models.resume import Resume, ResumeStatus
from app.models.job import JobDescription, JobMatch, JobApplication, ApplicationStatus
from app.models.interview import InterviewSession
from app.api.v1.router import api_router
from app.schemas.common import APIResponse
from alembic.config import Config
from alembic import command

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run database migrations
    try:
        logger.info("Running database migrations...")
        # Ensure we're in the correct directory for alembic
        alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully")
    except Exception as e:
        logger.warning(f"Alembic migration failed: {e}")
        # Fallback: create tables directly - this will create all tables defined in models
        logger.info("Falling back to Base.metadata.create_all...")
        Base.metadata.create_all(bind=engine)
        logger.info("Base.metadata.create_all completed - tables created")
    
    yield
    
    # Shutdown
    logger.info("Application shutdown")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    description="Production-grade AI Career Assistant SaaS Backend REST API",
    lifespan=lifespan
)

# CORS Configuration
cors_origins = list(settings.BACKEND_CORS_ORIGINS)

if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(dict.fromkeys(cors_origins)),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP Exception {exc.status_code}: {exc.detail} for path {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "data": None, "error": str(exc.detail)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error for path {request.url.path}: {exc.errors()}")
    error_msg = exc.errors()[0]["msg"] if exc.errors() else "Validation Error"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "message": "Input validation failed.", "data": None, "error": error_msg}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": "Internal Server Error", "data": None, "error": str(exc)}
    )

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
