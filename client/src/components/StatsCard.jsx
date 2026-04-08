export default function StatsCard({ label, value, icon, prefix = '', loading, isCount }) {
  const formatted = isCount
    ? value.toLocaleString()
    : prefix + Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  if (loading) {
    return (
      <div className="stat-card">
        <div
          className="skeleton"
          style={{ height: 16, width: '60%', borderRadius: 4, marginBottom: 12 }}
        />
        <div
          className="skeleton"
          style={{ height: 36, width: '80%', borderRadius: 4 }}
        />
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{formatted}</p>
    </div>
  );
}
