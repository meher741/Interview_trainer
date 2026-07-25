import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateDashboard, getDashboardAnalytics, finishInterview } from "../services/api";
import { useEffect, useState, useCallback, useRef } from "react";
import useConfetti from "../hooks/useConfetti";

import DashboardHeader from "../components/dashboard/Header";
import ScoreCard from "../components/dashboard/ScoreCard";
import StatsCards from "../components/dashboard/StatsCards";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import TopicChart from "../components/dashboard/TopicChart";
import DifficultyBreakdown from "../components/dashboard/DifficultyBreakdown";
import ReportSection from "../components/dashboard/ReportSection";
import ResourceCard from "../components/dashboard/ResourceCard";
import { useAuth } from "../context/AuthContext";

function formatSpeakingTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function Dashboard() {
  const { state, resetInterview } = useInterview();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const canvasRef = useConfetti(celebrate, { count: 120, spread: 120 });
  const sessionFinalized = useRef(false);

  const hasInterviewData = state.questions && state.questions.length > 0;

  const fetchDashboard = useCallback(async () => {
    try {
      // 1. If we have an active session, finish it first
      if (state.sessionId && !sessionFinalized.current) {
        sessionFinalized.current = true;
        try {
          await finishInterview(state.sessionId);
        } catch (err) {
          console.warn("Failed to finish session:", err);
        }
      }

      // 2. Try to fetch analytics data from DB (for logged-in users with history)
      let analytics = null;
      if (currentUser) {
        try {
          const analyticsRes = await getDashboardAnalytics();
          if (analyticsRes?.success && analyticsRes?.data) {
            analytics = analyticsRes.data;
            setAnalyticsData(analytics);
          }
        } catch (analyticsErr) {
          console.warn("Analytics fetch failed (proceeding with session data):", analyticsErr);
        }
      }

      // 3. If we have in-memory interview data, also generate the session dashboard
      if (hasInterviewData) {
        const res = await generateDashboard(state.role, state.topic, state.questions);
        if (res && res.success && res.data) {
          setData(res.data);
          if (res.data.stats && res.data.stats.overall_score >= 7) setCelebrate(true);
        } else {
          setApiError("Invalid response from server.");
        }
      } else if (!analytics) {
        // No session data and no analytics — show empty state
        setData(null);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setApiError("Unable to load dashboard. Please try again.");
    }
    setLoading(false);
  }, [hasInterviewData, state.role, state.topic, state.questions, state.sessionId, currentUser]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="page-full fade-in-up">
        <div className="loading">
          <div className="spinner" />
          <p>Generating your personalized report...</p>
          <p style={{ fontSize: 13, color: "var(--text-light)", marginTop: 4 }}>
            Analyzing your responses
          </p>
        </div>
      </div>
    );
  }

  if (!hasInterviewData && !analyticsData && !loading) {
    return (
      <div className="dashboard-page page-full fade-in-up">
        <div className="dash-empty-card fade-in-up">
          <div className="dash-empty-icon">📊</div>
          <h2>No Interview Data Yet</h2>
          <p className="dash-empty-text">
            Complete an AI-powered interview to see your personalized performance
            dashboard with scores, insights, and recommendations.
          </p>
          <div className="dash-empty-features">
            <div className="dash-empty-feature">
              <span className="dash-ef-icon">🎯</span>
              <span>Real-time scoring</span>
            </div>
            <div className="dash-empty-feature">
              <span className="dash-ef-icon">🧠</span>
              <span>AI feedback on answers</span>
            </div>
            <div className="dash-empty-feature">
              <span className="dash-ef-icon">📈</span>
              <span>Performance analytics</span>
            </div>
            <div className="dash-empty-feature">
              <span className="dash-ef-icon">📚</span>
              <span>Personalized resources</span>
            </div>
            {apiError && <div className="error-box shake">{apiError}</div>}
            <div className="actions" style={{ justifyContent: "center", marginTop: 12 }}>
              <button className="btn btn-primary btn-start" onClick={() => navigate("/")}>
                🚀 Start Your First Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = data && data.stats ? data.stats : {};
  const report = data && data.report ? data.report : {};
  const resources = data && data.resources ? data.resources : [];
  const history = data && data.history ? data.history : (state.questions || []);

  // Use analytics data to enrich the display
  const analyticsStats = analyticsData?.stats || null;
  const topicPerf = analyticsData?.topic_performance || stats.topic_performance || [];
  const weakTopics = analyticsData?.weak_topics || report.weaknesses || [];
  const strongTopics = analyticsData?.strong_topics || report.strengths || [];
  const improvementTrend = analyticsData?.improvement_trend || [];
  const learningStreak = analyticsData?.learning_streak || null;
  const progressData = analyticsData?.progress || null;
  const recentSessions = analyticsData?.recent_sessions || [];

  // Merge stats: prefer session data, fallback to analytics
  const displayStats = {
    overall_score: stats.overall_score || analyticsStats?.average_score || 0,
    average_score: stats.average_score || analyticsStats?.average_score || 0,
    questions_answered: stats.questions_answered || analyticsStats?.total_questions || 0,
    highest_score: stats.highest_score || 0,
    lowest_score: stats.lowest_score || 0,
    easy_count: stats.easy_count || 0,
    medium_count: stats.medium_count || 0,
    hard_count: stats.hard_count || 0,
    sessions_count: analyticsStats?.sessions_count || 0,
    total_score: analyticsStats?.total_score || stats.total_score || 0,
  };

  return (
    <div className="dashboard-page page-full">
      <canvas ref={canvasRef} className="confetti-canvas" />

      <DashboardHeader
        role={data && data.role ? data.role : state.role}
        topic={data && data.topic ? data.topic : state.topic}
        questionCount={displayStats.questions_answered}
      />

      {/* Learning Streak Banner */}
      {learningStreak && learningStreak.current_streak > 0 && (
        <div className="dash-streak-banner fade-in-up">
          🔥 {learningStreak.current_streak} day streak · {learningStreak.total_practice_days} total practice days
        </div>
      )}

      <div className="dash-top-row">
        <div className="dash-top-score">
          <ScoreCard overallScore={displayStats.overall_score} />
        </div>
        <div className="dash-top-stats">
          <StatsCards stats={displayStats} />

          {state.interviewMode === "voice" && state.voiceStats && state.voiceStats.questionsAnswered > 0 && (
            <div className="dash-voice-strip">
              <span className="dash-voice-chip">🎤 {state.voiceStats.questionsAnswered} answered</span>
              <span className="dash-voice-chip">⏱️ {formatSpeakingTime(state.voiceStats.speakingTimeTotal)} speaking</span>
              <span className="dash-voice-chip">📊 {state.voiceStats.averageResponseTime}s avg response</span>
            </div>
          )}

          {/* Progress info */}
          {progressData && (
            <div className="dash-progress-strip">
              <span className="dash-progress-chip">📈 Improvement: {progressData.improvement_rate > 0 ? '+' : ''}{progressData.improvement_rate}</span>
              <span className="dash-progress-chip">🎯 Consistency: {progressData.consistency_score}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="dash-charts-row-h">
        <PerformanceChart questions={history} trend={improvementTrend} />
        <DifficultyBreakdown stats={displayStats} />
        <TopicChart topicPerformance={topicPerf} />
      </div>

      {report.summary && (
        <div className="dash-report-section fade-in-up">
          <h3 className="dash-report-title">AI Summary</h3>
          <div className="dash-summary-text">{report.summary}</div>
        </div>
      )}

      <div className="dash-report-grid-3col">
        <ReportSection title="Strengths" items={strongTopics.length > 0 ? strongTopics : (report.strengths || [])} type="strengths" />
        <ReportSection title="Areas to Improve" items={weakTopics.length > 0 ? weakTopics : (report.weaknesses || [])} type="weaknesses" />
        <ReportSection title="Recommendations" items={report.recommendations || []} type="recommendations" />
      </div>

      {/* Recent Sessions History */}
      {recentSessions.length > 0 && (
        <div className="dash-recent-sessions fade-in-up">
          <h3 className="dash-report-title">📋 Recent Sessions</h3>
          <div className="dash-sessions-list">
            {recentSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="dash-session-item">
                <div className="dash-session-info">
                  <strong>{session.role}</strong> — {session.topic}
                  <br />
                  <small>{session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}</small>
                </div>
                <div className="dash-session-score">
                  <span className={`score-badge ${session.average_score >= 7 ? 'good' : session.average_score >= 5 ? 'avg' : 'poor'}`}>
                    {session.average_score}
                  </span>
                  <small>{session.question_count} questions</small>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/progress")} style={{ marginTop: 12 }}>
            📊 View Full History
          </button>
        </div>
      )}

      <div className="dash-bottom-row">
        <ResourceCard resources={resources} />
        {report.study_plan && (
          <div className="dash-report-section fade-in-up">
            <h3 className="dash-report-title">Study Plan</h3>
            <div className="dash-study-plan">{report.study_plan}</div>
          </div>
        )}
      </div>

      <div className="dash-actions fade-in-up">
        <button className="btn btn-primary btn-start" onClick={() => navigate("/")}>
          Start New Interview
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/question")}>
          Practice More
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/progress")}>
          📈 My Progress
        </button>
      </div>
    </div>
  );
}
