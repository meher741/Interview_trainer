import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { generateQuestion, generateNextQuestion, evaluateAnswer } from "../services/api";
import useTypewriter from "../hooks/useTypewriter";
import VoicePlayer from "../components/VoicePlayer";
import VoiceRecorder from "../components/VoiceRecorder";
import { checkSpeechSupport } from "../utils/speechSupport";

const CATEGORY_EMOJIS = {
  "Problem Statement": "🎯",
  "Project Workflow": "🔄",
  "Feature Demonstration": "✨",
  "Technical Architecture": "🏗️",
  "Frontend": "🎨",
  "Backend": "⚙️",
  "AI / LLM": "🤖",
  "Prompt Engineering": "📝",
  "Adaptive Learning": "🧠",
  "API Design": "🔌",
  "Database / Storage": "💾",
  "Security": "🔒",
  "Performance": "⚡",
  "Scalability": "📈",
  "Error Handling": "🛡️",
  "Testing": "🧪",
  "Innovation": "💡",
  "Future Scope": "🔮",
  "Deployment & DevOps": "🚀",
  "Team & Development": "👥",
};

function categoryEmoji(cat) {
  if (!cat) return "📋";
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (cat.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "📋";
}

export default function Question() {
  const { state, setState } = useInterview();
  const navigate = useNavigate();
  const q = state.question;
  const [answer, setAnswer] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const answerRef = useRef(null);
  const { displayed: typedQuestion, done: questionDone } = useTypewriter(
    q ? q.question : "", 18, 400
  );

  const isVoice = state.interviewMode === "voice";
  const speechSupport = checkSpeechSupport();

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (questionDone && answerRef.current) answerRef.current.focus();
  }, [questionDone]);

  // Auto-load next question when coming from feedback page
  useEffect(() => {
    if (!q && state.loading && state.questions.length > 0) {
      loadNextQuestion();
    }
  }, []);

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function getApiMessage(err) {
    return err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
  }

  async function loadNextQuestion() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateNextQuestion(
        state.role, state.topic, state.difficulty, state.questions, state.usedCategories
      );
      const cat = res.data.question.question_category;
      setState((s) => ({
        ...s,
        question: res.data.question,
        difficulty: res.data.current_difficulty,
        questionNumber: res.data.question_number,
        weakTopics: res.data.weak_topics,
        strongTopics: res.data.strong_topics,
        averageScore: res.data.average_score,
        usedCategories: cat ? [...s.usedCategories, cat] : s.usedCategories,
        answer: "",
        loading: false,
        error: "",
      }));
      setAnswer("");
      setElapsed(0);
      toast.success("Personalized question ready!");
    } catch (err) {
      const msg = getApiMessage(err);
      setState((s) => ({ ...s, loading: false, error: msg }));
      toast.error(msg);
    }
  }

  async function handleFirstQuestion() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await generateQuestion(state.role, state.topic, state.difficulty, []);
      setState((s) => ({
        ...s,
        question: res.data,
        questionNumber: 1,
        usedCategories: res.data.question_category ? [res.data.question_category] : [],
        answer: "",
        loading: false,
        error: "",
      }));
      setAnswer("");
      setElapsed(0);
      toast.success("Question generated!");
    } catch (err) {
      const msg = getApiMessage(err);
      setState((s) => ({ ...s, loading: false, error: msg }));
      toast.error(msg);
    }
  }

  async function handleSubmit() {
    if (!answer.trim()) {
      setState((s) => ({ ...s, error: "Please enter your answer." }));
      toast.error("Please enter your answer");
      return;
    }
    setSubmitting(true);
    setState((s) => ({ ...s, loading: true, error: "" }));
    setThinkingSteps([]);
    const thinkingTimers = [];
    const steps = [
      "Evaluating your answer...",
      "Analyzing concepts...",
      "Checking completeness...",
      "Generating feedback...",
    ];
    steps.forEach((step, i) => {
      const t = setTimeout(() => setThinkingSteps((prev) => [...prev, step]), (i + 1) * 600);
      thinkingTimers.push(t);
    });
    try {
      const res = await evaluateAnswer(q.question, q.expected_topics, answer);
      thinkingTimers.forEach(clearTimeout);
      const entry = {
        question: q.question,
        difficulty: state.difficulty,
        score: res.data.score,
        expected_topics: q.expected_topics,
        missing_topics: res.data.missing_topics,
        question_category: q.question_category || "",
      };
      const voiceStatsUpdate = isVoice
        ? {
            questionsAnswered: (state.voiceStats?.questionsAnswered || 0) + 1,
            speakingTimeTotal: (state.voiceStats?.speakingTimeTotal || 0) + elapsed,
            averageResponseTime: 0,
          }
        : {};
      if (isVoice && voiceStatsUpdate.questionsAnswered > 0) {
        voiceStatsUpdate.averageResponseTime = Math.round(
          voiceStatsUpdate.speakingTimeTotal / voiceStatsUpdate.questionsAnswered
        );
      }
      setState((s) => ({
        ...s,
        evaluation: res.data,
        answer,
        questions: [...s.questions, entry],
        voiceStats: { ...s.voiceStats, ...voiceStatsUpdate },
        loading: false,
      }));
      setThinkingSteps([]);
      toast.success("Answer evaluated!");
      navigate("/feedback");
    } catch (err) {
      const msg = getApiMessage(err);
      setState((s) => ({ ...s, loading: false, error: msg }));
      toast.error(msg);
    }
    setSubmitting(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
  }

  const progress = Math.min((state.questionNumber - 1) / 5 * 100, 100);

  if (!q && !state.loading) {
    return (
      <div className="page-card fade-in-up">
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h2>No Interview Started</h2>
          <p>Start your first AI interview to begin.</p>
          <button className="btn btn-primary" onClick={handleFirstQuestion}>Start</button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="page-card fade-in-up">
        <div className="loading">
          <div className="spinner" />
          {thinkingSteps.length > 0 ? (
            <div className="thinking-animation">
              {thinkingSteps.map((step, i) => (
                <p key={i} className="thinking-step" style={{ animationDelay: `${i * 0.1}s` }}>
                  🤖 {step}
                </p>
              ))}
            </div>
          ) : (
            <p className="typewriter-loading">
              {["Thinking", "Thinking.", "Thinking..", "Thinking..."][Math.floor((Date.now() / 400) % 4)]}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="question-page fade-in-up">
      <div className="progress-section">
        <div className="progress-row">
          <span className="progress-label">Question {state.questionNumber} / 5</span>
          <span className="timer">⏱ {formatTime(elapsed)}</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill animated-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {state.weakTopics.length > 0 && (
        <div className="coaching-banner fade-in-up">
          🎯 Focus area: <strong>{state.weakTopics.slice(0, 2).join(", ")}</strong>
        </div>
      )}

      <div className="question-card fade-in-up">
        <div className="question-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="question-label">Question {state.questionNumber}</span>
            {q.question_category && (
              <span className="category-badge">
                {categoryEmoji(q.question_category)} {q.question_category}
              </span>
            )}
          </div>
          <span className={`badge badge-${state.difficulty.toLowerCase()}`}>
            {state.difficulty === "Easy" ? "🟢" : state.difficulty === "Medium" ? "🟡" : "🔴"} {state.difficulty}
          </span>
        </div>
        <div className="question-text">
          {typedQuestion}
          {!questionDone && <span className="cursor blink">|</span>}
        </div>
        <div className="question-meta">
          <div>⏱ <strong>{q.estimated_time}</strong></div>
          <div>📚 <strong>Topics:</strong> {q.expected_topics.join(", ")}</div>
        </div>
      </div>

      {isVoice && speechSupport.supported && (
        <VoicePlayer
          text={q.question}
          autoSpeak={true}
          label="AI Interviewer"
        />
      )}

      <details className="hint-box fade-in-up">
        <summary>💡 Hint</summary>
        <p>{q.hint}</p>
      </details>

      {isVoice && speechSupport.supported ? (
        <VoiceRecorder
          onTranscriptChange={(val) => {
            if (val === "__error__") return;
            setAnswer(val);
          }}
          disabled={submitting}
        />
      ) : isVoice && !speechSupport.supported ? (
        <div className="voice-recorder voice-unsupported fade-in-up">
          <div className="voice-unsupported-icon">🎤</div>
          <p>
            Voice Interview is supported in Google Chrome and Microsoft Edge.
          </p>
          <p>Please switch browsers.</p>
        </div>
      ) : (
        <textarea
          ref={answerRef}
          className={`answer-box fade-in-up ${submitting ? "submitting" : ""}`}
          rows={5}
          placeholder="Type your answer here... (Ctrl+Enter to submit)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitting}
        />
      )}

      <div className="actions fade-in-up">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || (!answer.trim() && isVoice)}>
          {submitting ? "⏳ Evaluating..." : "✅ Submit Answer"}
        </button>
        <button className="btn btn-destructive" onClick={() => navigate("/")}>
          ✋ End Interview
        </button>
      </div>

      {state.error && <div className="error-box shake">{state.error}</div>}
    </div>
  );
}
