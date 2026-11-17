export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: 'A meal record already exists for this date and meal type.' });
  }
  if (error?.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }
  const status = error.statusCode || 500;
  console.error(error);
  return res.status(status).json({
    success: false,
    message: status === 500 ? 'Something went wrong on the server.' : error.message
  });
}

