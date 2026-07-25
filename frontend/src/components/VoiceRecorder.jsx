import { useEffect, useRef, useState } from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

export default function VoiceRecorder({ onTranscriptChange, disabled }) {
  const {
    transcript,
    isListening,
    error,
    status,
    recordingTime,
    isSupported,
    start,
    stop,
    reset,
  } = useSpeechRecognition();

  const [editableTranscript, setEditableTranscript] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (status === "complete" && transcript) {
      setEditableTranscript(transcript);
      onTranscriptChange?.(transcript);
    }
  }, [status, transcript]);

  useEffect(() => {
    if (error) {
      onTranscriptChange?.("__error__");
    }
  }, [error]);

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function handleEdit(e) {
    setEditableTranscript(e.target.value);
    onTranscriptChange?.(e.target.value);
  }

  function handleStart() {
    setEditableTranscript("");
    onTranscriptChange?.("");
    start();
  }

  function handleStop() {
    stop();
  }

  function handleReset() {
    reset();
    setEditableTranscript("");
    onTranscriptChange?.("");
    if (textareaRef.current) textareaRef.current.focus();
  }

  if (!isSupported) {
    return (
      <div className="voice-recorder voice-unsupported fade-in-up">
        <div className="voice-unsupported-icon">🎤</div>
        <p>
          Voice Interview is supported in Google Chrome and Microsoft Edge.
        </p>
        <p>Please switch browsers.</p>
      </div>
    );
  }

  const recordingDuration = recordingTime;
  const maxRecording = 120;
  const timerWarning = recordingDuration > 90;

  return (
    <div className={`voice-recorder fade-in-up ${status}`}>
      <div className="voice-recorder-header">
        <span className="voice-recorder-icon">
          {status === "recording" ? "🔴" : status === "complete" ? "🟢" : "🎤"}
        </span>
        <span className="voice-recorder-status">
          {status === "idle" && "Ready"}
          {status === "requesting" && "Requesting microphone..."}
          {status === "recording" && "Recording..."}
          {status === "complete" && "Recording Complete"}
        </span>
        {status === "recording" && (
          <span
            className={`voice-timer ${timerWarning ? "voice-timer-warn" : ""}`}
          >
            {formatTime(recordingDuration)}
          </span>
        )}
      </div>

      <div className="voice-recorder-actions">
        {status !== "recording" ? (
          <button
            className="voice-record-btn"
            onClick={handleStart}
            disabled={disabled}
          >
            <span className="voice-record-dot" />
            {status === "complete" ? "Record Again" : "Start Recording"}
          </button>
        ) : (
          <button
            className="voice-record-btn voice-record-btn-stop"
            onClick={handleStop}
            disabled={disabled}
          >
            <span className="voice-record-square" />
            Stop Recording
          </button>
        )}
      </div>

      {(status === "recording" || status === "complete") && (
        <div className="voice-transcript">
          <label className="voice-transcript-label">Transcript</label>
          {status === "recording" && (
            <div className="voice-live-transcript">
              {transcript || (
                <span className="voice-live-placeholder">
                  Speak your answer...
                </span>
              )}
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="voice-transcript-textarea"
            rows={4}
            placeholder={
              status === "complete"
                ? "Edit your transcript here..."
                : "Your speech will appear here..."
            }
            value={
              status === "recording" ? transcript : editableTranscript
            }
            onChange={handleEdit}
            readOnly={status === "recording"}
            disabled={disabled}
          />
          {status === "complete" && (
            <p className="voice-transcript-hint">
              You can edit the transcript above before submitting.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="voice-recorder-error">
          {error}
          {status !== "recording" && (
            <button className="voice-retry-btn" onClick={handleReset}>
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
