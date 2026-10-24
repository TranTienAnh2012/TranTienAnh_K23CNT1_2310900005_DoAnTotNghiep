const express = require('express');
const router = express.Router();
const facultyController = require('../../controllers/faculty/facultyController');

// 1. Tổng quan Dashboard Khoa
router.get('/dashboard', facultyController.getDashboardStats);

// 2. Danh sách sinh viên & Chi tiết hồ sơ SV
router.get('/students', facultyController.getStudents);
router.get('/students/:id/resume', facultyController.getStudentResume);

// 3. Quản lý Khung CTĐT của Khoa
router.get('/curriculums', facultyController.getCurriculums);
router.post('/curriculums', facultyController.createCurriculum);
router.get('/curriculums/:id', facultyController.getCurriculumDetail);
router.post('/curriculums/:id/courses', facultyController.addCourseToCurriculum);
router.put('/curriculums/:id/courses/:courseId', facultyController.updateCourseInCurriculum);
router.post('/curriculums/:id/courses/bulk', facultyController.bulkAddCoursesToCurriculum);
router.delete('/curriculums/:id/courses/:courseId', facultyController.removeCourseFromCurriculum);

// 4. Quản lý Cảnh báo học vụ
router.get('/academic-warnings', facultyController.getAcademicWarnings);
router.post('/academic-warnings', facultyController.createAcademicWarning);

// 5. Phê duyệt Điểm rèn luyện
router.get('/conduct-scores', facultyController.getConductScores);
router.put('/conduct-scores/:id/approve', facultyController.approveConductScore);

// 6. Ý kiến / Khiếu nại từ Sinh viên trong Khoa
router.get('/feedback', facultyController.getFeedbacks);
router.put('/feedback/:id/reply', facultyController.replyFeedback);

// 7. Theo dõi Học phí & Công nợ sinh viên trong Khoa
router.get('/tuition', facultyController.getFacultyTuition);

module.exports = router;
