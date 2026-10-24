import React, { useState, useEffect, useMemo } from 'react';
import { studentService } from '../../services/studentService';
import { useNavigate, Link } from 'react-router-dom';
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
  Layers,
  Search,
  X,
  Camera,
  BookOpen,
  GraduationCap,
  Sparkles,
  AlertCircle,
  UserCheck,
  Check,
  Filter,
  ArrowRight
} from 'lucide-react';

export default function StudentSchedule() {
  const navigate = useNavigate();

  // Dữ liệu thời khóa biểu & bộ lọc
  const [sessions, setSessions] = useState([]);
  const [myInfo, setMyInfo] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Chế độ tra cứu: 'my_schedule' (Lịch cá nhân) | 'by_class' (Băm nhỏ theo Khoa -> Lớp)
  const [filterMode, setFilterMode] = useState('my_schedule');

  // Lựa chọn Khoa & Lớp
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('all');

  // Chế độ hiển thị: 'grid' (Lưới thời khóa biểu theo tuần) | 'cards' (Danh sách thẻ buổi học)
  const [viewMode, setViewMode] = useState('grid');

  // Quản lý Tuần cho chế độ Thời Khóa Biểu (0 = tuần hiện tại)
  const [weekOffset, setWeekOffset] = useState(0);

  // Bộ lọc môn học
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Modal xem chi tiết Buổi học & Danh sách Sinh viên
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Các ca học chuẩn
  const STANDARD_SHIFTS = [
    { id: 'ca1', label: 'Ca 1 (07:00 - 09:15)', name: 'Ca 1', start: '07:00', end: '09:15' },
    { id: 'ca2', label: 'Ca 2 (09:15 - 11:45)', name: 'Ca 2', start: '09:15', end: '11:45' },
    { id: 'ca3', label: 'Ca 3 (13:00 - 15:15)', name: 'Ca 3', start: '13:00', end: '15:15' },
    { id: 'ca4', label: 'Ca 4 (15:00 - 17:45)', name: 'Ca 4', start: '15:00', end: '17:45' },
    { id: 'ca5', label: 'Ca 5 (18:00 - 20:15)', name: 'Ca 5', start: '18:00', end: '20:15' }
  ];

  // Helper tính toán các ngày trong tuần đang chọn
  const weekDays = useMemo(() => {
    const now = new Date();
    // Chuyển về đầu tuần (Thứ Hai)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
    const monday = new Date(now.setDate(diff));

    const days = [];
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push({
        name: dayNames[i],
        dateStr,
        dayNumber: d.getDate(),
        month: d.getMonth() + 1,
        isToday
      });
    }
    return days;
  }, [weekOffset]);

  // Danh sách các Lớp được lọc theo Khoa đang chọn
  const filteredClasses = useMemo(() => {
    if (!selectedFacultyId) return classes;
    return classes.filter((c) => String(c.khoa_id) === String(selectedFacultyId));
  }, [classes, selectedFacultyId]);

  // Tải dữ liệu thời khóa biểu
  const loadScheduleData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {
        mode: filterMode,
        hoc_ky_id: selectedSemesterId
      };

      if (filterMode === 'by_class') {
        if (selectedFacultyId) params.khoa_id = selectedFacultyId;
        if (selectedClassId) params.lop_id = selectedClassId;
      }

      const res = await studentService.getSchedule(params);
      if (res.success) {
        setSessions(res.data || []);
        if (res.faculties) setFaculties(res.faculties);
        if (res.classes) setClasses(res.classes);
        if (res.semesters) setSemesters(res.semesters);
        if (res.myInfo) {
          setMyInfo(res.myInfo);
          // Khởi tạo giá trị mặc định cho khoa và lớp nếu chưa chọn
          if (!selectedFacultyId && res.myInfo.khoa_id) {
            setSelectedFacultyId(String(res.myInfo.khoa_id));
          }
          if (!selectedClassId && res.myInfo.lop_id) {
            setSelectedClassId(String(res.myInfo.lop_id));
          }
        }
      }
    } catch (err) {
      console.warn('Lỗi nạp lịch học sinh viên:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [filterMode, selectedFacultyId, selectedClassId, selectedSemesterId]);

  // Chuyển đổi khi đổi Khoa -> tự chọn lớp đầu tiên của khoa đó
  const handleFacultyChange = (newFacultyId) => {
    setSelectedFacultyId(newFacultyId);
    const classesInFaculty = classes.filter((c) => String(c.khoa_id) === String(newFacultyId));
    if (classesInFaculty.length > 0) {
      setSelectedClassId(String(classesInFaculty[0].id));
    } else {
      setSelectedClassId('');
    }
  };

  // Nạp chi tiết buổi học và danh sách sinh viên
  const openSessionDetail = async (sessionId) => {
    setSelectedSessionId(sessionId);
    setLoadingDetail(true);
    setStudentSearchTerm('');
    try {
      const res = await studentService.getSessionStudentDetails(sessionId);
      if (res.success) {
        setSessionDetail(res.data);
      }
    } catch (err) {
      console.error('Lỗi nạp chi tiết sinh viên buổi học:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeSessionDetail = () => {
    setSelectedSessionId(null);
    setSessionDetail(null);
  };

  // Lọc sinh viên trong modal chi tiết
  const filteredStudents = useMemo(() => {
    if (!sessionDetail?.students) return [];
    if (!studentSearchTerm.trim()) return sessionDetail.students;
    const term = studentSearchTerm.toLowerCase().trim();
    return sessionDetail.students.filter(
      (s) =>
        s.ho_ten?.toLowerCase().includes(term) ||
        s.ma_sv?.toLowerCase().includes(term) ||
        s.ten_lop?.toLowerCase().includes(term)
    );
  }, [sessionDetail, studentSearchTerm]);

  // Danh sách các môn duy nhất trong các ca học để lọc nhanh
  const uniqueSubjects = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      if (s.ten_mon && !map.has(s.ten_mon)) {
        map.set(s.ten_mon, s.ten_mon);
      }
    });
    return Array.from(map.values());
  }, [sessions]);

  // Helper map ca học
  const getShiftIndex = (caHocStr) => {
    if (!caHocStr || caHocStr === 0 || caHocStr === '0') return 0;
    const lower = String(caHocStr).toLowerCase();
    if (lower.includes('ca 1') || lower.includes('07:00') || lower.includes('07:30')) return 0;
    if (lower.includes('ca 2') || lower.includes('09:15') || lower.includes('09:30') || lower.includes('10:00')) return 1;
    if (lower.includes('ca 3') || lower.includes('13:00') || lower.includes('13:30')) return 2;
    if (lower.includes('ca 4') || lower.includes('15:00') || lower.includes('15:30')) return 3;
    if (lower.includes('ca 5') || lower.includes('18:00')) return 4;
    return 0;
  };

  const formatCaHoc = (caHoc) => {
    if (!caHoc || caHoc === 0 || caHoc === '0') return 'Ca 1 (07:00 - 09:15)';
    return String(caHoc);
  };

  // Helper chuẩn hóa ngày YYYY-MM-DD
  const formatLocalDateStr = (dateInput) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      return dateInput.substring(0, 10);
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  // Tìm các buổi học cho 1 ngày và 1 ca
  const getSessionsForCell = (dateStr, shiftIdx) => {
    return sessions.filter((s) => {
      const sDate = formatLocalDateStr(s.ngay_hoc);
      if (sDate !== dateStr) return false;
      const sShift = getShiftIndex(s.ca_hoc);
      if (sShift !== shiftIdx) return false;
      if (subjectFilter !== 'all' && s.ten_mon !== subjectFilter) return false;
      return true;
    });
  };

  // Ngày hiện tại
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '10px'
            }}
          >
            <CalendarDays size={16} /> THỜI KHÓA BIỂU & LỊCH HỌC SINH VIÊN
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Lịch Học & Danh Sách Lớp Sinh Viên
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
            Theo dõi thời khóa biểu học phần, tra cứu lịch học băm nhỏ theo Khoa & Lớp, xem danh sách sinh viên cùng học và trạng thái điểm danh.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => loadScheduleData(true)}
            disabled={loading || refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Làm mới lịch
          </button>

          <Link
            to="/student/checkin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 6px 15px -3px rgba(14, 165, 233, 0.4)'
            }}
          >
            <Camera size={16} /> Điểm danh FaceAI + GPS
          </Link>
        </div>
      </div>

      {/* 2. Thanh Điều Khiển & Bộ Lọc Băm Nhỏ Theo Khoa -> Lớp */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Hàng 1: Tabs chuyển chế độ xem */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '14px'
          }}
        >
          {/* Switch Chế độ tra cứu: Lịch cá nhân vs Băm nhỏ theo Khoa -> Lớp */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterMode('my_schedule')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                background: filterMode === 'my_schedule' ? '#0f172a' : '#f1f5f9',
                color: filterMode === 'my_schedule' ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <UserCheck size={16} /> Lịch học của tôi ({myInfo?.ten_lop || 'Lớp của bạn'})
            </button>

            {/* <button
              onClick={() => setFilterMode('by_class')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                background: filterMode === 'by_class' ? '#0f172a' : '#f1f5f9',
                color: filterMode === 'by_class' ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Filter size={16} /> Tra cứu theo Khoa & Lớp
            </button> */}
          </div>

          {/* Switch Kiểu hiển thị: Lưới Tuần vs Thẻ Danh Sách */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Chế độ xem:</span>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <LayoutGrid size={14} /> Lưới Tuần
              </button>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                  color: viewMode === 'cards' ? '#0f172a' : '#64748b',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Calendar size={14} /> Thẻ Danh Sách
              </button>
            </div>
          </div>
        </div>

        {/* Hàng 2: Bộ chọn chi tiết Khoa -> Lớp (khi ở chế độ băm nhỏ) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
          {filterMode === 'by_class' && (
            <>
              {/* Chọn Khoa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="#64748b" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Khoa:</span>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                >
                  <option value="">-- Tất cả các Khoa --</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.ten_khoa} ({f.ma_khoa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn Lớp sinh hoạt */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={16} color="#64748b" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Lớp sinh viên:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#f8fafc',
                    minWidth: '180px'
                  }}
                >
                  <option value="">-- Tất cả các Lớp --</option>
                  {filteredClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ten_lop} ({c.total_students || 0} SV)
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Chọn Học kỳ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Học kỳ:</span>
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0f172a',
                outline: 'none',
                background: '#f8fafc'
              }}
            >
              <option value="all">Tất cả học kỳ</option>
              {semesters.map((hk) => (
                <option key={hk.id} value={hk.id}>
                  {hk.ten_hoc_ky} ({hk.nam_hoc}) {hk.is_active ? '• Hiện tại' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo môn học */}
          {uniqueSubjects.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="#64748b" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Môn học:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              >
                <option value="all">Tất cả môn học ({uniqueSubjects.length})</option>
                {uniqueSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Thông tin lớp hiện tại của sinh viên */}
          {myInfo && (
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
              Lớp của bạn: <b style={{ color: '#0ea5e9' }}>{myInfo.ten_lop}</b> | Khoa:{' '}
              <b style={{ color: '#0f172a' }}>{myInfo.ten_khoa}</b>
            </div>
          )}
        </div>
      </div>

      {/* 3. Chế độ Xem Lưới Tuần (Weekly Grid View) */}
      {viewMode === 'grid' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          {/* Thanh chuyển tuần */}
          <div
            style={{
              padding: '16px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} /> Tuần trước
              </button>

              <button
                onClick={() => setWeekOffset(0)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: weekOffset === 0 ? '#0284c7' : '#ffffff',
                  border: weekOffset === 0 ? 'none' : '1px solid #cbd5e1',
                  color: weekOffset === 0 ? '#ffffff' : '#334155',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Tuần hiện tại
              </button>

              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                Tuần tiếp theo <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
              Từ {weekDays[0].dayNumber}/{weekDays[0].month} đến {weekDays[6].dayNumber}/
              {weekDays[6].month}/{new Date().getFullYear()}
            </div>
          </div>

          {/* Bảng Lưới Thời Khóa Biểu 7 Ngày x 5 Ca */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1050px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th
                    style={{
                      width: '140px',
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#475569',
                      borderRight: '1px solid #e2e8f0'
                    }}
                  >
                    CA HỌC / THỜI GIAN
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateStr}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderRight: '1px solid #e2e8f0',
                        background: day.isToday ? 'rgba(14, 165, 233, 0.08)' : 'transparent'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '800',
                          color: day.isToday ? '#0284c7' : '#1e293b'
                        }}
                      >
                        {day.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: day.isToday ? '#0284c7' : '#64748b',
                          fontWeight: day.isToday ? '700' : '500'
                        }}
                      >
                        {day.dayNumber}/{day.month}
                        {day.isToday && ' • Hôm nay'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STANDARD_SHIFTS.map((shift, shiftIdx) => (
                  <tr key={shift.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {/* Cột Tên Ca */}
                    <td
                      style={{
                        padding: '14px 16px',
                        background: '#f8fafc',
                        borderRight: '1px solid #e2e8f0',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                        {shift.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {shift.start} - {shift.end}
                      </div>
                    </td>

                    {/* 7 Cột Ngày */}
                    {weekDays.map((day) => {
                      const cellSessions = getSessionsForCell(day.dateStr, shiftIdx);
                      return (
                        <td
                          key={day.dateStr + shift.id}
                          style={{
                            padding: '10px',
                            borderRight: '1px solid #e2e8f0',
                            verticalAlign: 'top',
                            background: day.isToday ? 'rgba(14, 165, 233, 0.03)' : '#ffffff',
                            height: '110px'
                          }}
                        >
                          {cellSessions.length === 0 ? (
                            <div
                              style={{
                                height: '100%',
                                minHeight: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#cbd5e1',
                                fontSize: '12px'
                              }}
                            >
                              -
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {cellSessions.map((s) => (
                                <div
                                  key={s.buoi_hoc_id}
                                  onClick={() => openSessionDetail(s.buoi_hoc_id)}
                                  style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                    border: '1px solid #86efac',
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: '800',
                                      color: '#14532d',
                                      lineHeight: '1.3'
                                    }}
                                  >
                                    {s.ten_mon}
                                  </div>

                                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '600' }}>
                                    {s.ma_lhp} {s.ten_lop ? `• ${s.ten_lop}` : ''}
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '11px',
                                      color: '#166534'
                                    }}
                                  >
                                    <MapPin size={11} /> Phòng: <b>{s.phong_hoc || 'Chưa xếp'}</b>
                                  </div>

                                  {s.ten_giang_vien && (
                                    <div style={{ fontSize: '11px', color: '#166534' }}>
                                      GV: <b>{s.ten_giang_vien}</b>
                                    </div>
                                  )}

                                  {/* Badge Trạng thái điểm danh của sinh viên */}
                                  <div
                                    style={{
                                      marginTop: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background:
                                          s.trang_thai_diem_danh === 'Present' ||
                                            s.trang_thai_diem_danh === 'Có mặt'
                                            ? '#22c55e'
                                            : s.trang_thai_diem_danh === 'Late' ||
                                              s.trang_thai_diem_danh === 'Đi muộn'
                                              ? '#f59e0b'
                                              : '#94a3b8',
                                        color: '#ffffff'
                                      }}
                                    >
                                      {s.trang_thai_diem_danh || 'Chưa điểm danh'}
                                    </span>

                                    <span
                                      style={{
                                        fontSize: '10px',
                                        color: '#047857',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px'
                                      }}
                                    >
                                      <Users size={11} /> {s.total_enrolled || 0} SV
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Chế độ Xem Thẻ Danh Sách Buổi Học (Cards View) */}
      {viewMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessions.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#64748b'
              }}
            >
              <Calendar size={48} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                Không tìm thấy buổi học nào
              </div>
              <p style={{ fontSize: '13px', margin: '6px 0 0 0' }}>
                Hãy thử chọn lại Khoa, Lớp hoặc Học kỳ khác để xem thời khóa biểu tương ứng.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '16px'
              }}
            >
              {sessions.map((s) => {
                const sDate = formatLocalDateStr(s.ngay_hoc);
                const isToday = sDate === todayStr;

                return (
                  <div
                    key={s.buoi_hoc_id}
                    onClick={() => openSessionDetail(s.buoi_hoc_id)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: isToday ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      padding: '18px 20px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>
                          {s.ten_mon}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Mã LHP: <b>{s.ma_lhp}</b> | Lớp: <b>{s.ten_lop || 'Chung'}</b>
                        </div>
                      </div>

                      {isToday && (
                        <span
                          style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          HÔM NAY
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} color="#0284c7" />
                        <span>
                          {formatCaHoc(s.ca_hoc)} • <b>{sDate}</b>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="#16a34a" />
                        <span>
                          Phòng: <b>{s.phong_hoc || 'Chưa xếp'}</b>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={15} color="#8b5cf6" />
                        <span>
                          Sĩ số lớp: <b>{s.total_enrolled || 0} sinh viên</b>
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Điểm danh:{' '}
                        <b
                          style={{
                            color:
                              s.trang_thai_diem_danh === 'Present' || s.trang_thai_diem_danh === 'Có mặt'
                                ? '#16a34a'
                                : '#64748b'
                          }}
                        >
                          {s.trang_thai_diem_danh || 'Chưa điểm danh'}
                        </b>
                      </div>

                      <button
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Xem sinh viên <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Modal Xem Chi Tiết Buổi Học & Danh Sách Sinh Viên Cùng Lớp */}
      {selectedSessionId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'scaleIn 0.25s ease-out'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
                  CHI TIẾT BUỔI HỌC & DANH SÁCH SINH VIÊN
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0' }}>
                  {sessionDetail?.session?.ten_mon || 'Đang tải thông tin buổi học...'}
                </h3>
              </div>

              <button
                onClick={closeSessionDetail}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                  <div>Đang nạp danh sách sinh viên lớp học phần...</div>
                </div>
              ) : sessionDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Cụm thông tin buổi học */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '16px 20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '13px'
                    }}
                  >
                    <div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>MÃ LỚP HỌC PHẦN</div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {sessionDetail.session.ma_lhp}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>GIẢNG VIÊN GIẢNG DẠY</div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {sessionDetail.session.ten_giang_vien || 'Chưa phân công'}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>PHÒNG HỌC & CA HỌC</div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        Phòng {sessionDetail.session.phong_hoc} ({formatCaHoc(sessionDetail.session.ca_hoc)})
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>NGÀY HỌC</div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {formatLocalDateStr(sessionDetail.session.ngay_hoc)}
                      </div>
                    </div>
                  </div>

                  {/* Thống kê sĩ số điểm danh */}
                  {sessionDetail.stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TỔNG SỐ LỚP</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                          {sessionDetail.stats.total}
                        </div>
                      </div>

                      <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700' }}>CÓ MẶT</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>
                          {sessionDetail.stats.present}
                        </div>
                      </div>

                      <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>ĐI MUỘN</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#d97706' }}>
                          {sessionDetail.stats.late}
                        </div>
                      </div>

                      <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700' }}>VẮNG / CHƯA ĐD</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626' }}>
                          {sessionDetail.stats.absent + sessionDetail.stats.pending}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thanh tìm kiếm sinh viên */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      DANH SÁCH SINH VIÊN CÙNG LỚP ({filteredStudents.length}/{sessionDetail.students.length})
                    </div>

                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Tìm theo tên, mã SV, lớp..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 32px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Bảng Danh Sách Sinh Viên */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                          <th style={{ padding: '10px 14px', width: '50px' }}>STT</th>
                          <th style={{ padding: '10px 14px' }}>Mã SV</th>
                          <th style={{ padding: '10px 14px' }}>Họ và Tên</th>
                          <th style={{ padding: '10px 14px' }}>Lớp Sinh Hoạt</th>
                          <th style={{ padding: '10px 14px' }}>Trạng Thái</th>
                          <th style={{ padding: '10px 14px' }}>Thời Gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((sv, idx) => (
                          <tr
                            key={sv.sinh_vien_id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: sv.is_me ? 'rgba(14, 165, 233, 0.08)' : '#ffffff'
                            }}
                          >
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>{idx + 1}</td>
                            <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0f172a' }}>
                              {sv.ma_sv}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ fontWeight: '600', color: sv.is_me ? '#0284c7' : '#1e293b' }}>
                                {sv.ho_ten}
                              </span>
                              {sv.is_me && (
                                <span
                                  style={{
                                    marginLeft: '8px',
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    background: '#0284c7',
                                    color: '#ffffff',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  TÔI
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#475569' }}>{sv.ten_lop}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background:
                                    sv.trang_thai === 'Present' || sv.trang_thai === 'Có mặt'
                                      ? '#dcfce7'
                                      : sv.trang_thai === 'Late' || sv.trang_thai === 'Đi muộn'
                                        ? '#fef3c7'
                                        : sv.trang_thai === 'Absent' || sv.trang_thai === 'Vắng'
                                          ? '#fee2e2'
                                          : '#f1f5f9',
                                  color:
                                    sv.trang_thai === 'Present' || sv.trang_thai === 'Có mặt'
                                      ? '#15803d'
                                      : sv.trang_thai === 'Late' || sv.trang_thai === 'Đi muộn'
                                        ? '#b45309'
                                        : sv.trang_thai === 'Absent' || sv.trang_thai === 'Vắng'
                                          ? '#b91c1c'
                                          : '#64748b'
                                }}
                              >
                                {sv.trang_thai || 'Chưa điểm danh'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>
                              {sv.thoi_gian_checkin
                                ? new Date(sv.thoi_gian_checkin).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <button
                onClick={closeSessionDetail}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>

              {sessionDetail && formatLocalDateStr(sessionDetail.session.ngay_hoc) === todayStr && (
                <button
                  onClick={() => {
                    navigate(`/student/checkin?sessionId=${sessionDetail.session.buoi_hoc_id}`);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)'
                  }}
                >
                  <Camera size={15} /> Điểm danh buổi học này ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
