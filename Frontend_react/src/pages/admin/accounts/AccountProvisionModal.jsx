import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
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
  Check,
  FileSpreadsheet,
  Download,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function AccountProvisionModal({ isOpen, onClose, onSuccess, initialMode = 'single' }) {
  const [role, setRole] = useState('student'); // 'student' | 'teacher' | 'admin'
  const [provisionMode, setProvisionMode] = useState('single'); // 'single' | 'bulk'

  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);

  // Form states - Single mode
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

  // Excel states - Bulk mode
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load danh sách Khoa & Lớp khi mở modal
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessResult(null);
      setBulkResult(null);
      setCopied(false);
      setExcelFile(null);
      setExcelData([]);
      setProvisionMode(initialMode || 'single');
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
  }, [isOpen, initialMode]);

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

  // 1. Submit Single Provision
  const handleSubmitSingle = async (e) => {
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

  // 2. Download File Excel Mẫu
  const handleDownloadTemplate = () => {
    const defaultClassName = filteredClasses[0]?.ma_lop || 'K23CNT1';
    const sampleRows = [
      {
        'STT': 1,
        'Mã sinh viên (MSSV) (*)': '231090001',
        'Họ và tên (*)': 'Nguyễn Văn An',
        'Mã lớp': defaultClassName,
        'Ngày sinh (YYYY-MM-DD)': '2005-01-15',
        'Giới tính': 'Nam',
        'Email': '231090001@smartedu.edu.vn',
        'Tên đăng nhập': '231090001',
        'Mật khẩu': '123456'
      },
      {
        'STT': 2,
        'Mã sinh viên (MSSV) (*)': '231090002',
        'Họ và tên (*)': 'Trần Thị Bình',
        'Mã lớp': defaultClassName,
        'Ngày sinh (YYYY-MM-DD)': '2005-05-20',
        'Giới tính': 'Nữ',
        'Email': '231090002@smartedu.edu.vn',
        'Tên đăng nhập': '231090002',
        'Mật khẩu': '123456'
      },
      {
        'STT': 3,
        'Mã sinh viên (MSSV) (*)': '231090003',
        'Họ và tên (*)': 'Lê Hoàng Cường',
        'Mã lớp': filteredClasses[1]?.ma_lop || 'K23CNT2',
        'Ngày sinh (YYYY-MM-DD)': '2005-09-10',
        'Giới tính': 'Nam',
        'Email': '231090003@smartedu.edu.vn',
        'Tên đăng nhập': '231090003',
        'Mật khẩu': '123456'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 22 },
      { wch: 12 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Cap_Tai_Khoan');
    XLSX.writeFile(wb, 'SmartEdu_Mau_Cap_Tai_Khoan_Sinh_Vien.xlsx');
  };

  // 3. Parse Excel file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
    setIsParsingExcel(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setError('File Excel tải lên không có dữ liệu.');
          setIsParsingExcel(false);
          return;
        }

        const findField = (row, candidates) => {
          const keys = Object.keys(row);
          for (const cand of candidates) {
            const matchedKey = keys.find((k) => k.trim().toLowerCase().includes(cand.toLowerCase()));
            if (matchedKey && row[matchedKey] !== '') {
              return String(row[matchedKey]).trim();
            }
          }
          return '';
        };

        const parsedList = rawJson.map((row, idx) => {
          const ma_sv = findField(row, ['mã sinh viên', 'mssv', 'mã sv', 'masv', 'ma_sv', 'student_id', 'code']);
          const ho_ten = findField(row, ['họ và tên', 'họ tên', 'hoten', 'ho_ten', 'full_name', 'name', 'tên']);
          const ma_lop = findField(row, ['mã lớp', 'malop', 'ma_lop', 'class_code', 'lớp', 'lop']);
          const rawDob = findField(row, ['ngày sinh', 'ngaysinh', 'ngay_sinh', 'dob', 'birth']);
          const gioi_tinh = findField(row, ['giới tính', 'gioitinh', 'gioi_tinh', 'gender', 'phái']);
          const email = findField(row, ['email', 'thư điện tử', 'mail']);
          const username = findField(row, ['tên đăng nhập', 'username', 'tài khoản', 'tai_khoan']);
          const password = findField(row, ['mật khẩu', 'password', 'pass', 'mat_khau']);

          let formattedDob = '2005-01-01';
          if (rawDob) {
            try {
              const d = new Date(rawDob);
              if (!isNaN(d.getTime())) {
                formattedDob = d.toISOString().split('T')[0];
              }
            } catch {
              formattedDob = '2005-01-01';
            }
          }

          const resolvedUsername = (username || ma_sv || `sv_${idx + 1}`).toLowerCase();
          const resolvedPassword = password || '123456';
          const resolvedEmail = email || (ma_sv ? `${ma_sv.toLowerCase()}@smartedu.edu.vn` : '');

          return {
            stt: idx + 1,
            ma_sv,
            ho_ten,
            ma_lop,
            ngay_sinh: formattedDob,
            gioi_tinh: gioi_tinh || 'Nam',
            email: resolvedEmail,
            username: resolvedUsername,
            password: resolvedPassword,
            isValid: Boolean(ma_sv && ho_ten)
          };
        });

        setExcelData(parsedList);
      } catch (err) {
        console.error(err);
        setError('Không thể đọc file Excel. Vui lòng kiểm tra lại cấu trúc file.');
      } finally {
        setIsParsingExcel(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 4. Submit Bulk Provisioning
  const handleBulkSubmit = async () => {
    if (excelData.length === 0) {
      setError('Vui lòng tải lên file Excel có dữ liệu sinh viên.');
      return;
    }

    const validRows = excelData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setError('Không tìm thấy dòng dữ liệu sinh viên nào hợp lệ trong file Excel.');
      return;
    }

    if (!selectedClassId && !validRows.some((r) => r.ma_lop)) {
      setError('Vui lòng chọn Lớp học mặc định hoặc đảm bảo file Excel có cột Mã lớp.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        students: validRows.map((r) => ({
          ma_sv: r.ma_sv,
          ho_ten: r.ho_ten,
          ma_lop: r.ma_lop,
          ngay_sinh: r.ngay_sinh,
          gioi_tinh: r.gioi_tinh,
          email: r.email,
          username: r.username,
          password: r.password
        })),
        default_lop_id: selectedClassId ? Number(selectedClassId) : null
      };

      const res = await adminService.bulkProvisionUsers(payload);
      if (res?.success) {
        setBulkResult(res);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi cấp tài khoản hàng loạt.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Export Provisioned Accounts to Excel
  const handleExportResultExcel = () => {
    if (!bulkResult?.successList || bulkResult.successList.length === 0) return;
    const exportRows = bulkResult.successList.map((item, idx) => ({
      'STT': idx + 1,
      'Mã sinh viên (MSSV)': item.ma_sv,
      'Họ và tên': item.ho_ten,
      'Lớp sinh hoạt': item.ten_lop || item.ma_lop,
      'Tên đăng nhập (Username)': item.username,
      'Mật khẩu khởi tạo': item.password,
      'Trạng thái': 'Đã cấp thành công'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 25 },
      { wch: 20 },
      { wch: 22 },
      { wch: 18 },
      { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TaiKhoanDaCap');
    XLSX.writeFile(wb, `SmartEdu_DanhSach_TaiKhoan_DaCap_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (!isOpen) return null;

  const validCount = excelData.filter((r) => r.isValid).length;
  const invalidCount = excelData.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-white w-full ${
          provisionMode === 'bulk' && role === 'student' ? 'max-w-4xl' : 'max-w-2xl'
        } rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] transition-all`}
      >
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
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* SINGLE MODE SUCCESS SCREEN */}
          {successResult ? (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Cấp Tài khoản Thành Công!</h4>
                <p className="text-xs text-slate-500 mt-1">{successResult.message}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-100 max-w-md mx-auto text-left space-y-2 text-sm shadow-xs font-mono">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-sans">Người dùng:</span>
                  <span className="font-bold text-slate-800">{successResult.ho_ten}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-sans">Tên đăng nhập:</span>
                  <span className="font-bold text-blue-600">@{successResult.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Mật khẩu:</span>
                  <span className="font-bold text-emerald-600">{successResult.password}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép thông tin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessResult(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Tiếp tục cấp thêm
                </button>
              </div>
            </div>
          ) : bulkResult ? (
            /* BULK MODE SUCCESS SCREEN */
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  Hoàn tất quá trình Cấp tài khoản hàng loạt!
                </h4>
                <p className="text-xs text-slate-600 mt-1">{bulkResult.message}</p>

                <div className="flex justify-center gap-4 mt-3">
                  <div className="px-3.5 py-1.5 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    Thành công: {bulkResult.summary?.successCount || 0}
                  </div>
                  {bulkResult.summary?.failedCount > 0 && (
                    <div className="px-3.5 py-1.5 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-bold">
                      Thất bại: {bulkResult.summary?.failedCount || 0}
                    </div>
                  )}
                </div>
              </div>

              {/* Bảng kết quả thành công */}
              {bulkResult.successList?.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">
                      Danh sách tài khoản vừa cấp ({bulkResult.successList.length} SV)
                    </span>
                    <button
                      type="button"
                      onClick={handleExportResultExcel}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <Download size={13} /> Xuất File Excel (.xlsx)
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">MSSV</th>
                          <th className="py-2 px-3">Họ và tên</th>
                          <th className="py-2 px-3">Lớp</th>
                          <th className="py-2 px-3">Tài khoản</th>
                          <th className="py-2 px-3">Mật khẩu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkResult.successList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-medium text-slate-800">{item.ma_sv}</td>
                            <td className="py-2 px-3 font-medium text-slate-800">{item.ho_ten}</td>
                            <td className="py-2 px-3 text-slate-600">{item.ten_lop || item.ma_lop}</td>
                            <td className="py-2 px-3 font-mono text-blue-600 font-semibold">@{item.username}</td>
                            <td className="py-2 px-3 font-mono text-emerald-600">{item.password}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Danh sách lỗi nếu có */}
              {bulkResult.failedList?.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Danh sách bản ghi không hợp lệ ({bulkResult.failedList.length}):
                  </div>
                  <ul className="list-disc list-inside text-rose-700 space-y-1 max-h-36 overflow-y-auto">
                    {bulkResult.failedList.map((f, idx) => (
                      <li key={idx}>
                        Dòng {f.row} ({f.ma_sv} - {f.ho_ten}): <span className="font-medium">{f.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setBulkResult(null);
                    setExcelFile(null);
                    setExcelData([]);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-xs transition-all cursor-pointer"
                >
                  Nhập file khác
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  Hoàn tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            /* MAIN FORM (SINGLE OR BULK) */
            <div className="space-y-5">
              {/* 1. Chọn Role (Sinh viên / Giảng viên / Quản trị viên) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  1. Chọn Loại Tài Khoản Cần Cấp <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
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
                    onClick={() => {
                      setRole('teacher');
                      setProvisionMode('single');
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
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
                    onClick={() => {
                      setRole('admin');
                      setProvisionMode('single');
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
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

              {/* Nút chuyển đổi chế độ Cấp đơn lẻ vs Import Excel cho Sinh viên */}
              {role === 'student' && (
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/90 gap-1">
                  <button
                    type="button"
                    onClick={() => setProvisionMode('single')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      provisionMode === 'single'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus size={15} />
                    <span>Cấp thủ công (1 sinh viên)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvisionMode('bulk')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      provisionMode === 'bulk'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <FileSpreadsheet size={15} />
                    <span>Import File Excel (Cấp hàng loạt)</span>
                  </button>
                </div>
              )}

              {/* 2. Đơn vị Khoa & Lớp (Dùng chung cho cả 2 mode) */}
              {role !== 'admin' && (
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                      <Building2 size={16} className="text-indigo-600" />
                      2. Đơn vị Đào tạo & Quản lý
                    </div>
                    {provisionMode === 'bulk' && role === 'student' && (
                      <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        * Áp dụng khi file Excel không có cột mã lớp
                      </span>
                    )}
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
                          Lớp sinh hoạt {provisionMode === 'bulk' ? 'mặc định' : ''} <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                          required={provisionMode === 'single'}
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

              {/* BULK EXCEL MODE VIEW */}
              {role === 'student' && provisionMode === 'bulk' ? (
                <div className="space-y-4">
                  {/* Banner hướng dẫn & Tải file mẫu */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 p-4 rounded-xl border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <FileSpreadsheet size={18} className="text-emerald-600" />
                        <span>Cấp tài khoản hàng loạt bằng file Excel</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Hỗ trợ file định dạng <b>.xlsx, .xls</b>. Hệ thống tự động nhận diện các cột: <b>MSSV, Họ tên, Mã lớp, Ngày sinh, Giới tính, Email, Mật khẩu</b>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Download size={14} className="text-emerald-600" />
                      <span>Tải file Excel mẫu</span>
                    </button>
                  </div>

                  {/* Dropzone Upload */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 text-sm">
                        {excelFile ? excelFile.name : 'Nhấp vào đây để chọn file Excel sinh viên'}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {excelFile
                          ? `Kích thước: ${(excelFile.size / 1024).toFixed(1)} KB (Bấm để chọn file khác)`
                          : 'Hỗ trợ các file .xlsx hoặc .xls tiêu chuẩn'}
                      </p>
                    </div>
                  </div>

                  {/* Preview danh sách đọc được */}
                  {isParsingExcel ? (
                    <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <RotateCcw className="animate-spin text-emerald-600" size={16} />
                      Đang phân tích dữ liệu file Excel...
                    </div>
                  ) : excelData.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
                      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <FileCheck size={16} className="text-emerald-600" />
                          <span className="text-xs font-bold text-slate-700">
                            Xem trước dữ liệu ({excelData.length} dòng đọc được)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Hợp lệ: {validCount}
                          </span>
                          {invalidCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                              Lỗi/Thiếu dữ liệu: {invalidCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">STT</th>
                              <th className="py-2 px-3">Mã SV (MSSV)</th>
                              <th className="py-2 px-3">Họ và tên</th>
                              <th className="py-2 px-3">Lớp gán</th>
                              <th className="py-2 px-3">Username dự kiến</th>
                              <th className="py-2 px-3">Mật khẩu</th>
                              <th className="py-2 px-3 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {excelData.map((row, idx) => (
                              <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                                <td className="py-2 px-3 text-slate-500">{row.stt}</td>
                                <td className="py-2 px-3 font-mono font-bold text-slate-800">
                                  {row.ma_sv || <span className="text-rose-500">(Trống)</span>}
                                </td>
                                <td className="py-2 px-3 font-medium text-slate-800">
                                  {row.ho_ten || <span className="text-rose-500">(Trống)</span>}
                                </td>
                                <td className="py-2 px-3">
                                  {row.ma_lop ? (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                                      {row.ma_lop}
                                    </span>
                                  ) : selectedClassId ? (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                      Lớp mặc định
                                    </span>
                                  ) : (
                                    <span className="text-rose-500">Chưa có lớp</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-mono text-blue-600">@{row.username}</td>
                                <td className="py-2 px-3 font-mono text-slate-600">{row.password}</td>
                                <td className="py-2 px-3 text-center">
                                  {row.isValid ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                      <CheckCircle2 size={13} /> Sẵn sàng
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                                      <AlertCircle size={13} /> Thiếu TT
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

                  {/* Actions for Bulk */}
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkSubmit}
                      disabled={loading || validCount === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <UserPlus size={15} />
                      {loading
                        ? 'Đang cấp tài khoản hàng loạt...'
                        : `Xác nhận cấp ${validCount} tài khoản sinh viên`}
                    </button>
                  </div>
                </div>
              ) : (
                /* SINGLE FORM MODE */
                <form onSubmit={handleSubmitSingle} className="space-y-4">
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
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-sm transition-all cursor-pointer"
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
          )}
        </div>
      </div>
    </div>
  );
}
