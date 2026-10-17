import React from 'react';
import { X, Building2, Phone, Mail, MapPin, UserCheck, Users, GraduationCap, BookOpen } from 'lucide-react';

export default function FacultyDetailModal({ isOpen, onClose, faculty, onEdit }) {
  if (!isOpen || !faculty) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Hồ sơ thông tin Khoa / Viện
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã định danh: {faculty.ma_khoa}
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

        <div className="p-6">
          <div className="pb-5 border-b border-slate-100 mb-5">
            <div className="text-lg font-bold text-slate-900">
              {faculty.ten_khoa}
            </div>
            <div className="mt-2 flex gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  faculty.is_active !== false
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {faculty.is_active !== false ? 'Đang hoạt động đào tạo' : 'Tạm dừng hoạt động'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-5">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Mã Khoa</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{faculty.ma_khoa}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Trưởng Khoa</span>
              <span className="text-sm font-semibold text-slate-800">{faculty.truong_khoa || 'Chưa phân công'}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Văn phòng làm việc</span>
              <span className="text-sm font-semibold text-slate-800">{faculty.van_phong || 'Chưa có'}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Số điện thoại hotline</span>
              <span className="text-sm font-semibold text-slate-800">{faculty.so_dien_thoai || '---'}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 col-span-2">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Email văn phòng</span>
              <span className="text-sm font-semibold text-slate-800">{faculty.email || 'Chưa cập nhật'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/80 text-center">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Lớp quản lý</div>
              <div className="text-base font-extrabold text-blue-700 mt-0.5">{faculty.total_classes || 0}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Giảng viên</div>
              <div className="text-base font-extrabold text-emerald-700 mt-0.5">{faculty.total_teachers || 0}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Sinh viên</div>
              <div className="text-base font-extrabold text-indigo-700 mt-0.5">{faculty.total_students || 0}</div>
            </div>
          </div>
        </div>

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
              if (onEdit) onEdit(faculty);
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
