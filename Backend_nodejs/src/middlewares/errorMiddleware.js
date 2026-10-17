/**
 * errorMiddleware - Xử lý bắt lỗi tập trung toàn hệ thống SmartEdu Backend
 */
function errorMiddleware(err, req, res, next) {
  console.error('[Error Occurred]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Đã có lỗi hệ thống xảy ra trên server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorMiddleware;
