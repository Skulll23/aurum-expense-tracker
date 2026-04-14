// ============================================================
// client/src/components/ExpenseModal.jsx — ADD / EDIT FORM MODAL
//
// A popup dialog for creating a new expense or editing an existing one.
// The same component handles both modes:
//   - ADD mode:  expense prop is null → blank form, "New Expense" title
//   - EDIT mode: expense prop is an object → pre-filled form, "Edit Expense" title
//
// KEY CONCEPTS:
//
// CONTROLLED INPUTS — React owns the form values, not the DOM.
//   Every input has value={form.title} and onChange={set('title')}.
//   Each keystroke updates the form state → React re-renders the input.
//   The DOM never holds the data — React's state does.
//
// useRef — grabs the first input's DOM node to call .focus() on it.
//   Unlike state, updating a ref doesn't cause a re-render.
//   Used here just to auto-focus the title field when the modal opens.
//
// useEffect #1 — pre-fills the form when editing an existing expense.
// useEffect #2 — auto-focuses the first input and sets up Escape key listener.
//   The cleanup function (return) removes the event listener when modal closes.
//
// ACCESSIBILITY:
//   role="dialog"            → tells screen readers this is a modal
//   aria-modal="true"        → tells screen readers to ignore background content
//   aria-labelledby          → links the modal to its title heading
//   aria-invalid             → marks invalid fields for screen readers
//   aria-describedby         → links inputs to their error messages
//   role="alert"             → makes error messages announced immediately
//
// PROPS:
//   expense   — null (add mode) or expense object (edit mode)
//   onClose   — function to close the modal
//   onSubmit  — function called with form data when saved
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../constants.js';

export default function ExpenseModal({ expense, onClose, onSubmit }) {

  // form state — holds the current values of all form fields
  // Initialised with sensible defaults for the add mode
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0], // today's date in YYYY-MM-DD format
    description: '',
  });

  // submitting state — disables the submit button while the API call is in progress
  // Prevents double-submitting if the user clicks Save twice quickly
  const [submitting, setSubmitting] = useState(false);

  // errors state — holds validation error messages per field
  // { title: 'Title is required', amount: 'Valid amount required' }
  const [errors, setErrors] = useState({});

  // ref to the first input (title) — used to auto-focus when modal opens
  const firstInputRef = useRef(null);

  // ── EFFECT 1: Pre-fill form when editing ─────────────────────
  // Runs once when the component mounts (or if expense prop changes)
  // If we're in edit mode, fill all fields with the existing expense data
  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        // Convert MongoDB date to YYYY-MM-DD format for the date input
        date: new Date(expense.date).toISOString().split('T')[0],
        description: expense.description || '',
      });
    }
  }, [expense]); // re-run if expense prop changes

  // ── EFFECT 2: Auto-focus and Escape key ──────────────────────
  // Auto-focus: makes the title input active immediately on open
  // Escape key: pressing Escape closes the modal (keyboard accessibility)
  // The cleanup function removes the event listener when the modal unmounts
  // (without cleanup, multiple listeners would stack up)
  useEffect(() => {
    firstInputRef.current?.focus(); // ?. = optional chaining, safe if ref is null
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown); // cleanup
  }, [onClose]);

  // ── VALIDATION ───────────────────────────────────────────────
  // Checks the form fields before submitting
  // Returns an object of { fieldName: errorMessage } pairs
  // Empty object = no errors = form is valid
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      errs.amount = 'Valid amount required';
    }
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  // ── SUBMIT HANDLER ───────────────────────────────────────────
  // Called when the form is submitted (Save button or Enter key)
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent the browser's default form submission (page reload)

    // Run validation — if there are errors, show them and stop
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true); // disable button while waiting for API
    try {
      // Convert amount to a number (form inputs always return strings)
      await onSubmit({ ...form, amount: Number(form.amount) });
    } finally {
      setSubmitting(false); // re-enable button whether success or failure
    }
  };

  // ── set HELPER ───────────────────────────────────────────────
  // Returns an onChange handler for the given field name
  // This pattern avoids writing separate onChange for each input
  // Also clears the error for that field as soon as the user starts typing
  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value })); // update just this field
    setErrors((er) => ({ ...er, [field]: undefined }));  // clear this field's error
  };

  return (
    // Overlay — clicking outside the modal (on the dark background) closes it
    // e.target === e.currentTarget checks if the click was on the overlay itself
    // (not on the modal box inside it)
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"  {/* links to the h2 below */}
    >
      <div className="modal">

        {/* Modal header — title + close button */}
        <div className="modal-header">
          <h2 className="modal-title" id="expense-modal-title">
            {/* Ternary: if editing show "Edit Expense", else "New Expense" */}
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

        {/* noValidate disables browser's built-in validation popups
            so our custom error messages show instead */}
        <form onSubmit={handleSubmit} className="modal-form" noValidate>

          {/* TITLE FIELD */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-title">Title</label>
            <input
              id="expense-title"
              ref={firstInputRef}            {/* auto-focus on mount */}
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              type="text"
              placeholder="e.g. Coffee at Starbucks"
              value={form.title}
              onChange={set('title')}
              maxLength={100}
              aria-describedby={errors.title ? 'title-error' : undefined}
              aria-invalid={!!errors.title}  {/* !! converts to boolean */}
            />
            {/* Error message — only rendered when there's an error */}
            {errors.title && (
              <p className="form-error" id="title-error" role="alert">{errors.title}</p>
            )}
          </div>

          {/* AMOUNT + DATE — side by side in a two-column row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="expense-amount">Amount ($)</label>
              <input
                id="expense-amount"
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                type="number"
                step="0.01"   {/* allows cents */}
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

          {/* CATEGORY DROPDOWN */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-category">Category</label>
            <select
              id="expense-category"
              className="form-input"
              value={form.category}
              onChange={set('category')}
            >
              {/* Render one <option> for each category from constants.js */}
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION TEXTAREA — optional */}
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

          {/* FORM ACTIONS — Cancel and Save buttons */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {/* Show "Saving..." while the API call is in progress */}
              {submitting ? 'Saving...' : expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
