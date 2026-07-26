import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: true,
});

export function setAccessToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      request.url?.includes("/auth/refresh") ||
      request.url?.includes("/auth/login") ||
      request.url?.includes("/auth/signup")
    ) {
      return Promise.reject(error);
    }

    request._retry = true;
    refreshPromise ??= api.post("/auth/refresh").then(({ data }) => {
      setAccessToken(data.access_token);
      return data.access_token;
    }).finally(() => {
      refreshPromise = null;
    });

    try {
      const token = await refreshPromise;
      request.headers = request.headers || {};
      request.headers.Authorization = `Bearer ${token}`;
      return api(request);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  },
);

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

export async function getProgressData() {
  const { data } = await api.get("/analytics/progress");
  return data;
}
