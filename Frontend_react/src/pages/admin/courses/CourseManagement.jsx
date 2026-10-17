import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import CourseDetailModal from './CourseDetailModal';
import CourseEditModal from './CourseEditModal';
import CourseDeleteModal from './CourseDeleteModal';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Eye,
  Lock,
  Unlock,
  BookOpen,
  Edit2,
  Trash2,
  CalendarCheck,
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [notice, setNotice] = useState(null);

  // Selected course for sessions / students view
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'students'
  const [sessions, setSessions] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [enrollMode, setEnrollMode] = useState('by_class'); // 'by_class' | 'individual'
  const [selectedClassId, setSelectedClassId] = useState('');
  const [enrollStudentId, setEnrollStudentId] = useState('');

  // 3 Popups: Details, Edit, Delete
  const [detailCourse, setDetailCourse] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);

  // Forms
  const [courseForm, setCourseForm] = useState({
    ma_lhp: '',
    ten_lhp: '',
    mon_hoc_id: '',
    hoc_ky_id: '',
    giang_vien_id: '',
    phong_hoc_mac_dinh: ''
  });

  const [sessionForm, setSessionForm] = useState({
    ngay_hoc: new Date().toISOString().split('T')[0],
    ca_hoc: '',
    phong_hoc: '',
    ghi_chu: ''
  });

  const loadData = async () => {
    try {
      const [cRes, sRes, semRes, tRes, stRes, clRes] = await Promise.all([
        adminService.getCourses(),
        adminService.getSubjects(),
        adminService.getSemesters(),
        adminService.getTeachers(),
        adminService.getStudents(),
        adminService.getClasses()
      ]);
      if (cRes.success) setCourses(cRes.data);
      if (sRes.success) {
        setSubjects(sRes.data);
        if (sRes.data.length > 0 && !courseForm.mon_hoc_id) {
          setCourseForm((p) => ({ ...p, mon_hoc_id: sRes.data[0].id }));
        }
      }
      if (semRes.success) {
        setSemesters(semRes.data);
        if (semRes.data.length > 0 && !courseForm.hoc_ky_id) {
          setCourseForm((p) => ({ ...p, hoc_ky_id: semRes.data[0].id }));
        }
      }
      if (tRes.success) {
        setTeachers(tRes.data);
        if (tRes.data.length > 0 && !courseForm.giang_vien_id) {
          setCourseForm((p) => ({ ...p, giang_vien_id: tRes.data[0].id }));
        }
      }
      if (stRes.success) {
        setAllStudents(stRes.data);
        if (stRes.data.length > 0 && !enrollStudentId) {
          setEnrollStudentId(stRes.data[0].id);
        }
      }
      if (clRes.success) {
        setClasses(clRes.data);
        if (clRes.data.length > 0) {
          setSelectedClassId((prev) => prev || clRes.data[0].id);
        }
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    try {
      const [sessRes, stuRes] = await Promise.all([
        adminService.getSessions(course.id),
        adminService.getCourseStudents(course.id)
      ]);
      if (sessRes.success) setSessions(sessRes.data);
      if (stuRes.success) setEnrolledStudents(stuRes.data);
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      let payload = {};
      if (enrollMode === 'by_class') {
        if (!selectedClassId) {
          setNotice({ type: 'error', message: 'Vui lòng chọn lớp sinh hoạt cần ghi danh!' });
          return;
        }
        payload = { lop_id: selectedClassId };
      } else {
        if (!enrollStudentId) {
          setNotice({ type: 'error', message: 'Vui lòng chọn sinh viên cần ghi danh!' });
          return;
        }
        payload = { sinh_vien_id: enrollStudentId };
      }

      const res = await adminService.enrollStudentToCourse(selectedCourse.id, payload);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsEnrollModalOpen(false);
        handleSelectCourse(selectedCourse);
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Bạn có chắc muốn rút sinh viên này khỏi lớp học phần?')) return;
    try {
      const res = await adminService.removeStudentFromCourse(selectedCourse.id, studentId);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        handleSelectCourse(selectedCourse);
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleToggleEligibility = async (studentId, currentEligibility) => {
    const newStatus = currentEligibility === 'cam_thi' ? 'du_dieu_kien' : 'cam_thi';
    try {
      const res = await adminService.toggleCourseStudentEligibility(selectedCourse.id, studentId, {
        dieu_kien_du_thi: newStatus,
        ghi_chu: newStatus === 'cam_thi' ? 'Đã bị cấm thi theo quy chế' : 'Đủ điều kiện dự thi'
      });
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        handleSelectCourse(selectedCourse);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createCourse(courseForm);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCourseModalOpen(false);
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await adminService.createSession({
        ...sessionForm,
        lop_hoc_phan_id: selectedCourse.id
      });
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsSessionModalOpen(false);
        handleSelectCourse(selectedCourse);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleToggleSessionActive = async (sessionId) => {
    try {
      const res = await adminService.toggleSessionActive(sessionId);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        handleSelectCourse(selectedCourse);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const columns = [
    {
      header: 'Mã LHP',
      accessor: 'ma_lhp',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
          {row.ma_lhp}
        </span>
      )
    },
    {
      header: 'Tên Lớp học phần',
      accessor: 'ten_lhp',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.ten_lhp}</span>
      )
    },
    {
      header: 'Môn học',
      accessor: 'ten_mon',
      render: (row) => (
        <span style={{ color: '#475569' }}>{row.ten_mon}</span>
      )
    },
    {
      header: 'Học kỳ',
      accessor: 'ten_hoc_ky',
      render: (row) => (
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{row.ten_hoc_ky}</span>
      )
    },
    {
      header: 'Giảng viên',
      accessor: 'ten_giang_vien',
      render: (row) => (
        <span style={{ color: '#334155', fontSize: '0.85rem' }}>
          {row.ten_giang_vien || 'Chưa phân công'}
        </span>
      )
    },
    {
      header: 'Số buổi học',
      render: (row) => {
        const total = row.total_sessions || 0;
        const required = row.so_buoi_hoc;
        if (required) {
          const percent = Math.min(Math.round((total / required) * 100), 100);
          return (
            <div style={{ minWidth: '100px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                  {total}/{required} buổi
                </span>
                <span style={{ fontSize: '0.72rem', color: total >= required ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                  {percent}%
                </span>
              </div>
              <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: total >= required ? '#16a34a' : '#2563eb',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          );
        }
        return (
          <span style={{ fontSize: '0.78rem', padding: '3px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontWeight: 600 }}>
            {total} buổi
          </span>
        );
      }
    },
    {
      header: 'Sĩ số SV',
      render: (row) => (
        <button
          onClick={() => {
            setActiveTab('students');
            handleSelectCourse(row);
          }}
          title="Xem danh sách sinh viên theo học"
          style={{
            border: 'none',
            fontSize: '0.78rem',
            padding: '4px 8px',
            background: row.total_enrolled_students > 0 ? '#f0fdf4' : '#f1f5f9',
            color: row.total_enrolled_students > 0 ? '#15803d' : '#64748b',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Users size={12} />
          {row.total_enrolled_students || 0} SV
        </button>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => navigate(`/admin/schedules?courseId=${row.id}`)}
            title="Mở bảng Lịch học & Buổi học của lớp này"
            style={{
              border: 'none',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Calendar size={13} /> Lịch học →
          </button>
          <button
            onClick={() => setDetailCourse(row)}
            title="Chi tiết"
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditCourse(row)}
            title="Chỉnh sửa"
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteCourse(row)}
            title="Xóa lớp học phần"
            style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  const renderListItem = (item) => (
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <BookOpen size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{item.ten_lhp}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Mã: <strong style={{ color: '#2563eb' }}>{item.ma_lhp}</strong> • Môn: {item.ten_mon}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
          <div>{item.ten_hoc_ky}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>GV: {item.ten_giang_vien || 'Chưa phân công'}</div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '6px',
            background: '#eff6ff',
            color: '#2563eb'
          }}
        >
          {item.total_sessions || 0} buổi học
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => handleSelectCourse(item)}
            style={{
              border: 'none',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Calendar size={14} /> Buổi học
          </button>
          <button
            onClick={() => setDetailCourse(item)}
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditCourse(item)}
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteCourse(item)}
            style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderBoxItem = (item) => (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen size={22} />
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#2563eb'
            }}
          >
            {item.total_sessions || 0} buổi
          </span>
        </div>

        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          {item.ten_lhp}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
          Mã: <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.ma_lhp}</span> • {item.ten_mon}
        </div>

        <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <strong style={{ color: '#64748b' }}>Học kỳ:</strong> {item.ten_hoc_ky}
          </div>
          <div>
            <strong style={{ color: '#64748b' }}>GV:</strong> {item.ten_giang_vien || 'Chưa phân công'}
          </div>
          <div>
            <strong style={{ color: '#64748b' }}>Phòng:</strong> {item.phong_hoc_mac_dinh || '---'}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <button
          onClick={() => navigate(`/admin/schedules?courseId=${item.id}`)}
          style={{
            border: 'none',
            background: '#eff6ff',
            color: '#2563eb',
            padding: '5px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Calendar size={13} /> Lịch học →
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setDetailCourse(item)}
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => setEditCourse(item)}
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => setDeleteCourse(item)}
            style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      <DataView
        title="Quản lý Lớp học phần"
        subtitle="Quản trị các lớp học phần, môn học, phân công giảng viên và danh sách sinh viên theo học"
        data={courses}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        searchKeys={['ten_lhp', 'ma_lhp', 'ten_mon', 'ten_giang_vien']}
        searchPlaceholder="Tìm kiếm lớp học phần theo tên, mã, môn học..."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/admin/schedules')}
              className="inline-flex items-center gap-2 py-2 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Calendar size={16} className="text-blue-600" /> <span>Bảng Lịch học & Buổi học →</span>
            </button>
            <button
              onClick={() => setIsCourseModalOpen(true)}
              className="inline-flex items-center gap-2 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} /> <span>Mở Lớp học phần mới</span>
            </button>
          </div>
        }
      />

      {/* Detail Sessions / Students of Selected Course */}
      {selectedCourse && (
        <div style={{ marginTop: '32px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                Chi tiết Lớp học phần: {selectedCourse.ten_lhp}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Mã: <strong>{selectedCourse.ma_lhp}</strong> • Môn: {selectedCourse.ten_mon} • GV: {selectedCourse.ten_giang_vien || 'Chưa phân công'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {activeTab === 'sessions' ? (
                <button
                  onClick={() => setIsSessionModalOpen(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={15} /> Thêm Buổi học
                </button>
              ) : (
                <button
                  onClick={() => setIsEnrollModalOpen(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UserPlus size={15} /> Thêm Sinh viên vào LHP
                </button>
              )}
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('sessions')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: activeTab === 'sessions' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'sessions' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={15} />
              Lịch & Buổi học ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: activeTab === 'students' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'students' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Users size={15} />
              Danh sách Sinh viên theo học ({enrolledStudents.length})
            </button>
          </div>

          {/* Tab 1: Buổi học */}
          {activeTab === 'sessions' && (
            sessions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                Chưa có buổi học nào được tạo cho lớp học phần này. Bấm "Thêm Buổi học" để lên lịch.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {new Date(s.ngay_hoc).toLocaleDateString('vi-VN')}
                      </span>
                      <button
                        onClick={() => handleToggleSessionActive(s.id)}
                        style={{
                          border: 'none',
                          background: s.is_active ? '#ecfdf5' : '#fef2f2',
                          color: s.is_active ? '#059669' : '#dc2626',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {s.is_active ? <Unlock size={11} /> : <Lock size={11} />}
                        {s.is_active ? 'Cổng mở' : 'Đã khóa'}
                      </button>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <strong>Ca học:</strong> {s.ca_hoc}
                      </div>
                      <div>
                        <strong>Phòng:</strong> {s.phong_hoc}
                      </div>
                      {s.ghi_chu && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                          {s.ghi_chu}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tab 2: Danh sách sinh viên */}
          {activeTab === 'students' && (
            enrolledStudents.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                Chưa có sinh viên nào đăng ký lớp học phần này. Bấm "Thêm Sinh viên vào LHP" để ghi danh.
              </div>
            ) : (
              <div style={{ border: '1px solid #f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px 14px' }}>Mã SV</th>
                      <th style={{ padding: '10px 14px' }}>Họ và Tên</th>
                      <th style={{ padding: '10px 14px' }}>Lớp sinh hoạt</th>
                      <th style={{ padding: '10px 14px' }}>FaceAI</th>
                      <th style={{ padding: '10px 14px' }}>Điều kiện thi</th>
                      <th style={{ padding: '10px 14px' }}>Hình thức</th>
                      <th style={{ padding: '10px 14px' }}>Ngày đăng ký</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((sv) => (
                      <tr key={sv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, fontFamily: 'monospace', color: '#0f172a' }}>
                          {sv.ma_sv}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                          {sv.ho_ten}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>
                          {sv.ten_lop || 'Chưa phân lớp'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: sv.has_face_registered ? '#ecfdf5' : '#fffbeb',
                              color: sv.has_face_registered ? '#059669' : '#b45309'
                            }}
                          >
                            {sv.has_face_registered ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {sv.has_face_registered ? 'Kích hoạt' : 'Chưa có'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            onClick={() => handleToggleEligibility(sv.id, sv.dieu_kien_du_thi)}
                            title="Bấm để chuyển đổi điều kiện dự thi"
                            style={{
                              border: 'none',
                              background: sv.dieu_kien_du_thi === 'cam_thi' ? '#fef2f2' : '#ecfdf5',
                              color: sv.dieu_kien_du_thi === 'cam_thi' ? '#dc2626' : '#059669',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {sv.dieu_kien_du_thi === 'cam_thi' ? 'Cấm thi' : 'Đủ điều kiện'}
                          </button>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: '#64748b' }}>
                          {sv.phuong_thuc === 'sinh_vien' ? (
                            <span style={{ color: '#2563eb', fontWeight: 600 }}>SV tự ĐK</span>
                          ) : (
                            <span style={{ color: '#64748b' }}>Admin gán</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>
                          {sv.ngay_dang_ky ? new Date(sv.ngay_dang_ky).toLocaleDateString('vi-VN') : '---'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveStudent(sv.id)}
                            title="Rút khỏi lớp học phần"
                            style={{
                              border: 'none',
                              background: '#fef2f2',
                              color: '#dc2626',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* Modal Thêm LHP */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Mở Lớp học phần mới"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mã Lớp học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="vd: LHP_IT302_01"
              value={courseForm.ma_lhp}
              onChange={(e) => setCourseForm({ ...courseForm, ma_lhp: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên Lớp học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="vd: Lập trình Web nâng cao (Lớp 01)"
              value={courseForm.ten_lhp}
              onChange={(e) => setCourseForm({ ...courseForm, ten_lhp: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Môn học <span className="text-red-500">*</span>
              </label>
              <select
                value={courseForm.mon_hoc_id}
                onChange={(e) => setCourseForm({ ...courseForm, mon_hoc_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten_mon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Học kỳ <span className="text-red-500">*</span>
              </label>
              <select
                value={courseForm.hoc_ky_id}
                onChange={(e) => setCourseForm({ ...courseForm, hoc_ky_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten_hoc_ky}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Giảng viên phụ trách
              </label>
              <select
                value={courseForm.giang_vien_id}
                onChange={(e) => setCourseForm({ ...courseForm, giang_vien_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ho_ten}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phòng học mặc định
              </label>
              <input
                type="text"
                placeholder="vd: P.502 - Nhà A1"
                value={courseForm.phong_hoc_mac_dinh}
                onChange={(e) => setCourseForm({ ...courseForm, phong_hoc_mac_dinh: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              Tạo Lớp học phần
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Thêm Buổi Học */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title={`Thêm Buổi học cho ${selectedCourse?.ten_lhp}`}
      >
        <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Ngày học *
            </label>
            <input
              type="date"
              required
              value={sessionForm.ngay_hoc}
              onChange={(e) => setSessionForm({ ...sessionForm, ngay_hoc: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Ca học *
              </label>
              <input
                type="text"
                required
                value={sessionForm.ca_hoc}
                onChange={(e) => setSessionForm({ ...sessionForm, ca_hoc: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Phòng học *
              </label>
              <input
                type="text"
                required
                value={sessionForm.phong_hoc}
                onChange={(e) => setSessionForm({ ...sessionForm, phong_hoc: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Ghi chú buổi học
            </label>
            <textarea
              rows="3"
              value={sessionForm.ghi_chu}
              onChange={(e) => setSessionForm({ ...sessionForm, ghi_chu: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsSessionModalOpen(false)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Lưu Buổi học
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ghi danh Sinh viên vào LHP */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title={`Ghi danh Sinh viên vào ${selectedCourse?.ten_lhp}`}
      >
        <div style={{ marginBottom: '18px' }}>
          {/* Chế độ ghi danh: Theo Lớp hoặc Từng SV */}
          <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#f1f5f9', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setEnrollMode('by_class')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: enrollMode === 'by_class' ? '#ffffff' : 'transparent',
                color: enrollMode === 'by_class' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: enrollMode === 'by_class' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={15} /> Thêm theo Lớp sinh hoạt (Nhanh)
            </button>
            <button
              type="button"
              onClick={() => setEnrollMode('individual')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: enrollMode === 'individual' ? '#ffffff' : 'transparent',
                color: enrollMode === 'individual' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: enrollMode === 'individual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={15} /> Thêm từng Sinh viên lẻ
            </button>
          </div>
        </div>

        <form onSubmit={handleEnrollStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {enrollMode === 'by_class' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Chọn Lớp cần gán toàn bộ sinh viên *
              </label>
              <select
                required
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Chọn lớp sinh hoạt --</option>
                {classes.map((cls) => {
                  const totalInClass = allStudents.filter((st) => st.lop_id === cls.id).length;
                  return (
                    <option key={cls.id} value={cls.id}>
                      {cls.ma_lop} - {cls.ten_lop} ({cls.khoa_hoc || 'K23'}) — {totalInClass} sinh viên
                    </option>
                  );
                })}
              </select>

              {/* Thông tin xem trước lớp đã chọn */}
              {selectedClassId && (() => {
                const classObj = classes.find((c) => String(c.id) === String(selectedClassId));
                const studentsInClass = allStudents.filter((st) => String(st.lop_id) === String(selectedClassId));
                const notYetEnrolled = studentsInClass.filter(
                  (st) => !enrolledStudents.some((es) => es.id === st.id)
                );
                return (
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                        Lớp: {classObj?.ten_lop} ({classObj?.ma_lop})
                      </span>
                      <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', fontWeight: 700 }}>
                        +{notYetEnrolled.length} SV sẽ được thêm
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>• Tổng sĩ số lớp: <strong>{studentsInClass.length}</strong> sinh viên</div>
                      <div>• Đã ghi danh trước đó: <strong>{studentsInClass.length - notYetEnrolled.length}</strong> sinh viên</div>
                      <div>• Sẽ được ghi danh mới: <strong style={{ color: '#059669' }}>{notYetEnrolled.length}</strong> sinh viên</div>
                    </div>
                    {notYetEnrolled.length === 0 && studentsInClass.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#b45309', background: '#fffbeb', padding: '6px 10px', borderRadius: '6px' }}>
                        ⚠️ Tất cả sinh viên trong lớp này đã có mặt trong lớp học phần!
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Chọn Sinh viên cần ghi danh *
              </label>
              <select
                required
                value={enrollStudentId}
                onChange={(e) => setEnrollStudentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Chọn sinh viên --</option>
                {allStudents
                  .filter((st) => !enrolledStudents.some((es) => es.id === st.id))
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.ma_sv} - {st.ho_ten} ({st.ten_lop || 'Chưa phân lớp'})
                    </option>
                  ))}
              </select>
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                * Chỉ hiển thị các sinh viên chưa đăng ký lớp học phần này
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Users size={16} /> {enrollMode === 'by_class' ? 'Ghi danh cả lớp vào LHP' : 'Ghi danh sinh viên'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3 Popups: Details, Edit, Delete */}
      <CourseDetailModal
        isOpen={Boolean(detailCourse)}
        course={detailCourse}
        onClose={() => setDetailCourse(null)}
        onEdit={(c) => setEditCourse(c)}
      />

      <CourseEditModal
        isOpen={Boolean(editCourse)}
        course={editCourse}
        subjects={subjects}
        semesters={semesters}
        teachers={teachers}
        onClose={() => setEditCourse(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Cập nhật lớp học phần thành công!' });
          loadData();
        }}
      />

      <CourseDeleteModal
        isOpen={Boolean(deleteCourse)}
        course={deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Đã xóa lớp học phần thành công!' });
          loadData();
          if (selectedCourse?.id === deleteCourse?.id) {
            setSelectedCourse(null);
          }
        }}
      />
    </div>
  );
}
