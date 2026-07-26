"""Comprehensive progress service for the enhanced progress page."""
from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.interview_models import QuestionAttempt, InterviewSession
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


async def get_comprehensive_progress(db: AsyncSession, user_email: str, user: Any = None) -> dict:
    """Get comprehensive progress data for the enhanced progress page."""
    
    # Fetch all attempts and sessions
    attempts_result = await db.execute(
        select(QuestionAttempt)
        .where(QuestionAttempt.user_email == user_email)
        .order_by(QuestionAttempt.created_at.asc())
    )
    all_attempts = attempts_result.scalars().all()
    
    sessions_result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_email == user_email)
        .order_by(InterviewSession.created_at.desc())
    )
    all_sessions = sessions_result.scalars().all()
    
    if not all_attempts:
        return _empty_progress(user_email, user)
    
    # 1. Overall Progress Score (0-100%)
    overall_progress = _compute_overall_progress(all_attempts, all_sessions)
    
    # 2. Interview Readiness Level
    readiness = _compute_readiness_level(overall_progress["percentage"])
    
    # 3. Performance Overview Stats
    performance_stats = _compute_performance_stats(all_attempts, all_sessions)
    
    # 4. Interview History
    interview_history = _compute_interview_history(all_sessions)
    
    # 5. Topic-wise Performance
    topic_performance = _compute_topic_performance(all_attempts)
    
    # 6. Skill Improvement (previous vs current per topic)
    skill_improvement = _compute_skill_improvement(all_attempts)
    
    # 7. Strengths (avg >= 8, at least 2 attempts)
    strengths = _compute_strengths(topic_performance, all_attempts)
    
    # 8. Areas to Improve (weakest topics)
    weaknesses = _compute_weaknesses(topic_performance)
    
    # 9. AI Coach Insights
    ai_insights = _generate_ai_insights(
        performance_stats, topic_performance, strengths, weaknesses, skill_improvement
    )
    
    # 10. Personalized Study Plan (7-day)
    study_plan = _generate_study_plan(weaknesses, strengths)
    
    # 11. Recommended Resources
    resources = _generate_resources(weaknesses)
    
    # 12. Next Goal
    next_goal = _generate_next_goal(weaknesses, performance_stats)
    
    # 13. Achievement Badges
    badges = _compute_badges(performance_stats, all_attempts, all_sessions)
    
    return {
        "user_info": {
            "email": user_email,
            "member_since": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else "",
            "target_role": performance_stats.get("most_common_role", "Software Engineer"),
            "interview_mode": "Voice & Text",
        },
        "overall_progress": overall_progress,
        "readiness": readiness,
        "performance_stats": performance_stats,
        "interview_history": interview_history,
        "topic_performance": topic_performance,
        "skill_improvement": skill_improvement,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "ai_insights": ai_insights,
        "study_plan": study_plan,
        "resources": resources,
        "next_goal": next_goal,
        "badges": badges,
    }


def _empty_progress(user_email: str, user: Any = None) -> dict:
    return {
        "user_info": {
            "email": user_email,
            "member_since": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else "",
            "target_role": "Software Engineer",
            "interview_mode": "Voice & Text",
        },
        "overall_progress": {"percentage": 0, "score": 0, "consistency": 0, "completion_rate": 0},
        "readiness": {"level": "Beginner", "stars": 1, "label": "Just Getting Started"},
        "performance_stats": {
            "interviews_completed": 0,
            "questions_answered": 0,
            "average_score": 0,
            "best_score": 0,
            "practice_time_minutes": 0,
            "practice_time_display": "0m",
            "most_common_role": "Software Engineer",
            "most_common_topic": "",
        },
        "interview_history": [],
        "topic_performance": [],
        "skill_improvement": [],
        "strengths": [],
        "weaknesses": [],
        "ai_insights": "Complete your first interview to receive personalized AI coaching insights!",
        "study_plan": [
            {"day": 1, "title": "Start Your First Interview", "description": "Begin with an AI-powered mock interview to establish your baseline performance."},
            {"day": 2, "title": "Review Your Feedback", "description": "Study your evaluation results and identify areas for improvement."},
            {"day": 3, "title": "Practice Core Topics", "description": "Focus on fundamental computer science concepts."},
            {"day": 4, "title": "Take Another Interview", "description": "Apply what you've learned in a new interview session."},
            {"day": 5, "title": "Deep Dive", "description": "Spend time on topics where you scored lowest."},
            {"day": 6, "title": "Revision", "description": "Review all previous questions and ideal answers."},
            {"day": 7, "title": "AI Mock Interview", "description": "Complete a full mock interview to measure your progress."},
        ],
        "resources": [],
        "next_goal": {
            "topic": "Complete Your First Interview",
            "current_score": 0,
            "target_score": 7,
            "estimated_hours": 2,
            "reason": "Start practicing to unlock personalized goals.",
        },
        "badges": [],
    }


