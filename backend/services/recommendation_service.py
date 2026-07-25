import os
import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from services.groq_service import ask_groq

logger = logging.getLogger(__name__)

RECOMMENDATION_PROMPT = """You are an expert career coach creating a personalized study plan for a software engineer.

User Profile:
- Total questions practiced: {total_questions}
- Overall average score: {average_score}/10
- Consistency score: {consistency_score}%
- Practice sessions completed: {sessions_count}

Topic Performance:
{topic_performance}

Weak Areas (score < 5/10):
{weak_areas}

Strong Areas (score >= 7/10):
{strong_areas}

Improvement Trend: {improvement_trend}

Based on this data, create a personalized study plan with:
1. Top 3 priority topics to focus on (with specific concepts)
2. Recommended learning resources for each weak topic (platform, title, why)
3. A weekly study schedule
4. Specific tips for interview preparation
5. Estimated time to interview readiness

Return ONLY valid JSON:
{{
  "priority_topics": [{{"topic": "", "reason": "", "concepts": []}}],
  "resources": [{{"topic": "", "platform": "", "title": "", "reason": ""}}],
  "weekly_schedule": "string",
  "interview_tips": ["string"],
  "estimated_readiness": "string"
}}
"""


async def generate_recommendations(
    total_questions: int,
    average_score: float,
    consistency_score: float,
    sessions_count: int,
    topic_performance: list,
    weak_areas: list,
    strong_areas: list,
    improvement_trend: str,
) -> dict:
    topic_str = "\n".join(
        f"- {t['topic']}: {t['average']}/10"
        for t in topic_performance
    ) if topic_performance else "No data yet"

    prompt = RECOMMENDATION_PROMPT.format(
        total_questions=total_questions,
        average_score=average_score,
        consistency_score=consistency_score,
        sessions_count=sessions_count,
        topic_performance=topic_str,
        weak_areas=", ".join(weak_areas) if weak_areas else "None identified yet",
        strong_areas=", ".join(strong_areas) if strong_areas else "None identified yet",
        improvement_trend=improvement_trend,
    )

    try:
        raw = ask_groq(prompt)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1]
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()
        return json.loads(cleaned)
    except Exception as e:
        logger.error("Failed to generate recommendations: %s", str(e))
        return {
            "priority_topics": [],
            "resources": [],
            "weekly_schedule": "Complete more practice sessions to get personalized recommendations.",
            "interview_tips": ["Practice consistently to unlock AI-powered recommendations."],
            "estimated_readiness": "Complete at least 3-5 practice sessions for a personalized estimate.",
        }
