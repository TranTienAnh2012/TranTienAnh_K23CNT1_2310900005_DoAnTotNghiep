import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function AccountDeleteModal({ isOpen, onClose, account, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !account) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      await adminService.deleteUser(account.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between text-rose-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-bold text-base">Xác nhận Xóa Tài khoản</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-100/50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống không? Thao tác này sẽ vô hiệu hóa quyền truy cập của người dùng.
          </p>

          {/* Chi tiết tài khoản bị xóa để tránh nhầm lẫn */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Tên đăng nhập:</span>
              <span className="font-bold font-mono text-slate-800">@{account.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Chủ sở hữu:</span>
              <span className="font-semibold text-slate-800">{account.ho_ten || '---'}</span>
            </div>
            {account.ma_dinh_danh && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mã định danh:</span>
                <span className="font-medium text-slate-700">{account.ma_dinh_danh}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Thuộc Khoa / Viện:</span>
              <span className="font-medium text-slate-700">{account.ten_khoa || 'Hệ thống'}</span>
            </div>
            {account.ten_lop && (
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp sinh hoạt:</span>
                <span className="font-medium text-slate-700">{account.ten_lop}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Vai trò:</span>
              <span className="font-semibold text-indigo-600 uppercase">{account.role}</span>
            </div>
          </div>

          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            ⚠️ Lưu ý: Hồ sơ Giảng viên / Sinh viên liên kết với tài khoản này cũng sẽ chuyển sang trạng thái ngừng hoạt động.
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-sm transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Trash2 size={15} />
              {loading ? 'Đang xóa...' : 'Đồng ý Xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
