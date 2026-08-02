from fastapi import APIRouter
from app.schemas.common import HealthCheck, APIResponse
from app.core.config import settings

router = APIRouter()


@router.get("", response_model=APIResponse[HealthCheck])
def health_check():
    health_data = HealthCheck(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT
    )
    return APIResponse(
        success=True,
        message="AI Career Assistant Service is healthy.",
        data=health_data
    )
