import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/facultyService';
import { Users, Search, Filter, Eye, Phone, Mail, GraduationCap, X, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export default function FacultyStudentManager() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Xem chi tiết hồ sơ
  const [selectedStudentResume, setSelectedStudentResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await facultyService.getStudents({
        search,
        lop_id: selectedClass || undefined
      });
      const payload = res?.data?.success ? res.data.data : (res?.success ? res.data : (res?.students ? res : null));
      if (payload) {
        setStudents(payload.students || []);
        setClasses(payload.classes || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách sinh viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleViewResume = async (studentId) => {
    try {
      setLoadingResume(true);
      const res = await facultyService.getStudentResume(studentId);
      if (res?.success) {
        setSelectedStudentResume(res.data);
      } else if (res.data?.success) {
        setSelectedStudentResume(res.data.data);
      }
    } catch (err) {
      alert('Lỗi tải sơ yếu lý lịch: ' + err.message);
    } finally {
      setLoadingResume(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            <Users className="w-4 h-4" />
            <span>Quản lý Học viên & Sinh viên</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Danh sách Sinh viên trong Khoa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu và theo dõi hồ sơ sơ yếu lý lịch, thông tin thân nhân và tiến độ học tập của sinh viên
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none focus:border-sky-500 shadow-sm"
          >
            <option value="">Tất cả các lớp trong Khoa</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ma_lop} ({c.ten_lop})
              </option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Tìm theo mã SV, họ tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>
        </div>
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
                <th className="py-3.5 px-4">Liên hệ</th>
                <th className="py-3.5 px-4">CCCD / CMND</th>
                <th className="py-3.5 px-4 text-center">Face AI</th>
                <th className="py-3.5 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Đang tải danh sách sinh viên...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Không tìm thấy sinh viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                students.map((sv, idx) => (
                  <tr key={sv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {sv.avatar_url ? (
                          <img
                            src={sv.avatar_url}
                            alt={sv.ho_ten}
                            className="w-9 h-9 rounded-xl object-cover border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                            {sv.ho_ten?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{sv.ho_ten}</p>
                          <p className="text-xs text-slate-400 font-mono">{sv.ma_sv}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-bold text-slate-800">{sv.ma_lop}</span>
                      <span className="block text-slate-400">{sv.khoa_hoc}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs space-y-0.5">
                      <p className="text-slate-700">{sv.email}</p>
                      <p className="text-slate-400">{sv.so_dien_thoai_ca_nhan || 'Chưa có SĐT'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                      {sv.so_cmnd_cccd || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {sv.has_face ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã có mẫu</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                          <span>Chưa chụp</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleViewResume(sv.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem hồ sơ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem Sơ yếu lý lịch sinh viên */}
      {selectedStudentResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-scale-up overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {selectedStudentResume.basicInfo?.ho_ten?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedStudentResume.basicInfo?.ho_ten}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mã SV: <strong className="text-sky-600">{selectedStudentResume.basicInfo?.ma_sv}</strong> • Lớp: {selectedStudentResume.basicInfo?.ma_lop}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentResume(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
              {/* Thông tin cư trú & Căn cước */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin cá nhân & Cư trú</h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                  <p><span className="text-slate-500">Số CCCD:</span> <strong>{selectedStudentResume.personalDetail?.so_cmnd_cccd || 'Chưa cập nhật'}</strong></p>
                  <p><span className="text-slate-500">Quê quán:</span> <strong>{selectedStudentResume.personalDetail?.que_quan || 'Chưa cập nhật'}</strong></p>
                  <p><span className="text-slate-500">Dân tộc:</span> {selectedStudentResume.personalDetail?.dan_toc || 'Kinh'}</p>
                  <p><span className="text-slate-500">Tôn giáo:</span> {selectedStudentResume.personalDetail?.ton_giao || 'Không'}</p>
                  <p><span className="text-slate-500">Số ĐT cá nhân:</span> <strong>{selectedStudentResume.personalDetail?.so_dien_thoai_ca_nhan || 'Chưa có'}</strong></p>
                  <p><span className="text-slate-500">Email:</span> {selectedStudentResume.basicInfo?.email}</p>
                  <p className="col-span-2"><span className="text-slate-500">Thường trú:</span> {selectedStudentResume.personalDetail?.dia_chi_thuong_tru || 'Chưa cập nhật'}</p>
                  <p className="col-span-2"><span className="text-slate-500">Tạm trú hiện nay:</span> {selectedStudentResume.personalDetail?.dia_chi_tam_tru_hien_nay || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Thông tin thân nhân */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quan hệ gia đình / Thân nhân</h4>
                {selectedStudentResume.family?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sinh viên chưa khai báo thông tin thân nhân.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentResume.family?.map((f) => (
                      <div key={f.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-800">{f.ho_ten}</strong> ({f.moi_quan_he})
                          <span className="block text-slate-500">Nghề: {f.nghe_nghiep || 'Tự do'}</span>
                        </div>
                        <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-md border border-sky-100">
                          {f.so_dien_thoai || 'Không có SĐT'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
