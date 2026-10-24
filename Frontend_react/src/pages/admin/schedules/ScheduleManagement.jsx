import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpenCheck,
  Plus,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Edit2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Users
} from 'lucide-react';

export default function ScheduleManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || 'all');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [selectedSemesterId, setSelectedSemesterId] = useState('all');

  // Các ca học chuẩn tiêu chuẩn của trường
  const STANDARD_SHIFTS = [
    { label: 'Ca 1 (07:00 - 09:15)', name: 'Ca 1', start: '07:00', end: '09:15' },
    { label: 'Ca 1b (07:30 - 10:00)', name: 'Ca 1b', start: '07:30', end: '10:00' },
    { label: 'Ca 2 (09:15 - 11:45)', name: 'Ca 2', start: '09:15', end: '11:45' },
    { label: 'Ca 2b (09:30 - 11:45)', name: 'Ca 2b', start: '09:30', end: '11:45' },
    { label: 'Ca 2c (10:00 - 12:30)', name: 'Ca 2c', start: '10:00', end: '12:30' },
    { label: 'Ca 3 (13:00 - 15:15)', name: 'Ca 3', start: '13:00', end: '15:15' },
    { label: 'Ca 3b (13:30 - 15:30)', name: 'Ca 3b', start: '13:30', end: '15:30' },
    { label: 'Ca 4 (15:00 - 17:45)', name: 'Ca 4', start: '15:00', end: '17:45' },
    { label: 'Ca 4b (15:30 - 17:45)', name: 'Ca 4b', start: '15:30', end: '17:45' },
    { label: 'Ca 5 (18:00 - 20:15)', name: 'Ca 5', start: '18:00', end: '20:15' }
  ];

  const extractTimeFromCaHoc = (caHocStr) => {
    let start = '07:00';
    let end = '09:15';
    if (caHocStr) {
      const match = String(caHocStr).match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
      if (match) {
        start = `${match[1].padStart(2, '0')}:${match[2]}`;
        end = `${match[3].padStart(2, '0')}:${match[4]}`;
      }
    }
    return { start, end };
  };

  const formatCaHoc = (caHoc) => {
    if (!caHoc || caHoc === 0 || caHoc === '0') {
      return 'Ca 1 (07:00 - 09:15)';
    }
    return String(caHoc);
  };

  // Modal Thêm buổi học
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    lop_hoc_phan_id: '',
    ngay_hoc: new Date().toISOString().split('T')[0],
    ca_hoc: 'Ca 1 (07:00 - 09:15)',
    gio_bat_dau: '07:00',
    gio_ket_thuc: '09:15',
    phong_hoc: '',
    ghi_chu: ''
  });

  // Modal Tạo lịch tự động theo tuần
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    lop_hoc_phan_id: '',
    ngay_bat_dau: new Date().toISOString().split('T')[0],
    thu_trong_tuan: 2, // Thứ 2
    so_buoi: '',
    ca_hoc: 'Ca 1 (07:00 - 09:15)',
    gio_bat_dau: '07:00',
    gio_ket_thuc: '09:15',
    phong_hoc: ''
  });

  // Modal Sửa buổi học
  const [editSession, setEditSession] = useState(null);
  const [editForm, setEditForm] = useState({
    lop_hoc_phan_id: '',
    ngay_hoc: '',
    ca_hoc: 'Ca 1 (07:00 - 09:15)',
    gio_bat_dau: '07:00',
    gio_ket_thuc: '09:15',
    phong_hoc: '',
    ghi_chu: '',
    is_active: true
  });

  // Modal Chi tiết buổi học
  const [detailSession, setDetailSession] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, semRes] = await Promise.all([
        adminService.getCourses(),
        adminService.getSemesters()
      ]);

      if (cRes.success) setCourses(cRes.data);
      if (semRes.success) setSemesters(semRes.data);

      await fetchSessions();
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const params = {};
      if (selectedCourseId !== 'all') params.courseId = selectedCourseId;
      if (selectedDate) params.date = selectedDate;
      if (selectedSemesterId !== 'all') params.semesterId = selectedSemesterId;

      const res = await adminService.getAllSessions(params);
      if (res.success) {
        setSessions(res.data);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [selectedCourseId, selectedDate, selectedSemesterId]);

  const handleToggleActive = async (sessionId) => {
    try {
      const res = await adminService.toggleSessionActive(sessionId);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        fetchSessions();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!createForm.lop_hoc_phan_id) {
      setNotice({ type: 'error', message: 'Vui lòng chọn lớp học phần!' });
      return;
    }
    try {
      const res = await adminService.createSession(createForm);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCreateModalOpen(false);
        setCreateForm({
          lop_hoc_phan_id: '',
          ngay_hoc: new Date().toISOString().split('T')[0],
          ca_hoc: 'Ca 1 (07:00 - 09:15)',
          phong_hoc: '',
          ghi_chu: ''
        });
        fetchSessions();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    if (!bulkForm.lop_hoc_phan_id) {
      setNotice({ type: 'error', message: 'Vui lòng chọn lớp học phần!' });
      return;
    }

    try {
      setLoading(true);
      const startDate = new Date(bulkForm.ngay_bat_dau);
      const createdCount = parseInt(bulkForm.so_buoi) || 15;
      
      let promises = [];
      for (let i = 0; i < createdCount; i++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(startDate.getDate() + i * 7); // Cách nhau mỗi 7 ngày
        const formattedDate = sessionDate.toISOString().split('T')[0];

        promises.push(
          adminService.createSession({
            lop_hoc_phan_id: bulkForm.lop_hoc_phan_id,
            ngay_hoc: formattedDate,
            ca_hoc: bulkForm.ca_hoc,
            phong_hoc: bulkForm.phong_hoc,
            ghi_chu: `Buổi ${i + 1}/${createdCount}`
          })
        );
      }

      await Promise.all(promises);
      setNotice({ type: 'success', message: `Đã tự động tạo thành công ${createdCount} buổi học hàng tuần!` });
      setIsBulkModalOpen(false);
      fetchSessions();
    } catch (err) {
      setNotice({ type: 'error', message: 'Lỗi tạo lịch tự động: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (session) => {
    setEditSession(session);
    const { start, end } = extractTimeFromCaHoc(session.ca_hoc);
    const dateFormatted = session.ngay_hoc ? String(session.ngay_hoc).substring(0, 10) : '';

    setEditForm({
      lop_hoc_phan_id: session.lop_hoc_phan_id || '',
      ngay_hoc: dateFormatted,
      ca_hoc: session.ca_hoc || 'Ca 1 (07:00 - 09:15)',
      gio_bat_dau: start,
      gio_ket_thuc: end,
      phong_hoc: session.phong_hoc || '',
      ghi_chu: session.ghi_chu || '',
      is_active: Boolean(session.is_active)
    });
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    if (!editSession) return;
    try {
      const res = await adminService.updateSession(editSession.id, editForm);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setEditSession(null);
        fetchSessions();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa buổi học này khỏi lịch trình?')) return;
    try {
      const res = await adminService.deleteSession(sessionId);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        fetchSessions();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const columns = [
    {
      header: 'Thời gian',
      render: (row) => {
        const dateObj = new Date(row.ngay_hoc);
        const dayStr = dateObj.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} style={{ color: '#2563eb' }} />
              {dayStr}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
              <Clock size={12} />
              {formatCaHoc(row.ca_hoc)}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Lớp học phần & Môn',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>
            {row.ten_lhp}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{row.ma_lhp}</span> • {row.ten_mon} {row.so_buoi_hoc ? `(${row.so_buoi_hoc} buổi quy định)` : ''}
          </div>
        </div>
      )
    },
    {
      header: 'Phòng học',
      accessor: 'phong_hoc',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', color: '#334155' }}>
          <MapPin size={13} style={{ color: '#ef4444' }} /> {row.phong_hoc}
        </span>
      )
    },
    {
      header: 'Giảng viên',
      accessor: 'ten_giang_vien',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#334155' }}>
          {row.ten_giang_vien || 'Chưa phân công'}
        </span>
      )
    },
    {
      header: 'Điểm danh SV',
      render: (row) => {
        const total = row.total_enrolled || 0;
        const present = row.count_present || 0;
        const late = row.count_late || 0;
        const absent = row.count_absent || 0;
        const checked = present + late + absent;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
              Check-in: <span style={{ color: '#0f172a' }}>{checked}/{total} SV</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', fontSize: '0.7rem' }}>
              <span style={{ color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>{present} Đúng giờ</span>
              {late > 0 && <span style={{ color: '#d97706', background: '#fef3c7', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>{late} Muộn</span>}
              {absent > 0 && <span style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>{absent} Vắng</span>}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Cổng điểm danh',
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row.id)}
          title={row.is_active ? 'Nhấn để Khóa cổng điểm danh Face AI' : 'Nhấn để Mở cổng điểm danh Face AI'}
          style={{
            background: row.is_active ? '#ecfdf5' : '#f8fafc',
            color: row.is_active ? '#059669' : '#94a3b8',
            padding: '5px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            border: `1px solid ${row.is_active ? '#a7f3d0' : '#e2e8f0'}`
          }}
        >
          {row.is_active ? (
            <>
              <ToggleRight size={18} style={{ color: '#10b981' }} />
              ĐANG MỞ
            </>
          ) : (
            <>
              <ToggleLeft size={18} />
              ĐÃ KHÓA
            </>
          )}
        </button>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setDetailSession(row)}
            title="Xem chi tiết buổi học"
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Chỉnh sửa buổi học"
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteSession(row.id)}
            title="Xóa buổi học"
            style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  const renderListItem = (row) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        gap: '16px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: row.is_active ? '#eff6ff' : '#f8fafc',
            color: row.is_active ? '#2563eb' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Calendar size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
            {new Date(row.ngay_hoc).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} • {formatCaHoc(row.ca_hoc)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
            Lớp: <strong style={{ color: '#1e293b' }}>{row.ten_lhp}</strong> ({row.ma_lhp}) • Phòng: <strong>{row.phong_hoc}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => handleToggleActive(row.id)}
          style={{
            border: 'none',
            background: row.is_active ? '#ecfdf5' : '#f8fafc',
            color: row.is_active ? '#059669' : '#94a3b8',
            padding: '6px 12px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {row.is_active ? 'Cổng Mở' : 'Cổng Khóa'}
        </button>
        <button
          onClick={() => handleOpenEdit(row)}
          style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => handleDeleteSession(row.id)}
          style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  const renderBoxItem = (row) => {
    const dateObj = new Date(row.ngay_hoc);
    const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
    const dateFormatted = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const total = row.total_enrolled || 0;
    const present = row.count_present || 0;
    const late = row.count_late || 0;
    const absent = row.count_absent || 0;
    const checked = present + late + absent;
    const percent = total > 0 ? Math.min(100, Math.round((checked / total) * 100)) : 0;

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between space-y-4">
        <div className="space-y-3.5">
          {/* Header Card: Status Cổng & ID Buổi */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => handleToggleActive(row.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                row.is_active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title="Nhấn để Bật/Tắt cổng điểm danh Face AI"
            >
              {row.is_active ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
              <span>{row.is_active ? 'CỔNG MỞ' : 'CỔNG ĐÓNG'}</span>
            </button>

            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              Buổi #{row.id}
            </span>
          </div>

          {/* Tiêu đề Lớp học phần & Môn học */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
              {row.ten_lhp}
            </h3>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                {row.ma_lhp}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">{row.ten_mon}</span>
            </div>
          </div>

          {/* Chi tiết Lịch học, Ca, Phòng, Giảng viên */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
            {/* Thời gian */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-blue-500 shrink-0" />
                Ngày học:
              </span>
              <span className="font-bold text-slate-800 capitalize">
                {dayName}, {dateFormatted}
              </span>
            </div>

            {/* Ca học */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-purple-500 shrink-0" />
                Ca học:
              </span>
              <span className="font-semibold text-slate-800">
                {formatCaHoc(row.ca_hoc)}
              </span>
            </div>

            {/* Phòng học */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin size={14} className="text-rose-500 shrink-0" />
                Phòng học:
              </span>
              <span className="font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                {row.phong_hoc || 'Chưa gán'}
              </span>
            </div>

            {/* Giảng viên */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-indigo-500 shrink-0" />
                Giảng viên:
              </span>
              <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                {row.ten_giang_vien || 'Chưa phân công'}
              </span>
            </div>
          </div>

          {/* Thống kê điểm danh sinh viên */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Điểm danh SV:</span>
              <span className="text-slate-900 font-mono font-bold">
                {checked}/{total} SV ({percent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold flex-wrap">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                {present} Đúng giờ
              </span>
              {late > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                  {late} Muộn
                </span>
              )}
              {absent > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                  {absent} Vắng
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => handleToggleActive(row.id)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <Sparkles size={13} /> {row.is_active ? 'Khóa cổng' : 'Mở cổng FaceAI'}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDetailSession(row)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Xem chi tiết buổi học"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              title="Chỉnh sửa buổi học"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => handleDeleteSession(row.id)}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
              title="Xóa buổi học"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/courses')}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            ← Về Quản lý Lớp học phần
          </button>
          <span className="text-slate-300 font-bold">/</span>
          <span className="text-sm font-bold text-slate-900">
            Lịch học & Điều phối Buổi học
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Sparkles size={15} /> Tạo lịch tự động theo tuần
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus size={15} /> Thêm buổi học đơn
          </button>
        </div>
      </div>

      <DataView
        title="Lịch học & Buổi học Toàn hệ thống"
        subtitle="Quản lý lịch trình, phòng học, ca học và đóng/mở cổng điểm danh Face AI theo từng buổi học"
        data={sessions}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        loading={loading}
        searchFields={['ten_lhp', 'ma_lhp', 'ten_mon', 'phong_hoc', 'ten_giang_vien']}
        searchPlaceholder="Tìm kiếm theo lớp học phần, phòng học, ca học, giảng viên..."
        filterComponent={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Lọc theo LHP */}
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSearchParams((prev) => {
                  if (e.target.value === 'all') prev.delete('courseId');
                  else prev.set('courseId', e.target.value);
                  return prev;
                });
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.85rem',
                color: '#334155',
                cursor: 'pointer',
                maxWidth: '260px'
              }}
            >
              <option value="all">Tất cả Lớp học phần ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ma_lhp} - {c.ten_lhp}
                </option>
              ))}
            </select>

            {/* Lọc theo Ngày */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSearchParams((prev) => {
                  if (!e.target.value) prev.delete('date');
                  else prev.set('date', e.target.value);
                  return prev;
                });
              }}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.85rem',
                color: '#334155',
                cursor: 'pointer'
              }}
            />

            {selectedDate && (
              <button
                onClick={() => {
                  setSelectedDate('');
                  setSearchParams((prev) => {
                    prev.delete('date');
                    return prev;
                  });
                }}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.78rem',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Xóa lọc ngày
              </button>
            )}

            <button
              onClick={fetchSessions}
              title="Tải lại dữ liệu"
              style={{
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                padding: '7px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.82rem'
              }}
            >
              <RefreshCw size={14} /> Làm mới
            </button>
          </div>
        }
      />

      {/* Modal Thêm Buổi Học Đơn */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Buổi học vào Lịch trình"
      >
        <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Datalist phòng học dùng chung */}
          <datalist id="common-schedule-rooms">
            <option value="P401" />
            <option value="P402" />
            <option value="P.502" />
            <option value="Lab 302" />
            <option value="Hội Trường T4" />
            <option value="B402 - Phòng học 402" />
            <option value="A205 - Phòng lý thuyết 205" />
          </datalist>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lớp học phần *
            </label>
            <select
              required
              value={createForm.lop_hoc_phan_id}
              onChange={(e) => {
                const cId = e.target.value;
                const foundCourse = courses.find((c) => String(c.id) === String(cId));
                setCreateForm({
                  ...createForm,
                  lop_hoc_phan_id: cId,
                  phong_hoc: foundCourse?.phong_hoc_mac_dinh || createForm.phong_hoc
                });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Chọn lớp học phần --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ma_lhp} - {c.ten_lhp} ({c.ten_mon})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày học *
              </label>
              <input
                type="date"
                required
                value={createForm.ngay_hoc}
                onChange={(e) => setCreateForm({ ...createForm, ngay_hoc: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ca học mẫu
              </label>
              <select
                value={STANDARD_SHIFTS.some(s => s.label === createForm.ca_hoc) ? createForm.ca_hoc : 'custom'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== 'custom') {
                    const shift = STANDARD_SHIFTS.find(s => s.label === val);
                    if (shift) {
                      setCreateForm({
                        ...createForm,
                        ca_hoc: shift.label,
                        gio_bat_dau: shift.start,
                        gio_ket_thuc: shift.end
                      });
                    }
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {STANDARD_SHIFTS.map((s, idx) => (
                  <option key={idx} value={s.label}>
                    {s.label}
                  </option>
                ))}
                <option value="custom">⚙️ Tùy chỉnh giờ...</option>
              </select>
            </div>
          </div>

          {/* Ô điều chỉnh Giờ Bắt Đầu - Giờ Kết Thúc linh hoạt */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              Khung giờ học thực tế (Bắt đầu - Kết thúc):
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  required
                  value={createForm.gio_bat_dau}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    const newCa = `Ca (${newStart} - ${createForm.gio_ket_thuc})`;
                    setCreateForm({ ...createForm, gio_bat_dau: newStart, ca_hoc: newCa });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Giờ kết thúc
                </label>
                <input
                  type="time"
                  required
                  value={createForm.gio_ket_thuc}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    const newCa = `Ca (${createForm.gio_bat_dau} - ${newEnd})`;
                    setCreateForm({ ...createForm, gio_ket_thuc: newEnd, ca_hoc: newCa });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                />
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              Định dạng lưu: <strong className="text-blue-700">{createForm.ca_hoc}</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phòng học *
            </label>
            <input
              type="text"
              required
              list="common-schedule-rooms"
              placeholder="vd: P.502 hoặc B402 - Phòng học 402"
              value={createForm.phong_hoc}
              onChange={(e) => setCreateForm({ ...createForm, phong_hoc: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú nội dung buổi học
            </label>
            <input
              type="text"
              placeholder="vd: Buổi 1: Giới thiệu đề cương môn học..."
              value={createForm.ghi_chu}
              onChange={(e) => setCreateForm({ ...createForm, ghi_chu: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Thêm Buổi học
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Tạo Lịch Tự Động Theo Tuần */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Tạo Lịch Học Tự Động Theo Tuần (Batch Scheduler)"
      >
        <form onSubmit={handleBulkCreate} className="space-y-4">
          <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-emerald-800 text-xs">
            💡 Hệ thống sẽ tự động tính toán và sinh ra các buổi học cố định theo tuần kể từ ngày bắt đầu.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lớp học phần *
            </label>
            <select
              required
              value={bulkForm.lop_hoc_phan_id}
              onChange={(e) => {
                const cId = e.target.value;
                const foundCourse = courses.find((c) => String(c.id) === String(cId));
                setBulkForm({
                  ...bulkForm,
                  lop_hoc_phan_id: cId,
                  so_buoi: foundCourse?.so_buoi_hoc || 15,
                  phong_hoc: foundCourse?.phong_hoc_mac_dinh || bulkForm.phong_hoc
                });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Chọn lớp học phần --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ma_lhp} - {c.ten_lhp} (Quy định: {c.so_buoi_hoc || 15} buổi)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày bắt đầu buổi đầu tiên *
              </label>
              <input
                type="date"
                required
                value={bulkForm.ngay_bat_dau}
                onChange={(e) => setBulkForm({ ...bulkForm, ngay_bat_dau: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tổng số buổi cần tạo *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={bulkForm.so_buoi}
                onChange={(e) => setBulkForm({ ...bulkForm, so_buoi: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ca học mẫu cố định *
              </label>
              <select
                value={STANDARD_SHIFTS.some(s => s.label === bulkForm.ca_hoc) ? bulkForm.ca_hoc : 'custom'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== 'custom') {
                    const shift = STANDARD_SHIFTS.find(s => s.label === val);
                    if (shift) {
                      setBulkForm({
                        ...bulkForm,
                        ca_hoc: shift.label,
                        gio_bat_dau: shift.start,
                        gio_ket_thuc: shift.end
                      });
                    }
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {STANDARD_SHIFTS.map((s, idx) => (
                  <option key={idx} value={s.label}>
                    {s.label}
                  </option>
                ))}
                <option value="custom">⚙️ Tùy chỉnh giờ...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phòng học *
              </label>
              <input
                type="text"
                required
                list="common-schedule-rooms"
                value={bulkForm.phong_hoc}
                onChange={(e) => setBulkForm({ ...bulkForm, phong_hoc: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ô Giờ bắt đầu - Giờ kết thúc cho Bulk */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              Khung giờ các ca học tạo tự động:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  required
                  value={bulkForm.gio_bat_dau}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    const newCa = `Ca (${newStart} - ${bulkForm.gio_ket_thuc})`;
                    setBulkForm({ ...bulkForm, gio_bat_dau: newStart, ca_hoc: newCa });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Giờ kết thúc
                </label>
                <input
                  type="time"
                  required
                  value={bulkForm.gio_ket_thuc}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    const newCa = `Ca (${bulkForm.gio_bat_dau} - ${newEnd})`;
                    setBulkForm({ ...bulkForm, gio_ket_thuc: newEnd, ca_hoc: newCa });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                />
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              Ca học tạo hàng tuần: <strong className="text-emerald-700">{bulkForm.ca_hoc}</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              {loading ? 'Đang tạo...' : `Khởi tạo ${bulkForm.so_buoi} buổi học`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Buổi Học Thông Minh */}
      {editSession && (
        <Modal
          isOpen={Boolean(editSession)}
          onClose={() => setEditSession(null)}
          title={`Chỉnh sửa Buổi học #${editSession.id}`}
        >
          <form onSubmit={handleUpdateSession} className="space-y-4">
            {/* Lớp học phần có thể thay đổi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lớp học phần phụ trách *
              </label>
              <select
                required
                value={editForm.lop_hoc_phan_id}
                onChange={(e) => setEditForm({ ...editForm, lop_hoc_phan_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ma_lhp} - {c.ten_lhp} ({c.ten_mon})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày học *
                </label>
                <input
                  type="date"
                  required
                  value={editForm.ngay_hoc}
                  onChange={(e) => setEditForm({ ...editForm, ngay_hoc: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ca học mẫu
                </label>
                <select
                  value={STANDARD_SHIFTS.some(s => s.label === editForm.ca_hoc) ? editForm.ca_hoc : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'custom') {
                      const shift = STANDARD_SHIFTS.find(s => s.label === val);
                      if (shift) {
                        setEditForm({
                          ...editForm,
                          ca_hoc: shift.label,
                          gio_bat_dau: shift.start,
                          gio_ket_thuc: shift.end
                        });
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {/* Nếu ca_hoc hiện tại chưa có trong mẫu chuẩn, giữ nguyên để không bị đổi sang Ca 1 */}
                  {!STANDARD_SHIFTS.some(s => s.label === editForm.ca_hoc) && editForm.ca_hoc && (
                    <option value={editForm.ca_hoc}>
                      ★ {editForm.ca_hoc} (Hiện tại)
                    </option>
                  )}
                  <optgroup label="Danh sách ca học chuẩn">
                    {STANDARD_SHIFTS.map((s, idx) => (
                      <option key={idx} value={s.label}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">⚙️ Tự do tùy chỉnh giờ (Custom)...</option>
                </select>
              </div>
            </div>

            {/* Ô tinh chỉnh Giờ Bắt Đầu - Giờ Kết Thúc */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">
                Khung giờ buổi học (Giờ bắt đầu - Giờ kết thúc):
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    required
                    value={editForm.gio_bat_dau}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const newCa = `Ca (${newStart} - ${editForm.gio_ket_thuc})`;
                      setEditForm({ ...editForm, gio_bat_dau: newStart, ca_hoc: newCa });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    required
                    value={editForm.gio_ket_thuc}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      const newCa = `Ca (${editForm.gio_bat_dau} - ${newEnd})`;
                      setEditForm({ ...editForm, gio_ket_thuc: newEnd, ca_hoc: newCa });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                  />
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                Ca học cập nhật: <strong className="text-blue-700">{editForm.ca_hoc}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phòng học *
                </label>
                <input
                  type="text"
                  required
                  list="common-schedule-rooms"
                  value={editForm.phong_hoc}
                  onChange={(e) => setEditForm({ ...editForm, phong_hoc: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cổng điểm danh Face AI
                </label>
                <select
                  value={editForm.is_active ? '1' : '0'}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === '1' })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="1">🟢 Mở cổng điểm danh</option>
                  <option value="0">🔒 Khóa cổng điểm danh</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú nội dung buổi học
              </label>
              <input
                type="text"
                placeholder="vd: Buổi 2: Kiểm tra giữa kỳ / Thuyết trình nhóm..."
                value={editForm.ghi_chu}
                onChange={(e) => setEditForm({ ...editForm, ghi_chu: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditSession(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi tiết buổi học */}
      {detailSession && (
        <Modal
          isOpen={Boolean(detailSession)}
          onClose={() => setDetailSession(null)}
          title="Thông Tin Chi Tiết Buổi Học"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {detailSession.ten_lhp}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                Mã LHP: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{detailSession.ma_lhp}</span> • Môn: {detailSession.ten_mon}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Thời gian học</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                  {new Date(detailSession.ngay_hoc).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>{formatCaHoc(detailSession.ca_hoc)}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Phòng học</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                  {detailSession.phong_hoc}
                </span>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>GV: {detailSession.ten_giang_vien || 'Chưa phân công'}</div>
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Thống kê điểm danh Face AI
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: '#fff', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{detailSession.total_enrolled || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sĩ số lớp</div>
                </div>
                <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>{detailSession.count_present || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>Đúng giờ</div>
                </div>
                <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d97706' }}>{detailSession.count_late || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#d97706' }}>Đi muộn</div>
                </div>
                <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{detailSession.count_absent || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#dc2626' }}>Vắng mặt</div>
                </div>
              </div>
            </div>

            {detailSession.ghi_chu && (
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                <strong>Ghi chú:</strong> {detailSession.ghi_chu}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                onClick={() => setDetailSession(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
