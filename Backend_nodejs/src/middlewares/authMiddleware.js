const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { pool } = require('../config/db');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy mã xác thực (Token). Vui lòng đăng nhập.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Phiên làm việc đã hết hạn hoặc token không hợp lệ.'
      });
    }

    // Kiểm tra tài khoản trong database
    const [rows] = await pool.execute(
      'SELECT id, username, role, is_active FROM users WHERE id = ? AND is_deleted = FALSE',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống.'
      });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    // Gắn thông tin profile chi tiết theo Role
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    if (user.role === 'teacher') {
      const [gvRows] = await pool.execute(
        'SELECT id, ma_gv, ho_ten, email, khoa_id FROM giang_vien WHERE user_id = ? AND is_deleted = FALSE',
        [user.id]
      );
      if (gvRows.length > 0) {
        req.user.teacherProfile = gvRows[0];
      }
    } else if (user.role === 'student') {
      const [svRows] = await pool.execute(
        'SELECT id, ma_sv, ho_ten, email, lop_id, avatar_url, (face_embedding IS NOT NULL) AS has_face_registered FROM sinh_vien WHERE user_id = ? AND is_deleted = FALSE',
        [user.id]
      );
      if (svRows.length > 0) {
        req.user.studentProfile = svRows[0];
      }
    } else if (user.role === 'faculty_manager') {
      const [qlkRows] = await pool.execute(
        'SELECT qlk.id, qlk.ma_can_bo, qlk.ho_ten, qlk.email, qlk.khoa_id, qlk.chuc_vu, k.ma_khoa, k.ten_khoa FROM quan_ly_khoa qlk JOIN khoa k ON qlk.khoa_id = k.id WHERE qlk.user_id = ? AND qlk.is_deleted = FALSE',
        [user.id]
      );
      if (qlkRows.length > 0) {
        req.user.facultyProfile = qlkRows[0];
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng: ' + error.message
    });
  }
}

module.exports = authMiddleware;
