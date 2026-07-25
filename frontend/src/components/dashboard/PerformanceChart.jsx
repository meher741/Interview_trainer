import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

const COLORS = ["#6c5ce7", "#a29bfe", "#27ae60", "#f39c12", "#e74c3c", "#00cec9", "#fd79a8"];

export default function PerformanceChart({ questions = [] }) {
    const data = questions.map((q, i) => ({
        name: `Q${i + 1}`,
        score: q.score || 0,
        difficulty: q.difficulty || "",
    }));

    if (data.length === 0) return null;

    return (
        <div className="dash-chart-card fade-in-up">
            <h3 className="dash-chart-title">📈 Performance Trend</h3>
            <p className="dash-chart-subtitle">Score per question across the interview</p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" fontSize={13} tick={{ fill: "#636e72" }} />
                    <YAxis domain={[0, 10]} fontSize={13} tick={{ fill: "#636e72" }} />
                    <Tooltip
                        contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                        formatter={(value, name, props) => [`${value}/10`, `Q${props.payload.name} - ${props.payload.difficulty}`]}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.score >= 7 ? "#27ae60" : entry.score >= 5 ? "#f39c12" : "#e74c3c"} />
                        ))}
                        <LabelList dataKey="score" position="top" fontSize={13} fontWeight={700} fill="#2d3436" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
