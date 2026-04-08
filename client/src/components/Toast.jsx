export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success'
              ? '✓'
              : toast.type === 'error'
              ? '✕'
              : 'ℹ'}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
