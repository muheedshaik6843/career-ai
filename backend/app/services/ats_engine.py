"""
ATS Scoring Engine
Scores resumes against best-practice ATS criteria without needing a job description.
Returns a 0–100 score with category breakdown and actionable feedback.
"""
import re
from typing import List, Optional


# ─── Scoring Weights ─────────────────────────────────────────────────────────
SCORE_WEIGHTS = {
    "contact_info":     15,   # Has email, phone, name
    "summary":          10,   # Professional summary present
    "skills":           20,   # Skills count & relevance
    "experience":       25,   # Work experience entries & bullet quality
    "education":        10,   # Education listed
    "action_verbs":     10,   # Use of strong action verbs
    "formatting":       10,   # No special chars, readable structure
}

ACTION_VERBS = {
    "achieved", "built", "created", "designed", "developed", "drove",
    "engineered", "established", "executed", "generated", "implemented",
    "improved", "increased", "launched", "led", "managed", "optimized",
    "owned", "pioneered", "reduced", "refactored", "scaled", "shipped",
    "spearheaded", "streamlined", "transformed",
}

WEAK_PHRASES = [
    "responsible for", "helped with", "worked on", "was involved in",
    "assisted in", "duties included", "team player",
]


def score_contact_info(parsed: dict) -> tuple[float, List[str]]:
    feedback = []
    score = 0
    if parsed.get("full_name"):
        score += 5
    else:
        feedback.append("❌ Your name was not detected — ensure it's on the first line in a standard font.")
    if parsed.get("email"):
        score += 5
    else:
        feedback.append("❌ No email address found — add a professional email address.")
    if parsed.get("phone"):
        score += 5
    else:
        feedback.append("⚠️ No phone number detected — consider adding one for recruiter contact.")
    return score, feedback


def score_summary(parsed: dict) -> tuple[float, List[str]]:
    feedback = []
    summary = parsed.get("summary")
    if summary and len(summary) > 50:
        return 10, []
    elif summary:
        feedback.append("⚠️ Your summary is very brief. Expand it to 3–5 sentences describing your value proposition.")
        return 5, feedback
    else:
        feedback.append("❌ No professional summary found. Add a 3–5 sentence summary highlighting your expertise.")
        return 0, feedback


def score_skills(parsed: dict) -> tuple[float, List[str]]:
    feedback = []
    skills = parsed.get("skills") or []
    count = len(skills)
    if count >= 15:
        score = 20
    elif count >= 8:
        score = 15
        feedback.append(f"⚠️ You have {count} skills listed. Aim for 15+ to maximize keyword matching.")
    elif count >= 4:
        score = 10
        feedback.append(f"❌ Only {count} skills found. Add a dedicated 'Technical Skills' section with 15+ keywords.")
    else:
        score = 5
        feedback.append("❌ Very few skills detected. Add a clearly labeled 'Skills' section with relevant technologies.")
    return score, feedback


def score_experience(raw_text: str, parsed: dict) -> tuple[float, List[str]]:
    feedback = []
    score = 0
    experience = parsed.get("experience") or []

    if len(experience) >= 3:
        score += 15
    elif len(experience) >= 1:
        score += 10
        feedback.append("⚠️ Only 1–2 work experience entries detected. Ensure all relevant positions are included.")
    else:
        feedback.append("❌ No work experience section detected. Add a clearly labeled 'Experience' or 'Work History' section.")

    # Check for quantifiable achievements
    if re.search(r'\d+%|\$\d+|\d+ (users|customers|teams?|products?|services?|million|billion)', raw_text, re.IGNORECASE):
        score += 7
    else:
        feedback.append("⚠️ Add quantifiable achievements (e.g., 'Improved performance by 40%', 'Managed team of 8').")

    # Penalize weak phrases
    text_lower = raw_text.lower()
    weak_found = [phrase for phrase in WEAK_PHRASES if phrase in text_lower]
    if weak_found:
        score = max(score - 2, 0)
        feedback.append(f"⚠️ Avoid weak phrases like '{weak_found[0]}'. Use strong action verbs instead.")

    return min(score, 25), feedback


