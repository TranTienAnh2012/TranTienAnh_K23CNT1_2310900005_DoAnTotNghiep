import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/facultyService';
import {
  Users,
  GraduationCap,
  BookOpenCheck,
  AlertTriangle,
  Building2,
  MessageSquare,
  Award,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await facultyService.getDashboardStats();
        if (res?.success) {
          setData(res.data);
        } else if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi tải Dashboard Khoa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Đang tải Dashboard Khoa...</p>
        </div>
      </div>
    );
  }

  const { khoa, stats = {} } = data || {};

  const statCards = [
    {
      title: 'Sinh viên trong Khoa',
      value: stats.totalStudents || 0,
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/faculty/students'
    },
    {
      title: 'Giảng viên cơ hữu',
      value: stats.totalTeachers || 0,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Lớp sinh hoạt',
      value: stats.totalClasses || 0,
      icon: Building2,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Khung CTĐT ban hành',
      value: stats.totalCurriculums || 0,
      icon: BookOpenCheck,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/faculty/curriculums'
    },
    {
      title: 'Cảnh báo học vụ',
      value: stats.pendingWarnings || 0,
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      link: '/faculty/warnings'
    },
    {
      title: 'Ý kiến SV cần duyệt',
      value: stats.pendingFeedbacks || 0,
      icon: MessageSquare,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Chào mừng */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-300 backdrop-blur-sm">
            Phân hệ Quản trị Khoa đào tạo
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {khoa?.ten_khoa || 'Khoa Công nghệ Thông tin'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Hệ thống quản lý chuyên sâu hồ sơ sinh viên, khung chương trình đào tạo theo khóa, cảnh báo học vụ và duyệt điểm rèn luyện trong Khoa.
          </p>
        </div>
      </div>

      {/* Grid 6 Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">{card.title}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{card.value}</p>
                {card.link && (
                  <Link
                    to={card.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 mt-2 transition-colors"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
              <div className={`w-14 h-14 rounded-2xl ${card.bgColor} ${card.textColor} flex items-center justify-center shrink-0`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/faculty/curriculums"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Khung Chương trình đào tạo
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Xây dựng danh mục môn học, phân bổ học kỳ 1-8, cấu hình môn tiên quyết và song hành cho từng khóa K22, K23, K24.
          </p>
        </Link>

        <Link
          to="/faculty/students"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-400 shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
            Hồ sơ Sơ yếu lý lịch SV Khoa
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu và kiểm duyệt hồ sơ cá nhân, CCCD, thông tin cư trú, thân nhân gia đình và tuyển sinh của sinh viên.
          </p>
        </Link>

        <Link
          to="/faculty/warnings"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-rose-400 shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
            Cảnh báo Học vụ & Rèn luyện
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Phát hiện sinh viên có nguy cơ thôi học (GPA &lt; 2.0 hoặc vắng Face AI quá 20%), ban hành nhắc nhở học vụ.
          </p>
        </Link>
      </div>
    </div>
  );
}
