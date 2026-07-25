from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.interview_models import QuestionAttempt


async def get_progress_report(db: AsyncSession, user_email: str) -> dict:
    result = await db.execute(
        select(QuestionAttempt)
        .where(QuestionAttempt.user_email == user_email)
        .order_by(QuestionAttempt.created_at.asc())
    )
    all_attempts = result.scalars().all()

    if not all_attempts:
        return {
            "overall_progress": 0,
            "topic_progress": [],
            "difficulty_progress": [],
            "score_distribution": [],
            "improvement_rate": 0,
            "consistency_score": 0,
        }

    scores = [a.score for a in all_attempts]
    first_half = scores[:len(scores)//2] if len(scores) >= 2 else scores
    second_half = scores[len(scores)//2:] if len(scores) >= 2 else scores
    first_avg = sum(first_half) / len(first_half) if first_half else 0
    second_avg = sum(second_half) / len(second_half) if second_half else 0
    improvement = round(second_avg - first_avg, 1)

    topic_map = defaultdict(list)
    for a in all_attempts:
        for t in (a.expected_topics or []):
            topic_map[t].append(a.score)

    first_half_count = len(all_attempts) // 2
    topic_progress = []
    for topic, topic_scores in topic_map.items():
        t_first = topic_scores[:len(topic_scores)//2] or topic_scores
        t_second = topic_scores[len(topic_scores)//2:] or topic_scores
        t_first_avg = sum(t_first) / len(t_first) if t_first else 0
        t_second_avg = sum(t_second) / len(t_second) if t_second else 0
        topic_progress.append({
            "topic": topic,
            "first_half_avg": round(t_first_avg, 1),
            "second_half_avg": round(t_second_avg, 1),
            "improvement": round(t_second_avg - t_first_avg, 1),
        })

    diff_map = defaultdict(list)
    for a in all_attempts:
        diff_map[a.difficulty].append(a.score)
    difficulty_progress = [
        {"difficulty": diff, "average": round(sum(s) / len(s), 1), "count": len(s)}
        for diff, s in sorted(diff_map.items(), key=lambda x: ["Easy", "Medium", "Hard"].index(x[0]) if x[0] in ["Easy", "Medium", "Hard"] else 99)
    ]

    score_dist = {"0-3": 0, "4-5": 0, "6-7": 0, "8-10": 0}
    for s in scores:
        if s <= 3: score_dist["0-3"] += 1
        elif s <= 5: score_dist["4-5"] += 1
        elif s <= 7: score_dist["6-7"] += 1
        else: score_dist["8-10"] += 1
    score_distribution = [{"range": k, "count": v} for k, v in score_dist.items()]

    consistency = round(len([s for s in scores if s >= 5]) / len(scores) * 100, 1) if scores else 0

    return {
        "overall_progress": improvement,
        "topic_progress": topic_progress,
        "difficulty_progress": difficulty_progress,
        "score_distribution": score_distribution,
        "improvement_rate": improvement,
        "consistency_score": consistency,
    }
