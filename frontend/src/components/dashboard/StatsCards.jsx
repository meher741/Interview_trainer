import useAnimatedCounter from "../../hooks/useAnimatedCounter";

function StatCard({ value = 0, label, icon, color }) {
    const { count, ref } = useAnimatedCounter(value, 1200, true);
    return (
        <div className="dash-stat-card" ref={ref}>
            <div className="dash-stat-icon">{icon}</div>
            <div className="dash-stat-value" style={color ? { color } : {}}>{count}</div>
            <div className="dash-stat-label">{label}</div>
        </div>
    );
}

export default function StatsCards({ stats = {} }) {
    return (
        <div className="dash-stats-grid fade-in-up">
            <StatCard value={stats.questions_answered || 0} label="Questions" icon="❓" />
            <StatCard value={stats.average_score || 0} label="Avg Score" icon="📊" color="#6c5ce7" />
            <StatCard value={stats.highest_score || 0} label="Highest" icon="🔥" color="#27ae60" />
            <StatCard value={stats.lowest_score || 0} label="Lowest" icon="⚠️" color="#e74c3c" />
        </div>
    );
}
