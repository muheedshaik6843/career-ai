from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api import deps
from app.schemas.common import APIResponse
from app.schemas.job import JobAnalyzeRequest, JobMatchResponse, JobDescriptionResponse
from app.services.job_matching_service import job_matching_service
from app.services.resume_service import resume_service
from app.services.live_job_service import job_scraper_service
from app.models.user import User
from app.models.resume import Resume

router = APIRouter()

DEFAULT_LOCATION = "Hyderabad, India"


def _make_dummy_match(job: dict, resume) -> "JobMatchResponse":
    """Helper: run ATS analysis for a job dict against a resume."""
    desc = job.get("description") or f"{job['title']} at {job['company']}"
    match = job_matching_service.analyze_match(
        job_title=job["title"],
        company=job["company"],
        job_description=desc,
        resume=resume,
    )
    match.location = job.get("location", "Remote")
    match.apply_url = job.get("apply_url") or job.get("url")
    match.source = job.get("source", "Live")
    match.salary_range = job.get("salary_range")
    return match


@router.post("/analyze", response_model=APIResponse[JobMatchResponse], status_code=status.HTTP_200_OK)
def analyze_job_match(
    request: JobAnalyzeRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Analyze candidate fit for a target job description.
    Compares against candidate's primary resume or provided `resume_id`.
    Returns match score, skill breakdown, missing keywords, and recommendations.
    """
    if request.resume_id:
        resume = resume_service.get_resume(db, resume_id=request.resume_id, user_id=current_user.id)
    else:
        resumes = resume_service.get_user_resumes(db, user_id=current_user.id)
        if not resumes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No resume found. Please upload a resume first before running job match analysis."
            )
        resume = next((r for r in resumes if r.is_primary), resumes[0])

    match_result = job_matching_service.analyze_match(
        job_title=request.title or "Target Position",
        company=request.company or "Target Company",
        job_description=request.description,
        resume=resume
    )

    return APIResponse(
        success=True,
        message="Job match analysis completed successfully.",
        data=match_result
    )


@router.get("/recommendations", response_model=APIResponse[List[JobMatchResponse]])
async def get_job_recommendations(
    location: str = Query(DEFAULT_LOCATION, description="Job location e.g. 'Hyderabad, India', 'Remote', 'Worldwide'"),
    limit: int = Query(15, ge=1, le=50),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Get live real-time job recommendations from multiple scraped sources
    (TimesJobs, Shine, RemoteOK, Remotive, Adzuna), scored against the
    candidate's primary resume. Default location: Hyderabad, India.
    """
    resumes = resume_service.get_user_resumes(db, user_id=current_user.id)
    primary = next((r for r in resumes if r.is_primary), resumes[0]) if resumes else None

    skills = list(primary.skills or []) if primary else []
    job_title = None
    if primary and primary.experience:
        try:
            entries = primary.experience
            if entries and isinstance(entries, list) and entries:
                job_title = entries[0].get("title") if isinstance(entries[0], dict) else None
        except Exception:
            pass

    raw_jobs = await job_scraper_service.fetch_jobs(
        search_query=None,
        location=location,
        skills=skills,
        job_title=job_title,
        limit=limit,
    )

    # Fallback dummy resume if user hasn't uploaded yet
    dummy = Resume(skills=["Python", "JavaScript", "React", "SQL"], raw_text="Software Engineer")

    results = [_make_dummy_match(job, primary if primary else dummy) for job in raw_jobs]
    results.sort(key=lambda x: x.match_score, reverse=True)

    return APIResponse(
        success=True,
        message=f"Found {len(results)} live job match(es) in {location}.",
        data=results
    )


@router.get("/live", response_model=APIResponse[List[JobMatchResponse]])
async def search_live_jobs(
    search: Optional[str] = Query(None, description="Keywords e.g. python, react, backend, java"),
    location: str = Query(DEFAULT_LOCATION, description="Location e.g. 'Hyderabad, India', 'Remote', 'Bangalore'"),
    limit: int = Query(15, ge=1, le=50),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Search live job postings from web scrapers + APIs (BeautifulSoup + Remotive/Adzuna/RemoteOK).
    Supports worldwide locations. Default: Hyderabad, India.
    """
    resumes = resume_service.get_user_resumes(db, user_id=current_user.id)
    primary = next((r for r in resumes if r.is_primary), resumes[0]) if resumes else None

    raw_jobs = await job_scraper_service.fetch_jobs(
        search_query=search,
        location=location,
        skills=list(primary.skills or []) if primary else [],
        limit=limit,
    )

    dummy = Resume(skills=["Python", "JavaScript", "React", "SQL"], raw_text="Software Engineer")
    results = [_make_dummy_match(job, primary if primary else dummy) for job in raw_jobs]
    results.sort(key=lambda x: x.match_score, reverse=True)

    return APIResponse(
        success=True,
        message=f"Retrieved {len(results)} live job(s) for '{search or 'all'}' in '{location}'.",
        data=results
    )
