DIFFICULTIES = ["Easy", "Medium", "Hard"]


def next_difficulty(average_score: float, weak_topics: list) -> str:
    if average_score >= 8 and not weak_topics:
        return "Hard"
    if average_score >= 5:
        return "Medium"
    return "Easy"
