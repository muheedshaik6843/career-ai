from typing import List, Optional
from app.models.resume import Resume
from app.schemas.assistant import CareerRoadmapResponse, Milestone


class RoadmapService:

    def generate_roadmap(
        self,
        target_role: str,
        current_level: str = "Intermediate",
        timeline_months: int = 6,
        resume: Optional[Resume] = None
    ) -> CareerRoadmapResponse:
        """
        Generate a personalized month-by-month career roadmap.
        """
        milestones = [
            Milestone(
                month=1,
                title="Core Foundations & Gap Elimination",
                focus="Master core architecture patterns and fill primary technical gaps.",
                key_actions=[
                    f"Audit skills against top {target_role} job requirements.",
                    "Build 2 mini-projects focusing on missing frameworks/libraries.",
                    "Refactor existing resume using ATS impact action verbs."
                ],
                recommended_skills=["System Design", "Advanced TypeScript / Python", "REST & GraphQL APIs"],
                project_idea="Build a high-performance RESTful API with automated CI/CD pipeline and Redis caching."
            ),
            Milestone(
                month=2,
                title="Advanced System Architecture & Cloud",
                focus="Deep dive into cloud infrastructure, microservices, and containerization.",
                key_actions=[
                    "Containerize application stack using Docker & Docker Compose.",
                    "Set up AWS / GCP cloud deployment with automated GitHub Actions.",
                    "Implement rate limiting, OAuth authentication, and logging."
                ],
                recommended_skills=["Docker", "AWS / Cloud Infrastructure", "CI/CD Pipelines", "PostgreSQL Optimization"],
                project_idea="Deploy a microservices application with PostgreSQL, Redis cache, and Prometheus monitoring."
            ),
            Milestone(
                month=3,
                title="Portfolio Showcase & Market Positioning",
                focus="Launch capstone project and optimize recruiter visibility.",
                key_actions=[
                    "Publish full-stack open-source capstone repository on GitHub with detailed documentation.",
                    "Polish LinkedIn profile and optimize resume ATS score above 90%.",
                    "Conduct 5+ mock interview practice sessions."
                ],
                recommended_skills=["Production Deployment", "Performance Optimization", "Technical Interview Prep"],
                project_idea="Complete production-grade SaaS product MVP with payment integration and user auth."
            )
        ]

        if timeline_months >= 6:
            milestones.extend([
                Milestone(
                    month=4,
                    title="Active Application & Networking Phase",
                    focus="Apply to targeted tier-1 companies and secure interviews.",
                    key_actions=[
                        "Submit 10+ tailored applications per week with customized cover letters.",
                        "Reach out to engineering managers and recruiters for warm referrals.",
                        "Participate in technical tech meetups or open-source discussions."
                    ],
                    recommended_skills=["Networking", "Cover Letter Customization", "Offer Negotiation"],
                    project_idea="Contribute to a high-visibility open source repository related to target tech stack."
                ),
                Milestone(
                    month=5,
                    title="Technical Interview Execution",
                    focus="Perform strongly in coding challenges and system design rounds.",
                    key_actions=[
                        "Solve 50+ LeetCode medium/hard patterns (Data Structures & Algorithms).",
                        "Practice whiteboarding system design architectures.",
                        "Refine behavioral stories using STAR methodology."
                    ],
                    recommended_skills=["Data Structures & Algorithms", "System Design Whiteboarding", "STAR Method"],
                    project_idea="Prepare 5 detailed case studies of past engineering triumphs and lessons."
                ),
                Milestone(
                    month=6,
                    title="Offer Evaluation & Onboarding",
                    focus="Evaluate job offers, negotiate total compensation, and transition.",
                    key_actions=[
                        "Compare compensation packages (Base, Equity, Bonus, Benefits).",
                        "Negotiate offers confidently using market data.",
                        "Prepare 90-day onboarding strategy for your new role."
                    ],
                    recommended_skills=["Offer Negotiation", "Salary Benchmarking", "Onboarding Strategy"],
                    project_idea="Create a 90-day execution plan for immediate impact in your new engineering role."
                )
            ])

        certifications = [
            "AWS Certified Solutions Architect – Associate",
            "Certified Kubernetes Application Developer (CKAD)",
            "Meta Front-End / Back-End Developer Professional Certificate"
        ]

        summary = f"This {timeline_months}-month roadmap is tailored for transition into a {target_role} role. Focus on monthly milestones, building production portfolio projects, and refining interview performance."

        return CareerRoadmapResponse(
            target_role=target_role,
            timeline_months=timeline_months,
            milestones=milestones,
            recommended_certifications=certifications,
            summary=summary
        )


roadmap_service = RoadmapService()
