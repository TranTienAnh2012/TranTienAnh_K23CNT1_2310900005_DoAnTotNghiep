import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import ExamDetailModal from './ExamDetailModal';
import ExamEditModal from './ExamEditModal';
import ExamDeleteModal from './ExamDeleteModal';
import {
  Plus,
  Users,
  Lock,
  Unlock,
  Eye,
  Calendar,
  Clock,
  MapPin,
  CalendarCheck,
  Edit2,
  Trash2
} from 'lucide-react';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [notice, setNotice] = useState(null);

  // Selected exam for candidates
  const [selectedExam, setSelectedExam] = useState(null);
  const [candidates, setCandidates] = useState([]);

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // 3 Popups: Details, Edit, Delete
  const [detailExam, setDetailExam] = useState(null);
  const [editExam, setEditExam] = useState(null);
  const [deleteExam, setDeleteExam] = useState(null);

  // Forms
  const [examForm, setExamForm] = useState({
    mon_hoc_id: '',
    hoc_ky_id: '',
    giang_vien_id: '',
    ngay_thi: new Date().toISOString().split('T')[0],
    gio_bat_dau: '',
    gio_ket_thuc: '',
    phong_thi: ''
  });

  const [assignForm, setAssignForm] = useState({
    sinh_vien_id: '',
    so_bao_danh: '',
    vi_tri_ngoi: ''
  });

  const loadData = async () => {
    try {
      const [eRes, sRes, semRes, stRes, tRes] = await Promise.all([
        adminService.getExams(),
        adminService.getSubjects(),
        adminService.getSemesters(),
        adminService.getStudents(),
        adminService.getTeachers()
      ]);
      if (eRes.success) setExams(eRes.data);
      if (sRes.success) {
        setSubjects(sRes.data);
        if (sRes.data.length > 0 && !examForm.mon_hoc_id) {
          setExamForm((p) => ({ ...p, mon_hoc_id: sRes.data[0].id }));
        }
      }
      if (semRes.success) {
        setSemesters(semRes.data);
        if (semRes.data.length > 0 && !examForm.hoc_ky_id) {
          setExamForm((p) => ({ ...p, hoc_ky_id: semRes.data[0].id }));
        }
      }
      if (tRes.success) {
        setTeachers(tRes.data);
      }
      if (stRes.success) {
        setStudents(stRes.data);
        if (stRes.data.length > 0 && !assignForm.sinh_vien_id) {
          setAssignForm((p) => ({ ...p, sinh_vien_id: stRes.data[0].id }));
        }
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const getExamStatus = (exam) => {
    if (!exam.ngay_thi) return { label: 'Chưa rõ', color: '#64748b', bg: '#f1f5f9' };
    const dateStr = exam.ngay_thi.split('T')[0];
    const startTimeStr = exam.gio_bat_dau || '00:00:00';
    const endTimeStr = exam.gio_ket_thuc || '23:59:59';
    const start = new Date(`${dateStr}T${startTimeStr}`);
    const end = new Date(`${dateStr}T${endTimeStr}`);
    const now = new Date();

    if (now < start) {
      return { label: 'Sắp diễn ra', color: '#2563eb', bg: '#eff6ff' };
    } else if (now >= start && now <= end) {
      return { label: 'Đang thi', color: '#059669', bg: '#ecfdf5' };
    } else {
      return { label: 'Đã kết thúc', color: '#64748b', bg: '#f1f5f9' };
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    try {
      const res = await adminService.getExamCandidates(exam.id);
      if (res.success) setCandidates(res.data);
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createExam(examForm);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsExamModalOpen(false);
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleAssignCandidate = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
      const res = await adminService.assignCandidate(selectedExam.id, assignForm);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsAssignModalOpen(false);
        handleSelectExam(selectedExam);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const handleToggleExamActive = async (examId) => {
    try {
      const res = await adminService.toggleExamActive(examId);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        loadData();
        if (selectedExam?.id === examId) {
          setSelectedExam((prev) => ({ ...prev, is_active: res.is_active }));
        }
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>
          #{row.id}
        </span>
      )
    },
    {
      header: 'Môn thi',
      accessor: 'ten_mon',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.ten_mon}</span>
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
      header: 'Ngày thi',
      accessor: 'ngay_thi',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {new Date(row.ngay_thi).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      header: 'Thời gian',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
          {row.gio_bat_dau} - {row.gio_ket_thuc}
        </span>
      )
    },
    {
      header: 'Phòng thi',
      accessor: 'phong_thi',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>{row.phong_thi}</span>
      )
    },
    {
      header: 'Giám thị',
      accessor: 'ten_giam_thi',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
          {row.ten_giam_thi || 'Chưa phân công'}
        </span>
      )
    },
    {
      header: 'Tiến độ Check-In',
      render: (row) => {
        const total = row.total_candidates || 0;
        const checked = row.checked_in_count || 0;
        const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
        return (
          <div style={{ minWidth: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{checked}/{total} thí sinh</span>
              <span style={{ color: percent === 100 ? '#059669' : '#2563eb', fontWeight: 600 }}>{percent}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  background: percent === 100 ? '#059669' : '#2563eb',
                  borderRadius: '9999px',
                  transition: 'width 0.3s'
                }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Trạng thái',
      render: (row) => {
        const st = getExamStatus(row);
        return (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '9999px',
              background: st.bg,
              color: st.color
            }}
          >
            {st.label}
          </span>
        );
      }
    },
    {
      header: 'Cổng Check-In',
      render: (row) => (
        <button
          onClick={() => handleToggleExamActive(row.id)}
          style={{
            border: 'none',
            background: row.is_active ? '#ecfdf5' : '#fef2f2',
            color: row.is_active ? '#059669' : '#dc2626',
            padding: '4px 10px',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {row.is_active ? <Unlock size={12} /> : <Lock size={12} />}
          {row.is_active ? 'Đang mở' : 'Đã khóa'}
        </button>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleSelectExam(row)}
            title="Xem danh sách thí sinh"
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
            <Users size={13} /> Thí sinh
          </button>
          <button
            onClick={() => setDetailExam(row)}
            title="Chi tiết"
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditExam(row)}
            title="Chỉnh sửa"
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteExam(row)}
            title="Xóa ca thi"
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
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
          <CalendarCheck size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{item.ten_mon}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Ngày: <strong style={{ color: '#2563eb' }}>{new Date(item.ngay_thi).toLocaleDateString('vi-VN')}</strong> • {item.phong_thi}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
          <div>{item.gio_bat_dau} &rarr; {item.gio_ket_thuc}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.ten_hoc_ky}</div>
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
          {item.checked_in_count || 0}/{item.total_candidates || 0} check-in
        </span>

        <button
          onClick={() => handleToggleExamActive(item.id)}
          style={{
            border: 'none',
            background: item.is_active ? '#ecfdf5' : '#fef2f2',
            color: item.is_active ? '#059669' : '#dc2626',
            padding: '4px 10px',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {item.is_active ? <Unlock size={12} /> : <Lock size={12} />}
          {item.is_active ? 'Cổng mở' : 'Đã khóa'}
        </button>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => handleSelectExam(item)}
            style={{
              border: 'none',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Users size={14} /> Thí sinh
          </button>
          <button
            onClick={() => setDetailExam(item)}
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditExam(item)}
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteExam(item)}
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
            <CalendarCheck size={22} />
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
            {item.checked_in_count || 0}/{item.total_candidates || 0} check-in
          </span>
        </div>

        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          {item.ten_mon}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
          Ngày: <span style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(item.ngay_thi).toLocaleDateString('vi-VN')}</span>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <strong style={{ color: '#64748b' }}>Giờ:</strong> {item.gio_bat_dau} - {item.gio_ket_thuc}
          </div>
          <div>
            <strong style={{ color: '#64748b' }}>Phòng:</strong> {item.phong_thi}
          </div>
          <div>
            <strong style={{ color: '#64748b' }}>Kỳ:</strong> {item.ten_hoc_ky}
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
          onClick={() => handleSelectExam(item)}
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
          <Users size={13} /> Thí sinh
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setDetailExam(item)}
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => setEditExam(item)}
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => setDeleteExam(item)}
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
        title="Quản lý Ca thi & Thí sinh"
        subtitle="Tổ chức các ca thi học phần, phân phòng và điều phối check-in thí sinh bằng Face AI"
        data={exams}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        searchFields={['ten_mon', 'phong_thi', 'ten_hoc_ky']}
        searchPlaceholder="Tìm kiếm ca thi theo môn, phòng thi, học kỳ..."
        actionButton={
          <button
            onClick={() => setIsExamModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Tạo Ca thi mới
          </button>
        }
      />

      {/* Selected Exam Candidates Panel */}
      {selectedExam && (
        <div style={{ marginTop: '32px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                Thí sinh Ca thi: {selectedExam.ten_mon}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Phòng: {selectedExam.phong_thi} • Ngày thi: {new Date(selectedExam.ngay_thi).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsAssignModalOpen(true)}
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
                <Plus size={15} /> Xếp Thí sinh
              </button>
              <button
                onClick={() => setSelectedExam(null)}
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

          {candidates.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              Chưa có thí sinh nào được xếp vào ca thi này. Bấm "Xếp Thí sinh" để thêm vào danh sách.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.82rem' }}>
                    <th style={{ padding: '10px' }}>SBD</th>
                    <th style={{ padding: '10px' }}>Mã SV</th>
                    <th style={{ padding: '10px' }}>Họ và Tên</th>
                    <th style={{ padding: '10px' }}>Lớp</th>
                    <th style={{ padding: '10px' }}>Vị trí ngồi</th>
                    <th style={{ padding: '10px' }}>Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.sinh_vien_id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#2563eb' }}>{c.so_bao_danh}</td>
                      <td style={{ padding: '12px 10px', color: '#0f172a' }}>{c.ma_sv}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>{c.ho_ten}</td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>{c.ten_lop}</td>
                      <td style={{ padding: '12px 10px', color: '#475569' }}>{c.vi_tri_ngoi || '---'}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            background: c.trang_thai === 'checkin' ? '#ecfdf5' : '#fffbeb',
                            color: c.trang_thai === 'checkin' ? '#059669' : '#b45309'
                          }}
                        >
                          {c.trang_thai === 'checkin' ? 'Đã Check-in' : 'Chưa Check-in'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Thêm Ca Thi */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Tạo Ca thi mới"
      >
        <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Môn thi *
              </label>
              <select
                value={examForm.mon_hoc_id}
                onChange={(e) => setExamForm({ ...examForm, mon_hoc_id: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten_mon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Học kỳ *
              </label>
              <select
                value={examForm.hoc_ky_id}
                onChange={(e) => setExamForm({ ...examForm, hoc_ky_id: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten_hoc_ky}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Ngày thi *
              </label>
              <input
                type="date"
                required
                value={examForm.ngay_thi}
                onChange={(e) => setExamForm({ ...examForm, ngay_thi: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Phòng thi *
              </label>
              <input
                type="text"
                required
                placeholder="vd: P.Thi 401 - Nhà B1"
                value={examForm.phong_thi}
                onChange={(e) => setExamForm({ ...examForm, phong_thi: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Cán bộ coi thi / Giám thị
            </label>
            <select
              value={examForm.giang_vien_id}
              onChange={(e) => setExamForm({ ...examForm, giang_vien_id: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <option value="">-- Chưa phân công giám thị --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ho_ten} ({t.ma_gv})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Giờ bắt đầu
              </label>
              <input
                type="text"
                required
                placeholder="08:00:00"
                value={examForm.gio_bat_dau}
                onChange={(e) => setExamForm({ ...examForm, gio_bat_dau: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Giờ kết thúc
              </label>
              <input
                type="text"
                required
                placeholder="10:00:00"
                value={examForm.gio_ket_thuc}
                onChange={(e) => setExamForm({ ...examForm, gio_ket_thuc: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsExamModalOpen(false)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Tạo Ca thi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Xếp Thí Sinh */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Xếp Thí sinh vào Ca thi: ${selectedExam?.ten_mon}`}
      >
        <form onSubmit={handleAssignCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Chọn Sinh viên *
            </label>
            <select
              value={assignForm.sinh_vien_id}
              onChange={(e) => setAssignForm({ ...assignForm, sinh_vien_id: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.ho_ten} ({st.ma_sv}) - {st.ten_lop}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Số báo danh (SBD) *
              </label>
              <input
                type="text"
                required
                value={assignForm.so_bao_danh}
                onChange={(e) => setAssignForm({ ...assignForm, so_bao_danh: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Vị trí ngồi thi
              </label>
              <input
                type="text"
                value={assignForm.vi_tri_ngoi}
                onChange={(e) => setAssignForm({ ...assignForm, vi_tri_ngoi: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Xác nhận xếp chỗ
            </button>
          </div>
        </form>
      </Modal>

      {/* 3 Popups: Details, Edit, Delete */}
      <ExamDetailModal
        isOpen={Boolean(detailExam)}
        exam={detailExam}
        onClose={() => setDetailExam(null)}
        onEdit={(ex) => setEditExam(ex)}
      />

      <ExamEditModal
        isOpen={Boolean(editExam)}
        exam={editExam}
        subjects={subjects}
        semesters={semesters}
        teachers={teachers}
        onClose={() => setEditExam(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Cập nhật ca thi thành công!' });
          loadData();
        }}
      />

      <ExamDeleteModal
        isOpen={Boolean(deleteExam)}
        exam={deleteExam}
        onClose={() => setDeleteExam(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Đã xóa ca thi thành công!' });
          loadData();
          if (selectedExam?.id === deleteExam?.id) {
            setSelectedExam(null);
          }
        }}
      />
    </div>
  );
}
