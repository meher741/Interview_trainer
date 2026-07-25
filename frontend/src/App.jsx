import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Question from "./pages/Question";
import Feedback from "./pages/Feedback";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <div className="app">
      <nav className="top-nav">
        <Link to="/" className="nav-brand">🎯 InterviewIQ</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/progress" className="nav-link">📈 Progress</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/question" element={<Question />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route
            path="/dashboard"
            element={<ErrorBoundary><Dashboard /></ErrorBoundary>}
          />
          <Route
            path="/progress"
            element={<ErrorBoundary><Progress /></ErrorBoundary>}
          />
        </Route>
        {/* Redirect to home if none of the above match */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        <p>🎯 InterviewIQ — AI-Powered Interview Coach</p>
      </footer>
    </div>
  );
}
