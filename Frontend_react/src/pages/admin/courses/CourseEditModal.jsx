import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function CourseEditModal({ isOpen, onClose, course, subjects, semesters, teachers, onSuccess }) {
  const [formData, setFormData] = useState({
    ten_lhp: '',
    mon_hoc_id: '',
    hoc_ky_id: '',
    giang_vien_id: '',
    phong_hoc_mac_dinh: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        ten_lhp: course.ten_lhp || '',
        mon_hoc_id: course.mon_hoc_id || '',
        hoc_ky_id: course.hoc_ky_id || '',
        giang_vien_id: course.giang_vien_id || '',
        phong_hoc_mac_dinh: course.phong_hoc_mac_dinh || '',
        is_active: typeof course.is_active !== 'undefined' ? Boolean(course.is_active) : true
      });
      setError('');
    }
  }, [course, isOpen]);

  if (!isOpen || !course) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ten_lhp || !formData.mon_hoc_id || !formData.hoc_ky_id) {
      setError('Vui lòng điền đủ tên lớp học phần, môn học và học kỳ.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminService.updateCourse(course.id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật lớp học phần.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafbfc'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
              Cập nhật Lớp học phần
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Mã LHP: {course.ma_lhp}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Tên Lớp học phần <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ten_lhp}
                onChange={(e) => setFormData({ ...formData, ten_lhp: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Môn học <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={formData.mon_hoc_id}
                  onChange={(e) => setFormData({ ...formData, mon_hoc_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Chọn môn --</option>
                  {subjects.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ten_mon} ({m.so_tin_chi} TC)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Học kỳ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={formData.hoc_ky_id}
                  onChange={(e) => setFormData({ ...formData, hoc_ky_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Chọn kỳ --</option>
                  {semesters.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.ten_hoc_ky}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Giảng viên phân công
                </label>
                <select
                  value={formData.giang_vien_id}
                  onChange={(e) => setFormData({ ...formData, giang_vien_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Chưa gán giảng viên --</option>
                  {teachers.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.ho_ten} ({g.ma_gv})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Phòng học mặc định
                </label>
                <input
                  type="text"
                  placeholder="vd: P.301 - Nhà B"
                  value={formData.phong_hoc_mac_dinh}
                  onChange={(e) => setFormData({ ...formData, phong_hoc_mac_dinh: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Trạng thái lớp học phần
              </label>
              <select
                value={formData.is_active ? '1' : '0'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="1">Đang mở giảng dạy</option>
                <option value="0">Đã kết thúc / Đóng lớp</option>
              </select>
            </div>
          </div>

          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              background: '#fafbfc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
