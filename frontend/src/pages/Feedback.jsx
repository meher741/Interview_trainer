import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";

function scoreClass(score) {
  if (score >= 9) return "excellent";
  if (score >= 7) return "good";
  if (score >= 5) return "average";
  return "needs-work";
}

function scoreLabel(score) {
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Average";
  return "Needs Improvement";
}

function scoreColor(score) {
  if (score >= 9) return "#27ae60";
  if (score >= 7) return "#2980b9";
  if (score >= 5) return "#f39c12";
  return "#e74c3c";
}

function coachingMessage(state) {
  const s = state.averageScore;
  const weak = state.weakTopics;
  if (!state.questions.length) return "";

  if (s >= 8 && weak.length === 0) {
    return "Excellent work! You've mastered this topic. Moving to harder questions.";
  }
  if (s >= 6 && weak.length <= 1) {
    return "Good progress! Let's keep pushing with a few more questions.";
  }
  if (weak.length > 0) {
    return `You struggled with ${weak.slice(0, 2).join(" and ")}. Let's practice more in that area before increasing difficulty.`;
  }
  return "Keep going! Consistency is key.";
}

export default function Feedback() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const e = state.evaluation;

  function handleNext() {
    setState((s) => ({ ...s, evaluation: null, error: "" }));
    navigate("/question");
  }

  function handleFinish() {
    setState((s) => ({
      ...s,
      question: null,
      evaluation: null,
      questions: [],
      weakTopics: [],
      strongTopics: [],
      averageScore: 0,
      questionNumber: 1,
    }));
    navigate("/");
  }

  if (!e) {
    return (
      <div className="feedback-page">
        <p>No evaluation data.</p>
        <button className="btn" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const color = scoreColor(e.score);

  return (
    <div className="feedback-page">
      <h1>Your Results</h1>

      <div className="score-section" style={{ "--score-color": color }}>
        <div className="score-circle">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#eee" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="60"
              fill="none" stroke={color}
              strokeWidth="10"
              strokeDasharray={`${(e.score / 10) * 377} 377`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="score-text">
            <span className="score-number">{e.score}</span>
            <span className="score-total">/10</span>
          </div>
        </div>
        <div className="score-label" style={{ color }}>{scoreLabel(e.score)}</div>
        <div className="score-bar-bg">
          <div
            className="score-bar-fill"
            style={{ width: `${(e.score / 10) * 100}%`, background: color }}
          />
        </div>
      </div>

      <div className="coaching-message">
        {coachingMessage(state)}
      </div>

      <div className="feedback-section">
        <h2>Strengths</h2>
        <ul className="strengths">
          {e.strengths.map((s, i) => <li key={i}>✔ {s}</li>)}
        </ul>
      </div>

      <div className="feedback-section">
        <h2>Weaknesses</h2>
        <ul className="weaknesses">
          {e.weaknesses.map((w, i) => <li key={i}>✖ {w}</li>)}
        </ul>
      </div>

      {e.missing_topics.length > 0 && (
        <div className="feedback-section">
          <h2>Missing Concepts</h2>
          <ul className="missing">
            {e.missing_topics.map((m, i) => <li key={i}>• {m}</li>)}
          </ul>
        </div>
      )}

      <div className="feedback-section">
        <h2>Ideal Answer</h2>
        <div className="ideal-answer">{e.ideal_answer}</div>
      </div>

      <div className="feedback-section">
        <h2>Interviewer Feedback</h2>
        <div className="feedback-text">{e.feedback}</div>
      </div>

      <div className="meta-row">
        <div><strong>Confidence:</strong> <span className={`confidence ${e.confidence.toLowerCase()}`}>{e.confidence}</span></div>
        <div><strong>Next:</strong> <span className="badge">{e.next_difficulty}</span></div>
      </div>

      {state.questions.length > 0 && (
        <div className="stats-row">
          <div><strong>Avg Score:</strong> {state.averageScore}</div>
          <div><strong>Questions:</strong> {state.questions.length}</div>
          {state.weakTopics.length > 0 && (
            <div><strong>Weak Areas:</strong> {state.weakTopics.slice(0, 3).join(", ")}</div>
          )}
        </div>
      )}

      <div className="actions">
        {state.questionNumber < 5 ? (
          <button className="btn" onClick={handleNext}>
            Next Question
          </button>
        ) : (
          <button className="btn" onClick={handleFinish}>
            See Final Results
          </button>
        )}
        <button className="btn btn-secondary" onClick={handleFinish}>
          End Interview
        </button>
      </div>

      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}
