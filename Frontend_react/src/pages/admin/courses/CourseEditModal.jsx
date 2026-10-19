import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, AlertCircle, UserCheck } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export default function CourseEditModal({
  isOpen,
  onClose,
  course,
  subjects = [],
  semesters = [],
  teachers = [],
  faculties = [],
  onSuccess
}) {
  const [formData, setFormData] = useState({
    ten_lhp: '',
    mon_hoc_id: '',
    hoc_ky_id: '',
    giang_vien_id: '',
    phong_hoc_mac_dinh: '',
    is_active: true
  });
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course && isOpen) {
      setFormData({
        ten_lhp: course.ten_lhp || '',
        mon_hoc_id: course.mon_hoc_id || '',
        hoc_ky_id: course.hoc_ky_id || '',
        giang_vien_id: course.giang_vien_id || '',
        phong_hoc_mac_dinh: course.phong_hoc_mac_dinh || '',
        is_active: typeof course.is_active !== 'undefined' ? Boolean(course.is_active) : true
      });
      setError('');

      // Tự động nhận diện Khoa của giảng viên hoặc môn học hiện tại
      let facultyId = '';
      if (course.giang_vien_id) {
        const currentTeacher = teachers.find((t) => String(t.id) === String(course.giang_vien_id));
        if (currentTeacher?.khoa_id) facultyId = String(currentTeacher.khoa_id);
      }
      if (!facultyId && course.mon_hoc_id) {
        const currentSubject = subjects.find((s) => String(s.id) === String(course.mon_hoc_id));
        if (currentSubject?.khoa_id) facultyId = String(currentSubject.khoa_id);
      }
      setSelectedFacultyId(facultyId);
    }
  }, [course, isOpen, teachers, subjects]);

  // Lọc giảng viên theo Khoa đã chọn
  const filteredTeachers = useMemo(() => {
    if (!selectedFacultyId) return teachers;
    return teachers.filter((t) => String(t.khoa_id) === String(selectedFacultyId));
  }, [teachers, selectedFacultyId]);

  if (!isOpen || !course) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ten_lhp || !formData.mon_hoc_id || !formData.hoc_ky_id) {
      setError('Vui lòng điền đủ tên lớp học phần, môn học và học kỳ.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminService.updateCourse(course.id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật lớp học phần.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Cập nhật Lớp học phần
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Mã LHP: <span className="font-semibold text-blue-600">{course.ma_lhp}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tên LHP */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên Lớp học phần <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ten_lhp}
                onChange={(e) => setFormData({ ...formData, ten_lhp: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              />
            </div>

            {/* Môn học & Học kỳ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.mon_hoc_id}
                  onChange={(e) => setFormData({ ...formData, mon_hoc_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ten_mon} ({m.so_tin_chi} TC)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Học kỳ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.hoc_ky_id}
                  onChange={(e) => setFormData({ ...formData, hoc_ky_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {semesters.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.ten_hoc_ky}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PHẦN CHỌN VÀ SỬA GIẢNG VIÊN PHỤ TRÁCH (LỌC THEO KHOA) */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <UserCheck size={16} className="text-blue-600" />
                <span>Giảng viên phụ trách giảng dạy</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Lọc theo Khoa / Viện
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => {
                      const newFacultyId = e.target.value;
                      setSelectedFacultyId(newFacultyId);
                      // Nếu giảng viên hiện tại không thuộc khoa mới, reset chọn lại
                      if (newFacultyId && formData.giang_vien_id) {
                        const cur = teachers.find((t) => String(t.id) === String(formData.giang_vien_id));
                        if (cur && String(cur.khoa_id) !== String(newFacultyId)) {
                          setFormData((p) => ({ ...p, giang_vien_id: '' }));
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  >
                    <option value="">-- Tất cả các Khoa --</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.ten_khoa} ({f.ma_khoa})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Chọn Giảng viên phân công
                  </label>
                  <select
                    value={formData.giang_vien_id || ''}
                    onChange={(e) => setFormData({ ...formData, giang_vien_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  >
                    <option value="">-- Chưa phân công giảng viên --</option>
                    {filteredTeachers.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.ho_ten} ({g.ma_gv}){g.ten_khoa ? ` - ${g.ten_khoa}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.giang_vien_id && (() => {
                const curGV = teachers.find((t) => String(t.id) === String(formData.giang_vien_id));
                return (
                  <div className="text-xs text-blue-700 bg-white/80 p-2 rounded-lg border border-blue-200/60 flex items-center justify-between">
                    <span>
                      Đang phân công: <strong>{curGV?.ho_ten}</strong> ({curGV?.ma_gv || 'GV'})
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                      {curGV?.ten_khoa || 'Chưa gán khoa'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Phòng học & Trạng thái */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phòng học mặc định
                </label>
                <input
                  type="text"
                  placeholder="vd: P.301 - Nhà B"
                  value={formData.phong_hoc_mac_dinh}
                  onChange={(e) => setFormData({ ...formData, phong_hoc_mac_dinh: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Trạng thái lớp học phần
                </label>
                <select
                  value={formData.is_active ? '1' : '0'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
                >
                  <option value="1">Đang mở giảng dạy</option>
                  <option value="0">Đã kết thúc / Đóng lớp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
