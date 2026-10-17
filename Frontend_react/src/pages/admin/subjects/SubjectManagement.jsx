import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import SubjectDetailModal from './SubjectDetailModal';
import SubjectEditModal from './SubjectEditModal';
import SubjectDeleteModal from './SubjectDeleteModal';
import {
  BookOpen,
  Plus,
  Building2,
  Award,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  // Modal thêm môn
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    ma_mon: '',
    ten_mon: '',
    so_tin_chi: '',
    so_buoi_hoc: '',
    khoa_id: ''
  });

  // 3 Popups: Details, Edit, Delete
  const [detailSubject, setDetailSubject] = useState(null);
  const [editSubject, setEditSubject] = useState(null);
  const [deleteSubject, setDeleteSubject] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        adminService.getSubjects(),
        adminService.getFaculties()
      ]);
      if (sRes.success) setSubjects(sRes.data);
      if (fRes.success) {
        setFaculties(fRes.data);
        if (fRes.data.length > 0 && !form.khoa_id) {
          setForm((prev) => ({ ...prev, khoa_id: fRes.data[0].id }));
        }
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createSubject(form);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCreateModalOpen(false);
        setForm({
          ma_mon: '',
          ten_mon: '',
          so_tin_chi: '',
          so_buoi_hoc: '',
          khoa_id: faculties[0]?.id || ''
        });
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const displaySubjects = selectedFaculty === 'all'
    ? subjects
    : subjects.filter((s) => String(s.khoa_id) === String(selectedFaculty));

  const columns = [
    {
      header: 'Mã Môn',
      accessor: 'ma_mon',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
          {row.ma_mon}
        </span>
      )
    },
    {
      header: 'Tên Môn học',
      accessor: 'ten_mon',
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
            <BookOpen size={16} />
          </div>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.ten_mon}</span>
        </div>
      )
    },
    {
      header: 'Số tín chỉ',
      accessor: 'so_tin_chi',
      render: (row) => (
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '6px',
            background: '#f1f5f9',
            color: '#334155'
          }}
        >
          {row.so_tin_chi} TC
        </span>
      )
    },
    {
      header: 'Số buổi quy định',
      accessor: 'so_buoi_hoc',
      render: (row) => (
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '6px',
            background: row.so_buoi_hoc ? '#eff6ff' : '#f8fafc',
            color: row.so_buoi_hoc ? '#2563eb' : '#94a3b8'
          }}
        >
          {row.so_buoi_hoc ? `${row.so_buoi_hoc} buổi` : '—'}
        </span>
      )
    },
    {
      header: 'Khoa phụ trách',
      accessor: 'ten_khoa',
      render: (row) => (
        <span style={{ color: '#475569', fontSize: '0.85rem' }}>
          {row.ten_khoa || 'Chưa gán'}
        </span>
      )
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '9999px',
            background: row.is_active !== false ? '#ecfdf5' : '#fef2f2',
            color: row.is_active !== false ? '#059669' : '#dc2626'
          }}
        >
          {row.is_active !== false ? 'Đang mở' : 'Tạm dừng'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setDetailSubject(row)}
            title="Xem chi tiết"
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditSubject(row)}
            title="Chỉnh sửa"
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteSubject(row)}
            title="Xóa môn học"
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
          <BookOpen size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{item.ten_mon}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Mã: <strong style={{ color: '#2563eb' }}>{item.ma_mon}</strong> • Khoa: {item.ten_khoa || 'Chưa gán'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '6px',
            background: '#f1f5f9',
            color: '#334155'
          }}
        >
          {item.so_tin_chi} Tín chỉ
        </span>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '9999px',
            background: item.is_active !== false ? '#ecfdf5' : '#fef2f2',
            color: item.is_active !== false ? '#059669' : '#dc2626'
          }}
        >
          {item.is_active !== false ? 'Đang mở' : 'Tạm dừng'}
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setDetailSubject(item)}
            style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          >
            <Eye size={14} /> Chi tiết
          </button>
          <button
            onClick={() => setEditSubject(item)}
            style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          >
            <Edit2 size={14} /> Sửa
          </button>
          <button
            onClick={() => setDeleteSubject(item)}
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
              background: '#f1f5f9',
              color: '#334155'
            }}
          >
            {item.so_tin_chi} TC
          </span>
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          {item.ten_mon}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
          Mã môn: <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.ma_mon}</span>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
          <strong style={{ color: '#64748b' }}>Khoa:</strong> {item.ten_khoa || 'Chưa gán'}
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
          onClick={() => setDetailSubject(item)}
          style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Eye size={13} />
        </button>
        <button
          onClick={() => setEditSubject(item)}
          style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => setDeleteSubject(item)}
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
        title="Quản lý Môn học Đào tạo"
        subtitle="Danh mục các môn học, số tín chỉ tích lũy và đơn vị chuyên môn phụ trách"
        data={displaySubjects}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        loading={loading}
        searchFields={['ten_mon', 'ma_mon', 'ten_khoa']}
        searchPlaceholder="Tìm kiếm môn học theo tên, mã môn, khoa..."
        actionButton={
          <button
            onClick={() => setIsCreateModalOpen(true)}
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
            <Plus size={16} /> Thêm Môn học mới
          </button>
        }
        filterComponent={
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.88rem',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">Tất cả các khoa ({subjects.length})</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.ten_khoa}
              </option>
            ))}
          </select>
        }
      />

      {/* Modal Thêm Môn */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Môn học mới vào CTĐT"
      >
        <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Mã Môn học *
            </label>
            <input
              type="text"
              required
              placeholder="vd: IT302, AI201"
              value={form.ma_mon}
              onChange={(e) => setForm({ ...form, ma_mon: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Tên Môn học *
            </label>
            <input
              type="text"
              required
              placeholder="vd: Phát triển ứng dụng Web nâng cao"
              value={form.ten_mon}
              onChange={(e) => setForm({ ...form, ten_mon: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Số tín chỉ *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                placeholder="Nhập số tín chỉ"
                value={form.so_tin_chi}
                onChange={(e) => setForm({ ...form, so_tin_chi: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Số buổi quy định *
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                placeholder="Nhập số buổi học"
                value={form.so_buoi_hoc}
                onChange={(e) => setForm({ ...form, so_buoi_hoc: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Khoa phụ trách *
            </label>
            <select
              value={form.khoa_id}
              onChange={(e) => setForm({ ...form, khoa_id: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ten_khoa}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Tạo Môn học
            </button>
          </div>
        </form>
      </Modal>

      {/* 3 Popups: Details, Edit, Delete */}
      <SubjectDetailModal
        isOpen={Boolean(detailSubject)}
        subject={detailSubject}
        onClose={() => setDetailSubject(null)}
        onEdit={(s) => setEditSubject(s)}
      />

      <SubjectEditModal
        isOpen={Boolean(editSubject)}
        subject={editSubject}
        faculties={faculties}
        onClose={() => setEditSubject(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Cập nhật môn học thành công!' });
          loadData();
        }}
      />

      <SubjectDeleteModal
        isOpen={Boolean(deleteSubject)}
        subject={deleteSubject}
        onClose={() => setDeleteSubject(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Đã xóa môn học thành công!' });
          loadData();
        }}
      />
    </div>
  );
}
