import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { BookOpen, CheckCircle2, AlertCircle, Clock, Award, Layers, FileText, Search } from 'lucide-react';

export default function StudentCurriculum() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [searchCourse, setSearchCourse] = useState('');

  useEffect(() => {
    const fetchCtdt = async () => {
      try {
        setLoading(true);
        const res = await studentService.getCurriculum();
        if (res?.success) {
          setData(res.data);
        } else if (res?.data?.success) {
          setData(res.data.data);
        } else if (res?.curriculum || res?.courses) {
          setData(res);
        }
      } catch (err) {
        console.error('Lỗi tải CTĐT:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCtdt();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Đang tải Chương trình đào tạo...</p>
        </div>
      </div>
    );
  }

  const { curriculum, facultyName, courses = [] } = data || {};

  // Nhóm môn theo học kỳ
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const filteredCourses = courses.filter((c) => {
    const matchSem = selectedSemester === 'all' || c.hoc_ky_goi_y === parseInt(selectedSemester, 10);
    const matchSearch =
      !searchCourse ||
      c.ma_mon?.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.ten_mon?.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.dieu_kien_tien_quyet?.toLowerCase().includes(searchCourse.toLowerCase());
    return matchSem && matchSearch;
  });

  const totalCredits = courses.reduce((sum, c) => sum + (c.so_tin_chi || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Tiêu đề trang Cổng Sinh Viên */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
            CHƯƠNG TRÌNH ĐÀO TẠO KHUNG
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {curriculum?.ten_ctdt || 'Chương trình Đào tạo Đại học Chính quy ngành CNTT'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Tổng số tín chỉ:</span>
            <strong className="text-sky-600 text-base font-black">
              {curriculum?.tong_tin_chi_yeu_cau || 135} TC
            </strong>
          </div>
          <div className="h-7 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-400 block text-[11px]">Đã tích lũy:</span>
            <strong className="text-emerald-600 text-base font-black">
              {courses.filter((c) => c.trang_thai_hoc === 'Dat').reduce((s, c) => s + (c.so_tin_chi || 0), 0)} TC
            </strong>
          </div>
        </div>
      </div>

      {/* Sub-header Cổng Sinh Viên: Dropdown Chuyên ngành & Thông tin Hệ/Khóa */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Chuyên Ngành Đào Tạo:
            </span>
            <select
              className="text-xs font-bold text-sky-700 bg-transparent outline-none cursor-pointer"
              defaultValue="Chinh"
            >
              <option value="Chinh">
                {curriculum?.chuyen_nganh || 'Chuyên Ngành Chính'}
              </option>
            </select>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            <span>Hệ: <strong className="text-slate-800">{curriculum?.he_dao_tao || 'Đại học chính quy 25'}</strong></span>
            <span className="mx-2 text-slate-300">|</span>
            <span>Khóa: <strong className="text-slate-800">{curriculum?.khoa_tuyen_sinh || '2023'}</strong></span>
            <span className="mx-2 text-slate-300">|</span>
            <span>Chuyên Ngành: <strong className="text-slate-800">{curriculum?.ten_nganh || 'Công nghệ thông tin'}</strong></span>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs w-full lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm môn học trong khung..."
            value={searchCourse}
            onChange={(e) => setSearchCourse(e.target.value)}
            className="w-full bg-transparent outline-none text-xs"
          />
        </div>
      </div>

      {/* Filter by Semester */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedSemester('all')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            selectedSemester === 'all'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tất cả học kỳ ({courses.length})
        </button>
        {semesters.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSemester(s)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              selectedSemester === s
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Học kỳ {s} ({courses.filter((c) => c.hoc_ky_goi_y === s).length})
          </button>
        ))}
      </div>

      {/* BẢNG 12 CỘT CHUẨN XÁC CỦA CỔNG SINH VIÊN */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-300 divide-x divide-slate-300 uppercase tracking-tight text-[11px] text-center">
                <th className="py-2.5 px-3 min-w-[90px] whitespace-nowrap">MÃ HỌC PHẦN</th>
                <th className="py-2.5 px-3 min-w-[220px] text-left">TÊN HỌC PHẦN</th>
                <th className="py-2.5 px-3 min-w-[110px]">KHỐI KIẾN THỨC</th>
                <th className="py-2.5 px-2 min-w-[50px]">KỲ THỨ</th>
                <th className="py-2.5 px-2 min-w-[50px]">SỐ TÍN CHỈ</th>
                <th className="py-2.5 px-2 min-w-[50px]">SỐ TIẾT</th>
                <th className="py-2.5 px-3 min-w-[160px] text-left">ĐIỀU KIỆN TIÊN QUYẾT</th>
                <th className="py-2.5 px-2 min-w-[55px]">BẮT BUỘC</th>
                <th className="py-2.5 px-2 min-w-[55px]">TỰ CHỌN</th>
                <th className="py-2.5 px-2 min-w-[55px]">NHÓM</th>
                <th className="py-2.5 px-3 min-w-[100px]">GHI CHÚ</th>
                <th className="py-2.5 px-2 min-w-[65px]">ĐỀ CƯƠNG</th>
                <th className="py-2.5 px-3 min-w-[85px]">KẾT QUẢ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-12 text-slate-400">
                    Chưa có học phần nào trong mục này.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c, idx) => {
                  const isBatBuoc = c.loai_hoc_phan === 'BatBuoc';
                  const isTuChon = c.loai_hoc_phan === 'TuChon';

                  const khoiLabels = {
                    DaiCuong: 'Đại cương',
                    CoSoNganh: 'Cơ sở ngành',
                    ChuyenNganh: 'Chuyên ngành',
                    TotNghiep: 'Tốt nghiệp'
                  };

                  return (
                    <tr
                      key={c.id || idx}
                      className="hover:bg-slate-50 transition-colors divide-x divide-slate-200"
                    >
                      {/* 1. Mã học phần */}
                      <td className="py-2 px-3 font-mono font-bold text-slate-700 text-center whitespace-nowrap">
                        {c.ma_mon}
                      </td>

                      {/* 2. Tên học phần */}
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {c.ten_mon}
                      </td>

                      {/* 3. Khối kiến thức */}
                      <td className="py-2 px-3 text-center text-slate-600">
                        {khoiLabels[c.khoi_kien_thuc] || c.khoi_kien_thuc || ''}
                      </td>

                      {/* 4. Kỳ thứ */}
                      <td className="py-2 px-2 text-center font-semibold text-slate-700">
                        {c.hoc_ky_goi_y}
                      </td>

                      {/* 5. Số tín chỉ */}
                      <td className="py-2 px-2 text-center font-bold text-sky-700">
                        {c.so_tin_chi}
                      </td>

                      {/* 6. Số tiết */}
                      <td className="py-2 px-2 text-center text-slate-700">
                        {c.so_tiet ?? (c.so_tin_chi * 15)}
                      </td>

                      {/* 7. Điều kiện tiên quyết */}
                      <td className="py-2 px-3 text-slate-600">
                        {c.dieu_kien_tien_quyet || (c.ma_mon_tien_quyet ? `Tiên quyết : ${c.ma_mon_tien_quyet} - ${c.ten_mon_tien_quyet}` : '')}
                      </td>

                      {/* 8. Bắt buộc */}
                      <td className="py-2 px-2 text-center font-bold text-slate-900">
                        {isBatBuoc ? 'X' : ''}
                      </td>

                      {/* 9. Tự chọn */}
                      <td className="py-2 px-2 text-center font-bold text-slate-900">
                        {isTuChon ? 'X' : ''}
                      </td>

                      {/* 10. Nhóm */}
                      <td className="py-2 px-2 text-center font-medium text-slate-700">
                        {c.nhom_tu_chon || ''}
                      </td>

                      {/* 11. Ghi chú */}
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {c.ghi_chu || ''}
                      </td>

                      {/* 12. Đề cương */}
                      <td className="py-2 px-2 text-center">
                        {c.de_cuong_url ? (
                          <a
                            href={c.de_cuong_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-sky-600 hover:text-sky-800"
                            title="Xem đề cương chi tiết"
                          >
                            <FileText className="w-4 h-4 mx-auto" />
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Kết quả học tập của SV */}
                      <td className="py-2 px-2 text-center">
                        {c.trang_thai_hoc === 'Dat' ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Đạt
                          </span>
                        ) : c.trang_thai_hoc === 'KhongDat' ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                            <AlertCircle className="w-3 h-3" />
                            Học lại
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                            <Clock className="w-3 h-3" />
                            Chưa học
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
