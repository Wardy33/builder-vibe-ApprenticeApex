export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('Error caught by middleware:', err);

  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error: any) => error.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      details: 'The provided ID is not valid'
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: 'Duplicate Error',
      details: `${field} already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      details: 'Please provide a valid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      details: 'Authentication token has expired'
    });
  }

  // Handle MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    return res.status(503).json({
      success: false,
      error: 'Database Connection Error',
      details: 'Unable to connect to database'
    });
  }

  // Handle timeout errors
  if (err.name === 'MongooseError' && err.message.includes('timeout')) {
    return res.status(504).json({
      success: false,
      error: 'Request Timeout',
      details: 'Database operation timed out'
    });
  }

  // Handle async errors that don't have proper status codes
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};