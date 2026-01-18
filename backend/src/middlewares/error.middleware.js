const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, errorCode = 'SERVER_ERROR' } = err;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  
  if (err.code === 11000) {
    statusCode = 400;
    errorCode = 'DATABASE_ERROR';
    message = 'Duplicate field value entered';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // Log error for debugging
  console.error(`Error ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 
      (statusCode >= 500 ? 'Internal server error' : message) : message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorCode: 'ROUTE_NOT_FOUND'
  });
};

export { errorHandler, notFound };
