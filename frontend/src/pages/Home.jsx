import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion } from "../services/api";

const ROLES = ["Software Engineer", "Data Analyst", "DevOps Engineer", "Frontend Developer"];
const TOPICS = ["DSA", "Java", "Python", "DBMS", "Operating Systems", "Computer Networks", "HR"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function Home() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const [localRole, setLocalRole] = useState(state.role || ROLES[0]);
  const [localTopic, setLocalTopic] = useState(state.topic || TOPICS[0]);
  const [localDifficulty, setLocalDifficulty] = useState(state.difficulty || "Easy");

  async function handleStart() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateQuestion(localRole, localTopic, localDifficulty);
      setState((s) => ({
        ...s,
        role: localRole,
        topic: localTopic,
        difficulty: localDifficulty,
        question: res.data,
        questions: [],
        weakTopics: [],
        strongTopics: [],
        averageScore: 0,
        questionNumber: 1,
        loading: false,
        error: "",
      }));
      toast.success("Question generated!");
      navigate("/question");
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Unable to generate question." }));
      toast.error("Failed to generate question");
    }
  }

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-icon">🎯</div>
        <h1>InterviewIQ</h1>
        <p className="hero-subtitle">AI-Powered Personalized Interview Coach</p>
        <p className="hero-desc">Practice • Learn • Improve</p>
      </div>

      <div className="setup-card">
        <div className="form-group">
          <label>📋 Select Role</label>
          <select value={localRole} onChange={(e) => setLocalRole(e.target.value)}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>📚 Select Topic</label>
          <select value={localTopic} onChange={(e) => setLocalTopic(e.target.value)}>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>🎯 Difficulty</label>
          <div className="radio-group">
            {DIFFICULTIES.map((d) => (
              <label key={d} className={`radio ${localDifficulty === d ? "active" : ""}`}>
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={localDifficulty === d}
                  onChange={(e) => setLocalDifficulty(e.target.value)}
                />
                {d === "Easy" ? "🟢" : d === "Medium" ? "🟡" : "🔴"} {d}
              </label>
            ))}
          </div>
        </div>

        <button className="btn btn-start" onClick={handleStart} disabled={state.loading}>
          {state.loading ? "⏳ Generating..." : "🚀 Start Interview"}
        </button>

        {state.error && <div className="error-box">{state.error}</div>}
      </div>
    </div>
  );
}
