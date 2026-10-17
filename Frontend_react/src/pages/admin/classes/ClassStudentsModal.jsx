import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle2, AlertCircle, Mail, Phone, Calendar } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function ClassStudentsModal({ isOpen, onClose, targetClass }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && targetClass?.id) {
      loadStudents();
    } else {
      setStudents([]);
      setError('');
    }
  }, [isOpen, targetClass]);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getClassStudents(targetClass.id);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách sinh viên.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetClass) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Danh sách sinh viên lớp {targetClass.ten_lop}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã lớp: {targetClass.ma_lop} • Khóa: {targetClass.khoa_hoc} • Sĩ số: {students.length} SV
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

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-sm font-medium text-slate-500">
              Đang tải danh sách sinh viên...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Lớp này hiện chưa có sinh viên nào trực thuộc.
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Mã SV</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4">Giới tính / Ngày sinh</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Khuôn mặt (FaceAI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.map((sv) => (
                    <tr key={sv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {sv.ma_sv}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {sv.ho_ten}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {sv.gioi_tinh === 'Nu' ? 'Nữ' : 'Nam'} • {sv.ngay_sinh ? new Date(sv.ngay_sinh).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {sv.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            sv.has_face_registered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {sv.has_face_registered ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {sv.has_face_registered ? 'Đã kích hoạt' : 'Chưa đăng ký'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
