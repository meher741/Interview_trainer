import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion } from "../services/api";
import useTypewriter from "../hooks/useTypewriter";
import useFloatingParticles from "../hooks/useFloatingParticles";

const ROLE_SUGGESTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "Mobile Developer",
  "QA Engineer",
  "Security Engineer",
  "Site Reliability Engineer",
  "Engineering Manager",
  "Technical Lead",
  "Solution Architect",
];

const TOPIC_SUGGESTIONS = [
  "Data Structures & Algorithms",
  "System Design",
  "JavaScript / TypeScript",
  "React / Frontend",
  "Node.js / Backend",
  "Python",
  "Java",
  "Go",
  "SQL & Databases",
  "Distributed Systems",
  "Cloud & DevOps (AWS/GCP/Azure)",
  "Kubernetes & Containers",
  "Microservices",
  "API Design (REST/GraphQL)",
  "Testing & QA",
  "Security",
  "Performance Optimization",
  "Machine Learning",
  "Data Structures",
  "Algorithms",
  "Object Oriented Design",
  "Concurrency & Threading",
  "Networking",
  "Operating Systems",
  "HR & Behavioral",
  "Leadership & Management",
  "Product Sense",
];

const DIFFICULTIES = [
  { value: "Easy", label: "Easy", emoji: "🟢", desc: "Fundamental concepts" },
  { value: "Medium", label: "Medium", emoji: "🟡", desc: "Real-world problem solving" },
  { value: "Hard", label: "Hard", emoji: "🔴", desc: "Complex architecture & scale" },
];

function Combobox({ label, value, onChange, suggestions, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState(suggestions);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    const lower = value.toLowerCase();
    setFiltered(suggestions.filter(s => s.toLowerCase().includes(lower)));
    setHighlightedIndex(-1);
  }, [value, suggestions]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const maxIndex = filtered.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, maxIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        onChange(filtered[highlightedIndex]);
        setIsOpen(false);
      } else if (value.trim()) {
        onChange(value.trim());
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        e.preventDefault();
        onChange(filtered[highlightedIndex]);
        setIsOpen(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const showSuggestions = isOpen && (filtered.length > 0 || value.trim().length > 0);

  return (
    <div className="combobox">
      <label className="combobox-label">{label}</label>
      <div className="combobox-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="combobox-input"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        {showSuggestions && (
          <div className="combobox-dropdown" role="listbox">
            {filtered.map((option, idx) => (
              <div
                key={option}
                className={`combobox-option ${idx === highlightedIndex ? "highlighted" : ""}`}
                role="option"
                aria-selected={idx === highlightedIndex}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <span className="option-icon">💡</span>
                {option}
              </div>
            ))}
            {(filtered.length === 0 && value.trim()) && (
              <div className="combobox-empty">
                Press <kbd>Enter</kbd> to use <strong>"{value.trim()}"</strong> or choose from suggestions above
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const [localRole, setLocalRole] = useState(state.role || "");
  const [localTopic, setLocalTopic] = useState(state.topic || "");
  const [localDifficulty, setLocalDifficulty] = useState(state.difficulty || "Easy");
  const { displayed } = useTypewriter("InterviewIQ", 100, 200);
  const { displayed: tagline } = useTypewriter("AI-Powered Personalized Interview Coach", 30, 1200);
  const canvasRef = useFloatingParticles({ count: 18, speed: 0.25 });

  async function handleStart() {
    if (!localRole.trim() || !localTopic.trim()) {
      toast.error("Please enter both role and topic");
      return;
    }
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateQuestion(localRole, localTopic, localDifficulty, []);
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
        usedCategories: res.data.question_category ? [res.data.question_category] : [],
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
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="hero-section">
        <div className="hero-icon">🎯</div>
        <h1>{displayed}<span className={`cursor ${displayed.length === "InterviewIQ".length ? "blink" : ""}`}>|</span></h1>
        <p className="hero-subtitle">{tagline}<span className={`cursor ${tagline.length === "AI-Powered Personalized Interview Coach".length ? "blink" : ""}`}>|</span></p>
        <p className="hero-desc">Practice • Learn • Improve</p>
      </div>

      <div className="setup-card fade-in-up">
        <Combobox
          label="📋 Target Role"
          value={localRole}
          onChange={setLocalRole}
          suggestions={ROLE_SUGGESTIONS}
          placeholder="Type your role (e.g., Frontend Developer)..."
        />

        <Combobox
          label="📚 Interview Topic"
          value={localTopic}
          onChange={setLocalTopic}
          suggestions={TOPIC_SUGGESTIONS}
          placeholder="Type a topic (e.g., React, System Design, Python)..."
        />

        <div className="form-group">
          <label>🎯 Difficulty</label>
          <div className="radio-group">
            {DIFFICULTIES.map((d, i) => (
              <label
                key={d.value}
                className={`radio ${localDifficulty === d.value ? "active" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={d.value}
                  checked={localDifficulty === d.value}
                  onChange={(e) => setLocalDifficulty(e.target.value)}
                />
                <span className="emoji">{d.emoji}</span>
                <div>
                  <span>{d.label}</span>
                  <small style={{ display: "block", fontWeight: 400, fontSize: "11px", opacity: 0.7 }}>{d.desc}</small>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          className={`btn btn-start ${state.loading ? "pulse" : "glow"}`}
          onClick={handleStart}
          disabled={state.loading}
        >
          {state.loading ? (
            <span className="btn-loading">
              <span className="mini-spinner" /> Generating...
            </span>
          ) : (
            <span className="btn-content">🚀 Start Interview</span>
          )}
        </button>

        <button className="btn btn-outline dashboard-link" onClick={() => navigate("/dashboard")}>
          📊 View Dashboard
        </button>

        {state.error && <div className="error-box shake">{state.error}</div>}
      </div>
    </div>
  );
}