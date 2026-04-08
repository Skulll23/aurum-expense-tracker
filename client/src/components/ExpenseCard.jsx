import { useState } from 'react';
import { CATEGORY_COLORS, DEFAULT_COLOR } from '../constants.js';

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const color = CATEGORY_COLORS[expense.category] || DEFAULT_COLOR;

  const date = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const amount =
    '$' +
    Number(expense.amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(expense._id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <div className="expense-item">
      <div
        className="expense-category-dot"
        style={{ backgroundColor: color }}
      />
      <div className="expense-info">
        <p className="expense-title">{expense.title}</p>
        <p className="expense-meta">
          {expense.category} &middot; {date}
        </p>
        {expense.description && (
          <p className="expense-desc">{expense.description}</p>
        )}
      </div>
      <p className="expense-amount">{amount}</p>
      <div className="expense-actions">
        <button
          className="btn-icon"
          onClick={() => onEdit(expense)}
          title="Edit"
          aria-label={`Edit ${expense.title}`}
        >
          ✎
        </button>
        <button
          className={`btn-icon ${confirmDelete ? 'btn-danger' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Confirm delete?' : 'Delete'}
          aria-label={confirmDelete ? `Confirm delete ${expense.title}` : `Delete ${expense.title}`}
        >
          {confirmDelete ? '!' : '✕'}
        </button>
      </div>
    </div>
  );
}
