import os
import json
from models.interview_session import SessionQuestion
from services.analytics_service import calculate
from services.groq_service import ask_groq

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "report_prompt.txt")


def _build_history(questions: list[SessionQuestion]) -> str:
    lines = []
    for i, q in enumerate(questions, 1):
        lines.append(
            f"Q{i}: [{q.difficulty}] {q.question} | Score: {q.score}/10 | "
            f"Topics: {', '.join(q.expected_topics)} | Missing: {', '.join(q.missing_topics)}"
        )
    return "\n".join(lines)


def _build_topic_scores(questions: list[SessionQuestion]) -> str:
    from collections import defaultdict
    topic_map = defaultdict(list)
    for q in questions:
        for t in q.expected_topics:
            topic_map[t].append(q.score)
    return "\n".join(
        f"- {topic}: {round(sum(s)/len(s), 1)}/10"
        for topic, s in sorted(topic_map.items(), key=lambda x: -sum(x[1]) / len(x[1]))
    )


def generate_report(role: str, topic: str, questions: list[SessionQuestion]) -> dict:
    stats = calculate(questions)

    with open(PROMPT_PATH, "r") as f:
        template = f.read()

    prompt = template.format(
        history=_build_history(questions),
        role=role,
        topic=topic,
        question_count=stats["questions_answered"],
        average_score=stats["average_score"],
        highest_score=stats["highest_score"],
        lowest_score=stats["lowest_score"],
        topic_scores=_build_topic_scores(questions),
    )

    raw = ask_groq(prompt)
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    report = json.loads(cleaned)
    report["stats"] = stats
    return report
