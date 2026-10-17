import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Users, GraduationCap, BookOpen, Camera, BookOpenCheck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    registeredFaces: 0,
    totalClasses: 0,
    todayCheckins: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await adminService.getStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Lỗi tải thống kê:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    {
      title: 'Tổng Tài khoản',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      glow: 'group-hover:border-blue-300'
    },
    {
      title: 'Giảng viên',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      glow: 'group-hover:border-emerald-300'
    },
    {
      title: 'Sinh viên',
      value: stats.totalStudents,
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      glow: 'group-hover:border-indigo-300'
    },
    {
      title: 'Đã Đăng ký Mặt (Face AI)',
      value: stats.registeredFaces,
      icon: Camera,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      glow: 'group-hover:border-amber-300'
    },
    {
      title: 'Lớp học phần',
      value: stats.totalClasses,
      icon: BookOpenCheck,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      glow: 'group-hover:border-cyan-300'
    },
    {
      title: 'Lượt Điểm danh hôm nay',
      value: stats.todayCheckins,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      glow: 'group-hover:border-emerald-300'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Bảng điều khiển Quản trị (Admin)
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles size={12} /> Live Stats
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tổng quan tình hình hệ thống SmartEdu & Tích hợp Nhận diện Khuôn mặt
          </p>
        </div>
      </div>

      {/* Grid thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 ${c.glow}`}
            >
              <div
                className={`w-14 h-14 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center shrink-0 border ${c.border} shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                  {c.title}
                </div>
                <div className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                  {loading ? (
                    <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded"></span>
                  ) : (
                    c.value
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
