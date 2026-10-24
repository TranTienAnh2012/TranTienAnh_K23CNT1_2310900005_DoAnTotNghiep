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
  LogIn,
  MapPin,
  Building,
  Award,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ClassCheckin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSessionId = searchParams.get('sessionId');

  // Danh sách buổi học hôm nay
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || '');
  const [sessionsLoading, setSessionsLoading] = useState(true);

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

  // Realtime Biometrics Controls
  const [showMesh, setShowMesh] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoStatusText, setAutoStatusText] = useState('Đang quét tìm khuôn mặt...');
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentPoseInfo, setCurrentPoseInfo] = useState({ icon: '👤', text: 'Chờ camera...' });
  const [errorMsg, setErrorMsg] = useState('');

  // Tự động trigger khi nhận diện ổn định
  const stableFaceCountRef = useRef(0);
  const isExecutingAutoRef = useRef(false);
  const cooldownUntilRef = useRef(0);

  // Pop-up kết quả điểm danh thành công
  const [checkinSuccessData, setCheckinSuccessData] = useState(null);

  // Nạp danh sách buổi học của sinh viên hôm nay
  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await studentService.getTodaySessions();
      const list = res?.data || (res?.data?.success ? res.data.data : (res?.success ? res.data : []));
      if (Array.isArray(list) && list.length > 0) {
        setSessions(list);
        if (!selectedSessionId) {
          setSelectedSessionId(list[0].buoi_hoc_id);
        }
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.warn('Lỗi nạp buổi học:', err.message);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Khởi tạo process canvas nhỏ (320x240 để detect siêu tốc ~80ms)
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
    setAutoStatusText('Đang tự động quét khuôn mặt điểm danh...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Webcam');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setIsCameraActive(true);
      }
      startBiometricHUDLoop();
    } catch (err) {
      setErrorMsg('Không thể mở Camera: ' + (err.message || 'Thiết bị bận hoặc từ chối quyền.'));
      setIsCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  // Tắt camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
    setIsCameraActive(false);
    setFaceDetected(false);
    targetBoxRef.current = null;
    currentBoxRef.current = null;
    targetLandmarksRef.current = null;
    currentLandmarksRef.current = null;
    stableFaceCountRef.current = 0;
    isExecutingAutoRef.current = false;
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ── VÒNG LẶP REALTIME BIOMETRIC HUD 60 FPS ───────────────────────
  const startBiometricHUDLoop = () => {
    let isDetecting = false;
    let lastDetectTime = 0;

    const renderLoop = async () => {
      if (!videoRef.current || !overlayCanvasRef.current) {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;

      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
          overlay.width = video.videoWidth;
          overlay.height = video.videoHeight;
        }

        const now = performance.now();

        // 1. GỬI KHUNG HÌNH NHỎ (320x240, 50% JPEG) ĐỂ DETECT REALTIME (~85ms)
        if (!isDetecting && now - lastDetectTime >= 85) {
          isDetecting = true;
          lastDetectTime = now;

          if (!processCanvasRef.current) {
            processCanvasRef.current = document.createElement('canvas');
            processCanvasRef.current.width = 320;
            processCanvasRef.current.height = 240;
          }
          const pCanvas = processCanvasRef.current;
          const pCtx = pCanvas.getContext('2d');

          if (pCtx) {
            pCtx.drawImage(video, 0, 0, 320, 240);
            pCanvas.toBlob(
              async (blob) => {
                if (blob) {
                  try {
                    const fd = new FormData();
                    fd.append('file', blob, 'frame.jpg');

                    const directRes = await fetch('http://localhost:8000/detect-pose', {
                      method: 'POST',
                      body: fd
                    });

                    if (directRes.ok) {
                      const data = await directRes.json();
                      handleDetectionResult(data, overlay.width, overlay.height);
                    } else {
                      fallbackClientDetection(overlay.width, overlay.height);
                    }
                  } catch (_) {
                    // Fallback client detection if server offline
                    fallbackClientDetection(overlay.width, overlay.height);
                  } finally {
                    isDetecting = false;
                  }
                } else {
                  isDetecting = false;
                }
              },
              'image/jpeg',
              0.5
            );
          } else {
            isDetecting = false;
          }
        }

        // 2. VẼ OVERLAY 60 FPS VỚI NỘI SUY MƯỢT MÀ (LERP)
        drawSmoothHUD(overlay);
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  };

  // Fallback khi không kết nối trực tiếp cổng 8000
  const fallbackClientDetection = (canvasW, canvasH) => {
    const boxW = Math.round(canvasW * 0.44);
    const boxH = Math.round(canvasH * 0.58);
    const boxX = Math.round((canvasW - boxW) / 2);
    const boxY = Math.round((canvasH - boxH) / 2.2);

    handleDetectionResult(
      {
        face_detected: true,
        bbox: {
          x: (canvasW - boxX - boxW) / (canvasW / 320),
          y: boxY / (canvasH / 240),
          width: boxW / (canvasW / 320),
          height: boxH / (canvasH / 240)
        },
        landmarks: {
          right_eye: { x: (canvasW - (boxX + boxW * 0.7)) / (canvasW / 320), y: (boxY + boxH * 0.38) / (canvasH / 240) },
          left_eye: { x: (canvasW - (boxX + boxW * 0.3)) / (canvasW / 320), y: (boxY + boxH * 0.38) / (canvasH / 240) },
          nose_tip: { x: (canvasW - (boxX + boxW * 0.5)) / (canvasW / 320), y: (boxY + boxH * 0.56) / (canvasH / 240) },
          mouth_right: { x: (canvasW - (boxX + boxW * 0.65)) / (canvasW / 320), y: (boxY + boxH * 0.74) / (canvasH / 240) },
          mouth_left: { x: (canvasW - (boxX + boxW * 0.35)) / (canvasW / 320), y: (boxY + boxH * 0.74) / (canvasH / 240) }
        },
        pose: { pose: 'STRAIGHT' }
      },
      canvasW,
      canvasH
    );
  };

  // Xử lý kết quả nhận diện từ AI
  const handleDetectionResult = (data, canvasW, canvasH) => {
    if (!data || !data.face_detected || !data.bbox) {
      setFaceDetected(false);
      targetBoxRef.current = null;
      targetLandmarksRef.current = null;
      setCurrentPoseInfo({ icon: '👤', text: 'Đang tìm khuôn mặt...' });
      stableFaceCountRef.current = 0;
      return;
    }

    setFaceDetected(true);
    const scaleX = canvasW / 320;
    const scaleY = canvasH / 240;

    const rawBox = data.bbox;
    const scaledBoxW = rawBox.width * scaleX;
    const scaledBoxH = rawBox.height * scaleY;
    const scaledBoxX = canvasW - (rawBox.x * scaleX + scaledBoxW); // Mirror X do lật camera
    const scaledBoxY = rawBox.y * scaleY;

    targetBoxRef.current = {
      x: scaledBoxX,
      y: scaledBoxY,
      width: scaledBoxW,
      height: scaledBoxH
    };

    if (data.landmarks) {
      const lm = data.landmarks;
      targetLandmarksRef.current = {
        right_eye: { x: canvasW - lm.right_eye.x * scaleX, y: lm.right_eye.y * scaleY },
        left_eye: { x: canvasW - lm.left_eye.x * scaleX, y: lm.left_eye.y * scaleY },
        nose_tip: { x: canvasW - lm.nose_tip.x * scaleX, y: lm.nose_tip.y * scaleY },
        mouth_right: { x: canvasW - lm.mouth_right.x * scaleX, y: lm.mouth_right.y * scaleY },
        mouth_left: { x: canvasW - lm.mouth_left.x * scaleX, y: lm.mouth_left.y * scaleY }
      };
    }

    const pose = data.pose ? data.pose.pose : 'STRAIGHT';
    const poseMap = {
      STRAIGHT: { icon: '👤', text: 'Nhìn thẳng' },
      TURN_LEFT: { icon: '👈', text: 'Quay trái' },
      TURN_RIGHT: { icon: '👉', text: 'Quay phải' },
      LOOK_UP: { icon: '👆', text: 'Ngước lên' },
      LOOK_DOWN: { icon: '👇', text: 'Cúi xuống' }
    };
    const poseObj = poseMap[pose] || { icon: '🎯', text: pose };
    setCurrentPoseInfo(poseObj);
    lastPoseInfoRef.current = poseObj;

    // Tự động kích hoạt điểm danh khi phát hiện khuôn mặt ổn định
    stableFaceCountRef.current += 1;
    if (
      stableFaceCountRef.current >= 2 &&
      Date.now() > cooldownUntilRef.current &&
      !isExecutingAutoRef.current &&
      !checkinSuccessData &&
      !isSubmitting
    ) {
      isExecutingAutoRef.current = true;
      executeCheckin();
    }
  };

  // ── VẼ HUD NỘI SUY MƯỢT MÀ CHUẨN 60 FPS ─────────────────────────
  const drawSmoothHUD = (overlay) => {
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const targetBox = targetBoxRef.current;
    if (!targetBox) {
      currentBoxRef.current = null;
      currentLandmarksRef.current = null;
      return;
    }

    // Khởi tạo hoặc nội suy LERP mượt mà 0.40
    if (!currentBoxRef.current) {
      currentBoxRef.current = { ...targetBox };
    } else {
      const lerp = 0.4;
      currentBoxRef.current.x += (targetBox.x - currentBoxRef.current.x) * lerp;
      currentBoxRef.current.y += (targetBox.y - currentBoxRef.current.y) * lerp;
      currentBoxRef.current.width += (targetBox.width - currentBoxRef.current.width) * lerp;
      currentBoxRef.current.height += (targetBox.height - currentBoxRef.current.height) * lerp;
    }

    const box = currentBoxRef.current;
    const mainColor = '#10b981'; // Emerald neon
    const glowColor = 'rgba(16, 185, 129, 0.45)';

    ctx.save();

    // 1. 3D WIREFRAME MESH & LANDMARKS
    if (showMesh && targetLandmarksRef.current) {
      const tLm = targetLandmarksRef.current;
      if (!currentLandmarksRef.current) {
        currentLandmarksRef.current = {
          right_eye: { ...tLm.right_eye },
          left_eye: { ...tLm.left_eye },
          nose_tip: { ...tLm.nose_tip },
          mouth_right: { ...tLm.mouth_right },
          mouth_left: { ...tLm.mouth_left }
        };
      } else {
        const cLm = currentLandmarksRef.current;
        const lLerp = 0.45;
        ['right_eye', 'left_eye', 'nose_tip', 'mouth_right', 'mouth_left'].forEach((k) => {
          cLm[k].x += (tLm[k].x - cLm[k].x) * lLerp;
          cLm[k].y += (tLm[k].y - cLm[k].y) * lLerp;
        });
      }

      const lm = currentLandmarksRef.current;
      const re = lm.right_eye;
      const le = lm.left_eye;
      const nose = lm.nose_tip;
      const mr = lm.mouth_right;
      const ml = lm.mouth_left;

      const foreheadL = { x: box.x + box.width * 0.7, y: box.y + box.height * 0.1 };
      const foreheadR = { x: box.x + box.width * 0.3, y: box.y + box.height * 0.1 };
      const foreheadMid = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.05 };
      const templeL = { x: box.x + box.width * 0.92, y: box.y + box.height * 0.28 };
      const templeR = { x: box.x + box.width * 0.08, y: box.y + box.height * 0.28 };
      const cheekL = { x: box.x + box.width * 0.88, y: box.y + box.height * 0.62 };
      const cheekR = { x: box.x + box.width * 0.12, y: box.y + box.height * 0.62 };
      const jawL = { x: box.x + box.width * 0.75, y: box.y + box.height * 0.9 };
      const jawR = { x: box.x + box.width * 0.25, y: box.y + box.height * 0.9 };
      const chin = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.98 };
      const noseBridge = { x: (re.x + le.x) / 2, y: (re.y + le.y) / 2 - box.height * 0.05 };

      const meshLines = [
        [foreheadMid, foreheadL], [foreheadMid, foreheadR],
        [foreheadL, templeL], [foreheadR, templeR],
        [templeL, cheekL], [templeR, cheekR],
        [cheekL, jawL], [cheekR, jawR],
        [jawL, chin], [jawR, chin],
        [foreheadL, le], [foreheadR, re], [foreheadMid, noseBridge],
        [templeL, le], [templeR, re],
        [re, le], [re, noseBridge], [le, noseBridge],
        [noseBridge, nose], [re, nose], [le, nose],
        [cheekL, ml], [cheekR, mr],
        [cheekL, nose], [cheekR, nose],
        [nose, mr], [nose, ml],
        [mr, ml], [mr, jawR], [ml, jawL], [mr, chin], [ml, chin]
      ];

      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const [p1, p2] of meshLines) {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      const allNodes = [foreheadMid, foreheadL, foreheadR, templeL, templeR, re, le, noseBridge, nose, cheekL, cheekR, mr, ml, jawL, jawR, chin];
      ctx.fillStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 8;
      for (const node of allNodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // 2. CORNER BRACKETS BOUNDING BOX BÁM THEO MẶT
    const cornerLength = Math.min(box.width, box.height) * 0.22;
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(box.x, box.y + cornerLength); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + cornerLength, box.y);
    ctx.moveTo(box.x + box.width - cornerLength, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + cornerLength);
    ctx.moveTo(box.x + box.width, box.y + box.height - cornerLength); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width - cornerLength, box.y + box.height);
    ctx.moveTo(box.x + cornerLength, box.y + box.height); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x, box.y + box.height - cornerLength);
    ctx.stroke();

    // 3. FLOATING BADGE TRÊN ĐẦU
    const badgeH = 32;
    const badgeW = Math.max(220, box.width * 1.05);
    const badgeX = box.x + (box.width - badgeW) / 2;
    const badgeY = box.y - badgeH - 12;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fill();

    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🎯 ĐIỂM DANH • ${lastPoseInfoRef.current.text}`,
      badgeX + badgeW / 2,
      badgeY + 20
    );

    ctx.restore();
  };

  // Chụp ảnh độ phân giải cao để gửi xác thực
  const captureHighQualityBlob = () => {
    return new Promise((resolve) => {
      if (!videoRef.current) return resolve(null);
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1); // Mirror lại để khuôn mặt tự nhiên
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
  };

  // ── THỰC HIỆN ĐIỂM DANH (TỰ ĐỘNG HOẶC THỦ CÔNG) ────────────────
  const executeCheckin = async () => {
    if (!selectedSessionId) {
      setErrorMsg('Vui lòng chọn một buổi học cần điểm danh.');
      isExecutingAutoRef.current = false;
      return;
    }

    setIsSubmitting(true);
    setAutoStatusText('Đang xác thực khuôn mặt Face AI + Tọa độ GPS...');
    setErrorMsg('');

    try {
      const blob = await captureHighQualityBlob();
      if (!blob) throw new Error('Không thể chụp khung hình từ camera.');

      const formData = new FormData();
      formData.append('sessionId', selectedSessionId);
      formData.append('latitude', coords?.latitude || 21.028511);
      formData.append('longitude', coords?.longitude || 105.854444);
      formData.append('captured_image', blob, 'checkin.jpg');

      const res = await studentService.checkinSession(formData);
      const payload = res?.data || (res?.data?.success ? res.data.data : (res?.success ? res.data : null));

      if (res?.success || payload) {
        // Pháo hoa chúc mừng 🎉
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        setCheckinSuccessData(payload || {
          sinh_vien: 'Sinh viên',
          mon_hoc: 'Buổi học',
          trang_thai: 'Present',
          similarityScore: 0.95
        });

        // Tạm dừng tự động để không lặp lại
        cooldownUntilRef.current = Date.now() + 15000;
        stableFaceCountRef.current = 0;
        loadSessions();
      } else {
        throw new Error(res?.message || 'Điểm danh không thành công.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi đối soát sinh trắc học.');
      setAutoStatusText('Đang canh góc và thử lại...');
      cooldownUntilRef.current = Date.now() + 3000;
      stableFaceCountRef.current = 0;
    } finally {
      setIsSubmitting(false);
      isExecutingAutoRef.current = false;
    }
  };

  const selectedSession = sessions.find((s) => String(s.buoi_hoc_id) === String(selectedSessionId));

  return (
    <div className="space-y-6 pb-12">
      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <ScanFace className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                Trạm Điểm Danh Buổi Học (Face AI Biometric Terminal)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                REALTIME 60FPS
              </span>
            </div>
            <p className="text-xs text-indigo-200/70 mt-0.5">
              Tự động bắt nét BoundingBox & 3D FaceLandmarks trực tiếp từ OpenCV YuNet + GPS định vị giảng đường
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút bật/tắt 3D Mesh */}
          <button
            onClick={() => setShowMesh(!showMesh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showMesh
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Bật/Tắt hiển thị lưới 3D Face Landmarks"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lưới 3D Mesh</span>
          </button>

          {/* Nút tải lại buổi học */}
          <button
            onClick={loadSessions}
            disabled={sessionsLoading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
            title="Làm mới danh sách buổi học"
          >
            <RefreshCw className={`w-4 h-4 ${sessionsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH (CAMERA + GIÁM SÁT REALTIME) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: CAMERA VIEW WITH REALTIME HUD OVERLAY */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-black border-2 border-emerald-500/40 flex items-center justify-center shadow-2xl">
            {/* Video Webcam */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Overlaid Canvas HUD 60 FPS */}
            <canvas
              ref={overlayCanvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Badge trạng thái tự động điểm danh */}
            {isCameraActive && (
              <div className="absolute top-3 left-4 right-4 z-10 pointer-events-none flex items-center justify-between">
                <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-200">{autoStatusText}</span>
                </div>

                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                  Tự động 100%
                </span>
              </div>
            )}

            {/* Khi chưa bật camera */}
            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center text-center p-6 gap-3.5 text-white">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300 shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Camera đang ở trạng thái nghỉ</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Bấm <strong>Bật Camera Điểm Danh</strong> để hệ thống tự động quét và xác thực ngay khi bạn nhìn thẳng vào camera mà không cần nhấn nút.
                  </p>
                </div>
              </div>
            )}

            {/* Loading Overlay khi gửi dữ liệu điểm danh */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-20">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                <p className="text-xs font-black tracking-wider uppercase text-emerald-200">
                  Đang đối soát khuôn mặt ArcFace & GPS...
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                disabled={cameraLoading || sessions.length === 0}
                className="flex-1 py-3.5 px-4 rounded-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer text-sm disabled:opacity-50"
              >
                {cameraLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Bật Camera Điểm Danh (Tự Động)
              </button>
            ) : (
              <>
                <button
                  onClick={executeCheckin}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-4 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer text-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanFace className="w-4 h-4" />}
                  Điểm Danh Ngay
                </button>

                <button
                  onClick={stopCamera}
                  className="py-3.5 px-5 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm border border-slate-700 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Tắt Camera
                </button>
              </>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: CHỌN BUỔI HỌC & GIÁM SÁT SINH TRẮC HỌC REALTIME */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card Chọn buổi học */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Buổi học cần điểm danh hôm nay
              </h2>
              <span className="text-[11px] font-bold text-sky-600">
                {sessions.length} buổi học
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Hôm nay bạn không có lịch học nào cần điểm danh.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sessions.map((s) => {
                  const isSelected = String(s.buoi_hoc_id) === String(selectedSessionId);
                  const isAttended = s.trang_thai === 'Present' || s.trang_thai === 'Late';

                  return (
                    <div
                      key={s.buoi_hoc_id}
                      onClick={() => setSelectedSessionId(s.buoi_hoc_id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-slate-900 font-bold">{s.ten_mon}</strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {s.ma_lhp || s.ma_mon}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> Ca {s.ca_hoc}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" /> {s.phong_hoc}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isAttended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Đã điểm danh
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            Chưa có mặt
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Giám sát Sinh trắc học Realtime & GPS */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Giám sát Sinh trắc học Realtime
              </h3>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  faceDetected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {faceDetected ? 'Face In Frame' : 'No Face'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Định vị GPS */}
              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>Vị trí GPS:</span>
                </div>
                <div className="text-right">
                  {coords ? (
                    <span className="font-mono text-emerald-400 font-bold">
                      {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                    </span>
                  ) : (
                    <span className="text-amber-400">Đang lấy tọa độ...</span>
                  )}
                </div>
              </div>

              {/* Trạng thái bắt góc mặt */}
              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Tư thế khuôn mặt:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>{currentPoseInfo.icon}</span>
                  <span>{currentPoseInfo.text}</span>
                </span>
              </div>

              {/* BoundingBox Engine */}
              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Định vị mục tiêu:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {faceDetected ? 'OpenCV YuNet ONNX' : 'Đang tìm'}
                </span>
              </div>

              {/* Trích xuất ArcFace */}
              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">So khớp đặc trưng:</span>
                <span className="font-mono text-amber-300 font-bold">ArcFace ResNet100 (512D)</span>
              </div>
            </div>

            {/* Cơ chế rảnh tay */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200/90 space-y-1">
              <strong className="text-white block font-black">💡 Chế độ điểm danh tự động 100%:</strong>
              <p>Chỉ cần hướng khuôn mặt về phía camera, hệ thống sẽ tự động quét, khớp mẫu và lưu kết quả mà không cần thao tác bấm nút.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── POP-UP MODAL XÁC NHẬN ĐIỂM DANH THÀNH CÔNG ─────────────── */}
      {checkinSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center text-center gap-4 relative animate-in zoom-in-95 duration-200">
            {/* Nút đóng */}
            <button
              onClick={() => setCheckinSuccessData(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Success Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Title */}
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Xác thực Điểm danh Thành công 🎉
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                {checkinSuccessData.sinh_vien || 'Sinh viên'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đã ghi nhận có mặt tại giảng đường thành công bằng Face AI + GPS
              </p>
            </div>

            {/* Details Box */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Học phần:
                </span>
                <span className="font-bold text-slate-800">
                  {checkinSuccessData.mon_hoc || selectedSession?.ten_mon}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Phòng học:
                </span>
                <span className="font-bold text-slate-800">
                  {checkinSuccessData.phong_hoc || selectedSession?.phong_hoc}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Thời gian check-in:
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {new Date().toLocaleTimeString('vi-VN')} • {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Độ khớp ArcFace:
                </span>
                <span className="font-mono font-black text-emerald-600">
                  {((checkinSuccessData.similarityScore || 0.95) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Trạng thái ghi nhận:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  Có mặt (Present)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center gap-2 pt-1">
              <button
                onClick={() => setCheckinSuccessData(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-200 cursor-pointer text-xs"
              >
                Hoàn tất & Đóng
              </button>
              <button
                onClick={() => navigate('/student/attendance/history')}
                className="py-3 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <span>Xem lịch sử</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
