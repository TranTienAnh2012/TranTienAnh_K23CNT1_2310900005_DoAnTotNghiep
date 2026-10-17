import api from './api';

export const teacherService = {
  getMyProfile: () => api.get('/teacher/profile'),
  registerFace: (formData) => {
    return api.post('/teacher/register-face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  detectPose: (formData) => {
    return api.post('/teacher/detect-pose', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMyCourses: () => api.get('/teacher/courses'),

  getMySchedule: () => api.get('/teacher/schedule'),
  getSessionAttendance: (sessionId) => api.get(`/teacher/sessions/${sessionId}/attendance`),
  manualOverride: (sessionId, data) => api.post(`/teacher/sessions/${sessionId}/attendance/override`, data),
  getExams: () => api.get('/teacher/exams'),
  getExamSupervision: (examId) => api.get(`/teacher/exams/${examId}/supervision`),
  updateCandidateStatus: (examId, data) => api.patch(`/teacher/exams/${examId}/candidates/status`, data)
};
