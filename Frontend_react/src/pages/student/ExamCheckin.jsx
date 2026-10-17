import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import WebcamGpsCapture from '../../components/camera/WebcamGpsCapture';
import Notification from '../../components/common/Notification';
import { FileCheck2, CheckCircle2, Clock, MapPin, Sparkles, User, AlertTriangle } from 'lucide-react';

export default function ExamCheckin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialExamId = searchParams.get('examId');

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || '');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [examCheckinSuccess, setExamCheckinSuccess] = useState(null);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await studentService.getMyExams();
        if (res.success && res.data.length > 0) {
          setExams(res.data);
          if (!selectedExamId) {
            setSelectedExamId(res.data[0].ca_thi_id);
          }
        }
      } catch (err) {
        console.warn('Lỗi nạp danh sách ca thi:', err.message);
      }
    }
    loadExams();
  }, []);

  const handleExamCheckin = async ({ imageBlob, latitude, longitude }) => {
    if (!selectedExamId) {
      setNotice({ type: 'error', message: 'Vui lòng chọn ca thi cần check-in.' });
      return;
    }

    if (!imageBlob) {
      setNotice({ type: 'error', message: 'Vui lòng chụp ảnh khuôn mặt.' });
      return;
    }

    setLoading(true);
    setNotice(null);
    setExamCheckinSuccess(null);

    try {
      const formData = new FormData();
      formData.append('examId', selectedExamId);
      formData.append('latitude', latitude || 21.028511);
      formData.append('longitude', longitude || 105.854444);
      formData.append('captured_image', imageBlob, 'exam_checkin.jpg');

      const res = await studentService.checkinExam(formData);
      if (res.success) {
        setExamCheckinSuccess(res.data);
        setNotice({
          type: 'success',
          message: 'Xác thực thí sinh thành công! Bạn đã được cấp quyền vào phòng thi.'
        });
      } else {
        setNotice({ type: 'error', message: res.message || 'Check-in ca thi không thành công.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const selectedExam = exams.find((e) => String(e.ca_thi_id) === String(selectedExamId));

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Check-in Phòng thi Học phần</h1>
          <p className="page-subtitle">
            Hệ thống nhận diện khuôn mặt thí sinh trước giờ thi để ngăn chặn thi hộ và gian lận danh tính
          </p>
        </div>
      </div>

      <Notification type={notice?.type} message={notice?.message} onClose={() => setNotice(null)} />

      {/* Kết quả Check-in thành công */}
      {examCheckinSuccess && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
            border: '2px solid #7c3aed',
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
              background: '#7c3aed',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#581c87' }}>
            CHECK-IN PHÒNG THI THÀNH CÔNG!
          </h2>
          <p style={{ fontSize: '14px', color: '#6b21a8', marginTop: '6px' }}>
            Thí sinh: <b>{examCheckinSuccess.ho_ten}</b> | Môn thi: <b>{examCheckinSuccess.mon_thi}</b>
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '24px',
              margin: '20px auto',
              background: '#ffffff',
              padding: '14px 28px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e9d5ff'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>SỐ BÁO DANH</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#7c3aed' }}>
                {examCheckinSuccess.so_bao_danh}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>VỊ TRÍ NGỒI</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {examCheckinSuccess.vi_tri_ngoi || 'Chưa xếp'}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>PHÒNG THI</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {examCheckinSuccess.phong_thi}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => navigate('/student')}
              className="btn btn-primary"
              style={{ padding: '10px 24px', background: '#7c3aed' }}
            >
              Về Trang chủ Sinh viên
            </button>
          </div>
        </div>
      )}

      {!examCheckinSuccess && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          {/* Cụm Camera Check-in */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
              Khung hình Xác minh Thí sinh
            </h3>

            <WebcamGpsCapture
              onCapture={handleExamCheckin}
              btnText={loading ? 'Đang đối soát danh tính...' : 'Xác thực & Vào phòng thi'}
              disabled={loading || !selectedExamId}
              showGpsDetails={true}
            />
          </div>

          {/* Chọn Ca thi & Thẻ dự thi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
                Chọn Ca thi của bạn
              </h3>

              <div className="form-group">
                <label className="form-label">Danh sách Ca thi đã xếp</label>
                <select
                  className="form-select"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                >
                  {exams.map((ex) => (
                    <option key={ex.ca_thi_id} value={ex.ca_thi_id}>
                      {ex.ten_mon} | {ex.ngay_thi} ({ex.gio_bat_dau}) - {ex.phong_thi}
                    </option>
                  ))}
                  {exams.length === 0 && <option value="">Không có lịch thi nào được xếp</option>}
                </select>
              </div>

              {selectedExam && (
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
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{selectedExam.ten_mon}</div>
                  <div style={{ color: '#64748b' }}>
                    Số báo danh: <b>{selectedExam.so_bao_danh}</b> | Vị trí:{' '}
                    <b>{selectedExam.vi_tri_ngoi || 'Chưa xếp'}</b>
                  </div>
                  <div style={{ color: '#64748b' }}>
                    <Clock size={13} style={{ verticalAlign: 'middle' }} /> {selectedExam.ngay_thi} (
                    {selectedExam.gio_bat_dau} - {selectedExam.gio_ket_thuc})
                  </div>
                  <div style={{ color: '#64748b' }}>
                    <MapPin size={13} style={{ verticalAlign: 'middle' }} /> Phòng thi: {selectedExam.phong_thi}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    Trạng thái:{' '}
                    <span
                      className={`badge ${
                        selectedExam.trang_thai === 'checkin' ? 'badge-present' : 'badge-absent'
                      }`}
                    >
                      {selectedExam.trang_thai === 'checkin' ? 'Đã Check-in' : 'Chưa Check-in'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b21a8', fontWeight: '700', marginBottom: '8px' }}>
                <Sparkles size={16} /> Quy định kiểm tra phòng thi:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#6b21a8', lineHeight: '1.7' }}>
                <li>Thí sinh cần có mặt tại phòng thi trước giờ bắt đầu 15 phút.</li>
                <li>Hệ thống lưu lại ảnh chụp lúc vào phòng để giám thị đối chiếu.</li>
                <li>Trường hợp không khớp khuôn mặt sẽ bị gắn cờ <b>Khả nghi</b>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
