import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Notification from '../../../components/common/Notification';
import AccountDetailModal from './AccountDetailModal';
import AccountEditModal from './AccountEditModal';
import AccountDeleteModal from './AccountDeleteModal';
import AccountProvisionModal from './AccountProvisionModal';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  RotateCcw,
  Building2,
  GraduationCap,
  Users,
  Shield,
  ScanFace,
  Filter,
  Check,
  Copy,
  FileSpreadsheet
} from 'lucide-react';

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  // Bộ lọc nâng cao để tránh nhầm lẫn giữa các khoa / lớp
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [provisionInitialMode, setProvisionInitialMode] = useState('single');
  const [detailAccount, setDetailAccount] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);

  // Modal xác nhận Reset Password
  const [resetModalAccount, setResetModalAccount] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [resetSuccessInfo, setResetSuccessInfo] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, fRes, cRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getFaculties(),
        adminService.getClasses()
      ]);
      if (uRes?.success) setUsers(uRes.data || []);
      if (fRes?.data) setFaculties(fRes.data || []);
      if (cRes?.data) setClasses(cRes.data || []);
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi khi tải dữ liệu người dùng.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lọc danh sách Lớp theo Khoa đã chọn trong bộ lọc
  const availableClasses = useMemo(() => {
    if (selectedFaculty === 'all') return classes;
    return classes.filter((c) => String(c.khoa_id) === String(selectedFaculty));
  }, [selectedFaculty, classes]);

  // Reset filter lớp nếu khoa thay đổi
  const handleFacultyFilterChange = (val) => {
    setSelectedFaculty(val);
    setSelectedClass('all');
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await adminService.toggleUserActive(id);
      if (res?.success) {
        setNotice({ type: 'success', message: res.message });
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_active: res.is_active } : u))
        );
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi thay đổi trạng thái tài khoản.' });
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resetModalAccount) return;
    try {
      setResetting(true);
      const res = await adminService.resetUserPassword(resetModalAccount.id, { newPassword: '123456' });
      if (res?.success) {
        setResetSuccessInfo({
          username: resetModalAccount.username,
          ho_ten: resetModalAccount.ho_ten,
          password: res.newPassword || '123456'
        });
        setNotice({ type: 'success', message: res.message });
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || err.message });
      setResetModalAccount(null);
    } finally {
      setResetting(false);
    }
  };

  // Áp dụng bộ lọc đa tầng
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Lọc theo Vai trò
      if (selectedRole !== 'all' && u.role !== selectedRole) return false;
      // 2. Lọc theo Khoa
      if (selectedFaculty !== 'all') {
        if (String(u.khoa_id) !== String(selectedFaculty)) return false;
      }
      // 3. Lọc theo Lớp
      if (selectedClass !== 'all') {
        if (String(u.lop_id) !== String(selectedClass)) return false;
      }
      // 4. Lọc theo Trạng thái
      if (selectedStatus === 'active' && !u.is_active) return false;
      if (selectedStatus === 'locked' && u.is_active) return false;

      return true;
    });
  }, [users, selectedRole, selectedFaculty, selectedClass, selectedStatus]);

  // Thống kê nhanh
  const totalCount = users.length;
  const teacherCount = users.filter((u) => u.role === 'teacher').length;
  const studentCount = users.filter((u) => u.role === 'student').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const activeCount = users.filter((u) => u.is_active).length;
  const lockedCount = totalCount - activeCount;

  const roleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Shield size={11} /> Admin
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 size={11} /> Giảng viên
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <GraduationCap size={11} /> Sinh viên
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {role}
          </span>
        );
    }
  };

  // Cấu hình cột hiển thị cho DataView Table
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-semibold text-slate-500 text-xs">#{row.id}</span>
      )
    },
    {
      header: 'Tên tài khoản',
      accessor: 'username',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">
            <KeyRound size={15} />
          </div>
          <div>
            <div className="font-bold text-slate-900 font-mono text-sm leading-tight">@{row.username}</div>
            {row.ma_dinh_danh && row.ma_dinh_danh !== row.username && (
              <span className="text-[11px] text-slate-500 font-medium">Mã: {row.ma_dinh_danh}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Chủ sở hữu & Email',
      accessor: 'ho_ten',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{row.ho_ten || '---'}</div>
          <div className="text-xs text-slate-500 truncate max-w-[200px]">{row.email || 'Chưa cập nhật email'}</div>
        </div>
      )
    },
    {
      header: 'Vai trò (Role)',
      accessor: 'role',
      render: (row) => roleBadge(row.role)
    },
    {
      header: 'Khoa & Lớp',
      accessor: 'ten_khoa',
      render: (row) => (
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/70 text-indigo-700 text-xs font-medium border border-indigo-100 max-w-[220px] truncate">
            <Building2 size={11} className="shrink-0" />
            <span className="truncate">{row.ten_khoa || 'Hệ thống'}</span>
          </div>
          {row.ten_lop && (
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                <GraduationCap size={10} className="shrink-0" />
                Lớp: {row.ten_lop}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Face AI',
      accessor: 'has_face_registered',
      render: (row) => {
        if (row.role === 'admin') {
          return <span className="text-xs text-slate-400">---</span>;
        }
        return row.has_face_registered ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 size={12} /> Đã đăng ký
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
            <ScanFace size={12} /> Chưa quét
          </span>
        );
      }
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row.id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
            row.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
          title={row.is_active ? 'Nhấn để khóa tài khoản' : 'Nhấn để mở khóa'}
        >
          {row.is_active ? <CheckCircle2 size={12} /> : <Lock size={12} />}
          {row.is_active ? 'Hoạt động' : 'Đã khóa'}
        </button>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setResetModalAccount(row)}
            title="Đặt lại mật khẩu về mặc định (123456)"
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setDetailAccount(row)}
            title="Xem chi tiết"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setEditAccount(row)}
            title="Chỉnh sửa & Đổi mật khẩu"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteAccount(row)}
            title="Xóa tài khoản"
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  // Render dạng Danh sách dòng (List View)
  const renderListItem = (item) => (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-[240px]">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
          {item.ho_ten ? item.ho_ten.charAt(0).toUpperCase() : item.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">{item.ho_ten || item.username}</h4>
            {roleBadge(item.role)}
          </div>
          <div className="text-xs text-indigo-600 font-mono font-medium mt-0.5">
            @{item.username} {item.ma_dinh_danh && `• Mã: ${item.ma_dinh_danh}`}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{item.email || 'Chưa có email'}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{item.ten_khoa || 'Hệ thống'}</div>
          {item.ten_lop && <div className="text-emerald-700 font-medium">Lớp: {item.ten_lop}</div>}
        </div>

        <button
          onClick={() => handleToggleActive(item.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {item.is_active ? <CheckCircle2 size={13} /> : <Lock size={13} />}
          {item.is_active ? 'Hoạt động' : 'Đã khóa'}
        </button>

        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
          <button
            onClick={() => setResetModalAccount(item)}
            title="Reset mật khẩu về 123456"
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setDetailAccount(item)}
            title="Chi tiết"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => setEditAccount(item)}
            title="Sửa"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteAccount(item)}
            title="Xóa"
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // Render dạng Hộp lưới (Box View)
  const renderBoxItem = (item) => (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Card Header */}
      <div className="p-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {item.ho_ten ? item.ho_ten.charAt(0).toUpperCase() : item.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{item.ho_ten || item.username}</h4>
              <p className="text-xs text-indigo-600 font-mono font-medium mt-0.5">@{item.username}</p>
              {item.ma_dinh_danh && item.ma_dinh_danh !== item.username && (
                <span className="text-[11px] text-slate-500">Mã: {item.ma_dinh_danh}</span>
              )}
            </div>
          </div>
          {roleBadge(item.role)}
        </div>
      </div>

      {/* Body Card */}
      <div className="p-4 space-y-2.5 text-xs flex-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Khoa / Viện:</span>
          <span className="font-semibold text-slate-800 text-right truncate max-w-[150px]">{item.ten_khoa || 'Hệ thống'}</span>
        </div>
        {item.ten_lop && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Lớp sinh hoạt:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {item.ten_lop}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Email:</span>
          <span className="text-slate-700 truncate max-w-[150px]">{item.email || 'Chưa cập nhật'}</span>
        </div>
        {item.role !== 'admin' && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Face AI:</span>
            {item.has_face_registered ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Đã quét
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Chưa có khuôn mặt</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-slate-500">Trạng thái:</span>
          <button
            onClick={() => handleToggleActive(item.id)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              item.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {item.is_active ? 'Hoạt động' : 'Đã khóa'}
          </button>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setResetModalAccount(item)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
        >
          <RotateCcw size={13} />
          Reset MK
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDetailAccount(item)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setEditAccount(item)}
            className="p-1.5 text-blue-600 hover:bg-blue-100/60 rounded-lg"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteAccount(item)}
            className="p-1.5 text-rose-600 hover:bg-rose-100/60 rounded-lg"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* Top Header & Cấp tài khoản Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <KeyRound className="text-blue-600" size={24} />
            Quản lý Tài khoản Hệ thống
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh sách, cấp tài khoản cho Sinh viên & Giảng viên theo từng Khoa/Lớp, phân quyền và giám sát bảo mật
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* <button
            onClick={() => {
              setProvisionInitialMode('bulk');
              setIsProvisionOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <FileSpreadsheet size={17} />
            <span>Import Excel Sinh viên</span>
          </button> */}

          <button
            onClick={() => {
              setProvisionInitialMode('single');
              setIsProvisionOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus size={17} />
            <span>Cấp Tài khoản Mới</span>
          </button>
        </div>
      </div>

      {/* Thống kê Tổng quan (Stats Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <KeyRound size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng tài khoản</div>
            <div className="text-xl font-bold text-slate-800">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Giảng viên</div>
            <div className="text-xl font-bold text-indigo-700">{teacherCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Sinh viên</div>
            <div className="text-xl font-bold text-emerald-700">{studentCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Quản trị viên</div>
            <div className="text-xl font-bold text-amber-700">{adminCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Đang hoạt động</div>
            <div className="text-xl font-bold text-teal-700">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Bị khóa</div>
            <div className="text-xl font-bold text-rose-600">{lockedCount}</div>
          </div>
        </div>
      </div>

      {/* Thanh Lọc Đa Tầng Tránh Nhầm Lẫn (Filter Bar) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Filter size={15} className="text-blue-600" />
          Bộ Lọc Danh Sách Tài Khoản Tránh Nhầm Lẫn
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Lọc theo Khoa */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">1. Lọc theo Khoa / Viện:</label>
            <select
              value={selectedFaculty}
              onChange={(e) => handleFacultyFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">-- Tất cả các Khoa --</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ten_khoa} ({f.ma_khoa})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Vai trò */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">2. Lọc theo Vai trò (Role):</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">-- Tất cả vai trò --</option>
              <option value="teacher">Giảng viên (Teacher)</option>
              <option value="student">Sinh viên (Student)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          {/* Lọc theo Lớp */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">3. Lọc theo Lớp sinh hoạt:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              disabled={selectedRole === 'teacher' || selectedRole === 'admin'}
            >
              <option value="all">-- Tất cả các Lớp --</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ten_lop} ({c.ma_lop})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Trạng thái */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">4. Trạng thái tài khoản:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">-- Tất cả trạng thái --</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đang bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main DataView */}
      <DataView
        data={filteredUsers}
        columns={columns}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[10, 20, 50, 100]}
        searchPlaceholder="Tìm kiếm theo Tên tài khoản, Họ tên, Mã SV/GV, Email..."
        searchKeys={['username', 'ho_ten', 'ma_dinh_danh', 'email', 'ten_khoa', 'ten_lop']}
        defaultView="table"
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
      />

      {/* Modal Cấp Tài Khoản Mới (Đơn lẻ & Import Excel) */}
      <AccountProvisionModal
        isOpen={isProvisionOpen}
        initialMode={provisionInitialMode}
        onClose={() => setIsProvisionOpen(false)}
        onSuccess={() => {
          loadData();
          setNotice({ type: 'success', message: 'Cấp tài khoản mới thành công!' });
        }}
      />

      {/* Modal Chi tiết */}
      <AccountDetailModal
        isOpen={Boolean(detailAccount)}
        onClose={() => setDetailAccount(null)}
        account={detailAccount}
        onEdit={(acc) => setEditAccount(acc)}
      />

      {/* Modal Chỉnh sửa */}
      <AccountEditModal
        isOpen={Boolean(editAccount)}
        onClose={() => setEditAccount(null)}
        account={editAccount}
        onSuccess={() => {
          loadData();
          setNotice({ type: 'success', message: 'Cập nhật tài khoản thành công!' });
        }}
      />

      {/* Modal Xóa */}
      <AccountDeleteModal
        isOpen={Boolean(deleteAccount)}
        onClose={() => setDeleteAccount(null)}
        account={deleteAccount}
        onSuccess={() => {
          loadData();
          setNotice({ type: 'success', message: 'Đã xóa tài khoản khỏi hệ thống!' });
        }}
      />

      {/* Modal Xác nhận & Kết quả Reset Mật Khẩu */}
      {resetModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            {resetSuccessInfo ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">Đặt lại mật khẩu thành công!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Mật khẩu của người dùng <strong>{resetSuccessInfo.ho_ten}</strong> (@{resetSuccessInfo.username}) đã được chuyển về:
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 font-mono font-bold text-amber-800 text-base">
                  {resetSuccessInfo.password}
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetSuccessInfo.password);
                      setNotice({ type: 'success', message: 'Đã sao chép mật khẩu mới vào clipboard!' });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    <Copy size={14} /> Sao chép mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setResetModalAccount(null);
                      setResetSuccessInfo(null);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 text-amber-900 font-bold text-base flex items-center gap-2">
                  <RotateCcw size={18} className="text-amber-600" />
                  Xác nhận Đặt lại Mật khẩu
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản này về mặc định{' '}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-amber-700">123456</code> không?
                  </p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tài khoản:</span>
                      <span className="font-bold font-mono text-slate-800">@{resetModalAccount.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chủ sở hữu:</span>
                      <span className="font-semibold text-slate-800">{resetModalAccount.ho_ten || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Đơn vị Khoa:</span>
                      <span className="text-slate-700">{resetModalAccount.ten_khoa || 'Hệ thống'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setResetModalAccount(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-xs transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetPassword}
                      disabled={resetting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      {resetting ? 'Đang xử lý...' : 'Đồng ý Đặt lại'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
