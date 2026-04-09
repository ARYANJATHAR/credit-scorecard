function errorHandler(err, _req, res, _next) {
  console.error('Server error:', err);

  const isDatabaseValidationError = ['22P02', '23502', '23514'].includes(err.code);
  const statusCode = err.statusCode || (isDatabaseValidationError ? 400 : 500);

  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (err.appCode) {
    code = err.appCode;
    message = err.message || message;
  } else if (isDatabaseValidationError) {
    code = 'VALIDATION_ERROR';
    message = 'Invalid input data';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details && { details: err.details }),
    },
  });
}

module.exports = { errorHandler };
