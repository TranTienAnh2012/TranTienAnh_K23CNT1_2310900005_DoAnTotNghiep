import React from 'react';
import {
  X,
  KeyRound,
  Shield,
  Calendar,
  CheckCircle2,
  Lock,
  Building2,
  GraduationCap,
  Mail,
  User,
  ScanFace,
  Edit2
} from 'lucide-react';

export default function AccountDetailModal({ isOpen, onClose, account, onEdit }) {
  if (!isOpen || !account) return null;

  const roleConfig = {
    admin: {
      label: 'Quản trị viên (Admin)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Shield
    },
    teacher: {
      label: 'Giảng viên',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building2
    },
    student: {
      label: 'Sinh viên',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: GraduationCap
    }
  };

  const currentRole = roleConfig[account.role] || {
    label: account.role,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: User
  };

  const RoleIcon = currentRole.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hồ sơ Chi tiết Tài khoản</h3>
              <p className="text-xs text-slate-500 font-mono">ID: #{account.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Header Card với Avatar và Thông tin chính */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {account.ho_ten ? account.ho_ten.charAt(0).toUpperCase() : account.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-base truncate">{account.ho_ten || account.username}</h4>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentRole.badgeClass}`}
                >
                  <RoleIcon size={12} />
                  {currentRole.label}
                </span>
              </div>
              <p className="text-xs text-indigo-600 font-mono font-medium mt-0.5">
                @{account.username} {account.ma_dinh_danh && `• Mã: ${account.ma_dinh_danh}`}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 truncate">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{account.email || 'Chưa cập nhật email'}</span>
              </div>
            </div>
          </div>

          {/* Chi tiết Đơn vị & Học thuật */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block mb-1">Khoa / Viện phụ trách:</span>
              <span className="font-bold text-slate-800 text-sm">{account.ten_khoa || 'Hệ thống chung'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block mb-1">Lớp sinh hoạt:</span>
              <span className="font-bold text-slate-800 text-sm">
                {account.ten_lop ? `${account.ten_lop}` : 'Không áp dụng'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block mb-1">Nhận diện khuôn mặt (Face AI):</span>
              {account.has_face_registered ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle2 size={13} /> Đã đăng ký
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                  <ScanFace size={13} /> Chưa quét Face AI
                </span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block mb-1">Trạng thái tài khoản:</span>
              {account.is_active ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle2 size={13} /> Đang hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                  <Lock size={13} /> Đang bị khóa
                </span>
              )}
            </div>
          </div>

          {/* Dòng thời gian */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-500">
            <div className="flex justify-between items-center">
              <span>Ngày cấp tài khoản:</span>
              <span className="font-medium text-slate-700">
                {account.created_at ? new Date(account.created_at).toLocaleString('vi-VN') : '---'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cập nhật gần nhất:</span>
              <span className="font-medium text-slate-700">
                {account.updated_at ? new Date(account.updated_at).toLocaleString('vi-VN') : '---'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit?.(account);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Edit2 size={15} />
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
