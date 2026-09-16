import { useEffect, useRef } from 'react';

/**
 * Minimal accessible dialog: escape closes it, the backdrop closes it, focus
 * moves inside on open and returns to the trigger on close.
 */
export default function Modal({ open, title, onClose, children, labelledBy = 'modal-title' }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusTarget = panelRef.current?.querySelector(
      'input, textarea, button, [href], select, [tabindex]:not([tabindex="-1"])'
    );
    focusTarget?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto bg-neutral-900/50 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="card relative w-full max-w-lg p-5 sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id={labelledBy}
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-50"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm h-8 w-8 p-0 text-lg leading-none"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
