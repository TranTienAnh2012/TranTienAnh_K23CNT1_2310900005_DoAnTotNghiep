import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function ClassEditModal({ isOpen, onClose, cls, targetClass, faculties, onSuccess }) {
  const currentClass = targetClass || cls;
  const [formData, setFormData] = useState({
    ten_lop: '',
    khoa_hoc: '',
    khoa_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentClass) {
      setFormData({
        ten_lop: currentClass.ten_lop || '',
        khoa_hoc: currentClass.khoa_hoc || '',
        khoa_id: currentClass.khoa_id || '',
        is_active: typeof currentClass.is_active !== 'undefined' ? Boolean(currentClass.is_active) : true
      });
      setError('');
    }
  }, [currentClass, isOpen]);

  if (!isOpen || !currentClass) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ten_lop || !formData.khoa_hoc || !formData.khoa_id) {
      setError('Vui lòng điền đủ tên lớp, khóa học và khoa.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminService.updateClass(currentClass.id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật lớp.');
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
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Cập nhật Lớp sinh hoạt
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Mã lớp: {currentClass.ma_lop}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Tên Lớp Sinh Hoạt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ten_lop}
                onChange={(e) => setFormData({ ...formData, ten_lop: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Khóa Học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.khoa_hoc}
                  onChange={(e) => setFormData({ ...formData, khoa_hoc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Khoa Quản Lý <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.khoa_id}
                  onChange={(e) => setFormData({ ...formData, khoa_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.ten_khoa}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
