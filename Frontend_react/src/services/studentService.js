import api from './api';

export const studentService = {
  // 1. Hồ sơ cá nhân cơ bản & Khuôn mặt
  getMyProfile: () => api.get('/student/profile'),

  registerFace: (formData) => {
    return api.post('/student/register-face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 2. Sơ yếu lý lịch chuyên sâu (UniSoft / Edusoft)
  getResume: () => api.get('/student/resume'),
  updatePersonalInfo: (data) => api.put('/student/resume/personal', data),
  addFamilyMember: (data) => api.post('/student/resume/family', data),
  updateFamilyMember: (id, data) => api.put(`/student/resume/family/${id}`, data),
  deleteFamilyMember: (id) => api.delete(`/student/resume/family/${id}`),
  updateAdmissionInfo: (data) => api.put('/student/resume/admission', data),

  // 3. Khung Chương trình đào tạo (CTĐT)
  getCurriculum: () => api.get('/student/curriculum'),

  // 4. Bảng điểm học tập & Cảnh báo học vụ
  getGrades: () => api.get('/student/grades'),
  getAcademicWarnings: () => api.get('/student/academic-warnings'),

  // 5. Học phí & Công nợ
  getTuition: () => api.get('/student/tuition'),

  // 6. Điểm rèn luyện & Khen thưởng
  getConductScores: () => api.get('/student/conduct-scores'),
  selfEvaluateConduct: (data) => api.post('/student/conduct-scores/self-evaluate', data),
  getRewardsDisciplines: () => api.get('/student/rewards-disciplines'),

  // 7. Ý kiến & Khiếu nại
  getFeedbacks: () => api.get('/student/feedback'),
  submitFeedback: (data) => api.post('/student/feedback', data),

  // 8. Điểm danh buổi học (Face AI + GPS)
  getTodaySessions: () => api.get('/student/attendance/today'),
  getAttendanceHistory: () => api.get('/student/attendance/history'),

  checkinSession: (formData) => {
    return api.post('/student/attendance/checkin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 8.1. Lịch học & Thời khóa biểu (Cá nhân hoặc băm nhỏ theo Khoa -> Lớp)
  getSchedule: (params) => api.get('/student/schedule', { params }),
  getSessionStudentDetails: (sessionId) => api.get(`/student/schedule/session/${sessionId}/students`),

  // 9. Ca thi
  getMyExams: () => api.get('/student/exams/my-exams'),

  checkinExam: (formData) => {
    return api.post('/student/exams/checkin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
