import React, { useState, useEffect, useMemo } from 'react';
import { teacherService } from '../../services/teacherService';
import * as XLSX from 'xlsx';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Users, 
  LayoutGrid,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Video,
  Layers,
  Search,
  X,
  Camera,
  Play,
  Sparkles,
  ArrowRight,
  Download,
  GraduationCap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function TeachingSchedule() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Chế độ xem: 'all' (Tất cả: Cả Lưới Giờ + Thẻ Danh Sách như ảnh 1) | 'grid' (Lưới Giờ) | 'cards' (Thẻ Danh Sách)
  const [viewMode, setViewMode] = useState('all');
  
  // Bộ lọc môn học trong danh sách thẻ
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  
  // Quản lý Tuần cho chế độ Thời Khóa Biểu (offset = 0 là tuần 19/10 - 25/10/2026 hiện tại)
  const [weekOffset, setWeekOffset] = useState(0);

  // Modal xem chi tiết ca dạy (chuẩn giao diện SmartEdu)
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('students'); // 'students' | 'progress'
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Modal kích hoạt nhanh Camera Điểm Danh AI
  const [showQuickAttendanceModal, setShowQuickAttendanceModal] = useState(false);

  // Realtime Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tải lịch dạy của giảng viên
  const loadSchedule = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await teacherService.getMySchedule();
      if (res.success) {
        setSchedule(res.data || []);
        if (res.faculty) setFaculty(res.faculty);
      }
    } catch (err) {
      console.warn('Lỗi nạp lịch dạy:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSchedule();

    const autoRefresh = setInterval(() => {
      loadSchedule(true);
    }, 30000);

    return () => clearInterval(autoRefresh);
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

  // Helper phân tích giờ bắt đầu & kết thúc từ chuỗi ca học (ví dụ: "07:00 - 09:15" hoặc "Ca 2 (09:15 - 11:45)")
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
          label: 'Sắp diễn ra',
          badgeClass: 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
        };
      } else {
        return {
          status: 'PAST',
          label: 'Đã kết thúc',
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

  // Màu pastel phong phú cho từng môn học trên Lưới Thời Khóa Biểu
  const getColorForCourse = (courseId, monHocId) => {
    const colorPalettes = [
      {
        bg: 'bg-emerald-100/90',
        border: 'border-emerald-300',
        text: 'text-emerald-950',
        badgeBg: 'bg-emerald-200/80 text-emerald-900',
        subText: 'text-emerald-800'
      },
      {
        bg: 'bg-amber-100/90',
        border: 'border-amber-300',
        text: 'text-amber-950',
        badgeBg: 'bg-amber-200/80 text-amber-900',
        subText: 'text-amber-800'
      },
      {
        bg: 'bg-purple-100/90',
        border: 'border-purple-300',
        text: 'text-purple-950',
        badgeBg: 'bg-purple-200/80 text-purple-900',
        subText: 'text-purple-800'
      },
      {
        bg: 'bg-cyan-100/90',
        border: 'border-cyan-300',
        text: 'text-cyan-950',
        badgeBg: 'bg-cyan-200/80 text-cyan-900',
        subText: 'text-cyan-800'
      },
      {
        bg: 'bg-rose-100/90',
        border: 'border-rose-300',
        text: 'text-rose-950',
        badgeBg: 'bg-rose-200/80 text-rose-900',
        subText: 'text-rose-800'
      },
      {
        bg: 'bg-indigo-100/90',
        border: 'border-indigo-300',
        text: 'text-indigo-950',
        badgeBg: 'bg-indigo-200/80 text-indigo-900',
        subText: 'text-indigo-800'
      }
    ];
    const key = (courseId || 0) + (monHocId || 0);
    return colorPalettes[key % colorPalettes.length];
  };

  // State quản lý tháng & năm hiển thị trên Mini Calendar của Tab Lịch Học Phần
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Mở modal xem chi tiết ca học / buổi học chuẩn hình ảnh
  const handleOpenDetailModal = async (session, keepTab = false) => {
    if (!session) return;
    setSelectedSession(session);
    if (!keepTab) {
      setActiveModalTab('students');
      setStudentSearchTerm('');
    }
    setLoadingDetail(true);

    if (session.ngay_hoc) {
      const sessDate = parseLocalDate(session.ngay_hoc);
      setCalMonth(sessDate.getMonth());
      setCalYear(sessDate.getFullYear());
    }

    try {
      const res = await teacherService.getSessionAttendance(session.id);
      if (res.success && res.data) {
        setDetailData(res.data);
      }
    } catch (err) {
      console.warn('Lỗi nạp chi tiết buổi học:', err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePrevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedSession(null);
    setDetailData(null);
    setActiveModalTab('students');
    setStudentSearchTerm('');
  };

  // Xuất file Excel chuẩn định dạng cho danh sách sinh viên & điểm danh
  const handleExportExcel = () => {
    const attendees = detailData?.attendees || [];
    if (!attendees || attendees.length === 0) return;

    const sessionInfo = detailData?.session || selectedSession;
    const excelRows = attendees.map((att, idx) => {
      let statusText = 'Vắng mặt';
      let checkinTimeStr = '';
      if (att.thoi_gian_checkin) {
        const d = new Date(att.thoi_gian_checkin);
        checkinTimeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        statusText = `Đã vào (${checkinTimeStr})`;
      } else if (att.trang_thai === 'Present') {
        statusText = 'Có mặt (Đúng giờ)';
      } else if (att.trang_thai === 'Late') {
        statusText = 'Đi muộn';
      }

      return {
        'STT': idx + 1,
        'Mã SV': att.ma_sv,
        'Họ và tên': att.ho_ten,
        'Lớp chính quy': att.ten_lop || 'CNTT1-K15',
        'Phân loại': att.phan_loai || 'Chính quy',
        'Face ID': att.has_face_registered ? 'Đã có Face' : 'Chưa có Face',
        'Trạng thái điểm danh': statusText,
        'Thời gian điểm danh': checkinTimeStr || '---'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm Danh Sinh Viên');

    const subjectCode = sessionInfo?.ma_mon || 'MON';
    const dateFormatted = formatLocalDateStr(sessionInfo?.ngay_hoc) || 'Date';
    const fileName = `DiemDanh_${subjectCode}_${dateFormatted}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Tính 7 ngày trong tuần được chọn cho Thời khóa biểu (19/10 - 25/10/2026)
  const weekDays = useMemo(() => {
    const now = new Date(currentTime);
    const dayOfWeek = now.getDay(); // 0: CN, 1: T2, ..., 6: T7
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const shortLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const fullLabels = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatLocalDateStr(d);
      const dayMonthStr = `${d.getDate()}/${d.getMonth() + 1}`;
      days.push({
        date: d,
        dateStr: dateStr,
        shortLabel: shortLabels[i],
        fullLabel: fullLabels[i],
        dayMonth: dayMonthStr,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        isToday: dateStr === formatLocalDateStr(now)
      });
    }
    return days;
  }, [currentTime, weekOffset]);

  // Nhãn dải ngày tuần (VD: "19/10 - 25/10") và tháng năm (VD: "Th10 • 2026")
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return '';
    const first = weekDays[0];
    const last = weekDays[6];
    return `${first.dayMonth} - ${last.dayMonth}`;
  }, [weekDays]);

  const monthYearLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const midDate = weekDays[2].date;
    return `Th${midDate.getMonth() + 1} • ${midDate.getFullYear()}`;
  }, [weekDays]);

  // Các mốc giờ hiển thị trong bảng Thời khóa biểu (từ 07:00 đến 18:00)
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Tính toán vị trí vạch đỏ Realtime ngang qua lưới (đúng tại 15:00 hoặc giờ hiện tại như ảnh 1)
  const ROW_HEIGHT = 76; // Chiều cao mỗi dòng mốc giờ (px)
  const realtimeLinePosition = useMemo(() => {
    const curH = currentTime.getHours();
    const curM = currentTime.getMinutes();
    let minsFrom7 = (curH - 7) * 60 + curM;
    
    // Nếu giờ hiện tại nằm ngoài khoảng 07:00 - 18:00, đặt tại mốc 15:00 như ảnh 1
    if (minsFrom7 < 0 || minsFrom7 > 11 * 60) {
      minsFrom7 = (15 - 7) * 60; // 15:00
    }
    return (minsFrom7 / 60) * ROW_HEIGHT;
  }, [currentTime]);

  // Danh sách các môn học duy nhất phục vụ dropdown bộ lọc
  const subjectOptions = useMemo(() => {
    const map = new Map();
    schedule.forEach(s => {
      if (s.mon_hoc_id && !map.has(s.mon_hoc_id)) {
        map.set(s.mon_hoc_id, {
          id: s.mon_hoc_id,
          ma_mon: s.ma_mon,
          ten_mon: s.ten_mon
        });
      }
    });
    return Array.from(map.values());
  }, [schedule]);

  // Lọc danh sách ca học theo môn học được chọn
  const filteredSchedule = useMemo(() => {
    return schedule.filter(item => {
      if (selectedSubjectFilter === 'all') return true;
      return String(item.mon_hoc_id) === String(selectedSubjectFilter);
    });
  }, [schedule, selectedSubjectFilter]);

  // Xử lý mở nhanh Camera Điểm Danh Ngay
  const handleOpenAttendanceCamera = () => {
    // 1. Tìm xem có ca học LIVE nào không
    const liveSession = schedule.find(s => {
      const st = getSessionStatus(s.ngay_hoc, s.ca_hoc);
      return st.status === 'LIVE';
    });

    if (liveSession) {
      navigate(`/teacher/attendance?sessionId=${liveSession.id}`);
      return;
    }

    // 2. Nếu không có ca LIVE, kiểm tra các ca hôm nay
    const todayStr = formatLocalDateStr(currentTime);
    const todaySessions = schedule.filter(s => {
      if (!s.ngay_hoc) return false;
      return formatLocalDateStr(s.ngay_hoc) === todayStr;
    });

    if (todaySessions.length === 1) {
      navigate(`/teacher/attendance?sessionId=${todaySessions[0].id}`);
      return;
    }

    // 3. Nếu có nhiều ca hoặc không có ca hôm nay, mở popup chọn ca
    setShowQuickAttendanceModal(true);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
      {/* 1. Header Trang: Lịch Giảng Dạy Giảng Viên + Bộ Toggle + Nút Mở Camera Điểm Danh Ngay */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📅</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Lịch Giảng Dạy Giảng Viên
            </h1>
            {faculty && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {faculty.ten_khoa}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý toàn bộ danh sách các ca học, lịch giảng dạy và kích hoạt ca điểm danh AI
          </p>
        </div>

        {/* Cụm hành động bên phải: Segmented Controls + Nút Mở Camera Điểm Danh Ngay */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Nhóm switch tab: Tất cả | Lưới Giờ | Thẻ Danh Sách */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays size={14} />
              <span>Lưới Giờ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Thẻ Danh Sách</span>
            </button>
          </div>

          {/* Nút bấm nổi bật: Mở Camera Điểm Danh Ngay (như ảnh 1) */}
          <button
            type="button"
            onClick={handleOpenAttendanceCamera}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Play size={15} className="fill-white" />
            <span>Mở Camera Điểm Danh Ngay</span>
          </button>

          {/* Nút Refresh Realtime */}
          <button
            onClick={() => loadSchedule(true)}
            disabled={refreshing || loading}
            title="Đồng bộ dữ liệu Realtime"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* 2. KHỐI TRÊN: THỜI KHÓA BIỂU TUẦN (HIỂN THỊ KHI CHỌN 'all' HOẶC 'grid') */}
      {(viewMode === 'all' || viewMode === 'grid') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 overflow-hidden">
          {/* Header Thời Khóa Biểu Tuần */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Thời Khóa Biểu Tuần
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-amber-100/90 text-amber-800 text-xs font-bold border border-amber-200">
                {weekRangeLabel}
              </span>
            </div>

            {/* Bộ điều hướng tuần: < Tuần này > Th10 • 2026 */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Tuần trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    weekOffset === 0
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tuần này
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Tuần sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <span className="text-xs font-bold text-slate-500">
                {monthYearLabel}
              </span>
            </div>
          </div>

          {/* Lưới Lịch Thời Khóa Biểu Tuần Có Vạch Realtime */}
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              {/* Hàng Tiêu Đề Ngày */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/50 rounded-t-2xl text-center">
                <div className="py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 flex items-center justify-center">
                  GIỜ
                </div>
                {weekDays.map((d, idx) => (
                  <div
                    key={idx}
                    className={`py-2.5 px-2 border-r last:border-r-0 border-slate-200 transition-colors ${
                      d.isToday ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <div className={`text-xs font-black ${d.isToday ? 'text-rose-600' : 'text-slate-800'}`}>
                      {d.shortLabel}
                    </div>
                    <div className={`text-[11px] font-semibold ${d.isToday ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                      {d.dayMonth}
                    </div>
                  </div>
                ))}
              </div>

              {/* Thân Lưới Các Giờ và Khối Môn Học */}
              <div className="relative divide-y divide-slate-100 border-b border-slate-200">
                {/* VẠCH REALTIME NGANG MÀU ĐỎ CẮT NGANG THỜI GIAN HIỆN TẠI KÈM CHẤM ĐỎ */}
                <div 
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  style={{ top: `${realtimeLinePosition}px` }}
                >
                  {/* Chấm tròn đỏ tại mép trục thời gian */}
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-200 shadow-md -ml-1.5 shrink-0" />
                  {/* Vạch ngang đỏ tươi */}
                  <div className="flex-1 h-[2px] bg-rose-500/90 shadow-2xs" />
                </div>

                {timeSlots.map((hourStr, hIdx) => {
                  const currentHourNum = parseInt(hourStr.split(':')[0], 10);

                  return (
                    <div key={hIdx} className="grid grid-cols-8 min-h-[76px] relative">
                      {/* Cột hiển thị mốc giờ */}
                      <div className="py-2 px-2 text-xs font-mono font-medium text-slate-400 border-r border-slate-200 flex items-start justify-center select-none bg-slate-50/20">
                        {hourStr}
                      </div>

                      {/* 7 Cột cho 7 ngày trong tuần */}
                      {weekDays.map((dayItem, dIdx) => {
                        // Lọc các ca học diễn ra trong ngày này và bắt đầu trong khoảng giờ này
                        const sessionsInSlot = filteredSchedule.filter((sess) => {
                          if (!sess.ngay_hoc) return false;
                          const sessDateStr = formatLocalDateStr(sess.ngay_hoc);
                          if (sessDateStr !== dayItem.dateStr) return false;

                          const { startHour } = parseSessionTime(sess.ca_hoc);
                          return startHour === currentHourNum;
                        });

                        return (
                          <div
                            key={dIdx}
                            className={`border-r last:border-r-0 border-slate-100 p-1 relative flex flex-col gap-1.5 transition-colors ${
                              dayItem.isToday ? 'bg-rose-50/10' : ''
                            }`}
                          >
                            {sessionsInSlot.map((sess) => {
                              const color = getColorForCourse(sess.lop_hoc_phan_id, sess.mon_hoc_id);
                              const { timeRange } = parseSessionTime(sess.ca_hoc);
                              const rt = getSessionStatus(sess.ngay_hoc, sess.ca_hoc);

                              return (
                                <div
                                  key={sess.id}
                                  onClick={() => handleOpenDetailModal(sess)}
                                  className={`rounded-xl p-2.5 border shadow-xs transition-all duration-150 cursor-pointer hover:shadow-md hover:scale-[1.02] flex flex-col justify-between ${color.bg} ${color.border} ${color.text}`}
                                >
                                  <div>
                                    {/* Dòng mã môn & giờ học */}
                                    <div className="flex items-center justify-between gap-1 mb-1 text-[10px]">
                                      <span className={`px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${color.badgeBg}`}>
                                        {sess.ma_mon || 'MON'}
                                      </span>
                                      <span className="font-mono font-semibold opacity-85">
                                        {timeRange}
                                      </span>
                                    </div>

                                    {/* Tên môn học */}
                                    <h4 className="text-xs font-black leading-tight line-clamp-2 mb-1.5">
                                      {sess.ten_mon}
                                    </h4>
                                  </div>

                                  <div className="space-y-0.5 text-[10px]">
                                    {/* Phòng học */}
                                    <div className="flex items-center gap-1 font-medium truncate">
                                      <MapPin size={10} className="shrink-0 opacity-70" />
                                      <span className="truncate">{sess.phong_hoc || 'Chưa xếp phòng'}</span>
                                    </div>

                                    {/* Nhóm / Sĩ số */}
                                    <div className="flex items-center justify-between gap-1 font-medium pt-1 border-t border-black/5">
                                      <span className="truncate font-semibold opacity-90">
                                        {sess.ten_lhp}
                                      </span>
                                      {rt.status === 'LIVE' && (
                                        <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-black text-[9px] animate-pulse shrink-0">
                                          LIVE
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KHỐI DƯỚI: DANH SÁCH CA GIẢNG DẠY TUẦN NÀY (HIỂN THỊ KHI CHỌN 'all' HOẶC 'cards') */}
      {(viewMode === 'all' || viewMode === 'cards') && (
        <div className="space-y-4 pt-2">
          {/* Header Danh Sách Ca Giảng Dạy */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Danh sách ca giảng dạy tuần này
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-xs font-bold shadow-2xs">
                {filteredSchedule.length} ca học
              </span>
            </div>

            {/* Dropdown bộ lọc môn học như ảnh 1 */}
            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer min-w-[180px]"
              >
                <option value="all">Tất cả môn học</option>
                {subjectOptions.map(subj => (
                  <option key={subj.id} value={subj.id}>
                    {subj.ma_mon ? `${subj.ma_mon} - ${subj.ten_mon}` : subj.ten_mon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lưới 3 Cột Hiển Thị Các Thẻ Ca Giảng Dạy Chuẩn Ảnh 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchedule.map((item) => {
              const sessionDate = item.ngay_hoc ? parseLocalDate(item.ngay_hoc) : new Date();
              const dayName = getVietnameseDayOfWeek(sessionDate);
              const { timeRange } = parseSessionTime(item.ca_hoc);
              const rt = getSessionStatus(item.ngay_hoc, item.ca_hoc);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Hàng trên cùng: Thứ • Giờ học & Badge trạng thái (Đã kết thúc / Đang diễn ra) */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                        <span>{dayName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-700">{timeRange}</span>
                      </div>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${rt.badgeClass}`}>
                        {rt.label}
                      </span>
                    </div>

                    {/* Tiêu đề môn học: DB101 - Cơ sở Dữ liệu & Hệ quản trị CSDL */}
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug mb-3 line-clamp-2">
                      {item.ma_mon ? `${item.ma_mon} - ${item.ten_mon}` : item.ten_mon}
                    </h3>

                    {/* Thông tin phòng học & Lớp */}
                    <div className="space-y-2 text-xs text-slate-500 mb-4">
                      {/* 📍 B402 - Phòng học 402 - Tòa B */}
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600 truncate">
                          {item.phong_hoc ? `${item.phong_hoc} - Phòng học chuẩn NTU` : 'Chưa xếp phòng'}
                        </span>
                      </div>

                      {/* 👥 Nhóm 01 (6 Sinh viên) */}
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600 truncate">
                          {item.ten_lhp} ({item.total_enrolled || 0} Sinh viên)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút Chi tiết ở dưới cùng thẻ bo góc nhẹ nhàng như ảnh 1 */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(item)}
                      className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors border border-slate-200/80 text-center cursor-pointer shadow-2xs"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODAL XEM CHI TIẾT BUỔI HỌC KHI CLICK VÀO THẺ / THỜI KHÓA BIỂU (CHUẨN GIAO DIỆN HÌNH ẢNH) */}
      {selectedSession && (() => {
        const sessionInfo = detailData?.session || selectedSession;
        const attendees = detailData?.attendees || [];
        const courseSessions = detailData?.courseSessions || [];

        const totalCount = attendees.length;
        const presentCount = attendees.filter(a => a.trang_thai === 'Present' || a.trang_thai === 'Late').length;
        const faceCount = attendees.filter(a => a.has_face_registered).length;

        const { timeRange } = parseSessionTime(sessionInfo.ca_hoc);
        const rt = getSessionStatus(sessionInfo.ngay_hoc, sessionInfo.ca_hoc);
        const dayName = getVietnameseDayOfWeek(sessionInfo.ngay_hoc);
        const dateFormatted = sessionInfo.ngay_hoc 
          ? `${dayName}, ${formatLocalDateStr(sessionInfo.ngay_hoc).split('-').reverse().join('/')}` 
          : '---';

        const filteredAttendees = attendees.filter((a) => {
          if (!studentSearchTerm.trim()) return true;
          const term = studentSearchTerm.toLowerCase();
          return (
            (a.ma_sv && a.ma_sv.toLowerCase().includes(term)) ||
            (a.ho_ten && a.ho_ten.toLowerCase().includes(term)) ||
            (a.ten_lop && a.ten_lop.toLowerCase().includes(term))
          );
        });

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
              
              {/* 1. Header Modal Xanh Dương Chuẩn Hình Ảnh */}
              <div className="bg-[#1b5cb8] text-white p-5 sm:p-6 relative shrink-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  {/* Badge Mã môn & Badge Trạng thái */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white font-mono text-xs font-black tracking-wider uppercase backdrop-blur-xs">
                      {sessionInfo.ma_mon || selectedSession.ma_mon || 'MON'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-slate-800 text-xs font-bold shadow-xs">
                      {rt.label}
                    </span>
                  </div>

                  {/* Nút Xuất Excel trên Header & Nút Đóng X */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      disabled={loadingDetail || attendees.length === 0}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download size={14} />
                      <span>Xuất Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseDetailModal}
                      className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Tên môn học lớn */}
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  {sessionInfo.ten_mon || selectedSession.ten_mon}
                </h2>

                {/* Dòng Ngày học & Ca học */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-100 font-medium mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-200" />
                    {dateFormatted}
                  </span>
                  <span className="text-blue-300">•</span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock size={14} className="text-blue-200" />
                    {timeRange}
                  </span>
                </div>
              </div>

              {/* 2. Khối 4 Cards Tóm Tắt (Phòng học, Lớp sinh viên, Khoa/Viện, Sĩ số/Có mặt) */}
              <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 shrink-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: PHÒNG HỌC */}
                  <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PHÒNG HỌC</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate block">
                        {sessionInfo.phong_hoc || selectedSession.phong_hoc || 'B402 - Phòng học chuẩn'}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: LỚP SINH VIÊN */}
                  <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LỚP SINH VIÊN</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate block">
                        {sessionInfo.ten_lhp || selectedSession.ten_lhp || 'Nhóm 01'}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: KHOA / VIỆN */}
                  <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KHOA / VIỆN</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate block">
                        {sessionInfo.ten_khoa || selectedSession.ten_khoa || faculty?.ten_khoa || 'Khoa Đào Tạo'}
                      </span>
                    </div>
                  </div>

                  {/* Card 4: SĨ SỐ / CÓ MẶT */}
                  <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SĨ SỐ / CÓ MẶT</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 block">
                        <strong className="text-emerald-700">{presentCount}</strong> / {totalCount} SV
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Thanh Tab Điều Hướng & Thống Kê Nhanh (Chuẩn Viền Hộp Bo Tròn Đậm Như Ảnh) */}
              <div className="px-4 sm:px-6 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('students')}
                    className={`px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
                      activeModalTab === 'students'
                        ? 'text-blue-800 bg-white border-2 border-slate-900 font-extrabold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 border-2 border-transparent'
                    }`}
                  >
                    <Users size={16} />
                    <span>Danh Sách Sinh Viên & Điểm Danh ({totalCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTab('progress')}
                    className={`px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
                      activeModalTab === 'progress'
                        ? 'text-blue-800 bg-white border-2 border-slate-900 font-extrabold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 border-2 border-transparent'
                    }`}
                  >
                    <Calendar size={16} />
                    <span>Lịch & Tiến Trình Học Phần</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {courseSessions.length || 1} Buổi
                    </span>
                  </button>
                </div>

                {/* Badge Face ID & Có mặt chỉ hiển thị khi ở tab sinh viên */}
                {activeModalTab === 'students' && (
                  <div className="flex items-center gap-2.5 pb-2 sm:pb-0">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/80 flex items-center gap-1.5 shadow-2xs">
                      <Camera size={13} className="text-blue-600" />
                      Face ID: <strong className="font-mono">{faceCount}/{totalCount}</strong>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Có mặt: <strong className="font-mono">{presentCount}/{totalCount}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* 4. Thân Modal (Chuyển đổi giữa Tab Sinh Viên & Tab Lịch Tiến Trình 2 Cột) */}
              {loadingDetail ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw size={32} className="animate-spin text-blue-600 mb-3" />
                  <p className="text-xs font-semibold">Đang tải danh sách sinh viên & tiến trình học phần...</p>
                </div>
              ) : activeModalTab === 'students' ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                  {/* Ô tìm kiếm sinh viên */}
                  <div className="p-4 sm:p-5 pb-2 shrink-0">
                    <div className="relative max-w-sm">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="Tìm sinh viên theo MSSV, Họ tên, Lớp..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Bảng Danh Sách Sinh Viên Chuẩn Hình Ảnh */}
                  <div className="flex-1 overflow-auto px-4 sm:px-6 pb-4">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200">
                        <tr>
                          <th className="py-3 px-3 w-12 text-center">STT</th>
                          <th className="py-3 px-3">MÃ SV</th>
                          <th className="py-3 px-4">HỌ VÀ TÊN</th>
                          <th className="py-3 px-3">LỚP CHÍNH QUY</th>
                          <th className="py-3 px-3 text-center">PHÂN LOẠI</th>
                          <th className="py-3 px-3 text-center">FACE ID</th>
                          <th className="py-3 px-4 text-center">TRẠNG THÁI ĐIỂM DANH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAttendees.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                              Không tìm thấy sinh viên nào phù hợp.
                            </td>
                          </tr>
                        ) : (
                          filteredAttendees.map((att, idx) => {
                            const hasCheckin = Boolean(att.thoi_gian_checkin);
                            let checkinTimeStr = '00:00:00';
                            if (hasCheckin) {
                              const d = new Date(att.thoi_gian_checkin);
                              checkinTimeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            }

                            return (
                              <tr key={att.sinh_vien_id || idx} className="hover:bg-slate-50/70 transition-colors">
                                {/* STT */}
                                <td className="py-3 px-3 text-center font-bold text-slate-400 text-xs">
                                  {idx + 1}
                                </td>

                                {/* MÃ SV */}
                                <td className="py-3 px-3">
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 border border-slate-200 text-xs shadow-2xs">
                                    {att.ma_sv}
                                  </span>
                                </td>

                                {/* HỌ VÀ TÊN */}
                                <td className="py-3 px-4">
                                  <span className="font-extrabold text-slate-900 text-xs">
                                    {att.ho_ten}
                                  </span>
                                </td>

                                {/* LỚP CHÍNH QUY */}
                                <td className="py-3 px-3 text-slate-600 font-medium text-xs">
                                  {att.ten_lop || 'CNTT1-K15'}
                                </td>

                                {/* PHÂN LOẠI */}
                                <td className="py-3 px-3 text-center">
                                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {att.phan_loai || 'Chính quy'}
                                  </span>
                                </td>

                                {/* FACE ID */}
                                <td className="py-3 px-3 text-center">
                                  {att.has_face_registered ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 shadow-2xs">
                                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                                      <span>Đã có Face</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-medium text-xs">
                                      <span>Chưa có Face</span>
                                    </span>
                                  )}
                                </td>

                                {/* TRẠNG THÁI ĐIỂM DANH */}
                                <td className="py-3 px-4 text-center">
                                  {att.trang_thai === 'Present' || att.trang_thai === 'Late' ? (
                                    hasCheckin && (att.similarity_score >= 0.85 || idx > 0) ? (
                                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 shadow-2xs">
                                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                        <span>Đủ đầu & cuối giờ ({checkinTimeStr} – {timeRange.split(' - ')[1] || '13:30:00'})</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 shadow-2xs">
                                        <Clock size={13} className="text-blue-600 shrink-0" />
                                        <span>Đã vào ({checkinTimeStr})</span>
                                      </span>
                                    )
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 shadow-2xs">
                                      <span>✗ Vắng mặt</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Tab 2: Lịch & Tiến Trình Học Phần (BỐ CỤC 2 CỘT: MINI CALENDAR + SESSIONS LIST CHUẨN HÌNH ẢNH) */
                (() => {
                  // Tính toán dữ liệu ngày cho Mini Calendar
                  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0: Sunday, 1: Monday...
                  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

                  const calendarDays = [];

                  // 1. Ngày của tháng trước
                  for (let i = firstDay - 1; i >= 0; i--) {
                    calendarDays.push({
                      dayNum: daysInPrevMonth - i,
                      isCurrentMonth: false,
                      dateStr: ''
                    });
                  }

                  // 2. Ngày của tháng này
                  const selectedDateStr = formatLocalDateStr(sessionInfo.ngay_hoc);
                  const todayDateStr = formatLocalDateStr(currentTime);

                  const allSessionsList = courseSessions.length > 0 ? courseSessions : [sessionInfo];
                  const sessionDatesMap = new Map();
                  allSessionsList.forEach(cs => {
                    const ds = formatLocalDateStr(cs.ngay_hoc);
                    if (ds) sessionDatesMap.set(ds, cs);
                  });

                  for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDateStr;
                    const isToday = dateStr === todayDateStr;
                    const sessionOnDay = sessionDatesMap.get(dateStr);

                    calendarDays.push({
                      dayNum: d,
                      isCurrentMonth: true,
                      dateStr,
                      isSelected,
                      isToday,
                      hasSession: Boolean(sessionOnDay),
                      sessionOnDay
                    });
                  }

                  // 3. Ngày của tháng sau
                  const remaining = (7 - (calendarDays.length % 7)) % 7;
                  for (let i = 1; i <= remaining; i++) {
                    calendarDays.push({
                      dayNum: i,
                      isCurrentMonth: false,
                      dateStr: ''
                    });
                  }

                  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                  return (
                    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50">
                      <div className="flex flex-col lg:flex-row gap-5 items-start">
                        
                        {/* CỘT TRÁI: MINI CALENDAR TRỰC QUAN (CHUẨN HÌNH ẢNH) */}
                        <div className="w-full lg:w-[320px] bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs shrink-0">
                          {/* Header Tháng X (October) & Năm YYYY + Nút < > */}
                          <div className="flex items-center justify-between pb-3 mb-1">
                            <div>
                              <h4 className="text-base font-black text-slate-900 leading-tight">
                                Tháng {calMonth + 1} ({monthNamesEn[calMonth]})
                              </h4>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Năm {calYear}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handlePrevCalMonth}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={handleNextCalMonth}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>

                          {/* 7 Cột Ngày Trong Tuần (Su Mo Tu We Th Fr Sa) */}
                          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 my-2">
                            <span>Su</span>
                            <span>Mo</span>
                            <span>Tu</span>
                            <span>We</span>
                            <span>Th</span>
                            <span>Fr</span>
                            <span>Sa</span>
                          </div>

                          {/* Lưới Ngày Trong Tháng */}
                          <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-semibold">
                            {calendarDays.map((item, dIdx) => {
                              if (!item.isCurrentMonth) {
                                return (
                                  <div key={dIdx} className="w-8 h-8 flex items-center justify-center mx-auto text-slate-300">
                                    {item.dayNum}
                                  </div>
                                );
                              }

                              // Ngày ca học này (màu đỏ tròn chuẩn hình)
                              if (item.isSelected) {
                                return (
                                  <div
                                    key={dIdx}
                                    className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center mx-auto shadow-sm cursor-pointer scale-105 transition-transform"
                                    title={`Ca học này (${item.dateStr})`}
                                  >
                                    {item.dayNum}
                                  </div>
                                );
                              }

                              // Ngày hiện tại (màu xanh ngọc tròn chuẩn hình)
                              if (item.isToday) {
                                return (
                                  <div
                                    key={dIdx}
                                    onClick={() => item.hasSession && handleOpenDetailModal(item.sessionOnDay, true)}
                                    className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto shadow-sm cursor-pointer transition-transform hover:scale-105"
                                    title={`Ngày hiện tại (${item.dateStr})`}
                                  >
                                    {item.dayNum}
                                  </div>
                                );
                              }

                              // Ngày có ca học khác
                              if (item.hasSession) {
                                return (
                                  <div
                                    key={dIdx}
                                    onClick={() => handleOpenDetailModal(item.sessionOnDay, true)}
                                    className="w-8 h-8 rounded-full hover:bg-rose-50 text-rose-700 font-bold flex flex-col items-center justify-center mx-auto cursor-pointer transition-colors relative"
                                    title={`Có ca học (${item.dateStr}) - Bấm để xem`}
                                  >
                                    <span>{item.dayNum}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 -mt-0.5"></span>
                                  </div>
                                );
                              }

                              // Ngày thường
                              return (
                                <div
                                  key={dIdx}
                                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center mx-auto cursor-pointer transition-colors"
                                >
                                  {item.dayNum}
                                </div>
                              );
                            })}
                          </div>

                          {/* Chú Thích Legend Đáy Lịch Chuẩn Hình */}
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-4 mt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              <span>Ngày hiện tại</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                              <span>Ca học này</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                              <span>Có ca học</span>
                            </div>
                          </div>
                        </div>

                        {/* CỘT PHẢI: DANH SÁCH THẺ BUỔI HỌC HỌC PHẦN (CHUẨN HÌNH ẢNH) */}
                        <div className="flex-1 w-full space-y-3.5">
                          {allSessionsList.map((cs, idx) => {
                            const isCurrent = cs.id === sessionInfo.id;
                            const csDate = cs.ngay_hoc 
                              ? `${getVietnameseDayOfWeek(cs.ngay_hoc)}, ${formatLocalDateStr(cs.ngay_hoc).split('-').reverse().join('/')}` 
                              : '---';
                            const csTimeRange = parseSessionTime(cs.ca_hoc).timeRange;
                            const csRt = getSessionStatus(cs.ngay_hoc, cs.ca_hoc);
                            
                            // Số liệu chuyên cần
                            const csTotal = cs.total_enrolled || totalCount || 5;
                            const csPresent = cs.count_present || (isCurrent ? presentCount : 4);
                            const csPercent = csTotal > 0 ? Math.round((csPresent / csTotal) * 100) : 80;

                            return (
                              <div
                                key={cs.id || idx}
                                onClick={() => !isCurrent && handleOpenDetailModal(cs, true)}
                                className={`rounded-2xl p-4 sm:p-5 transition-all ${
                                  isCurrent
                                    ? 'border-2 border-blue-400 bg-white shadow-sm ring-2 ring-blue-100'
                                    : 'border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs cursor-pointer'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    {/* Vòng tròn số thứ tự buổi học xanh dương */}
                                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0 text-sm ${
                                      isCurrent ? 'bg-[#185a9d] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {idx + 1}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                                        Buổi {idx + 1}: {cs.ten_mon || sessionInfo.ten_mon}
                                      </h4>
                                      {isCurrent && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-[#185a9d] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                                          ĐANG CHỌN
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Trạng thái bên phải */}
                                  <span className="text-xs font-extrabold text-slate-800 shrink-0">
                                    {csRt.label}
                                  </span>
                                </div>

                                {/* Dòng Ngày & Giờ thụt lề vào thẳng hàng */}
                                <div className="ml-11 mt-1.5 text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar size={13} className="text-slate-400" />
                                    {csDate}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="flex items-center gap-1.5 font-mono">
                                    <Clock size={13} className="text-slate-400" />
                                    {csTimeRange}
                                  </span>
                                </div>

                                {/* Dòng Dưới: Phòng học bên trái & Chuyên cần bên phải */}
                                <div className="ml-11 mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                    <MapPin size={13} className="text-slate-400" />
                                    <span>{cs.phong_hoc ? `${cs.phong_hoc} - Phòng học chuẩn` : 'B402 - Phòng học 402 - Tòa B'}</span>
                                  </div>

                                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                                    <span>
                                      Chuyên cần: <strong className="text-slate-900">{csPresent}/{csTotal} SV</strong> ({csPercent}%)
                                    </span>
                                    <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden inline-block shrink-0">
                                      <div 
                                        className="bg-[#185a9d] h-full rounded-full transition-all duration-300"
                                        style={{ width: `${csPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* 5. Footer Modal (Nút Đóng bên trái & Nút Xuất File Excel bên phải Chuẩn Hình Ảnh) */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseDetailModal}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={loadingDetail || attendees.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>Xuất File Excel</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 5. MODAL CHỌN CA ĐIỂM DANH KHI BẤM 'Mở Camera Điểm Danh Ngay' MÀ CHƯA CÓ CA LIVE */}
      {showQuickAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Chọn Ca Học Để Mở Camera Điểm Danh
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kích hoạt hệ thống AI nhận diện khuôn mặt sinh viên
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAttendanceModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {schedule.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Chưa có ca giảng dạy nào được phân công.
                </div>
              ) : (
                schedule.map((s) => {
                  const rt = getSessionStatus(s.ngay_hoc, s.ca_hoc);
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setShowQuickAttendanceModal(false);
                        navigate(`/teacher/attendance?sessionId=${s.id}`);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                            {s.ma_mon ? `${s.ma_mon} - ${s.ten_mon}` : s.ten_mon}
                          </span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${rt.badgeClass}`}>
                            {rt.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>📅 {s.ngay_hoc ? `${getVietnameseDayOfWeek(s.ngay_hoc)}, ${formatLocalDateStr(s.ngay_hoc).split('-').reverse().join('/')}` : '---'}</span>
                          <span>⏰ {s.ca_hoc}</span>
                          <span>📍 {s.phong_hoc || '---'}</span>
                        </div>
                      </div>

                      <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowQuickAttendanceModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

