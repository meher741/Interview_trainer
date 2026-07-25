import os
import json
from services.gemini_service import ask_gemini

PROMPT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "prompts", "evaluation_prompt.txt"
)


def _load_prompt(question: str, expected_topics: list, answer: str) -> str:
    with open(PROMPT_PATH, "r") as f:
        template = f.read()
    topics_str = ", ".join(expected_topics)
    return template.format(
        question=question, expected_topics=topics_str, answer=answer
    )


def evaluate_answer(question: str, expected_topics: list, answer: str) -> dict:
    if not answer or not answer.strip():
        raise ValueError("Please enter your answer.")

    prompt = _load_prompt(question, expected_topics, answer)
    raw = ask_gemini(prompt)

    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    return json.loads(cleaned)
