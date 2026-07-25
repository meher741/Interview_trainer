export default function ResourceCard({ resources }) {
  if (!resources || resources.length === 0) return null;

  return (
    <div className="feedback-section">
      <h2>Recommended Resources</h2>
      {resources.map((r, i) => (
        <div key={i} className="resource-item">
          <div className="resource-topic">{r.topic}</div>
          <div className="resource-meta">
            <span className="resource-platform">{r.platform}</span>
            <span className="resource-title">{r.title}</span>
          </div>
          <div className="resource-reason">{r.reason}</div>
        </div>
      ))}
    </div>
  );
}
