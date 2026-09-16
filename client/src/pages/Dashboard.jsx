import { useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatsCards from '../components/StatsCards';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const {
    tasks,
    stats,
    loading,
    loadError,
    busyIds,
    reload,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const [filter, setFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filtering is a local operation, no extra request per tab.
  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((task) => !task.completed);
    if (filter === 'completed') return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask._id, payload);
        toast.success('Task updated');
      } else {
        await createTask(payload);
        toast.success('Task created');
      }
      setFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task) => {
    try {
      const updated = await toggleTask(task._id);
      toast.success(updated.completed ? 'Task completed' : 'Task moved back to active');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await deleteTask(taskToDelete._id);
      toast.success('Task deleted');
      setTaskToDelete(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <Header variant="app" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Your tasks
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {user ? `${user.name}, ` : ''}
              {stats.pending === 0
                ? 'nothing is pending right now.'
                : `${stats.pending} task${stats.pending === 1 ? '' : 's'} still pending.`}
            </p>
          </div>

          <button type="button" onClick={openCreate} className="btn btn-primary self-start sm:self-auto">
            <span aria-hidden="true">+</span> Create Task
          </button>
        </div>

        <div className="mt-6">
          <StatsCards stats={stats} />
        </div>

        {/* Segmented control: square-ish, joined, not oversized pills. */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700"
            role="group"
            aria-label="Filter tasks"
          >
            {FILTERS.map((item, index) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  aria-pressed={active}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    index > 0 ? 'border-l border-neutral-300 dark:border-neutral-700' : ''
                  } ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {visibleTasks.length} of {stats.total}
          </p>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="card flex items-center justify-center p-10">
              <Spinner label="Loading your tasks" />
            </div>
          ) : loadError ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-red-700 dark:text-red-400">{loadError}</p>
              <button type="button" onClick={reload} className="btn btn-secondary mt-4">
                Try again
              </button>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="card p-10 text-center">
              <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                {stats.total === 0
                  ? 'No tasks yet'
                  : filter === 'completed'
                    ? 'Nothing completed yet'
                    : 'Nothing active right now'}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
                {stats.total === 0
                  ? 'Create your first task and it will show up here straight away.'
                  : 'Switch to another filter to see the rest of your list.'}
              </p>
              {stats.total === 0 && (
                <button type="button" onClick={openCreate} className="btn btn-primary mt-5">
                  <span aria-hidden="true">+</span> Create Task
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  busy={busyIds.includes(task._id)}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={setTaskToDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </main>

      <Footer />

      <TaskFormModal
        open={formOpen}
        task={editingTask}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Delete task"
        message={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}"? This cannot be undone.`
            : ''
        }
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => (deleting ? null : setTaskToDelete(null))}
      />
    </div>
  );
}
