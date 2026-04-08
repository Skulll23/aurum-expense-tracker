import StatsCard from './StatsCard.jsx';
import TrendChart from './TrendChart.jsx';
import CategoryChart from './CategoryChart.jsx';
import ExpenseCard from './ExpenseCard.jsx';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Dashboard({ expenses, stats, loading, onEdit, onDelete, onViewAll }) {
  const now = new Date();

  // Filter to current calendar month for the "This Month" stat card
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Derived summary statistics for the four stat cards
  const thisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const allTime = expenses.reduce((sum, e) => sum + e.amount, 0);
  const largest = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;

  // Transform API monthly aggregation into Recharts-compatible { name, amount } shape
  const monthlyData = (stats.monthlyStats || []).map((m) => ({
    name: MONTH_NAMES[m._id.month - 1],
    amount: m.total,
  }));

  // Show only the 5 most recent expenses in the dashboard preview list
  const recent = expenses.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="page-hero">
        <div className="page-hero-content">
          <p className="hero-aurum-label">AURUM</p>
          <h1 className="page-title">Overview</h1>
          <p className="page-sub">
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="stats-grid">
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

      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Monthly Trend</h2>
          </div>
          <TrendChart data={monthlyData} loading={loading} />
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">By Category</h2>
          </div>
          <CategoryChart data={stats.categoryStats} loading={loading} />
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Recent Expenses</h2>
        <button className="view-all" onClick={onViewAll}>
          View all &rarr;
        </button>
      </div>

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
