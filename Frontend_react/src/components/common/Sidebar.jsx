import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  KeyRound,
  Building2,
  BookOpen,
  Calendar,
  CalendarDays,
  BookOpenCheck,
  CalendarCheck,
  Camera,
  CheckCircle2,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  // Cấu trúc Menu Admin được chia nhỏ rõ ràng theo từng nhóm nghiệp vụ
  const adminSections = [
    {
      title: 'Tổng Quan',
      items: [
        { to: '/admin', label: 'Dashboard Hệ thống', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Người Dùng & Tài Khoản',
      items: [
        { to: '/admin/students', label: 'Quản lý Sinh viên', icon: GraduationCap },
        { to: '/admin/teachers', label: 'Quản lý Giảng viên', icon: Users },
        { to: '/admin/face-registration', label: 'Đăng ký Khuôn mặt (Face AI)', icon: Camera },
        { to: '/admin/accounts', label: 'Tài khoản Hệ thống', icon: KeyRound }
      ]
    },
    {
      title: 'Học Thuật & Đào Tạo',
      items: [
        { to: '/admin/faculties', label: 'Khoa', icon: Building2 },
        { to: '/admin/classes', label: 'Lớp', icon: Users },
        { to: '/admin/subjects', label: 'Môn học đào tạo', icon: BookOpen },
        { to: '/admin/semesters', label: 'Học kỳ', icon: Calendar }
      ]
    },
    {
      title: 'Lịch Trình & Ca Thi',
      items: [
        { to: '/admin/courses', label: 'Quản lý Lớp học phần', icon: BookOpenCheck },
        { to: '/admin/schedules', label: 'Lịch học & Buổi học', icon: CalendarDays },
        { to: '/admin/exams', label: 'Quản lý Ca thi', icon: CalendarCheck }
      ]
    }
  ];

  const teacherMenu = [
    { to: '/teacher', label: 'Bàn làm việc GV', icon: LayoutDashboard },
    { to: '/teacher/face-registration', label: 'Đăng ký khuôn mặt 3D', icon: Camera },
    { to: '/teacher/schedule', label: 'Lịch giảng dạy', icon: CalendarCheck },
    { to: '/teacher/attendance', label: 'Duyệt điểm danh', icon: CheckCircle2 },
    { to: '/teacher/exams', label: 'Giám sát ca thi', icon: FileCheck2 }
  ];

  const studentMenu = [
    { to: '/student', label: 'Bàn học tập', icon: LayoutDashboard },
    { to: '/student/face-registration', label: 'Đăng ký khuôn mặt 3D', icon: Camera },
    { to: '/student/checkin', label: 'Điểm danh FaceAI + GPS', icon: CheckCircle2 },
    { to: '/student/exam-checkin', label: 'Check-in phòng thi', icon: FileCheck2 }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none h-screen sticky top-0 overflow-hidden">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="text-base font-extrabold text-white tracking-tight">
            SmartEdu
          </div>
          <div className="text-[11px] font-semibold text-slate-400">
            Hệ Thống Đào Tạo & Face AI
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3.5 flex-1 overflow-y-auto space-y-5">
        {role === 'admin' ? (
          adminSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-500 px-3 py-1 tracking-wider">
                {sec.title}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-400 border-l-4 border-blue-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-l-4 border-transparent'
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))
        ) : (
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase text-slate-500 px-3 py-1 tracking-wider">
              Menu Phân Hệ
            </div>
            {(role === 'teacher' ? teacherMenu : studentMenu).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/teacher' || item.to === '/student'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border-l-4 border-blue-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-l-4 border-transparent'
                    }`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
