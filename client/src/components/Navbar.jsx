export default function Navbar({ activeView, setActiveView, onAddExpense }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="logo">&#9670; AURUM</div>
        <div className="nav-center">
          <button
            className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeView === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveView('expenses')}
          >
            All Expenses
          </button>
        </div>
        <button className="btn-add" onClick={onAddExpense}>
          + Add Expense
        </button>
      </div>
    </nav>
  );
}
