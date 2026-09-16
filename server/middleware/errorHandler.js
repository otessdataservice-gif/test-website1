const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Mongoose validation: surface the field messages, they are safe and useful.
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Malformed ObjectId in a route param should be a clean 400, not a crash.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id format';
  }

  // Duplicate key (email already registered).
  if (err.code === 11000) {
    statusCode = 409;
    message = 'That email address is already registered';
  }

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  }

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
    if (process.env.NODE_ENV === 'production') {
      // Never leak internals (stack traces, driver messages, connection strings).
      message = 'Something went wrong';
    }
  }

  res.status(statusCode).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
