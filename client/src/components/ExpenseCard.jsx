// ============================================================
// client/src/components/ExpenseCard.jsx — A SINGLE EXPENSE ROW
//
// Displays one expense as a card row with:
//   - A coloured dot (category colour)
//   - Title, category, date
//   - Optional description
//   - Amount on the right
//   - Edit and delete buttons (revealed on hover)
//
// TWO-STEP DELETE:
//   Clicking delete once "arms" it (button turns red, shows "!")
//   A 2.5 second timer then disarms it automatically
//   Clicking again while armed confirms the actual deletion
//   This prevents accidental deletions
//
// PROPS:
//   expense   — the expense object from MongoDB
//   onEdit    — function called with the expense when Edit is clicked
//   onDelete  — function called with expense._id when Delete is confirmed
// ============================================================

import { useState } from 'react';
import { CATEGORY_COLORS, DEFAULT_COLOR } from '../constants.js';

export default function ExpenseCard({ expense, onEdit, onDelete }) {

  // confirmDelete tracks whether the delete button has been clicked once
  // false = normal state, true = "armed" state (ready to confirm)
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Look up the colour for this expense's category
  // Fall back to DEFAULT_COLOR if the category isn't in the map
  const color = CATEGORY_COLORS[expense.category] || DEFAULT_COLOR;

  // Format the date nicely: "Mar 17, 2026"
  const date = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Format the amount as currency: "$6.50"
  const amount =
    '$' +
    Number(expense.amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Two-step delete handler:
  //   First click  → set confirmDelete=true (arm the button)
  //                → start a 2.5s timer to auto-disarm
  //   Second click → actually call onDelete with the expense ID
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(expense._id); // confirmed — delete the expense
    } else {
      setConfirmDelete(true); // first click — arm the button
      setTimeout(() => setConfirmDelete(false), 2500); // auto-disarm after 2.5 seconds
    }
  };

  return (
    <div className="expense-item">

      {/* Coloured dot — category indicator, colour from CATEGORY_COLORS */}
      <div
        className="expense-category-dot"
        style={{ backgroundColor: color }}
      />

      {/* Expense info — title, category + date, optional description */}
      <div className="expense-info">
        <p className="expense-title">{expense.title}</p>
        <p className="expense-meta">
          {/* &middot; = · bullet separator */}
          {expense.category} &middot; {date}
        </p>
        {/* Only render description if it exists (not empty/undefined) */}
        {expense.description && (
          <p className="expense-desc">{expense.description}</p>
        )}
      </div>

      {/* Amount — displayed on the right side */}
      <p className="expense-amount">{amount}</p>

      {/* Action buttons — hidden by default, revealed on hover (CSS handles this) */}
      {/* On touch screens they're always visible (media query in index.css) */}
      <div className="expense-actions">

        {/* Edit button — passes the full expense object to onEdit */}
        {/* aria-label is for screen readers — says "Edit Coffee at Starbucks" */}
        <button
          className="btn-icon"
          onClick={() => onEdit(expense)}
          title="Edit"
          aria-label={`Edit ${expense.title}`}
        >
          ✎
        </button>

        {/* Delete button — changes appearance when armed (confirmDelete=true) */}
        {/* btn-danger adds a red background when armed */}
        <button
          className={`btn-icon ${confirmDelete ? 'btn-danger' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Confirm delete?' : 'Delete'}
          aria-label={confirmDelete ? `Confirm delete ${expense.title}` : `Delete ${expense.title}`}
        >
          {/* Shows ! when armed (dangerous), ✕ when normal */}
          {confirmDelete ? '!' : '✕'}
        </button>
      </div>
    </div>
  );
}
