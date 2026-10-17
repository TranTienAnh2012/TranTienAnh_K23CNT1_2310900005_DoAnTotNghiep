import React from 'react';
import { X, CheckCircle2, AlertCircle, Building2, Mail, User, Shield } from 'lucide-react';

export default function TeacherDetailModal({ isOpen, onClose, teacher, onEdit }) {
  if (!isOpen || !teacher) return null;

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
        {/* Header */}
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
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                Hồ sơ Giảng viên
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Mã GV: {teacher.ma_gv}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                border: '2px solid #e2e8f0'
              }}
            >
              {teacher.ho_ten ? teacher.ho_ten.charAt(0) : 'G'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                {teacher.ho_ten}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: teacher.is_active ? '#ecfdf5' : '#fef2f2',
                    color: teacher.is_active ? '#059669' : '#dc2626'
                  }}
                >
                  {teacher.is_active ? 'Đang công tác' : 'Tạm nghỉ'}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: '#eff6ff',
                    color: '#2563eb'
                  }}
                >
                  {teacher.ten_khoa || 'Chưa phân khoa'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Mã giảng viên</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{teacher.ma_gv}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Tài khoản đăng nhập</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                @{teacher.username || teacher.ma_gv}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Email công vụ</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{teacher.email}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Khoa / Bộ môn công tác</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{teacher.ten_khoa || 'Chưa xác định'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(teacher);
            }}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
