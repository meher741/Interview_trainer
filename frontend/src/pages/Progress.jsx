import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardAnalytics, getInterviewHistory, getRecommendations } from "../services/api";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import TopicChart from "../components/dashboard/TopicChart";

function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

export default function Progress() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [history, setHistory] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        async function fetchAll() {
            try {
                const [analyticsRes, historyRes, recsRes] = await Promise.all([
                    getDashboardAnalytics(),
                    getInterviewHistory(),
                    getRecommendations(),
                ]);

                if (analyticsRes?.success) setAnalytics(analyticsRes.data);
                if (historyRes?.success) setHistory(historyRes.data);
                if (recsRes?.success) setRecommendations(recsRes.data);
            } catch (err) {
                console.error("Failed to fetch progress data:", err);
                setError("Unable to load your progress. Please complete an interview first.");
            }
            setLoading(false);
        }
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="page-full fade-in-up">
                <div className="loading">
                    <div className="spinner" />
                    <p>Loading your progress...</p>
                </div>
            </div>
        );
    }

    if (error && !analytics) {
        return (
            <div className="page-full fade-in-up">
                <div className="dash-empty-card fade-in-up">
                    <div className="dash-empty-icon">📊</div>
                    <h2>No Progress Data Yet</h2>
                    <p className="dash-empty-text">
                        Complete a few AI-powered interviews to see your progress, trends, and personalized recommendations.
                    </p>
                    {error && <div className="error-box">{error}</div>}
                    <div className="actions" style={{ justifyContent: "center", marginTop: 12 }}>
                        <button className="btn btn-primary btn-start" onClick={() => navigate("/")}>
                            🚀 Start Interview
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = analytics?.stats || {};
    const topicPerf = analytics?.topic_performance || [];
    const weakTopics = analytics?.weak_topics || [];
    const strongTopics = analytics?.strong_topics || [];
    const trend = analytics?.improvement_trend || [];
    const streak = analytics?.learning_streak || {};
    const progress = analytics?.progress || {};
    const sessions = history?.sessions || [];

    return (
        <div className="page-full progress-page fade-in-up">
            <div className="progress-header">
                <h1>📈 My Progress</h1>
                <p className="progress-subtitle">
                    Track your improvement across all interview sessions
                </p>
            </div>

            {/* Streak Banner */}
            {streak?.current_streak > 0 && (
                <div className="dash-streak-banner fade-in-up" style={{ marginBottom: 16 }}>
                    🔥 <strong>{streak.current_streak} day streak</strong> · {streak.total_practice_days} total practice days · Best: {streak.longest_streak} days
                </div>
            )}

            {/* Summary Stats */}
            <div className="progress-stats-grid">
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{stats.total_questions || 0}</div>
                    <div className="progress-stat-label">Total Questions</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{stats.average_score || 0}/10</div>
                    <div className="progress-stat-label">Average Score</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{stats.sessions_count || 0}</div>
                    <div className="progress-stat-label">Sessions</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value" style={{ color: progress.consistency_score >= 70 ? "#27ae60" : "#f39c12" }}>
                        {progress.consistency_score || 0}%
                    </div>
                    <div className="progress-stat-label">Consistency</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value" style={{ color: progress.improvement_rate >= 0 ? "#27ae60" : "#e74c3c" }}>
                        {progress.improvement_rate > 0 ? "+" : ""}{progress.improvement_rate || 0}
                    </div>
                    <div className="progress-stat-label">Improvement</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{streak.total_practice_days || 0}</div>
                    <div className="progress-stat-label">Practice Days</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="progress-tabs">
                <button
                    className={`progress-tab ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    📊 Overview
                </button>
                <button
                    className={`progress-tab ${activeTab === "topics" ? "active" : ""}`}
                    onClick={() => setActiveTab("topics")}
                >
                    📚 Topics
                </button>
                <button
                    className={`progress-tab ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                >
                    📋 History
                </button>
                <button
                    className={`progress-tab ${activeTab === "recommendations" ? "active" : ""}`}
                    onClick={() => setActiveTab("recommendations")}
                >
                    💡 Recommendations
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="progress-tab-content">
                    <PerformanceChart trend={trend} />

                    {progress.score_distribution && progress.score_distribution.length > 0 && (
                        <div className="dash-chart-card fade-in-up">
                            <h3 className="dash-chart-title">📊 Score Distribution</h3>
                            <div className="progress-score-dist">
                                {progress.score_distribution.map((item) => (
                                    <div key={item.range} className="progress-score-bar-wrap">
                                        <div className="progress-score-label">
                                            <span>{item.range}</span>
                                            <span>{item.count} questions</span>
                                        </div>
                                        <div className="progress-score-bar-bg">
                                            <div
                                                className="progress-score-bar-fill"
                                                style={{
                                                    width: `${Math.min(100, (item.count / Math.max(...progress.score_distribution.map(d => d.count))) * 100)}%`,
                                                    background: item.range === "8-10" ? "#27ae60" : item.range === "6-7" ? "#3498db" : item.range === "4-5" ? "#f39c12" : "#e74c3c",
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {progress.difficulty_progress && progress.difficulty_progress.length > 0 && (
                        <div className="dash-chart-card fade-in-up">
                            <h3 className="dash-chart-title">⚡ Difficulty Breakdown</h3>
                            <div className="progress-diff-grid">
                                {progress.difficulty_progress.map((d) => (
                                    <div key={d.difficulty} className="progress-diff-item">
                                        <span className={`badge badge-${d.difficulty.toLowerCase()}`}>
                                            {d.difficulty === "Easy" ? "🟢" : d.difficulty === "Medium" ? "🟡" : "🔴"} {d.difficulty}
                                        </span>
                                        <div className="progress-diff-score">{d.average}/10</div>
                                        <div className="progress-diff-count">{d.count} questions</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "topics" && (
                <div className="progress-tab-content">
                    <TopicChart topicPerformance={topicPerf} />

                    {weakTopics.length > 0 && (
                        <div className="dash-report-section fade-in-up">
                            <h3 className="dash-report-title" style={{ color: "#e74c3c" }}>🔴 Need Practice</h3>
                            <div className="progress-topics-list">
                                {weakTopics.map((topic) => (
                                    <div key={topic} className="progress-topic-item weak">
                                        <span>📚 {topic}</span>
                                        <span className="progress-topic-status poor">Focus Needed</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {strongTopics.length > 0 && (
                        <div className="dash-report-section fade-in-up">
                            <h3 className="dash-report-title" style={{ color: "#27ae60" }}>🟢 Strong Areas</h3>
                            <div className="progress-topics-list">
                                {strongTopics.map((topic) => (
                                    <div key={topic} className="progress-topic-item strong">
                                        <span>📚 {topic}</span>
                                        <span className="progress-topic-status good">Mastered</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "history" && (
                <div className="progress-tab-content">
                    {sessions.length === 0 ? (
                        <div className="dash-empty-card" style={{ marginTop: 0 }}>
                            <p>No interview sessions yet.</p>
                        </div>
                    ) : (
                        <div className="progress-sessions-list">
                            {sessions.map((session) => (
                                <div key={session.id} className="progress-session-card fade-in-up">
                                    <div className="progress-session-header">
                                        <div>
                                            <strong>{session.role}</strong> — {session.topic}
                                        </div>
                                        <span className={`progress-session-score ${session.average_score >= 7 ? "good" : session.average_score >= 5 ? "avg" : "poor"}`}>
                                            {session.average_score}
                                        </span>
                                    </div>
                                    <div className="progress-session-meta">
                                        <span>📅 {formatDate(session.created_at)}</span>
                                        <span>❓ {session.question_count} questions</span>
                                        <span>{session.completed ? "✅ Completed" : "⏳ In Progress"}</span>
                                    </div>
                                    {session.attempts && session.attempts.length > 0 && (
                                        <details className="progress-session-details">
                                            <summary>View Questions ({session.attempts.length})</summary>
                                            <div className="progress-attempts-list">
                                                {session.attempts.map((attempt) => (
                                                    <div key={attempt.id} className="progress-attempt-item">
                                                        <div className="progress-attempt-question">
                                                            <span className={`score-badge-sm ${attempt.score >= 7 ? "good" : attempt.score >= 5 ? "avg" : "poor"}`}>
                                                                {attempt.score}
                                                            </span>
                                                            {attempt.question_text?.substring(0, 80)}...
                                                        </div>
                                                        <div className="progress-attempt-meta">
                                                            <span className={`badge badge-${(attempt.difficulty || "easy").toLowerCase()}`}>
                                                                {attempt.difficulty}
                                                            </span>
                                                            <span className="progress-attempt-topics">
                                                                {attempt.expected_topics?.slice(0, 3).join(", ")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "recommendations" && (
                <div className="progress-tab-content">
                    {!recommendations ? (
                        <div className="dash-empty-card" style={{ marginTop: 0 }}>
                            <p>Complete more practice to get AI-powered recommendations.</p>
                        </div>
                    ) : (
                        <>
                            {/* Priority Topics */}
                            {recommendations.priority_topics && recommendations.priority_topics.length > 0 && (
                                <div className="dash-report-section fade-in-up">
                                    <h3 className="dash-report-title">🎯 Priority Topics</h3>
                                    <div className="progress-recs-list">
                                        {recommendations.priority_topics.map((topic, i) => (
                                            <div key={i} className="progress-rec-item">
                                                <div className="progress-rec-topic">{topic.topic}</div>
                                                <div className="progress-rec-reason">{topic.reason}</div>
                                                {topic.concepts && topic.concepts.length > 0 && (
                                                    <div className="progress-rec-concepts">
                                                        {topic.concepts.map((c, j) => (
                                                            <span key={j} className="progress-rec-concept-badge">{c}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resources */}
                            {recommendations.resources && recommendations.resources.length > 0 && (
                                <div className="dash-report-section fade-in-up">
                                    <h3 className="dash-report-title">📚 Recommended Resources</h3>
                                    <div className="progress-recs-list">
                                        {recommendations.resources.map((res, i) => (
                                            <div key={i} className="progress-rec-item">
                                                <div className="progress-rec-topic">{res.platform} — {res.title}</div>
                                                <div className="progress-rec-reason">{res.reason}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Weekly Schedule */}
                            {recommendations.weekly_schedule && (
                                <div className="dash-report-section fade-in-up">
                                    <h3 className="dash-report-title">📅 Weekly Schedule</h3>
                                    <div className="progress-recs-schedule">{recommendations.weekly_schedule}</div>
                                </div>
                            )}

                            {/* Interview Tips */}
                            {recommendations.interview_tips && recommendations.interview_tips.length > 0 && (
                                <div className="dash-report-section fade-in-up">
                                    <h3 className="dash-report-title">💡 Interview Tips</h3>
                                    <ul className="progress-recs-tips">
                                        {recommendations.interview_tips.map((tip, i) => (
                                            <li key={i}>✨ {tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Readiness Estimate */}
                            {recommendations.estimated_readiness && (
                                <div className="dash-report-section fade-in-up">
                                    <h3 className="dash-report-title">⏱️ Readiness Estimate</h3>
                                    <div className="progress-recs-readiness">{recommendations.estimated_readiness}</div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="actions" style={{ marginTop: 24 }}>
                <button className="btn btn-primary" onClick={() => navigate("/")}>
                    🚀 Start New Interview
                </button>
                <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
                    📊 Back to Dashboard
                </button>
            </div>
        </div>
    );
}