def _compute_overall_progress(attempts: list, sessions: list) -> dict:
    scores = [a.score for a in attempts]
    if not scores:
        return {"percentage": 0, "score": 0, "consistency": 0, "completion_rate": 0}
    
    avg_score = sum(scores) / len(scores)
    avg_pct = (avg_score / 10) * 100
    
    # Consistency: percentage of scores >= 5
    consistency = len([s for s in scores if s >= 5]) / len(scores) * 100
    
    # Completion rate
    completed = len([s for s in sessions if s.completed])
    completion_rate = (completed / len(sessions) * 100) if sessions else 0
    
    # Weighted overall: 50% avg score, 30% consistency, 20% completion
    percentage = round(avg_pct * 0.5 + consistency * 0.3 + completion_rate * 0.2, 1)
    
    return {
        "percentage": min(100, percentage),
        "score": round(avg_score, 1),
        "consistency": round(consistency, 1),
        "completion_rate": round(completion_rate, 1),
    }


def _compute_readiness_level(overall_pct: float) -> dict:
    if overall_pct >= 85:
        return {"level": "Advanced", "stars": 5, "label": "Interview Ready"}
    elif overall_pct >= 70:
        return {"level": "Intermediate", "stars": 4, "label": "Almost There"}
    elif overall_pct >= 50:
        return {"level": "Developing", "stars": 3, "label": "Making Progress"}
    elif overall_pct >= 30:
        return {"level": "Beginner", "stars": 2, "label": "Building Foundation"}
    else:
        return {"level": "Just Starting", "stars": 1, "label": "Getting Started"}


def _compute_performance_stats(attempts: list, sessions: list) -> dict:
    scores = [a.score for a in attempts]
    
    # Count completed sessions
    completed_sessions = [s for s in sessions if s.completed]
    
    # Practice time estimation (roughly 5-10 min per question)
    total_minutes = len(attempts) * 7  # ~7 min per question avg
    hours = total_minutes // 60
    mins = total_minutes % 60
    if hours > 0:
        time_display = f"{h}h {m}m" if (h := hours) and (m := mins) else f"{hours}h"
    else:
        time_display = f"{mins}m"
    
    # Most common role and topic
    role_counts = defaultdict(int)
    topic_counts = defaultdict(int)
    for s in sessions:
        role_counts[s.role] += 1
        topic_counts[s.topic] += 1
    most_common_role = max(role_counts, key=role_counts.get) if role_counts else "Software Engineer"
    most_common_topic = max(topic_counts, key=topic_counts.get) if topic_counts else ""
    
    return {
        "interviews_completed": len(completed_sessions),
        "questions_answered": len(attempts),
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "best_score": max(scores) if scores else 0,
        "practice_time_minutes": total_minutes,
        "practice_time_display": time_display,
        "most_common_role": most_common_role,
        "most_common_topic": most_common_topic,
    }


def _compute_interview_history(sessions: list) -> list:
    history = []
    for s in sessions:
        if s.average_score and s.average_score > 0:
            history.append({
                "id": s.id,
                "date": s.created_at.isoformat() if s.created_at else "",
                "role": s.role,
                "topic": s.topic,
                "score": round(s.average_score, 1),
                "question_count": s.question_count or 0,
                "completed": bool(s.completed),
            })
    return list(reversed(history))  # chronological order


def _compute_topic_performance(attempts: list) -> list:
    topic_map = defaultdict(list)
    for a in attempts:
        for topic in (a.expected_topics or []):
            topic_map[topic].append(a.score)
    
    result = []
    for topic, scores in topic_map.items():
        avg = round(sum(scores) / len(scores), 1)
        if avg >= 8:
            status = "Strong"
            icon = "🟢"
        elif avg >= 6:
            status = "Good"
            icon = "🟡"
        elif avg >= 4:
            status = "Practice"
            icon = "🟠"
        else:
            status = "Weak"
            icon = "🔴"
        
        result.append({
            "topic": topic,
            "average": avg,
            "attempts": len(scores),
            "status": status,
            "icon": icon,
        })
    
    return sorted(result, key=lambda x: -x["average"])


