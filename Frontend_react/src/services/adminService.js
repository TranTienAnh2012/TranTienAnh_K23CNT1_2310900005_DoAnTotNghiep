import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/dashboard/stats'),

  // Users & Roles
  getUsers: () => api.get('/admin/users'),
  provisionUser: (data) => api.post('/admin/users/provision', data),
  bulkProvisionUsers: (data) => api.post('/admin/users/bulk-provision', data),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
  resetUserPassword: (id, data) => api.patch(`/admin/users/${id}/reset-password`, data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getTeachers: () => api.get('/admin/teachers'),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  registerTeacherFace: (id, formData) =>
    api.post(`/admin/teachers/${id}/register-face`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteTeacherFace: (id) => api.delete(`/admin/teachers/${id}/face`),

  getStudents: () => api.get('/admin/students'),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  registerStudentFace: (id, formData) =>
    api.post(`/admin/students/${id}/register-face`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteStudentFace: (id) => api.delete(`/admin/students/${id}/face`),

  // Academic
  getFaculties: () => api.get('/admin/faculties'),
  createFaculty: (data) => api.post('/admin/faculties', data),
  updateFaculty: (id, data) => api.put(`/admin/faculties/${id}`, data),
  deleteFaculty: (id) => api.delete(`/admin/faculties/${id}`),

  getClasses: () => api.get('/admin/classes'),
  createClass: (data) => api.post('/admin/classes', data),
  updateClass: (id, data) => api.put(`/admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  getClassStudents: (classId) => api.get(`/admin/classes/${classId}/students`),

  getSubjects: () => api.get('/admin/subjects'),
  createSubject: (data) => api.post('/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),

  getSemesters: () => api.get('/admin/semesters'),
  createSemester: (data) => api.post('/admin/semesters', data),
  updateSemester: (id, data) => api.put(`/admin/semesters/${id}`, data),
  deleteSemester: (id) => api.delete(`/admin/semesters/${id}`),

  // Courses & Sessions
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getSessions: (courseId) => api.get(`/admin/courses/${courseId}/sessions`),
  getAllSessions: (params) => api.get('/admin/sessions', { params }),
  createSession: (data) => api.post('/admin/sessions', data),
  updateSession: (id, data) => api.put(`/admin/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/admin/sessions/${id}`),
  toggleSessionActive: (id) => api.patch(`/admin/sessions/${id}/toggle-active`),
  getCourseStudents: (courseId) => api.get(`/admin/courses/${courseId}/students`),
  enrollStudentToCourse: (courseId, data) => api.post(`/admin/courses/${courseId}/students`, data),
  removeStudentFromCourse: (courseId, studentId) => api.delete(`/admin/courses/${courseId}/students/${studentId}`),
  toggleCourseStudentEligibility: (courseId, studentId, data) => api.patch(`/admin/courses/${courseId}/students/${studentId}/eligibility`, data),

  // Exams
  getExams: () => api.get('/admin/exams'),
  createExam: (data) => api.post('/admin/exams', data),
  updateExam: (id, data) => api.put(`/admin/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`),
  getExamCandidates: (examId) => api.get(`/admin/exams/${examId}/candidates`),
  assignCandidate: (examId, data) => api.post(`/admin/exams/${examId}/candidates`, data),
  toggleExamActive: (id) => api.patch(`/admin/exams/${id}/toggle-active`)
};
