import { useEffect, useState } from 'react';
import Modal from './Modal';

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 1000;

/** One form for both creating and editing. `task` null means create. */
export default function TaskFormModal({ open, task, saving, onClose, onSubmit }) {
  const isEdit = Boolean(task);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setError('');
  }, [open, task]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a title.');
      return;
    }
    if (trimmed.length > MAX_TITLE) {
      setError(`Title must be ${MAX_TITLE} characters or fewer.`);
      return;
    }

    setError('');
    await onSubmit({ title: trimmed, description: description.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={isEdit ? 'Edit task' : 'Create task'}
      labelledBy="task-form-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <label htmlFor="task-title" className="label">
              Title
            </label>
            <input
              id="task-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_TITLE}
              placeholder="Send the weekly report"
              disabled={saving}
              required
              aria-describedby={error ? 'task-form-error' : undefined}
            />
          </div>

          <div>
            <label htmlFor="task-description" className="label">
              Description <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              id="task-description"
              className="input min-h-[96px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_DESCRIPTION}
              placeholder="Anything you need to remember about this task."
              disabled={saving}
            />
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              {description.length}/{MAX_DESCRIPTION}
            </p>
          </div>

          {error && (
            <p
              id="task-form-error"
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
