import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Question from "./pages/Question";
import Feedback from "./pages/Feedback";
import Dashboard from "./pages/Dashboard";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <div className="app">
      <nav className="top-nav">
        <Link to="/" className="nav-brand">🎯 InterviewIQ</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question" element={<Question />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
      </Routes>
      <footer className="footer">
        <p>🎯 InterviewIQ — AI-Powered Interview Coach</p>
      </footer>
    </div>
  );
}
