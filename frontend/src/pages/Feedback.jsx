import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { saveAttempt, finishInterview, startInterview } from "../services/api";
import useAnimatedScore from "../hooks/useAnimatedScore";
import useConfetti from "../hooks/useConfetti";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";

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
  const { state, setState, resetInterview } = useInterview();
  const navigate = useNavigate();
  const e = state.evaluation;
  const animatedScore = useAnimatedScore(e ? e.score : 0, 1200);
  const celebrate = e && e.score >= 7;
  const canvasRef = useConfetti(celebrate, { count: 100, spread: 100 });
  const { speak: speakFeedback, supported: ttsSupported } = useSpeechSynthesis();
  const isVoice = state.interviewMode === "voice";
  const attemptSaved = useRef(false);

  // Save attempt to DB when evaluation is received
  useEffect(() => {
    if (e && !attemptSaved.current && state.questions.length > 0) {
      attemptSaved.current = true;
      const lastQuestion = state.questions[state.questions.length - 1];

      // Save to backend silently
      saveAttempt({
        session_id: state.sessionId,
        role: state.role,
        topic: state.topic,
        difficulty: lastQuestion.difficulty,
        question_text: lastQuestion.question,
        answer_text: state.answer,
        score: e.score,
        strengths: e.strengths,
        weaknesses: e.weaknesses,
        missing_topics: e.missing_topics,
        expected_topics: lastQuestion.expected_topics,
        question_category: lastQuestion.question_category,
        confidence: e.confidence,
        next_difficulty: e.next_difficulty,
      }).catch((err) => {
        console.warn("Failed to save attempt to DB:", err);
      });
    }
  }, [e, state.questions, state.answer, state.sessionId, state.role, state.topic]);

  useEffect(() => {
    if (isVoice && ttsSupported && e) {
      const feedbackText = `You scored ${e.score} out of 10. ${e.feedback}`;
      const timer = setTimeout(() => speakFeedback(feedbackText), 800);
      return () => clearTimeout(timer);
    }
  }, [isVoice, ttsSupported, e]);

  async function handleNext() {
    // Create a new DB session if we don't have one yet
    let currentSessionId = state.sessionId;
    if (!currentSessionId) {
      try {
        const sessionRes = await startInterview(state.role, state.topic);
        if (sessionRes?.success && sessionRes?.data?.session_id) {
          currentSessionId = sessionRes.data.session_id;
        }
      } catch (err) {
        console.warn("Failed to create session for next question:", err);
      }
    }

    setState((s) => ({
      ...s,
      sessionId: currentSessionId,
      evaluation: null,
      question: null,
      loading: true,
      error: "",
    }));
    navigate("/question");
  }

  async function handleFinish() {
    // Finish the session in DB
    if (state.sessionId) {
      try {
        await finishInterview(state.sessionId);
      } catch (err) {
        console.warn("Failed to finish session:", err);
      }
    }
    navigate("/dashboard");
  }

  async function handleEndEarly() {
    if (state.questions.length > 0) {
      // Finish the session in DB
      if (state.sessionId) {
        try {
          await finishInterview(state.sessionId);
        } catch (err) {
          console.warn("Failed to finish session:", err);
        }
      }
      navigate("/dashboard");
    } else {
      resetInterview();
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
    <div className="feedback-page page-full">
      <canvas ref={canvasRef} className="confetti-canvas" />
      <div className="feedback-layout">
        <aside className="feedback-sidebar">
          <div className="score-section" style={{ "--score-color": color }}>
            <div className="score-circle">
              <svg width="120" height="120" viewBox="0 0 140 140">
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
            <div className="score-bar-wrap">
              <div className="score-bar-bg">
                <div className="score-bar-fill" style={{ width: `${(e.score / 10) * 100}%`, background: color }} />
              </div>
            </div>

            <div className="score-meta-stack">
              <div className="score-meta-item">
                <span className="score-meta-icon">🗣️</span>
                <div>
                  <div className="score-meta-label">Confidence</div>
                  <span className={`confidence ${e.confidence.toLowerCase()}`}>{e.confidence}</span>
                </div>
              </div>
              <div className="score-meta-item">
                <span className="score-meta-icon">➡️</span>
                <div>
                  <div className="score-meta-label">Next</div>
                  <span className={`badge badge-${e.next_difficulty.toLowerCase()}`}>{e.next_difficulty}</span>
                </div>
              </div>
            </div>

            {state.questions.length > 0 && (
              <div className="score-mini-stats">
                <div className="mini-stat">
                  <span className="mini-stat-value">{state.averageScore}</span>
                  <span className="mini-stat-label">Avg</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">{state.questions.length}</span>
                  <span className="mini-stat-label">Q's</span>
                </div>
                {state.weakTopics.length > 0 && (
                  <div className="mini-stat mini-stat-wide">
                    <span className="mini-stat-label">Focus</span>
                    <span className="mini-stat-value-sm">{state.weakTopics.slice(0, 2).join(", ")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="coaching-message">{coachingMessage(state)}</div>

          <div className="feedback-sidebar-actions">
            {state.questionNumber < 5 ? (
              <button className="btn btn-primary btn-block" onClick={handleNext}>Next Question →</button>
            ) : (
              <button className="btn btn-primary btn-block" onClick={handleFinish}>📊 See Full Report</button>
            )}
            <button className="btn btn-destructive btn-block" onClick={handleEndEarly}>
              {state.questionNumber < 5 ? "End & See Report" : "End Interview"}
            </button>
          </div>
        </aside>

        <main className="feedback-main">
          <div className="feedback-grid-2col">
            <div className="feedback-section">
              <h2>🟢 Strengths</h2>
              <ul className="strengths">
                {e.strengths.map((s, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>✔ {s}</li>)}
              </ul>
            </div>
            <div className="feedback-section">
              <h2>🔴 Weaknesses</h2>
              <ul className="weaknesses">
                {e.weaknesses.map((w, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>✖ {w}</li>)}
              </ul>
            </div>
          </div>

          {e.missing_topics.length > 0 && (
            <div className="feedback-section">
              <h2>📌 Missing Concepts</h2>
              <ul className="missing missing-horizontal">
                {e.missing_topics.map((m, i) => <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>• {m}</li>)}
              </ul>
            </div>
          )}

          <div className="feedback-grid-2col">
            <div className="feedback-section">
              <h2>💡 Ideal Answer</h2>
              <div className="ideal-answer">{e.ideal_answer}</div>
            </div>
            <div className="feedback-section">
              <h2>🗣️ Interviewer Feedback</h2>
              <div className="feedback-text">{e.feedback}</div>
            </div>
          </div>
        </main>
      </div>

      {state.error && <div className="error-box shake">{state.error}</div>}
    </div>
  );
}
