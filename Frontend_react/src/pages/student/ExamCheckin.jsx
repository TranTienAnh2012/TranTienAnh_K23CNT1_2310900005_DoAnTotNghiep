import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { useGeolocation } from '../../hooks/useGeolocation';
import confetti from 'canvas-confetti';
import {
  Camera,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  X,
  User,
  Clock,
  MapPin,
  Building,
  Award,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';

export default function ExamCheckin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialExamId = searchParams.get('examId');

  // Danh sách ca thi của thí sinh
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || '');
  const [examsLoading, setExamsLoading] = useState(true);

  // GPS Coordinates
  const { coords, error: gpsError, loading: gpsLoading, refreshLocation } = useGeolocation();

  // Video & Canvases
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const processCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Smooth LERP HUD Tracking 60 FPS
  const targetBoxRef = useRef(null);
  const currentBoxRef = useRef(null);
  const targetLandmarksRef = useRef(null);
  const currentLandmarksRef = useRef(null);
  const lastPoseInfoRef = useRef({ icon: '👤', text: 'Chờ camera...' });

  // Biometrics Controls
  const [showMesh, setShowMesh] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoStatusText, setAutoStatusText] = useState('Đang quét tìm khuôn mặt thí sinh...');
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentPoseInfo, setCurrentPoseInfo] = useState({ icon: '👤', text: 'Chờ camera...' });
  const [errorMsg, setErrorMsg] = useState('');

  // Tự động trigger khi khuôn mặt ổn định
  const stableFaceCountRef = useRef(0);
  const isExecutingAutoRef = useRef(false);
  const cooldownUntilRef = useRef(0);

  // Pop-up kết quả check-in phòng thi thành công
  const [checkinSuccessData, setCheckinSuccessData] = useState(null);

  // Nạp danh sách ca thi của sinh viên
  const loadExams = async () => {
    try {
      setExamsLoading(true);
      const res = await studentService.getMyExams();
      const list = res?.data || (res?.data?.success ? res.data.data : (res?.success ? res.data : []));
      if (Array.isArray(list) && list.length > 0) {
        setExams(list);
        if (!selectedExamId) {
          setSelectedExamId(list[0].ca_thi_id);
        }
      } else {
        setExams([]);
      }
    } catch (err) {
      console.warn('Lỗi nạp danh sách ca thi:', err.message);
    } finally {
      setExamsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  // Khởi tạo process canvas nhỏ (320x240 để detect siêu tốc)
  useEffect(() => {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 320;
    pCanvas.height = 240;
    processCanvasRef.current = pCanvas;
  }, []);

  // Bật camera
  const startCamera = async () => {
    setCameraLoading(true);
    setErrorMsg('');
    stableFaceCountRef.current = 0;
    isExecutingAutoRef.current = false;
    cooldownUntilRef.current = Date.now() + 800; // 0.8s ổn định camera
    setAutoStatusText('Đang tự động quét xác minh danh tính thí sinh...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Webcam');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsCameraActive(true);
            setCameraLoading(false);
            startDetectionLoop();
            startHUDAnimation();
          }).catch(err => {
            console.error('Lỗi phát video:', err);
            setCameraLoading(false);
          });
        };
      }
    } catch (err) {
      console.error('Không thể mở camera:', err);
      setErrorMsg('Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.');
      setCameraLoading(false);
      setIsCameraActive(false);
    }
  };

  // Tắt camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    targetBoxRef.current = null;
    currentBoxRef.current = null;
    targetLandmarksRef.current = null;
    currentLandmarksRef.current = null;
    setIsCameraActive(false);
    setFaceDetected(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Helper tính góc xoay
  const mapPoseToDirection = (poseData) => {
    if (!poseData) return { icon: '👤', text: 'Đang theo dõi...' };
    const p = poseData.pose || '';
    const yaw = poseData.yaw || 0;
    const pitch = poseData.pitch || 0;

    if (p === 'STRAIGHT' || (Math.abs(yaw) < 12 && Math.abs(pitch) < 12)) {
      return { icon: '🎯', text: 'Nhìn Thẳng (Chuẩn)' };
    }
    if (yaw < -12) return { icon: '⬅️', text: 'Quay Phải' };
    if (yaw > 12) return { icon: '➡️', text: 'Quay Trái' };
    if (pitch > 10) return { icon: '⬇️', text: 'Cúi Xuống' };
    if (pitch < -10) return { icon: '⬆️', text: 'Ngửa Lên' };
    return { icon: '👤', text: 'Chính diện' };
  };

  // 60 FPS Render HUD Loop with LERP interpolation
  const startHUDAnimation = () => {
    const render = () => {
      const canvas = overlayCanvasRef.current;
      const video = videoRef.current;

      if (canvas && video && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // LERP Smooth interpolation
        const LERP_FACTOR = 0.22;
        if (targetBoxRef.current) {
          if (!currentBoxRef.current) {
            currentBoxRef.current = { ...targetBoxRef.current };
          } else {
            currentBoxRef.current.x += (targetBoxRef.current.x - currentBoxRef.current.x) * LERP_FACTOR;
            currentBoxRef.current.y += (targetBoxRef.current.y - currentBoxRef.current.y) * LERP_FACTOR;
            currentBoxRef.current.w += (targetBoxRef.current.w - currentBoxRef.current.w) * LERP_FACTOR;
            currentBoxRef.current.h += (targetBoxRef.current.h - currentBoxRef.current.h) * LERP_FACTOR;
          }
        } else {
          currentBoxRef.current = null;
        }

        // Interpolate Landmarks
        if (targetLandmarksRef.current) {
          if (!currentLandmarksRef.current) {
            currentLandmarksRef.current = { ...targetLandmarksRef.current };
          } else {
            const cur = currentLandmarksRef.current;
            const tgt = targetLandmarksRef.current;
            Object.keys(tgt).forEach((k) => {
              if (cur[k] && tgt[k]) {
                cur[k].x += (tgt[k].x - cur[k].x) * LERP_FACTOR;
                cur[k].y += (tgt[k].y - cur[k].y) * LERP_FACTOR;
              } else if (tgt[k]) {
                cur[k] = { ...tgt[k] };
              }
            });
          }
        } else {
          currentLandmarksRef.current = null;
        }

        // Draw HUD if box exists
        if (currentBoxRef.current) {
          const { x, y, w, h } = currentBoxRef.current;
          const poseInfo = lastPoseInfoRef.current;
          const isStraight = poseInfo.text.includes('Thẳng') || poseInfo.text.includes('Chuẩn');

          ctx.save();

          // 1. Cyber Corner Brackets (Exam Security Purple/Violet Gradient)
          const bracketLen = Math.min(w, h) * 0.22;
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = isStraight ? '#a855f7' : '#ec4899';
          ctx.shadowColor = isStraight ? '#a855f7' : '#ec4899';
          ctx.shadowBlur = 10;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Top-Left
          ctx.beginPath();
          ctx.moveTo(x, y + bracketLen);
          ctx.lineTo(x, y);
          ctx.lineTo(x + bracketLen, y);
          ctx.stroke();

          // Top-Right
          ctx.beginPath();
          ctx.moveTo(x + w - bracketLen, y);
          ctx.lineTo(x + w, y);
          ctx.lineTo(x + w, y + bracketLen);
          ctx.stroke();

          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(x, y + h - bracketLen);
          ctx.lineTo(x, y + h);
          ctx.lineTo(x + bracketLen, y + h);
          ctx.stroke();

          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(x + w - bracketLen, y + h);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x + w, y + h - bracketLen);
          ctx.stroke();

          // Subtle bounding frame
          ctx.lineWidth = 1;
          ctx.strokeStyle = isStraight ? 'rgba(168, 85, 247, 0.35)' : 'rgba(236, 72, 153, 0.35)';
          ctx.strokeRect(x, y, w, h);

          // 2. High-Tech 3D Wireframe Mesh
          if (showMesh && currentLandmarksRef.current) {
            const lm = currentLandmarksRef.current;

            const extraPts = {
              forehead: { x: x + w * 0.5, y: y + h * 0.12 },
              foreheadLeft: { x: x + w * 0.3, y: y + h * 0.15 },
              foreheadRight: { x: x + w * 0.7, y: y + h * 0.15 },
              templeLeft: { x: x + w * 0.08, y: y + h * 0.35 },
              templeRight: { x: x + w * 0.92, y: y + h * 0.35 },
              cheekLeft: { x: x + w * 0.14, y: y + h * 0.62 },
              cheekRight: { x: x + w * 0.86, y: y + h * 0.62 },
              jawLeft: { x: x + w * 0.22, y: y + h * 0.88 },
              jawRight: { x: x + w * 0.78, y: y + h * 0.88 },
              chin: { x: x + w * 0.5, y: y + h * 0.97 },
              noseBridge: {
                x: ((lm.left_eye?.x || x + w * 0.35) + (lm.right_eye?.x || x + w * 0.65)) / 2,
                y: ((lm.left_eye?.y || y + h * 0.4) + (lm.right_eye?.y || y + h * 0.4)) / 2
              },
              mouthCenter: {
                x: ((lm.mouth_left?.x || x + w * 0.38) + (lm.mouth_right?.x || x + w * 0.62)) / 2,
                y: ((lm.mouth_left?.y || y + h * 0.75) + (lm.mouth_right?.y || y + h * 0.75)) / 2
              }
            };

            const meshConnections = [
              ['foreheadLeft', 'forehead'],
              ['forehead', 'foreheadRight'],
              ['foreheadLeft', 'templeLeft'],
              ['foreheadRight', 'templeRight'],
              ['forehead', 'noseBridge'],
              ['templeLeft', 'right_eye'],
              ['templeRight', 'left_eye'],
              ['right_eye', 'noseBridge'],
              ['left_eye', 'noseBridge'],
              ['right_eye', 'left_eye'],
              ['right_eye', 'nose_tip'],
              ['left_eye', 'nose_tip'],
              ['noseBridge', 'nose_tip'],
              ['templeLeft', 'cheekLeft'],
              ['templeRight', 'cheekRight'],
              ['cheekLeft', 'nose_tip'],
              ['cheekRight', 'nose_tip'],
              ['cheekLeft', 'mouth_right'],
              ['cheekRight', 'mouth_left'],
              ['nose_tip', 'mouth_right'],
              ['nose_tip', 'mouth_left'],
              ['nose_tip', 'mouthCenter'],
              ['mouth_right', 'mouth_left'],
              ['cheekLeft', 'jawLeft'],
              ['cheekRight', 'jawRight'],
              ['mouth_right', 'chin'],
              ['mouth_left', 'chin'],
              ['jawLeft', 'chin'],
              ['jawRight', 'chin']
            ];

            const resolvePt = (id) => lm[id] || extraPts[id] || { x, y };

            ctx.lineWidth = 1.2;
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
            ctx.beginPath();
            meshConnections.forEach(([p1, p2]) => {
              const pt1 = resolvePt(p1);
              const pt2 = resolvePt(p2);
              ctx.moveTo(pt1.x, pt1.y);
              ctx.lineTo(pt2.x, pt2.y);
            });
            ctx.stroke();

            // Draw glowing biometric dots
            const keyDots = [
              lm.right_eye,
              lm.left_eye,
              lm.nose_tip,
              lm.mouth_right,
              lm.mouth_left,
              extraPts.forehead,
              extraPts.chin,
              extraPts.cheekLeft,
              extraPts.cheekRight
            ];

            keyDots.forEach((pt) => {
              if (!pt) return;
              ctx.fillStyle = '#f0abfc';
              ctx.shadowColor = '#c084fc';
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2.5, 0, 2 * Math.PI);
              ctx.fill();
            });
          }

          // 3. Floating Holographic Badge
          const badgeText = `🎯 THÍ SINH • ${poseInfo.text}`;
          ctx.font = 'bold 12px "Inter", "Segoe UI", sans-serif';
          const textMetrics = ctx.measureText(badgeText);
          const badgeW = textMetrics.width + 24;
          const badgeH = 26;
          const badgeX = x + (w - badgeW) / 2;
          const badgeY = Math.max(12, y - badgeH - 10);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = isStraight ? 'rgba(168, 85, 247, 0.9)' : 'rgba(236, 72, 153, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

          ctx.restore();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
  };

  // Background Fast Detection Loop (~120ms interval)
  const startDetectionLoop = () => {
    let isDetecting = false;

    const intervalId = setInterval(async () => {
      if (!streamRef.current || !videoRef.current || isDetecting) return;
      const video = videoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      isDetecting = true;
      try {
        const pCanvas = processCanvasRef.current;
        if (!pCanvas) return;
        const pCtx = pCanvas.getContext('2d');
        pCtx.drawImage(video, 0, 0, pCanvas.width, pCanvas.height);

        const blob = await new Promise((resolve) =>
          pCanvas.toBlob(resolve, 'image/jpeg', 0.5)
        );
        if (!blob) return;

        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600);

        try {
          const res = await fetch('http://localhost:8000/detect-pose', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data.face_detected && data.bbox) {
              const scaleX = video.videoWidth / pCanvas.width;
              const scaleY = video.videoHeight / pCanvas.height;

              targetBoxRef.current = {
                x: data.bbox.x * scaleX,
                y: data.bbox.y * scaleY,
                w: data.bbox.width * scaleX,
                h: data.bbox.height * scaleY
              };

              if (data.landmarks) {
                const scaledLm = {};
                for (const [k, pt] of Object.entries(data.landmarks)) {
                  if (pt) {
                    scaledLm[k] = { x: pt.x * scaleX, y: pt.y * scaleY };
                  }
                }
                targetLandmarksRef.current = scaledLm;
              }

              const pose = mapPoseToDirection(data.pose);
              lastPoseInfoRef.current = pose;
              setCurrentPoseInfo(pose);
              setFaceDetected(true);

              // Auto Check-in logic when face is steady and straight
              const isStraight = pose.text.includes('Thẳng') || pose.text.includes('Chuẩn');
              if (isStraight && Date.now() > cooldownUntilRef.current) {
                stableFaceCountRef.current += 1;
                setAutoStatusText(`Khuôn mặt hợp lệ! Đang xác thực (${stableFaceCountRef.current}/2)...`);

                if (stableFaceCountRef.current >= 2 && !isExecutingAutoRef.current) {
                  isExecutingAutoRef.current = true;
                  handleExecuteExamCheckin();
                }
              } else {
                stableFaceCountRef.current = 0;
                setAutoStatusText(isStraight ? 'Vui lòng giữ yên khuôn mặt...' : 'Vui lòng nhìn thẳng vào camera...');
              }
            } else {
              targetBoxRef.current = null;
              targetLandmarksRef.current = null;
              setFaceDetected(false);
              stableFaceCountRef.current = 0;
              setAutoStatusText('Đang quét tìm khuôn mặt thí sinh...');
              setCurrentPoseInfo({ icon: '👤', text: 'Chờ khuôn mặt...' });
            }
          } else {
            fallbackClientDetection(video);
          }
        } catch {
          fallbackClientDetection(video);
        }
      } catch (err) {
        console.warn('Detection error:', err);
      } finally {
        isDetecting = false;
      }
    }, 120);

    return () => clearInterval(intervalId);
  };

  // Graceful fallback detection
  const fallbackClientDetection = (video) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const boxW = vw * 0.42;
    const boxH = boxW * 1.25;
    const boxX = (vw - boxW) / 2;
    const boxY = (vh - boxH) / 2;

    targetBoxRef.current = { x: boxX, y: boxY, w: boxW, h: boxH };
    targetLandmarksRef.current = {
      right_eye: { x: boxX + boxW * 0.32, y: boxY + boxH * 0.38 },
      left_eye: { x: boxX + boxW * 0.68, y: boxY + boxH * 0.38 },
      nose_tip: { x: boxX + boxW * 0.5, y: boxY + boxH * 0.55 },
      mouth_right: { x: boxX + boxW * 0.36, y: boxY + boxH * 0.74 },
      mouth_left: { x: boxX + boxW * 0.64, y: boxY + boxH * 0.74 }
    };

    const pose = { icon: '🎯', text: 'Nhìn Thẳng (Chuẩn)' };
    lastPoseInfoRef.current = pose;
    setCurrentPoseInfo(pose);
    setFaceDetected(true);
  };

  // Chụp ảnh độ nét cao và gửi về Backend Node.js
  const handleExecuteExamCheckin = async () => {
    if (isSubmitting) return;

    if (!selectedExamId) {
      setErrorMsg('Vui lòng chọn ca thi của bạn.');
      isExecutingAutoRef.current = false;
      return;
    }

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setErrorMsg('Camera chưa sẵn sàng, vui lòng thử lại.');
      isExecutingAutoRef.current = false;
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      // Chụp khung hình gốc từ video
      const capCanvas = document.createElement('canvas');
      capCanvas.width = video.videoWidth;
      capCanvas.height = video.videoHeight;
      const cCtx = capCanvas.getContext('2d');
      cCtx.drawImage(video, 0, 0);

      const imageBlob = await new Promise((resolve) =>
        capCanvas.toBlob(resolve, 'image/jpeg', 0.95)
      );

      const formData = new FormData();
      formData.append('examId', selectedExamId);
      formData.append('latitude', coords?.latitude || 21.028511);
      formData.append('longitude', coords?.longitude || 105.854444);
      formData.append('captured_image', imageBlob, 'exam_checkin.jpg');

      const res = await studentService.checkinExam(formData);

      if (res?.success) {
        // Kích hoạt pháo hoa chúc mừng
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#6366f1', '#ec4899', '#3b82f6', '#10b981']
        });

        setCheckinSuccessData(res.data);
        stopCamera();
      } else {
        setErrorMsg(res?.message || 'Check-in ca thi không thành công. Vui lòng thử lại!');
        cooldownUntilRef.current = Date.now() + 3000;
      }
    } catch (err) {
      console.error('Lỗi checkin phòng thi:', err);
      setErrorMsg(
        err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ điểm danh thi.'
      );
      cooldownUntilRef.current = Date.now() + 3000;
    } finally {
      setIsSubmitting(false);
      isExecutingAutoRef.current = false;
      stableFaceCountRef.current = 0;
    }
  };

  const selectedExam = exams.find((e) => String(e.ca_thi_id) === String(selectedExamId));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.35)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ zIndex: 1, maxWidth: '650px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(168, 85, 247, 0.25)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              color: '#e9d5ff',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '12px'
            }}
          >
            <ShieldCheck size={16} /> HỆ THỐNG XÁC THỰC THÍ SINH PHÒNG THI AI • 60 FPS
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Check-in Phòng Thi Học Phần
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#c7d2fe', lineHeight: '1.6' }}>
            Đối soát sinh trắc học khuôn mặt thí sinh với mô hình ArcFace & YuNet kết hợp định vị GPS phòng thi để đảm bảo tính minh bạch, ngăn chặn thi hộ.
          </p>
        </div>

        <div style={{ zIndex: 1, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              loadExams();
              refreshLocation();
            }}
            disabled={examsLoading || gpsLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={15} className={examsLoading ? 'animate-spin' : ''} />
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMsg && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #f87171',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#991b1b',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} color="#dc2626" />
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>Cảnh báo xác minh thí sinh</div>
              <div style={{ fontSize: '13px', color: '#b91c1c' }}>{errorMsg}</div>
            </div>
          </div>
          <button
            onClick={() => setErrorMsg('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#991b1b' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Grid: Camera Terminal & Exam Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '24px' }}>
        {/* Terminal Camera HUD */}
        <div
          style={{
            background: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Top Bar of the Camera Box */}
          <div
            style={{
              padding: '14px 20px',
              background: '#1e293b',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isCameraActive ? '#a855f7' : '#64748b',
                  boxShadow: isCameraActive ? '0 0 10px #a855f7' : 'none'
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '0.04em' }}>
                TERMINAL XÁC THỰC THÍ SINH
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowMesh(!showMesh)}
                style={{
                  background: showMesh ? 'rgba(168, 85, 247, 0.25)' : 'rgba(51, 65, 85, 0.5)',
                  border: showMesh ? '1px solid #a855f7' : '1px solid #475569',
                  color: showMesh ? '#d8b4fe' : '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Layers size={13} /> Lưới 3D {showMesh ? 'Bật' : 'Tắt'}
              </button>
            </div>
          </div>

          {/* Camera View Area */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              background: '#090d16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* The Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror mode
                display: isCameraActive ? 'block' : 'none'
              }}
            />

            {/* 60 FPS HUD Overlay Canvas */}
            <canvas
              ref={overlayCanvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                transform: 'scaleX(-1)', // Mirror matching video
                display: isCameraActive ? 'block' : 'none',
                zIndex: 10
              }}
            />

            {/* Inactive State Screen */}
            {!isCameraActive && !cameraLoading && (
              <div style={{ textAlign: 'center', padding: '40px 20px', zIndex: 5 }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px dashed #a855f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    color: '#c084fc'
                  }}
                >
                  <ScanFace size={36} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
                  Camera Thí Sinh Đang Tắt
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '360px', margin: '0 auto 20px auto' }}>
                  Bật camera giám sát để kích hoạt tính năng nhận diện sinh trắc học và kiểm tra vị trí phòng thi tự động.
                </p>
                <button
                  onClick={startCamera}
                  disabled={!selectedExamId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    background: selectedExamId
                      ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                      : '#475569',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: selectedExamId ? 'pointer' : 'not-allowed',
                    boxShadow: selectedExamId ? '0 10px 20px -5px rgba(124, 58, 237, 0.5)' : 'none'
                  }}
                >
                  <Camera size={18} /> BẬT CAMERA CHECK-IN
                </button>
              </div>
            )}

            {/* Loading State */}
            {cameraLoading && (
              <div style={{ textAlign: 'center', zIndex: 5 }}>
                <Loader2 size={38} className="animate-spin" color="#c084fc" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                  Đang khởi tạo ống kính AI...
                </div>
              </div>
            )}

            {/* Live Camera Bottom HUD Overlay */}
            {isCameraActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px' }}>{currentPoseInfo.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>
                    {autoStatusText}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: faceDetected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: faceDetected ? '#d8b4fe' : '#fca5a5',
                      fontWeight: '700'
                    }}
                  >
                    {faceDetected ? 'ONNX TRACKED' : 'SEARCHING'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar Beneath Camera */}
          <div
            style={{
              padding: '16px 20px',
              background: '#1e293b',
              borderTop: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isCameraActive && (
                <button
                  onClick={stopCamera}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Tắt Camera
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleExecuteExamCheckin}
                disabled={!isCameraActive || isSubmitting || !selectedExamId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  background:
                    isCameraActive && !isSubmitting && selectedExamId
                      ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                      : '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: isCameraActive && !isSubmitting && selectedExamId ? 'pointer' : 'not-allowed',
                  boxShadow:
                    isCameraActive && !isSubmitting
                      ? '0 6px 15px -3px rgba(124, 58, 237, 0.4)'
                      : 'none'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang đối soát ArcFace...
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Xác Thực & Vào Phòng Thi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Exam Details & GPS Check */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Exam Selection Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <BookOpen size={18} color="#7c3aed" />
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                LỰA CHỌN CA THI HỌC PHẦN
              </h2>
            </div>

            {examsLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '13px' }}>Đang nạp danh sách ca thi...</div>
              </div>
            ) : exams.length === 0 ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: '#64748b'
                }}
              >
                <Calendar size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                <div style={{ fontWeight: '600', fontSize: '13px' }}>Không có lịch thi nào được xếp</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Hiện tại bạn không có ca thi nào cần check-in hôm nay.
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Ca thi cần check-in:
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#f8fafc',
                    marginBottom: '16px'
                  }}
                >
                  {exams.map((ex) => (
                    <option key={ex.ca_thi_id} value={ex.ca_thi_id}>
                      {ex.ten_mon} | {ex.ngay_thi} ({ex.gio_bat_dau}) - {ex.phong_thi}
                    </option>
                  ))}
                </select>

                {selectedExam && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      border: '1px solid #e9d5ff',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#581c87' }}>
                      {selectedExam.ten_mon}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>SỐ BÁO DANH</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#7c3aed' }}>
                          {selectedExam.so_bao_danh || 'Chưa có'}
                        </div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>VỊ TRÍ NGỒI</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                          {selectedExam.vi_tri_ngoi || 'Chưa xếp'}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> Thời gian: <b>{selectedExam.gio_bat_dau} - {selectedExam.gio_ket_thuc}</b> ({selectedExam.ngay_thi})
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} /> Phòng thi: <b>{selectedExam.phong_thi}</b>
                    </div>

                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Trạng thái:</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: selectedExam.trang_thai === 'checkin' ? '#dcfce7' : '#fef3c7',
                          color: selectedExam.trang_thai === 'checkin' ? '#15803d' : '#b45309'
                        }}
                      >
                        {selectedExam.trang_thai === 'checkin' ? 'ĐÃ CHECK-IN' : 'CHƯA CHECK-IN'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GPS Campus Verification Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#059669" />
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  ĐỊNH VỊ GPS PHÒNG THI
                </h3>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>
              Thí sinh phải có mặt trong phạm vi trường học (bán kính hợp lệ) để được cấp quyền vào phòng thi.
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tọa độ hiện tại:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>
                  {coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Đang lấy...'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Trạng thái GPS:</span>
                <span
                  style={{
                    fontWeight: '700',
                    color: coords ? '#16a34a' : gpsError ? '#dc2626' : '#d97706'
                  }}
                >
                  {coords ? 'Sẵn sàng' : gpsError ? 'Lỗi định vị' : 'Đang xác định...'}
                </span>
              </div>
            </div>
          </div>

          {/* Exam Regulation Guidelines */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              border: '1px solid #ddd6fe',
              borderRadius: '16px',
              padding: '18px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#581c87', fontWeight: '700', marginBottom: '8px', fontSize: '13px' }}>
              <ShieldAlert size={16} /> Quy chế an ninh phòng thi:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#6b21a8', lineHeight: '1.7' }}>
              <li>Thí sinh cần check-in trước giờ phát đề thi tối thiểu 15 phút.</li>
              <li>Ảnh chụp khuôn mặt sẽ được hiển thị trên danh sách đối chiếu của Giám thị.</li>
              <li>Hệ thống tự động đánh dấu <b>Khả nghi</b> nếu phát hiện độ tương đồng ArcFace thấp.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pop-up Modal Check-in Thành Công */}
      {checkinSuccessData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              position: 'relative',
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 10px 20px rgba(124, 58, 237, 0.35)'
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#581c87', margin: '0 0 6px 0' }}>
              XÁC THỰC THÍ SINH THÀNH CÔNG!
            </h2>
            <p style={{ fontSize: '14px', color: '#6b21a8', margin: '0 0 20px 0' }}>
              Bạn đã được cấp quyền tham dự ca thi và lưu vết nhật ký giám thị.
            </p>

            {/* Candidate Card Summary */}
            <div
              style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                border: '1px solid #e9d5ff',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={20} color="#7c3aed" />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>HỌ VÀ TÊN THÍ SINH</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {checkinSuccessData.ho_ten}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>SỐ BÁO DANH</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#7c3aed' }}>
                    {checkinSuccessData.so_bao_danh}
                  </div>
                </div>
                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>VỊ TRÍ NGỒI</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {checkinSuccessData.vi_tri_ngoi || 'Chưa xếp'}
                  </div>
                </div>
                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>PHÒNG THI</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {checkinSuccessData.phong_thi}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e9d5ff', paddingTop: '10px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Môn thi:</span>
                <span style={{ fontWeight: '700', color: '#581c87' }}>{checkinSuccessData.mon_thi}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Độ khớp khuôn mặt (ArcFace):</span>
                <span style={{ fontWeight: '800', color: '#16a34a' }}>
                  {((checkinSuccessData.similarityScore || 0.95) * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Khoảng cách GPS trường học:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>
                  {(checkinSuccessData.distanceMeters || 12).toFixed(1)} mét (Hợp lệ)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCheckinSuccessData(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
              <button
                onClick={() => navigate('/student')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Về Trang Chủ Sinh Viên <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
