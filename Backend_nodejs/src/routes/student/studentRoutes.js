const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/student/profileController');
const attendanceController = require('../../controllers/student/attendanceController');
const examController = require('../../controllers/student/examController');
const resumeController = require('../../controllers/student/resumeController');
const academicController = require('../../controllers/student/academicController');
const upload = require('../../middlewares/uploadMiddleware');

// 1. Hồ sơ cá nhân cơ bản & Đăng ký khuôn mặt mẫu
router.get('/profile', profileController.getMyProfile);
router.post('/register-face', upload.single('avatar'), profileController.registerFace);

// 2. Sơ yếu lý lịch sinh viên chuyên sâu (Cập nhật hồ sơ, gia đình, tuyển sinh)
router.get('/resume', resumeController.getFullResume);
router.put('/resume/personal', resumeController.updatePersonalInfo);
router.post('/resume/family', resumeController.addFamilyMember);
router.put('/resume/family/:id', resumeController.updateFamilyMember);
router.delete('/resume/family/:id', resumeController.deleteFamilyMember);
router.put('/resume/admission', resumeController.updateAdmissionInfo);

const scheduleController = require('../../controllers/student/scheduleController');

// 3. Nghiệp vụ Đào tạo & Học tập
router.get('/curriculum', academicController.getCurriculum);
router.get('/grades', academicController.getGrades);
router.get('/academic-warnings', academicController.getAcademicWarnings);
router.get('/tuition', academicController.getTuition);
router.get('/conduct-scores', academicController.getConductScores);
router.post('/conduct-scores/self-evaluate', academicController.selfEvaluateConduct);
router.get('/rewards-disciplines', academicController.getRewardsAndDisciplines);
router.get('/feedback', academicController.getFeedbackHistory);
router.post('/feedback', academicController.submitFeedback);

// 3.1. Lịch học & Thời khóa biểu (Cá nhân hoặc băm nhỏ theo Khoa -> Lớp)
router.get('/schedule', scheduleController.getStudentSchedule);
router.get('/schedule/session/:sessionId/students', scheduleController.getSessionStudentDetails);

// 4. Điểm danh buổi học (Face AI + GPS)
router.get('/attendance/today', attendanceController.getTodaySessions);
router.get('/attendance/history', attendanceController.getAttendanceHistory);
router.post('/attendance/checkin', upload.single('captured_image'), attendanceController.checkinSession);

// 5. Check-in ca thi (Face AI + GPS)
router.get('/exams/my-exams', examController.getMyExams);
router.post('/exams/checkin', upload.single('captured_image'), examController.checkinExam);

module.exports = router;
