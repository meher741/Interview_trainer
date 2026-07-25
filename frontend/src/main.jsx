import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { InterviewProvider } from "./context/InterviewContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <InterviewProvider>
        <App />
      </InterviewProvider>
    </BrowserRouter>
  </StrictMode>
);
