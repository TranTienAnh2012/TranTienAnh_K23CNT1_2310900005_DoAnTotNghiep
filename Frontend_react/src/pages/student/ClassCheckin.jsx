import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import WebcamGpsCapture from '../../components/camera/WebcamGpsCapture';
import Notification from '../../components/common/Notification';
import { CheckCircle2, AlertCircle, Clock, MapPin, Sparkles, UserCheck } from 'lucide-react';

export default function ClassCheckin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSessionId = searchParams.get('sessionId');

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || '');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [checkinSuccess, setCheckinSuccess] = useState(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await studentService.getTodaySessions();
        if (res.success && res.data.length > 0) {
          setSessions(res.data);
          if (!selectedSessionId) {
            setSelectedSessionId(res.data[0].buoi_hoc_id);
          }
        }
      } catch (err) {
        console.warn('Lỗi nạp buổi học:', err.message);
      }
    }
    loadSessions();
  }, []);

  const handleCheckin = async ({ imageBlob, latitude, longitude }) => {
    if (!selectedSessionId) {
      setNotice({ type: 'error', message: 'Vui lòng chọn một buổi học cần điểm danh.' });
      return;
    }

    if (!imageBlob) {
      setNotice({ type: 'error', message: 'Vui lòng chụp ảnh khuôn mặt.' });
      return;
    }

    setLoading(true);
    setNotice(null);
    setCheckinSuccess(null);

    try {
      const formData = new FormData();
      formData.append('sessionId', selectedSessionId);
      formData.append('latitude', latitude || 21.028511);
      formData.append('longitude', longitude || 105.854444);
      formData.append('captured_image', imageBlob, 'checkin.jpg');

      const res = await studentService.checkinSession(formData);
      if (res.success) {
        setCheckinSuccess(res.data);
        setNotice({
          type: 'success',
          message: 'Điểm danh thành công! Vị trí GPS và Khuôn mặt đã được hệ thống xác thực.'
        });
      } else {
        setNotice({ type: 'error', message: res.message || 'Điểm danh không thành công.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const selectedSession = sessions.find((s) => String(s.buoi_hoc_id) === String(selectedSessionId));

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Điểm danh Buổi học (FaceAI + GPS)</h1>
          <p className="page-subtitle">
            Hệ thống tự động kiểm tra định vị GPS trong khuôn viên giảng đường và so khớp khuôn mặt với AI
          </p>
        </div>
      </div>

      <Notification type={notice?.type} message={notice?.message} onClose={() => setNotice(null)} />

      {/* Kết quả điểm danh thành công */}
      {checkinSuccess && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '2px solid #10b981',
            marginBottom: '24px',
            textAlign: 'center',
            padding: '32px'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#065f46' }}>
            XÁC THỰC ĐIỂM DANH THÀNH CÔNG!
          </h2>
          <p style={{ fontSize: '14px', color: '#047857', marginTop: '6px' }}>
            Sinh viên: <b>{checkinSuccess.sinh_vien}</b> | Môn học: <b>{checkinSuccess.mon_hoc}</b> ({checkinSuccess.phong_hoc})
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '20px',
              fontSize: '13px',
              color: '#065f46'
            }}
          >
            <div>
              Độ tương đồng khuôn mặt AI: <b>{(checkinSuccess.similarityScore * 100).toFixed(1)}%</b>
            </div>
            <div>
              Khoảng cách tới phòng: <b>{checkinSuccess.distanceMeters} mét</b>
            </div>
            <div>
              Thời gian ghi nhận: <b>{new Date(checkinSuccess.thoi_gian).toLocaleTimeString()}</b>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button onClick={() => navigate('/student')} className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Về Trang chủ Sinh viên
            </button>
          </div>
        </div>
      )}

      {!checkinSuccess && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          {/* Cụm Webcam + GPS */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
              Khung hình Quét khuôn mặt
            </h3>

            <WebcamGpsCapture
              onCapture={handleCheckin}
              btnText={loading ? 'Đang xác thực AI & GPS...' : 'Xác thực & Điểm danh'}
              disabled={loading || !selectedSessionId}
              showGpsDetails={true}
            />
          </div>

          {/* Chọn Buổi học & Thông tin lớp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
                Chọn Buổi học cần Điểm danh
              </h3>

              <div className="form-group">
                <label className="form-label">Buổi học hôm nay</label>
                <select
                  className="form-select"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  {sessions.map((s) => (
                    <option key={s.buoi_hoc_id} value={s.buoi_hoc_id}>
                      {s.ten_mon} - {s.ca_hoc} ({s.phong_hoc})
                    </option>
                  ))}
                  {sessions.length === 0 && <option value="">Không có buổi học hôm nay</option>}
                </select>
              </div>

              {selectedSession && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{selectedSession.ten_lhp}</div>
                  <div style={{ color: '#64748b' }}>
                    <Clock size={13} style={{ verticalAlign: 'middle' }} /> {selectedSession.ca_hoc}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    <MapPin size={13} style={{ verticalAlign: 'middle' }} /> Phòng học: {selectedSession.phong_hoc}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    Trạng thái điểm danh:{' '}
                    <span
                      className={`badge ${
                        selectedSession.trang_thai === 'Present'
                          ? 'badge-present'
                          : selectedSession.trang_thai === 'Late'
                          ? 'badge-late'
                          : 'badge-absent'
                      }`}
                    >
                      {selectedSession.trang_thai === 'Present'
                        ? 'Đã điểm danh'
                        : selectedSession.trang_thai === 'Late'
                        ? 'Đi muộn'
                        : 'Chưa điểm danh'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: '700', marginBottom: '8px' }}>
                <Sparkles size={16} /> Tiêu chí hợp lệ tự động:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#1e40af', lineHeight: '1.7' }}>
                <li>Vị trí GPS trong bán kính <b>150m</b> từ giảng đường.</li>
                <li>Độ khớp khuôn mặt AI đạt từ <b>68%</b> trở lên.</li>
                <li>Cổng điểm danh của giảng viên đang ở trạng thái <b>Mở</b>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
