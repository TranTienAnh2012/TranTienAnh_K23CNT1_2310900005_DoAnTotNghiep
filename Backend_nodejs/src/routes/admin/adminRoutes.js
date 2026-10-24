const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const academicController = require('../../controllers/admin/academicController');
const courseController = require('../../controllers/admin/courseController');
const examController = require('../../controllers/admin/examController');
const facultyOperationsController = require('../../controllers/admin/facultyOperationsController');
const upload = require('../../middlewares/uploadMiddleware');

// 1. Thống kê Dashboard
router.get('/dashboard/stats', userController.getDashboardStats);

// 2. Quản lý Tài khoản (Users)
router.get('/users', userController.getAllUsers);
router.post('/users/provision', userController.provisionAccount);
router.post('/users/bulk-provision', userController.bulkProvisionAccounts);
router.patch('/users/:id/toggle-active', userController.toggleUserActive);
router.patch('/users/:id/reset-password', userController.resetPassword);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// 3. Quản lý Giảng viên & Face AI
router.get('/teachers', userController.getAllTeachers);
router.post('/teachers', userController.createTeacher);
router.put('/teachers/:id', userController.updateTeacher);
router.delete('/teachers/:id', userController.deleteTeacher);
router.post('/teachers/:id/register-face', upload.single('avatar'), userController.registerTeacherFace);
router.delete('/teachers/:id/face', userController.deleteTeacherFace);

// 4. Quản lý Sinh viên & Face AI
router.get('/students', userController.getAllStudents);
router.post('/students', userController.createStudent);
router.put('/students/:id', userController.updateStudent);
router.delete('/students/:id', userController.deleteStudent);
router.post('/students/:id/register-face', upload.single('avatar'), userController.registerStudentFace);
router.delete('/students/:id/face', userController.deleteStudentFace);

// 5. Quản lý Khoa
router.get('/faculties', academicController.getFaculties);
router.post('/faculties', academicController.createFaculty);
router.put('/faculties/:id', academicController.updateFaculty);
router.delete('/faculties/:id', academicController.deleteFaculty);

// 5.1 Quản lý Ngành đào tạo (nganh_hoc)
router.get('/majors', academicController.getMajors);
router.post('/majors', academicController.createMajor);
router.put('/majors/:id', academicController.updateMajor);
router.delete('/majors/:id', academicController.deleteMajor);

// 6. Quản lý Lớp
router.get('/classes', academicController.getClasses);
router.post('/classes', academicController.createClass);
router.put('/classes/:id', academicController.updateClass);
router.delete('/classes/:id', academicController.deleteClass);
router.get('/classes/:classId/students', academicController.getClassStudents);

// 7. Quản lý Môn học
router.get('/subjects', academicController.getSubjects);
router.post('/subjects', academicController.createSubject);
router.put('/subjects/:id', academicController.updateSubject);
router.delete('/subjects/:id', academicController.deleteSubject);

// 8. Quản lý Học kỳ
router.get('/semesters', academicController.getSemesters);
router.post('/semesters', academicController.createSemester);
router.put('/semesters/:id', academicController.updateSemester);
router.delete('/semesters/:id', academicController.deleteSemester);

// 9. Quản lý Lớp học phần & Buổi học
router.get('/courses', courseController.getAllCourses);
router.post('/courses', courseController.createCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.get('/courses/:courseId/sessions', courseController.getSessionsByCourse);
router.get('/sessions', courseController.getAllSessions);
router.post('/sessions', courseController.createSession);
router.put('/sessions/:id', courseController.updateSession);
router.delete('/sessions/:id', courseController.deleteSession);
router.patch('/sessions/:id/toggle-active', courseController.toggleSessionActive);
router.get('/courses/:courseId/students', courseController.getCourseStudents);
router.post('/courses/:courseId/students', courseController.enrollStudent);
router.delete('/courses/:courseId/students/:studentId', courseController.removeStudentFromCourse);
router.patch('/courses/:courseId/students/:studentId/eligibility', courseController.toggleEligibility);

// 10. Quản lý Ca thi & Thí sinh
router.get('/exams', examController.getAllExams);
router.post('/exams', examController.createExam);
router.put('/exams/:id', examController.updateExam);
router.delete('/exams/:id', examController.deleteExam);
router.get('/exams/:examId/candidates', examController.getExamCandidates);
router.post('/exams/:examId/candidates', examController.assignCandidate);
router.patch('/exams/:id/toggle-active', examController.toggleExamActive);

// 11. Quản lý Cán bộ Quản lý Khoa (quan_ly_khoa)
router.get('/faculty-managers', facultyOperationsController.getFacultyManagers);
router.post('/faculty-managers', facultyOperationsController.createFacultyManager);
router.put('/faculty-managers/:id', facultyOperationsController.updateFacultyManager);
router.delete('/faculty-managers/:id', facultyOperationsController.deleteFacultyManager);

// 12. Quản lý Học phí & Xác nhận Công nợ (Kế toán / Admin duyệt tiền)
router.get('/tuition', facultyOperationsController.getAllTuition);
router.get('/tuition/faculty-rates', facultyOperationsController.getFacultyTuitionRates);
router.put('/tuition/faculty-rates/:id', facultyOperationsController.updateFacultyTuitionRates);
router.post('/tuition/apply-rate', facultyOperationsController.applyFacultyTuitionRate);
router.post('/tuition', facultyOperationsController.createTuition);
router.put('/tuition/:id', facultyOperationsController.updateTuition);
router.put('/tuition/:id/confirm', facultyOperationsController.confirmTuition);
router.delete('/tuition/:id', facultyOperationsController.deleteTuition);

module.exports = router;
