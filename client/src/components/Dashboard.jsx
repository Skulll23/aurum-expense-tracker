// ============================================================
// client/src/components/Dashboard.jsx — THE OVERVIEW PAGE
//
// This is the first thing users see. It shows:
//   1. A hero image banner with the AURUM label and current month
//   2. Four stat cards (This Month, All Time, Entries, Largest)
//   3. Two charts side by side (Monthly Trend + By Category)
//   4. A preview list of the 5 most recent expenses
//
// PROPS received from App.jsx:
//   expenses  — full array of expense objects from MongoDB
//   stats     — { categoryStats: [], monthlyStats: [] } from the aggregation API
//   loading   — boolean, true while data is being fetched
//   onEdit    — function to open the edit modal for an expense
//   onDelete  — function to delete an expense
//   onViewAll — function to switch to the All Expenses view
//
// NOTE: This component does NOT fetch data itself.
// It receives data as props and just displays it.
// All fetching happens in App.jsx.
// ============================================================

import StatsCard from './StatsCard.jsx';
import TrendChart from './TrendChart.jsx';
import CategoryChart from './CategoryChart.jsx';
import ExpenseCard from './ExpenseCard.jsx';

// Month name lookup — used to convert month number (1-12) to abbreviation
// Array is 0-indexed so MONTH_NAMES[0] = 'Jan', MONTH_NAMES[11] = 'Dec'
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Dashboard({ expenses, stats, loading, onEdit, onDelete, onViewAll }) {
  const now = new Date(); // current date — used for "This Month" filter and hero subtitle

  // Filter to current calendar month for the "This Month" stat card
  // We compare both month AND year to avoid counting last year's same month
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Derived summary statistics for the four stat cards
  // .reduce() loops through the array and accumulates a running total
  const thisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const allTime = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Math.max with spread operator finds the single largest amount in the array
  const largest = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;

  // Transform API monthly aggregation into Recharts-compatible { name, amount } shape
  // The API returns: { _id: { year: 2026, month: 3 }, total: 150, count: 2 }
  // Recharts needs:  { name: 'Mar', amount: 150 }
  // m._id.month is 1-indexed, array is 0-indexed — hence the -1
  const monthlyData = (stats.monthlyStats || []).map((m) => ({
    name: MONTH_NAMES[m._id.month - 1],
    amount: m.total,
  }));

  // Show only the 5 most recent expenses in the dashboard preview list
  const recent = expenses.slice(0, 5);

  return (
    <div className="dashboard">

      {/* HERO BANNER — background image set in CSS (.page-hero)
          Gradient overlay darkens the image so text is readable.
          AURUM label sits above the title for a luxury brand feel. */}
      <div className="page-hero">
        <div className="page-hero-content">
          {/* Subtle brand label above the title */}
          <p className="hero-aurum-label">AURUM</p>
          <h1 className="page-title">Overview</h1>
          <p className="page-sub">
            {/* toLocaleString formats the date as "April 2026" */}
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* STAT CARDS GRID — four cards in a responsive grid.
          Each StatsCard receives a value and shows it formatted.
          While loading=true, each StatsCard shows a skeleton shimmer. */}
      <div className="stats-grid">
        {/* HTML entity &#9678; renders as a circle icon */}
        <StatsCard
          label="This Month"
          value={thisMonth}
          icon="&#9678;"
          prefix="$"
          loading={loading}
        />
        <StatsCard
          label="All Time"
          value={allTime}
          icon="&#9672;"
          prefix="$"
          loading={loading}
        />
        {/* isCount tells StatsCard to format as a whole number, not $0.00 */}
        <StatsCard
          label="Entries"
          value={expenses.length}
          icon="&#9673;"
          loading={loading}
          isCount
        />
        <StatsCard
          label="Largest"
          value={largest}
          icon="&#9670;"
          prefix="$"
          loading={loading}
        />
      </div>

      {/* CHARTS SECTION — two charts side by side on desktop, stacked on mobile.
          TrendChart = area chart showing monthly spending over time
          CategoryChart = donut chart showing breakdown by category */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Monthly Trend</h2>
          </div>
          {/* monthlyData is the transformed array Recharts expects */}
          <TrendChart data={monthlyData} loading={loading} />
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">By Category</h2>
          </div>
          {/* categoryStats comes directly from the MongoDB aggregation pipeline */}
          <CategoryChart data={stats.categoryStats} loading={loading} />
        </div>
      </div>

      {/* RECENT EXPENSES — shows 5 most recent, "View all" switches tab */}
      <div className="section-header">
        <h2 className="section-title">Recent Expenses</h2>
        {/* &rarr; is the HTML entity for → */}
        <button className="view-all" onClick={onViewAll}>
          View all &rarr;
        </button>
      </div>

      {/* Conditional rendering based on loading/data state:
          1. loading → show skeleton placeholders
          2. no data → show empty state message
          3. has data → render expense cards */}
      {loading ? (
        <div className="skeleton-list">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 64, borderRadius: 'var(--r-md)' }}
            />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#9670;</div>
          <h3 className="empty-title">No expenses yet</h3>
          <p className="empty-sub">Add your first expense to get started</p>
        </div>
      ) : (
        // key={expense._id} is required by React to track list items efficiently
        <div className="expense-list">
          {recent.map((expense) => (
            <ExpenseCard
              key={expense._id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
