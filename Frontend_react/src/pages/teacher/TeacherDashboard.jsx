import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { teacherService } from '../../services/teacherService';
import { BookOpen, Calendar, Clock, MapPin, CheckCircle, Camera, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {});
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, cRes, sRes] = await Promise.all([
          teacherService.getMyProfile(),
          teacherService.getMyCourses(),
          teacherService.getMySchedule()
        ]);
        if (pRes.success) setProfile(pRes.data);
        if (cRes.success) setCourses(cRes.data);
        if (sRes.success) setSchedule(sRes.data);
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu giảng viên:', err.message);
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
          <h1 className="page-title">Chào mừng Thầy/Cô {profile.ho_ten || user?.username}!</h1>
          {(profile.ten_khoa || profile.ma_gv) && (
            <p className="page-subtitle">
              {profile.ten_khoa && <>Khoa: <b>{profile.ten_khoa}</b></>}
              {profile.ten_khoa && profile.ma_gv && ' | '}
              {profile.ma_gv && <>Mã GV: <b>{profile.ma_gv}</b></>}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasFace ? (
            <span
              className="badge badge-present"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldCheck size={16} /> Đã đăng ký Khuôn mặt
            </span>
          ) : (
            <Link
              to="/teacher/face-registration"
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <Camera size={15} /> Đăng ký khuôn mặt GV
            </Link>
          )}

          <Link to="/teacher/attendance" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <CheckCircle size={16} /> Duyệt Điểm danh Hôm nay
          </Link>
        </div>
      </div>

      {/* Cảnh báo nếu giảng viên chưa đăng ký khuôn mặt */}
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
              <div style={{ fontWeight: '700', fontSize: '14px' }}>Thầy/Cô chưa đăng ký khuôn mặt trên hệ thống!</div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>
                Vui lòng đăng ký ảnh mẫu nhận diện để hệ thống hoàn thiện hồ sơ giảng viên và hỗ trợ xác thực thông minh.
              </div>
            </div>
          </div>
          <Link to="/teacher/face-registration" className="btn btn-primary" style={{ padding: '8px 16px' }}>
            Đăng ký ngay
          </Link>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Lớp Học phần Phụ trách</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{courses.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Tổng số Buổi giảng dạy</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{schedule.length}</div>
          </div>
        </div>
      </div>

      {/* Lịch dạy sắp tới */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Lịch các buổi giảng dạy gần nhất</h3>
          <Link to="/teacher/schedule" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
            Xem toàn bộ &rarr;
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {schedule.slice(0, 5).map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
                  {s.ten_lhp} ({s.ma_lhp})
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  <span><Calendar size={13} style={{ verticalAlign: 'middle' }} /> {s.ngay_hoc}</span>
                  <span><Clock size={13} style={{ verticalAlign: 'middle' }} /> {s.ca_hoc}</span>
                  <span><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {s.phong_hoc}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${s.is_active ? 'badge-present' : 'badge-absent'}`}>
                  {s.is_active ? 'Đang mở' : 'Đã khóa'}
                </span>
                <Link
                  to={`/teacher/attendance?sessionId=${s.id}`}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Chi tiết điểm danh
                </Link>
              </div>
            </div>
          ))}

          {schedule.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              Chưa có buổi học nào được lên lịch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
