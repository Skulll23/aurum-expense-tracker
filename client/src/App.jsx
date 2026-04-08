import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import ExpenseModal from './components/ExpenseModal.jsx';
import Toast from './components/Toast.jsx';
import { getExpenses, getStats, createExpense, updateExpense, deleteExpense } from './services/api.js';

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ categoryStats: [], monthlyStats: [] });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({ category: '', search: '', sort: '-date' });

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
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
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (data) => {
    try {
      await createExpense(data);
      addToast('Expense added successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateExpense(id, data);
      addToast('Expense updated');
      setIsModalOpen(false);
      setEditingExpense(null);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      addToast('Expense deleted', 'info');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="app">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onAddExpense={openAdd}
      />
      <main className="main-content">
        {fetchError ? (
          <div className="error-state">
            <div className="error-icon">&#9888;</div>
            <h2 className="error-title">Unable to load data</h2>
            <p className="error-sub">{fetchError}. Make sure MongoDB and the Express server are running.</p>
            <button className="error-retry" onClick={fetchData}>Try again</button>
          </div>
        ) : activeView === 'dashboard' ? (
          <Dashboard
            expenses={expenses}
            stats={stats}
            loading={loading}
            onEdit={openEdit}
            onDelete={handleDelete}
            onViewAll={() => setActiveView('expenses')}
          />
        ) : (
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
      {isModalOpen && (
        <ExpenseModal
          expense={editingExpense}
          onClose={closeModal}
          onSubmit={editingExpense
            ? (data) => handleUpdate(editingExpense._id, data)
            : handleCreate}
        />
      )}
      <Toast toasts={toasts} />
    </div>
  );
}
