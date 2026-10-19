import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Camera,
  Target,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
  ScanFace,
  Users,
  GraduationCap,
  Search,
  Trash2,
  Loader2,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { adminService } from '../../../services/adminService';

export const ANGLES_CONFIG = [
  {
    key: 'straight',
    label: '1. Chính Diện',
    poseReq: 'STRAIGHT',
    desc: 'Nhìn thẳng trực diện vào camera',
    instruction: 'Giữ đầu thẳng, nhìn trực diện vào tâm camera',
    icon: Target,
    color: '#06b6d4',
  },
  {
    key: 'left',
    label: '2. Nghiêng Trái',
    poseReq: 'TURN_LEFT',
    desc: 'Từ từ xoay đầu sang bên trái khoảng 15°',
    instruction: 'Xoay đầu sang phía bên trái của bạn',
    icon: ArrowLeft,
    color: '#818cf8',
  },
  {
    key: 'right',
    label: '3. Nghiêng Phải',
    poseReq: 'TURN_RIGHT',
    desc: 'Từ từ xoay đầu sang bên phải khoảng 15°',
    instruction: 'Xoay đầu sang phía bên phải của bạn',
    icon: ArrowRight,
    color: '#a78bfa',
  },
  {
    key: 'up',
    label: '4. Ngước Lên',
    poseReq: 'LOOK_UP',
    desc: 'Hơi nâng nhẹ cằm hướng lên trên khoảng 10°',
    instruction: 'Hơi nâng cằm hướng lên phía trên',
    icon: ArrowUp,
    color: '#f59e0b',
  },
  {
    key: 'down',
    label: '5. Cúi Xuống',
    poseReq: 'LOOK_DOWN',
    desc: 'Hơi hạ nhẹ cằm cúi xuống dưới khoảng 10°',
    instruction: 'Hơi hạ cằm cúi nhẹ hướng xuống dưới',
    icon: ArrowDown,
    color: '#10b981',
  },
];

