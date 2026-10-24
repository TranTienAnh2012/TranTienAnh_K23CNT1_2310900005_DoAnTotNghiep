import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../components/layouts/AdminLayout';
import FacultyLayout from '../components/layouts/FacultyLayout';
import TeacherLayout from '../components/layouts/TeacherLayout';
import StudentLayout from '../components/layouts/StudentLayout';
import UniversityLandingLayout from '../components/layouts/landing/UniversityLandingLayout';
import AdmissionsLandingLayout from '../components/layouts/landing/AdmissionsLandingLayout';

// Guard
import ProtectedRoute from './ProtectedRoute';

// Public & Auth Pages
import LoginPage from '../pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/students/StudentManagement';
import TeacherManagement from '../pages/admin/teachers/TeacherManagement';
import AccountManagement from '../pages/admin/accounts/AccountManagement';
import FacultyManagement from '../pages/admin/faculties/FacultyManagement';
import MajorManagement from '../pages/admin/majors/MajorManagement';
import ClassManagement from '../pages/admin/classes/ClassManagement';
import SubjectManagement from '../pages/admin/subjects/SubjectManagement';
import SemesterManagement from '../pages/admin/semesters/SemesterManagement';
import CourseManagement from '../pages/admin/courses/CourseManagement';
import ScheduleManagement from '../pages/admin/schedules/ScheduleManagement';
import ExamManagement from '../pages/admin/exams/ExamManagement';
import FaceRegistrationManagement from '../pages/admin/face/FaceRegistrationManagement';
import FacultyManagerManagement from '../pages/admin/faculties/FacultyManagerManagement';
import TuitionManagement from '../pages/admin/tuition/TuitionManagement';

// Faculty Manager Pages (Role: faculty_manager)
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyCurriculumManager from '../pages/faculty/FacultyCurriculumManager';
import FacultyStudentManager from '../pages/faculty/FacultyStudentManager';
import FacultyWarningsManager from '../pages/faculty/FacultyWarningsManager';
import FacultyTuitionManager from '../pages/faculty/FacultyTuitionManager';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeachingSchedule from '../pages/teacher/TeachingSchedule';
import AttendanceManager from '../pages/teacher/AttendanceManager';
import ExamSupervision from '../pages/teacher/ExamSupervision';
import TeacherFacultyStudentManager from '../pages/teacher/FacultyStudentManager';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentResume from '../pages/student/StudentResume';
import StudentCurriculum from '../pages/student/StudentCurriculum';
import StudentGrades from '../pages/student/StudentGrades';
import StudentTuition from '../pages/student/StudentTuition';
import StudentAcademicWarnings from '../pages/student/StudentAcademicWarnings';
import FaceRegistration from '../pages/student/FaceRegistration';
import ClassCheckin from '../pages/student/ClassCheckin';
import ExamCheckin from '../pages/student/ExamCheckin';
import StudentSchedule from '../pages/student/StudentSchedule';

import { useAuth } from '../hooks/useAuth';

export default function AppRoutes() {
  const { user } = useAuth();

  // Chuyển hướng người dùng đã đăng nhập về đúng phân hệ của họ
  const getHomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'faculty_manager') return <Navigate to="/faculty" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* 1. Giao diện 1: Trang chủ tổng quan Trường Đại học Nguyễn Trãi (Layout bên trái) */}
      <Route path="/" element={<UniversityLandingLayout />} />
      <Route path="/landing" element={<UniversityLandingLayout />} />

      {/* 2. Giao diện 2: Cổng Tuyển sinh Đại học Nguyễn Trãi 2026 (Layout bên phải) */}
      <Route path="/tuyensinh" element={<AdmissionsLandingLayout />} />
      <Route path="/admissions" element={<AdmissionsLandingLayout />} />
      <Route path="/landing/admissions" element={<AdmissionsLandingLayout />} />
      <Route path="/landing/tuyensinh" element={<AdmissionsLandingLayout />} />

      {/* 3. Trang đăng nhập công khai Cổng SmartEdu */}
      <Route path="/login" element={<LoginPage />} />

      {/* Phân hệ 1: Quản trị viên (Role: admin) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="faculty-managers" element={<FacultyManagerManagement />} />
          <Route path="face-registration" element={<FaceRegistrationManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="users" element={<Navigate to="/admin/students" replace />} />

          <Route path="faculties" element={<FacultyManagement />} />
          <Route path="majors" element={<MajorManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="curriculums" element={<FacultyCurriculumManager />} />
          <Route path="academic-warnings" element={<FacultyWarningsManager />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="semesters" element={<SemesterManagement />} />
          <Route path="academic" element={<Navigate to="/admin/faculties" replace />} />

          {/* Học phí & Công nợ */}
          <Route path="tuition" element={<TuitionManagement />} />

          <Route path="courses" element={<CourseManagement />} />
          <Route path="schedules" element={<ScheduleManagement />} />
          <Route path="exams" element={<ExamManagement />} />
        </Route>
      </Route>

      {/* Phân hệ 2: Quản lý Khoa (Role: faculty_manager & admin) */}
      <Route element={<ProtectedRoute allowedRoles={['faculty_manager', 'admin']} />}>
        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<FacultyDashboard />} />
          <Route path="curriculums" element={<FacultyCurriculumManager />} />
          <Route path="students" element={<FacultyStudentManager />} />
          <Route path="tuition" element={<FacultyTuitionManager />} />
          <Route path="warnings" element={<FacultyWarningsManager />} />
        </Route>
      </Route>

      {/* Phân hệ 3: Giảng viên (Role: teacher) */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="schedule" element={<TeachingSchedule />} />
          <Route path="students" element={<TeacherFacultyStudentManager />} />
          <Route path="attendance" element={<AttendanceManager />} />
          <Route path="exams" element={<ExamSupervision />} />
          <Route path="face-registration" element={<Navigate to="/teacher/schedule" replace />} />
        </Route>
      </Route>

      {/* Phân hệ 4: Sinh viên (Role: student) */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="resume" element={<StudentResume />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="curriculum" element={<StudentCurriculum />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="tuition" element={<StudentTuition />} />
          <Route path="warnings" element={<StudentAcademicWarnings />} />
          <Route path="face-registration" element={<FaceRegistration />} />
          <Route path="checkin" element={<ClassCheckin />} />
          <Route path="exam-checkin" element={<ExamCheckin />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
