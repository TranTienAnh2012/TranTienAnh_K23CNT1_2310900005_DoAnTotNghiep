/**
 * roleMiddleware - Giới hạn quyền truy cập theo danh sách Role được phép
 * @param {Array<string>|string} allowedRoles - Danh sách role: 'admin', 'teacher', 'student'
 */
function roleMiddleware(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Truy cập bị từ chối. Yêu cầu quyền: [${roles.join(', ')}], quyền hiện tại: [${req.user.role}].`
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
