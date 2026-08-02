import os
import json
import logging
from typing import Optional, List
import httpx

from app.core.config import settings
from app.models.resume import Resume
from app.schemas.assistant import ChatResponse

logger = logging.getLogger(__name__)

class CareerChatService:

    def _call_gemini_api(
        self,
        api_key: str,
        system_instruction: str,
        user_prompt: str
    ) -> Optional[dict]:
        """Call Google Gemini API endpoint via httpx and return parsed JSON result."""

        full_prompt = (
            f"{system_instruction}\n\n"
            f"Candidate Question: {user_prompt}\n\n"
            "Respond ONLY with a JSON object in the exact format:\n"
            "{\n"
            '  "reply": "Comprehensive, clear, and actionable career advice formatted nicely with markdown bullet points if relevant.",\n'
            '  "suggested_followups": ["Followup question 1", "Followup question 2", "Followup question 3"],\n'
            '  "actionable_tips": ["Actionable tip 1", "Actionable tip 2"]\n'
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": full_prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
                "responseMimeType": "application/json"
            }
        }

        model = settings.GEMINI_MODEL
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        with httpx.Client(timeout=20.0) as client:
            try:
                res = client.post(url, json=payload, headers={"x-goog-api-key": api_key})
                res.raise_for_status()
                candidates = res.json().get("candidates", [])
                parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
                if parts:
                    text = parts[0].get("text", "").strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                    return json.loads(text)
                logger.warning("Gemini API returned no response content.")
            except (httpx.HTTPError, ValueError, json.JSONDecodeError) as exc:
                logger.warning("Gemini API request failed: %s", exc)

        return None

    def process_message(
        self,
        message: str,
        target_role: Optional[str] = "Software Engineer",
        context: Optional[str] = None,
        resume: Optional[Resume] = None,
    ) -> ChatResponse:
        resolved_api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        candidate_name = resume.full_name if (resume and resume.full_name) else "Candidate"
        skills = resume.skills if (resume and resume.skills) else ["Python", "TypeScript", "React", "FastAPI"]
        skills_str = ", ".join(skills[:6])

        # If Gemini API Key is provided and not placeholder, query Gemini API!
        if resolved_api_key and resolved_api_key not in ["your_gemini_api_key_here", ""]:
            system_instruction = (
                f"You are CareerAI Copilot, an elite AI Career Advisor and Technical Recruiter powered by Google Gemini. "
                f"Candidate Name: '{candidate_name}'. Target Role: '{target_role}'. "
                f"Candidate Key Skills: {skills_str}. "
                f"Provide concise, high-value, empowering, actionable career advice, ATS optimization strategies, "
                f"or interview preparation guidance based on their question."
            )
            gemini_result = self._call_gemini_api(resolved_api_key, system_instruction, message)
            if gemini_result and "reply" in gemini_result:
                return ChatResponse(
                    reply=gemini_result.get("reply", ""),
                    suggested_followups=gemini_result.get("suggested_followups", []),
                    actionable_tips=gemini_result.get("actionable_tips", [])
                )

        # Context-aware intelligent fallback response generator
        msg_lower = message.lower()

        if "resume" in msg_lower or "ats" in msg_lower:
            reply = f"Hello {candidate_name}! To optimize your resume for {target_role} roles, make sure your summary and work experience feature key technical terms like {skills_str}. Quantify every achievement with metrics (e.g. 'Improved speed by 30%')."
            followups = ["How can I score 90+ on ATS?", "Can you help optimize my bullet points?", "What skills should I highlight?"]
            tips = ["Use strong action verbs like Spearheaded, Engineered, and Scaled.", "Avoid standard templates with graphics or columns that ATS parser cannot read."]

        elif "interview" in msg_lower or "question" in msg_lower or "prep" in msg_lower:
            reply = f"Preparing for a {target_role} interview requires a balance of system design, technical coding, and STAR behavioral answers. Practicing real scenarios will boost your confidence immensely."
            followups = ["Start a mock interview session", "What are top System Design topics?", "How do I answer 'Tell me about yourself'?"]
            tips = ["Structure behavioral answers using Situation, Task, Action, Result (STAR).", "For technical questions, always clarify requirements before jumping into coding."]

        elif "salary" in msg_lower or "negotiat" in msg_lower or "offer" in msg_lower:
            reply = f"When negotiating offers for a {target_role} position, evaluate total compensation (base salary, stock options, joining bonus, remote perks). Never accept the initial offer immediately without benchmarking against market rates."
            followups = ["How to counter-offer professionally?", "What salary range is average for my role?", "What benefits can I negotiate?"]
            tips = ["Always express gratitude first before presenting your counter-offer.", "Use market data from Levels.fyi or Glassdoor as leverage."]

        elif "job" in msg_lower or "apply" in msg_lower or "match" in msg_lower:
            reply = f"Our live job engine actively scans roles matching your stack ({skills_str}). Tailoring your cover letter and adjusting keywords for each job description will double your interview callback rate."
            followups = ["Show my matched jobs", "How do I tailor my cover letter?", "Create a 6-month career roadmap"]
            tips = ["Apply within the first 48 hours of job posting for maximum visibility.", "Connect with hiring managers directly on LinkedIn after applying."]

        else:
            reply = f"I am your AI Career Advisor! Based on your target role as a {target_role} and your background in {skills_str}, I can help you optimize your resume, prepare for interviews, generate tailored cover letters, and build a career roadmap."
            followups = ["How do I improve my ATS score?", "Generate a tailored cover letter", "Start a mock interview", "Build a career roadmap"]
            tips = ["Regularly update your resume with recent projects and certifications.", "Track your applications systematically in your Application Tracker."]

        return ChatResponse(
            reply=reply,
            suggested_followups=followups,
            actionable_tips=tips
        )

chat_service = CareerChatService()
