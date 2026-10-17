import React from 'react';
import { X, BookOpenCheck, Calendar, User, Building, CheckCircle2 } from 'lucide-react';

export default function CourseDetailModal({ isOpen, onClose, course, onEdit }) {
  if (!isOpen || !course) return null;

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
              <BookOpenCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                Chi tiết Lớp học phần
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Mã LHP: {course.ma_lhp}
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
              {course.ten_lhp}
            </div>
            <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
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
                Môn: {course.ten_mon} ({course.so_tin_chi || 3} TC)
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: course.is_active !== false ? '#ecfdf5' : '#fef2f2',
                  color: course.is_active !== false ? '#059669' : '#dc2626'
                }}
              >
                {course.is_active !== false ? 'Đang mở' : 'Đã kết thúc'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Mã lớp học phần</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{course.ma_lhp}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Học kỳ đào tạo</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{course.ten_hoc_ky}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Giảng viên phụ trách</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                {course.ten_giang_vien || 'Chưa phân công'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Phòng học mặc định</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                {course.phong_hoc_mac_dinh || 'Chưa gán'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Tổng số buổi học đã lên lịch</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563eb' }}>
                {course.total_sessions || 0} buổi học
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
              if (onEdit) onEdit(course);
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
