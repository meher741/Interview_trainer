import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProgressData } from "../services/api";

function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatDateTime(dateStr) {
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

// Mini SVG Bar Chart for topic performance
function TopicBar({ label, score, maxScore = 10, color }) {
    const pct = (score / maxScore) * 100;
    return (
        <div className="topic-bar-row">
            <span className="topic-bar-label">{label}</span>
            <div className="topic-bar-track">
                <div
                    className="topic-bar-fill"
                    style={{ width: `${pct}%`, background: color || "var(--primary)" }}
                />
            </div>
            <span className="topic-bar-score">{score}/10</span>
        </div>
    );
}

// Mini SVG Line Chart for interview history
function MiniLineChart({ data }) {
    if (!data || data.length < 2) return null;
    const height = 120;
    const maxScore = 10;

    return (
        <div className="mini-chart-container">
            <svg viewBox={`0 0 ${100} ${height}`} preserveAspectRatio="none" className="mini-chart-svg">
                {/* Grid lines */}
                {[2, 4, 6, 8, 10].map((v) => (
                    <line
                        key={v}
                        x1="0"
                        y1={((maxScore - v) / maxScore) * height}
                        x2="100"
                        y2={((maxScore - v) / maxScore) * height}
                        stroke="var(--card-border)"
                        strokeWidth="0.5"
                        strokeDasharray="3,3"
                    />
                ))}
                {/* Area fill */}
                <polygon
                    points={`
                        0,${height}
                        ${data
                            .map(
                                (d, i) =>
                                    `${(i / (data.length - 1)) * 100},${((maxScore - d.score) / maxScore) * height}`
                            )
                            .join(" ")}
                        100,${height}
                    `}
                    fill="url(#chartGradient)"
                    opacity="0.15"
                />
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Line */}
                <polyline
                    points={data
                        .map((d, i) => `${(i / (data.length - 1)) * 100},${((maxScore - d.score) / maxScore) * height}`)
                        .join(" ")}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Dots */}
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={(i / (data.length - 1)) * 100}
                        cy={((maxScore - d.score) / maxScore) * height}
                        r="3.5"
                        fill="var(--primary)"
                        stroke="var(--card)"
                        strokeWidth="2"
                    />
                ))}
            </svg>
            {/* X-axis labels */}
            <div className="mini-chart-labels">
                {data.map((d, i) => (
                    <span key={i} className="mini-chart-label">
                        {formatDate(d.date).split(" ")[0]}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Progress() {
    const navigate = useNavigate();
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProgress() {
            try {
                const res = await getProgressData();
                if (res?.success && res?.data) {
                    setProgressData(res.data);
                } else {
                    setError("Unable to load progress data.");
                }
            } catch (err) {
                console.error("Failed to fetch progress:", err);
                setError("Unable to load your progress. Please complete an interview first.");
            }
            setLoading(false);
        }
        fetchProgress();
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

    if (error && !progressData) {
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

    const pd = progressData || {};
    const userInfo = pd.user_info || {};
    const overallProgress = pd.overall_progress || {};
    const readiness = pd.readiness || {};
    const stats = pd.performance_stats || {};
    const history = pd.interview_history || [];
    const topics = pd.topic_performance || [];
    const skillImp = pd.skill_improvement || [];
    const strengths = pd.strengths || [];
    const weaknesses = pd.weaknesses || [];
    const aiInsights = pd.ai_insights || "";
    const studyPlan = pd.study_plan || [];
    const resources = pd.resources || [];
    const nextGoal = pd.next_goal || {};
    const badges = pd.badges || [];

    const getTopicColor = (status) => {
        switch (status) {
            case "Strong": return "var(--success)";
            case "Good": return "var(--warning)";
            case "Practice": return "#f97316";
            case "Weak": return "var(--danger)";
            default: return "var(--primary)";
        }
    };

    return (
        <div className="page-full progress-page-enhanced fade-in-up">
            {/* ============================================ */}
            {/* SECTION 1: User Overview / Welcome Card       */}
            {/* ============================================ */}
            <div className="pro-user-card">
                <div className="pro-user-avatar">
                    {userInfo.email?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="pro-user-info">
                    <h1 className="pro-user-greeting">
                        👋 Welcome, <span className="pro-user-name">{userInfo.email?.split("@")[0] || "User"}</span>
                    </h1>
                    <div className="pro-user-meta">
                        <span>🎯 Target Role: <strong>{userInfo.target_role || "Software Engineer"}</strong></span>
                        <span>🎤 Mode: <strong>{userInfo.interview_mode || "Voice & Text"}</strong></span>
                        <span>📅 Member Since: <strong>{formatDate(userInfo.member_since) || "N/A"}</strong></span>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 2: Overall Progress                    */}
            {/* ============================================ */}
            <div className="pro-section pro-overall-section">
                <div className="pro-overall-left">
                    <h2 className="pro-section-title">Overall Progress</h2>
                    <div className="pro-overall-pct">{overallProgress.percentage || 0}%</div>
                    <div className="pro-overall-bar-bg">
                        <div
                            className="pro-overall-bar-fill"
                            style={{ width: `${overallProgress.percentage || 0}%` }}
                        />
                    </div>
                    <div className="pro-overall-stats-row">
                        <span>Avg Score: <strong>{overallProgress.score || 0}/10</strong></span>
                        <span>Consistency: <strong>{overallProgress.consistency || 0}%</strong></span>
                        <span>Completion: <strong>{overallProgress.completion_rate || 0}%</strong></span>
                    </div>
                </div>
                <div className="pro-overall-right">
                    <div className="pro-readiness-badge">
                        <div className="pro-readiness-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={`pro-star ${star <= (readiness.stars || 1) ? "filled" : ""}`}>★</span>
                            ))}
                        </div>
                        <div className="pro-readiness-label">{readiness.label || "Getting Started"}</div>
                        <div className="pro-readiness-level">{readiness.level || "Beginner"}</div>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 3: Performance Overview (Stats Cards)  */}
            {/* ============================================ */}
            <div className="pro-section">
                <h2 className="pro-section-title">📈 Performance Overview</h2>
                <div className="pro-stats-grid">
                    <div className="pro-stat-card">
                        <div className="pro-stat-icon">🎤</div>
                        <div className="pro-stat-value">{stats.interviews_completed || 0}</div>
                        <div className="pro-stat-label">Interviews</div>
                    </div>
                    <div className="pro-stat-card accent-gold">
                        <div className="pro-stat-icon">⭐</div>
                        <div className="pro-stat-value">{stats.average_score || 0}</div>
                        <div className="pro-stat-label">Avg Score</div>
                    </div>
                    <div className="pro-stat-card accent-purple">
                        <div className="pro-stat-icon">❓</div>
                        <div className="pro-stat-value">{stats.questions_answered || 0}</div>
                        <div className="pro-stat-label">Questions</div>
                    </div>
                    <div className="pro-stat-card accent-cyan">
                        <div className="pro-stat-icon">⏱</div>
                        <div className="pro-stat-value">{stats.practice_time_display || "0m"}</div>
                        <div className="pro-stat-label">Practice Time</div>
                    </div>
                    <div className="pro-stat-card accent-rose">
                        <div className="pro-stat-icon">💎</div>
                        <div className="pro-stat-value">{stats.best_score || 0}</div>
                        <div className="pro-stat-label">Best Score</div>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 4: Interview History (Table + Chart)  */}
            {/* ============================================ */}
            <div className="pro-section">
                <h2 className="pro-section-title">📅 Interview History</h2>
                {history.length > 1 && (
                    <div className="pro-chart-wrapper">
                        <MiniLineChart data={history} />
                    </div>
                )}
                {history.length > 0 ? (
                    <div className="pro-history-table-wrap">
                        <table className="pro-history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Role</th>
                                    <th>Topic</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.slice(-10).reverse().map((h) => (
                                    <tr key={h.id}>
                                        <td>{formatDate(h.date)}</td>
                                        <td>{h.role}</td>
                                        <td>{h.topic}</td>
                                        <td>
                                            <span className={`pro-score-badge ${h.score >= 7 ? "good" : h.score >= 5 ? "avg" : "poor"}`}>
                                                {h.score}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="pro-empty-text">No interviews completed yet. Start your first interview!</p>
                )}
            </div>

            {/* ============================================ */}
            {/* SECTION 5: Topic-wise Performance (Bar Chart)  */}
            {/* ============================================ */}
            <div className="pro-section">
                <h2 className="pro-section-title">📚 Topic-wise Performance</h2>
                {topics.length > 0 ? (
                    <div className="pro-topic-bars">
                        {topics.map((t) => (
                            <div key={t.topic} className="topic-bar-row">
                                <span className="topic-bar-label">
                                    {t.icon || "📘"} {t.topic}
                                </span>
                                <div className="topic-bar-track">
                                    <div
                                        className="topic-bar-fill"
                                        style={{
                                            width: `${(t.average / 10) * 100}%`,
                                            background: getTopicColor(t.status),
                                        }}
                                    />
                                </div>
                                <span className="topic-bar-score" style={{ color: getTopicColor(t.status) }}>
                                    {t.average}/10
                                    <span className="topic-bar-status"> {t.status}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="pro-empty-text">Answer some questions to see your topic-wise performance.</p>
                )}
            </div>

            {/* ============================================ */}
            {/* SECTION 6: Skill Improvement (Previous vs Current) */}
            {/* ============================================ */}
            {skillImp.length > 0 && (
                <div className="pro-section">
                    <h2 className="pro-section-title">📊 Skill Improvement</h2>
                    <div className="pro-skill-grid">
                        {skillImp.map((s) => (
                            <div key={s.topic} className={`pro-skill-card trend-${s.trend}`}>
                                <div className="pro-skill-topic">{s.topic}</div>
                                <div className="pro-skill-scores">
                                    <span className="pro-skill-prev">{s.previous}</span>
                                    <span className="pro-skill-arrow">→</span>
                                    <span className="pro-skill-curr">{s.current}</span>
                                    <span className={`pro-skill-change ${s.trend === "up" ? "positive" : s.trend === "down" ? "negative" : ""}`}>
                                        {s.trend_icon} {s.change > 0 ? "+" : ""}{s.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* SECTION 7: Strengths                           */}
            {/* ============================================ */}
            {strengths.length > 0 && (
                <div className="pro-section">
                    <h2 className="pro-section-title" style={{ color: "var(--success)" }}>💪 Strengths</h2>
                    <div className="pro-tag-list">
                        {strengths.map((s) => (
                            <div key={s.topic} className="pro-tag success">
                                <span className="pro-tag-icon">✔</span>
                                <span>{s.topic}</span>
                                <span className="pro-tag-score">{s.score}/10</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* SECTION 8: Areas to Improve                     */}
            {/* ============================================ */}
            {weaknesses.length > 0 && (
                <div className="pro-section">
                    <h2 className="pro-section-title" style={{ color: "var(--danger)" }}>⚠ Areas to Improve</h2>
                    <div className="pro-tag-list">
                        {weaknesses.map((w) => (
                            <div key={w.topic} className="pro-tag danger">
                                <span className="pro-tag-icon">⚠</span>
                                <span>{w.topic}</span>
                                <span className="pro-tag-score">{w.average}/10</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* SECTION 9: AI Coach Insights                    */}
            {/* ============================================ */}
            <div className="pro-section pro-ai-section">
                <h2 className="pro-section-title">🤖 AI Coach Insights</h2>
                <div className="pro-ai-card">
                    <div className="pro-ai-icon">🧠</div>
                    <p className="pro-ai-text">{aiInsights}</p>
                </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 10: Personalized Study Plan (7-day)     */}
            {/* ============================================ */}
            <div className="pro-section">
                <h2 className="pro-section-title">📅 Personalized Study Plan</h2>
                <div className="pro-study-plan">
                    {studyPlan.map((day) => (
                        <div key={day.day} className="pro-study-day">
                            <div className="pro-study-day-num">Day {day.day}</div>
                            <div className="pro-study-day-content">
                                <div className="pro-study-day-title">{day.title}</div>
                                <div className="pro-study-day-desc">{day.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 11: Recommended Resources                */}
            {/* ============================================ */}
            {resources.length > 0 && (
                <div className="pro-section">
                    <h2 className="pro-section-title">📘 Recommended Resources</h2>
                    <div className="pro-resources-grid">
                        {resources.map((res, i) => (
                            <div key={i} className="pro-resource-card">
                                <div className="pro-resource-topic">{res.topic}</div>
                                <div className="pro-resource-platform">{res.platform}</div>
                                <div className="pro-resource-title">{res.title}</div>
                                <div className="pro-resource-reason">{res.reason}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* SECTION 12: Next Goal                          */}
            {/* ============================================ */}
            {nextGoal.topic && (
                <div className="pro-section">
                    <h2 className="pro-section-title">🎯 Next Goal</h2>
                    <div className="pro-goal-card">
                        <div className="pro-goal-topic">{nextGoal.topic}</div>
                        <div className="pro-goal-progress">
                            <div className="pro-goal-current">
                                <span className="pro-goal-label">Current</span>
                                <span className="pro-goal-value">{nextGoal.current_score}/10</span>
                            </div>
                            <div className="pro-goal-bar-bg">
                                <div className="pro-goal-bar-fill" style={{ width: `${(nextGoal.current_score / nextGoal.target_score) * 100}%` }} />
                            </div>
                            <div className="pro-goal-target">
                                <span className="pro-goal-label">Target</span>
                                <span className="pro-goal-value">{nextGoal.target_score}/10</span>
                            </div>
                        </div>
                        <div className="pro-goal-meta">
                            <span>⏱ Estimated: <strong>{nextGoal.estimated_hours} hours</strong></span>
                            <span className="pro-goal-reason">{nextGoal.reason}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* SECTION 13: Achievement Badges                   */}
            {/* ============================================ */}
            {badges.length > 0 && (
                <div className="pro-section">
                    <h2 className="pro-section-title">🏆 Achievement Badges</h2>
                    <div className="pro-badges-grid">
                        {badges.map((badge, i) => (
                            <div key={i} className={`pro-badge-card ${badge.unlocked ? "unlocked" : "locked"}`}>
                                <div className="pro-badge-icon">{badge.unlocked ? badge.icon : "🔒"}</div>
                                <div className="pro-badge-name">{badge.name}</div>
                                <div className="pro-badge-desc">{badge.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* ACTIONS                                       */}
            {/* ============================================ */}
            <div className="pro-actions">
                <button className="btn btn-primary" onClick={() => navigate("/")}>
                    🚀 Start New Interview
                </button>
                <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
                    📊 View Dashboard
                </button>
            </div>
        </div>
    );
}

