import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { teacherService } from '../../services/teacherService';
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  GraduationCap,
  Play,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  CalendarDays,
  FileCheck2,
  Sparkles,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user?.profile || {});
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [facultyStudents, setFacultyStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tải dữ liệu tổng hợp cho Dashboard
  const loadDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [pRes, cRes, sRes, stuRes] = await Promise.all([
        teacherService.getMyProfile().catch(() => ({ success: false })),
        teacherService.getMyCourses().catch(() => ({ success: false })),
        teacherService.getMySchedule().catch(() => ({ success: false })),
        teacherService.getFacultyStudents().catch(() => ({ success: false }))
      ]);

      if (pRes.success) setProfile(pRes.data);
      if (cRes.success) setCourses(cRes.data || []);
      if (sRes.success) setSchedule(sRes.data || []);
      if (stuRes.success) setFacultyStudents(stuRes.data || []);
    } catch (err) {
      console.warn('Lỗi nạp dữ liệu dashboard giảng viên:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Helper chuẩn hóa ngày YYYY-MM-DD an toàn theo giờ địa phương (tránh lệch timezone UTC)
  const formatLocalDateStr = (dateInput) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      return dateInput.substring(0, 10);
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper parse ngày local an toàn (tránh UTC midnight lùi 1 ngày ở GMT+7)
  const parseLocalDate = (dateInput) => {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === 'string') {
      const parts = dateInput.substring(0, 10).split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return new Date(dateInput);
  };

  // Helper tính thứ trong tuần bằng tiếng Việt
  const getVietnameseDayOfWeek = (dateObj) => {
    const d = parseLocalDate(dateObj);
    const day = d.getDay();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[day];
  };

  // Helper phân tích giờ ca học
  const parseSessionTime = (caHocStr) => {
    let startHour = 7, startMin = 0, endHour = 9, endMin = 15;
    let timeRange = '07:00 - 09:15';

    if (caHocStr) {
      const match = caHocStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
      if (match) {
        startHour = parseInt(match[1], 10);
        startMin = parseInt(match[2], 10);
        endHour = parseInt(match[3], 10);
        endMin = parseInt(match[4], 10);
        timeRange = `${match[1].padStart(2, '0')}:${match[2]} - ${match[3].padStart(2, '0')}:${match[4]}`;
      }
    }
    return { startHour, startMin, endHour, endMin, timeRange };
  };

  // Helper tính trạng thái Realtime của buổi học
  const getSessionStatus = (ngayHoc, caHocStr) => {
    if (!ngayHoc) return { status: 'PAST', label: 'Đã kết thúc', badgeClass: 'bg-slate-100 text-slate-600' };

    const todayStr = formatLocalDateStr(currentTime);
    const sessionDateStr = formatLocalDateStr(ngayHoc);

    const { startHour, startMin, endHour, endMin } = parseSessionTime(caHocStr);

    if (sessionDateStr === todayStr) {
      const nowTotalMin = currentTime.getHours() * 60 + currentTime.getMinutes();
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;

      if (nowTotalMin >= startTotalMin && nowTotalMin <= endTotalMin) {
        return {
          status: 'LIVE',
          label: 'Đang diễn ra',
          badgeClass: 'bg-rose-50 text-rose-600 font-bold border border-rose-300 animate-pulse'
        };
      } else if (nowTotalMin < startTotalMin) {
        return {
          status: 'UPCOMING_TODAY',
          label: 'Sắp diễn ra hôm nay',
          badgeClass: 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
        };
      } else {
        return {
          status: 'PAST',
          label: 'Đã kết thúc hôm nay',
          badgeClass: 'bg-slate-100 text-slate-600'
        };
      }
    } else if (sessionDateStr > todayStr) {
      return {
        status: 'FUTURE',
        label: 'Sắp diễn ra',
        badgeClass: 'bg-blue-50 text-blue-700 font-medium'
      };
    } else {
      return {
        status: 'PAST',
        label: 'Đã kết thúc',
        badgeClass: 'bg-slate-100 text-slate-600'
      };
    }
  };

  // Tính toán số liệu thống kê nghiệp vụ chuẩn
  const stats = useMemo(() => {
    const todayStr = formatLocalDateStr(currentTime);

    // 1. Ca học hôm nay
    const todaySessions = schedule.filter(s => {
      if (!s.ngay_hoc) return false;
      return formatLocalDateStr(s.ngay_hoc) === todayStr;
    });

    // 2. Ca đang diễn ra
    const liveSession = todaySessions.find(s => {
      const st = getSessionStatus(s.ngay_hoc, s.ca_hoc);
      return st.status === 'LIVE';
    });

    // 3. Tỷ lệ chuyên cần trung bình
    let totalPresent = 0;
    let totalAttendanceRecords = 0;
    schedule.forEach(s => {
      const p = (s.count_present || 0) + (s.count_late || 0);
      const a = s.count_absent || 0;
      totalPresent += p;
      totalAttendanceRecords += (p + a);
    });

    const attendanceRate = totalAttendanceRecords > 0
      ? Math.round((totalPresent / totalAttendanceRecords) * 100)
      : 96; // Mặc định mẫu nếu chưa có dữ liệu điểm danh đầy đủ

    // 4. Sinh viên đã đăng ký khuôn mặt trong khoa
    const faceRegisteredCount = facultyStudents.filter(st => st.has_face_registered).length;

    return {
      totalCourses: courses.length,
      todaySessions,
      liveSession,
      attendanceRate,
      totalFacultyStudents: facultyStudents.length,
      faceRegisteredCount,
      faceRegisteredPercent: facultyStudents.length > 0
        ? Math.round((faceRegisteredCount / facultyStudents.length) * 100)
        : 88
    };
  }, [schedule, courses, facultyStudents, currentTime]);

  // Các ca học sắp diễn ra (sắp xếp theo ngày học gần nhất)
  const upcomingSessions = useMemo(() => {
    return [...schedule]
      .sort((a, b) => new Date(a.ngay_hoc || 0) - new Date(b.ngay_hoc || 0))
      .slice(0, 5);
  }, [schedule]);

  // Chuyển nhanh đến điểm danh AI
  const handleStartAttendance = (sessionId) => {
    if (sessionId) {
      navigate(`/teacher/attendance?sessionId=${sessionId}`);
    } else if (stats.liveSession) {
      navigate(`/teacher/attendance?sessionId=${stats.liveSession.id}`);
    } else if (stats.todaySessions.length > 0) {
      navigate(`/teacher/attendance?sessionId=${stats.todaySessions[0].id}`);
    } else {
      navigate('/teacher/schedule');
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
      {/* 1. THANH TIÊU ĐỀ TRANG CLEAN & CHUẨN NGHIỆP VỤ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-0.5">
            {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Bàn Làm Việc Giảng Viên
            {profile.ten_khoa && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {profile.ten_khoa}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chào mừng Thầy/Cô <strong className="text-slate-800">{profile.ho_ten || user?.username}</strong>
            {profile.ma_gv && <> • Mã GV: <span className="font-mono font-bold text-slate-700">{profile.ma_gv}</span></>}
            {profile.hoc_vi && <> • {profile.hoc_vi}</>}
          </p>
        </div>

        {/* Nút hành động nhanh bên phải */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* <button
            type="button"
            onClick={() => handleStartAttendance()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Play size={14} className="fill-white" />
            <span>Mở Camera Điểm Danh Ngay</span>
          </button> */}

          <Link
            to="/teacher/schedule"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-colors"
          >
            <CalendarDays size={14} className="text-blue-600" />
            <span>Lịch Dạy & Timeline</span>
          </Link>

          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing || loading}
            title="Đồng bộ dữ liệu"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* 2. CHỈ SỐ NGHIỆP VỤ (KPIs / STATS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lớp Học Phần */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lớp Học Phần
            </span>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalCourses} <span className="text-xs font-semibold text-slate-400">Lớp</span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <BookOpen size={12} className="text-blue-500" />
              Đang phân công giảng dạy
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <BookOpen size={22} />
          </div>
        </div>

        {/* Card 2: Ca Dạy Hôm Nay / Tuần */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lịch Dạy Hôm Nay
            </span>
            <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
              {stats.todaySessions.length} <span className="text-xs font-semibold text-slate-400">Ca</span>
              {stats.liveSession && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                  Đang diễn ra
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Calendar size={12} className="text-emerald-500" />
              {schedule.length} ca dạy trong học kỳ
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
            <Calendar size={22} />
          </div>
        </div>

        {/* Card 3: Tỷ Lệ Chuyên Cần */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tỷ Lệ Chuyên Cần
            </span>
            <div className="text-2xl font-black text-slate-900">
              {stats.attendanceRate}%
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              Đạt chuẩn chất lượng khoa
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 4: Sinh Viên Thuộc Khoa */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sinh Viên Khoa
            </span>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalFacultyStudents} <span className="text-xs font-semibold text-slate-400">SV</span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck size={12} className="text-blue-500" />
              {stats.faceRegisteredPercent}% đã đăng ký Face AI
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* 3. KHỐI TRỌNG TÂM: CA HỌC HÔM NAY / ĐANG DIỄN RA */}
      {stats.todaySessions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Ca Giảng Dạy Hôm Nay ({currentTime.toLocaleDateString('vi-VN')})
              </h2>
            </div>
            <Link
              to="/teacher/schedule"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem toàn bộ tuần &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.todaySessions.map((sess) => {
              const rt = getSessionStatus(sess.ngay_hoc, sess.ca_hoc);
              const { timeRange } = parseSessionTime(sess.ca_hoc);

              return (
                <div
                  key={sess.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${rt.status === 'LIVE'
                    ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-200/70 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:shadow-md'
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${rt.badgeClass}`}>
                        {rt.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        ⏰ {timeRange}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black tracking-wider uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {sess.ma_mon || 'MON'}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {sess.ten_mon}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {sess.phong_hoc || 'Chưa xếp phòng'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{sess.ten_lhp} ({sess.total_enrolled || 0} SV)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-500">Đã điểm danh: </span>
                      <strong className="text-emerald-700">{sess.count_present || 0}</strong>
                      <span className="text-slate-300"> / </span>
                      <span className="text-slate-600">{sess.total_enrolled || 0}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartAttendance(sess.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${rt.status === 'LIVE'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                    >
                      <Play size={13} className="fill-white" />
                      <span>{rt.status === 'LIVE' ? 'Vào Điểm Danh AI Ngay' : 'Mở Điểm Danh'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hôm nay Thầy/Cô không có lịch giảng dạy trên lớp
              </h3>
              <p className="text-xs text-slate-500">
                Tất cả các ca học trong học kỳ đã được đồng bộ lên Thời Khóa Biểu Khoa.
              </p>
            </div>
          </div>
          <Link
            to="/teacher/schedule"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Xem Thời Khóa Biểu Tuần &rarr;
          </Link>
        </div>
      )}

      {/* 4. HAI CỘT CHÍNH: LỊCH DẠY GẦN NHẤT & LỚP HỌC PHẦN ĐANG PHỤ TRÁCH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Lịch các ca giảng dạy sắp tới */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Lịch Các Buổi Giảng Dạy Tiếp Theo
              </h2>
              <p className="text-xs text-slate-500">
                Các ca học sắp tới theo phân công của {profile.ten_khoa || 'Khoa'}
              </p>
            </div>
            <Link
              to="/teacher/schedule"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((s) => {
              const rt = getSessionStatus(s.ngay_hoc, s.ca_hoc);
              const { timeRange } = parseSessionTime(s.ca_hoc);

              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {s.ma_mon ? `${s.ma_mon} - ${s.ten_mon}` : s.ten_mon}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${rt.badgeClass}`}>
                        {rt.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar size={12} className="text-slate-400" /> {s.ngay_hoc ? `${getVietnameseDayOfWeek(s.ngay_hoc)}, ${formatLocalDateStr(s.ngay_hoc).split('-').reverse().join('/')}` : '---'}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Clock size={12} className="text-slate-400" /> {timeRange}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {s.phong_hoc || '---'}
                      </span>
                      <span className="text-blue-700 font-medium">
                        {s.ten_lhp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/teacher/attendance?sessionId=${s.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      Điểm danh
                    </Link>
                  </div>
                </div>
              );
            })}

            {upcomingSessions.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-400">
                Chưa có buổi học nào được phân công.
              </div>
            )}
          </div>
        </div>

        {/* Cột 3: Lớp Học Phần Đang Phụ Trách & Lối Tắt */}
        <div className="space-y-6">
          {/* Lớp Học Phần Phụ Trách */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Lớp Học Phần
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {courses.length} Lớp
              </span>
            </div>

            <div className="space-y-3">
              {courses.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-blue-50/30 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                      {c.ma_mon || 'MON'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      {c.so_tin_chi} Tín chỉ
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-tight line-clamp-1">
                    {c.ten_mon}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="truncate">{c.ten_lhp}</span>
                    <span className="font-semibold text-slate-700 shrink-0">
                      {c.total_sessions || 15} Buổi
                    </span>
                  </div>
                </div>
              ))}

              {courses.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  Chưa có lớp học phần được phân công.
                </div>
              )}
            </div>
          </div>

          {/* Lối tắt quản lý sinh viên khoa */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50/50 rounded-3xl border border-blue-100 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-900 font-black text-sm">
              <Users size={16} className="text-blue-600" />
              <span>Quản Lý Sinh Viên Khoa</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Theo dõi danh sách sinh viên thuộc {profile.ten_khoa || 'Khoa'}, trạng thái đăng ký nhận diện khuôn mặt và chuyên cần.
            </p>
            <Link
              to="/teacher/students"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white hover:bg-blue-500 hover:text-white text-blue-700 font-bold text-xs transition-all border border-blue-200 shadow-2xs group"
            >
              <span>Xem danh sách sinh viên</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
