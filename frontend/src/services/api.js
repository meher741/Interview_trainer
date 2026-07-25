import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export async function generateQuestion(role, topic, difficulty) {
  const { data } = await api.post("/generate-question", { role, topic, difficulty });
  return data;
}

export async function generateNextQuestion(role, topic, questions) {
  const { data } = await api.post("/generate-next-question", { role, topic, questions });
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
