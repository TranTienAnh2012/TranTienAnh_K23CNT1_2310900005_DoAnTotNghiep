import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000
});

// Request Interceptor: Tự động đính kèm Bearer JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartedu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bắt lỗi 401 hết hạn phiên
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('smartedu_token');
      localStorage.removeItem('smartedu_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Lỗi mạng hoặc server không phản hồi.';
    return Promise.reject(new Error(message));
  }
);

export default api;
