/**
 * Global error handler middleware.
 * Must be the last middleware registered in index.js.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${new Date().toISOString()}] ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Helper to create structured errors with custom status codes.
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { errorHandler, createError };