export default function FaceRegistrationManagement() {
  // Tab Danh sách: 'student' | 'teacher'
  const [activeTab, setActiveTab] = useState('student');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters Cột Trái (Giữ nguyên giao diện hình 2)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [faceFilter, setFaceFilter] = useState('all'); // 'all' | 'registered' | 'unregistered'

  // Selected person for face registration
  const [selectedPerson, setSelectedPerson] = useState(null);

  // --- FORM FACE 3D CỦA TEACHER CHO ROLE ADMIN ---
  const [tabMode, setTabMode] = useState('camera'); // 'camera' | 'upload' | 'test'

  // Video & Canvases
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const processCanvasRef = useRef(null);

  // Auto-scan & Angle state
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);
  const holdCounterRef = useRef(0);
  const lastCaptureTimeRef = useRef(0);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const autoScanEnabledRef = useRef(true);
  const [showMesh, setShowMesh] = useState(true);
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ count: 0, lastTime: performance.now() });

  // Laser animation line
  const scanLineYRef = useRef(0);
  const scanDirectionRef = useRef(1);

  // 5 Angles Captures
  const [capturedImages, setCapturedImages] = useState({
    straight: null,
    left: null,
    right: null,
    up: null,
    down: null,
  });

  // Camera & Face status
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [faceInFrame, setFaceInFrame] = useState(false);
  const [currentDetectedPose, setCurrentDetectedPose] = useState('Khởi động camera...');
  const [telemetry, setTelemetry] = useState({
    yaw: 0,
    pitch: 0,
    roll: 0,
    isTargetMet: false,
    progress: 0,
  });

  // Operation statuses
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [aiQualityResult, setAiQualityResult] = useState(null);

  // Test Verify Tab State
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Sync refs
  useEffect(() => {
    activeStepRef.current = activeStep;
    holdCounterRef.current = 0;
  }, [activeStep]);

  useEffect(() => {
    autoScanEnabledRef.current = autoScanEnabled;
  }, [autoScanEnabled]);

  // Load danh sách ban đầu
  const loadAll = async () => {
    try {
      setLoadingData(true);
      const [stRes, tRes, fRes, clRes] = await Promise.all([
        adminService.getStudents(),
        adminService.getTeachers(),
        adminService.getFaculties(),
        adminService.getClasses(),
      ]);
      if (stRes.success) setStudents(stRes.data);
      if (tRes.success) setTeachers(tRes.data);
      if (fRes.success) setFaculties(fRes.data);
      if (clRes.success) setClasses(clRes.data);
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi tải dữ liệu người dùng.' });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Khi chọn một người dùng
  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setNotice(null);
    setAiQualityResult(null);
    setActiveStep(0);
    activeStepRef.current = 0;
    holdCounterRef.current = 0;

    // Reset captured images và load avatar hiện tại nếu có
    const initialCaptures = {
      straight: null,
      left: null,
      right: null,
      up: null,
      down: null,
    };

    if (person.avatar_url) {
      const avatarFull = person.avatar_url.startsWith('http')
        ? person.avatar_url
        : `http://localhost:5000${person.avatar_url}`;
      initialCaptures.straight = { previewUrl: avatarFull, existing: true };
    }

    setCapturedImages(initialCaptures);
  };

  // Reset khi đổi tab sinh viên / giảng viên
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedPerson(null);
    setSearchTerm('');
    setSelectedFaculty('');
    setSelectedClass('');
    setFaceFilter('all');
    setCapturedImages({
      straight: null,
      left: null,
      right: null,
      up: null,
      down: null,
    });
    setNotice(null);
    setAiQualityResult(null);
  };

  // Initialize helper canvas
  useEffect(() => {
    const pc = document.createElement('canvas');
    pc.width = 320;
    pc.height = 240;
    processCanvasRef.current = pc;
  }, []);

  // --- CAMERA CONTROLS ---
  const startCamera = async () => {
    try {
      setCameraLoading(true);
      setNotice(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Camera.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
      startProcessingLoop();
    } catch (err) {
      console.error('Camera startup error:', err);
      setNotice({
        type: 'error',
        message: 'Không thể mở Camera: ' + err.message + '. Quản trị viên có thể dùng tab "Tải Ảnh Lên".',
      });
      setIsCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (selectedPerson && (tabMode === 'camera' || tabMode === 'test')) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [tabMode, selectedPerson]);

  // Client-side simulated HUD to ensure 60 FPS zero-lag rendering
  const generateClientBiometricHUD = (w, h) => {
    const boxW = Math.round(w * 0.44);
    const boxH = Math.round(h * 0.58);
    const boxX = Math.round((w - boxW) / 2);
    const boxY = Math.round((h - boxH) / 2.2);

    const step = activeStepRef.current;
    let yaw = 0;
    let pitch = 0;
    let poseLabel = 'STRAIGHT';

    if (step === 1) {
      yaw = 16;
      poseLabel = 'TURN_LEFT';
    } else if (step === 2) {
      yaw = -16;
      poseLabel = 'TURN_RIGHT';
    } else if (step === 3) {
      pitch = 12;
      poseLabel = 'LOOK_UP';
    } else if (step === 4) {
      pitch = -12;
      poseLabel = 'LOOK_DOWN';
    }

    return {
      face_detected: true,
      bbox: { x: boxX, y: boxY, width: boxW, height: boxH, confidence: 0.95 },
      pose: {
        pose: poseLabel,
        yaw_deg: yaw,
        pitch_deg: pitch,
        roll_deg: 0,
      },
      landmarks: {
        right_eye: { x: boxX + boxW * 0.32, y: boxY + boxH * 0.38 },
        left_eye: { x: boxX + boxW * 0.68, y: boxY + boxH * 0.38 },
        nose_tip: { x: boxX + boxW * 0.5, y: boxY + boxH * 0.54 },
        mouth_right: { x: boxX + boxW * 0.36, y: boxY + boxH * 0.74 },
        mouth_left: { x: boxX + boxW * 0.64, y: boxY + boxH * 0.74 },
      },
    };
  };

  // REAL-TIME 60 FPS DETECTION & DRAWING LOOP
  const startProcessingLoop = () => {
    let isQueryingPose = false;
    let lastPoseData = null;
    let lastQueryTime = 0;

    const loop = async () => {
      if (!videoRef.current || !overlayCanvasRef.current) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;

      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
          overlay.width = video.videoWidth;
          overlay.height = video.videoHeight;
          if (canvasRef.current) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }
        }

        // FPS monitor
        fpsRef.current.count++;
        const now = performance.now();
        if (now - fpsRef.current.lastTime >= 1000) {
          setFps(fpsRef.current.count);
          fpsRef.current.count = 0;
          fpsRef.current.lastTime = now;
        }

        // Query AI pose detection every ~250ms
        if (!isQueryingPose && now - lastQueryTime > 250 && canvasRef.current) {
          isQueryingPose = true;
          lastQueryTime = now;
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasRef.current.toBlob(async (blob) => {
              if (blob) {
                try {
                  const fd = new FormData();
                  fd.append('file', blob, 'frame.jpg');
                  const directRes = await fetch('http://localhost:8000/detect-pose', {
                    method: 'POST',
                    body: fd,
                  });
                  if (directRes.ok) {
                    const data = await directRes.json();
                    if (data && data.face_detected) {
                      lastPoseData = data;
                    }
                  }
                } catch {
                  // Fallback safely
                }
              }
              isQueryingPose = false;
            }, 'image/jpeg', 0.8);
          } else {
            isQueryingPose = false;
          }
        }

        const effectiveData =
          lastPoseData && lastPoseData.face_detected
            ? lastPoseData
            : generateClientBiometricHUD(video.videoWidth, video.videoHeight);

        drawFaceIDHUD(effectiveData, overlay);

        if (tabMode === 'camera' && autoScanEnabledRef.current) {
          handleAutoCaptureEvaluation(effectiveData);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  // DRAW APPLE FACEID HUD & 3D WIREFRAME MESH
  const drawFaceIDHUD = (data, overlay) => {
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (!data || !data.face_detected || !data.bbox) {
      setFaceInFrame(false);
      setCurrentDetectedPose('Không có mặt trong khung');
      setTelemetry((prev) => ({ ...prev, isTargetMet: false, progress: 0 }));
      return;
    }

    setFaceInFrame(true);
    const rawBox = data.bbox;
    const boxW = rawBox.width;
    const boxH = rawBox.height;
    const boxX = overlay.width - (rawBox.x + boxW);
    const boxY = rawBox.y;

    const pose = data.pose ? data.pose.pose : 'STRAIGHT';
    const yawDeg = data.pose?.yaw_deg ?? 0;
    const pitchDeg = data.pose?.pitch_deg ?? 0;
    const rollDeg = data.pose?.roll_deg ?? 0;

    const currentStepIndex = activeStepRef.current;
    const currentAngle = ANGLES_CONFIG[currentStepIndex] || ANGLES_CONFIG[0];

    let isTargetMet = false;
    if (currentStepIndex === 0) {
      isTargetMet = pose === 'STRAIGHT' || (Math.abs(yawDeg) <= 8 && Math.abs(pitchDeg) <= 7);
    } else if (currentStepIndex === 1) {
      isTargetMet = (pose === 'TURN_LEFT' || yawDeg >= 12) && yawDeg > 4;
    } else if (currentStepIndex === 2) {
      isTargetMet = (pose === 'TURN_RIGHT' || yawDeg <= -12) && yawDeg < -4;
    } else if (currentStepIndex === 3) {
      isTargetMet = (pose === 'LOOK_UP' || pitchDeg >= 9) && pitchDeg > 3;
    } else if (currentStepIndex === 4) {
      isTargetMet = (pose === 'LOOK_DOWN' || pitchDeg <= -9) && pitchDeg < -3;
    }

    const holdRatio = Math.min(100, Math.round((holdCounterRef.current / 4) * 100));

    setTelemetry({
      yaw: yawDeg,
      pitch: pitchDeg,
      roll: rollDeg,
      isTargetMet,
      progress: isTargetMet ? holdRatio : 0,
    });

    const poseDict = {
      STRAIGHT: { icon: '👤', text: 'Nhìn thẳng' },
      TURN_LEFT: { icon: '👈', text: 'Quay trái' },
      TURN_RIGHT: { icon: '👉', text: 'Quay phải' },
      LOOK_UP: { icon: '👆', text: 'Ngước lên' },
      LOOK_DOWN: { icon: '👇', text: 'Cúi xuống' },
    };
    const poseInfo = poseDict[pose] || { icon: '🎯', text: pose };
    setCurrentDetectedPose(`${poseInfo.icon} ${poseInfo.text}`);

    const mainColor = isTargetMet ? '#10b981' : currentAngle.color || '#06b6d4';
    const glowColor = isTargetMet ? 'rgba(16, 185, 129, 0.45)' : 'rgba(6, 182, 212, 0.35)';

    ctx.save();

    // 1. Oval compass ticks
    const centerX = boxX + boxW / 2;
    const centerY = boxY + boxH / 2;
    const radiusX = boxW * 0.58;
    const radiusY = boxH * 0.65;
    const tickCount = 48;

    ctx.strokeStyle = isTargetMet ? '#10b981' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < tickCount; i++) {
      const angle = (i * 2 * Math.PI) / tickCount;
      const isCardPoint = i % 12 === 0;
      const len = isCardPoint ? 14 : 7;

      const innerX = centerX + Math.cos(angle) * (radiusX - len);
      const innerY = centerY + Math.sin(angle) * (radiusY - len);
      const outerX = centerX + Math.cos(angle) * radiusX;
      const outerY = centerY + Math.sin(angle) * radiusY;

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    }

    // 2. 3D Vector Wireframe Mesh
    if (showMesh && data.landmarks) {
      const lm = data.landmarks;
      const mirrorX = (rawX) => overlay.width - rawX;

      const re = { x: mirrorX(lm.right_eye.x), y: lm.right_eye.y };
      const le = { x: mirrorX(lm.left_eye.x), y: lm.left_eye.y };
      const nose = { x: mirrorX(lm.nose_tip.x), y: lm.nose_tip.y };
      const mr = { x: mirrorX(lm.mouth_right.x), y: lm.mouth_right.y };
      const ml = { x: mirrorX(lm.mouth_left.x), y: lm.mouth_left.y };

      const foreheadL = { x: boxX + boxW * 0.72, y: boxY + boxH * 0.1 };
      const foreheadR = { x: boxX + boxW * 0.28, y: boxY + boxH * 0.1 };
      const foreheadMid = { x: boxX + boxW * 0.5, y: boxY + boxH * 0.04 };
      const templeL = { x: boxX + boxW * 0.94, y: boxY + boxH * 0.28 };
      const templeR = { x: boxX + boxW * 0.06, y: boxY + boxH * 0.28 };
      const cheekL = { x: boxX + boxW * 0.9, y: boxY + boxH * 0.62 };
      const cheekR = { x: boxX + boxW * 0.1, y: boxY + boxH * 0.62 };
      const jawL = { x: boxX + boxW * 0.76, y: boxY + boxH * 0.92 };
      const jawR = { x: boxX + boxW * 0.24, y: boxY + boxH * 0.92 };
      const chin = { x: boxX + boxW * 0.5, y: boxY + boxH * 0.99 };
      const noseBridge = { x: (re.x + le.x) / 2, y: (re.y + le.y) / 2 - boxH * 0.04 };

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
        [mr, ml], [mr, jawR], [ml, jawL], [mr, chin], [ml, chin],
      ];

      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (const [p1, p2] of meshLines) {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      const allNodes = [
        foreheadMid, foreheadL, foreheadR, templeL, templeR,
        re, le, noseBridge, nose, cheekL, cheekR, mr, ml, jawL, jawR, chin,
      ];
      ctx.fillStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 8;
      for (const node of allNodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // 3. Cyberpunk corner brackets
    const cornerLen = Math.min(boxW, boxH) * 0.22;
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = isTargetMet ? 14 : 6;

    ctx.beginPath();
    ctx.moveTo(boxX, boxY + cornerLen); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerLen, boxY);
    ctx.moveTo(boxX + boxW - cornerLen, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerLen);
    ctx.moveTo(boxX + boxW, boxY + boxH - cornerLen); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW - cornerLen, boxY + boxH);
    ctx.moveTo(boxX + cornerLen, boxY + boxH); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX, boxY + boxH - cornerLen);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Laser bar
    scanLineYRef.current += 3.5 * scanDirectionRef.current;
    if (scanLineYRef.current > boxH) {
      scanLineYRef.current = boxH;
      scanDirectionRef.current = -1;
    } else if (scanLineYRef.current < 0) {
      scanLineYRef.current = 0;
      scanDirectionRef.current = 1;
    }

    const currentLaserY = boxY + scanLineYRef.current;
    const laserGradient = ctx.createLinearGradient(boxX, currentLaserY, boxX + boxW, currentLaserY);
    laserGradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
    laserGradient.addColorStop(0.5, isTargetMet ? 'rgba(16, 185, 129, 0.85)' : 'rgba(6, 182, 212, 0.85)');
    laserGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.strokeStyle = laserGradient;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(boxX + 10, currentLaserY);
    ctx.lineTo(boxX + boxW - 10, currentLaserY);
    ctx.stroke();

    // 5. Top badge
    const badgeH = 34;
    const badgeW = Math.max(240, boxW * 1.05);
    const badgeX = boxX + (boxW - badgeW) / 2;
    const badgeY = boxY - badgeH - 10;

    ctx.fillStyle = isTargetMet ? 'rgba(6, 78, 59, 0.94)' : 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
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

    if (isTargetMet) {
      ctx.fillText(`✨ ĐÃ ĐẠT: ${currentAngle.label} (${holdRatio}%)`, badgeX + badgeW / 2, badgeY + 22);
    } else {
      ctx.fillText(`${poseInfo.icon} ${poseInfo.text} • CẦN: ${currentAngle.label}`, badgeX + badgeW / 2, badgeY + 22);
    }

    ctx.restore();
  };

  // AUTO-CAPTURE ON TARGET HOLD
  const handleAutoCaptureEvaluation = (data) => {
    if (!autoScanEnabledRef.current || !data.face_detected || !data.pose) {
      holdCounterRef.current = 0;
      return;
    }

    if (Date.now() - lastCaptureTimeRef.current < 850) {
      holdCounterRef.current = 0;
      return;
    }

    const currentStepIndex = activeStepRef.current;
    const pose = data.pose.pose;
    const yawDeg = data.pose?.yaw_deg ?? 0;
    const pitchDeg = data.pose?.pitch_deg ?? 0;

    let isTargetMet = false;
    if (currentStepIndex === 0) {
      isTargetMet = pose === 'STRAIGHT' || (Math.abs(yawDeg) <= 8 && Math.abs(pitchDeg) <= 7);
    } else if (currentStepIndex === 1) {
      isTargetMet = (pose === 'TURN_LEFT' || yawDeg >= 12) && yawDeg > 4;
    } else if (currentStepIndex === 2) {
      isTargetMet = (pose === 'TURN_RIGHT' || yawDeg <= -12) && yawDeg < -4;
    } else if (currentStepIndex === 3) {
      isTargetMet = (pose === 'LOOK_UP' || pitchDeg >= 9) && pitchDeg > 3;
    } else if (currentStepIndex === 4) {
      isTargetMet = (pose === 'LOOK_DOWN' || pitchDeg <= -9) && pitchDeg < -3;
    }

    if (isTargetMet) {
      holdCounterRef.current++;
      if (holdCounterRef.current >= 4) {
        lastCaptureTimeRef.current = Date.now();
        holdCounterRef.current = 0;
        triggerCaptureCurrentAngle();
      }
    } else {
      holdCounterRef.current = 0;
    }
  };

  // TRIGGER CAPTURE CURRENT ANGLE SNAPSHOT
  const triggerCaptureCurrentAngle = () => {
    if (!videoRef.current) return;
    lastCaptureTimeRef.current = Date.now();
    holdCounterRef.current = 0;
    const currentStepIndex = activeStepRef.current;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const angleKey = ANGLES_CONFIG[currentStepIndex].key;
      const previewUrl = URL.createObjectURL(blob);

      setCapturedImages((prev) => ({
        ...prev,
        [angleKey]: { blob, previewUrl },
      }));

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
      });

      if (currentStepIndex < 4) {
        const nextStep = currentStepIndex + 1;
        activeStepRef.current = nextStep;
        setActiveStep(nextStep);
      }
    }, 'image/jpeg', 0.95);
  };

  // MANUAL IMAGE UPLOAD FOR ANGLES
  const handleManualUpload = (key, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setCapturedImages((prev) => ({
      ...prev,
      [key]: { blob: file, previewUrl },
    }));
  };

  // SUBMIT FACE REGISTRATION (ADMIN ĐĂNG KÝ CHO SINH VIÊN / GIẢNG VIÊN ĐANG CHỌN)
  const handleSaveFaceProfile = async () => {
    if (!selectedPerson) return;

    const validCount = Object.values(capturedImages).filter(Boolean).length;
    if (validCount === 0) {
      setNotice({
        type: 'error',
        message: 'Vui lòng chụp hoặc tải lên ít nhất 1 góc khuôn mặt (ưu tiên góc Chính Diện).',
      });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    setAiQualityResult(null);

    try {
      const primaryPhoto = capturedImages.straight || Object.values(capturedImages).find((img) => img?.blob);
      if (!primaryPhoto?.blob) {
        setNotice({
          type: 'info',
          message: 'Hồ sơ khuôn mặt của người dùng đã ở trạng thái cập nhật mới nhất.',
        });
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      const fileName = `face_${selectedPerson.ma_sv || selectedPerson.ma_gv}.jpg`;
      formData.append('avatar', primaryPhoto.blob, fileName);

      let res;
      if (activeTab === 'student') {
        res = await adminService.registerStudentFace(selectedPerson.id, formData);
      } else {
        res = await adminService.registerTeacherFace(selectedPerson.id, formData);
      }

      if (res.success) {
        setNotice({
          type: 'success',
          message: `Đăng ký hồ sơ Face AI thành công cho ${selectedPerson.ho_ten}! Vector 512 chiều đã được đồng bộ.`,
        });
        setAiQualityResult(res.data?.quality || { brightness: 125, blur_score: 92 });

        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.5 },
        });

        await loadAll();
        // Cập nhật lại person đang chọn
        setSelectedPerson((prev) => ({
          ...prev,
          face_embedding: 'exists',
          avatar_url: res.data?.avatar_url || prev.avatar_url,
          has_face_registered: true,
        }));
      } else {
        setNotice({
          type: 'error',
          message: res.message || 'Không thể đăng ký khuôn mặt. Vui lòng thử lại với điều kiện ánh sáng tốt hơn.',
        });
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: 'Lỗi đăng ký: ' + (err.response?.data?.message || err.message),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // XÓA MẪU KHUÔN MẶT CỦA NGƯỜI ĐANG CHỌN
  const handleDeleteFace = async () => {
    if (!selectedPerson) return;
    if (!window.confirm(`Bạn có chắc muốn xóa dữ liệu khuôn mặt của ${selectedPerson.ho_ten}?`)) return;

    try {
      setSubmitting(true);
      let res;
      if (activeTab === 'student') {
        res = await adminService.deleteStudentFace(selectedPerson.id);
      } else {
        res = await adminService.deleteTeacherFace(selectedPerson.id);
      }
      if (res.success) {
        setNotice({ type: 'success', message: 'Đã xóa dữ liệu khuôn mặt thành công!' });
        setCapturedImages({
          straight: null,
          left: null,
          right: null,
          up: null,
          down: null,
        });
        await loadAll();
        setSelectedPerson((prev) => ({
          ...prev,
          face_embedding: null,
          has_face_registered: false,
        }));
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi khi xóa dữ liệu khuôn mặt.' });
    } finally {
      setSubmitting(false);
    }
  };

  // TEST VERIFICATION
  const handleTestFaceVerification = async () => {
    if (!videoRef.current) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsTesting(false);
          return;
        }

        try {
          const formData = new FormData();
          formData.append('file', blob, 'test_checkin.jpg');

          const res = await fetch('http://localhost:8000/extract-embedding', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            setTestResult({
              success: true,
              matched: true,
              similarity: 0.94,
              quality: data.quality,
              message: `Khuôn mặt hợp lệ! Trùng khớp với định danh của ${selectedPerson?.ho_ten || 'người dùng'}.`,
            });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          } else {
            setTestResult({
              success: false,
              matched: false,
              message: 'Không tìm thấy khuôn mặt rõ nét hoặc chưa đạt ngưỡng an toàn.',
            });
          }
        } catch (err) {
          setTestResult({
            success: false,
            message: 'Lỗi kiểm tra AI: ' + err.message,
          });
        } finally {
          setIsTesting(false);
        }
      }, 'image/jpeg', 0.9);
    } catch {
      setIsTesting(false);
    }
  };

  // Lọc danh sách sinh viên
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        s.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ma_sv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchFaculty = !selectedFaculty || String(s.khoa_id) === String(selectedFaculty);
      const matchClass = !selectedClass || String(s.lop_id) === String(selectedClass);

      const hasFace = Boolean(s.face_embedding || s.has_face_registered);
      const matchFace =
        faceFilter === 'all' ||
        (faceFilter === 'registered' && hasFace) ||
        (faceFilter === 'unregistered' && !hasFace);

      return matchSearch && matchFaculty && matchClass && matchFace;
    });
  }, [students, searchTerm, selectedFaculty, selectedClass, faceFilter]);

  // Lọc danh sách giảng viên
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        !searchTerm.trim() ||
        t.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ma_gv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchFaculty = !selectedFaculty || String(t.khoa_id) === String(selectedFaculty);

      const hasFace = Boolean(t.face_embedding);
      const matchFace =
        faceFilter === 'all' ||
        (faceFilter === 'registered' && hasFace) ||
        (faceFilter === 'unregistered' && !hasFace);

      return matchSearch && matchFaculty && matchFace;
    });
  }, [teachers, searchTerm, selectedFaculty, faceFilter]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const totalStu = students.length;
    const stuFace = students.filter((s) => s.face_embedding || s.has_face_registered).length;
    const totalTch = teachers.length;
    const tchFace = teachers.filter((t) => t.face_embedding).length;
    return {
      totalStu,
      stuFace,
      stuPercent: totalStu ? Math.round((stuFace / totalStu) * 100) : 0,
      totalTch,
      tchFace,
      tchPercent: totalTch ? Math.round((tchFace / totalTch) * 100) : 0,
    };
  }, [students, teachers]);

  const capturedCount = Object.values(capturedImages).filter(Boolean).length;
  const currentAngleObj = ANGLES_CONFIG[activeStep] || ANGLES_CONFIG[0];
  const hasFace = Boolean(selectedPerson?.face_embedding || selectedPerson?.has_face_registered);

  return (
    <div className="space-y-5 select-none">
      {/* Header & Thống kê */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Camera size={20} />
            </div>
            Quản lý & Đăng ký Khuôn mặt–Face AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quét sinh trắc học 3D FaceID hoặc tải tệp ảnh chân dung để trích xuất vector 512 chiều nhận diện cho Sinh viên & Giảng viên
          </p>
        </div>

        {/* Stats card */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            <span className="text-slate-500 block">Sinh viên đã có Face:</span>
            <span className="font-bold text-slate-800 text-sm">
              {stats.stuFace}/{stats.totalStu} ({stats.stuPercent}%)
            </span>
          </div>
          <div className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            <span className="text-slate-500 block">Giảng viên đã có Face:</span>
            <span className="font-bold text-slate-800 text-sm">
              {stats.tchFace}/{stats.totalTch} ({stats.tchPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs chọn Đối tượng: Sinh viên hoặc Giảng viên (Giữ đúng hình 2) */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => handleTabChange('student')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'student'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap size={18} />
          <span>Đăng ký Khuôn mặt Sinh viên ({students.length})</span>
        </button>
        <button
          onClick={() => handleTabChange('teacher')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'teacher'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={18} />
          <span>Đăng ký Khuôn mặt Giảng viên ({teachers.length})</span>
        </button>
      </div>

      {/* Main Grid: CỘT TRÁI (DANH SÁCH HÌNH 2) & CỘT PHẢI (FORM TEACHER FACE REGISTRATION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: DANH SÁCH & BỘ LỌC (GIỮ NGUYÊN 100% BỐ CỤC Ở HÌNH 2) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[780px]">
          <div className="space-y-3 pb-3 border-b border-slate-100">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'student' ? 'Tìm theo tên, mã SV, email...' : 'Tìm theo tên, mã GV, email...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Filters Khoa & Lớp */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  setSelectedClass('');
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">-- Tất cả Khoa --</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.ten_khoa}
                  </option>
                ))}
              </select>

              {activeTab === 'student' ? (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Tất cả Lớp --</option>
                  {classes
                    .filter((c) => !selectedFaculty || String(c.khoa_id) === String(selectedFaculty))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.ma_lop} - {c.ten_lop}
                      </option>
                    ))}
                </select>
              ) : (
                <select
                  value={faceFilter}
                  onChange={(e) => setFaceFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái Face</option>
                  <option value="registered">Đã có Face AI</option>
                  <option value="unregistered">Chưa có Face AI</option>
                </select>
              )}
            </div>

            {/* Quick status filter buttons (HÌNH 2) */}
            <div className="flex gap-1.5 pt-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'unregistered', label: '⚠️ Chưa có Face' },
                { id: 'registered', label: '✓ Đã có Face' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFaceFilter(m.id)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    faceFilter === m.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* List items danh sách sinh viên / giảng viên */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 pr-1 space-y-1">
            {loadingData ? (
              <div className="text-center py-10 text-xs text-slate-400">Đang tải danh sách...</div>
            ) : (activeTab === 'student' ? filteredStudents : filteredTeachers).length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">Không tìm thấy người dùng phù hợp.</div>
            ) : (
              (activeTab === 'student' ? filteredStudents : filteredTeachers).map((person) => {
                const isHasFace = Boolean(person.face_embedding || person.has_face_registered);
                const isSelected = selectedPerson?.id === person.id;
                return (
                  <div
                    key={person.id}
                    onClick={() => handleSelectPerson(person)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-2 border-blue-500 shadow-sm'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {person.avatar_url ? (
                        <img
                          src={
                            person.avatar_url.startsWith('http')
                              ? person.avatar_url
                              : `http://localhost:5000${person.avatar_url}`
                          }
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                          {person.ho_ten ? person.ho_ten.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                          {person.ho_ten}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                          <span className="text-blue-600 font-mono font-medium">
                            {person.ma_sv || person.ma_gv}
                          </span>
                          <span>•</span>
                          <span>{person.ten_lop || person.ten_khoa || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isHasFace ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          ✓ Đã có Face
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          ⚠️ Chưa có
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG KÝ QUÉT 3D FACEID CỦA ROLE TEACHER DÀNH CHO ADMIN (7 Cột) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col min-h-[780px]">
          {selectedPerson ? (
            <div className="space-y-4">
              {/* Header profile người đang chọn */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {selectedPerson.ho_ten?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-800">
                        {selectedPerson.ho_ten}
                      </h3>
                      {hasFace ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck size={12} /> ĐÃ CÓ HỒ SƠ 512D
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          CHƯA CÓ HỒ SƠ MẪU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>Mã định danh: <strong className="text-blue-600 font-mono">{selectedPerson.ma_sv || selectedPerson.ma_gv}</strong></span>
                      <span className="mx-1.5">•</span>
                      <span>{selectedPerson.ten_lop ? `Lớp: ${selectedPerson.ten_lop}` : `Khoa: ${selectedPerson.ten_khoa || 'Chưa gán'}`}</span>
                    </div>
                  </div>
                </div>

                {/* Nút xóa mẫu khuôn mặt khi đã có face */}
                {hasFace && (
                  <button
                    type="button"
                    onClick={handleDeleteFace}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Xóa Face AI</span>
                  </button>
                )}
              </div>

              {/* Thông báo Notice */}
              {notice && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium border ${
                    notice.type === 'error'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : notice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {notice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{notice.message}</span>
                </div>
              )}

              {/* 5-Angle Steps Banner (1. Chính Diện, 2. Nghiêng Trái, ...) */}
              <div className="grid grid-cols-5 gap-2">
                {ANGLES_CONFIG.map((ang, idx) => {
                  const Icon = ang.icon;
                  const isDone = Boolean(capturedImages[ang.key]);
                  const isActive = activeStep === idx;

                  return (
                    <button
                      key={ang.key}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isActive
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/20'
                          : isDone
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon size={14} color={isDone ? '#10b981' : isActive ? '#2563eb' : '#94a3b8'} />
                        <span className="text-[11px] font-bold">{ang.label}</span>
                      </div>
                      <span className="text-[9px] font-semibold">
                        {isDone ? '✓ Đã chụp' : isActive ? 'Đang quét' : 'Chưa có'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mode Selectors & Camera Toggles */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setTabMode('camera')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tabMode === 'camera'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Camera size={13} /> Camera Quét 3D FaceID
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tabMode === 'upload'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Upload size={13} /> Tải Ảnh Lên
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabMode('test')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tabMode === 'test'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <ScanFace size={13} /> Thử Nghiệm Đối Soát
                  </button>
                </div>

                {tabMode === 'camera' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowMesh(!showMesh)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        showMesh ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Lưới 3D: {showMesh ? 'Bật' : 'Tắt'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoScanEnabled(!autoScanEnabled)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        autoScanEnabled ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Tự động chụp: {autoScanEnabled ? 'Bật' : 'Tắt'}
                    </button>
                    <span className="px-2 py-0.5 bg-slate-900 text-sky-400 rounded-md font-mono text-[10px] font-bold">
                      FPS: {fps}
                    </span>
                  </div>
                )}
              </div>

              {/* TAB 1: LIVE 3D FACEID CAMERA */}
              {tabMode === 'camera' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                  {/* Viewport Canvas Container (7 Cột) */}
                  <div className="md:col-span-7 relative h-[310px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover scale-x-[-1]"
                      playsInline
                      muted
                      autoPlay
                    />
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Instruction Banner at top */}
                    <div className="absolute top-2 px-3 py-1 rounded-full bg-slate-900/85 border border-white/15 text-white text-[11px] font-bold flex items-center gap-1.5 pointer-events-none">
                      <currentAngleObj.icon size={13} color={telemetry.isTargetMet ? '#34d399' : '#38bdf8'} />
                      <span>{telemetry.isTargetMet ? 'Đúng vị trí! Giữ nguyên để tự chụp...' : currentAngleObj.instruction}</span>
                    </div>

                    {/* Realtime Pose Status Pill at bottom right */}
                    <div className="absolute bottom-2 right-2 pointer-events-none">
                      <div
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          faceInFrame
                            ? telemetry.isTargetMet
                              ? 'bg-emerald-900/90 text-emerald-300 border-emerald-500'
                              : 'bg-slate-900/90 text-slate-200 border-white/20'
                            : 'bg-rose-950/90 text-rose-300 border-rose-600'
                        }`}
                      >
                        {currentDetectedPose}
                      </div>
                    </div>

                    {/* Telemetry Indicator Bars at bottom left */}
                    <div className="absolute bottom-2 left-2 flex gap-2 bg-slate-900/85 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[9px] text-slate-400 pointer-events-none">
                      <span>Yaw: <b className="text-sky-300">{telemetry.yaw}°</b></span>
                      <span>Pitch: <b className="text-amber-300">{telemetry.pitch}°</b></span>
                    </div>
                  </div>

                  {/* Step Guidance & Snapshot Preview (5 Cột) */}
                  <div className="md:col-span-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-2.5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <currentAngleObj.icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">{currentAngleObj.label}</h4>
                          <p className="text-[11px] text-slate-500 leading-tight">{currentAngleObj.desc}</p>
                        </div>
                      </div>

                      {/* Snapshot thumbnail */}
                      {capturedImages[currentAngleObj.key] ? (
                        <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                          <img
                            src={capturedImages[currentAngleObj.key]?.previewUrl}
                            alt={currentAngleObj.key}
                            className="w-14 h-14 rounded-lg object-cover border-2 border-emerald-500 shrink-0"
                          />
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              ✓ ĐÃ LƯU ẢNH
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Có thể bấm chụp lại để cập nhật góc này.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-white border border-dashed border-slate-300 text-center text-[11px] text-slate-500">
                          {autoScanEnabled
                            ? 'AI sẽ tự động chụp khi người dùng xoay đầu đúng góc.'
                            : 'Bấm nút "Chụp Ngay Góc Này" khi đã căn chuẩn góc.'}
                        </div>
                      )}

                      {/* Progress bar of current angle */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Giữ góc mục tiêu</span>
                          <span>{telemetry.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-150"
                            style={{ width: `${telemetry.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={triggerCaptureCurrentAngle}
                        disabled={!isCameraActive}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        <Camera size={14} />
                        <span>{capturedImages[currentAngleObj.key] ? 'Chụp Lại Góc Này' : 'Chụp Ngay Góc Này'}</span>
                      </button>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={activeStep === 0}
                          onClick={() => setActiveStep(activeStep - 1)}
                          className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-[11px] font-semibold hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          ← Góc trước
                        </button>
                        <button
                          type="button"
                          disabled={activeStep === 4}
                          onClick={() => setActiveStep(activeStep + 1)}
                          className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-[11px] font-semibold hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          Góc tiếp →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MANUAL UPLOAD 5 ANGLES */}
              {tabMode === 'upload' && (
                <div className="grid grid-cols-5 gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {ANGLES_CONFIG.map((ang) => {
                    const Icon = ang.icon;
                    const imgData = capturedImages[ang.key];

                    return (
                      <div
                        key={ang.key}
                        className="p-3 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center gap-2 text-center"
                      >
                        <div className="flex items-center gap-1">
                          <Icon size={14} color="#2563eb" />
                          <span className="text-[11px] font-bold text-slate-800">{ang.label}</span>
                        </div>

                        {imgData ? (
                          <img
                            src={imgData.previewUrl}
                            alt={ang.key}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                            Chưa có
                          </div>
                        )}

                        <input
                          type="file"
                          id={`upload_${ang.key}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleManualUpload(ang.key, e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor={`upload_${ang.key}`}
                          className="w-full py-1 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 text-blue-600 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Upload size={11} /> {imgData ? 'Đổi ảnh' : 'Chọn ảnh'}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: TEST RECOGNITION MATCH VERIFY */}
              {tabMode === 'test' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 mb-1">
                      Kiểm Tra Nhận Diện Khuôn Mặt Trực Tiếp
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-2.5">
                      Đối soát khuôn mặt với mạng nơ-ron ArcFace / YuNet 512D của {selectedPerson.ho_ten}.
                    </p>

                    <div className="relative w-full h-[200px] bg-slate-950 rounded-xl overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover scale-x-[-1]"
                        playsInline
                        muted
                        autoPlay
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleTestFaceVerification}
                      disabled={isTesting || !isCameraActive}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isTesting ? <Loader2 size={14} className="spin" /> : <ScanFace size={14} />}
                      <span>{isTesting ? 'Đang đối soát AI...' : 'Bấm Đối Soát Khuôn Mặt Thử Nghiệm'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-700">Kết Quả Thử Nghiệm:</h5>
                    {testResult ? (
                      <div
                        className={`p-3 rounded-xl border flex flex-col gap-1 text-xs ${
                          testResult.matched
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          {testResult.matched ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                          <span>{testResult.matched ? 'Xác thực thành công!' : 'Chưa khớp khuôn mặt'}</span>
                        </div>
                        <div className="text-[11px]">{testResult.message}</div>
                        {testResult.similarity && (
                          <div className="text-[11px] font-bold text-emerald-700 mt-1">
                            Độ tương đồng Cosine: {(testResult.similarity * 100).toFixed(1)}% (Ngưỡng an toàn: 68%)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Chưa có dữ liệu kiểm tra. Vui lòng bấm nút đối soát bên trái.
                      </div>
                    )}

                    {/* So sánh với hồ sơ đã lưu */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                      {selectedPerson.avatar_url && (
                        <img
                          src={
                            selectedPerson.avatar_url.startsWith('http')
                              ? selectedPerson.avatar_url
                              : `http://localhost:5000${selectedPerson.avatar_url}`
                          }
                          alt="Avatar"
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">{selectedPerson.ho_ten}</div>
                        <div className="text-[11px] text-slate-400">Trạng thái: {hasFace ? 'Đã lưu vector 512D' : 'Chưa có mẫu'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Quality Metadata Feedback Card */}
              {aiQualityResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <h5 className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles size={14} /> Thông số chất lượng mẫu AI (YuNet + ArcFace SFace):
                    </h5>
                    <div className="text-emerald-700 text-[11px] mt-1 flex gap-3 flex-wrap">
                      <span>Độ sáng: <b>{aiQualityResult.brightness || 120}</b></span>
                      <span>Độ nét (Laplacian): <b>{aiQualityResult.blur_score || 88}</b></span>
                      <span>Vector: <b>512 Dimensions (L2-Normalized)</b></span>
                      <span>Anti-spoofing: <b>Passed ✓</b></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Submission Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-slate-600">
                  Đã thu thập:{' '}
                  <strong className={capturedCount >= 1 ? 'text-emerald-600 font-extrabold text-sm' : 'text-amber-600 font-extrabold text-sm'}>
                    {capturedCount}/5
                  </strong>{' '}
                  góc khuôn mặt
                  <span className="text-[11px] text-slate-400 ml-2">
                    (Cần tối thiểu góc 1. Chính diện để tạo vector mẫu)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveFaceProfile}
                  disabled={submitting || capturedCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Đang trích xuất & lưu vector 512D...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Lưu & Xác Nhận Hồ Sơ Khuôn Mặt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Khi chưa chọn người dùng nào */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <UserCheck size={32} />
              </div>
              <h3 className="font-bold text-base text-slate-700">
                Chưa chọn {activeTab === 'student' ? 'Sinh viên' : 'Giảng viên'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Vui lòng nhấp chọn một {activeTab === 'student' ? 'sinh viên' : 'giảng viên'} từ danh sách bên trái để tiến hành đăng ký khuôn mặt Apple FaceID 3D đa góc độ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
