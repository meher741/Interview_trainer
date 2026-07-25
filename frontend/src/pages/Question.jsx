import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion, generateNextQuestion, evaluateAnswer } from "../services/api";

export default function Question() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const q = state.question;
  const [answer, setAnswer] = useState("");

  async function loadNextQuestion() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateNextQuestion(state.role, state.topic, state.questions);
      setState((s) => ({
        ...s,
        question: res.data.question,
        difficulty: res.data.current_difficulty,
        questionNumber: res.data.question_number,
        weakTopics: res.data.weak_topics,
        strongTopics: res.data.strong_topics,
        averageScore: res.data.average_score,
        answer: "",
        loading: false,
        error: "",
      }));
      setAnswer("");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to generate question." }));
    }
  }

  async function handleFirstQuestion() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateQuestion(state.role, state.topic, state.difficulty);
      setState((s) => ({
        ...s,
        question: res.data,
        questionNumber: 1,
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
      const entry = {
        question: q.question,
        difficulty: state.difficulty,
        score: res.data.score,
        expected_topics: q.expected_topics,
        missing_topics: res.data.missing_topics,
      };
      setState((s) => ({
        ...s,
        evaluation: res.data,
        answer,
        questions: [...s.questions, entry],
        loading: false,
      }));
      navigate("/feedback");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to evaluate answer." }));
    }
  }

  const progress = Math.min((state.questionNumber - 1) / 5 * 100, 100);

  if (!q && !state.loading) {
    return (
      <div className="question-page">
        <p>No question loaded.</p>
        <button className="btn" onClick={handleFirstQuestion}>Start</button>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="question-page">
        <div className="loading">Generating personalized question...</div>
      </div>
    );
  }

  return (
    <div className="question-page">
      <div className="progress-section">
        <div className="progress-label">Question {state.questionNumber} / 5</div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {state.weakTopics.length > 0 && (
        <div className="coaching-banner">
          Focus area: <strong>{state.weakTopics.slice(0, 2).join(", ")}</strong>
        </div>
      )}

      <div className="question-header">
        <span>Question {state.questionNumber}</span>
        <span className="badge">{state.difficulty}</span>
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
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          End Interview
        </button>
      </div>

      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}
