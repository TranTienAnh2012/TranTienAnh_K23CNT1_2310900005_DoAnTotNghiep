import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import StudentDetailModal from './StudentDetailModal';
import StudentEditModal from './StudentEditModal';
import StudentDeleteModal from './StudentDeleteModal';
import {
  GraduationCap,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Building2,
  Sparkles,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  // Modal thêm sinh viên (chỉ thông tin, không tạo tài khoản)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalFacultyId, setModalFacultyId] = useState('');
  const [form, setForm] = useState({
    ma_sv: '',
    ho_ten: '',
    ngay_sinh: '2005-01-15',
    gioi_tinh: 'Nam',
    email: '',
    lop_id: ''
  });

  // Modal 3 nghiệp vụ: Details, Edit, Delete
  const [detailStudent, setDetailStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, fRes] = await Promise.all([
        adminService.getStudents(),
        adminService.getClasses(),
        adminService.getFaculties()
      ]);
      if (sRes.success) setStudents(sRes.data || []);
      if (cRes.success) {
        setClasses(cRes.data || []);
        if (cRes.data?.length > 0 && !form.lop_id) {
          setForm((prev) => ({ ...prev, lop_id: cRes.data[0].id }));
        }
      }
      if (fRes?.success) {
        setFaculties(fRes.data || []);
        if (fRes.data?.length > 0 && !modalFacultyId) {
          setModalFacultyId(fRes.data[0].id);
        }
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ma_sv: form.ma_sv.trim(),
        ho_ten: form.ho_ten.trim(),
        ngay_sinh: form.ngay_sinh,
        gioi_tinh: form.gioi_tinh,
        email: form.email.trim(),
        lop_id: form.lop_id
      };
      const res = await adminService.createStudent(payload);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCreateModalOpen(false);
        setForm({
          ma_sv: '',
          ho_ten: '',
          ngay_sinh: '2005-01-15',
          gioi_tinh: 'Nam',
          email: '',
          lop_id: classes[0]?.id || ''
        });
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  // Lớp thuộc khoa đang chọn ở Bộ lọc trang chính
  const availableClasses = selectedFaculty === 'all'
    ? classes
    : classes.filter((c) => String(c.khoa_id) === String(selectedFaculty));

  // Lớp thuộc khoa đang chọn ở Modal Thêm sinh viên
  const modalAvailableClasses = modalFacultyId
    ? classes.filter((c) => String(c.khoa_id) === String(modalFacultyId))
    : classes;

  // Lọc danh sách sinh viên theo Khoa & Lớp
  const displayStudents = students.filter((s) => {
    const matchFaculty =
      selectedFaculty === 'all' ||
      String(s.khoa_id) === String(selectedFaculty);
    const matchClass =
      selectedClass === 'all' ||
      String(s.lop_id) === String(selectedClass);
    return matchFaculty && matchClass;
  });

  const totalCount = students.length;
  const faceRegisteredCount = students.filter((s) => s.has_face_registered || s.face_embedding).length;
  const activeCount = students.filter((s) => s.is_active !== false).length;

  // Cấu hình cột chế độ Bảng (Table View)
  const columns = [
    {
      header: 'Mã SV',
      accessor: 'ma_sv',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 tracking-tight text-xs sm:text-sm">
          {row.ma_sv}
        </span>
      )
    },
    {
      header: 'Họ và Tên',
      accessor: 'ho_ten',
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-100 flex-shrink-0">
            {row.ho_ten ? row.ho_ten.charAt(0) : 'S'}
          </div>
          <div>
            <div className="font-bold text-slate-900 whitespace-nowrap">{row.ho_ten}</div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap">
              {row.gioi_tinh === 'Nam' ? 'Nam' : row.gioi_tinh === 'Nu' ? 'Nữ' : 'Khác'} •{' '}
              {row.ngay_sinh ? new Date(row.ngay_sinh).toLocaleDateString('vi-VN') : ''}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Khoa',
      accessor: 'ten_khoa',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-md font-medium whitespace-nowrap">
          <Building2 size={13} className="text-teal-600 shrink-0" />
          {row.ten_khoa || 'Chưa gán khoa'}
        </span>
      )
    },
    {
      header: 'Lớp',
      accessor: 'ten_lop',
      render: (row) => (
        <span className="text-slate-700 text-xs sm:text-sm font-semibold whitespace-nowrap">
          {row.ten_lop || 'Chưa phân lớp'}
        </span>
      )
    },
    {
      header: 'Email & Tài khoản',
      accessor: 'email',
      render: (row) => (
        <div className="min-w-[150px]">
          <div className="text-xs text-slate-700 whitespace-nowrap">{row.email}</div>
          <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">@{row.username || row.ma_sv}</div>
        </div>
      )
    },
    {
      header: 'Khuôn mặt-FaceAI',
      render: (row) => {
        const hasFace = row.has_face_registered || row.face_embedding;
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${hasFace
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
          >
            {hasFace ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {hasFace ? 'Đã kích hoạt' : 'Chưa đăng ký'}
          </span>
        );
      }
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${row.is_active !== false
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
        >
          {row.is_active !== false ? 'Đang học' : 'Nghỉ/Bảo lưu'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDetailStudent(row)}
            title="Xem chi tiết"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditStudent(row)}
            title="Chỉnh sửa"
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteStudent(row)}
            title="Xóa hồ sơ"
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  // Render thẻ dạng Dòng (List View)
  const renderListItem = (item) => {
    const hasFace = item.has_face_registered || item.face_embedding;
    return (
      <div className="flex items-center justify-between p-4 sm:px-5 bg-white rounded-xl border border-slate-200 gap-4 flex-wrap shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-150">
        <div className="flex items-center gap-3.5 min-w-[220px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 flex-shrink-0">
            {item.ho_ten ? item.ho_ten.charAt(0) : 'S'}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{item.ho_ten}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Mã SV: <strong className="text-blue-600 font-semibold">{item.ma_sv}</strong> • {item.ten_lop || 'Chưa gán lớp'}
              <span className="ml-2 text-teal-700 bg-teal-50 border border-teal-200/70 px-1.5 py-0.5 rounded text-[11px] font-medium">
                {item.ten_khoa || 'Chưa gán khoa'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="text-xs text-slate-600">
            <div className="text-slate-800 font-medium">{item.email}</div>
            <div className="text-slate-400 font-mono text-[11px]">User: @{item.username || item.ma_sv}</div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${hasFace
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
          >
            {hasFace ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {hasFace ? 'FaceAI đã sẵn sàng' : 'Chưa Face'}
          </span>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.is_active !== false
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
          >
            {item.is_active !== false ? 'Đang theo học' : 'Tạm dừng'}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDetailStudent(item)}
              title="Xem chi tiết"
              className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Eye size={13} /> Chi tiết
            </button>
            <button
              onClick={() => setEditStudent(item)}
              title="Chỉnh sửa"
              className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <Edit2 size={13} /> Sửa
            </button>
            <button
              onClick={() => setDeleteStudent(item)}
              title="Xóa hồ sơ"
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render thẻ dạng Hộp (Box/Grid View)
  const renderBoxItem = (item) => {
    const hasFace = item.has_face_registered || item.face_embedding;
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
        <div>
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base border border-blue-100 flex-shrink-0">
              {item.ho_ten ? item.ho_ten.charAt(0) : 'S'}
            </div>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${hasFace
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
            >
              {hasFace ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
              {hasFace ? 'FaceAI OK' : 'Chưa Face'}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900 mb-1 truncate">
            {item.ho_ten}
          </div>
          <div className="text-xs text-slate-500 mb-3">
            Mã SV: <span className="font-semibold text-slate-800">{item.ma_sv}</span>
          </div>

          <div className="text-xs text-slate-600 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
            <div className="truncate">
              <span className="text-slate-400 font-medium">Khoa:</span>{' '}
              <span className="text-teal-700 font-semibold">{item.ten_khoa || 'Chưa gán khoa'}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-400 font-medium">Lớp:</span>{' '}
              <span className="font-medium text-slate-800">{item.ten_lop || 'Chưa gán lớp'}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-400 font-medium">Email:</span>{' '}
              <span className="text-slate-700">{item.email}</span>
            </div>
            <div className="truncate font-mono text-[11px]">
              <span className="text-slate-400">Tài khoản:</span> @{item.username || item.ma_sv}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.is_active !== false
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
          >
            {item.is_active !== false ? 'Đang học' : 'Nghỉ'}
          </span>

          <div className="flex gap-1.5">
            <button
              onClick={() => setDetailStudent(item)}
              title="Xem chi tiết"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Eye size={13} />
            </button>
            <button
              onClick={() => setEditStudent(item)}
              title="Chỉnh sửa"
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setDeleteStudent(item)}
              title="Xóa hồ sơ"
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng số sinh viên</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đã đăng ký FaceAI</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{faceRegisteredCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đang theo học</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{activeCount}</div>
          </div>
        </div>
      </div>

      {/* Main DataView with Table/List/Box */}
      <DataView
        title="Quản lý Sinh viên"
        subtitle="Danh sách sinh viên, trạng thái kích hoạt dữ liệu FaceAI và phân lớp"
        data={displayStudents}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        loading={loading}
        searchKeys={['ho_ten', 'ma_sv', 'email', 'ten_lop', 'ten_khoa']}
        searchPlaceholder="Tìm kiếm sinh viên theo tên, mã SV, email, lớp, khoa..."
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
          >
            <UserPlus size={15} /> <span>Thêm Sinh viên</span>
          </button>
        }
        filters={
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setSelectedClass('all');
              }}
              className="py-2 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer min-w-[160px]"
            >
              <option value="all">Tất cả Khoa / Viện ({faculties.length})</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ten_khoa}
                </option>
              ))}
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer min-w-[160px]"
            >
              <option value="all">
                {selectedFaculty === 'all'
                  ? `Tất cả các lớp (${classes.length})`
                  : `Tất cả lớp thuộc khoa (${availableClasses.length})`}
              </option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ten_lop}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Modal Thêm sinh viên (Hồ sơ học thuật, không tạo tài khoản ở đây) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Hồ sơ Sinh viên mới"
      >
        <form onSubmit={handleCreateStudent} className="space-y-3.5">
          {/* Thông báo phân định rõ luồng tài khoản */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-800 text-xs leading-relaxed">
            💡 <strong>Hệ thống nội bộ:</strong> Thêm hồ sơ sinh viên tại đây không yêu cầu tạo tài khoản. Tài khoản đăng nhập sẽ được cấp riêng và tập trung tại mục <strong>Quản lý Tài khoản Hệ thống</strong>.
          </div>

          {/* Chọn Khoa & Lớp liên hoàn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khoa / Viện đào tạo *
              </label>
              <select
                value={modalFacultyId}
                onChange={(e) => {
                  const fId = e.target.value;
                  setModalFacultyId(fId);
                  const filtered = classes.filter((c) => String(c.khoa_id) === String(fId));
                  if (filtered.length > 0) {
                    setForm((prev) => ({ ...prev, lop_id: filtered[0].id }));
                  } else {
                    setForm((prev) => ({ ...prev, lop_id: '' }));
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                required
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.ten_khoa} ({f.ma_khoa})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lớp sinh hoạt *
              </label>
              <select
                value={form.lop_id}
                onChange={(e) => setForm({ ...form, lop_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                required
              >
                <option value="">-- Chọn lớp học --</option>
                {modalAvailableClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ten_lop} ({c.khoa_hoc || c.ma_lop})
                  </option>
                ))}
              </select>
              {modalAvailableClasses.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">Khoa này hiện chưa có lớp học nào.</p>
              )}
            </div>
          </div>

          {/* Mã SV & Họ tên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Sinh viên (MSSV) *
              </label>
              <input
                type="text"
                required
                placeholder="vd: 2310900005"
                value={form.ma_sv}
                onChange={(e) => setForm({ ...form, ma_sv: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và Tên *
              </label>
              <input
                type="text"
                required
                placeholder="vd: Trần Tiến Anh"
                value={form.ho_ten}
                onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Ngày sinh & Giới tính */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={form.ngay_sinh}
                onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giới tính
              </label>
              <select
                value={form.gioi_tinh}
                onChange={(e) => setForm({ ...form, gioi_tinh: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Khac">Khác</option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email sinh viên *
            </label>
            <input
              type="email"
              required
              placeholder="tienanh.tran@smartedu.edu.vn"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
            >
              Lưu Hồ sơ Sinh viên
            </button>
          </div>
        </form>
      </Modal>

      {/* 3 Popups: Details, Edit, Delete */}
      <StudentDetailModal
        isOpen={Boolean(detailStudent)}
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
        onEdit={(s) => setEditStudent(s)}
      />

      <StudentEditModal
        isOpen={Boolean(editStudent)}
        student={editStudent}
        classes={classes}
        onClose={() => setEditStudent(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Cập nhật sinh viên thành công!' });
          loadData();
        }}
      />

      <StudentDeleteModal
        isOpen={Boolean(deleteStudent)}
        student={deleteStudent}
        onClose={() => setDeleteStudent(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Đã xóa sinh viên thành công!' });
          loadData();
        }}
      />
    </div>
  );
}
