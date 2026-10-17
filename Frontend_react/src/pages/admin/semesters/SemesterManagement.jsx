import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import SemesterDetailModal from './SemesterDetailModal';
import SemesterEditModal from './SemesterEditModal';
import SemesterDeleteModal from './SemesterDeleteModal';
import {
  Calendar,
  Plus,
  CheckCircle2,
  CalendarCheck,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  // Modal thêm học kỳ
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    ten_hoc_ky: '',
    nam_hoc: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
    is_active: true
  });

  // 3 Popups: Details, Edit, Delete
  const [detailSemester, setDetailSemester] = useState(null);
  const [editSemester, setEditSemester] = useState(null);
  const [deleteSemester, setDeleteSemester] = useState(null);

  const loadSemesters = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSemesters();
      if (res.success) setSemesters(res.data);
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createSemester(form);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCreateModalOpen(false);
        setForm({
          ten_hoc_ky: '',
          nam_hoc: '',
          ngay_bat_dau: '',
          ngay_ket_thuc: '',
          is_active: true
        });
        loadSemesters();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const columns = [
    {
      header: 'Tên Học kỳ',
      accessor: 'ten_hoc_ky',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={16} />
          </div>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.ten_hoc_ky}</span>
        </div>
      )
    },
    {
      header: 'Năm học',
      accessor: 'nam_hoc',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.nam_hoc}</span>
      )
    },
    {
      header: 'Thời gian diễn ra',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
          {new Date(row.ngay_bat_dau).toLocaleDateString('vi-VN')} &rarr;{' '}
          {new Date(row.ngay_ket_thuc).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'is_active',
      render: (row) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '9999px',
            background: row.is_active ? '#ecfdf5' : '#f1f5f9',
            color: row.is_active ? '#059669' : '#64748b'
          }}
        >
          {row.is_active && <CheckCircle2 size={12} />}
          {row.is_active ? 'Học kỳ hiện hành' : 'Đã kết thúc'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setDetailSemester(row)}
            title="Xem chi tiết"
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditSemester(row)}
            title="Chỉnh sửa"
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteSemester(row)}
            title="Xóa học kỳ"
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
          <Calendar size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{item.ten_hoc_ky}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Năm học: <strong style={{ color: '#2563eb' }}>{item.nam_hoc}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
          {new Date(item.ngay_bat_dau).toLocaleDateString('vi-VN')} &rarr;{' '}
          {new Date(item.ngay_ket_thuc).toLocaleDateString('vi-VN')}
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '9999px',
            background: item.is_active ? '#ecfdf5' : '#f1f5f9',
            color: item.is_active ? '#059669' : '#64748b'
          }}
        >
          {item.is_active ? 'Học kỳ hiện hành' : 'Đã kết thúc'}
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setDetailSemester(item)}
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          >
            <Eye size={14} /> Chi tiết
          </button>
          <button
            onClick={() => setEditSemester(item)}
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          >
            <Edit2 size={14} /> Sửa
          </button>
          <button
            onClick={() => setDeleteSemester(item)}
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
              borderRadius: '9999px',
              background: item.is_active ? '#ecfdf5' : '#f1f5f9',
              color: item.is_active ? '#059669' : '#64748b'
            }}
          >
            {item.is_active ? 'Hiện hành' : 'Đã kết thúc'}
          </span>
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          {item.ten_hoc_ky}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
          Năm học: <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.nam_hoc}</span>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
          {new Date(item.ngay_bat_dau).toLocaleDateString('vi-VN')} &rarr;{' '}
          {new Date(item.ngay_ket_thuc).toLocaleDateString('vi-VN')}
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '6px'
        }}
      >
        <button
          onClick={() => setDetailSemester(item)}
          style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Eye size={13} />
        </button>
        <button
          onClick={() => setEditSemester(item)}
          style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => setDeleteSemester(item)}
          style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Trash2 size={13} />
        </button>
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
        title="Quản lý Học kỳ & Niên khóa"
        subtitle="Danh mục các học kỳ đào tạo, khung thời gian bắt đầu - kết thúc và thiết lập kỳ học hiện hành"
        data={semesters}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        loading={loading}
        searchKeys={['ten_hoc_ky', 'nam_hoc']}
        searchPlaceholder="Tìm kiếm học kỳ theo tên, năm học..."
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus size={16} /> <span>Thêm Học kỳ mới</span>
          </button>
        }
      />

      {/* Modal Thêm Học Kỳ */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Học kỳ đào tạo mới"
      >
        <form onSubmit={handleCreateSemester} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên Học kỳ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="vd: Học kỳ 1, Học kỳ Hè"
                value={form.ten_hoc_ky}
                onChange={(e) => setForm({ ...form, ten_hoc_ky: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Năm học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="vd: 2024-2025"
                value={form.nam_hoc}
                onChange={(e) => setForm({ ...form, nam_hoc: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.ngay_bat_dau}
                onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.ngay_ket_thuc}
                onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              Tạo Học kỳ
            </button>
          </div>
        </form>
      </Modal>

      {/* 3 Popups: Details, Edit, Delete */}
      <SemesterDetailModal
        isOpen={Boolean(detailSemester)}
        semester={detailSemester}
        onClose={() => setDetailSemester(null)}
        onEdit={(sem) => setEditSemester(sem)}
      />

      <SemesterEditModal
        isOpen={Boolean(editSemester)}
        semester={editSemester}
        onClose={() => setEditSemester(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Cập nhật học kỳ thành công!' });
          loadSemesters();
        }}
      />

      <SemesterDeleteModal
        isOpen={Boolean(deleteSemester)}
        semester={deleteSemester}
        onClose={() => setDeleteSemester(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Đã xóa học kỳ thành công!' });
          loadSemesters();
        }}
      />
    </div>
  );
}
