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
from sqlalchemy import text

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
        # Fallback: create tables directly using raw SQL
        logger.info("Falling back to raw SQL table creation...")
        
        # Create all tables defined in models
        Base.metadata.create_all(bind=engine)
        logger.info("Base.metadata.create_all completed - tables created")
        
        # Verify tables exist
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Created tables: {tables}")
        
        # If tables still missing, create them with raw SQL
        required_tables = ['job_applications', 'interview_sessions', 'job_descriptions', 'job_matches']
        missing_tables = [t for t in required_tables if t not in tables]
        if missing_tables:
            logger.warning(f"Missing tables: {missing_tables}, creating with raw SQL...")
            with engine.begin() as conn:
                # Create job_applications
                if 'job_applications' in missing_tables:
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS job_applications (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                            job_title VARCHAR(255) NOT NULL,
                            company VARCHAR(255) NOT NULL,
                            location VARCHAR(255),
                            salary VARCHAR(100),
                            url VARCHAR(1000),
                            status VARCHAR(50) DEFAULT 'saved' NOT NULL,
                            applied_date TIMESTAMP WITH TIME ZONE,
                            notes TEXT,
                            match_score FLOAT,
                            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                        )
                    """))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_applications_user_id ON job_applications (user_id)"))
                    logger.info("Created job_applications table")
                
                # Create interview_sessions
                if 'interview_sessions' in missing_tables:
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS interview_sessions (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                            target_role VARCHAR(255) NOT NULL,
                            experience_level VARCHAR(100),
                            difficulty VARCHAR(50) DEFAULT 'Medium' NOT NULL,
                            questions JSON NOT NULL,
                            answers JSON,
                            overall_score FLOAT,
                            strengths JSON,
                            areas_for_improvement JSON,
                            status VARCHAR(50) DEFAULT 'in_progress' NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                        )
                    """))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_interview_sessions_user_id ON interview_sessions (user_id)"))
                    logger.info("Created interview_sessions table")
                
                # Create job_descriptions
                if 'job_descriptions' in missing_tables:
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS job_descriptions (
                            id VARCHAR(36) PRIMARY KEY,
                            title VARCHAR(255) NOT NULL,
                            company VARCHAR(255) NOT NULL,
                            location VARCHAR(255),
                            salary_range VARCHAR(100),
                            job_type VARCHAR(100),
                            description TEXT NOT NULL,
                            required_skills JSON,
                            preferred_skills JSON,
                            keywords JSON,
                            experience_level VARCHAR(100),
                            education_required VARCHAR(255),
                            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                        )
                    """))
                    logger.info("Created job_descriptions table")
                
                # Create job_matches
                if 'job_matches' in missing_tables:
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS job_matches (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                            resume_id VARCHAR(36) REFERENCES resumes(id),
                            job_id VARCHAR(36) REFERENCES job_descriptions(id),
                            match_score FLOAT NOT NULL,
                            skill_score FLOAT NOT NULL,
                            experience_score FLOAT NOT NULL,
                            education_score FLOAT NOT NULL,
                            matching_skills JSON,
                            missing_required_skills JSON,
                            missing_preferred_skills JSON,
                            missing_keywords JSON,
                            recommendations JSON,
                            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                            is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                        )
                    """))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_matches_user_id ON job_matches (user_id)"))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_matches_resume_id ON job_matches (resume_id)"))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_matches_job_id ON job_matches (job_id)"))
                    logger.info("Created job_matches table")
            
            logger.info("Raw SQL table creation completed")
    
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

@app.post("/admin/create-tables")
async def create_tables():
    """Manual endpoint to create missing tables (for free tier deployment)"""
    try:
        from sqlalchemy import inspect, text
        
        # Check existing tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = ['job_applications', 'interview_sessions', 'job_descriptions', 'job_matches']
        missing_tables = [t for t in required_tables if t not in tables]
        
        if not missing_tables:
            return {"success": True, "message": "All tables already exist", "tables": tables}
        
        # Create missing tables with raw SQL
        created = []
        with engine.begin() as conn:
            if 'job_applications' in missing_tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS job_applications (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                        job_title VARCHAR(255) NOT NULL,
                        company VARCHAR(255) NOT NULL,
                        location VARCHAR(255),
                        salary VARCHAR(100),
                        url VARCHAR(1000),
                        status VARCHAR(50) DEFAULT 'saved' NOT NULL,
                        applied_date TIMESTAMP WITH TIME ZONE,
                        notes TEXT,
                        match_score FLOAT,
                        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                    )
                """))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_applications_user_id ON job_applications (user_id)"))
                created.append("job_applications")
            
            if 'interview_sessions' in missing_tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS interview_sessions (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                        target_role VARCHAR(255) NOT NULL,
                        experience_level VARCHAR(100),
                        difficulty VARCHAR(50) DEFAULT 'Medium' NOT NULL,
                        questions JSON NOT NULL,
                        answers JSON,
                        overall_score FLOAT,
                        strengths JSON,
                        areas_for_improvement JSON,
                        status VARCHAR(50) DEFAULT 'in_progress' NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                    )
                """))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_interview_sessions_user_id ON interview_sessions (user_id)"))
                created.append("interview_sessions")
            
            if 'job_descriptions' in missing_tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS job_descriptions (
                        id VARCHAR(36) PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        company VARCHAR(255) NOT NULL,
                        location VARCHAR(255),
                        salary_range VARCHAR(100),
                        job_type VARCHAR(100),
                        description TEXT NOT NULL,
                        required_skills JSON,
                        preferred_skills JSON,
                        keywords JSON,
                        experience_level VARCHAR(100),
                        education_required VARCHAR(255),
                        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                    )
                """))
                created.append("job_descriptions")
            
            if 'job_matches' in missing_tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS job_matches (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                        resume_id VARCHAR(36) REFERENCES resumes(id),
                        job_id VARCHAR(36) REFERENCES job_descriptions(id),
                        match_score FLOAT NOT NULL,
                        skill_score FLOAT NOT NULL,
                        experience_score FLOAT NOT NULL,
                        education_score FLOAT NOT NULL,
                        matching_skills JSON,
                        missing_required_skills JSON,
                        missing_preferred_skills JSON,
                        missing_keywords JSON,
                        recommendations JSON,
                        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        is_deleted BOOLEAN DEFAULT FALSE NOT NULL
                    )
                """))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_matches_user_id ON job_matches (user_id)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_matches_resume_id ON job_matches (resume_id)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_matches_job_id ON job_matches (job_id)"))
                created.append("job_matches")
        
        # Verify final tables
        inspector = inspect(engine)
        final_tables = inspector.get_table_names()
        
        return {
            "success": True,
            "message": f"Created tables: {created}" if created else "All tables existed",
            "created": created,
            "all_tables": final_tables
        }
    except Exception as e:
        logger.error(f"Table creation failed: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
