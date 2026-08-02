from typing import List, Optional
from app.models.resume import Resume
from app.schemas.assistant import CoverLetterResponse


class CoverLetterService:

    def generate_cover_letter(
        self,
        job_title: str,
        company: str,
        job_description: Optional[str] = None,
        tone: str = "Professional",
        resume: Optional[Resume] = None
    ) -> CoverLetterResponse:
        """
        Generate a compelling AI cover letter customized to the target role and candidate background.
        """
        candidate_name = resume.full_name if (resume and resume.full_name) else "Alex Morgan"
        candidate_email = resume.email if (resume and resume.email) else "alex.morgan@email.com"
        candidate_skills = resume.skills[:6] if (resume and resume.skills) else ["Python", "TypeScript", "React", "FastAPI", "Docker", "PostgreSQL"]

        skills_str = ", ".join(candidate_skills)

        if tone.lower() == "enthusiastic":
            opening = f"I was thrilled to see the {job_title} position open at {company}! As a passionate engineer driven by innovating user-centric products, I would love to bring my expertise to your team."
            closing = f"I am deeply inspired by {company}'s vision and would welcome the opportunity to discuss how my skill set aligns with your engineering objectives."
        elif tone.lower() == "executive":
            opening = f"I am writing to express my strong interest in leading engineering impact as a {job_title} at {company}. With a track record of driving technical strategy and delivering scalable systems, I bring strategic value to your team."
            closing = f"I look forward to discussing how my experience delivering high-value outcomes will contribute to {company}'s strategic goals."
        else:  # Professional
            opening = f"Please accept this letter as my application for the {job_title} role at {company}. With a strong background in software engineering and modern technology stacks, I am excited about the opportunity to contribute to your engineering goals."
            closing = f"Thank you for considering my application. I welcome the opportunity to interview for the {job_title} role and demonstrate how my experience will add immediate value to {company}."

        body_paragraph_1 = f"Throughout my career, I have specialized in building robust software applications and scalable services. My core technical strengths include {skills_str}. In my previous roles, I focused on writing clean, maintainable code, improving system performance, and collaborating closely with cross-functional teams to ship features on time."

        body_paragraph_2 = f"What excites me most about {company} is your commitment to technical excellence and product innovation. I am confident that my experience with building resilient systems and my proactive problem-solving mindset make me a natural fit for the {job_title} role."

        full_letter = f"""{candidate_name}
{candidate_email}

Dear Hiring Manager,

{opening}

{body_paragraph_1}

{body_paragraph_2}

{closing}

Sincerely,
{candidate_name}"""

        highlights = [
            f"Tailored for {job_title} at {company}",
            f"Emphasized core skills: {skills_str}",
            f"Configured with {tone} tone"
        ]

        return CoverLetterResponse(
            job_title=job_title,
            company=company,
            tone=tone,
            cover_letter=full_letter,
            key_highlights=highlights
        )


cover_letter_service = CoverLetterService()
