// ============================================================
// client/src/components/Toast.jsx — NOTIFICATION TOASTS
//
// Displays temporary pop-up notifications at the bottom-right
// of the screen after user actions (add, edit, delete, errors).
//
// HOW TOASTS WORK:
//   - App.jsx maintains a `toasts` array in state
//   - addToast() pushes a new toast object: { id, message, type }
//   - A setTimeout in addToast() removes it after 3.5 seconds
//   - This component just renders whatever is in the toasts array
//
// TOAST TYPES (each gets a different colour via CSS):
//   success  — green  — "Expense added successfully"
//   error    — red    — "Failed to connect to server"
//   info     — blue   — "Expense deleted"
//   warning  — yellow — (available but not currently used)
//
// PROPS:
//   toasts — array of { id, message, type } from App.jsx state
// ============================================================

export default function Toast({ toasts }) {

  // If there are no toasts, render nothing at all
  if (toasts.length === 0) return null;

  return (
    // Fixed-position container — always at bottom-right of the screen
    <div className="toast-container">
      {toasts.map((toast) => (
        // Each toast gets a unique key (its id) so React can track it
        // toast-success / toast-error / toast-info classes set the colour
        <div key={toast.id} className={`toast toast-${toast.type}`}>

          {/* Icon — different symbol per type */}
          <span className="toast-icon">
            {toast.type === 'success'
              ? '✓'      // checkmark for success
              : toast.type === 'error'
              ? '✕'      // X for error
              : 'ℹ'}    {/* info symbol for everything else */}
          </span>

          {/* The notification message text */}
          {toast.message}
        </div>
      ))}
    </div>
  );
}
