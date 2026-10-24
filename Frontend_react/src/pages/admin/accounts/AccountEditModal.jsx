import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Key, Shield, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function AccountEditModal({ isOpen, onClose, account, onSuccess }) {
  const [formData, setFormData] = useState({
    role: 'student',
    is_active: true,
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setFormData({
        role: account.role || 'student',
        is_active: Boolean(account.is_active),
        password: ''
      });
      setError('');
      setShowPassword(false);
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await adminService.updateUser(account.id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Cập nhật & Đổi mật khẩu</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Tài khoản: @{account.username} {account.ho_ten && `(${account.ho_ten})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Đơn vị của người dùng */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Chủ sở hữu:</span>
              <span className="font-bold text-slate-800">{account.ho_ten || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Đơn vị Khoa:</span>
              <span className="font-medium text-slate-700">{account.ten_khoa || 'Hệ thống'}</span>
            </div>
            {account.ten_lop && (
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp sinh hoạt:</span>
                <span className="font-medium text-slate-700">{account.ten_lop}</span>
              </div>
            )}
          </div>

          {/* Chọn Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Vai trò Hệ thống (Role)
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              <option value="student">Sinh viên (Student)</option>
              <option value="teacher">Giảng viên (Teacher)</option>
              <option value="faculty_manager">Quản lý Khoa (Faculty Manager)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          {/* Trạng thái hoạt động */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Trạng thái Tài khoản
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                  formData.is_active
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="edit_is_active"
                  checked={formData.is_active === true}
                  onChange={() => setFormData({ ...formData, is_active: true })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                Hoạt động
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                  formData.is_active === false
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="edit_is_active"
                  checked={formData.is_active === false}
                  onChange={() => setFormData({ ...formData, is_active: false })}
                  className="text-rose-600 focus:ring-rose-500"
                />
                Bị khóa
              </label>
            </div>
          </div>

          {/* Đổi Mật khẩu mới */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Mật khẩu mới</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, password: '123456' })}
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
              >
                <RotateCcw size={12} />
                Mặc định: 123456
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Để trống nếu không muốn đổi mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400 placeholder:font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Nhập mật khẩu mới chỉ khi bạn muốn thay đổi mật khẩu hiện tại của người dùng.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-sm transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={15} />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
