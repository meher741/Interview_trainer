import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
3react-router-dom";
import { Toaster } from "react-hot-toast";
import { InterviewProvider } from "./context/InterviewContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <App />
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);