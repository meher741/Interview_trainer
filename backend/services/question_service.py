import os
import json
import logging
from services.groq_service import ask_groq

logger = logging.getLogger(__name__)

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "question_prompt.txt")


def _load_prompt(role, topic, difficulty, weak_topics=None, average_score=0, question_history=None, used_categories=None):
    with open(PROMPT_PATH, "r") as f:
        template = f.read()
    return template.format(
        role=role,
        topic=topic,
        difficulty=difficulty,
        weak_topics=", ".join(weak_topics or []),
        average_score=str(average_score),
        question_history="\n".join(f"- {q}" for q in (question_history or [])),
        used_categories=", ".join(used_categories or []),
    )


def _clean_json(raw):
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    return cleaned.strip()


def _parse_question(raw):
    try:
        data = json.loads(_clean_json(raw))
    except json.JSONDecodeError as e:
        logger.error("Failed to parse question JSON. Raw response: %s", raw[:500])
        raise ValueError(f"Invalid JSON from AI: {e}")
    data.setdefault("question_category", "General")
    data.setdefault("question", "")
    data.setdefault("difficulty", "")
    data.setdefault("expected_topics", [])
    data.setdefault("hint", "")
    data.setdefault("estimated_time", "")
    return data


def generate_question(role, topic, difficulty, used_categories=None):
    prompt = _load_prompt(role, topic, difficulty, used_categories=used_categories)
    raw = ask_groq(prompt)
    return _parse_question(raw)


def generate_personalized_question(role, topic, difficulty, weak_topics, average_score, question_history, used_categories=None):
    prompt = _load_prompt(
        role, topic, difficulty,
        weak_topics=weak_topics,
        average_score=average_score,
        question_history=question_history,
        used_categories=used_categories,
    )
    raw = ask_groq(prompt)
    return _parse_question(raw)
