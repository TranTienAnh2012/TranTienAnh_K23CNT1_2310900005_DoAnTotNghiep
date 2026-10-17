import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Bell, Shield, GraduationCap, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <Shield size={13} /> Quản trị viên
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <GraduationCap size={13} /> Giảng viên
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            <BookOpen size={13} /> Sinh viên
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {role}
          </span>
        );
    }
  };

  const displayName = user?.profile?.ho_ten || user?.username || 'Người dùng';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">
          SmartEdu Management
        </h2>
        {getRoleBadge(user?.role)}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner text-sm">
            {user?.profile?.avatar_url ? (
              <img
                src={`http://localhost:5000${user.profile.avatar_url}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-800">{displayName}</div>
            <div className="text-[11px] font-mono text-slate-400">@{user?.username}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-semibold transition-all shadow-sm"
          title="Đăng xuất"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Thoát</span>
        </button>
      </div>
    </header>
  );
}
