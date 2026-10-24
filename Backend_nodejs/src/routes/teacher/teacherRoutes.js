const express = require('express');
const router = express.Router();
const scheduleController = require('../../controllers/teacher/scheduleController');
const attendanceController = require('../../controllers/teacher/attendanceController');
const examController = require('../../controllers/teacher/examController');
const upload = require('../../middlewares/uploadMiddleware');

// 1. Hồ sơ cá nhân & Đăng ký khuôn mặt giảng viên
router.get('/profile', scheduleController.getMyProfile);
router.post('/register-face', upload.single('avatar'), scheduleController.registerFace);
router.post('/detect-pose', upload.single('frame'), scheduleController.detectPose);


// 2. Lịch dạy & Lớp học phần phân công (theo Khoa của Giảng viên)
router.get('/courses', scheduleController.getMyCourses);
router.get('/schedule', scheduleController.getMySchedule);
router.get('/students', scheduleController.getFacultyStudents);
router.get('/faculty-students', scheduleController.getFacultyStudents);

// 3. Điểm danh buổi học & Manual Override
router.get('/sessions/:sessionId/attendance', attendanceController.getSessionAttendance);
router.post('/sessions/:sessionId/attendance/override', attendanceController.manualOverride);

// 4. Giám sát ca thi
router.get('/exams', examController.getExamList);
router.get('/exams/:examId/supervision', examController.getExamSupervision);
router.patch('/exams/:examId/candidates/status', examController.updateCandidateStatus);

module.exports = router;
