import React, { useState, useEffect, useMemo } from 'react';
import { facultyService } from '../../services/facultyService';
import { adminService } from '../../services/adminService';
import {
  BookOpenCheck,
  Plus,
  Layers,
  Calendar,
  Award,
  Trash2,
  CheckCircle2,
  ChevronRight,
  X,
  Search,
  Filter,
  Edit3,
  FileText,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Info,
  GraduationCap
} from 'lucide-react';

export default function FacultyCurriculumManager() {
  const [curriculums, setCurriculums] = useState([]);
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc khung CTĐT
  const [filterMajor, setFilterMajor] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Khung đang chọn xem chi tiết
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [curriculumDetail, setCurriculumDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Bộ lọc bên trong bảng chi tiết môn học
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [tableSearch, setTableSearch] = useState('');

  // -----------------------
  // 1. MODAL BAN HÀNH KHUNG CTĐT MỚI (Step Wizard)
  // -----------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1: Thông tin chung, 2: Chọn môn ban đầu
  const [createForm, setCreateForm] = useState({
    khoa_id: '',
    nganh_hoc_id: '',
    chuyen_nganh: 'Chuyên Ngành Chính',
    he_dao_tao: 'Đại học chính quy 25',
    khoa_tuyen_sinh: '2024',
    nam_ban_hanh: new Date().getFullYear(),
    ma_ctdt: '',
    ten_ctdt: '',
    quyet_dinh_ban_hanh: '',
    tong_tin_chi_yeu_cau: 135,
    selectedCourses: [] // danh sách môn chọn ở step 2
  });
  const [courseSearchStep2, setCourseSearchStep2] = useState('');

  // -----------------------
  // 2. MODAL THÊM / SỬA MÔN TRONG KHUNG
  // -----------------------
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null); // null = add, ID = edit
  const [courseForm, setCourseForm] = useState({
    mon_hoc_id: '',
    hoc_ky_goi_y: 1,
    khoi_kien_thuc: 'DaiCuong',
    loai_hoc_phan: 'BatBuoc',
    so_tiet: 45,
    dieu_kien_tien_quyet: '',
    nhom_tu_chon: '',
    ghi_chu: '',
    de_cuong_url: '',
    mon_tien_quyet_id: ''
  });

  // Tải danh sách CTĐT & Dữ liệu danh mục
  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      const res = await facultyService.getCurriculums();
      const payload = res?.data || res;
      if (res?.success || payload?.curriculums) {
        const currs = payload.curriculums || [];
        const mjs = payload.majors || [];
        const facs = payload.faculties || [];
        setCurriculums(currs);
        setMajors(mjs);
        setFaculties(facs);

        if (mjs.length > 0) {
          const firstMajor = mjs[0];
          setCreateForm((prev) => ({
            ...prev,
            khoa_id: firstMajor.khoa_id || (facs[0]?.id || ''),
            nganh_hoc_id: firstMajor.id,
            ma_ctdt: `CTDT_${firstMajor.ma_nganh}_2024`,
            ten_ctdt: `Chương trình Đào tạo Đại học Chính quy ngành ${firstMajor.ten_nganh} Khóa 2024`
          }));
        } else if (facs.length > 0) {
          setCreateForm((prev) => ({
            ...prev,
            khoa_id: facs[0].id
          }));
        }
      }

      // Tải danh mục toàn bộ môn học để phục vụ form chọn
      try {
        const subRes = await facultyService.getAllSubjects();
        const subPayload = subRes?.data || subRes;
        const subList = Array.isArray(subPayload)
          ? subPayload
          : Array.isArray(subPayload?.subjects)
          ? subPayload.subjects
          : Array.isArray(subPayload?.data)
          ? subPayload.data
          : [];
        setAllSubjects(subList);
      } catch {
        // Fallback nếu api subRes ko khả dụng
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu khung CTĐT:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculums();
  }, []);

  // Mở modal Chi tiết Khung CTĐT
  const handleOpenDetail = async (ctdt) => {
    setSelectedCurriculum(ctdt);
    setFilterSemester('ALL');
    setFilterType('ALL');
    setTableSearch('');
    try {
      setLoadingDetail(true);
      const res = await facultyService.getCurriculumDetail(ctdt.id);
      const detailPayload = res?.data?.data || res?.data || res;
      if (res?.success || detailPayload?.curriculum || detailPayload?.courses) {
        setCurriculumDetail(detailPayload);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết CTĐT:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Tự động gợi ý mã và tên CTĐT khi người dùng thay đổi ngành hoặc khóa
  const handleMajorOrCohortChange = (newMajorId, newCohort) => {
    const selectedMajor = majors.find((m) => String(m.id) === String(newMajorId));
    const majorCode = selectedMajor ? selectedMajor.ma_nganh : 'CNTT';
    const majorName = selectedMajor ? selectedMajor.ten_nganh : 'Công nghệ thông tin';

    setCreateForm((prev) => ({
      ...prev,
      nganh_hoc_id: newMajorId,
      khoa_tuyen_sinh: newCohort,
      ma_ctdt: `CTDT_${majorCode}_${newCohort}`,
      ten_ctdt: `Chương trình Đào tạo Đại học Chính quy ngành ${majorName} Khóa ${newCohort}`
    }));
  };

  // Toggle chọn môn học ở Step 2 khi tạo mới
  const handleToggleCourseStep2 = (subject) => {
    setCreateForm((prev) => {
      const exists = prev.selectedCourses.some((c) => c.mon_hoc_id === subject.id);
      if (exists) {
        return {
          ...prev,
          selectedCourses: prev.selectedCourses.filter((c) => c.mon_hoc_id !== subject.id)
        };
      } else {
        return {
          ...prev,
          selectedCourses: [
            ...prev.selectedCourses,
            {
              mon_hoc_id: subject.id,
              ma_mon: subject.ma_mon,
              ten_mon: subject.ten_mon,
              so_tin_chi: subject.so_tin_chi,
              hoc_ky_goi_y: 1,
              khoi_kien_thuc: 'DaiCuong',
              loai_hoc_phan: 'BatBuoc',
              so_tiet: (subject.so_tin_chi || 3) * 15,
              nhom_tu_chon: '',
              dieu_kien_tien_quyet: ''
            }
          ]
        };
      }
    });
  };

  const handleUpdateSelectedCourseStep2 = (subjectId, field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      selectedCourses: prev.selectedCourses.map((c) => {
        if (c.mon_hoc_id === subjectId) {
          const updated = { ...c, [field]: value };
          if (field === 'loai_hoc_phan' && value === 'BatBuoc') {
            updated.nhom_tu_chon = '';
          }
          return updated;
        }
        return c;
      })
    }));
  };

  // Submit tạo mới Khung CTĐT
  const handleSubmitCreateCurriculum = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        khoa_id: createForm.khoa_id,
        nganh_hoc_id: createForm.nganh_hoc_id,
        chuyen_nganh: createForm.chuyen_nganh,
        he_dao_tao: createForm.he_dao_tao,
        khoa_tuyen_sinh: createForm.khoa_tuyen_sinh,
        nam_ban_hanh: parseInt(createForm.nam_ban_hanh, 10) || new Date().getFullYear(),
        ma_ctdt: createForm.ma_ctdt.trim(),
        ten_ctdt: createForm.ten_ctdt.trim(),
        quyet_dinh_ban_hanh: createForm.quyet_dinh_ban_hanh,
        tong_tin_chi_yeu_cau: parseInt(createForm.tong_tin_chi_yeu_cau, 10) || 135,
        courses: createForm.selectedCourses
      };

      const res = await facultyService.createCurriculum(payload);
      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        setShowCreateModal(false);
        setCreateStep(1);
        await fetchCurriculums();
        alert('Ban hành khung chương trình đào tạo thành công!');
        // Tự động mở chi tiết khung vừa tạo
        const createdId = res?.data?.id || res?.data?.data?.id || res?.id;
        if (createdId) {
          handleOpenDetail({ id: createdId, ...payload });
        }
      }
    } catch (err) {
      alert('Lỗi tạo khung CTĐT: ' + (err.response?.data?.message || err.message));
    }
  };

  // Mở modal Thêm môn học
  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    const targetKhoaId = selectedCurriculum?.khoa_id;
    const available = (curriculumDetail?.allCourses || allSubjects).filter(
      (m) => !targetKhoaId || !m.khoa_id || String(m.khoa_id) === String(targetKhoaId) || m.loai_mon === 'DaiCuong'
    );
    const defaultSubject = available[0] || null;
    const defaultCredits = defaultSubject ? defaultSubject.so_tin_chi || 3 : 3;

    setCourseForm({
      mon_hoc_id: defaultSubject ? defaultSubject.id : '',
      hoc_ky_goi_y: 1,
      khoi_kien_thuc: 'DaiCuong',
      loai_hoc_phan: 'BatBuoc',
      so_tiet: defaultCredits * 15,
      dieu_kien_tien_quyet: '',
      nhom_tu_chon: '',
      ghi_chu: '',
      de_cuong_url: '',
      mon_tien_quyet_id: ''
    });
    setShowCourseModal(true);
  };

  // Mở modal Chỉnh sửa môn học
  const handleOpenEditCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      mon_hoc_id: course.mon_hoc_id,
      hoc_ky_goi_y: course.hoc_ky_goi_y || 1,
      khoi_kien_thuc: course.khoi_kien_thuc || 'DaiCuong',
      loai_hoc_phan: course.loai_hoc_phan || 'BatBuoc',
      so_tiet: course.so_tiet ?? (course.so_tin_chi * 15),
      dieu_kien_tien_quyet: course.dieu_kien_tien_quyet || '',
      nhom_tu_chon: course.nhom_tu_chon || '',
      ghi_chu: course.ghi_chu || '',
      de_cuong_url: course.de_cuong_url || '',
      mon_tien_quyet_id: course.mon_tien_quyet_id || ''
    });
    setShowCourseModal(true);
  };

  // Lưu môn học (Thêm mới hoặc Cập nhật)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.mon_hoc_id) {
      alert('Vui lòng chọn môn học');
      return;
    }

    try {
      if (editingCourseId) {
        // Cập nhật
        await facultyService.updateCourseInCurriculum(selectedCurriculum.id, editingCourseId, courseForm);
      } else {
        // Thêm mới
        await facultyService.addCourseToCurriculum(selectedCurriculum.id, courseForm);
      }
      setShowCourseModal(false);
      handleOpenDetail(selectedCurriculum);
    } catch (err) {
      alert('Lỗi lưu môn học: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xóa môn khỏi khung
  const handleRemoveCourse = async (courseId, courseName) => {
    if (!window.confirm(`Xóa môn "${courseName}" khỏi khung đào tạo này?`)) return;
    try {
      await facultyService.removeCourseFromCurriculum(selectedCurriculum.id, courseId);
      handleOpenDetail(selectedCurriculum);
    } catch (err) {
      alert('Lỗi xóa môn: ' + (err.response?.data?.message || err.message));
    }
  };

  // Lọc danh sách CTĐT hiển thị ở ngoài
  const filteredCurriculums = useMemo(() => {
    return curriculums.filter((item) => {
      const matchMajor = filterMajor === 'ALL' || String(item.nganh_hoc_id) === String(filterMajor);
      const matchSearch =
        !searchTerm ||
        item.ten_ctdt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ma_ctdt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.khoa_tuyen_sinh?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMajor && matchSearch;
    });
  }, [curriculums, filterMajor, searchTerm]);

  // Lọc bảng môn học bên trong Modal Chi tiết Khung CTĐT
  const filteredDetailCourses = useMemo(() => {
    if (!curriculumDetail?.courses) return [];
    return curriculumDetail.courses.filter((c) => {
      let matchSem = true;
      if (filterSemester === 'ALL') {
        matchSem = true;
      } else if (filterSemester.startsWith('YEAR_')) {
        const yearNum = parseInt(filterSemester.replace('YEAR_', ''), 10);
        const semStart = (yearNum - 1) * 2 + 1;
        const semEnd = yearNum * 2;
        matchSem = c.hoc_ky_goi_y === semStart || c.hoc_ky_goi_y === semEnd;
      } else {
        matchSem = String(c.hoc_ky_goi_y) === String(filterSemester);
      }

      const matchType = filterType === 'ALL' || c.loai_hoc_phan === filterType;
      const matchText =
        !tableSearch ||
        c.ma_mon?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        c.ten_mon?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        c.dieu_kien_tien_quyet?.toLowerCase().includes(tableSearch.toLowerCase());
      return matchSem && matchType && matchText;
    });
  }, [curriculumDetail, filterSemester, filterType, tableSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Đang tải Chương trình đào tạo Khoa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Button Ban hành CTĐT mới */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <BookOpenCheck className="w-4 h-4" />
            <span>Quản lý Khung Đào tạo Đại học</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Chương trình Đào tạo theo Khóa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cấu hình khung môn học, số tín chỉ, số tiết, điều kiện tiên quyết và nhóm tự chọn chuẩn cổng sinh viên
          </p>
        </div>

        <button
          onClick={() => {
            const firstMajor = majors[0];
            const firstFac = faculties[0];
            setCreateForm((prev) => ({
              ...prev,
              khoa_id: prev.khoa_id || (firstMajor?.khoa_id || (firstFac?.id || '')),
              nganh_hoc_id: prev.nganh_hoc_id || (firstMajor?.id || ''),
              ma_ctdt: prev.ma_ctdt || (firstMajor ? `CTDT_${firstMajor.ma_nganh}_${prev.khoa_tuyen_sinh || '2024'}` : 'CTDT_CNTT_2024'),
              ten_ctdt: prev.ten_ctdt || (firstMajor ? `Chương trình Đào tạo Đại học Chính quy ngành ${firstMajor.ten_nganh} Khóa ${prev.khoa_tuyen_sinh || '2024'}` : 'Chương trình Đào tạo Đại học Chính quy ngành Công nghệ thông tin Khóa 2024'),
              selectedCourses: []
            }));
            setCreateStep(1);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ban hành Khung CTĐT mới</span>
        </button>
      </div>

      {/* 2. Thanh lọc danh sách Khung CTĐT */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã CTĐT, tên CTĐT hoặc khóa (VD: K23, 2023)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm outline-none bg-transparent placeholder-slate-400 text-slate-700"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Ngành:
          </span>
          <select
            value={filterMajor}
            onChange={(e) => setFilterMajor(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500"
          >
            <option value="ALL">Tất cả ngành đào tạo ({majors.length})</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ten_nganh} ({m.ma_nganh})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Danh sách Card các Khung CTĐT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCurriculums.map((ctdt) => (
          <div
            key={ctdt.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-400 shadow-sm transition-all space-y-4 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Khóa {ctdt.khoa_tuyen_sinh}
                </span>
                <span className="text-xs text-slate-400 font-medium">Năm ban hành: {ctdt.nam_ban_hanh}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {ctdt.ten_ctdt}
                </h3>
                <div className="text-xs text-slate-500 mt-2 space-y-1">
                  <p>
                    Mã CTĐT: <strong className="text-slate-700 font-mono">{ctdt.ma_ctdt}</strong>
                  </p>
                  <p>
                    Khoa / Ngành: <span className="font-medium text-slate-700">{ctdt.ten_nganh}</span>
                  </p>
                  <p>
                    Hệ: <span className="text-slate-600">{ctdt.he_dao_tao || 'Đại học chính quy'}</span> • Chuyên ngành: <span className="text-slate-600">{ctdt.chuyen_nganh || 'Chuyên Ngành Chính'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Quy mô:</span>{' '}
                <strong className="text-slate-800">{ctdt.tong_tin_chi_yeu_cau} Tín chỉ</strong>
                <span className="text-slate-400 ml-1">({ctdt.so_hoc_phan || 0} môn)</span>
              </div>
              <button
                onClick={() => handleOpenDetail(ctdt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white font-semibold text-indigo-600 transition-all cursor-pointer"
              >
                <span>Xem & Cấu hình</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCurriculums.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Không tìm thấy khung chương trình đào tạo nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Vui lòng thử bộ lọc khác hoặc bấm "Ban hành Khung CTĐT mới" để khởi tạo khung đào tạo cho sinh viên.
          </p>
        </div>
      )}

      {/* =========================================================================
          4. MODAL CHI TIẾT KHUNG CTĐT (Chuẩn 100% Bảng Cổng Sinh Viên Trường)
         ========================================================================= */}
      {selectedCurriculum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Top Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                    {curriculumDetail?.curriculum?.ma_ctdt || selectedCurriculum.ma_ctdt}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Khóa tuyển sinh: <strong>{curriculumDetail?.curriculum?.khoa_tuyen_sinh || selectedCurriculum.khoa_tuyen_sinh}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {curriculumDetail?.curriculum?.ten_ctdt || selectedCurriculum.ten_ctdt}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddCourse}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm môn vào khung</span>
                </button>
                <button
                  onClick={() => setSelectedCurriculum(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-header Cổng Sinh Viên Style (Khớp 100% hình ảnh) */}
            <div className="bg-slate-50 p-4 border-b border-slate-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      Chuyên Ngành Đào Tạo:
                    </span>
                    <select
                      className="text-xs font-bold text-indigo-700 bg-transparent outline-none cursor-pointer"
                      defaultValue="Chính"
                    >
                      <option value="Chính">
                        {curriculumDetail?.curriculum?.chuyen_nganh || 'Chuyên Ngành Chính'}
                      </option>
                    </select>
                  </div>

                  <div className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-2">
                    <span>Hệ: <strong className="text-slate-800">{curriculumDetail?.curriculum?.he_dao_tao || 'Đại học chính quy 25'}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Khóa: <strong className="text-slate-800">{curriculumDetail?.curriculum?.khoa_tuyen_sinh || '2023'}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Chuyên Ngành: <strong className="text-slate-800">{curriculumDetail?.curriculum?.ten_nganh || 'Công nghệ thông tin'}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Thời gian: {(() => {
                        const maxSem = curriculumDetail?.courses?.reduce((max, c) => Math.max(max, c.hoc_ky_goi_y || 1), 8) || 8;
                        const years = (maxSem / 2).toFixed(1).replace('.0', '');
                        return `${years} Năm (${maxSem} Kỳ)`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Filter bên trong bảng môn học */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm môn..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="outline-none text-xs w-28 bg-transparent"
                    />
                  </div>

                  <select
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-semibold text-slate-700"
                  >
                    <option value="ALL">Tất cả các kỳ & năm</option>
                    <optgroup label="── Lọc theo Năm học ──">
                      <option value="YEAR_1">Năm 1 (Kỳ 1 & Kỳ 2)</option>
                      <option value="YEAR_2">Năm 2 (Kỳ 3 & Kỳ 4)</option>
                      <option value="YEAR_3">Năm 3 (Kỳ 5 & Kỳ 6)</option>
                      <option value="YEAR_4">Năm 4 (Kỳ 7 & Kỳ 8)</option>
                      <option value="YEAR_5">Năm 5 (Kỳ 9 & Kỳ 10)</option>
                    </optgroup>
                    <optgroup label="── Lọc chi tiết theo Kỳ ──">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
                        <option key={k} value={String(k)}>
                          Kỳ {k} (Năm {Math.ceil(k / 2)})
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-slate-700"
                  >
                    <option value="ALL">Tất cả loại</option>
                    <option value="BatBuoc">Bắt buộc</option>
                    <option value="TuChon">Tự chọn</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BẢNG 12 CỘT CHUẨN XÁC THEO HÌNH CỔNG SINH VIÊN */}
            <div className="flex-1 overflow-auto p-4">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredDetailCourses.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  Chưa có môn học nào trong danh sách. Bấm <strong>"Thêm môn vào khung"</strong> để bổ sung môn đào tạo.
                </div>
              ) : (
                <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs">
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
                        <th className="py-2.5 px-2 min-w-[70px]">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredDetailCourses.map((row, idx) => {
                        const isBatBuoc = row.loai_hoc_phan === 'BatBuoc';
                        const isTuChon = row.loai_hoc_phan === 'TuChon';

                        // Khối kiến thức tiếng Việt
                        const khoiLabels = {
                          DaiCuong: 'Đại cương',
                          CoSoNganh: 'Cơ sở ngành',
                          ChuyenNganh: 'Chuyên ngành',
                          TotNghiep: 'Tốt nghiệp'
                        };

                        return (
                          <tr
                            key={row.id || idx}
                            className="hover:bg-slate-50 transition-colors divide-x divide-slate-200 text-slate-800"
                          >
                            {/* 1. Mã học phần */}
                            <td className="py-2 px-3 font-mono font-bold text-slate-700 text-center whitespace-nowrap">
                              {row.ma_mon}
                            </td>

                            {/* 2. Tên học phần */}
                            <td className="py-2 px-3 font-medium text-slate-900">
                              {row.ten_mon}
                            </td>

                            {/* 3. Khối kiến thức */}
                            <td className="py-2 px-3 text-center text-slate-600">
                              {khoiLabels[row.khoi_kien_thuc] || row.khoi_kien_thuc || ''}
                            </td>

                            {/* 4. Kỳ thứ */}
                            <td className="py-2 px-2 text-center whitespace-nowrap">
                              <span className="font-bold text-slate-800">Kỳ {row.hoc_ky_goi_y}</span>
                              <span className="text-[10px] text-indigo-600 block font-medium">Năm {Math.ceil(row.hoc_ky_goi_y / 2)}</span>
                            </td>

                            {/* 5. Số tín chỉ */}
                            <td className="py-2 px-2 text-center font-bold text-indigo-700">
                              {row.so_tin_chi}
                            </td>

                            {/* 6. Số tiết */}
                            <td className="py-2 px-2 text-center text-slate-700">
                              {row.so_tiet ?? (row.so_tin_chi * 15)}
                            </td>

                            {/* 7. Điều kiện tiên quyết */}
                            <td className="py-2 px-3 text-slate-600">
                              {row.dieu_kien_tien_quyet || (row.ma_mon_tien_quyet ? `Tiên quyết : ${row.ma_mon_tien_quyet} - ${row.ten_mon_tien_quyet}` : '')}
                            </td>

                            {/* 8. Bắt buộc (X) */}
                            <td className="py-2 px-2 text-center font-bold text-slate-900">
                              {isBatBuoc ? 'X' : ''}
                            </td>

                            {/* 9. Tự chọn (X) */}
                            <td className="py-2 px-2 text-center font-bold text-slate-900">
                              {isTuChon ? 'X' : ''}
                            </td>

                            {/* 10. Nhóm */}
                            <td className="py-2 px-2 text-center font-medium text-slate-700">
                              {row.nhom_tu_chon || ''}
                            </td>

                            {/* 11. Ghi chú */}
                            <td className="py-2 px-3 text-slate-500 text-[11px]">
                              {row.ghi_chu || ''}
                            </td>

                            {/* 12. Đề cương */}
                            <td className="py-2 px-2 text-center">
                              {row.de_cuong_url ? (
                                <a
                                  href={row.de_cuong_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex text-indigo-600 hover:text-indigo-800"
                                  title="Xem đề cương chi tiết"
                                >
                                  <FileText className="w-4 h-4 mx-auto" />
                                </a>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Thao tác Sửa / Xóa */}
                            <td className="py-2 px-2 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenEditCourse(row)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                                  title="Chỉnh sửa thông tin môn"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveCourse(row.id, row.ten_mon)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Xóa khỏi khung"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer tóm tắt */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span>Tổng số môn: <strong className="text-slate-800">{curriculumDetail?.courses?.length || 0}</strong></span>
                <span>•</span>
                <span>
                  Tổng tín chỉ thực tế:{' '}
                  <strong className="text-indigo-700">
                    {curriculumDetail?.courses?.reduce((acc, cur) => acc + (cur.so_tin_chi || 0), 0) || 0}
                  </strong>{' '}
                  / {selectedCurriculum.tong_tin_chi_yeu_cau || 135} TC yêu cầu
                </span>
              </div>
              <button
                onClick={() => setSelectedCurriculum(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL BAN HÀNH KHUNG CTĐT MỚI (Step Wizard 2 Bước)
         ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Ban hành Khung Chương trình Đào tạo Mới
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bước {createStep}/2: {createStep === 1 ? 'Thông tin cấu hình khung đào tạo' : 'Chọn danh mục môn học ban đầu đưa vào khung'}
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
              <div
                onClick={() => setCreateStep(1)}
                className={`flex items-center gap-2 font-semibold cursor-pointer ${
                  createStep === 1 ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    createStep === 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {createStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </span>
                <span>1. Thông tin Khung CTĐT</span>
              </div>

              <div className="flex-1 mx-4 h-0.5 bg-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    createStep === 2 ? 'w-full bg-indigo-600' : 'w-0'
                  }`}
                ></div>
              </div>

              <div
                onClick={() => setCreateStep(2)}
                className={`flex items-center gap-2 font-semibold cursor-pointer ${
                  createStep === 2 ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    createStep === 2
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  2
                </span>
                <span>2. Chọn Môn học ban đầu ({createForm.selectedCourses.length})</span>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitCreateCurriculum} className="flex-1 overflow-y-auto p-6 space-y-4">
              {createStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Khoa Quản lý */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khoa Quản lý
                      </label>
                      <select
                        value={createForm.khoa_id}
                        onChange={(e) => {
                          const kId = e.target.value;
                          const filteredMajors = majors.filter((m) => !kId || String(m.khoa_id) === String(kId));
                          const nextMajor = filteredMajors[0];
                          const newMajorId = nextMajor ? nextMajor.id : '';
                          const cohort = createForm.khoa_tuyen_sinh || '2024';
                          setCreateForm((prev) => ({
                            ...prev,
                            khoa_id: kId,
                            nganh_hoc_id: newMajorId,
                            ma_ctdt: nextMajor ? `CTDT_${nextMajor.ma_nganh}_${cohort}` : '',
                            ten_ctdt: nextMajor ? `Chương trình Đào tạo Đại học Chính quy ngành ${nextMajor.ten_nganh} Khóa ${cohort}` : ''
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Chọn Khoa Quản lý --</option>
                        {faculties.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.ten_khoa} ({f.ma_khoa})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ngành đào tạo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ngành đào tạo (*)
                      </label>
                      <select
                        required
                        value={createForm.nganh_hoc_id}
                        onChange={(e) => handleMajorOrCohortChange(e.target.value, createForm.khoa_tuyen_sinh)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Chọn Ngành đào tạo --</option>
                        {majors
                          .filter((m) => !createForm.khoa_id || String(m.khoa_id) === String(createForm.khoa_id))
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.ma_nganh} - {m.ten_nganh}
                            </option>
                          ))}
                      </select>
                      {createForm.khoa_id && majors.filter((m) => String(m.khoa_id) === String(createForm.khoa_id)).length === 0 && (
                        <p className="text-[11px] text-amber-600 mt-1">
                          Khoa này chưa có ngành đào tạo nào. Vui lòng vào menu <strong>Ngành đào tạo</strong> để thêm ngành mới.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Hệ đào tạo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hệ đào tạo
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Đại học chính quy 25"
                        value={createForm.he_dao_tao}
                        onChange={(e) => setCreateForm({ ...createForm, he_dao_tao: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Khóa tuyển sinh */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khóa tuyển sinh (*)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: 2024 hoặc K24"
                        value={createForm.khoa_tuyen_sinh}
                        onChange={(e) => handleMajorOrCohortChange(createForm.nganh_hoc_id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    {/* Chuyên ngành đào tạo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chuyên ngành đào tạo
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Chuyên Ngành Chính, Kỹ thuật phần mềm..."
                        value={createForm.chuyen_nganh}
                        onChange={(e) => setCreateForm({ ...createForm, chuyen_nganh: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Mã CTĐT */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mã CTĐT (*)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: CTDT_CNTT_2024"
                        value={createForm.ma_ctdt}
                        onChange={(e) => setCreateForm({ ...createForm, ma_ctdt: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Năm ban hành */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Năm ban hành
                      </label>
                      <input
                        type="number"
                        value={createForm.nam_ban_hanh}
                        onChange={(e) => setCreateForm({ ...createForm, nam_ban_hanh: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Tổng tín chỉ yêu cầu */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tổng tín chỉ yêu cầu
                      </label>
                      <input
                        type="number"
                        value={createForm.tong_tin_chi_yeu_cau}
                        onChange={(e) => setCreateForm({ ...createForm, tong_tin_chi_yeu_cau: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500 font-bold text-indigo-700"
                      />
                    </div>
                  </div>

                  {/* Tên CTĐT */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên chương trình đào tạo (*)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Chương trình Đào tạo Đại học Chính quy ngành Công nghệ thông tin Khóa 2024"
                      value={createForm.ten_ctdt}
                      onChange={(e) => setCreateForm({ ...createForm, ten_ctdt: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Quyết định ban hành */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số Quyết định ban hành (nếu có)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Quyết định số 128/QĐ-ĐHNT ký ngày 15/08/2024"
                      value={createForm.quyet_dinh_ban_hanh}
                      onChange={(e) => setCreateForm({ ...createForm, quyet_dinh_ban_hanh: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                /* STEP 2: CHỌN MÔN HỌC BAN ĐẦU ĐƯA VÀO KHUNG */
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 text-xs text-indigo-800">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        Tích chọn các môn học để đưa ngay vào khung CTĐT này (hoặc có thể bỏ qua và thêm sau).
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 whitespace-nowrap">
                      Đã chọn: {createForm.selectedCourses.length} môn
                    </span>
                  </div>

                  {/* Thanh tìm môn */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm môn học theo mã hoặc tên..."
                      value={courseSearchStep2}
                      onChange={(e) => setCourseSearchStep2(e.target.value)}
                      className="w-full text-xs outline-none bg-transparent"
                    />
                  </div>

                  {/* Danh sách môn để chọn */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {allSubjects
                      .filter(
                        (s) =>
                          (!createForm.khoa_id || !s.khoa_id || String(s.khoa_id) === String(createForm.khoa_id) || s.loai_mon === 'DaiCuong') &&
                          (!courseSearchStep2 ||
                            s.ma_mon.toLowerCase().includes(courseSearchStep2.toLowerCase()) ||
                            s.ten_mon.toLowerCase().includes(courseSearchStep2.toLowerCase()))
                      )
                      .map((sub) => {
                        const isChecked = createForm.selectedCourses.some((c) => c.mon_hoc_id === sub.id);
                        const selectedItem = createForm.selectedCourses.find((c) => c.mon_hoc_id === sub.id);

                        return (
                          <div
                            key={sub.id}
                            className={`p-3 transition-colors ${
                              isChecked ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <label className="flex items-center gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCourseStep2(sub)}
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                />
                                <div>
                                  <span className="font-mono font-bold text-xs text-indigo-700 mr-2">
                                    {sub.ma_mon}
                                  </span>
                                  <span className="text-xs font-medium text-slate-800">{sub.ten_mon}</span>
                                </div>
                              </label>

                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {sub.so_tin_chi} Tín chỉ
                              </span>
                            </div>

                            {/* Cấu hình nhanh cho môn đã chọn */}
                            {isChecked && selectedItem && (
                              <div className="mt-2.5 pt-2.5 border-t border-indigo-100/80 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-500 block mb-0.5">Kỳ học & Năm:</span>
                                  <select
                                    value={selectedItem.hoc_ky_goi_y}
                                    onChange={(e) =>
                                      handleUpdateSelectedCourseStep2(sub.id, 'hoc_ky_goi_y', parseInt(e.target.value, 10))
                                    }
                                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none font-semibold text-slate-700"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
                                      <option key={k} value={k}>
                                        Kỳ {k} (Năm {Math.ceil(k / 2)})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 block mb-0.5">Loại:</span>
                                  <select
                                    value={selectedItem.loai_hoc_phan}
                                    onChange={(e) =>
                                      handleUpdateSelectedCourseStep2(sub.id, 'loai_hoc_phan', e.target.value)
                                    }
                                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none"
                                  >
                                    <option value="BatBuoc">Bắt buộc</option>
                                    <option value="TuChon">Tự chọn</option>
                                  </select>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 block mb-0.5">Số tiết:</span>
                                  <input
                                    type="number"
                                    value={selectedItem.so_tiet}
                                    onChange={(e) =>
                                      handleUpdateSelectedCourseStep2(sub.id, 'so_tiet', parseInt(e.target.value, 10))
                                    }
                                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none"
                                  />
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 block mb-0.5">
                                    {selectedItem.loai_hoc_phan === 'TuChon' ? 'Nhóm TC (VD: 10, 2):' : 'Khối KT:'}
                                  </span>
                                  {selectedItem.loai_hoc_phan === 'TuChon' ? (
                                    <input
                                      type="text"
                                      placeholder="VD: 10"
                                      value={selectedItem.nhom_tu_chon}
                                      onChange={(e) =>
                                        handleUpdateSelectedCourseStep2(sub.id, 'nhom_tu_chon', e.target.value)
                                      }
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none"
                                    />
                                  ) : (
                                    <select
                                      value={selectedItem.khoi_kien_thuc}
                                      onChange={(e) =>
                                        handleUpdateSelectedCourseStep2(sub.id, 'khoi_kien_thuc', e.target.value)
                                      }
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none"
                                    >
                                      <option value="DaiCuong">Đại cương</option>
                                      <option value="CoSoNganh">Cơ sở ngành</option>
                                      <option value="ChuyenNganh">Chuyên ngành</option>
                                    </select>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Footer Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {createStep === 2 ? (
                  <button
                    type="button"
                    onClick={() => setCreateStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại Bước 1</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>

                  {createStep === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!createForm.nganh_hoc_id || !createForm.ma_ctdt || !createForm.ten_ctdt || !createForm.khoa_tuyen_sinh) {
                          alert('Vui lòng chọn Ngành đào tạo, nhập Mã CTĐT, Khóa tuyển sinh và Tên CTĐT!');
                          return;
                        }
                        setCreateStep(2);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                    >
                      <span>Tiếp tục chọn môn</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận Ban hành Khung CTĐT</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL THÊM / CHỈNH SỬA MÔN HỌC VÀO KHUNG CTĐT
         ========================================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourseId ? 'Chỉnh sửa Môn học trong Khung' : 'Thêm Môn học vào Khung CTĐT'}
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5">
              {/* Chọn môn học */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học (*)</label>
                <select
                  required
                  disabled={!!editingCourseId}
                  value={courseForm.mon_hoc_id}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = (curriculumDetail?.allCourses || allSubjects).find((m) => String(m.id) === String(selId));
                    setCourseForm({
                      ...courseForm,
                      mon_hoc_id: selId,
                      so_tiet: found ? (found.so_tin_chi || 3) * 15 : 45
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">-- Chọn môn học từ danh mục --</option>
                  {(curriculumDetail?.allCourses || allSubjects)
                    .filter((m) => {
                      const targetKhoaId = selectedCurriculum?.khoa_id;
                      return !targetKhoaId || !m.khoa_id || String(m.khoa_id) === String(targetKhoaId) || m.loai_mon === 'DaiCuong';
                    })
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.ma_mon} - {m.ten_mon} ({m.so_tin_chi} Tín chỉ)
                      </option>
                    ))}
                </select>
              </div>

              {/* Kỳ học & Khối kiến thức */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kỳ thứ gợi ý & Năm</label>
                  <select
                    value={courseForm.hoc_ky_goi_y}
                    onChange={(e) => setCourseForm({ ...courseForm, hoc_ky_goi_y: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500 font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
                      <option key={k} value={k}>
                        Kỳ {k} (Năm thứ {Math.ceil(k / 2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Khối kiến thức</label>
                  <select
                    value={courseForm.khoi_kien_thuc}
                    onChange={(e) => setCourseForm({ ...courseForm, khoi_kien_thuc: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="DaiCuong">Đại cương</option>
                    <option value="CoSoNganh">Cơ sở ngành</option>
                    <option value="ChuyenNganh">Chuyên ngành</option>
                    <option value="TotNghiep">Tốt nghiệp</option>
                  </select>
                </div>
              </div>

              {/* Loại học phần & Số tiết */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại học phần</label>
                  <select
                    value={courseForm.loai_hoc_phan}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCourseForm({
                        ...courseForm,
                        loai_hoc_phan: val,
                        nhom_tu_chon: val === 'BatBuoc' ? '' : courseForm.nhom_tu_chon
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="BatBuoc">Bắt buộc</option>
                    <option value="TuChon">Tự chọn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số tiết</label>
                  <input
                    type="number"
                    value={courseForm.so_tiet}
                    onChange={(e) => setCourseForm({ ...courseForm, so_tiet: parseInt(e.target.value, 10) })}
                    placeholder="VD: 45, 75, 30..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              {/* Nhóm tự chọn (nếu là tự chọn) */}
              {courseForm.loai_hoc_phan === 'TuChon' && (
                <div>
                  <label className="block text-xs font-semibold text-indigo-700 mb-1">
                    Nhóm tự chọn (VD: 10, 2, Nhóm ngoại ngữ...)
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã nhóm (vd: 10, 2)"
                    value={courseForm.nhom_tu_chon}
                    onChange={(e) => setCourseForm({ ...courseForm, nhom_tu_chon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/30 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Điều kiện tiên quyết */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điều kiện tiên quyết (Chuỗi text hiển thị trong bảng)
                </label>
                <input
                  type="text"
                  placeholder="VD: Tiên quyết : Toán cao cấp 1&2"
                  value={courseForm.dieu_kien_tien_quyet}
                  onChange={(e) => setCourseForm({ ...courseForm, dieu_kien_tien_quyet: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              {/* Ghi chú & Link Đề cương */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    placeholder="Ghi chú thêm..."
                    value={courseForm.ghi_chu}
                    onChange={(e) => setCourseForm({ ...courseForm, ghi_chu: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Link đề cương (URL)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={courseForm.de_cuong_url}
                    onChange={(e) => setCourseForm({ ...courseForm, de_cuong_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {editingCourseId ? 'Cập nhật môn' : 'Thêm vào khung'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
