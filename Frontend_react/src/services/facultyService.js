import api from './api';

export const facultyService = {
  // 1. Dashboard
  getDashboardStats: (khoaId) => api.get('/faculty/dashboard', { params: { khoa_id: khoaId } }),

  // 2. Sinh viên trong Khoa
  getStudents: (params) => api.get('/faculty/students', { params }),
  getStudentResume: (id) => api.get(`/faculty/students/${id}/resume`),

  // 3. Khung CTĐT
  getCurriculums: () => api.get('/faculty/curriculums'),
  createCurriculum: (data) => api.post('/faculty/curriculums', data),
  getCurriculumDetail: (id) => api.get(`/faculty/curriculums/${id}`),
  addCourseToCurriculum: (curriculumId, data) => api.post(`/faculty/curriculums/${curriculumId}/courses`, data),
  updateCourseInCurriculum: (curriculumId, courseId, data) => api.put(`/faculty/curriculums/${curriculumId}/courses/${courseId}`, data),
  bulkAddCoursesToCurriculum: (curriculumId, data) => api.post(`/faculty/curriculums/${curriculumId}/courses/bulk`, data),
  removeCourseFromCurriculum: (curriculumId, courseId) => api.delete(`/faculty/curriculums/${curriculumId}/courses/${courseId}`),
  getAllSubjects: () => api.get('/admin/subjects'),

  // 4. Cảnh báo học vụ
  getAcademicWarnings: () => api.get('/faculty/academic-warnings'),
  createAcademicWarning: (data) => api.post('/faculty/academic-warnings', data),

  // 5. Điểm rèn luyện
  getConductScores: (params) => api.get('/faculty/conduct-scores', { params }),
  approveConductScore: (id, data) => api.put(`/faculty/conduct-scores/${id}/approve`, data),

  // 6. Ý kiến sinh viên
  getFeedbacks: () => api.get('/faculty/feedback'),
  replyFeedback: (id, data) => api.put(`/faculty/feedback/${id}/reply`, data),

  // 7. Theo dõi Học phí & Công nợ sinh viên trong Khoa
  getFacultyTuition: (params) => api.get('/faculty/tuition', { params })
};
