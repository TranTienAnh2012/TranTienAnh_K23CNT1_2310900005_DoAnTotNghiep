import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, Shield, GraduationCap, BookOpen, Building2, AlertCircle, ArrowRight, ArrowLeft, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Tự động chuyển hướng nếu người dùng đã có phiên đăng nhập
  useEffect(() => {
    if (user?.role) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'faculty_manager') navigate('/faculty');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'student') navigate('/student');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'faculty_manager') navigate('/faculty');
        else if (role === 'teacher') navigate('/teacher');
        else if (role === 'student') navigate('/student');
        else navigate('/');
      } else {
        setError(res.message || 'Đăng nhập không thành công.');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-850 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-9 shadow-2xl border border-slate-100 relative z-10 transition-all">
        {/* Nút quay lại Landing Page */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Về Trang chủ Trường Đại học Nguyễn Trãi</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 p-2 rounded-2xl bg-white border border-slate-200 inline-flex items-center justify-center shadow-lg shadow-orange-500/10 mb-3 transition-transform hover:scale-105 duration-200">
            <img
              src="/logo-smartedu2.png"
              alt="SmartEdu Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cổng Thông Tin SmartEdu
          </h1>
          <p className="text-xs text-orange-600 font-semibold mt-1 uppercase tracking-wider">
            Trường Đại Học Nguyễn Trãi
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Đăng nhập hệ thống Quản lý Đào tạo & Face AI
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={17} className="flex-shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên đăng nhập / Email / Mã SV / Mã GV
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                placeholder="Nhập Username, Email hoặc Mã GV/SV..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                placeholder="Mật khẩu tài khoản..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            <span>{loading ? 'Đang xác thực thông tin...' : 'Đăng nhập vào Hệ thống'}</span>
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-7 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase text-center mb-3">
            Tài khoản mẫu kiểm thử nhanh
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('admin', '123456')}
              className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-red-50 hover:border-red-200 transition-all group cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-red-100/70 text-red-600 mb-1 group-hover:scale-110 transition-transform">
                <Shield size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-red-700">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('khoacntt', '123456')}
              className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-purple-50 hover:border-purple-200 transition-all group cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-purple-100/70 text-purple-600 mb-1 group-hover:scale-110 transition-transform">
                <Building2 size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">QL Khoa</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('gv01', '123456')}
              className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-all group cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-emerald-100/70 text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
                <GraduationCap size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700">Giảng viên</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('sv01', '123456')}
              className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 transition-all group cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-blue-100/70 text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                <BookOpen size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-700">Sinh viên</span>
            </button>
          </div>
          <div className="text-[11px] text-slate-400 text-center mt-2.5">
            Mật khẩu mặc định: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold font-mono text-[10px]">123456</code>
          </div>
        </div>
      </div>
    </div>
  );
}
