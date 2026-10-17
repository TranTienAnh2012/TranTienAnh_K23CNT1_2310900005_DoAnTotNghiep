import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Building2,
  GraduationCap,
  Users,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function AccountProvisionModal({ isOpen, onClose, onSuccess }) {
  const [role, setRole] = useState('student'); // 'student' | 'teacher' | 'admin'
  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);

  // Form states
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [maDinhDanh, setMaDinhDanh] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [ngaySinh, setNgaySinh] = useState('2005-01-15');
  const [gioiTinh, setGioiTinh] = useState('Nam');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load danh sách Khoa & Lớp khi mở modal
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessResult(null);
      setCopied(false);
      resetForm();

      const loadMeta = async () => {
        try {
          const [facRes, clsRes] = await Promise.all([
            adminService.getFaculties(),
            adminService.getClasses()
          ]);
          if (facRes?.data) {
            setFaculties(facRes.data);
            if (facRes.data.length > 0) {
              setSelectedFacultyId(facRes.data[0].id);
            }
          }
          if (clsRes?.data) {
            setClasses(clsRes.data);
          }
        } catch (err) {
          console.error('Lỗi tải danh mục Khoa/Lớp:', err);
        }
      };
      loadMeta();
    }
  }, [isOpen]);

  // Lọc danh sách Lớp theo Khoa đã chọn
  useEffect(() => {
    if (selectedFacultyId && classes.length > 0) {
      const cls = classes.filter((c) => String(c.khoa_id) === String(selectedFacultyId));
      setFilteredClasses(cls);
      if (cls.length > 0) {
        setSelectedClassId(cls[0].id);
      } else {
        setSelectedClassId('');
      }
    } else {
      setFilteredClasses([]);
      setSelectedClassId('');
    }
  }, [selectedFacultyId, classes]);

  const resetForm = () => {
    setRole('student');
    setHoTen('');
    setMaDinhDanh('');
    setUsername('');
    setPassword('123456');
    setEmail('');
    setNgaySinh('2005-01-15');
    setGioiTinh('Nam');
  };

  // Tự động gợi ý username & email khi nhập Mã SV/GV
  const handleMaChange = (val) => {
    const code = val.trim().toLowerCase();
    setMaDinhDanh(val);
    if (!username || username === maDinhDanh.toLowerCase()) {
      setUsername(code);
    }
    if (!email || email === `${maDinhDanh.toLowerCase()}@smartedu.edu.vn`) {
      setEmail(code ? `${code}@smartedu.edu.vn` : '');
    }
  };

  const handleGeneratePassword = () => {
    const randomPass = Math.floor(100000 + Math.random() * 900000).toString();
    setPassword(randomPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !hoTen.trim()) {
      setError('Vui lòng nhập đầy đủ Tên tài khoản và Họ tên người dùng.');
      return;
    }

    if (role === 'teacher' && !selectedFacultyId) {
      setError('Vui lòng chọn Khoa công tác cho Giảng viên.');
      return;
    }

    if (role === 'student' && !selectedClassId) {
      setError('Vui lòng chọn Lớp học cho Sinh viên.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role,
        username: username.trim(),
        password: password.trim() || '123456',
        ho_ten: hoTen.trim(),
        email: email.trim() || `${username.trim()}@smartedu.edu.vn`,
        ma_dinh_danh: maDinhDanh.trim() || username.trim(),
        khoa_id: selectedFacultyId ? Number(selectedFacultyId) : null,
        lop_id: selectedClassId ? Number(selectedClassId) : null,
        ngay_sinh: ngaySinh,
        gioi_tinh: gioiTinh
      };

      const res = await adminService.provisionUser(payload);
      if (res?.success) {
        setSuccessResult({
          username: payload.username,
          password: payload.password,
          ho_ten: payload.ho_ten,
          role: payload.role,
          message: res.message
        });
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cấp tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successResult) return;
    const text = `Tài khoản SmartEdu:\n- Tên đăng nhập: ${successResult.username}\n- Mật khẩu: ${successResult.password}\n- Người dùng: ${successResult.ho_ten}\n- Hệ thống: http://localhost:5173`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <UserPlus size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Cấp Tài khoản Nội bộ Mới</h3>
              <p className="text-xs text-blue-100">
                Tạo và phân quyền tài khoản cho Sinh viên, Giảng viên theo đúng Khoa & Lớp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            /* Màn hình thông báo cấp thành công & Cho phép Copy tài khoản */
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Cấp Tài khoản Thành Công!</h4>
                <p className="text-sm text-slate-600 mt-1">{successResult.message}</p>
              </div>

              <div className="bg-white border border-emerald-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2.5 shadow-xs font-mono text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-sans">
                  <span className="text-slate-500 text-xs">Họ và tên:</span>
                  <span className="font-semibold text-slate-800">{successResult.ho_ten}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans text-xs">Tên đăng nhập (Username):</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {successResult.username}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans text-xs">Mật khẩu khởi tạo:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    {successResult.password}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Đã sao chép!' : 'Sao chép thông tin tài khoản'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessResult(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition-all"
                >
                  Cấp tài khoản khác
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Chọn Đối tượng / Vai trò */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  1. Chọn Loại tài khoản cần cấp <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      role === 'student'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <GraduationCap size={24} className={role === 'student' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className="text-sm font-bold mt-1.5">Sinh viên</span>
                    <span className="text-[11px] text-slate-400">Học theo Lớp/Khoa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      role === 'teacher'
                        ? 'border-blue-500 bg-blue-50/60 text-blue-800 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Users size={24} className={role === 'teacher' ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-sm font-bold mt-1.5">Giảng viên</span>
                    <span className="text-[11px] text-slate-400">Giảng dạy theo Khoa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      role === 'admin'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-800 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Shield size={24} className={role === 'admin' ? 'text-amber-600' : 'text-slate-400'} />
                    <span className="text-sm font-bold mt-1.5">Quản trị viên</span>
                    <span className="text-[11px] text-slate-400">Toàn quyền hệ thống</span>
                  </button>
                </div>
              </div>

              {/* 2. Đơn vị Khoa & Lớp (Tránh nhầm lẫn tối đa) */}
              {role !== 'admin' && (
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    <Building2 size={16} className="text-indigo-600" />
                    2. Đơn vị Đào tạo & Quản lý
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Khoa / Viện đào tạo <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                        required
                      >
                        <option value="">-- Chọn Khoa phụ trách --</option>
                        {faculties.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.ten_khoa} ({f.ma_khoa})
                          </option>
                        ))}
                      </select>
                    </div>

                    {role === 'student' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Lớp sinh hoạt <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                          required
                          disabled={!selectedFacultyId || filteredClasses.length === 0}
                        >
                          <option value="">-- Chọn Lớp học --</option>
                          {filteredClasses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.ten_lop} ({c.ma_lop})
                            </option>
                          ))}
                        </select>
                        {selectedFacultyId && filteredClasses.length === 0 && (
                          <p className="text-[11px] text-amber-600 mt-1">
                            * Khoa này hiện chưa có lớp học nào. Hãy tạo Lớp trước.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Thông tin Định danh Cá nhân */}
              <div className="space-y-3.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  3. Thông tin Định danh & Cá nhân
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Họ và Tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={hoTen}
                      onChange={(e) => setHoTen(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                      required
                    />
                  </div>

                  {role !== 'admin' ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {role === 'student' ? 'Mã Sinh viên (MSSV)' : 'Mã Giảng viên (MSGV)'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={role === 'student' ? 'Ví dụ: 2310900005' : 'Ví dụ: GV01'}
                        value={maDinhDanh}
                        onChange={(e) => handleMaChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Chức vụ / Bộ phận</label>
                      <input
                        type="text"
                        placeholder="Quản trị Hệ thống / Ban CNTT"
                        value={maDinhDanh}
                        onChange={(e) => setMaDinhDanh(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={ngaySinh}
                        onChange={(e) => setNgaySinh(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Giới tính</label>
                      <div className="flex items-center gap-4 py-2">
                        {['Nam', 'Nữ'].map((gt) => (
                          <label key={gt} className="flex items-center gap-1.5 text-sm cursor-pointer text-slate-700">
                            <input
                              type="radio"
                              name="gioi_tinh"
                              value={gt}
                              checked={gioiTinh === gt}
                              onChange={(e) => setGioiTinh(e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            {gt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Tài khoản Đăng nhập & Mật khẩu khởi tạo */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    <KeyRound size={16} className="text-amber-600" />
                    4. Thông tin Đăng nhập Hệ thống
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Mật khẩu mặc định: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">123456</code>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tên tài khoản (Username) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="vd: sv01 hoặc 2310900005"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email trường</label>
                    <input
                      type="email"
                      placeholder="name@smartedu.edu.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-600">
                      Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <Sparkles size={13} />
                      Tạo ngẫu nhiên
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-sm transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <UserPlus size={16} />
                  {loading ? 'Đang cấp tài khoản...' : 'Cấp tài khoản ngay'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
