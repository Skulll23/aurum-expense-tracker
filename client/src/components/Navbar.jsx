// ============================================================
// client/src/components/Navbar.jsx — TOP NAVIGATION BAR
//
// The Navbar is always visible at the top of the page.
// It does three things:
//   1. Shows the AURUM logo/brand on the left
//   2. Shows Dashboard / All Expenses tab buttons in the centre
//   3. Shows the "+ Add Expense" button on the right
//
// HOW THE TABS WORK:
//   activeView is a state variable that lives in App.jsx
//   When you click "Dashboard", setActiveView('dashboard') runs
//   App.jsx re-renders and swaps which component is shown
//   This is how "navigation" works in an SPA — no page reload,
//   just state change → React redraws the page
//
// PROPS received from App.jsx:
//   activeView    — 'dashboard' or 'expenses' — tells us which tab is active
//   setActiveView — function to switch the active view
//   onAddExpense  — function to open the add expense modal
// ============================================================

export default function Navbar({ activeView, setActiveView, onAddExpense }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo — the ◆ symbol is the HTML entity &#9670; */}
        <div className="logo">&#9670; AURUM</div>

        {/* Navigation tabs in the centre */}
        <div className="nav-center">

          {/* Dashboard tab — the 'active' CSS class adds the underline indicator */}
          {/* Ternary: if activeView === 'dashboard', add 'active' class, else add '' */}
          <button
            className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>

          {/* All Expenses tab */}
          <button
            className={`nav-tab ${activeView === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveView('expenses')}
          >
            All Expenses
          </button>
        </div>

        {/* Add Expense button — triggers the modal in App.jsx */}
        <button className="btn-add" onClick={onAddExpense}>
          + Add Expense
        </button>
      </div>
    </nav>
  );
}
