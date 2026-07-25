import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion, generateNextQuestion, evaluateAnswer } from "../services/api";

export default function Question() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const q = state.question;
  const [answer, setAnswer] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

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
      setElapsed(0);
      toast.success("Personalized question ready!");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to generate question." }));
      toast.error("Failed to generate question");
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
      setElapsed(0);
      toast.success("Question generated!");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to generate question." }));
    }
  }

  async function handleSubmit() {
    if (!answer.trim()) {
      setState((s) => ({ ...s, error: "Please enter your answer." }));
      toast.error("Please enter your answer");
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
      toast.success("Answer evaluated!");
      navigate("/feedback");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to evaluate answer." }));
      toast.error("Failed to evaluate answer");
    }
  }

  const progress = Math.min((state.questionNumber - 1) / 5 * 100, 100);

  if (!q && !state.loading) {
    return (
      <div className="page-card">
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h2>No Interview Started</h2>
          <p>Start your first AI interview to begin.</p>
          <button className="btn" onClick={handleFirstQuestion}>Start</button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="page-card">
        <div className="loading">
          <div className="spinner" />
          <p>🤖 AI is generating your question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-page">
      <div className="progress-section">
        <div className="progress-row">
          <span className="progress-label">Question {state.questionNumber} / 5</span>
          <span className="timer">⏱ {formatTime(elapsed)}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {state.weakTopics.length > 0 && (
        <div className="coaching-banner">
          🎯 Focus area: <strong>{state.weakTopics.slice(0, 2).join(", ")}</strong>
        </div>
      )}

      <div className="question-card">
        <div className="question-card-header">
          <span className="question-label">Question {state.questionNumber}</span>
          <span className={`badge badge-${state.difficulty.toLowerCase()}`}>
            {state.difficulty === "Easy" ? "🟢" : state.difficulty === "Medium" ? "🟡" : "🔴"} {state.difficulty}
          </span>
        </div>
        <div className="question-text">{q.question}</div>
        <div className="question-meta">
          <div>⏱ <strong>{q.estimated_time}</strong></div>
          <div>📚 <strong>Topics:</strong> {q.expected_topics.join(", ")}</div>
        </div>
      </div>

      <details className="hint-box">
        <summary>💡 Hint</summary>
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
        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit Answer
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          End Interview
        </button>
      </div>

      {state.error && <div className="error-box">{state.error}</div>}
    </div>
  );
}
