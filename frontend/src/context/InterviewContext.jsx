import { createContext, useContext, useState } from "react";

const InterviewContext = createContext();

export function InterviewProvider({ children }) {
  const [state, setState] = useState({
    role: "",
    topic: "",
    difficulty: "Easy",
    question: null,
    questionNumber: 1,
    loading: false,
    error: "",
  });

  return (
    <InterviewContext.Provider value={{ state, setState }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  return useContext(InterviewContext);
}
