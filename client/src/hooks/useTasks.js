import { useCallback, useEffect, useMemo, useState } from 'react';
import { taskAPI } from '../services/api';

/**
 * Owns the task list and every API call that changes it. The dashboard stays a
 * presentation component, and no component calls fetch on its own.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  // Ids of tasks with a request in flight, so only those buttons disable.
  const [busyIds, setBusyIds] = useState([]);

  const markBusy = useCallback((id, busy) => {
    setBusyIds((current) =>
      busy ? [...current, id] : current.filter((busyId) => busyId !== id)
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await taskAPI.getTasks();
      setTasks(data.tasks);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = useCallback(async (payload) => {
    const data = await taskAPI.createTask(payload);
    setTasks((current) => [data.task, ...current]);
    return data.task;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const data = await taskAPI.updateTask(id, payload);
    setTasks((current) => current.map((task) => (task._id === id ? data.task : task)));
    return data.task;
  }, []);

  const toggleTask = useCallback(
    async (id) => {
      markBusy(id, true);
      try {
        const data = await taskAPI.toggleTask(id);
        setTasks((current) => current.map((task) => (task._id === id ? data.task : task)));
        return data.task;
      } finally {
        markBusy(id, false);
      }
    },
    [markBusy]
  );

  const deleteTask = useCallback(
    async (id) => {
      markBusy(id, true);
      try {
        await taskAPI.deleteTask(id);
        setTasks((current) => current.filter((task) => task._id !== id));
      } finally {
        markBusy(id, false);
      }
    },
    [markBusy]
  );

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return { total: tasks.length, completed, pending: tasks.length - completed };
  }, [tasks]);

  return {
    tasks,
    stats,
    loading,
    loadError,
    busyIds,
    reload: load,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
}
