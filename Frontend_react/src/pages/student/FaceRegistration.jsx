import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import WebcamGpsCapture from '../../components/camera/WebcamGpsCapture';
import Notification from '../../components/common/Notification';
import { Camera, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function FaceRegistration() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [regResult, setRegResult] = useState(null);

  const loadProfile = async () => {
    try {
      const res = await studentService.getMyProfile();
      if (res.success) setProfile(res.data);
    } catch (err) {
      console.warn('Lỗi tải hồ sơ:', err.message);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleCapture = async ({ imageBlob }) => {
    if (!imageBlob) return;
    setLoading(true);
    setNotice(null);
    setRegResult(null);

    try {
      const formData = new FormData();
      formData.append('avatar', imageBlob, 'registered_avatar.jpg');

      const res = await studentService.registerFace(formData);
      if (res.success) {
        setNotice({
          type: 'success',
          message: 'Đăng ký dữ liệu khuôn mặt mẫu thành công! Đặc trưng vector 512 chiều đã được lưu trữ.'
        });
        setRegResult(res.data);
        loadProfile();
      } else {
        setNotice({ type: 'error', message: res.message || 'Không thể đăng ký khuôn mặt.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const hasFace = !!profile?.face_embedding || !!profile?.has_face_registered;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đăng ký Dữ liệu Khuôn mặt (Face AI)</h1>
          <p className="page-subtitle">
            Chụp ảnh chân dung chính diện để AI phân tích và lưu trữ vector đặc trưng nhận diện
          </p>
        </div>
      </div>

      <Notification type={notice?.type} message={notice?.message} onClose={() => setNotice(null)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Khung Webcam Chụp */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={18} color="#2563eb" />
            Khung hình Camera Chụp chân dung
          </h3>

          <WebcamGpsCapture
            onCapture={handleCapture}
            btnText={loading ? 'Đang phân tích AI...' : 'Lưu mẫu Khuôn mặt'}
            disabled={loading}
            showGpsDetails={false}
          />
        </div>

        {/* Hướng dẫn & Tình trạng hồ sơ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
              Tình trạng Dữ liệu Nhận diện
            </h3>

            {hasFace ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {profile?.avatar_url && (
                  <img
                    src={`http://localhost:5000${profile.avatar_url}`}
                    alt="Current Avatar"
                    style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #10b981' }}
                  />
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700', fontSize: '14px' }}>
                    <ShieldCheck size={18} /> Đã có vector mẫu (512 chiều)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Cập nhật lần cuối: <b>{profile.face_updated_at || 'Chưa cập nhật'}</b>
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                    Bạn có thể chụp lại để cập nhật mẫu mới bất kỳ lúc nào.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b91c1c' }}>
                <AlertCircle size={22} />
                <div style={{ fontSize: '13px' }}>
                  Hồ sơ chưa có mẫu nhận diện. Bạn cần chụp ảnh để có thể điểm danh và thi.
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#0f172a' }}>
              Lưu ý khi chụp ảnh mẫu:
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#475569', lineHeight: '1.8' }}>
              <li>Ngồi tại nơi có ánh sáng đều, tránh ngược sáng.</li>
              <li>Hướng mặt thẳng vào camera, không nghiêng quá 15 độ.</li>
              <li>Không đeo kính râm, khẩu trang hoặc mũ che trán.</li>
              <li>Giữ khuôn mặt ổn định trong vòng 1-2 giây trước khi bấm chụp.</li>
            </ul>
          </div>

          {regResult && (
            <div className="card" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#065f46', marginBottom: '8px' }}>
                Thông số chất lượng mẫu AI:
              </h4>
              <div style={{ fontSize: '12px', color: '#065f46', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Độ sáng khuôn mặt: <b>{regResult.quality?.brightness || 120}</b> (Chuẩn: 40 - 240)</div>
                <div>Độ nét ảnh (Laplacian): <b>{regResult.quality?.blur_score || 85}</b> (Chuẩn &gt;= 15)</div>
                <div>Kích thước vector đặc trưng: <b>512 dimensions (Normalized)</b></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
