from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, users, resumes, jobs, applications, assistant, interviews

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users Profile"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resume Intelligence"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Matching"])
api_router.include_router(applications.router, prefix="/applications", tags=["Application Tracker"])
api_router.include_router(assistant.router, prefix="/ai", tags=["AI Assistant"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["AI Mock Interviews"])



