export function checkSpeechSupport() {
  const recognitionSupported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
  const synthesisSupported = !!window.speechSynthesis;
  return {
    supported: recognitionSupported && synthesisSupported,
    recognitionSupported,
    synthesisSupported,
  };
}
