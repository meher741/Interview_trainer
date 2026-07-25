import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { InterviewProvider } from "./context/InterviewContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <InterviewProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </InterviewProvider>
    </BrowserRouter>
  </StrictMode>
);