def _compute_skill_improvement(attempts: list) -> list:
    if len(attempts) < 2:
        return []
    
    # Split attempts into first half and second half
    mid = len(attempts) // 2
    first_half = attempts[:mid]
    second_half = attempts[mid:]
    
    topic_first = defaultdict(list)
    topic_second = defaultdict(list)
    
    for a in first_half:
        for t in (a.expected_topics or []):
            topic_first[t].append(a.score)
    
    for a in second_half:
        for t in (a.expected_topics or []):
            topic_second[t].append(a.score)
    
    all_topics = set(list(topic_first.keys()) + list(topic_second.keys()))
    result = []
    for topic in all_topics:
        first_scores = topic_first.get(topic, [])
        second_scores = topic_second.get(topic, [])
        prev_avg = round(sum(first_scores) / len(first_scores), 1) if first_scores else 0
        curr_avg = round(sum(second_scores) / len(second_scores), 1) if second_scores else 0
        change = round(curr_avg - prev_avg, 1)
        
        if change > 0:
            trend = "up"
            trend_icon = "⬆"
        elif change < 0:
            trend = "down"
            trend_icon = "⬇"
        else:
            trend = "stable"
            trend_icon = "➡"
        
        result.append({
            "topic": topic,
            "previous": prev_avg,
            "current": curr_avg,
            "change": change,
            "trend": trend,
            "trend_icon": trend_icon,
        })
    
    return sorted(result, key=lambda x: -abs(x["change"]))


def _compute_strengths(topic_performance: list, attempts: list) -> list:
    """Get topics with avg >= 8 and at least 2 attempts."""
    strengths = []
    for t in topic_performance:
        if t["average"] >= 8 and t["attempts"] >= 2:
            strengths.append({
                "topic": t["topic"],
                "score": t["average"],
                "attempts": t["attempts"],
            })
    return strengths[:5]  # top 5


def _compute_weaknesses(topic_performance: list) -> list:
    """Get lowest scoring topics."""
    sorted_topics = sorted(topic_performance, key=lambda x: x["average"])
    weak = [t for t in sorted_topics if t["average"] < 6]
    return weak[:5]  # bottom 5


def _generate_ai_insights(
    stats: dict,
    topic_performance: list,
    strengths: list,
    weaknesses: list,
    skill_improvement: list,
) -> str:
    """Generate a concise AI coach insight paragraph."""
    parts = []
    
    if not topic_performance:
        return "Complete your first interview to receive personalized AI coaching insights!"
    
    # Overall performance
    avg = stats.get("average_score", 0)
    if avg >= 8:
        parts.append(f"You're performing exceptionally well with an average score of {avg}/10.")
    elif avg >= 6:
        parts.append(f"You're making solid progress with an average score of {avg}/10.")
    else:
        parts.append(f"You're building your foundation with an average score of {avg}/10. Consistent practice will help you improve.")
    
    # Strengths
    if strengths:
        strong_names = [s["topic"] for s in strengths[:3]]
        parts.append(f"Your strongest areas are {', '.join(strong_names[:-1])}{' and ' + strong_names[-1] if len(strong_names) > 1 else ''}.")
    
    # Improvement trends
    improving = [s for s in skill_improvement if s["change"] > 0.5]
    declining = [s for s in skill_improvement if s["change"] < -0.5]
    
    if improving:
        imp_names = [s["topic"] for s in improving[:2]]
        parts.append(f"You're showing great improvement in {', '.join(imp_names)}.")
    
    if declining:
        dec_names = [s["topic"] for s in declining[:2]]
        parts.append(f"However, scores in {', '.join(dec_names)} have dipped recently — consider revisiting these topics.")
    
    # Weak areas
    if weaknesses:
        weak_names = [w["topic"] for w in weaknesses[:3]]
        parts.append(f"Priority areas for improvement: {', '.join(weak_names)}.")
    
    # Recommendation
    if weaknesses:
        top_weak = weaknesses[0]["topic"]
        parts.append(f"Focus on mastering {top_weak} over the next week to see the biggest improvement in your overall score.")
    
    return " ".join(parts)


