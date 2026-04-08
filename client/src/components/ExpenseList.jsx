import ExpenseCard from './ExpenseCard.jsx';

const CATEGORIES = [
  'All',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Housing & Utilities',
  'Education',
  'Travel',
  'Other',
];

export default function ExpenseList({ expenses, loading, filters, setFilters, onEdit, onDelete }) {
  const filtered = expenses.filter((e) => {
    if (
      filters.search &&
      !e.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.category &&
      filters.category !== 'All' &&
      e.category !== filters.category
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="expense-page">
      <div className="page-header">
        <h1 className="page-title">All Expenses</h1>
        <p className="page-sub">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <div className="filters-bar">
        <input
          className="search-input form-input"
          type="text"
          placeholder="Search expenses..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="select-filter form-input"
          value={filters.category || ''}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c === 'All' ? '' : c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="select-filter form-input"
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
        >
          <option value="-date">Newest First</option>
          <option value="date">Oldest First</option>
          <option value="-amount">Highest Amount</option>
          <option value="amount">Lowest Amount</option>
        </select>
      </div>

      {loading ? (
        <div className="skeleton-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 72, borderRadius: 'var(--r-md)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#9670;</div>
          <h3 className="empty-title">No expenses found</h3>
          <p className="empty-sub">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="expense-list">
          {filtered.map((expense) => (
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
