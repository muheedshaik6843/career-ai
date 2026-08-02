import re
from typing import List, Dict, Any, Tuple
from app.models.resume import Resume
from app.schemas.job import SkillGapBreakdown, JobMatchResponse


# Extended skill vocabulary for keyword matching
KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular",
    "Node.js", "Express", "FastAPI", "Django", "Flask", "Java", "Spring Boot",
    "C++", "C#", ".NET", "Go", "Golang", "Rust", "PHP", "Laravel", "Ruby", "Rails",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "GraphQL",
    "REST API", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "DevOps", "CI/CD",
    "Terraform", "Git", "GitHub", "GitLab", "Linux", "Tailwind CSS", "Bootstrap",
    "HTML", "CSS", "Sass", "Redux", "Zustand", "Prisma", "SQLAlchemy", "System Design",
    "Microservices", "Agile", "Scrum", "Jira", "Unit Testing", "Jest", "PyTest",
    "Cypress", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Pandas",
    "NumPy", "Scikit-Learn", "Data Analysis", "Tableau", "Power BI", "Spark", "Hadoop"
]


class JobMatchingService:

    def extract_job_skills(self, description: str) -> Tuple[List[str], List[str]]:
        """
        Extract required and preferred skills from job description text.
        """
        desc_lower = description.lower()
        found_skills = []

        for skill in KNOWN_SKILLS:
            # Match skill using word boundary regex to avoid false positives
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, desc_lower):
                found_skills.append(skill)

        # Distinguish required vs preferred based on context
        required = []
        preferred = []

        for skill in found_skills:
            # Check context around skill
            idx = desc_lower.find(skill.lower())
            context = desc_lower[max(0, idx - 80):min(len(desc_lower), idx + 80)]
            if any(term in context for term in ["nice to have", "plus", "preferred", "bonus", "optional"]):
                preferred.append(skill)
            else:
                required.append(skill)

        if not required and found_skills:
            required = found_skills

        return required, preferred

    def extract_keywords(self, text: str) -> List[str]:
        """
        Extract important keywords (terms with 4+ letters, ignoring common stop words).
        """
        stopwords = {
            "with", "from", "that", "this", "have", "more", "will", "your", "their",
            "which", "about", "into", "through", "after", "over", "other", "should",
            "could", "would", "these", "where", "being", "been", "under", "team",
            "work", "job", "company", "role", "looking", "candidate", "must", "ability"
        }
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        keywords = set()
        for w in words:
            if w not in stopwords:
                keywords.add(w)
        return list(keywords)

    def analyze_match(self, job_title: str, company: str, job_description: str, resume: Resume) -> JobMatchResponse:
        """
        Perform AI Skill Gap Analysis and Match Scoring between job description and resume.
        """
        req_skills, pref_skills = self.extract_job_skills(job_description)
        job_keywords = self.extract_keywords(job_description)

        # Candidate skills normalized
        resume_skills_raw = resume.skills or []
        resume_text = (resume.raw_text or "").lower()
        
        # Combine explicit skills and extracted skills from raw text
        candidate_skills_set = set()
        for s in resume_skills_raw:
            candidate_skills_set.add(s.lower())

        for skill in KNOWN_SKILLS:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, resume_text):
                candidate_skills_set.add(skill.lower())

        # Skill Matching
        matching = []
        missing_req = []
        missing_pref = []

        for skill in req_skills:
            if skill.lower() in candidate_skills_set:
                matching.append(skill)
            else:
                missing_req.append(skill)

        for skill in pref_skills:
            if skill.lower() in candidate_skills_set:
                if skill not in matching:
                    matching.append(skill)
            else:
                missing_pref.append(skill)

        # Missing Keywords
        missing_kw = []
        for kw in job_keywords[:30]:
            if kw not in resume_text and kw not in [s.lower() for s in matching]:
                missing_kw.append(kw.capitalize())

        # Calculate Sub-scores
        if req_skills:
            skill_score = min(100.0, round((len(matching) / max(1, len(req_skills))) * 100.0, 1))
        else:
            skill_score = 75.0  # Default if no explicit skills detected

        # Experience score based on keyword overlap and experience count
        keyword_overlap = sum(1 for kw in job_keywords if kw in resume_text)
        exp_ratio = keyword_overlap / max(1, len(job_keywords))
        experience_score = min(100.0, round(exp_ratio * 120.0 + (len(resume.experience or []) * 10), 1))
        experience_score = max(40.0, min(100.0, experience_score))

        # Education score
        education_score = 85.0 if resume.education else 60.0

        # Weighted Total Score
        match_score = round((skill_score * 0.50) + (experience_score * 0.35) + (education_score * 0.15), 1)

        # Generate Actionable Recommendations
        recommendations = []
        if missing_req:
            recommendations.append(f"Add critical missing skills to your resume: {', '.join(missing_req[:4])}.")
        if missing_kw:
            recommendations.append(f"Integrate key role terms into your experience bullet points: {', '.join(missing_kw[:5])}.")
        if skill_score < 70:
            recommendations.append("Tailor your professional summary to directly address the primary tech stack in this job description.")
        if experience_score < 70:
            recommendations.append("Quantify accomplishments in your past roles using metrics relevant to this position's responsibilities.")
        if not recommendations:
            recommendations.append("Your resume is very strongly aligned with this job description! Consider customizing your cover letter.")

        breakdown = SkillGapBreakdown(
            match_score=match_score,
            skill_score=skill_score,
            experience_score=experience_score,
            education_score=education_score,
            matching_skills=matching,
            missing_required_skills=missing_req,
            missing_preferred_skills=missing_pref,
            missing_keywords=missing_kw[:12],
            recommendations=recommendations
        )

        return JobMatchResponse(
            job_title=job_title or "Target Role",
            company=company or "Target Company",
            location=None,
            match_score=match_score,
            breakdown=breakdown
        )


job_matching_service = JobMatchingService()
