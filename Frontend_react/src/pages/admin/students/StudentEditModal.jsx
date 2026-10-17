import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function StudentEditModal({ isOpen, onClose, student, classes, onSuccess }) {
  const [formData, setFormData] = useState({
    ho_ten: '',
    ngay_sinh: '',
    gioi_tinh: 'Nam',
    email: '',
    lop_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        ho_ten: student.ho_ten || '',
        ngay_sinh: student.ngay_sinh ? student.ngay_sinh.split('T')[0] : '',
        gioi_tinh: student.gioi_tinh || 'Nam',
        email: student.email || '',
        lop_id: student.lop_id || '',
        is_active: typeof student.is_active !== 'undefined' ? Boolean(student.is_active) : true
      });
      setError('');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ho_ten || !formData.email || !formData.lop_id) {
      setError('Vui lòng điền đầy đủ họ tên, email và lớp sinh hoạt.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminService.updateStudent(student.id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sinh viên.');
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
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Cập nhật thông tin Sinh viên
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Mã SV: {student.ma_sv}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Họ và Tên sinh viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ho_ten}
                onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={formData.ngay_sinh}
                  onChange={(e) => setFormData({ ...formData, ngay_sinh: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Giới tính
                </label>
                <select
                  value={formData.gioi_tinh}
                  onChange={(e) => setFormData({ ...formData, gioi_tinh: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nu">Nữ</option>
                  <option value="Khac">Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Lớp sinh hoạt <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.lop_id}
                  onChange={(e) => setFormData({ ...formData, lop_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ten_lop} ({c.ma_lop})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Trạng thái học tập
                </label>
                <select
                  value={formData.is_active ? '1' : '0'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="1">Đang theo học</option>
                  <option value="0">Tạm dừng / Bảo lưu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
