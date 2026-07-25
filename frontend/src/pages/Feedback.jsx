import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion } from "../services/api";

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

export default function Feedback() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const e = state.evaluation;

  async function handleNext() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const nextDiff = e?.next_difficulty || state.difficulty;
      const res = await generateQuestion(state.role, state.topic, nextDiff);
      setState((s) => ({
        ...s,
        question: res.data,
        difficulty: nextDiff,
        questionNumber: s.questionNumber + 1,
        answer: "",
        evaluation: null,
        loading: false,
        error: "",
      }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Unable to generate question.",
      }));
    }
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
        <div><strong>Next Difficulty:</strong> <span className="badge">{e.next_difficulty}</span></div>
      </div>

      <div className="actions">
        <button className="btn" onClick={handleNext}>
          Next Question ({e.next_difficulty})
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          End Interview
        </button>
      </div>

      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}
