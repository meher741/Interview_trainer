export default function ReportSection({ title, items, type = "neutral", children }) {
    if (children) {
        return (
            <div className="dash-report-section fade-in-up">
                <h3 className="dash-report-title">{title}</h3>
                <div className="dash-report-content">{children}</div>
            </div>
        );
    }

    if (!items || items.length === 0) return null;

    const classMap = {
        strengths: "dash-strengths",
        weaknesses: "dash-weaknesses",
        recommendations: "dash-recommendations",
    };

    const iconMap = {
        strengths: "✅",
        weaknesses: "⚠️",
        recommendations: "💡",
    };

    return (
        <div className="dash-report-section fade-in-up">
            <h3 className="dash-report-title">{iconMap[type] || "📌"} {title}</h3>
            <ul className={`dash-report-list ${classMap[type] || ""}`}>
                {items.map((item, i) => (
                    <li key={i} style={{ animationDelay: `${i * 0.06}s` }}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

