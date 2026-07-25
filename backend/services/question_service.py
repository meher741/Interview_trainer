import os
import json
from services.gemini_service import ask_gemini

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "question_prompt.txt")


def _load_prompt(role: str, topic: str, difficulty: str, weak_topics: list = None, average_score: float = 0, question_history: list = None) -> str:
    with open(PROMPT_PATH, "r") as f:
        template = f.read()
    return template.format(
        role=role,
        topic=topic,
        difficulty=difficulty,
        weak_topics=", ".join(weak_topics or []),
        average_score=str(average_score),
        question_history="\n".join(f"- {q}" for q in (question_history or [])),
    )


def _clean_json(raw: str) -> str:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    return cleaned.strip()


def generate_question(role: str, topic: str, difficulty: str) -> dict:
    prompt = _load_prompt(role, topic, difficulty)
    raw = ask_gemini(prompt)
    return json.loads(_clean_json(raw))


def generate_personalized_question(role: str, topic: str, difficulty: str, weak_topics: list, average_score: float, question_history: list) -> dict:
    prompt = _load_prompt(role, topic, difficulty, weak_topics, average_score, question_history)
    raw = ask_gemini(prompt)
    return json.loads(_clean_json(raw))
