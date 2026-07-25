import { useEffect } from "react";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";

export default function VoicePlayer({ text, autoSpeak = true, label }) {
  const { speak, pause, resume, cancel, speaking, paused, supported } =
    useSpeechSynthesis();

  useEffect(() => {
    if (autoSpeak && text && supported) {
      const timer = setTimeout(() => speak(text), 300);
      return () => clearTimeout(timer);
    }
  }, [text, autoSpeak, supported]);

  if (!supported) return null;

  return (
    <div className="voice-player fade-in-up">
      <div className="voice-player-header">
        <span className="voice-player-icon">🔊</span>
        <span className="voice-player-label">
          {label || "AI Interviewer"}
        </span>
      </div>
      <div className="voice-player-controls">
        {!speaking ? (
          <button
            className="voice-btn"
            onClick={() => speak(text)}
            title="Replay Question"
          >
            🔊 Replay
          </button>
        ) : paused ? (
          <button
            className="voice-btn"
            onClick={resume}
            title="Resume"
          >
            ▶ Resume
          </button>
        ) : (
          <button
            className="voice-btn"
            onClick={pause}
            title="Pause"
          >
            ⏸ Pause
          </button>
        )}
        {speaking && (
          <button
            className="voice-btn voice-btn-stop"
            onClick={cancel}
            title="Stop"
          >
            ⏹ Stop
          </button>
        )}
      </div>
      {speaking && (
        <div className="voice-wave">
          <span className="voice-wave-bar" />
          <span className="voice-wave-bar" />
          <span className="voice-wave-bar" />
          <span className="voice-wave-bar" />
          <span className="voice-wave-bar" />
        </div>
      )}
    </div>
  );
}
