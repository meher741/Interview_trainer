export default function ScoreCard({ overallScore }) {
    const score = overallScore ?? 0;
    const percent = (score / 10) * 100;

    let label, color, badge;
    if (score >= 9) {
        label = "Excellent";
        color = "#27ae60";
        badge = "🏆 Interview Ready";
    } else if (score >= 7) {
        label = "Good";
        color = "#2980b9";
        badge = "🥈 Almost Ready";
    } else if (score >= 5) {
        label = "Average";
        color = "#f39c12";
        badge = "📚 Keep Practicing";
    } else {
        label = "Needs Practice";
        color = "#e74c3c";
        badge = "💪 Beginner";
    }

    return (
        <div className="dash-score-card fade-in-up">
            <div className="dash-score-label">Overall Score</div>
            <div className="dash-score-main">
                <span className="dash-score-number" style={{ color }}>{score.toFixed(1)}</span>
                <span className="dash-score-total">/10</span>
            </div>
            <div className="dash-score-bar">
                <div
                    className="dash-score-fill"
                    style={{ width: `${percent}%`, background: color }}
                />
            </div>
            <div className="dash-score-label-text">{label}</div>
            <div className="dash-score-badge" style={{ background: color }}>{badge}</div>
        </div>
    );
}
