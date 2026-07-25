import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import useAnimatedScore from "../hooks/useAnimatedScore";
import useConfetti from "../hooks/useConfetti";

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
  if (s >= 8 && weak.length === 0) return "Excellent work! You've mastered this topic. Moving to harder questions.";
  if (s >= 6 && weak.length <= 1) return "Good progress! Let's keep pushing with a few more questions.";
  if (weak.length > 0) return `You struggled with ${weak.slice(0, 2).join(" and ")}. Let's practice more in that area before increasing difficulty.`;
  return "Keep going! Consistency is key.";
}

export default function Feedback() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const e = state.evaluation;
  const animatedScore = useAnimatedScore(e ? e.score : 0, 1200);
  const celebrate = e && e.score >= 7;
  const canvasRef = useConfetti(celebrate, { count: 100, spread: 100 });

  function handleNext() {
    setState((s) => ({ ...s, evaluation: null, question: null, loading: true, error: "" }));
    toast.success("Loading next question...");
    navigate("/question");
  }

  function handleFinish() {
    navigate("/dashboard");
  }

  function handleEndEarly() {
    if (state.questions.length > 0) {
      navigate("/dashboard");
    } else {
      setState((s) => ({
        ...s, question: null, evaluation: null, questions: [],
        weakTopics: [], strongTopics: [], averageScore: 0, questionNumber: 1,
      }));
      navigate("/");
    }
  }

  if (!e) {
    return (
      <div className="page-card fade-in-up">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No Evaluation Data</h2>
          <p>Complete a question first to see feedback.</p>
          <button className="btn" onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const color = scoreColor(e.score);
  const circumf = 2 * Math.PI * 60;

  return (
    <div className="feedback-page">
      <canvas ref={canvasRef} className="confetti-canvas" />
      <h1 className="fade-in-up">Your Results</h1>

      <div className="score-section fade-in-up" style={{ "--score-color": color }}>
        <div className="score-circle">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#eee" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="60" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${circumf} ${circumf}`}
              strokeDashoffset={(1 - animatedScore / 10) * circumf}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              className="score-arc"
            />
          </svg>
          <div className="score-text">
            <span className="score-number score-animated">{animatedScore}</span>
            <span className="score-total">/10</span>
          </div>
        </div>
        <div className="score-label" style={{ color }}>{scoreLabel(e.score)}</div>
      </div>

      <div className="coaching-message fade-in-up">{coachingMessage(state)}</div>

      <div className="feedback-section fade-in-up">
        <h2>🟢 Strengths</h2>
        <ul className="strengths">
          {e.strengths.map((s, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>✔ {s}</li>)}
        </ul>
      </div>

      <div className="feedback-section fade-in-up">
        <h2>🔴 Weaknesses</h2>
        <ul className="weaknesses">
          {e.weaknesses.map((w, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>✖ {w}</li>)}
        </ul>
      </div>

      {e.missing_topics.length > 0 && (
        <div className="feedback-section fade-in-up">
          <h2>📌 Missing Concepts</h2>
          <ul className="missing">
            {e.missing_topics.map((m, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>• {m}</li>)}
          </ul>
        </div>
      )}

      <div className="feedback-section fade-in-up">
        <h2>💡 Ideal Answer</h2>
        <div className="ideal-answer">{e.ideal_answer}</div>
      </div>

      <div className="feedback-section fade-in-up">
        <h2>🗣️ Interviewer Feedback</h2>
        <div className="feedback-text">{e.feedback}</div>
      </div>

      <div className="meta-row fade-in-up">
        <div><strong>Confidence:</strong> <span className={`confidence ${e.confidence.toLowerCase()}`}>{e.confidence}</span></div>
        <div><strong>Next:</strong> <span className={`badge badge-${e.next_difficulty.toLowerCase()}`}>{e.next_difficulty}</span></div>
      </div>

      {state.questions.length > 0 && (
        <div className="stats-row fade-in-up">
          <span>📊 Avg Score: <strong>{state.averageScore}</strong></span>
          <span>❓ Questions: <strong>{state.questions.length}</strong></span>
          {state.weakTopics.length > 0 && (
            <span>📉 Weak Areas: <strong>{state.weakTopics.slice(0, 3).join(", ")}</strong></span>
          )}
        </div>
      )}

      <div className="actions fade-in-up">
        {state.questionNumber < 5 ? (
          <button className="btn btn-primary" onClick={handleNext}>Next Question →</button>
        ) : (
          <button className="btn btn-primary" onClick={handleFinish}>📊 See Full Report</button>
        )}
        <button className="btn btn-destructive" onClick={handleEndEarly}>
          {state.questionNumber < 5 ? "End & See Report" : "End Interview"}
        </button>
      </div>

      {state.error && <div className="error-box shake">{state.error}</div>}
    </div>
  );
}