def _generate_study_plan(weaknesses: list, strengths: list) -> list:
    """Generate a 7-day personalized study plan based on weak topics."""
    weak_topics = [w["topic"] for w in weaknesses]
    
    if not weak_topics:
        return [
            {"day": 1, "title": "Review Core Concepts", "description": "Strengthen your understanding of fundamental topics."},
            {"day": 2, "title": "Practice Medium Difficulty", "description": "Challenge yourself with medium-level interview questions."},
            {"day": 3, "title": "Focus on System Design", "description": "Learn system design patterns and best practices."},
            {"day": 4, "title": "Algorithm Practice", "description": "Solve algorithmic problems focusing on optimization."},
            {"day": 5, "title": "Mock Interview", "description": "Take a full-length mock interview session."},
            {"day": 6, "title": "Revision", "description": "Review all topics and revisit challenging questions."},
            {"day": 7, "title": "AI Mock Interview", "description": "Complete a comprehensive AI interview assessment."},
        ]
    
    plan = []
    days_covered = set()
    day_num = 1
    
    for topic in weak_topics:
        if day_num > 7:
            break
        if topic not in days_covered:
            plan.append({
                "day": day_num,
                "title": f"Master {topic}",
                "description": f"Study core {topic} concepts, practice related problems, and review common interview questions.",
            })
            days_covered.add(topic)
            day_num += 1
    
    # Fill remaining days
    remaining_activities = [
        ("Take a Mock Interview", "Apply your knowledge in a full AI-powered mock interview session."),
        ("Review Past Mistakes", "Go through your previous answers and study the ideal responses."),
        ("Practice Communication", "Work on explaining your thought process clearly and concisely."),
        ("Deep Dive into Algorithms", "Focus on time complexity analysis and optimization techniques."),
        ("Final AI Assessment", "Complete a comprehensive interview to measure your improvement."),
    ]
    
    for title, desc in remaining_activities:
        if day_num > 7:
            break
        plan.append({"day": day_num, "title": title, "description": desc})
        day_num += 1
    
    return plan


