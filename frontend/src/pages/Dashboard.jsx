import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateDashboard } from "../services/api";
import ScoreChart from "../components/ScoreChart";
import TopicChart from "../components/TopicChart";
import ResourceCard from "../components/ResourceCard";
import { useEffect, useState } from "react";
import useAnimatedCounter from "../hooks/useAnimatedCounter";
import useConfetti from "../hooks/useConfetti";

function scoreBadge(score) {
  if (score >= 9) return { label: "Interview Ready 🏆", color: "#27ae60" };
  if (score >= 7) return { label: "Almost Ready 🥈", color: "#2980b9" };
  if (score >= 5) return { label: "Keep Practicing 📚", color: "#f39c12" };
  return { label: "Beginner 💪", color: "#e74c3c" };
}

function StatCard({ value, label, color }) {
  const { count, ref } = useAnimatedCounter(value, 1200, true);
  return (
    <div className="stat-card" ref={ref}>
      <div className="stat-value" style={color ? { color } : {}}>{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useInterview();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const canvasRef = useConfetti(celebrate, { count: 120, spread: 120 });

  useEffect(() => {
    async function load() {
      try {
        const res = await generateDashboard(
          state.role,
          state.topic,
          state.questions
        );
        setData(res.data);
        if (res.data.stats.overall_score >= 7) setCelebrate(true);
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
      <div className="feedback-page fade-in-up">
        <div className="loading">
          <div className="spinner" />
          <p>Generating your personalized report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="feedback-page fade-in-up">
        <h1>Dashboard</h1>
        <p className="error">{error || "No interview data available."}</p>
        <button className="btn" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const badge = scoreBadge(data.stats.overall_score);
  const report = data.report;
  const { count: heroCount, ref: heroRef } = useAnimatedCounter(data.stats.overall_score, 1500, true);

  return (
    <div className="dashboard-page">
      <canvas ref={canvasRef} className="confetti-canvas" />
      <h1 className="fade-in-up">Interview Complete 🎉</h1>

      <div className="dashboard-hero fade-in-up" style={{ "--badge-color": badge.color }} ref={heroRef}>
        <div className="hero-score">
          <span className="hero-number">{heroCount}</span>
          <span className="hero-total">/10</span>
        </div>
        <div className="hero-badge" style={{ background: badge.color }}>
          {badge.label}
        </div>
        <div className="hero-label">Overall Performance</div>
      </div>

      <div className="stats-grid fade-in-up">
        <StatCard value={data.stats.questions_answered} label="Questions" />
        <StatCard value={data.stats.average_score} label="Avg Score" />
        <StatCard value={data.stats.highest_score} label="Highest" />
        <StatCard value={data.stats.lowest_score} label="Lowest" />
        <StatCard value={data.stats.easy_count} label="Easy" />
        <StatCard value={data.stats.medium_count} label="Medium" />
        <StatCard value={data.stats.hard_count} label="Hard" />
        <StatCard value={data.stats.questions_answered} label="Total" />
      </div>

      <div className="charts-row fade-in-up">
        <ScoreChart questions={state.questions} />
        <TopicChart topicPerformance={data.stats.topic_performance} />
      </div>

      <div className="feedback-section fade-in-up">
        <h2>AI Summary</h2>
        <div className="summary-text">{report.summary}</div>
      </div>

      <div className="feedback-section fade-in-up">
        <h2>Strengths</h2>
        <ul className="strengths">
          {report.strengths.map((s, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>✔ {s}</li>)}
        </ul>
      </div>

      <div className="feedback-section fade-in-up">
        <h2>Weaknesses</h2>
        <ul className="weaknesses">
          {report.weaknesses.map((w, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>✖ {w}</li>)}
        </ul>
      </div>

      <div className="feedback-section fade-in-up">
        <h2>Recommendations</h2>
        <ul className="recommendations-list">
          {report.recommendations.map((r, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>• {r}</li>)}
        </ul>
      </div>

      <ResourceCard resources={data.resources} />

      <div className="feedback-section fade-in-up">
        <h2>Study Plan</h2>
        <div className="study-plan">{report.study_plan}</div>
      </div>

      <div className="actions fade-in-up">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          🔄 Start New Interview
        </button>
      </div>
    </div>
  );
}
