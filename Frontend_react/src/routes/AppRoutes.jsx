import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../components/layouts/AdminLayout';
import TeacherLayout from '../components/layouts/TeacherLayout';
import StudentLayout from '../components/layouts/StudentLayout';

// Guard
import ProtectedRoute from './ProtectedRoute';

// Auth
import LoginPage from '../pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/students/StudentManagement';
import TeacherManagement from '../pages/admin/teachers/TeacherManagement';
import AccountManagement from '../pages/admin/accounts/AccountManagement';
import FacultyManagement from '../pages/admin/faculties/FacultyManagement';
import ClassManagement from '../pages/admin/classes/ClassManagement';
import SubjectManagement from '../pages/admin/subjects/SubjectManagement';
import SemesterManagement from '../pages/admin/semesters/SemesterManagement';
import CourseManagement from '../pages/admin/courses/CourseManagement';
import ScheduleManagement from '../pages/admin/schedules/ScheduleManagement';
import ExamManagement from '../pages/admin/exams/ExamManagement';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherFaceRegistration from '../pages/teacher/TeacherFaceRegistration';
import TeachingSchedule from '../pages/teacher/TeachingSchedule';
import AttendanceManager from '../pages/teacher/AttendanceManager';
import ExamSupervision from '../pages/teacher/ExamSupervision';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import FaceRegistration from '../pages/student/FaceRegistration';
import ClassCheckin from '../pages/student/ClassCheckin';
import ExamCheckin from '../pages/student/ExamCheckin';

import { useAuth } from '../hooks/useAuth';

export default function AppRoutes() {
  const { user } = useAuth();

  // Chuyển hướng người dùng đã đăng nhập về đúng phân hệ của họ
  const getHomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Trang đăng nhập công khai */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={getHomeRedirect()} />

      {/* Phân hệ 1: Quản trị viên (Role: admin) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* Người dùng & Tài khoản tách biệt */}
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="users" element={<Navigate to="/admin/students" replace />} />

          {/* Học thuật & Đào tạo tách biệt */}
          <Route path="faculties" element={<FacultyManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="semesters" element={<SemesterManagement />} />
          <Route path="academic" element={<Navigate to="/admin/faculties" replace />} />

          {/* Lớp học phần, Lịch học & Ca thi */}
          <Route path="courses" element={<CourseManagement />} />
          <Route path="schedules" element={<ScheduleManagement />} />
          <Route path="exams" element={<ExamManagement />} />
        </Route>
      </Route>


      {/* Phân hệ 2: Giảng viên (Role: teacher) */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="face-registration" element={<TeacherFaceRegistration />} />
          <Route path="schedule" element={<TeachingSchedule />} />
          <Route path="attendance" element={<AttendanceManager />} />
          <Route path="exams" element={<ExamSupervision />} />
        </Route>
      </Route>

      {/* Phân hệ 3: Sinh viên (Role: student) */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
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
