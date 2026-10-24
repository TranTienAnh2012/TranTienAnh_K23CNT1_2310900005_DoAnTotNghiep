import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/facultyService';
import { AlertTriangle, Plus, ShieldAlert, CheckCircle2, Search, Filter } from 'lucide-react';

export default function FacultyWarningsManager() {
  const [warnings, setWarnings] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal tạo quyết định cảnh báo
  const [showModal, setShowModal] = useState(false);
  const [warningForm, setWarningForm] = useState({
    sinh_vien_id: '',
    hoc_ky_id: '',
    muc_canh_bao: 'CanhBao_Muc1',
    ly_do: '',
    so_quyet_dinh: ''
  });

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await facultyService.getAcademicWarnings();
      const payload = res?.data?.success ? res.data.data : (res?.success ? res.data : (res?.warnings ? res : null));
      if (payload) {
        setWarnings(payload.warnings || []);
        setSemesters(payload.semesters || []);
        if (payload.semesters?.length > 0) {
          setWarningForm((prev) => ({ ...prev, hoc_ky_id: payload.semesters[0].id }));
        }
      }
    } catch (err) {
      console.error('Lỗi tải cảnh báo học vụ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, []);

  const handleCreateWarning = async (e) => {
    e.preventDefault();
    try {
      await facultyService.createAcademicWarning(warningForm);
      setShowModal(false);
      fetchWarnings();
      alert('Đã ban hành quyết định cảnh báo học vụ!');
    } catch (err) {
      alert('Lỗi tạo quyết định: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu cảnh báo học vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Xử lý Quy chế & Học vụ Khoa</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Danh sách Cảnh báo Học vụ</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi các quyết định nhắc nhở, cảnh báo mức 1, mức 2 và buộc thôi học đối với sinh viên trong Khoa
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-all shadow-md shadow-rose-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Lập quyết định Cảnh báo</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4">Sinh viên</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Học kỳ</th>
                <th className="py-3.5 px-4">Mức cảnh báo</th>
                <th className="py-3.5 px-4">Lý do xử lý</th>
                <th className="py-3.5 px-4">Số Quyết định</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {warnings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Khoa hiện không có sinh viên nào bị cảnh báo học vụ.
                  </td>
                </tr>
              ) : (
                warnings.map((w, idx) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{w.ho_ten}</p>
                      <p className="text-xs text-slate-400 font-mono">{w.ma_sv}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-700">
                      {w.ma_lop}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {w.ten_hoc_ky}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        {w.muc_canh_bao}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {w.ly_do}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {w.so_quyet_dinh || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {w.trang_thai_khac_phuc}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lập Quyết định Cảnh báo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b">Lập Quyết định Cảnh báo Học vụ</h3>
            <form onSubmit={handleCreateWarning} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mã ID Sinh viên (*)</label>
                <input
                  type="number"
                  required
                  placeholder="ID Sinh viên trong CSDL"
                  value={warningForm.sinh_vien_id}
                  onChange={(e) => setWarningForm({ ...warningForm, sinh_vien_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Học kỳ áp dụng</label>
                <select
                  value={warningForm.hoc_ky_id}
                  onChange={(e) => setWarningForm({ ...warningForm, hoc_ky_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.ten_hoc_ky} - {s.nam_hoc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mức độ cảnh báo (*)</label>
                <select
                  value={warningForm.muc_canh_bao}
                  onChange={(e) => setWarningForm({ ...warningForm, muc_canh_bao: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                >
                  <option value="NhacNho">Nhắc nhở học tập</option>
                  <option value="CanhBao_Muc1">Cảnh báo học vụ Mức 1</option>
                  <option value="CanhBao_Muc2">Cảnh báo học vụ Mức 2</option>
                  <option value="BuocThoiHoc">Buộc thôi học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lý do xử lý (*)</label>
                <textarea
                  required
                  rows="3"
                  placeholder="VD: GPA kỳ 1 dưới 1.0; vắng điểm danh Face AI quá 25% tổng số buổi..."
                  value={warningForm.ly_do}
                  onChange={(e) => setWarningForm({ ...warningForm, ly_do: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Số quyết định</label>
                <input
                  type="text"
                  placeholder="VD: QĐ-CBHV-2026/01"
                  value={warningForm.so_quyet_dinh}
                  onChange={(e) => setWarningForm({ ...warningForm, so_quyet_dinh: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                >
                  Ban hành quyết định
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