def score_education(parsed: dict) -> tuple[float, List[str]]:
    education = parsed.get("education") or []
    if education:
        return 10, []
    return 5, ["⚠️ No education section detected. Add your degrees and institutions."]


def score_action_verbs(raw_text: str) -> tuple[float, List[str]]:
    text_lower = raw_text.lower()
    found = [v for v in ACTION_VERBS if v in text_lower]
    count = len(found)
    if count >= 8:
        return 10, []
    elif count >= 4:
        return 7, [f"⚠️ Found {count} action verbs. Use 8+ strong verbs like: built, shipped, scaled, reduced."]
    else:
        return 4, ["❌ Very few action verbs detected. Start each bullet point with a strong verb (Led, Built, Shipped)."]


def score_formatting(raw_text: str) -> tuple[float, List[str]]:
    feedback = []
    score = 10
    # Penalize very long lines (likely formatting issues)
    long_lines = [l for l in raw_text.split('\n') if len(l) > 200]
    if long_lines:
        score -= 3
        feedback.append("⚠️ Some lines are very long — ensure your resume isn't a single block of text.")
    # Penalize if text is very short (extraction failure)
    if len(raw_text) < 300:
        score -= 5
        feedback.append("❌ Very little text was extracted from your resume. Ensure it's not image-based or heavily formatted.")
    return max(score, 0), feedback


def compute_ats_score(raw_text: str, parsed: dict) -> dict:
    """
    Compute ATS score and generate feedback.
    Returns: { score: float, breakdown: dict, feedback: list, suggestions: list }
    """
    breakdown = {}
    all_feedback = []

    # Contact
    s, f = score_contact_info(parsed)
    breakdown["contact_info"] = {"score": s, "max": 15}
    all_feedback.extend(f)

    # Summary
    s, f = score_summary(parsed)
    breakdown["summary"] = {"score": s, "max": 10}
    all_feedback.extend(f)

    # Skills
    s, f = score_skills(parsed)
    breakdown["skills"] = {"score": s, "max": 20}
    all_feedback.extend(f)

    # Experience
    s, f = score_experience(raw_text, parsed)
    breakdown["experience"] = {"score": s, "max": 25}
    all_feedback.extend(f)

    # Education
    s, f = score_education(parsed)
    breakdown["education"] = {"score": s, "max": 10}
    all_feedback.extend(f)

    # Action verbs
    s, f = score_action_verbs(raw_text)
    breakdown["action_verbs"] = {"score": s, "max": 10}
    all_feedback.extend(f)

    # Formatting
    s, f = score_formatting(raw_text)
    breakdown["formatting"] = {"score": s, "max": 10}
    all_feedback.extend(f)

    total = sum(v["score"] for v in breakdown.values())

    # Generate improvement suggestions
    suggestions = []
    if total < 50:
        suggestions.append("Your resume needs significant improvements before submitting to ATS-filtered roles.")
    if not parsed.get("summary"):
        suggestions.append("Add a 3–5 sentence professional summary to the top of your resume.")
    if len(parsed.get("skills") or []) < 10:
        suggestions.append("Create a dedicated 'Technical Skills' section with 15+ relevant keywords for your target role.")
    if not re.search(r'\d+%|\$\d+', raw_text):
        suggestions.append("Quantify your impact with numbers: percentages, dollar amounts, team sizes, or time saved.")
    if len(parsed.get("experience") or []) < 2:
        suggestions.append("Ensure all relevant work experience is listed with company name, title, and date range.")
    suggestions.append("Tailor your resume keywords to match each specific job description you apply to.")
    suggestions.append("Use a single-column, clean format to maximize ATS readability.")

    return {
        "score": round(total, 1),
        "breakdown": breakdown,
        "feedback": all_feedback,
        "suggestions": suggestions[:6],
    }
