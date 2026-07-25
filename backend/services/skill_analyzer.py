from models.interview_session import SessionQuestion
from typing import List, Dict


def analyze(questions: List[SessionQuestion]) -> Dict[str, List[str]]:
    if not questions:
        return {"weak_topics": [], "strong_topics": []}

    topic_scores = {}
    for q in questions:
        for topic in q.expected_topics:
            if topic not in topic_scores:
                topic_scores[topic] = []
            topic_scores[topic].append(q.score)

    avg_scores = {
        topic: sum(scores) / len(scores) for topic, scores in topic_scores.items()
    }

    # Define thresholds for strong and weak topics
    # For example, above 75% is strong, below 50% is weak
    # But we don't have the total possible score, so we assume the score is out of 10?
    # In the SessionQuestion, score is an int, but we don't know the scale.
    # Looking at the dashboard, it seems the score is out of 10? 
    # In the SessionQuestion, the score is an integer, and in the dashboard we use it as is.
    # We'll assume the score is out of 10 for now.
    # We'll adjust the thresholds accordingly.
    strong_threshold = 7.5  # 75% of 10
    weak_threshold = 5.0    # 50% of 10

    strong_topics = [topic for topic, avg in avg_scores.items() if avg >= strong_threshold]
    weak_topics = [topic for topic, avg in avg_scores.items() if avg < weak_threshold]

    return {"weak_topics": weak_topics, "strong_topics": strong_topics}