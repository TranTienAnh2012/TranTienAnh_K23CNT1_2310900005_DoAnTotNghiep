import React from 'react';
import { X, CalendarCheck, Clock, MapPin, Users, CheckCircle2, UserCheck } from 'lucide-react';

export default function ExamDetailModal({ isOpen, onClose, exam, onEdit }) {
  if (!isOpen || !exam) return null;

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
              <CalendarCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                Chi tiết Ca thi
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Ca thi ID #{exam.id}
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
              Môn thi: {exam.ten_mon}
            </div>
            <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                {exam.ten_hoc_ky}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: exam.is_active ? '#ecfdf5' : '#fef2f2',
                  color: exam.is_active ? '#059669' : '#dc2626'
                }}
              >
                {exam.is_active ? 'Cổng check-in: Đang mở' : 'Cổng check-in: Đã đóng'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Ngày thi</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                {new Date(exam.ngay_thi).toLocaleDateString('vi-VN')}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Khung giờ thi</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                {exam.gio_bat_dau} &rarr; {exam.gio_ket_thuc}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Phòng thi</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{exam.phong_thi}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={13} /> Cán bộ coi thi / Giám thị
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'block' }}>
                {exam.ten_giam_thi || 'Chưa phân công'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Thí sinh đã check-in FaceAI</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563eb' }}>
                  {exam.checked_in_count || 0} / {exam.total_candidates || 0} thí sinh
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {exam.total_candidates > 0 ? Math.round(((exam.checked_in_count || 0) / exam.total_candidates) * 100) : 0}%
                </span>
              </div>
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
              if (onEdit) onEdit(exam);
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
