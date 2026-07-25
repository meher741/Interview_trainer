import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export async function signup(email, password) {
  const { data } = await api.post("/auth/signup", { email, password });
  if (data.access_token) {
    setAccessToken(data.access_token);
  }
  return data;
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.access_token) {
    setAccessToken(data.access_token);
  }
  return data;
}

export async function logout() {
  const { data } = await api.post("/auth/logout");
  setAccessToken(null);
  return data;
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

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

export async function startInterview(role, topic) {
  const { data } = await api.post("/interview/start", { role, topic });
  return data;
}

export async function saveAttempt(attemptData) {
  const { data } = await api.post("/interview/save", attemptData);
  return data;
}

export async function finishInterview(sessionId) {
  const { data } = await api.post("/interview/finish", { session_id: sessionId });
  return data;
}

export async function getDashboardAnalytics() {
  const { data } = await api.get("/analytics/dashboard");
  return data;
}

export async function getInterviewHistory() {
  const { data } = await api.get("/analytics/history");
  return data;
}

export async function getRecommendations() {
  const { data } = await api.get("/analytics/recommendations");
  return data;
}
