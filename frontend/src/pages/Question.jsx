import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion } from "../services/api";

export default function Question() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const q = state.question;

  async function handleNext() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateQuestion(state.role, state.topic, state.difficulty);
      setState((s) => ({
        ...s,
        question: res.data,
        questionNumber: s.questionNumber + 1,
        loading: false,
        error: "",
      }));
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to generate question." }));
    }
  }

  if (!q) {
    return (
      <div className="question-page">
        <p>No question loaded.</p>
        <button className="btn" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="question-page">
        <div className="loading">Generating Question...</div>
      </div>
    );
  }

  return (
    <div className="question-page">
      <div className="question-header">
        <span>Question {state.questionNumber}</span>
        <span className="badge">{q.difficulty}</span>
      </div>

      <div className="question-text">{q.question}</div>

      <div className="meta">
        <div><strong>Expected Time:</strong> {q.estimated_time}</div>
        <div><strong>Expected Topics:</strong> {q.expected_topics.join(", ")}</div>
      </div>

      <details className="hint-box">
        <summary>Hint</summary>
        <p>{q.hint}</p>
      </details>

      <textarea className="answer-box" rows={5} placeholder="Type your answer here..." />

      <div className="actions">
        <button className="btn" onClick={handleNext}>
          {state.loading ? "Generating..." : "Next Question"}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          End Interview
        </button>
      </div>

      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}
