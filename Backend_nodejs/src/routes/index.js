const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const authRoutes = require('./authRoutes');
const adminRoutes = require('./admin/adminRoutes');
const facultyRoutes = require('./faculty/facultyRoutes');
const teacherRoutes = require('./teacher/teacherRoutes');
const studentRoutes = require('./student/studentRoutes');

// Nhánh API Công khai & Xác thực chung
router.use('/auth', authRoutes);

// Phân hệ Quản trị viên (Khóa quyền Role 'admin')
router.use('/admin', authMiddleware, roleMiddleware('admin'), adminRoutes);

// Phân hệ Quản lý Khoa (Khóa quyền Role 'faculty_manager', hoặc 'admin')
router.use('/faculty', authMiddleware, roleMiddleware(['faculty_manager', 'admin']), facultyRoutes);

// Phân hệ Giảng viên (Khóa quyền Role 'teacher')
router.use('/teacher', authMiddleware, roleMiddleware('teacher'), teacherRoutes);

// Phân hệ Sinh viên (Khóa quyền Role 'student')
router.use('/student', authMiddleware, roleMiddleware('student'), studentRoutes);

module.exports = router;
