import React from 'react';
import { X, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SemesterDetailModal({ isOpen, onClose, semester, onEdit }) {
  if (!isOpen || !semester) return null;

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
          maxWidth: '520px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                Chi tiết Học kỳ & Niên khóa
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Năm học {semester.nam_hoc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div
            style={{
              paddingBottom: '20px',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              {semester.ten_hoc_ky}
            </div>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: semester.is_active ? '#ecfdf5' : '#f1f5f9',
                  color: semester.is_active ? '#059669' : '#64748b'
                }}
              >
                {semester.is_active ? <CheckCircle2 size={12} /> : null}
                {semester.is_active ? 'Học kỳ hiện hành' : 'Đã kết thúc / Lưu trữ'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Năm học</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{semester.nam_hoc}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Mã định danh ID</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>#{semester.id}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Ngày bắt đầu</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                {semester.ngay_bat_dau ? new Date(semester.ngay_bat_dau).toLocaleDateString('vi-VN') : '---'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Ngày kết thúc</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                {semester.ngay_ket_thuc ? new Date(semester.ngay_ket_thuc).toLocaleDateString('vi-VN') : '---'}
              </span>
            </div>
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
            onClick={onClose}
            style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(semester);
            }}
            style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
