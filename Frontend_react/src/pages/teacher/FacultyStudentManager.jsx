import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import { 
  Users, 
  Search, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  GraduationCap, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  BookOpen, 
  Layers,
  Mail,
  UserCheck
} from 'lucide-react';

export default function FacultyStudentManager() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFace, setFilterFace] = useState('all'); // all, registered, not_registered

  const fetchFacultyStudents = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {};
      if (selectedClass) params.lop_id = selectedClass;
      if (searchTerm) params.search = searchTerm;

      const res = await teacherService.getFacultyStudents(params);
      if (res.success) {
        setStudents(res.data || []);
        if (res.classes) setClasses(res.classes);
        if (res.faculty) setFaculty(res.faculty);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách sinh viên theo khoa:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacultyStudents();
  }, [selectedClass]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFacultyStudents();
  };

  // Lọc client theo trạng thái Face AI
  const filteredStudents = students.filter((s) => {
    if (filterFace === 'registered') return s.has_face_registered;
    if (filterFace === 'not_registered') return !s.has_face_registered;
    return true;
  });

  const totalStudents = students.length;
  const totalRegisteredFace = students.filter((s) => s.has_face_registered).length;
  const faceRate = totalStudents > 0 ? Math.round((totalRegisteredFace / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* 1. Header & Thông tin Khoa Phụ Trách */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200 shadow-sm shrink-0">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                Quản Lý Sinh Viên Theo Khoa
                {faculty && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-wider">
                    {faculty.ten_khoa}
                  </span>
                )}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Chỉ phân quyền xem và quản lý sinh viên thuộc các lớp chuyên ngành của khoa phụ trách
              </p>
            </div>
          </div>
        </div>

        {/* Nút làm mới */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFacultyStudents(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : ''} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* 2. Banner Bảo Mật Phân Quyền */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-slate-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-blue-900 flex items-center gap-2">
              <span>Đơn vị trực thuộc: {faculty ? faculty.ten_khoa : 'Đang tải...'}</span>
              {faculty?.ma_khoa && (
                <span className="font-mono text-[11px] bg-blue-200/60 px-1.5 py-0.2 rounded text-blue-900">
                  {faculty.ma_khoa}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Hệ thống thực thi chính sách bảo mật: Giảng viên chỉ được quản lý danh sách sinh viên thuộc Khoa này.
            </div>
          </div>
        </div>

        {faculty?.van_phong && (
          <div className="text-xs text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shrink-0 font-medium">
            Văn phòng khoa: <strong className="text-slate-800">{faculty.van_phong}</strong>
          </div>
        )}
      </div>

      {/* 3. Thống Kê Nhanh Của Khoa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng sinh viên */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Sinh Viên Khoa</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalStudents}</div>
            <div className="text-[11px] text-slate-400">Thuộc {classes.length} lớp chuyên ngành</div>
          </div>
        </div>

        {/* Card 2: Đã đăng ký Face AI */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã Có Mẫu Face AI</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {totalRegisteredFace} <span className="text-xs font-bold text-slate-400 font-normal">({faceRate}%)</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Sẵn sàng điểm danh tự động</div>
          </div>
        </div>

        {/* Card 3: Chưa có Face AI */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
            <Camera size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chưa Đăng Ký Mẫu Mặt</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {totalStudents - totalRegisteredFace}
            </div>
            <div className="text-[11px] text-amber-600 font-medium">Cần nhắc nhở bổ sung dữ liệu</div>
          </div>
        </div>
      </div>

      {/* 4. Bộ Lọc & Tìm Kiếm */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Lọc theo lớp chuyên ngành */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Lớp Chuyên Ngành ({classes.length})
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">-- Toàn bộ các lớp trong Khoa --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.ten_lop} ({cls.ma_lop}) - Khóa {cls.khoa_hoc || '---'}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo trạng thái Face AI */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Dữ liệu Khuôn Mặt 3D
            </label>
            <select
              value={filterFace}
              onChange={(e) => setFilterFace(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">Tất cả sinh viên</option>
              <option value="registered">Đã đăng ký Face AI</option>
              <option value="not_registered">Chưa đăng ký Face AI</option>
            </select>
          </div>

          {/* Tìm kiếm */}
          <div className="md:col-span-5 flex items-end gap-2">
            <div className="flex-1 relative">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Tìm kiếm theo Tên / Mã SV
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập họ tên, mã sinh viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* 5. Bảng Danh Sách Sinh Viên */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <UserCheck size={15} className="text-blue-600" />
            Danh Sách Sinh Viên Khoa ({filteredStudents.length} kết quả)
          </span>
          <span className="text-[11px] text-slate-400">
            Dữ liệu đồng bộ trực tiếp từ CSDL Đào tạo NTU
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Mã Sinh Viên</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Lớp Chuyên Ngành</th>
                <th className="py-3 px-4">Khóa Học</th>
                <th className="py-3 px-4">Dữ liệu Face AI</th>
                <th className="py-3 px-4">Số Môn Đang Học</th>
                <th className="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-xs font-semibold">Đang tải danh sách sinh viên khoa...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 opacity-30" size={36} />
                    <p className="text-sm font-semibold text-slate-600">
                      Không tìm thấy sinh viên nào phù hợp với bộ lọc
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử xóa bộ lọc hoặc chọn lớp khác trong Khoa {faculty?.ten_khoa}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((sv, idx) => (
                  <tr key={sv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-xs font-mono">
                      {idx + 1}
                    </td>

                    {/* Mã SV */}
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-blue-700 font-mono">
                      {sv.ma_sv}
                    </td>

                    {/* Họ tên & Avatar */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {sv.avatar_url ? (
                            <img
                              src={sv.avatar_url.startsWith('http') ? sv.avatar_url : `http://localhost:5000${sv.avatar_url}`}
                              alt={sv.ho_ten}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-600 uppercase">
                              {sv.ho_ten?.charAt(0) || 'S'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{sv.ho_ten}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail size={10} /> {sv.email || `${sv.ma_sv.toLowerCase()}@smartedu.edu.vn`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Lớp chuyên ngành */}
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                        {sv.ten_lop}
                      </span>
                    </td>

                    {/* Khóa */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                      {sv.khoa_hoc || '---'}
                    </td>

                    {/* Face AI */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {sv.has_face_registered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Đã có Face ID</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <XCircle size={12} />
                          <span>Chưa đăng ký</span>
                        </span>
                      )}
                    </td>

                    {/* Môn đăng ký */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium text-xs">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen size={12} className="text-slate-400" />
                        <strong>{sv.total_courses || 0}</strong> môn
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sv.is_active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {sv.is_active ? 'Đang học' : 'Nghỉ học/Bảo lưu'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
