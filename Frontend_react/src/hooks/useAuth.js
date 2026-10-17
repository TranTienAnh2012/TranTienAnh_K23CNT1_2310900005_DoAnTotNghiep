import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSavedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('smartedu_token');
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('smartedu_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.warn('Lỗi kiểm tra phiên xác thực:', error.message);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authService.login(username, password);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, login, logout, isAuthenticated: !!user } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
