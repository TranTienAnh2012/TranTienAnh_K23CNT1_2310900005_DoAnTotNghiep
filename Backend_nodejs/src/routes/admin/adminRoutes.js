const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const academicController = require('../../controllers/admin/academicController');
const courseController = require('../../controllers/admin/courseController');
const examController = require('../../controllers/admin/examController');

// 1. Thống kê Dashboard
router.get('/dashboard/stats', userController.getDashboardStats);

// 2. Quản lý Tài khoản (Users)
router.get('/users', userController.getAllUsers);
router.post('/users/provision', userController.provisionAccount);
router.patch('/users/:id/toggle-active', userController.toggleUserActive);
router.patch('/users/:id/reset-password', userController.resetPassword);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// 3. Quản lý Giảng viên
router.get('/teachers', userController.getAllTeachers);
router.post('/teachers', userController.createTeacher);
router.put('/teachers/:id', userController.updateTeacher);
router.delete('/teachers/:id', userController.deleteTeacher);

// 4. Quản lý Sinh viên
router.get('/students', userController.getAllStudents);
router.post('/students', userController.createStudent);
router.put('/students/:id', userController.updateStudent);
router.delete('/students/:id', userController.deleteStudent);

// 5. Quản lý Khoa
router.get('/faculties', academicController.getFaculties);
router.post('/faculties', academicController.createFaculty);
router.put('/faculties/:id', academicController.updateFaculty);
router.delete('/faculties/:id', academicController.deleteFaculty);

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

module.exports = router;
