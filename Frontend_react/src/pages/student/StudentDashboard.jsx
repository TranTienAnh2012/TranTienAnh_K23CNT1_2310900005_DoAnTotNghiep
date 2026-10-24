import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/studentService';
import { Camera, CheckCircle2, FileCheck2, Calendar, Clock, MapPin, AlertCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {});
  const [todaySessions, setTodaySessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, sRes, eRes] = await Promise.all([
          studentService.getMyProfile(),
          studentService.getTodaySessions(),
          studentService.getMyExams()
        ]);
        if (pRes.success) setProfile(pRes.data);
        if (sRes.success) setTodaySessions(sRes.data);
        if (eRes.success) setExams(eRes.data);
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu sinh viên:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hasFace = !!profile.face_embedding || !!profile.has_face_registered;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chào mừng, {profile.ho_ten || user?.username}!</h1>
          {(profile.ma_sv || profile.ten_lop || profile.ten_khoa) && (
            <p className="page-subtitle">
              {profile.ma_sv && <>Mã SV: <b>{profile.ma_sv}</b></>}
              {profile.ma_sv && profile.ten_lop && ' | '}
              {profile.ten_lop && <>Lớp: <b>{profile.ten_lop}</b></>}
              {(profile.ma_sv || profile.ten_lop) && profile.ten_khoa && ' | '}
              {profile.ten_khoa && <>Khoa: <b>{profile.ten_khoa}</b></>}
            </p>
          )}
        </div>

        {/* Trạng thái khuôn mặt */}
        <div>
          {hasFace ? (
            <span
              className="badge badge-present"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldCheck size={18} /> Đã đăng ký Khuôn mặt AI
            </span>
          ) : (
            <Link
              to="/student/face-registration"
              className="btn btn-danger"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Camera size={16} /> Chưa đăng ký khuôn mặt - Đăng ký ngay!
            </Link>
          )}
        </div>
      </div>

      {/* Cảnh báo nếu chưa đăng ký mặt */}
      {!hasFace && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '16px 20px',
            borderRadius: '12px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>Bạn chưa có dữ liệu vector khuôn mặt trên hệ thống!</div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>
                Vui lòng chụp ảnh khuôn mặt mẫu để hệ thống trích xuất 512 đặc trưng nhận diện trước khi thực hiện điểm danh buổi học hoặc vào phòng thi.
              </div>
            </div>
          </div>
          <Link to="/student/face-registration" className="btn btn-primary" style={{ padding: '8px 16px' }}>
            Đăng ký ngay
          </Link>
        </div>
      )}

      {/* 2 Nút hành động nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #bfdbfe',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a' }}>Điểm danh Buổi học</h3>
            <p style={{ fontSize: '13px', color: '#1e40af', marginTop: '4px' }}>
              Xác thực vị trí GPS tại giảng đường + Quét khuôn mặt Face AI
            </p>
            <Link to="/student/checkin" className="btn btn-primary" style={{ marginTop: '14px' }}>
              <CheckCircle2 size={16} /> Vào màn hình Điểm danh
            </Link>
          </div>
          <div style={{ opacity: 0.8, color: '#2563eb' }}>
            <CheckCircle2 size={56} />
          </div>
        </div>

        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
            border: '1px solid #e9d5ff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#581c87' }}>Check-in Phòng thi</h3>
            <p style={{ fontSize: '13px', color: '#6b21a8', marginTop: '4px' }}>
              Đối soát danh tính thí sinh bước vào phòng thi học phần
            </p>
            <Link
              to="/student/exam-checkin"
              className="btn btn-primary"
              style={{ marginTop: '14px', background: '#7c3aed' }}
            >
              <FileCheck2 size={16} /> Vào màn hình Check-in Thi
            </Link>
          </div>
          <div style={{ opacity: 0.8, color: '#7c3aed' }}>
            <FileCheck2 size={56} />
          </div>
        </div>
      </div>

      {/* Danh sách các buổi học hôm nay */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
            Lịch học & Điểm danh Hôm nay
          </h3>
          <Link
            to="/student/schedule"
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#0284c7',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Calendar size={15} /> Xem toàn bộ Thời khóa biểu →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {todaySessions.map((s) => (
            <div
              key={s.buoi_hoc_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>
                  {s.ten_mon} ({s.ma_lhp})
                </div>
                <div style={{ display: 'flex', gap: '18px', fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                  <span><Clock size={14} style={{ verticalAlign: 'middle' }} /> {s.ca_hoc}</span>
                  <span><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {s.phong_hoc}</span>
                  <span>Giảng viên: <b>{s.ten_giang_vien || 'Chưa phân công'}</b></span>
                </div>
              </div>

              <div>
                {s.trang_thai === 'Present' ? (
                  <span className="badge badge-present" style={{ padding: '8px 14px', fontSize: '13px' }}>
                    <CheckCircle2 size={14} /> Đã có mặt ({s.thoi_gian_checkin})
                  </span>
                ) : s.trang_thai === 'Late' ? (
                  <span className="badge badge-late" style={{ padding: '8px 14px', fontSize: '13px' }}>
                    <Clock size={14} /> Đi muộn ({s.thoi_gian_checkin})
                  </span>
                ) : (
                  <Link
                    to={`/student/checkin?sessionId=${s.buoi_hoc_id}`}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    Điểm danh ngay
                  </Link>
                )}
              </div>
            </div>
          ))}

          {todaySessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
              Hôm nay bạn không có buổi học nào cần điểm danh.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
