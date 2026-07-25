import os
import json
from services.gemini_service import ask_gemini

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "question_prompt.txt")


def _load_prompt(role: str, topic: str, difficulty: str) -> str:
    with open(PROMPT_PATH, "r") as f:
        template = f.read()
    return template.format(role=role, topic=topic, difficulty=difficulty)


def generate_question(role: str, topic: str, difficulty: str) -> dict:
    prompt = _load_prompt(role, topic, difficulty)
    raw = ask_gemini(prompt)

    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    return json.loads(cleaned)
