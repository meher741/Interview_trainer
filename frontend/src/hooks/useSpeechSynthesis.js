import { useState, useEffect, useRef, useCallback } from "react";

export default function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setSupported(!!window.speechSynthesis);
  }, []);

  const speak = useCallback(
    (text, { rate = 0.95, pitch = 1, onEnd } = {}) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang === "en-IN"
      );
      const indianNameVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.toLowerCase().includes("india") ||
            v.name.toLowerCase().includes("indian"))
      );
      const googleVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") && v.name.toLowerCase().includes("google")
      );
      utterance.voice = indianVoice || indianNameVoice || googleVoice || voices[0] || null;
      utterance.lang = utterance.voice?.lang || "en-US";

      utterance.onstart = () => {
        setSpeaking(true);
        setPaused(false);
      };

      utterance.onend = () => {
        setSpeaking(false);
        setPaused(false);
        onEnd?.();
      };

      utterance.onerror = () => {
        setSpeaking(false);
        setPaused(false);
      };

      utterance.onpause = () => setPaused(true);
      utterance.onresume = () => setPaused(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  return { speak, pause, resume, cancel, speaking, paused, supported };
}
