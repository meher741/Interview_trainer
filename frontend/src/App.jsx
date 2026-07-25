import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Question from "./pages/Question";
import Feedback from "./pages/Feedback";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question" element={<Question />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <footer className="footer">
        <p>🎯 InterviewIQ — AI-Powered Interview Coach</p>
      </footer>
    </div>
  );
}
