import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ fontSize: '15px', color: '#64748b' }}>Đang xác thực thông tin...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Nếu role không khớp, chuyển hướng về trang chủ tương ứng của role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user?.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
