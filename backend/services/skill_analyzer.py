from collections import Counter
from models.interview_session import SessionQuestion


def analyze(questions: list[SessionQuestion]) -> dict:
    weak = Counter()
    strong = Counter()

    for q in questions:
        for topic in q.expected_topics:
            if q.score < 6:
                weak[topic] += 1
            elif q.score >= 7:
                strong[topic] += 1

    weak_topics = [t for t, _ in weak.most_common(5)]
    strong_topics = [t for t, _ in strong.most_common(5)]

    return {"weak_topics": weak_topics, "strong_topics": strong_topics}
