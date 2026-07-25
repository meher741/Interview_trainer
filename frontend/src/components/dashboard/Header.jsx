export default function DashboardHeader({ role, topic, questionCount }) {
    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="dash-header fade-in-up">
            <div className="dash-header-icon">🎉</div>
            <h1>Interview Completed</h1>
            <div className="dash-header-meta">
                <span className="dash-meta-badge">{role || "Software Engineer"}</span>
                <span className="dash-meta-badge">{topic || "General"}</span>
            </div>
            <div className="dash-header-info">
                <span>📅 {today}</span>
                <span>❓ {questionCount} Questions</span>
            </div>
        </div>
    );
}

