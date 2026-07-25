from collections import defaultdict
from models.interview_session import SessionQuestion


def calculate(questions: list[SessionQuestion]) -> dict:
    if not questions:
        return {
            "overall_score": 0,
            "average_score": 0,
            "questions_answered": 0,
            "highest_score": 0,
            "lowest_score": 0,
            "easy_count": 0,
            "medium_count": 0,
            "hard_count": 0,
            "topic_performance": [],
        }

    scores = [q.score for q in questions]
    topic_map = defaultdict(list)

    for q in questions:
        for topic in q.expected_topics:
            topic_map[topic].append(q.score)

    topic_performance = [
        {"topic": topic, "average": round(sum(scores_list) / len(scores_list), 1)}
        for topic, scores_list in sorted(topic_map.items(), key=lambda x: -sum(x[1]) / len(x[1]))
    ]

    return {
        "overall_score": round(sum(scores) / len(scores), 1),
        "average_score": round(sum(scores) / len(scores), 1),
        "questions_answered": len(questions),
        "highest_score": max(scores),
        "lowest_score": min(scores),
        "easy_count": sum(1 for q in questions if q.difficulty == "Easy"),
        "medium_count": sum(1 for q in questions if q.difficulty == "Medium"),
        "hard_count": sum(1 for q in questions if q.difficulty == "Hard"),
        "topic_performance": topic_performance,
    }

