import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateDashboard } from "../services/api";
import ScoreChart from "../components/ScoreChart";
import TopicChart from "../components/TopicChart";
import ResourceCard from "../components/ResourceCard";
import { useEffect, useState } from "react";

function scoreBadge(score) {
  if (score >= 9) return { label: "Interview Ready 🏆", color: "#27ae60" };
  if (score >= 7) return { label: "Almost Ready 🥈", color: "#2980b9" };
  if (score >= 5) return { label: "Keep Practicing 📚", color: "#f39c12" };
  return { label: "Beginner 💪", color: "#e74c3c" };
}

export default function Dashboard() {
  const { state } = useInterview();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await generateDashboard(
          state.role,
          state.topic,
          state.questions
        );
        setData(res.data);
      } catch {
        setError("Unable to load dashboard.");
      }
      setLoading(false);
    }
    if (state.questions.length > 0) load();
    else setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="feedback-page">
        <div className="loading">Generating your personalized report...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="feedback-page">
        <h1>Dashboard</h1>
        <p className="error">{error || "No interview data available."}</p>
        <button className="btn" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const badge = scoreBadge(data.stats.overall_score);
  const report = data.report;

  return (
    <div className="dashboard-page">
      <h1>Interview Complete 🎉</h1>

      <div className="dashboard-hero" style={{ "--badge-color": badge.color }}>
        <div className="hero-score">
          <span className="hero-number">{data.stats.overall_score}</span>
          <span className="hero-total">/10</span>
        </div>
        <div className="hero-badge" style={{ background: badge.color }}>
          {badge.label}
        </div>
        <div className="hero-label">Overall Performance</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{data.stats.questions_answered}</div>
          <div className="stat-label">Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.stats.average_score}</div>
          <div className="stat-label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.stats.highest_score}</div>
          <div className="stat-label">Highest</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.stats.lowest_score}</div>
          <div className="stat-label">Lowest</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.stats.easy_count}</div>
          <div className="stat-label">Easy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.stats.medium_count}</div>
          <div className="stat-label">Medium</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.stats.hard_count}</div>
          <div className="stat-label">Hard</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: badge.color }}>
            {report.confidence_level}
          </div>
          <div className="stat-label">Confidence</div>
        </div>
      </div>

      <div className="charts-row">
        <ScoreChart questions={state.questions} />
        <TopicChart topicPerformance={data.stats.topic_performance} />
      </div>

      <div className="feedback-section">
        <h2>AI Summary</h2>
        <div className="summary-text">{report.summary}</div>
      </div>

      <div className="feedback-section">
        <h2>Strengths</h2>
        <ul className="strengths">
          {report.strengths.map((s, i) => <li key={i}>✔ {s}</li>)}
        </ul>
      </div>

      <div className="feedback-section">
        <h2>Weaknesses</h2>
        <ul className="weaknesses">
          {report.weaknesses.map((w, i) => <li key={i}>✖ {w}</li>)}
        </ul>
      </div>

      <div className="feedback-section">
        <h2>Recommendations</h2>
        <ul className="recommendations-list">
          {report.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
        </ul>
      </div>

      <ResourceCard resources={data.resources} />

      <div className="feedback-section">
        <h2>Study Plan</h2>
        <div className="study-plan">{report.study_plan}</div>
      </div>

      <div className="actions">
        <button className="btn" onClick={() => navigate("/")}>
          Start New Interview
        </button>
      </div>
    </div>
  );
}
