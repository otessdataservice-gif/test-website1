const mongoose = require('mongoose');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Loads a task that belongs to the authenticated user.
 *
 *   authenticated user id -> find task by id -> match task.user -> allow
 *
 * The ownership check is part of the query, so a user asking for someone
 * else's id gets the same 404 as an id that does not exist. Nothing about
 * another account's data leaks, not even whether the task exists.
 */
async function findOwnedTask(id, userId) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid task id');
  }

  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return task;
}

function validateTitle(value, { required }) {
  if (value === undefined) {
    if (required) throw new ApiError(400, 'Title is required');
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'Title must be text');
  }
  const title = value.trim();
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }
  if (title.length > 120) {
    throw new ApiError(400, 'Title must be 120 characters or fewer');
  }
  return title;
}

function validateDescription(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new ApiError(400, 'Description must be text');
  }
  const description = value.trim();
  if (description.length > 1000) {
    throw new ApiError(400, 'Description must be 1000 characters or fewer');
  }
  return description;
}

// GET /api/tasks
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { tasks } });
});

// GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  res.json({ success: true, data: { task } });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const title = validateTitle(req.body.title, { required: true });
  const description = validateDescription(req.body.description) || '';

  const task = await Task.create({
    title,
    description,
    completed: false,
    user: req.user._id, // taken from the token, never from the request body
  });

  res.status(201).json({ success: true, data: { task } });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);

  const title = validateTitle(req.body.title, { required: true });
  const description = validateDescription(req.body.description);

  task.title = title;
  if (description !== undefined) task.description = description;
  if (typeof req.body.completed === 'boolean') task.completed = req.body.completed;

  await task.save();

  res.json({ success: true, data: { task } });
});

// PATCH /api/tasks/:id/toggle
const toggleTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);

  task.completed = !task.completed;
  await task.save();

  res.json({ success: true, data: { task } });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  await task.deleteOne();

  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { getTasks, getTask, createTask, updateTask, toggleTask, deleteTask };
