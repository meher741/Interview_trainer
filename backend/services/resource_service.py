import os
import json
from services.groq_service import ask_groq

PROMPT = """You are a career coach recommending learning resources.

Weak topics: {weak_topics}

For each weak topic, recommend 2 learning resources from platforms like NeetCode, LeetCode, GeeksforGeeks, YouTube, or FreeCodeCamp.

Return ONLY valid JSON:
{{
  "resources": [
    {{"topic": "", "platform": "", "title": "", "reason": ""}}
  ]
}}
"""


def recommend_resources(weak_topics: list[str]) -> dict:
    prompt = PROMPT.format(weak_topics=", ".join(weak_topics))
    raw = ask_groq(prompt)

    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    return json.loads(cleaned)
