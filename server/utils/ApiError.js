/**
 * Error with an HTTP status attached. Anything thrown that is not an ApiError
 * is treated as an unexpected 500 by the error handler.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
