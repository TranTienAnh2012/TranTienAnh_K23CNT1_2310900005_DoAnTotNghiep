import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function StudentDeleteModal({ isOpen, onClose, student, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      await adminService.deleteStudent(student.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa hồ sơ sinh viên này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
            <AlertTriangle size={28} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Xác nhận xóa sinh viên
          </h3>

          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Bạn có chắc chắn muốn xóa sinh viên{' '}
            <strong className="text-slate-900 font-bold">{student.ho_ten}</strong> (Mã SV:{' '}
            <strong className="text-slate-900 font-mono font-bold">{student.ma_sv}</strong>)?
          </p>

          <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-800 text-left font-medium">
            Tài khoản đăng nhập và dữ liệu nhận diện liên kết cũng sẽ bị tạm khóa và chuyển vào trạng thái lưu trữ đã xóa.
          </div>

          {error && (
            <div className="mt-3 p-3 bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-sm hover:shadow inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
