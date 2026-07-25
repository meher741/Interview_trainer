import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion, evaluateAnswer } from "../services/api";

export default function Question() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const q = state.question;
  const [answer, setAnswer] = useState("");

  async function handleNext() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateQuestion(state.role, state.topic, state.difficulty);
      setState((s) => ({
        ...s,
        question: res.data,
        questionNumber: s.questionNumber + 1,
        answer: "",
        loading: false,
        error: "",
      }));
      setAnswer("");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to generate question." }));
    }
  }

  async function handleSubmit() {
    if (!answer.trim()) {
      setState((s) => ({ ...s, error: "Please enter your answer." }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await evaluateAnswer(q.question, q.expected_topics, answer);
      setState((s) => ({
        ...s,
        evaluation: res.data,
        answer,
        history: [
          ...s.history,
          {
            question: q.question,
            answer,
            score: res.data.score,
            difficulty: q.difficulty,
          },
        ],
        loading: false,
      }));
      navigate("/feedback");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to evaluate answer." }));
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
        <div className="loading">Evaluating your answer...</div>
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

      <textarea
        className="answer-box"
        rows={5}
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <div className="actions">
        <button className="btn" onClick={handleSubmit}>
          Submit Answer
        </button>
        <button className="btn btn-secondary" onClick={handleNext}>
          Skip Question
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          End Interview
        </button>
      </div>

      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}
