import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TopicChart({ topicPerformance }) {
  return (
    <div className="chart-box">
      <h3>Topic-wise Performance</h3>
      <ResponsiveContainer width="100%" height={topicPerformance.length * 50 + 50}>
        <BarChart data={topicPerformance} layout="vertical">
          <XAxis type="number" domain={[0, 10]} fontSize={12} />
          <YAxis dataKey="topic" type="category" width={120} fontSize={12} />
          <Tooltip />
          <Bar dataKey="average" fill="#27ae60" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
