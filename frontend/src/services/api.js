import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Request interceptor to attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function generateQuestion(role, topic, difficulty, usedCategories) {
  const { data } = await api.post("/generate-question", { role, topic, difficulty, used_categories: usedCategories });
  return data;
}

export async function generateNextQuestion(role, topic, difficulty, questions, usedCategories) {
  const { data } = await api.post("/generate-next-question", { role, topic, difficulty, questions, used_categories: usedCategories });
  return data;
}

export async function evaluateAnswer(question, expectedTopics, answer) {
  const { data } = await api.post("/evaluate-answer", { question, expected_topics: expectedTopics, answer });
  return data;
}

export async function generateDashboard(role, topic, questions) {
  const { data } = await api.post("/dashboard", { role, topic, questions });
  return data;
}