import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Question from "./pages/Question";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/question" element={<Question />} />
    </Routes>
  );
}
