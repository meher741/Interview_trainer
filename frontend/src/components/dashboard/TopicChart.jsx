import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TopicChart({ topicPerformance = [] }) {
    if (!topicPerformance || topicPerformance.length === 0) return null;

    const data = topicPerformance.map((t) => ({
        topic: t.topic.length > 15 ? t.topic.slice(0, 14) + "\u2026" : t.topic,
        score: t.average || 0,
        fullTopic: t.topic,
    }));

    return (
        <div className="dash-chart-card fade-in-up chart-container">
            <h3 className="dash-chart-title">dY"s Topic Performance</h3>
            <p className="dash-chart-subtitle">How you performed in each topic area</p>
            <ResponsiveContainer width="100%" height={Math.max(data.length * 50, 150)}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 10]} fontSize={12} tick={{ fill: "#636e72" }} />
                    <YAxis dataKey="topic" type="category" width={120} fontSize={12} tick={{ fill: "#636e72" }} />
                    <Tooltip
                        contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                        formatter={(value, name, props) => [`${value}/10`, props.payload.fullTopic]}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.score >= 7 ? "#27ae60" : entry.score >= 5 ? "#f39c12" : "#e74c3c"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

