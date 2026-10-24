import React, { useState } from 'react';
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  CreditCard,
  AlertTriangle,
  Award,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  // Trạng thái thu nhỏ / mở rộng sidebar, lưu vào localStorage để giữ trạng thái khi đổi trang
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('smartedu_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('smartedu_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  };

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
        { to: '/admin/faculty-managers', label: 'Cán bộ Quản lý Khoa', icon: ShieldCheck },
        { to: '/admin/face-registration', label: 'Đăng ký Khuôn mặt-Face AI', icon: Camera },
        { to: '/admin/accounts', label: 'Tài khoản Hệ thống', icon: KeyRound }
      ]
    },
    {
      title: 'Học Thuật & Đào Tạo',
      items: [
        { to: '/admin/faculties', label: 'Khoa đào tạo', icon: Building2 },
        { to: '/admin/majors', label: 'Ngành đào tạo', icon: GraduationCap },
        { to: '/admin/classes', label: 'Lớp sinh hoạt', icon: Users },
        { to: '/admin/curriculums', label: 'Chương trình đào tạo (CTĐT)', icon: BookOpenCheck },
        { to: '/admin/academic-warnings', label: 'Cảnh báo học vụ toàn trường', icon: AlertTriangle },
        { to: '/admin/subjects', label: 'Môn học đào tạo', icon: BookOpen },
        { to: '/admin/semesters', label: 'Học kỳ', icon: Calendar }
      ]
    },
    {
      title: 'Tài Chính & Học Phí',
      items: [
        { to: '/admin/tuition', label: 'Quản lý Học phí & Thu tiền', icon: CreditCard }
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

  const facultyMenu = [
    { to: '/faculty', label: 'Dashboard Khoa', icon: LayoutDashboard },
    { to: '/faculty/curriculums', label: 'Chương trình Đào tạo', icon: BookOpenCheck },
    { to: '/faculty/students', label: 'Sinh viên & Hồ sơ Khoa', icon: Users },
    { to: '/faculty/tuition', label: 'Học phí & Công nợ Khoa', icon: CreditCard },
    { to: '/faculty/warnings', label: 'Cảnh báo học vụ', icon: AlertTriangle }
  ];

  const teacherMenu = [
    { to: '/teacher', label: 'Bàn làm việc GV', icon: LayoutDashboard },
    { to: '/teacher/schedule', label: 'Lịch giảng dạy & Timeline', icon: CalendarCheck },
    { to: '/teacher/students', label: 'Quản lý Sinh viên Khoa', icon: Users },
    { to: '/teacher/attendance', label: 'Duyệt điểm danh', icon: CheckCircle2 },
    { to: '/teacher/exams', label: 'Giám sát ca thi', icon: FileCheck2 }
  ];

  const studentMenu = [
    { to: '/student', label: 'Bàn học tập', icon: LayoutDashboard },
    { to: '/student/resume', label: 'Sơ yếu lý lịch', icon: FileText },
    { to: '/student/schedule', label: 'Thời khóa biểu & Lịch học', icon: CalendarDays },
    { to: '/student/curriculum', label: 'Chương trình đào tạo', icon: BookOpen },
    { to: '/student/grades', label: 'Xem điểm học tập', icon: Award },
    { to: '/student/tuition', label: 'Xem học phí', icon: CreditCard },
    { to: '/student/warnings', label: 'Cảnh báo học vụ', icon: AlertTriangle },
    { to: '/student/checkin', label: 'Điểm danh FaceAI + GPS', icon: CheckCircle2 },
    // { to: '/student/face-registration', label: 'Đăng ký khuôn mặt 3D', icon: Camera },
    { to: '/student/exam-checkin', label: 'Check-in phòng thi', icon: FileCheck2 }
  ];

  return (
    <aside
      className={`relative ${isCollapsed ? 'w-20' : 'w-64'
        } bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none h-screen sticky top-0 transition-all duration-300 z-30`}
    >
      {/* NÚT THU NHỎ / MỞ RỘNG TRÒN XANH NGỌC NHÔ RA Ở MÉP PHẢI (CHUẨN HÌNH ẢNH) */}
      <button
        type="button"
        onClick={toggleSidebar}
        title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
        aria-label={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        className="absolute -right-3.5 top-8 z-40 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all cursor-pointer hover:shadow-emerald-500/30"
      >
        {isCollapsed ? (
          <ChevronRight size={15} className="stroke-[2.5]" />
        ) : (
          <ChevronLeft size={15} className="stroke-[2.5]" />
        )}
      </button>

      {/* Brand Logo Header */}
      <div
        className={`p-4 border-b border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
          }`}
      >
        <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
          <img
            src="/logo-smartedu2.png"
            alt="SmartEdu Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-extrabold text-white tracking-tight truncate">
              SmartEdu
            </div>
            <div className="text-[10px] font-semibold text-slate-400 truncate">
              Đại Học Nguyễn Trãi
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`p-3 flex-1 overflow-y-auto space-y-4 ${isCollapsed ? 'px-2' : ''}`}>
        {role === 'admin' ? (
          adminSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="text-[10px] font-extrabold uppercase text-slate-500 px-3 py-1 tracking-wider truncate">
                  {sec.title}
                </div>
              ) : (
                sIdx > 0 && <div className="my-2 border-t border-slate-800/60" />
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `group relative flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-2.5 px-3 py-2'
                      } rounded-xl text-xs font-semibold transition-all duration-150 ${isActive
                        ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-l-4 border-transparent'
                      }`
                    }
                  >
                    <Icon size={isCollapsed ? 20 : 16} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {/* Tooltip nổi khi thu nhỏ */}
                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl border border-slate-700">
                          {item.label}
                        </div>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="text-[10px] font-extrabold uppercase text-slate-500 px-3 py-1 tracking-wider truncate">
                Menu Phân Hệ
              </div>
            )}
            {(role === 'faculty_manager'
              ? facultyMenu
              : role === 'teacher'
                ? teacherMenu
                : studentMenu
            ).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/faculty' || item.to === '/teacher' || item.to === '/student'}
                  className={({ isActive }) =>
                    `group relative flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-2.5 px-3 py-2.5'
                    } rounded-xl text-xs font-semibold transition-all duration-150 ${isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-l-4 border-transparent'
                    }`
                  }
                >
                  <Icon size={isCollapsed ? 20 : 17} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* Tooltip nổi khi thu nhỏ */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl border border-slate-700">
                        {item.label}
                      </div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Profile & Logout (Chuẩn Hình Ảnh: Avatar Tròn Xanh Ngọc T + Nút Logout) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex flex-col items-center gap-2 shrink-0">
        {isCollapsed ? (
          <>
            <div
              title={user?.profile?.ho_ten || user?.username}
              className="w-10 h-10 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md cursor-pointer hover:scale-105 transition-transform"
            >
              {(user?.profile?.ho_ten || user?.username || 'T').charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                {(user?.profile?.ho_ten || user?.username || 'T').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.profile?.ho_ten || user?.username}
                </div>
                <div className="text-[10px] text-slate-400 truncate capitalize">
                  {role === 'admin'
                    ? 'Quản trị viên'
                    : role === 'faculty_manager'
                      ? 'Quản lý Khoa'
                      : role === 'teacher'
                        ? 'Giảng viên'
                        : 'Sinh viên'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
