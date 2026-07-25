import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateDashboard } from "../services/api";
import { useEffect, useState, useCallback } from "react";
import useConfetti from "../hooks/useConfetti";

import DashboardHeader from "../components/dashboard/Header";
import ScoreCard from "../components/dashboard/ScoreCard";
import StatsCards from "../components/dashboard/StatsCards";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import TopicChart from "../components/dashboard/TopicChart";
import DifficultyBreakdown from "../components/dashboard/DifficultyBreakdown";
import ReportSection from "../components/dashboard/ReportSection";
import ResourceCard from "../components/dashboard/ResourceCard";

export default function Dashboard() {
  const { state } = useInterview();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const canvasRef = useConfetti(celebrate, { count: 120, spread: 120 });

  const hasInterviewData = state.questions && state.questions.length > 0;

  const fetchDashboard = useCallback(async () => {
    if (!hasInterviewData) {
      setLoading(false);
      return;
    }
    try {
      const res = await generateDashboard(state.role, state.topic, state.questions);
      if (res && res.success && res.data) {
        setData(res.data);
        if (res.data.stats && res.data.stats.overall_score >= 7) setCelebrate(true);
      } else {
        setApiError("Invalid response from server.");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setApiError("Unable to load dashboard. Please try again.");
    }
    setLoading(false);
  }, [hasInterviewData, state.role, state.topic, state.questions]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="feedback-page fade-in-up">
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

  if (!hasInterviewData || (!data && !loading)) {
    return (
      <div className="dashboard-page fade-in-up">
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

  return (
    <div className="dashboard-page">
      <canvas ref={canvasRef} className="confetti-canvas" />

      <DashboardHeader
        role={data && data.role ? data.role : state.role}
        topic={data && data.topic ? data.topic : state.topic}
        questionCount={stats.questions_answered || state.questions.length}
      />

      <ScoreCard overallScore={stats.overall_score || 0} />
      <StatsCards stats={stats} />

      <div className="dash-charts-row">
        <PerformanceChart questions={history} />
        <TopicChart topicPerformance={stats.topic_performance || []} />
      </div>

      <DifficultyBreakdown stats={stats} />

      {report.summary && (
        <div className="dash-report-section fade-in-up">
          <h3 className="dash-report-title">AI Summary</h3>
          <div className="dash-summary-text">{report.summary}</div>
        </div>
      )}

      <div className="dash-report-grid">
        <ReportSection title="Strengths" items={report.strengths || []} type="strengths" />
        <ReportSection title="Areas to Improve" items={report.weaknesses || []} type="weaknesses" />
      </div>

      <ReportSection title="Recommendations" items={report.recommendations || []} type="recommendations" />
      <ResourceCard resources={resources} />

      {report.study_plan && (
        <div className="dash-report-section fade-in-up">
          <h3 className="dash-report-title">Study Plan</h3>
          <div className="dash-study-plan">{report.study_plan}</div>
        </div>
      )}

      <div className="dash-actions fade-in-up">
        <button className="btn btn-primary btn-start" onClick={() => navigate("/")}>
          Start New Interview
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/question")}>
          Practice More
        </button>
      </div>
    </div>
  );
}