def _generate_resources(weaknesses: list) -> list:
    """Generate learning resources for weak topics."""
    resource_map = {
        "Dynamic Programming": [
            {"platform": "NeetCode", "title": "DP Roadmap", "url": "https://neetcode.io", "reason": "Excellent step-by-step DP progression"},
            {"platform": "LeetCode", "title": "DP Practice List", "url": "https://leetcode.com", "reason": "Curated DP problems with solutions"},
        ],
        "Arrays": [
            {"platform": "GeeksforGeeks", "title": "Array Data Structure", "url": "https://geeksforgeeks.org", "reason": "Comprehensive array tutorials"},
            {"platform": "LeetCode", "title": "Array Problems", "url": "https://leetcode.com", "reason": "Practice array manipulation problems"},
        ],
        "Graphs": [
            {"platform": "NeetCode", "title": "Graph Algorithms", "url": "https://neetcode.io", "reason": "Visual graph algorithm explanations"},
            {"platform": "YouTube", "title": "Graph Theory Playlist", "url": "https://youtube.com", "reason": "Free comprehensive video tutorials"},
        ],
        "Operating Systems": [
            {"platform": "GeeksforGeeks", "title": "OS Tutorial", "url": "https://geeksforgeeks.org", "reason": "Complete OS interview preparation"},
            {"platform": "YouTube", "title": "OS Concepts", "url": "https://youtube.com", "reason": "Visual explanations of OS concepts"},
        ],
        "DBMS": [
            {"platform": "GeeksforGeeks", "title": "DBMS Notes", "url": "https://geeksforgeeks.org", "reason": "Structured DBMS interview guide"},
            {"platform": "LeetCode", "title": "SQL Problems", "url": "https://leetcode.com", "reason": "Practice real SQL interview questions"},
        ],
        "OOP": [
            {"platform": "GeeksforGeeks", "title": "OOP Concepts", "url": "https://geeksforgeeks.org", "reason": "Clear OOP explanations with examples"},
            {"platform": "YouTube", "title": "OOP Design Patterns", "url": "https://youtube.com", "reason": "Learn common design patterns"},
        ],
        "System Design": [
            {"platform": "GitHub", "title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "reason": "The best free system design resource"},
            {"platform": "YouTube", "title": "System Design Interview", "url": "https://youtube.com", "reason": "Step-by-step system design walkthroughs"},
        ],
        "Networking": [
            {"platform": "GeeksforGeeks", "title": "Computer Networks", "url": "https://geeksforgeeks.org", "reason": "Comprehensive networking guide"},
            {"platform": "YouTube", "title": "Networking Fundamentals", "url": "https://youtube.com", "reason": "Visual networking explanations"},
        ],
    }
    
    resources = []
    for w in weaknesses:
        topic = w["topic"]
        if topic in resource_map:
            for res in resource_map[topic]:
                resources.append({"topic": topic, **res})
    
    return resources


def _generate_next_goal(weaknesses: list, stats: dict) -> dict:
    """Generate the next goal based on weakest area."""
    if not weaknesses:
        return {
            "topic": "Maintain Your Skills",
            "current_score": stats.get("average_score", 0),
            "target_score": min(10, round(stats.get("average_score", 0) + 1, 1)),
            "estimated_hours": 3,
            "reason": "Keep practicing to maintain and improve your skills.",
        }
    
    weakest = weaknesses[0]
    target = min(10, round(weakest["average"] + 3, 1))
    # Estimate hours needed based on gap
    gap = target - weakest["average"]
    hours = max(2, min(8, round(gap * 1.5)))
    
    return {
        "topic": f"Improve {weakest['topic']}",
        "current_score": weakest["average"],
        "target_score": target,
        "estimated_hours": hours,
        "reason": f"Focusing on {weakest['topic']} will give you the biggest improvement in your overall interview readiness.",
    }


def _compute_badges(stats: dict, attempts: list, sessions: list) -> list:
    """Compute achievement badges based on user activity."""
    badges = []
    
    # First Interview
    completed = [s for s in sessions if s.completed]
    if completed:
        badges.append({"name": "First Interview", "icon": "🏅", "description": "Completed your first interview", "unlocked": True})
    
    # 10 Interviews
    if len(completed) >= 10:
        badges.append({"name": "Interview Veteran", "icon": "🏆", "description": "Completed 10 interviews", "unlocked": True})
    elif len(completed) >= 5:
        badges.append({"name": "Dedicated Learner", "icon": "🎯", "description": "Completed 5+ interviews", "unlocked": True})
    
    # Topic Master (any topic avg >= 9 with 3+ attempts)
    topic_map = defaultdict(list)
    for a in attempts:
        for t in (a.expected_topics or []):
            topic_map[t].append(a.score)
    
    for topic, scores in topic_map.items():
        if len(scores) >= 3 and sum(scores) / len(scores) >= 9:
            badges.append({"name": f"{topic} Master", "icon": "🌟", "description": f"Mastered {topic} with 9+ average", "unlocked": True})
            break  # only one master badge
    
    # Streak badge
    if len(sessions) >= 3:
        # Check if sessions span multiple days
        dates = set()
        for s in sessions:
            if s.created_at:
                dates.add(s.created_at.date())
        if len(dates) >= 3:
            badges.append({"name": "Consistent Practice", "icon": "🔥", "description": "Practiced on 3+ different days", "unlocked": True})
    
    # Score milestone
    scores = [a.score for a in attempts]
    if scores and max(scores) >= 9:
        badges.append({"name": "Top Performer", "icon": "💎", "description": "Scored 9+ on a question", "unlocked": True})
    
    # 50 Questions
    if len(attempts) >= 50:
        badges.append({"name": "Question Master", "icon": "📚", "description": "Answered 50+ questions", "unlocked": True})
    elif len(attempts) >= 25:
        badges.append({"name": "Active Learner", "icon": "📖", "description": "Answered 25+ questions", "unlocked": True})
    
    # Locked badges (for motivation)
    if not any(b["name"] == "Interview Veteran" for b in badges):
        badges.append({"name": "Interview Veteran", "icon": "🏆", "description": "Complete 10 interviews", "unlocked": False})
    if not any(b["name"] == "Question Master" for b in badges):
        badges.append({"name": "Question Master", "icon": "📚", "description": "Answer 50 questions", "unlocked": False})
    
    return badges[:8]  # max 8 badges

