import React from 'react';
import { X, Users, Building2, Calendar, CheckCircle2 } from 'lucide-react';

export default function ClassDetailModal({ isOpen, onClose, cls, targetClass, onEdit }) {
  const currentClass = targetClass || cls;
  if (!isOpen || !currentClass) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Chi tiết Lớp sinh hoạt
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã lớp: {currentClass.ma_lop}
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
              {currentClass.ten_lop}
            </div>
            <div className="mt-2 flex gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Khóa: {currentClass.khoa_hoc}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Sĩ số: {currentClass.total_students || 0} SV
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Mã lớp</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{currentClass.ma_lop}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Khóa học</span>
              <span className="text-sm font-semibold text-slate-800">{currentClass.khoa_hoc}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 col-span-2">
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Khoa / Viện chủ quản</span>
              <span className="text-sm font-semibold text-slate-800">{currentClass.ten_khoa || 'Chưa gán'}</span>
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
              if (onEdit) onEdit(currentClass);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
