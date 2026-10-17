import api from './api';

export const authService = {
  async login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('smartedu_token', res.data.token);
      localStorage.setItem('smartedu_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async getCurrentUser() {
    return api.get('/auth/me');
  },

  async changePassword(oldPassword, newPassword) {
    return api.post('/auth/change-password', { oldPassword, newPassword });
  },

  logout() {
    localStorage.removeItem('smartedu_token');
    localStorage.removeItem('smartedu_user');
  },

  getSavedUser() {
    try {
      const u = localStorage.getItem('smartedu_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }
};
