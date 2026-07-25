import { useState, useEffect, useRef, useCallback } from "react";

const SILENCE_TIMEOUT = 4000;
const MAX_RECORDING_TIME = 120000;

export default function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognitionAPI;

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        setError("No speech detected. Please try again.");
      }
    }, SILENCE_TIMEOUT);
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    setError(null);
    setTranscript("");
    finalTranscriptRef.current = "";
    setRecordingTime(0);
    setStatus("requesting");

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setStatus("recording");
        resetSilenceTimer();
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime((prev) => {
            if (prev >= MAX_RECORDING_TIME / 1000 - 1) {
              stop();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        if (final) {
          finalTranscriptRef.current += final + " ";
          resetSilenceTimer();
        }
        setTranscript(finalTranscriptRef.current + interim);
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed") {
          setError(
            "Microphone permission is required for Voice Interview. Please allow microphone access."
          );
        } else if (event.error === "no-speech") {
          setError("No speech detected. Please try again.");
        } else if (event.error === "aborted") {
          // aborted by user, ignore
        } else {
          setError(`Speech recognition failed: ${event.error}. Retry Recording.`);
        }
        stop();
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
          try {
            recognition.start();
          } catch {
            // ignore
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setError("Failed to start speech recognition.");
      setStatus("idle");
    }
  }, [isSupported, resetSilenceTimer, isListening]);

  const stop = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setStatus("complete");
    setTranscript(finalTranscriptRef.current.trim());
  }, []);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    finalTranscriptRef.current = "";
    setRecordingTime(0);
    setStatus("idle");
    setError(null);
  }, [stop]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    error,
    status,
    recordingTime,
    isSupported,
    start,
    stop,
    reset,
  };
}
