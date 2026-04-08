import { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../constants.js';

export default function ExpenseModal({ expense, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);

  // Pre-fill form when editing an existing expense
  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date).toISOString().split('T')[0],
        description: expense.description || '',
      });
    }
  }, [expense]);

  // Auto-focus first input and handle Escape key for keyboard accessibility
  useEffect(() => {
    firstInputRef.current?.focus();
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      errs.amount = 'Valid amount required';
    }
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="expense-modal-title">
            {expense ? 'Edit Expense' : 'New Expense'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="expense-title">Title</label>
            <input
              id="expense-title"
              ref={firstInputRef}
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              type="text"
              placeholder="e.g. Coffee at Starbucks"
              value={form.title}
              onChange={set('title')}
              maxLength={100}
              aria-describedby={errors.title ? 'title-error' : undefined}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="form-error" id="title-error" role="alert">{errors.title}</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="expense-amount">Amount ($)</label>
              <input
                id="expense-amount"
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={set('amount')}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && (
                <p className="form-error" id="amount-error" role="alert">{errors.amount}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">Date</label>
              <input
                id="expense-date"
                className={`form-input ${errors.date ? 'input-error' : ''}`}
                type="date"
                value={form.date}
                onChange={set('date')}
                aria-describedby={errors.date ? 'date-error' : undefined}
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <p className="form-error" id="date-error" role="alert">{errors.date}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expense-category">Category</label>
            <select
              id="expense-category"
              className="form-input"
              value={form.category}
              onChange={set('category')}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expense-description">
              Description{' '}
              <span className="form-optional">(optional)</span>
            </label>
            <textarea
              id="expense-description"
              className="form-input form-textarea"
              placeholder="Add a note..."
              value={form.description}
              onChange={set('description')}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
