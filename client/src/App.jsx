// ============================================================
// client/src/App.jsx — THE ROOT COMPONENT (BRAIN OF THE APP)
//
// This is the most important React file. It:
//   1. Holds ALL the application state (data that drives the UI)
//   2. Fetches data from the backend API
//   3. Handles all CRUD operations (create, read, update, delete)
//   4. Decides which view to show (Dashboard or All Expenses)
//   5. Controls the modal (open/closed, add vs edit mode)
//   6. Manages toast notifications
//
// WHY IS ALL STATE HERE?
//   State needs to live at the highest common parent of all
//   components that need it. Since Navbar, Dashboard, ExpenseList
//   and ExpenseModal all need the same data, it all lives here
//   and gets passed DOWN as props.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import ExpenseModal from './components/ExpenseModal.jsx';
import Toast from './components/Toast.jsx';
import { getExpenses, getStats, createExpense, updateExpense, deleteExpense } from './services/api.js';

// These are calculated once at app start — the current month and year
// Used to pass to the stats API so it knows which month to highlight
const CURRENT_MONTH = new Date().getMonth() + 1; // getMonth() is 0-indexed, so +1
const CURRENT_YEAR = new Date().getFullYear();

export default function App() {

  // ============================================================
  // STATE — the app's memory. When any of these change,
  // React automatically re-renders the affected components.
  // ============================================================

  // The full list of expense objects fetched from MongoDB
  const [expenses, setExpenses] = useState([]);

  // Aggregated stats for the charts: { categoryStats: [], monthlyStats: [] }
  const [stats, setStats] = useState({ categoryStats: [], monthlyStats: [] });

  // true while data is loading — triggers skeleton loader UI
  const [loading, setLoading] = useState(true);

  // Error state — shown when the server/DB is unreachable
  // Shows a full-page error UI instead of just a blank screen
  const [fetchError, setFetchError] = useState(null);

  // Which page is showing: 'dashboard' or 'expenses'
  // Changing this swaps the entire main content — no page reload needed
  const [activeView, setActiveView] = useState('dashboard');

  // Controls whether the add/edit modal is visible
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The expense being edited — null means we're adding a new one
  // When not null, the modal pre-fills with this expense's data
  const [editingExpense, setEditingExpense] = useState(null);

  // Array of toast notification objects: [{ id, message, type }]
  // New toasts get pushed in, old ones get filtered out after 3.5s
  const [toasts, setToasts] = useState([]);

  // Current filter/sort settings for the expense list
  const [filters, setFilters] = useState({ category: '', search: '', sort: '-date' });

  // ============================================================
  // addToast — shows a temporary notification at bottom-right
  // type can be: 'success', 'error', 'info', 'warning'
  //
  // useCallback wraps this so it doesn't get recreated on every
  // render — important because it's a dependency of fetchData
  // ============================================================
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now(); // unique ID using current timestamp (milliseconds)
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove this toast after 3.5 seconds
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // ============================================================
  // fetchData — loads expenses + stats from the API simultaneously
  //
  // Promise.all runs BOTH fetch calls at the same time (in parallel).
  // Faster than awaiting them one by one.
  //
  // useCallback means this function is only recreated when
  // `filters` or `addToast` changes — prevents infinite re-render loops
  // ============================================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null); // clear any previous error before retrying
    try {
      // Fetch expenses list and aggregated stats in parallel
      const [expensesRes, statsRes] = await Promise.all([
        getExpenses(filters),
        getStats(CURRENT_MONTH, CURRENT_YEAR)
      ]);
      setExpenses(expensesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      // Show persistent error UI (not just a toast) so the user can retry
      setFetchError(err.message || 'Could not connect to the server');
      addToast(err.message || 'Failed to load data', 'error');
    } finally {
      // Always turn off loading, whether success or failure
      setLoading(false);
    }
  }, [filters, addToast]);

  // ============================================================
  // useEffect — runs fetchData whenever filters change
  // This is why searching or changing the sort automatically refreshes
  // The dependency array [fetchData] means: re-run when fetchData changes
  // fetchData changes when filters change (because of useCallback above)
  // ============================================================
  useEffect(() => { fetchData(); }, [fetchData]);

  // ============================================================
  // CRUD HANDLERS — called by child components via props
  // Each one calls the API, shows a toast, then re-fetches data
  // to keep the UI in sync with MongoDB
  // ============================================================

  // CREATE — called when the modal form is submitted for a new expense
  const handleCreate = async (data) => {
    try {
      await createExpense(data);       // POST to /api/expenses
      addToast('Expense added successfully');
      setIsModalOpen(false);           // close the modal
      fetchData();                     // re-fetch so the new expense appears
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // UPDATE — called when the modal form is submitted for an existing expense
  const handleUpdate = async (id, data) => {
    try {
      await updateExpense(id, data);   // PUT to /api/expenses/:id
      addToast('Expense updated');
      setIsModalOpen(false);
      setEditingExpense(null);         // clear the editing reference
      fetchData();                     // re-fetch so changes appear immediately
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // DELETE — called from ExpenseCard after two-step confirmation
  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);         // DELETE to /api/expenses/:id
      addToast('Expense deleted', 'info');
      fetchData();                     // re-fetch so deleted expense disappears
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ============================================================
  // MODAL HELPERS — open/close the add/edit modal
  // ============================================================

  // Open modal in EDIT mode — pre-fills the form with existing data
  const openEdit = (expense) => {
    setEditingExpense(expense);  // store which expense we're editing
    setIsModalOpen(true);
  };

  // Open modal in ADD mode — blank form for a new expense
  const openAdd = () => {
    setEditingExpense(null);     // null = no existing expense = add mode
    setIsModalOpen(true);
  };

  // Close the modal and clear any editing state
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  // ============================================================
  // RENDER — what gets drawn on screen
  // The entire app lives in one div — this is what makes it an SPA
  // ============================================================
  return (
    <div className="app">

      {/* Navbar is always visible at the top regardless of which view is active */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onAddExpense={openAdd}
      />

      <main className="main-content">
        {/* Show full-page error UI if the backend/DB is unreachable */}
        {fetchError ? (
          <div className="error-state">
            <div className="error-icon">&#9888;</div>
            <h2 className="error-title">Unable to load data</h2>
            <p className="error-sub">{fetchError}. Make sure MongoDB and the Express server are running.</p>
            <button className="error-retry" onClick={fetchData}>Try again</button>
          </div>
        ) : activeView === 'dashboard' ? (
          /* DASHBOARD VIEW — overview with hero, stat cards and charts */
          <Dashboard
            expenses={expenses}
            stats={stats}
            loading={loading}
            onEdit={openEdit}
            onDelete={handleDelete}
            onViewAll={() => setActiveView('expenses')}
          />
        ) : (
          /* ALL EXPENSES VIEW — full list with search, filter and sort */
          <ExpenseList
            expenses={expenses}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Modal is conditionally rendered — only exists in the DOM when open */}
      {isModalOpen && (
        <ExpenseModal
          expense={editingExpense}  // null = add mode, object = edit mode
          onClose={closeModal}
          onSubmit={editingExpense
            ? (data) => handleUpdate(editingExpense._id, data)  // editing: include the ID
            : handleCreate}                                      // adding: no ID needed
        />
      )}

      {/* Toast container — always present but renders nothing when toasts array is empty */}
      <Toast toasts={toasts} />
    </div>
  );
}
