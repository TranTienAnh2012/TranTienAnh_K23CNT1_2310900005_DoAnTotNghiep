const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/student/profileController');
const attendanceController = require('../../controllers/student/attendanceController');
const examController = require('../../controllers/student/examController');
const upload = require('../../middlewares/uploadMiddleware');

// 1. Thông tin cá nhân & Đăng ký khuôn mặt mẫu
router.get('/profile', profileController.getMyProfile);
router.post('/register-face', upload.single('avatar'), profileController.registerFace);

// 2. Điểm danh buổi học (Face AI + GPS)
router.get('/attendance/today', attendanceController.getTodaySessions);
router.get('/attendance/history', attendanceController.getAttendanceHistory);
router.post('/attendance/checkin', upload.single('captured_image'), attendanceController.checkinSession);

// 3. Check-in ca thi (Face AI + GPS)
router.get('/exams/my-exams', examController.getMyExams);
router.post('/exams/checkin', upload.single('captured_image'), examController.checkinExam);

module.exports = router;
