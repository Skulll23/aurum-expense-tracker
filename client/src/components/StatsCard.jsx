// ============================================================
// client/src/components/StatsCard.jsx — A SINGLE STAT TILE
//
// Displays one metric (e.g. "This Month — $21.00").
// Used four times on the Dashboard in a responsive grid.
//
// PROPS:
//   label    — the title text (e.g. "This Month")
//   value    — the numeric value to display
//   icon     — HTML entity character shown at top (decorative)
//   prefix   — shown before the value (e.g. "$")
//   loading  — if true, shows a skeleton shimmer instead of real data
//   isCount  — if true, formats as a plain number (e.g. "12")
//              if false, formats as currency (e.g. "$21.00")
// ============================================================

export default function StatsCard({ label, value, icon, prefix = '', loading, isCount }) {

  // Format the value depending on whether it's a count or a dollar amount
  const formatted = isCount
    ? value.toLocaleString()  // plain number with comma separators: 1,234
    : prefix + Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,  // always show 2 decimal places: $21.00
        maximumFractionDigits: 2,
      });

  // SKELETON STATE — shown while data is loading
  // The shimmer animation is defined in index.css
  // Two grey bars replace the icon/label and value
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

  // NORMAL STATE — shows the real data
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>      {/* decorative icon symbol */}
      <p className="stat-label">{label}</p>         {/* e.g. "This Month" */}
      <p className="stat-value">{formatted}</p>     {/* e.g. "$21.00" */}
    </div>
  );
}
