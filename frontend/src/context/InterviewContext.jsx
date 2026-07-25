import { createContext, useContext, useState } from "react";

const InterviewContext = createContext();

export function InterviewProvider({ children }) {
  const [state, setState] = useState({
    role: "",
    topic: "",
    difficulty: "Easy",
    question: null,
    questionNumber: 1,
    answer: "",
    evaluation: null,
    questions: [],
    weakTopics: [],
    strongTopics: [],
    averageScore: 0,
    usedCategories: [],
    loading: false,
    error: "",
    interviewMode: "text",
    sessionId: null,
    voiceStats: {
      questionsAnswered: 0,
      speakingTimeTotal: 0,
      averageResponseTime: 0,
    },
  });

  // Helper to reset state for a new interview
  const resetInterview = () => {
    setState({
      role: "",
      topic: "",
      difficulty: "Easy",
      question: null,
      questionNumber: 1,
      answer: "",
      evaluation: null,
      questions: [],
      weakTopics: [],
      strongTopics: [],
      averageScore: 0,
      usedCategories: [],
      loading: false,
      error: "",
      interviewMode: "text",
      sessionId: null,
      voiceStats: {
        questionsAnswered: 0,
        speakingTimeTotal: 0,
        averageResponseTime: 0,
      },
    });
  };

  return (
    <InterviewContext.Provider value={{ state, setState, resetInterview }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  return useContext(InterviewContext);
}
