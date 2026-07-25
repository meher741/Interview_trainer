import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ScoreChart({ questions }) {
  const data = questions.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score,
  }));

  return (
    <div className="chart-box">
      <h3>Per-Question Scores</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" fontSize={12} />
          <YAxis domain={[0, 10]} fontSize={12} />
          <Tooltip />
          <Bar dataKey="score" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
