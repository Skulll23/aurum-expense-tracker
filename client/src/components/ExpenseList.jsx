// ============================================================
// client/src/components/ExpenseList.jsx — ALL EXPENSES VIEW
//
// This is the second main view (shown when "All Expenses" tab is clicked).
// It shows the complete list of expenses with:
//   - A text search bar (filters by title)
//   - A category dropdown filter
//   - A sort dropdown (newest/oldest/highest/lowest)
//
// HOW FILTERING WORKS:
//   The `filters` state lives in App.jsx.
//   - Search and category filters happen CLIENT-SIDE here (no extra API call)
//     We already have all expenses in the `expenses` array, so we just
//     .filter() the array to show matching ones.
//   - Sort filter happens SERVER-SIDE — when sort changes, App.jsx re-fetches
//     from the API with the new sort parameter
//
// PROPS:
//   expenses   — full array of expense objects
//   loading    — true while fetching
//   filters    — { search, category, sort } current filter state
//   setFilters — function to update filters (lives in App.jsx)
//   onEdit     — function to open edit modal
//   onDelete   — function to delete an expense
// ============================================================

import ExpenseCard from './ExpenseCard.jsx';

// Category options for the dropdown filter
// 'All' is a special value that means "no filter"
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

  // CLIENT-SIDE FILTERING — filter the expenses array in memory
  // This runs every render and is instant (no server round-trip needed)
  const filtered = expenses.filter((e) => {

    // Search filter — case-insensitive title match
    // If the search text isn't found in the title, exclude this expense
    if (
      filters.search &&
      !e.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Category filter — exclude if category doesn't match
    // 'All' means no filter (show everything)
    if (
      filters.category &&
      filters.category !== 'All' &&
      e.category !== filters.category
    ) {
      return false;
    }

    return true; // include this expense if it passed both filters
  });

  return (
    <div className="expense-page">

      {/* Page header with title and entry count */}
      <div className="page-header">
        <h1 className="page-title">All Expenses</h1>
        <p className="page-sub">
          {/* Shows "1 entry" or "5 entries" */}
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {/* Filter controls bar */}
      <div className="filters-bar">

        {/* Text search input
            onChange updates filters.search state in App.jsx
            The spread { ...f, search: value } keeps other filters intact */}
        <input
          className="search-input form-input"
          type="text"
          placeholder="Search expenses..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />

        {/* Category filter dropdown */}
        <select
          className="select-filter form-input"
          value={filters.category || ''}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        >
          {CATEGORIES.map((c) => (
            // When 'All' is selected, set category to '' (empty = no filter)
            <option key={c} value={c === 'All' ? '' : c}>
              {c}
            </option>
          ))}
        </select>

        {/* Sort dropdown — changing this triggers a re-fetch from the API */}
        {/* The - prefix means descending: -date = newest first, -amount = highest first */}
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

      {/* Conditional rendering based on state:
          1. If loading → show skeleton placeholders
          2. If no results → show empty state message
          3. Otherwise → show the list of ExpenseCards */}
      {loading ? (
        /* Skeleton list — 5 grey shimmer bars while loading */
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
        /* Empty state — no expenses match the current filters */
        <div className="empty-state">
          <div className="empty-icon">&#9670;</div>
          <h3 className="empty-title">No expenses found</h3>
          <p className="empty-sub">Try adjusting your search or filters</p>
        </div>
      ) : (
        /* Expense list — renders one ExpenseCard per filtered expense */
        <div className="expense-list">
          {filtered.map((expense) => (
            // key prop is required by React to efficiently update lists
            // We use MongoDB's _id as it's guaranteed unique
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
