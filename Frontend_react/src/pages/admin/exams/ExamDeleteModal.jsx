import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function ExamDeleteModal({ isOpen, onClose, exam, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !exam) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      await adminService.deleteExam(exam.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa ca thi này.');
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
          maxWidth: '440px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Xác nhận xóa Ca thi
          </h3>

          <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
            Bạn có chắc chắn muốn xóa ca thi môn{' '}
            <strong style={{ color: '#0f172a' }}>{exam.ten_mon}</strong> (Phòng:{' '}
            <strong style={{ color: '#0f172a' }}>{exam.phong_thi}</strong>, Ngày:{' '}
            <strong style={{ color: '#0f172a' }}>{new Date(exam.ngay_thi).toLocaleDateString('vi-VN')}</strong>)?
          </p>

          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: '#9f1239',
              textAlign: 'left'
            }}
          >
            Ca thi sẽ được chuyển sang trạng thái đã xóa. Toàn bộ danh sách số báo danh và lịch sử check-in của thí sinh sẽ được lưu trữ an toàn.
          </div>

          {error && (
            <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
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
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={16} />
            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
