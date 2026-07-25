export default function ResourceCard({ resources = [] }) {
    if (!resources || resources.length === 0) return null;

    return (
        <div className="dash-report-section fade-in-up">
            <h3 className="dash-report-title">📚 Recommended Resources</h3>
            <div className="dash-resources-grid">
                {resources.map((r, i) => (
                    <div key={i} className="dash-resource-item" style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="dash-resource-topic">{r.topic || "General"}</div>
                        <div className="dash-resource-meta">
                            <span className="dash-resource-platform">{r.platform || "Online"}</span>
                            <span className="dash-resource-title">{r.title || "Resource"}</span>
                        </div>
                        <div className="dash-resource-reason">{r.reason || ""}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

