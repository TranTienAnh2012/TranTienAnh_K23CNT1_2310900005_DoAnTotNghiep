import React from 'react';
import { X, CheckCircle2, AlertCircle, Calendar, Mail, BookOpen, User, Shield } from 'lucide-react';

export default function StudentDetailModal({ isOpen, onClose, student, onEdit }) {
  if (!isOpen || !student) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Chi tiết hồ sơ Sinh viên
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã SV: {student.ma_sv}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar & Key Status */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-5">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-blue-600 shrink-0 overflow-hidden border-2 border-slate-200 shadow-inner">
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.ho_ten}
                  className="w-full h-full object-cover"
                />
              ) : (
                student.ho_ten ? student.ho_ten.charAt(0) : 'S'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-slate-900 truncate">
                {student.ho_ten}
              </div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    student.has_face_registered
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {student.has_face_registered ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  {student.has_face_registered ? 'Đã kích hoạt FaceAI' : 'Chưa đăng ký FaceAI'}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    student.is_active
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {student.is_active ? 'Đang theo học' : 'Tạm dừng/Bảo lưu'}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Mã sinh viên</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{student.ma_sv}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Giới tính</span>
              <span className="text-sm font-semibold text-slate-800">
                {student.gioi_tinh === 'Nam' ? 'Nam' : student.gioi_tinh === 'Nu' ? 'Nữ' : 'Khác'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Ngày sinh</span>
              <span className="text-sm font-semibold text-slate-800">
                {student.ngay_sinh ? new Date(student.ngay_sinh).toLocaleDateString('vi-VN') : '---'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Tài khoản liên kết</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">
                @{student.username || student.ma_sv}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 col-span-2">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Email liên hệ</span>
              <span className="text-sm font-semibold text-slate-800">{student.email}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Lớp sinh hoạt</span>
              <span className="text-sm font-semibold text-slate-800">{student.ten_lop || 'Chưa gán'}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Khoa / Viện</span>
              <span className="text-sm font-semibold text-slate-800">{student.ten_khoa || 'Chưa rõ'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(student);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow"
          >
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  );
}
