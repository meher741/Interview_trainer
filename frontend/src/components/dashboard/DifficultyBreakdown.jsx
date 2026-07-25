export default function DifficultyBreakdown({ stats = {} }) {
    const items = [
        { label: "Easy", count: stats.easy_count || 0, color: "#27ae60" },
        { label: "Medium", count: stats.medium_count || 0, color: "#f39c12" },
        { label: "Hard", count: stats.hard_count || 0, color: "#e74c3c" },
    ];

    const total = items.reduce((acc, i) => acc + i.count, 0);
    if (total === 0) return null;

    return (
        <div className="dash-difficulty-card fade-in-up">
            <h3 className="dash-chart-title">📊 Difficulty Breakdown</h3>
            <p className="dash-chart-subtitle">How questions were distributed</p>
            <div className="dash-difficulty-bars">
                {items.map((item) => {
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    if (item.count === 0) return null;
                    return (
                        <div key={item.label} className="dash-difficulty-row">
                            <div className="dash-difficulty-label">
                                <span className="dash-difficulty-dot" style={{ background: item.color }} />
                                {item.label}
                            </div>
                            <div className="dash-difficulty-bar-bg">
                                <div
                                    className="dash-difficulty-bar-fill"
                                    style={{ width: `${pct}%`, background: item.color }}
                                />
                            </div>
                            <div className="dash-difficulty-count">
                                {item.count} <span className="dash-difficulty-pct">({pct}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

