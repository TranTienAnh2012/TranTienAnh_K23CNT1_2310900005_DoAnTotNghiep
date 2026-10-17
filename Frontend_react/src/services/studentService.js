import api from './api';

export const studentService = {
  getMyProfile: () => api.get('/student/profile'),

  registerFace: (formData) => {
    return api.post('/student/register-face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getTodaySessions: () => api.get('/student/attendance/today'),
  getAttendanceHistory: () => api.get('/student/attendance/history'),

  checkinSession: (formData) => {
    return api.post('/student/attendance/checkin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getMyExams: () => api.get('/student/exams/my-exams'),

  checkinExam: (formData) => {
    return api.post('/student/exams/checkin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
