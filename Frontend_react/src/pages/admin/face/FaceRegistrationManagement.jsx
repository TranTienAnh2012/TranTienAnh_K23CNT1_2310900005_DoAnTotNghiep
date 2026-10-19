import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Camera,
  Upload,
  UserCheck,
  GraduationCap,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Trash2,
  RefreshCw,
  Building,
  KeyRound,
  Eye,
  Check
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import Notification from '../../../components/common/Notification';
import { useWebcam } from '../../../hooks/useWebcam';

export default function FaceRegistrationManagement() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'teacher'
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [faceFilter, setFaceFilter] = useState('all'); // 'all' | 'registered' | 'unregistered'

  // Selected person for face registration
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Capture mode: 'camera' | 'upload'
  const [captureMode, setCaptureMode] = useState('camera');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [processingAi, setProcessingAi] = useState(false);
  const [notice, setNotice] = useState(null);

  // Camera hook
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, capturePhotoBlob } = useWebcam();
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadAll = async () => {
    try {
      setLoadingData(true);
      const [stRes, tRes, fRes, clRes] = await Promise.all([
        adminService.getStudents(),
        adminService.getTeachers(),
        adminService.getFaculties(),
        adminService.getClasses()
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

  // Tự động bật camera khi chọn mode camera và có selectedPerson
  useEffect(() => {
    if (captureMode === 'camera' && selectedPerson) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captureMode, selectedPerson, startCamera, stopCamera]);

  // Reset khi đổi tab sinh viên / giảng viên
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedPerson(null);
    setSearchTerm('');
    setSelectedFaculty('');
    setSelectedClass('');
    setFaceFilter('all');
    resetCapture();
  };

  const resetCapture = () => {
    setCapturedBlob(null);
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedPreview(null);
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    resetCapture();
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
      tchPercent: totalTch ? Math.round((tchFace / totalTch) * 100) : 0
    };
  }, [students, teachers]);

  // Xử lý chụp từ Webcam
  const handleSnapCamera = async () => {
    const blob = await capturePhotoBlob();
    if (blob) {
      setCapturedBlob(blob);
      setCapturedPreview(URL.createObjectURL(blob));
    }
  };

  const handleRetakeCamera = () => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedBlob(null);
    setCapturedPreview(null);
    startCamera();
  };

  // Xử lý chọn tệp từ máy tính
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', message: 'Vui lòng chọn tệp hình ảnh định dạng JPG, PNG hoặc WebP!' });
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  // Submit đăng ký khuôn mặt
  const handleSubmitFace = async () => {
    if (!selectedPerson) return;

    let imageToUpload = null;
    let fileName = 'face_capture.jpg';

    if (captureMode === 'camera') {
      if (!capturedBlob) {
        setNotice({ type: 'error', message: 'Vui lòng bấm chụp ảnh khuôn mặt trước khi lưu!' });
        return;
      }
      imageToUpload = capturedBlob;
      fileName = `face_${selectedPerson.ma_sv || selectedPerson.ma_gv}.jpg`;
    } else {
      if (!selectedFile) {
        setNotice({ type: 'error', message: 'Vui lòng chọn tệp ảnh chân dung từ máy tính!' });
        return;
      }
      imageToUpload = selectedFile;
      fileName = selectedFile.name;
    }

    try {
      setProcessingAi(true);
      setNotice(null);

      const formData = new FormData();
      formData.append('avatar', imageToUpload, fileName);

      let res;
      if (activeTab === 'student') {
        res = await adminService.registerStudentFace(selectedPerson.id, formData);
      } else {
        res = await adminService.registerTeacherFace(selectedPerson.id, formData);
      }

      if (res.success) {
        setNotice({
          type: 'success',
          message: res.message || 'Đăng ký dữ liệu khuôn mặt thành công! Vector 512 chiều đã được lưu trữ.'
        });
        resetCapture();
        await loadAll();
        // Cập nhật lại thông tin selectedPerson
        setSelectedPerson((prev) =>
          prev ? { ...prev, avatar_url: res.data?.avatar_url, face_embedding: 'yes' } : null
        );
      } else {
        setNotice({ type: 'error', message: res.message || 'Không thể trích xuất khuôn mặt.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || err.message || 'Lỗi khi trích xuất Face AI.' });
    } finally {
      setProcessingAi(false);
    }
  };

  // Xóa khuôn mặt mẫu
  const handleDeleteFace = async () => {
    if (!selectedPerson) return;
    if (!window.confirm(`Bạn có chắc muốn xóa dữ liệu khuôn mặt mẫu của ${selectedPerson.ho_ten}?`)) return;

    try {
      setProcessingAi(true);
      let res;
      if (activeTab === 'student') {
        res = await adminService.deleteStudentFace(selectedPerson.id);
      } else {
        res = await adminService.deleteTeacherFace(selectedPerson.id);
      }

      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        await loadAll();
        setSelectedPerson((prev) =>
          prev ? { ...prev, face_embedding: null, has_face_registered: false } : null
        );
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi xóa khuôn mặt.' });
    } finally {
      setProcessingAi(false);
    }
  };

  const isPersonRegistered = selectedPerson && (selectedPerson.face_embedding || selectedPerson.has_face_registered);

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto p-4 sm:p-6">
      {notice && (
        <Notification type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
      )}

      {/* Header & Thống kê */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Camera size={20} />
            </div>
            Quản lý & Đăng ký Khuôn mặt (Face AI)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chụp trực tiếp từ Webcam hoặc tải tệp ảnh chân dung để trích xuất vector 512 chiều nhận diện cho Sinh viên & Giảng viên
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

      {/* Tabs chọn Đối tượng: Sinh viên hoặc Giảng viên */}
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

      {/* Main Grid: Cột trái (Danh sách) & Cột phải (Bàn điều khiển Camera/Upload) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: DANH SÁCH & BỘ LỌC (5 Cột) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[750px]">
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

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  setSelectedClass('');
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
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
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
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
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái Face</option>
                  <option value="registered">Đã có Face AI</option>
                  <option value="unregistered">Chưa có Face AI</option>
                </select>
              )}
            </div>

            {activeTab === 'student' && (
              <div className="flex gap-1.5 pt-1">
                {['all', 'unregistered', 'registered'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFaceFilter(mode)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      faceFilter === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode === 'all' && 'Tất cả'}
                    {mode === 'unregistered' && '⚠️ Chưa có Face'}
                    {mode === 'registered' && '✓ Đã có Face'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 pr-1 space-y-1">
            {loadingData ? (
              <div className="text-center py-10 text-xs text-slate-400">Đang tải danh sách...</div>
            ) : (activeTab === 'student' ? filteredStudents : filteredTeachers).length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">Không tìm thấy người dùng phù hợp.</div>
            ) : (
              (activeTab === 'student' ? filteredStudents : filteredTeachers).map((person) => {
                const hasFace = Boolean(person.face_embedding || person.has_face_registered);
                const isSelected = selectedPerson?.id === person.id;
                return (
                  <div
                    key={person.id}
                    onClick={() => handleSelectPerson(person)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border border-blue-200 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {person.avatar_url ? (
                          <img
                            src={`http://localhost:5000${person.avatar_url}`}
                            alt={person.ho_ten}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {person.ho_ten?.charAt(0) || 'U'}
                          </div>
                        )}
                        {hasFace && (
                          <span
                            title="Đã có dữ liệu Face AI"
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center text-[9px]"
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                          {person.ho_ten}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                          <span className="font-mono font-medium text-blue-600">
                            {person.ma_sv || person.ma_gv}
                          </span>
                          <span>•</span>
                          <span>{person.ten_lop || person.ten_khoa || 'Chưa gán'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {hasFace ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold rounded-md">
                          <CheckCircle2 size={11} /> Đã có Face
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold rounded-md">
                          <AlertCircle size={11} /> Chưa có
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI: BÀN ĐIỀU KHIỂN ĐĂNG KÝ FACE AI (7 Cột) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[750px]">
          {selectedPerson ? (
            <div className="space-y-5">
              {/* Card thông tin người đang được chọn */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    {selectedPerson.avatar_url ? (
                      <img
                        src={`http://localhost:5000${selectedPerson.avatar_url}`}
                        alt={selectedPerson.ho_ten}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                        {selectedPerson.ho_ten?.charAt(0) || 'U'}
                      </div>
                    )}
                    {isPersonRegistered && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900">
                        {selectedPerson.ho_ten}
                      </h3>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                        {selectedPerson.ma_sv || selectedPerson.ma_gv}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {selectedPerson.email} • {selectedPerson.ten_khoa || 'Chưa gán Khoa'}
                      {selectedPerson.ten_lop ? ` (${selectedPerson.ten_lop})` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPersonRegistered ? (
                    <button
                      onClick={handleDeleteFace}
                      disabled={processingAi}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Xóa Face AI</span>
                    </button>
                  ) : (
                    <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-semibold flex items-center gap-1">
                      <AlertCircle size={13} /> Cần nạp khuôn mặt
                    </span>
                  )}
                </div>
              </div>

              {/* Lựa chọn phương thức nạp: Camera vs Tải file */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCaptureMode('camera')}
                  className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    captureMode === 'camera'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera size={16} /> Chụp trực tiếp từ Webcam
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode('upload')}
                  className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    captureMode === 'upload'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload size={16} /> Tải tệp ảnh từ máy tính
                </button>
              </div>

              {/* KHUNG THAO TÁC 1: WEBCAM */}
              {captureMode === 'camera' && (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] max-w-md mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-md flex items-center justify-center">
                    {capturedPreview ? (
                      <img
                        src={capturedPreview}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Khung Oval hướng dẫn căn chỉnh chính diện */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-[190px] h-[240px] rounded-[50%] border-2 border-dashed border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center">
                            <span className="text-[11px] font-semibold text-cyan-200/90 bg-slate-900/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Căn khuôn mặt vào đây
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {cameraError && !capturedPreview && (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center text-red-400 text-xs">
                        <AlertCircle size={24} className="mb-2" />
                        <span>{cameraError}</span>
                      </div>
                    )}
                  </div>

                  {/* Nút điều khiển camera */}
                  <div className="flex items-center justify-center gap-3">
                    {capturedPreview ? (
                      <button
                        type="button"
                        onClick={handleRetakeCamera}
                        disabled={processingAi}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <RefreshCw size={15} /> Chụp lại
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSnapCamera}
                        disabled={!isStreaming || processingAi}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <Camera size={16} /> Chụp ảnh chân dung
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* KHUNG THAO TÁC 2: FILE UPLOAD */}
              {captureMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {filePreview ? (
                      <div className="space-y-3">
                        <img
                          src={filePreview}
                          alt="Preview upload"
                          className="w-32 h-32 rounded-2xl object-cover mx-auto border-2 border-blue-500 shadow-md"
                        />
                        <p className="text-xs font-semibold text-blue-600">
                          {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(1)} KB)
                        </p>
                        <span className="text-[11px] text-slate-400">Bấm để chọn ảnh khác</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                          <Upload size={24} />
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700">
                          Kéo thả hoặc bấm để chọn tệp ảnh chân dung
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Định dạng hỗ trợ: JPG, PNG, WebP (Rõ nét, đủ ánh sáng, góc nhìn thẳng)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nút hành động chính: Bắt đầu trích xuất & Lưu Face AI */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" />
                  <span>Face AI sẽ tự động phân tích vector 512 chiều & đánh giá chất lượng</span>
                </div>

                <button
                  onClick={handleSubmitFace}
                  disabled={processingAi || (captureMode === 'camera' && !capturedBlob) || (captureMode === 'upload' && !selectedFile)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>{processingAi ? 'Đang phân tích Face AI...' : 'Trích xuất & Lưu Face AI'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Khi chưa chọn người dùng nào */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Users size={32} />
              </div>
              <h3 className="font-bold text-base text-slate-700">
                Chưa chọn {activeTab === 'student' ? 'Sinh viên' : 'Giảng viên'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Vui lòng nhấp chọn một {activeTab === 'student' ? 'sinh viên' : 'giảng viên'} từ danh sách bên trái để tiến hành chụp ảnh hoặc tải tệp mẫu khuôn mặt
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
