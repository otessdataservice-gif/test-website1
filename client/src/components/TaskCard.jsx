function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function TaskCard({ task, busy, onToggle, onEdit, onDelete }) {
  const { completed } = task;

  return (
    <li className="card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        {/* accent-color keeps the tick emerald in both themes with no forms plugin */}
        <input
          id={`task-${task._id}`}
          type="checkbox"
          checked={completed}
          disabled={busy}
          onChange={() => onToggle(task)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-emerald-600 disabled:cursor-not-allowed"
          aria-label={completed ? `Mark "${task.title}" as active` : `Mark "${task.title}" as completed`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <label
              htmlFor={`task-${task._id}`}
              className={`cursor-pointer break-words text-base font-medium ${
                completed
                  ? 'text-neutral-500 line-through dark:text-neutral-500'
                  : 'text-neutral-900 dark:text-neutral-50'
              }`}
            >
              {task.title}
            </label>

            {/* Text, not just colour, so the status is readable either way. */}
            <span
              className={`rounded border px-1.5 py-0.5 text-xs font-medium ${
                completed
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'border-neutral-300 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {completed ? 'Completed' : 'Active'}
            </span>
          </div>

          {task.description && (
            <p
              className={`mt-1.5 whitespace-pre-line break-words text-sm ${
                completed
                  ? 'text-neutral-400 dark:text-neutral-500'
                  : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {task.description}
            </p>
          )}

          <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
            Created {formatDate(task.createdAt)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onToggle(task)}
              disabled={busy}
              className="btn btn-secondary btn-sm"
            >
              {completed ? 'Mark active' : 'Mark complete'}
            </button>
            <button
              type="button"
              onClick={() => onEdit(task)}
              disabled={busy}
              className="btn btn-secondary btn-sm"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              disabled={busy}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
