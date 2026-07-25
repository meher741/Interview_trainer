import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export async function generateQuestion(role, topic, difficulty) {
  const { data } = await api.post("/generate-question", {
    role,
    topic,
    difficulty,
  });
  return data;
}
