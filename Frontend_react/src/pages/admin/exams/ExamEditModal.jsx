import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function ExamEditModal({ isOpen, onClose, exam, subjects = [], semesters = [], teachers = [], onSuccess }) {
  const [formData, setFormData] = useState({
    mon_hoc_id: '',
    hoc_ky_id: '',
    giang_vien_id: '',
    ngay_thi: '',
    gio_bat_dau: '08:00:00',
    gio_ket_thuc: '10:00:00',
    phong_thi: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (exam) {
      setFormData({
        mon_hoc_id: exam.mon_hoc_id || '',
        hoc_ky_id: exam.hoc_ky_id || '',
        giang_vien_id: exam.giang_vien_id || '',
        ngay_thi: exam.ngay_thi ? exam.ngay_thi.split('T')[0] : '',
        gio_bat_dau: exam.gio_bat_dau || '08:00:00',
        gio_ket_thuc: exam.gio_ket_thuc || '10:00:00',
        phong_thi: exam.phong_thi || '',
        is_active: typeof exam.is_active !== 'undefined' ? Boolean(exam.is_active) : true
      });
      setError('');
    }
  }, [exam, isOpen]);

  if (!isOpen || !exam) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mon_hoc_id || !formData.hoc_ky_id || !formData.ngay_thi || !formData.phong_thi) {
      setError('Vui lòng điền đủ tất cả các trường.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminService.updateExam(exam.id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ca thi.');
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
              Cập nhật Ca thi
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Ca thi ID #{exam.id}
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
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Môn thi <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={formData.mon_hoc_id}
                  onChange={(e) => setFormData({ ...formData, mon_hoc_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.ten_mon}
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
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.ten_hoc_ky}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Cán bộ coi thi / Giám thị
              </label>
              <select
                value={formData.giang_vien_id}
                onChange={(e) => setFormData({ ...formData, giang_vien_id: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="">-- Chưa phân công giám thị --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ho_ten} ({t.ma_gv})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Ngày thi <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.ngay_thi}
                  onChange={(e) => setFormData({ ...formData, ngay_thi: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Phòng thi <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: P.Thi 401 - Nhà B1"
                  value={formData.phong_thi}
                  onChange={(e) => setFormData({ ...formData, phong_thi: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Giờ bắt đầu
                </label>
                <input
                  type="text"
                  required
                  placeholder="08:00:00"
                  value={formData.gio_bat_dau}
                  onChange={(e) => setFormData({ ...formData, gio_bat_dau: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Giờ kết thúc
                </label>
                <input
                  type="text"
                  required
                  placeholder="10:00:00"
                  value={formData.gio_ket_thuc}
                  onChange={(e) => setFormData({ ...formData, gio_ket_thuc: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Cổng Check-in nhận diện FaceAI
              </label>
              <select
                value={formData.is_active ? '1' : '0'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="1">Đang mở cho thí sinh Check-in</option>
                <option value="0">Đã khóa / Đóng cổng check-in</option>
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
