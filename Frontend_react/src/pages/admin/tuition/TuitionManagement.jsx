import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  X,
  DollarSign,
  Settings,
  Building2,
  Layers,
  GraduationCap,
  Calendar,
  RefreshCw,
  PlusCircle,
  Receipt,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Users,
  TrendingUp,
  LayoutGrid,
  List,
  Eye,
  ArrowLeft,
  Printer,
  FileText,
  UserCheck,
  QrCode
} from 'lucide-react';

export default function TuitionManagement() {
  const [activeTab, setActiveTab] = useState('tuition_list'); // 'tuition_list' | 'faculty_rates'
  const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy' (cây Khoa -> Lớp -> SV) | 'flat' (bảng phẳng tra cứu)
  
  // Drill-down navigation state (4 Tầng)
  const [selectedDrillKhoaId, setSelectedDrillKhoaId] = useState(null);
  const [selectedDrillLopId, setSelectedDrillLopId] = useState(null);
  const [selectedDrillStudentId, setSelectedDrillStudentId] = useState(null);

  const [classFilterStatus, setClassFilterStatus] = useState('all'); // 'all' | 'con_no' | 'da_nop'
  const [classSearch, setClassSearch] = useState('');

  // Pagination for student list in class
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [tuitions, setTuitions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [facultyRates, setFacultyRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Filters for Flat view
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Modal Xác nhận nộp tiền / Xuất biên lai
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    so_tien_da_dong: '',
    so_tien_con_no: 0,
    so_tien_mien_giam: 0,
    trang_thai: 'DaHoanThanh',
    so_bien_lai: '',
    so_hd_dien_tu: '',
    hinh_thuc_thanh_toan: 'ChuyenKhoan',
    ngay_nop_tien: new Date().toISOString().slice(0, 10),
    ghi_chu_ke_toan: 'Đã nộp đủ học phí qua tài khoản nhà trường'
  });

  // Modal In Biên Lai / Hóa Đơn Điện Tử
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Modal Cấu hình định mức học phí Khoa
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [rateForm, setRateForm] = useState({
    hoc_phi_ky_chuan: 11800000,
    don_gia_tin_chi: 480000,
    phi_bhyt: 632000,
    thong_tin_quy_dinh: 'Học phí nộp theo đợt qua tài khoản nhà trường hoặc trực tiếp tại Phòng Kế toán.',
    danh_muc_khoan_thu: ['Học phí học kỳ', 'Bảo hiểm y tế']
  });

  // Modal Áp dụng định mức cho Lớp / Cả Khoa
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    khoa_id: '',
    lop_id: 'all',
    hoc_ky_id: '',
    hoc_ky_nien_khoa: '1',
    nam_hoc_nien_khoa: '2025-2026',
    dot: 1,
    muc_thu_hoc_phi: 11800000,
    cap_nhat_tat_ca: true,
    han_chot_nop: ''
  });

  // Tải danh sách học phí & bộ lọc
  const fetchTuition = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllTuition({
        khoa_id: selectedFaculty !== 'all' ? selectedFaculty : undefined,
        lop_id: selectedClass !== 'all' ? selectedClass : undefined,
        hoc_ky_id: selectedSemester !== 'all' ? selectedSemester : undefined,
        trang_thai: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: search || undefined
      });

      const payload = res?.data?.success ? res.data.data : (res?.success ? res.data : null);
      if (payload) {
        setTuitions(payload.tuitions || []);
        setFaculties(payload.faculties || []);
        setClasses(payload.classes || []);
        setSemesters(payload.semesters || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách học phí:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách định mức học phí theo Khoa
  const fetchFacultyRates = async () => {
    try {
      setRatesLoading(true);
      const res = await adminService.getFacultyTuitionRates();
      const payload = res?.data?.success ? res.data.data : (res?.success ? res.data : null);
      if (payload) {
        setFacultyRates(payload || []);
      }
    } catch (err) {
      console.error('Lỗi tải định mức học phí khoa:', err);
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    fetchTuition();
  }, [selectedFaculty, selectedClass, selectedSemester, selectedStatus]);

  useEffect(() => {
    if (activeTab === 'faculty_rates') {
      fetchFacultyRates();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTuition();
  };

  // Mở modal thu tiền / xuất biên lai
  const handleOpenConfirm = (t) => {
    setSelectedTuition(t);
    const phaiNop = parseFloat(t.tong_hoc_phi_phai_nop || 0);
    const mienGiam = parseFloat(t.so_tien_mien_giam || 0);
    const daNopHienTai = parseFloat(t.so_tien_da_dong || 0);
    const conNo = Math.max(0, phaiNop - mienGiam - daNopHienTai);

    setConfirmForm({
      so_tien_da_dong: conNo > 0 ? conNo : phaiNop,
      so_tien_con_no: 0,
      so_tien_mien_giam: mienGiam,
      trang_thai: 'DaHoanThanh',
      so_bien_lai: t.so_bien_lai || `${Math.floor(1000 + Math.random() * 9000)}`,
      so_hd_dien_tu: t.so_hd_dien_tu || `HD-${Date.now().toString().slice(-6)}`,
      hinh_thuc_thanh_toan: 'ChuyenKhoan',
      ngay_nop_tien: new Date().toISOString().slice(0, 10),
      ghi_chu_ke_toan: 'Đã nộp đủ học phí qua tài khoản nhà trường'
    });
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    try {
      const phaiNop = parseFloat(selectedTuition.tong_hoc_phi_phai_nop || 0);
      const mienGiam = parseFloat(confirmForm.so_tien_mien_giam || 0);
      const tienDong = parseFloat(confirmForm.so_tien_da_dong || 0);
      const conNo = Math.max(0, phaiNop - mienGiam - tienDong);

      await adminService.confirmTuition(selectedTuition.id, {
        so_tien_da_dong: tienDong,
        so_tien_con_no: conNo,
        so_tien_mien_giam: mienGiam,
        trang_thai: conNo === 0 ? 'DaHoanThanh' : 'ChuaDong',
        so_bien_lai: confirmForm.so_bien_lai,
        so_hd_dien_tu: confirmForm.so_hd_dien_tu,
        ghi_chu_ke_toan: `${confirmForm.ghi_chu_ke_toan} (${confirmForm.hinh_thuc_thanh_toan === 'ChuyenKhoan' ? 'Chuyển khoản' : 'Tiền mặt'})`,
        ngay_nop_tien: confirmForm.ngay_nop_tien
      });

      setShowConfirmModal(false);
      fetchTuition();
      alert('Đã ghi nhận thu tiền & xuất biên lai thành công! Biên lai đã đồng bộ ngay sang Cổng sinh viên (Mục III).');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Mở modal in biên lai
  const handleOpenInvoiceModal = (receipt, svInfo = {}) => {
    setSelectedInvoice({
      receipt,
      svInfo
    });
    setShowInvoiceModal(true);
  };

  // Mở modal cấu hình định mức Khoa
  const handleOpenEditRate = (faculty) => {
    setEditingFaculty(faculty);
    let parsedConfig = {};
    if (faculty.cau_hinh_khoan_thu) {
      try {
        parsedConfig = typeof faculty.cau_hinh_khoan_thu === 'string'
          ? JSON.parse(faculty.cau_hinh_khoan_thu)
          : faculty.cau_hinh_khoan_thu;
      } catch (e) {
        parsedConfig = {};
      }
    }

    setRateForm({
      hoc_phi_ky_chuan: faculty.hoc_phi_ky_chuan || 11800000,
      don_gia_tin_chi: faculty.don_gia_tin_chi || 480000,
      phi_bhyt: faculty.phi_bhyt || 632000,
      thong_tin_quy_dinh: parsedConfig.thong_tin_quy_dinh || 'Học phí nộp theo kỳ qua tài khoản nhà trường hoặc trực tiếp tại Phòng Kế toán.',
      danh_muc_khoan_thu: parsedConfig.danh_muc_khoan_thu || ['Học phí học kỳ', 'Bảo hiểm y tế']
    });
    setShowRateModal(true);
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateFacultyTuitionRates(editingFaculty.id, {
        hoc_phi_ky_chuan: rateForm.hoc_phi_ky_chuan,
        don_gia_tin_chi: rateForm.don_gia_tin_chi,
        phi_bhyt: rateForm.phi_bhyt,
        cau_hinh_khoan_thu: {
          thong_tin_quy_dinh: rateForm.thong_tin_quy_dinh,
          danh_muc_khoan_thu: rateForm.danh_muc_khoan_thu
        }
      });
      setShowRateModal(false);
      fetchFacultyRates();
      fetchTuition();
      alert(`Đã lưu cấu hình định mức học phí cho ${editingFaculty.ten_khoa} thành công!`);
    } catch (err) {
      alert('Lỗi khi lưu định mức: ' + (err.response?.data?.message || err.message));
    }
  };

  // Mở modal áp dụng định mức
  const handleOpenApplyModal = (facultyId = null) => {
    const targetKhoaId = facultyId || (faculties[0]?.id || '');
    const foundKhoa = faculties.find(f => f.id === targetKhoaId) || facultyRates.find(f => f.id === targetKhoaId);
    const defaultRate = foundKhoa?.hoc_phi_ky_chuan || 11800000;

    setApplyForm({
      khoa_id: targetKhoaId,
      lop_id: 'all',
      hoc_ky_id: semesters[0]?.id || '',
      hoc_ky_nien_khoa: '1',
      nam_hoc_nien_khoa: '2025-2026',
      dot: 1,
      muc_thu_hoc_phi: defaultRate,
      cap_nhat_tat_ca: true,
      han_chot_nop: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    });
    setShowApplyModal(true);
  };

  const handleApplyRateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.applyFacultyTuitionRate(applyForm);
      setShowApplyModal(false);
      fetchTuition();
      fetchFacultyRates();
      alert(res?.data?.message || res?.message || 'Đã áp dụng định mức học phí thành công!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  // =========================================================================
  // LOGIC GOM NHÓM DỮ LIỆU THÔNG MINH THEO KHOA -> LỚP -> SINH VIÊN
  // =========================================================================
  const { facultyTree, totalStats } = useMemo(() => {
    const kMap = {};
    let totalPhaiThu = 0;
    let totalDaThu = 0;
    let totalConNo = 0;
    let totalSvSet = new Set();
    let totalCompleted = 0;

    tuitions.forEach(t => {
      const kId = t.khoa_id || 0;
      const kName = t.ten_khoa || 'Khoa chưa phân loại';
      const kCode = t.ma_khoa || '';

      const pNop = parseFloat(t.tong_hoc_phi_phai_nop || 0);
      const dThu = parseFloat(t.so_tien_da_dong || 0);
      const cNo = parseFloat(t.so_tien_con_no || 0);
      const isCompleted = t.trang_thai === 'DaHoanThanh';

      totalPhaiThu += pNop;
      totalDaThu += dThu;
      totalConNo += cNo;
      totalSvSet.add(t.sinh_vien_id);
      if (isCompleted) totalCompleted++;

      if (!kMap[kId]) {
        kMap[kId] = {
          id: kId,
          ten_khoa: kName,
          ma_khoa: kCode,
          tong_sv_set: new Set(),
          tong_phai_thu: 0,
          tong_da_thu: 0,
          tong_con_no: 0,
          so_sv_hoan_thanh: 0,
          so_sv_con_no: 0,
          classesMap: {}
        };
      }

      const fg = kMap[kId];
      fg.tong_sv_set.add(t.sinh_vien_id);
      fg.tong_phai_thu += pNop;
      fg.tong_da_thu += dThu;
      fg.tong_con_no += cNo;
      if (isCompleted) fg.so_sv_hoan_thanh++;
      else fg.so_sv_con_no++;

      const lId = t.lop_id || 0;
      const lName = t.ten_lop || 'Lớp chưa phân loại';
      const lNganh = t.ten_nganh || '';

      if (!fg.classesMap[lId]) {
        fg.classesMap[lId] = {
          id: lId,
          ten_lop: lName,
          ma_lop: t.ma_lop || '',
          ten_nganh: lNganh,
          khoa_id: kId,
          ten_khoa: kName,
          tong_sv_set: new Set(),
          tong_phai_thu: 0,
          tong_da_thu: 0,
          tong_con_no: 0,
          so_sv_hoan_thanh: 0,
          so_sv_con_no: 0,
          students: []
        };
      }

      const cg = fg.classesMap[lId];
      cg.tong_sv_set.add(t.sinh_vien_id);
      cg.tong_phai_thu += pNop;
      cg.tong_da_thu += dThu;
      cg.tong_con_no += cNo;
      if (isCompleted) cg.so_sv_hoan_thanh++;
      else cg.so_sv_con_no++;
      cg.students.push(t);
    });

    const fTree = Object.values(kMap).map(fg => ({
      ...fg,
      tong_sv: fg.tong_sv_set.size,
      ti_le_hoan_thanh: fg.tong_phai_thu > 0 ? Math.round((fg.tong_da_thu / fg.tong_phai_thu) * 100) : 100,
      classes: Object.values(fg.classesMap).map(cg => ({
        ...cg,
        tong_sv: cg.tong_sv_set.size,
        ti_le_hoan_thanh: cg.tong_phai_thu > 0 ? Math.round((cg.tong_da_thu / cg.tong_phai_thu) * 100) : 100
      }))
    }));

    return {
      facultyTree: fTree,
      totalStats: {
        tong_sv: totalSvSet.size,
        tong_ban_ghi: tuitions.length,
        tong_phai_thu: totalPhaiThu,
        tong_da_thu: totalDaThu,
        tong_con_no: totalConNo,
        so_sv_hoan_thanh: totalCompleted,
        ti_le_hoan_thanh: totalPhaiThu > 0 ? Math.round((totalDaThu / totalPhaiThu) * 100) : 100
      }
    };
  }, [tuitions]);

  // Khoa đang chọn
  const activeKhoaObj = useMemo(() => {
    if (!selectedDrillKhoaId) return null;
    return facultyTree.find(f => f.id === selectedDrillKhoaId) || null;
  }, [facultyTree, selectedDrillKhoaId]);

  // Lớp đang chọn
  const activeLopObj = useMemo(() => {
    if (!activeKhoaObj || !selectedDrillLopId) return null;
    return activeKhoaObj.classes.find(c => c.id === selectedDrillLopId) || null;
  }, [activeKhoaObj, selectedDrillLopId]);

  // Danh sách Tóm tắt từng Sinh viên trong Lớp (Mỗi SV = 1 dòng tổng hợp)
  const studentSummariesInClass = useMemo(() => {
    if (!activeLopObj) return [];
    const svMap = {};

    activeLopObj.students.forEach(t => {
      const svId = t.sinh_vien_id;
      if (!svMap[svId]) {
        svMap[svId] = {
          sinh_vien_id: svId,
          ma_sv: t.ma_sv,
          ho_ten: t.ho_ten,
          email: t.email,
          sdt: t.sdt,
          ten_lop: t.ten_lop,
          ten_khoa: t.ten_khoa,
          tong_phai_nop: 0,
          tong_da_nop: 0,
          tong_con_no: 0,
          tong_mien_giam: 0,
          so_khoan_thu: 0,
          so_khoan_da_hoan_thanh: 0,
          so_khoan_con_no: 0,
          items: []
        };
      }
      const sv = svMap[svId];
      const pNop = parseFloat(t.tong_hoc_phi_phai_nop || 0);
      const dNop = parseFloat(t.so_tien_da_dong || 0);
      const cNo = parseFloat(t.so_tien_con_no || 0);
      const mGiam = parseFloat(t.so_tien_mien_giam || 0);

      sv.tong_phai_nop += pNop;
      sv.tong_da_nop += dNop;
      sv.tong_con_no += cNo;
      sv.tong_mien_giam += mGiam;
      sv.so_khoan_thu++;
      if (t.trang_thai === 'DaHoanThanh') sv.so_khoan_da_hoan_thanh++;
      else sv.so_khoan_con_no++;

      sv.items.push(t);
    });

    let list = Object.values(svMap);

    if (classFilterStatus === 'con_no') {
      list = list.filter(s => s.tong_con_no > 0);
    } else if (classFilterStatus === 'da_nop') {
      list = list.filter(s => s.tong_con_no === 0);
    }

    if (classSearch.trim()) {
      const q = classSearch.toLowerCase().trim();
      list = list.filter(s =>
        (s.ma_sv && s.ma_sv.toLowerCase().includes(q)) ||
        (s.ho_ten && s.ho_ten.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeLopObj, classFilterStatus, classSearch]);

  // Phân trang danh sách sinh viên
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return studentSummariesInClass.slice(start, start + pageSize);
  }, [studentSummariesInClass, currentPage, pageSize]);

  const totalPages = Math.ceil(studentSummariesInClass.length / pageSize) || 1;

  // Dữ liệu chi tiết của Cá nhân Sinh viên được chọn (TẦNG 4)
  const activeStudentFinancialProfile = useMemo(() => {
    if (!activeLopObj || !selectedDrillStudentId) return null;
    const svRecords = activeLopObj.students.filter(t => t.sinh_vien_id === selectedDrillStudentId);
    if (svRecords.length === 0) return null;

    const baseInfo = svRecords[0];
    let pNop = 0, dNop = 0, cNo = 0, mGiam = 0;
    const groupKhoanThu = {};

    svRecords.forEach(item => {
      const p = parseFloat(item.tong_hoc_phi_phai_nop || 0);
      const d = parseFloat(item.so_tien_da_dong || 0);
      const c = parseFloat(item.so_tien_con_no || 0);
      const m = parseFloat(item.so_tien_mien_giam || 0);

      pNop += p;
      dNop += d;
      cNo += c;
      mGiam += m;

      const k = item.khoan_thu || 'Học phí học kỳ';
      if (!groupKhoanThu[k]) {
        groupKhoanThu[k] = { khoan_thu: k, phai_nop: 0, da_nop: 0, hoan_tra: 0, mien_giam: 0 };
      }
      groupKhoanThu[k].phai_nop += p;
      groupKhoanThu[k].da_nop += d;
      groupKhoanThu[k].mien_giam += m;
    });

    const tongHopChung = Object.values(groupKhoanThu).map((g, idx) => ({
      stt: idx + 1,
      khoan_thu: g.khoan_thu,
      so_tien_phai_nop: g.phai_nop,
      so_tien_da_nop: g.da_nop,
      so_tien_hoan_tra: 0,
      so_tien_thieu_thua: Math.max(0, (g.phai_nop - g.mien_giam) - g.da_nop)
    }));

    const bienLaiList = svRecords
      .filter(item => parseFloat(item.so_tien_da_dong || 0) > 0 || item.so_bien_lai)
      .map((item, idx) => ({
        stt: idx + 1,
        id: item.id,
        hoc_ky: item.hoc_ky_nien_khoa || 1,
        nam_hoc: item.nam_hoc_nien_khoa || '2025-2026',
        so_phieu: item.so_bien_lai || `${item.id}`,
        so_hd_dien_tu: item.so_hd_dien_tu || '',
        ngay_thang: item.ngay_nop_tien || item.created_at,
        khoan_thu_chi: item.khoan_thu || 'Học phí học kỳ',
        so_tien: parseFloat(item.so_tien_da_dong || 0),
        thu: item.loai_giao_dich !== 'Chi',
        chi: item.loai_giao_dich === 'Chi'
      }));

    return {
      sinh_vien_id: selectedDrillStudentId,
      ma_sv: baseInfo.ma_sv,
      ho_ten: baseInfo.ho_ten,
      email: baseInfo.email,
      sdt: baseInfo.sdt,
      ten_lop: baseInfo.ten_lop,
      ten_khoa: baseInfo.ten_khoa,
      tong_phai_nop: pNop,
      tong_da_nop: dNop,
      tong_con_no: cNo,
      tong_mien_giam: mGiam,
      tong_hop_chung: tongHopChung,
      items: svRecords,
      bien_lai_list: bienLaiList
    };
  }, [activeLopObj, selectedDrillStudentId]);

  // Lọc lớp theo khoa đã chọn trong filter Flat
  const filteredClasses = selectedFaculty === 'all'
    ? classes
    : classes.filter(c => c.khoa_id === parseInt(selectedFaculty, 10));

  // Lọc lớp theo khoa được chọn trong modal apply
  const applyClasses = applyForm.khoa_id
    ? classes.filter(c => c.khoa_id === parseInt(applyForm.khoa_id, 10))
    : classes;

  return (
    <div className="space-y-6 pb-12">
      {/* Header chính */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Phòng Kế hoạch & Tài chính • Cổng Quản trị Admin</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Học Phí & Công Nợ Sinh Viên</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cấu trúc phân cấp 4 tầng: <strong>Khoa Đào tạo $\rightarrow$ Lớp sinh hoạt $\rightarrow$ Danh sách SV $\rightarrow$ Chi tiết công nợ từng SV</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenApplyModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Áp dụng định mức kỳ mới</span>
          </button>
          <button
            onClick={fetchTuition}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Thẻ KPI Tổng Quan Toàn Trường */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Sinh Viên</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatNumber(totalStats.tong_sv)} SV</h3>
            <p className="text-xs text-slate-400 mt-0.5">{totalStats.tong_ban_ghi} bản ghi khoản thu</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Phải Thu</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatVND(totalStats.tong_phai_thu)}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{faculties.length} Khoa đào tạo</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Đã Thu</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatVND(totalStats.tong_da_thu)}</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Đạt {totalStats.ti_le_hoan_thanh}% kế hoạch</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Còn Nợ</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{formatVND(totalStats.tong_con_no)}</h3>
            <p className="text-xs text-rose-500 mt-0.5">Cần nhắc nhở sinh viên</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs điều hướng 2 phân hệ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tuition_list')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'tuition_list'
                ? 'border-sky-600 text-sky-600 bg-sky-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>1. Thu Học Phí & Quản Lý Công Nợ</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-semibold">
              {totalStats.tong_sv} SV
            </span>
          </button>

          <button
            onClick={() => setActiveTab('faculty_rates')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'faculty_rates'
                ? 'border-sky-600 text-sky-600 bg-sky-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>2. Cấu Hình Định Mức Học Phí Khoa</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 font-semibold">
              {faculties.length} Khoa
            </span>
          </button>
        </div>

        {/* Nút chuyển đổi View Mode (Chỉ hiện khi ở Tab 1) */}
        {activeTab === 'tuition_list' && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-2 sm:mb-0">
            <button
              onClick={() => {
                setViewMode('hierarchy');
                setSelectedDrillStudentId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'hierarchy'
                  ? 'bg-white text-sky-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Xem Phân Cấp (Khoa $\rightarrow$ Lớp $\rightarrow$ SV)</span>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'flat'
                  ? 'bg-white text-sky-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tra Cứu Nhanh Toàn Trường</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          TAB 1: THU HỌC PHÍ & QUẢN LÝ CÔNG NỢ
          ========================================================================= */}
      {activeTab === 'tuition_list' && (
        <div className="space-y-6">
          {/* -------------------------------------------------------------
              CHẾ ĐỘ 1: XEM PHÂN CẤP 4 TẦNG (KHOA -> LỚP -> SINH VIÊN -> CHI TIẾT)
              ------------------------------------------------------------- */}
          {viewMode === 'hierarchy' && (
            <div className="space-y-6">
              {/* Breadcrumb điều hướng 4 tầng */}
              <div className="bg-white rounded-2xl px-5 py-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedDrillKhoaId(null);
                      setSelectedDrillLopId(null);
                      setSelectedDrillStudentId(null);
                    }}
                    className={`hover:text-sky-600 transition cursor-pointer ${
                      !selectedDrillKhoaId ? 'font-bold text-sky-600' : ''
                    }`}
                  >
                    🏢 Tất Cả Các Khoa ({facultyTree.length})
                  </button>

                  {activeKhoaObj && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                      <button
                        onClick={() => {
                          setSelectedDrillLopId(null);
                          setSelectedDrillStudentId(null);
                        }}
                        className={`hover:text-sky-600 transition cursor-pointer ${
                          selectedDrillKhoaId && !selectedDrillLopId ? 'font-bold text-sky-600' : ''
                        }`}
                      >
                        Khoa: {activeKhoaObj.ten_khoa} ({activeKhoaObj.classes.length} Lớp)
                      </button>
                    </>
                  )}

                  {activeLopObj && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                      <button
                        onClick={() => setSelectedDrillStudentId(null)}
                        className={`hover:text-sky-600 transition cursor-pointer ${
                          selectedDrillLopId && !selectedDrillStudentId ? 'font-bold text-sky-600' : ''
                        }`}
                      >
                        Lớp: {activeLopObj.ten_lop} ({activeLopObj.tong_sv} SV)
                      </button>
                    </>
                  )}

                  {activeStudentFinancialProfile && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                      <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                        Sinh viên: {activeStudentFinancialProfile.ho_ten} ({activeStudentFinancialProfile.ma_sv})
                      </span>
                    </>
                  )}
                </div>

                {(selectedDrillKhoaId || selectedDrillLopId || selectedDrillStudentId) && (
                  <button
                    onClick={() => {
                      if (selectedDrillStudentId) setSelectedDrillStudentId(null);
                      else if (selectedDrillLopId) setSelectedDrillLopId(null);
                      else setSelectedDrillKhoaId(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại cấp trước</span>
                  </button>
                )}
              </div>

              {/* TẦNG 1: CHƯA CHỌN KHOA NÀO -> HIỂN THỊ CÁC THẺ KHOA */}
              {!selectedDrillKhoaId && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {facultyTree.map((f) => (
                    <div
                      key={f.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase">
                              Khoa {f.ma_khoa}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1">{f.ten_khoa}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {f.classes.length} Lớp sinh hoạt • <strong>{f.tong_sv} Sinh viên</strong>
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Thanh tiến độ thu học phí của Khoa */}
                        <div className="pt-3 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Tiến độ thu học phí:</span>
                            <span className="font-bold text-emerald-600">{f.ti_le_hoan_thanh}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, f.ti_le_hoan_thanh)}%` }}
                            ></div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                              <span className="text-[11px] text-emerald-700">Đã thu:</span>
                              <div className="font-bold text-emerald-800 text-sm mt-0.5">
                                {formatVND(f.tong_da_thu)}
                              </div>
                              <span className="text-[10px] text-emerald-600">{f.so_sv_hoan_thanh} lượt hoàn thành</span>
                            </div>

                            <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                              <span className="text-[11px] text-rose-700">Còn nợ:</span>
                              <div className="font-bold text-rose-800 text-sm mt-0.5">
                                {formatVND(f.tong_con_no)}
                              </div>
                              <span className="text-[10px] text-rose-600">{f.so_sv_con_no} lượt chưa nộp</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDrillKhoaId(f.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <span>Xem chi tiết {f.classes.length} Lớp của Khoa</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TẦNG 2: ĐÃ CHỌN KHOA -> HIỂN THỊ CÁC THẺ LỚP TRONG KHOA ĐÓ */}
              {selectedDrillKhoaId && !selectedDrillLopId && activeKhoaObj && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Danh Sách Các Lớp Thuộc {activeKhoaObj.ten_khoa}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Chọn một lớp sinh hoạt để xem danh sách sinh viên của lớp
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeKhoaObj.classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                                Lớp {cls.ma_lop}
                              </span>
                              <h3 className="text-base font-bold text-slate-900 mt-1">{cls.ten_lop}</h3>
                              {cls.ten_nganh && (
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                  Ngành: {cls.ten_nganh}
                                </p>
                              )}
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                              {cls.tong_sv} SV
                            </div>
                          </div>

                          {/* Tiến độ thu tiền của lớp */}
                          <div className="pt-2 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Tỷ lệ nộp đủ:</span>
                              <span className="font-bold text-emerald-600">{cls.ti_le_hoan_thanh}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, cls.ti_le_hoan_thanh)}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 pt-1">
                              <span>Đã thu:</span>
                              <strong className="text-emerald-700">{formatVND(cls.tong_da_thu)}</strong>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                              <span>Còn nợ:</span>
                              <strong className={cls.tong_con_no > 0 ? 'text-rose-600' : 'text-slate-400'}>
                                {cls.tong_con_no > 0 ? formatVND(cls.tong_con_no) : '0 VNĐ'}
                              </strong>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                ✓ {cls.so_sv_hoan_thanh} SV nộp đủ
                              </span>
                              {cls.so_sv_con_no > 0 && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700">
                                  ⚠ {cls.so_sv_con_no} SV còn nợ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedDrillLopId(cls.id);
                            setSelectedDrillStudentId(null);
                            setCurrentPage(1);
                            setClassFilterStatus('all');
                            setClassSearch('');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mở danh sách SV Lớp ({cls.tong_sv})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TẦNG 3: ĐÃ CHỌN LỚP -> DANH SÁCH TỪNG SINH VIÊN CỦA LỚP (MỖI SV = 1 DÒNG) */}
              {activeLopObj && !selectedDrillStudentId && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
                  {/* Header của lớp */}
                  <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-sky-700 font-bold uppercase">
                        <span>Khoa {activeLopObj.ten_khoa}</span>
                        <span>•</span>
                        <span>{activeLopObj.ten_nganh || 'Chương trình chuẩn'}</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        Danh Sách Học Phí Lớp: {activeLopObj.ten_lop}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sĩ số: <strong>{activeLopObj.tong_sv} sinh viên</strong> • Bấm <strong>"Xem chi tiết học phí"</strong> của từng sinh viên để xem sinh viên này đã nộp những khoản nào & biên lai
                      </p>
                    </div>

                    {/* Bộ lọc nhanh trong lớp */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                        <button
                          onClick={() => { setClassFilterStatus('all'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                            classFilterStatus === 'all' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tất cả ({activeLopObj.tong_sv})
                        </button>
                        <button
                          onClick={() => { setClassFilterStatus('con_no'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                            classFilterStatus === 'con_no' ? 'bg-rose-600 text-white font-bold' : 'text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          Còn nợ
                        </button>
                        <button
                          onClick={() => { setClassFilterStatus('da_nop'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                            classFilterStatus === 'da_nop' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          Đã nộp đủ
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm MSSV, họ tên..."
                          value={classSearch}
                          onChange={(e) => { setClassSearch(e.target.value); setCurrentPage(1); }}
                          className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white w-48"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      </div>
                    </div>
                  </div>

                  {/* Bảng sinh viên (Mỗi sinh viên 1 dòng duy nhất) */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                          <th className="py-3 px-3 text-center w-12">STT</th>
                          <th className="py-3 px-3">MSSV</th>
                          <th className="py-3 px-4">Họ và tên</th>
                          <th className="py-3 px-3 text-center">Số khoản thu</th>
                          <th className="py-3 px-3 text-right">Tổng phải nộp</th>
                          <th className="py-3 px-3 text-right">Tổng miễn giảm</th>
                          <th className="py-3 px-3 text-right">Tổng đã nộp</th>
                          <th className="py-3 px-3 text-right">Tổng còn nợ</th>
                          <th className="py-3 px-3 text-center">Tình trạng nộp</th>
                          <th className="py-3 px-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedStudents.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-10 text-center text-slate-400">
                              Không có sinh viên nào phù hợp với bộ lọc trong lớp này.
                            </td>
                          </tr>
                        ) : (
                          paginatedStudents.map((sv, idx) => (
                            <tr key={sv.sinh_vien_id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-3 text-center text-slate-500 font-medium">
                                {(currentPage - 1) * pageSize + idx + 1}
                              </td>
                              <td className="py-3 px-3 font-bold text-sky-700">{sv.ma_sv}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{sv.ho_ten}</td>
                              <td className="py-3 px-3 text-center text-slate-600 font-medium">
                                <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                                  {sv.so_khoan_thu} khoản thu
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-semibold text-slate-900">
                                {formatNumber(sv.tong_phai_nop)}
                              </td>
                              <td className="py-3 px-3 text-right font-semibold text-amber-600">
                                {sv.tong_mien_giam > 0 ? formatNumber(sv.tong_mien_giam) : '0'}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-emerald-600">
                                {formatNumber(sv.tong_da_nop)}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-rose-600">
                                {sv.tong_con_no > 0 ? formatNumber(sv.tong_con_no) : '0'}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {sv.tong_con_no === 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Đã nộp đủ</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Còn nợ {formatVND(sv.tong_con_no)}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => setSelectedDrillStudentId(sv.sinh_vien_id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-sm transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Xem chi tiết học phí</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Phân trang danh sách sinh viên */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, studentSummariesInClass.length)} trên {studentSummariesInClass.length} sinh viên
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                              currentPage === p
                                ? 'bg-sky-600 text-white border-sky-600'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TẦNG 4: CHI TIẾT TÀI CHÍNH CÔNG NỢ CỦA CÁ NHÂN SINH VIÊN ĐƯỢC CHỌN (CHUẨN 3 PHẦN NHƯ SINH VIÊN) */}
              {activeStudentFinancialProfile && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                  {/* Header thông tin sinh viên */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                        {activeStudentFinancialProfile.ho_ten.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">{activeStudentFinancialProfile.ho_ten}</h2>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                            {activeStudentFinancialProfile.ma_sv}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Lớp: <strong>{activeStudentFinancialProfile.ten_lop}</strong> • Khoa: <strong>{activeStudentFinancialProfile.ten_khoa}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDrillStudentId(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại danh sách SV lớp {activeStudentFinancialProfile.ten_lop}</span>
                    </button>
                  </div>

                  {/* 4 Ô TỔNG SỐ TIỀN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Tổng số tiền phải nộp:</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900">
                        {formatNumber(activeStudentFinancialProfile.tong_phai_nop)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Tổng số tiền đã nộp:</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700">
                        {formatNumber(activeStudentFinancialProfile.tong_da_nop)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Tổng số tiền hoàn trả:</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700">
                        0
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Tổng số tiền thừa/thiếu:</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-rose-700">
                        {formatNumber(activeStudentFinancialProfile.tong_con_no)}
                      </div>
                    </div>
                  </div>

                  {/* MỤC I. TỔNG HỢP CHUNG */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wide">
                      I. TỔNG HỢP CHUNG
                    </h3>
                    <div className="overflow-x-auto border-t border-b border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/70 text-slate-700 font-bold border-b border-slate-200">
                            <th className="py-2.5 px-3 text-center w-12">STT</th>
                            <th className="py-2.5 px-4">KHOẢN THU</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN PHẢI NỘP</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN ĐÃ NỘP</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN HOÀN TRẢ</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN THIẾU/THỪA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeStudentFinancialProfile.tong_hop_chung.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60 transition">
                              <td className="py-2 px-3 text-center text-slate-600">{idx + 1}</td>
                              <td className="py-2 px-4 font-medium text-slate-800">{item.khoan_thu}</td>
                              <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_phai_nop)}</td>
                              <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_da_nop)}</td>
                              <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_hoan_tra)}</td>
                              <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_thieu_thua)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MỤC II. CÁC KHOẢN PHẢI NỘP */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wide">
                      II. CÁC KHOẢN PHẢI NỘP (CÁC ĐỢT THU)
                    </h3>
                    <div className="overflow-x-auto border-t border-b border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/70 text-slate-700 font-bold border-b border-slate-200">
                            <th className="py-2.5 px-3 text-center w-12">STT</th>
                            <th className="py-2.5 px-3 text-center">HỌC KỲ</th>
                            <th className="py-2.5 px-3 text-center">NĂM HỌC</th>
                            <th className="py-2.5 px-3 text-center">ĐỢT</th>
                            <th className="py-2.5 px-4">KHOẢN THU</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN PHẢI NỘP</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN MIỄN GIẢM</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN CÒN NỘP</th>
                            <th className="py-2.5 px-3 text-center">TRẠNG THÁI</th>
                            <th className="py-2.5 px-3 text-center">THAO TÁC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeStudentFinancialProfile.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-2.5 px-3 text-center text-slate-600">{idx + 1}</td>
                              <td className="py-2.5 px-3 text-center text-slate-700">{item.hoc_ky_nien_khoa || 1}</td>
                              <td className="py-2.5 px-3 text-center text-slate-700">{item.nam_hoc_nien_khoa || item.nam_hoc}</td>
                              <td className="py-2.5 px-3 text-center text-slate-700">{item.dot || 1}</td>
                              <td className="py-2.5 px-4 font-medium text-slate-800">{item.khoan_thu}</td>
                              <td className="py-2.5 px-4 text-right font-medium text-slate-800">{formatNumber(item.tong_hoc_phi_phai_nop)}</td>
                              <td className="py-2.5 px-4 text-right font-medium text-amber-600">
                                {parseFloat(item.so_tien_mien_giam || 0) > 0 ? formatNumber(item.so_tien_mien_giam) : '0'}
                              </td>
                              <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                                {formatNumber(Math.max(0, parseFloat(item.tong_hoc_phi_phai_nop || 0) - parseFloat(item.so_tien_mien_giam || 0)))}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {item.trang_thai === 'DaHoanThanh' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Đã nộp đủ</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                                    <Clock className="w-3 h-3" />
                                    <span>Còn nợ</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  onClick={() => handleOpenConfirm(item)}
                                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-sm transition cursor-pointer"
                                >
                                  {item.trang_thai === 'DaHoanThanh' ? 'Cập nhật' : 'Thu tiền'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MỤC III. CÁC BIÊN LAI ĐÃ THU/CHI */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wide">
                      III. CÁC BIÊN LAI ĐÃ THU/CHI (LỊCH SỬ NỘP TIỀN)
                    </h3>
                    <div className="overflow-x-auto border-t border-b border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/70 text-slate-700 font-bold border-b border-slate-200">
                            <th className="py-2.5 px-3 text-center w-12">STT</th>
                            <th className="py-2.5 px-3 text-center">HỌC KỲ</th>
                            <th className="py-2.5 px-3 text-center">NĂM HỌC</th>
                            <th className="py-2.5 px-3 text-center">SỐ PHIẾU/MÃ GD</th>
                            <th className="py-2.5 px-3 text-center">SỐ HĐ ĐIỆN TỬ</th>
                            <th className="py-2.5 px-3">NGÀY THÁNG</th>
                            <th className="py-2.5 px-4">KHOẢN THU/CHI</th>
                            <th className="py-2.5 px-4 text-right">SỐ TIỀN</th>
                            <th className="py-2.5 px-3 text-center">THU</th>
                            <th className="py-2.5 px-3 text-center">CHI</th>
                            <th className="py-2.5 px-3 text-center">#</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeStudentFinancialProfile.bien_lai_list.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="py-6 text-center text-slate-400">
                                Chưa có biên lai thu tiền nào.
                              </td>
                            </tr>
                          ) : (
                            activeStudentFinancialProfile.bien_lai_list.map((bl, idx) => (
                              <tr key={bl.id || idx} className="hover:bg-slate-50/60 transition">
                                <td className="py-2.5 px-3 text-center text-slate-600">{idx + 1}</td>
                                <td className="py-2.5 px-3 text-center text-slate-700">{bl.hoc_ky}</td>
                                <td className="py-2.5 px-3 text-center text-slate-700">{bl.nam_hoc}</td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">{bl.so_phieu}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-slate-600">{bl.so_hd_dien_tu || ''}</td>
                                <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                                  {bl.ngay_thang ? String(bl.ngay_thang).slice(0, 19).replace('T', ' ') : ''}
                                </td>
                                <td className="py-2.5 px-4 font-medium text-slate-800">{bl.khoan_thu_chi}</td>
                                <td className="py-2.5 px-4 text-right font-bold text-emerald-700">{formatNumber(bl.so_tien)}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <input type="checkbox" checked={bl.thu} readOnly className="w-3.5 h-3.5 text-sky-600 accent-sky-600" />
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <input type="checkbox" checked={bl.chi} readOnly className="w-3.5 h-3.5 text-sky-600 accent-sky-600" />
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => handleOpenInvoiceModal(bl, activeStudentFinancialProfile)}
                                    className="text-sky-600 hover:text-sky-800 hover:underline font-bold text-xs cursor-pointer"
                                  >
                                    In hóa đơn
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------
              CHẾ ĐỘ 2: TRA CỨU TOÀN TRƯỜNG DẠNG BẢNG PHẲNG
              ------------------------------------------------------------- */}
          {viewMode === 'flat' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Khoa đào tạo</label>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => {
                        setSelectedFaculty(e.target.value);
                        setSelectedClass('all');
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium"
                    >
                      <option value="all">Tất cả các khoa</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.ten_khoa} ({f.ma_khoa})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lớp sinh hoạt</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium"
                    >
                      <option value="all">Tất cả các lớp</option>
                      {filteredClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.ten_lop} {c.ten_nganh ? `• ${c.ten_nganh}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Học kỳ</label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium"
                    >
                      <option value="all">Tất cả các học kỳ</option>
                      {semesters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.ten_hoc_ky} - {s.nam_hoc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Trạng thái</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="DaHoanThanh">Đã nộp đủ</option>
                      <option value="ChuaDong">Chưa đóng / Còn nợ</option>
                      <option value="QuaHan">Quá hạn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tìm kiếm sinh viên</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="MSSV, tên, số phiếu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                        <th className="py-3 px-3 text-center w-12">STT</th>
                        <th className="py-3 px-3">MSSV</th>
                        <th className="py-3 px-3">Họ và tên</th>
                        <th className="py-3 px-3">Lớp / Khoa</th>
                        <th className="py-3 px-3">Khoản thu</th>
                        <th className="py-3 px-2 text-center">Học kỳ</th>
                        <th className="py-3 px-3 text-right">Phải nộp</th>
                        <th className="py-3 px-3 text-right">Miễn giảm</th>
                        <th className="py-3 px-3 text-right">Đã nộp</th>
                        <th className="py-3 px-3 text-right">Còn nợ</th>
                        <th className="py-3 px-3 text-center">Trạng thái</th>
                        <th className="py-3 px-3 text-center">Số phiếu</th>
                        <th className="py-3 px-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tuitions.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-sky-700">{t.ma_sv}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{t.ho_ten}</td>
                          <td className="py-3 px-3 text-slate-600">
                            <div className="font-semibold text-slate-800">{t.ten_lop}</div>
                            <div className="text-[11px] text-slate-400">{t.ten_khoa}</div>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">{t.khoan_thu || 'Học phí học kỳ'}</td>
                          <td className="py-3 px-2 text-center font-medium text-slate-700">
                            HK{t.hoc_ky_nien_khoa || t.ten_hoc_ky?.replace(/\D/g, '') || 1}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-900">
                            {formatNumber(t.tong_hoc_phi_phai_nop)}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-amber-600">
                            {parseFloat(t.so_tien_mien_giam || 0) > 0 ? formatNumber(t.so_tien_mien_giam) : '0'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-600">
                            {formatNumber(t.so_tien_da_dong)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-rose-600">
                            {parseFloat(t.so_tien_con_no || 0) > 0 ? formatNumber(t.so_tien_con_no) : '0'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {t.trang_thai === 'DaHoanThanh' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Đã nộp đủ</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>Còn nợ</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">
                            {t.so_bien_lai || '-'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleOpenConfirm(t)}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                            >
                              Thu tiền
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CẤU HÌNH ĐỊNH MỨC HỌC PHÍ THEO KHOA (3 PHẦN CHI TIẾT)
          ========================================================================= */}
      {activeTab === 'faculty_rates' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
              <ShieldCheck className="w-4 h-4" />
              <span>Chính sách Học phí phân loại theo từng Khoa / Ngành</span>
            </div>
            <p>
              Mỗi Khoa đào tạo có đặc thù chương trình học, số tín chỉ và cơ sở vật chất thực hành khác nhau, do đó định mức học phí được cấu hình độc lập.
            </p>
            <p className="text-amber-700">
              Cấu hình này tự động đồng bộ sang 3 phần trên Cổng Sinh viên: <strong>THÔNG TIN HỌC PHÍ</strong>, <strong>I. TỔNG HỢP CHUNG</strong>, và <strong>II. CÁC KHOẢN PHẢI NỘP</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ratesLoading ? (
              <div className="col-span-3 py-12 text-center text-slate-500 font-medium">
                Đang tải cấu hình định mức các khoa...
              </div>
            ) : (
              facultyRates.map((f) => {
                let parsedConfig = {};
                if (f.cau_hinh_khoan_thu) {
                  try {
                    parsedConfig = typeof f.cau_hinh_khoan_thu === 'string'
                      ? JSON.parse(f.cau_hinh_khoan_thu)
                      : f.cau_hinh_khoan_thu;
                  } catch (e) {
                    parsedConfig = {};
                  }
                }

                return (
                  <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      {/* Tiêu đề Khoa */}
                      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase">
                            Mã: {f.ma_khoa}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{f.ten_khoa}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Quy mô: <strong>{f.tong_so_lop} lớp</strong> • <strong>{f.tong_so_sinh_vien} sinh viên</strong>
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>

                      {/* 3 Phần Cấu hình chi tiết */}
                      <div className="space-y-3.5 pt-3 text-xs">
                        {/* Phần 1: THÔNG TIN HỌC PHÍ */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                          <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] text-sky-700">
                            + THÔNG TIN HỌC PHÍ, LỆ PHÍ
                          </p>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Học phí chuẩn / kỳ:</span>
                            <strong className="text-slate-900 text-sm">{formatVND(f.hoc_phi_ky_chuan)}</strong>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Đơn giá tín chỉ:</span>
                            <strong className="text-slate-800">{formatVND(f.don_gia_tin_chi)}/TC</strong>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Bảo hiểm Y tế bắt buộc:</span>
                            <strong className="text-slate-800">{formatVND(f.phi_bhyt)}/năm</strong>
                          </div>

                          {/* Bảng mức thu từng kỳ */}
                          {parsedConfig.dinh_muc_theo_ky && Object.keys(parsedConfig.dinh_muc_theo_ky).length > 0 && (
                            <div className="pt-2 border-t border-slate-200 mt-2 space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Mức thu theo từng kỳ (Tùy chỉnh):
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(parsedConfig.dinh_muc_theo_ky)
                                  .filter(([k]) => k.startsWith('HK'))
                                  .map(([k, v]) => (
                                    <span key={k} className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-bold border border-sky-100 text-[10px]">
                                      {k}: {formatNumber(v)} đ
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Phần 2: I. TỔNG HỢP CHUNG */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] text-sky-700">
                            + I. TỔNG HỢP CHUNG
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(parsedConfig.danh_muc_khoan_thu || ['Học phí học kỳ', 'Bảo hiểm y tế']).map((k, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold">
                                ✓ {k}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Phần 3: II. CÁC KHOẢN PHẢI NỘP */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] text-sky-700">
                            + II. CÁC KHOẢN PHẢI NỘP
                          </p>
                          <p className="text-slate-600">
                            Đợt thu mặc định: <strong>Đợt 1 (Đầu kỳ)</strong> • Khối lượng chuẩn: <strong>15 TC</strong>
                          </p>
                          <p className="text-slate-500 italic text-[11px]">
                            {parsedConfig.thong_tin_quy_dinh || 'Nộp đúng hạn quy định để không bị khóa đăng ký tín chỉ.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Thao tác cấu hình */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenApplyModal(f.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
                      >
                        Áp dụng cho SV Khoa
                      </button>
                      <button
                        onClick={() => handleOpenEditRate(f)}
                        className="py-2 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer text-center"
                      >
                        Chỉnh sửa mức thu
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL THU TIỀN / XÁC NHẬN NỘP HỌC PHÍ & XUẤT BIÊN LAI (MỤC III)
          ========================================================================= */}
      {showConfirmModal && selectedTuition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Thu Tiền & Xuất Biên Lai</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Sinh viên:</span>
                <strong className="text-slate-900">{selectedTuition.ho_ten} ({selectedTuition.ma_sv})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp / Khoa:</span>
                <strong className="text-slate-800">{selectedTuition.ten_lop} • {selectedTuition.ten_khoa}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khoản thu:</span>
                <span className="font-semibold text-slate-800">{selectedTuition.khoan_thu} (Học kỳ {selectedTuition.hoc_ky_nien_khoa || 1})</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Số tiền phải nộp ban đầu:</span>
                <strong className="text-slate-900">{formatVND(selectedTuition.tong_hoc_phi_phai_nop)}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Miễn giảm chính sách (VNĐ)</label>
                  <input
                    type="number"
                    value={confirmForm.so_tien_mien_giam}
                    onChange={(e) => setConfirmForm({ ...confirmForm, so_tien_mien_giam: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-amber-700"
                    placeholder="VD: 4000000"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Số tiền thực nộp đợt này (VNĐ)</label>
                  <input
                    type="number"
                    value={confirmForm.so_tien_da_dong}
                    onChange={(e) => setConfirmForm({ ...confirmForm, so_tien_da_dong: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-emerald-700 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Số phiếu / Mã giao dịch</label>
                  <input
                    type="text"
                    value={confirmForm.so_bien_lai}
                    onChange={(e) => setConfirmForm({ ...confirmForm, so_bien_lai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                    placeholder="VD: 3876"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Số HĐ Điện tử</label>
                  <input
                    type="text"
                    value={confirmForm.so_hd_dien_tu}
                    onChange={(e) => setConfirmForm({ ...confirmForm, so_hd_dien_tu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800"
                    placeholder="VD: HD-00124 (tùy chọn)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hình thức thanh toán</label>
                  <select
                    value={confirmForm.hinh_thuc_thanh_toan}
                    onChange={(e) => setConfirmForm({ ...confirmForm, hinh_thuc_thanh_toan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="ChuyenKhoan">Chuyển khoản Ngân hàng</option>
                    <option value="TienMat">Tiền mặt tại Quầy kế toán</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Ngày nộp tiền</label>
                  <input
                    type="date"
                    value={confirmForm.ngay_nop_tien}
                    onChange={(e) => setConfirmForm({ ...confirmForm, ngay_nop_tien: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Ghi chú kế toán</label>
                <input
                  type="text"
                  value={confirmForm.ghi_chu_ke_toan}
                  onChange={(e) => setConfirmForm({ ...confirmForm, ghi_chu_ke_toan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="Ghi chú đối soát..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Xác nhận & Xuất biên lai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL IN BIÊN LAI / HÓA ĐƠN ĐIỆN TỬ
          ========================================================================= */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:max-w-none print:w-full print:m-0">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-sm">Hóa đơn điện tử / Biên lai thu tiền</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In hóa đơn (PDF)</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-800 font-serif print:p-6 print:text-black">
              <div className="flex justify-between items-start border-b border-slate-300 pb-5">
                <div>
                  <p className="text-xs uppercase font-sans font-bold text-slate-600 tracking-wider">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                  <p className="text-sm font-sans font-bold text-slate-900 tracking-wide">TRƯỜNG ĐẠI HỌC SMART EDU</p>
                  <p className="text-xs font-sans text-slate-500">Phòng Kế hoạch & Tài chính</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-sans text-slate-500">Mẫu số: <strong>01-BLHP/2025</strong></p>
                  <p className="text-xs font-sans text-slate-500">Số phiếu / Mã GD: <strong className="text-slate-900 font-mono text-sm">{selectedInvoice.receipt.so_phieu}</strong></p>
                  {selectedInvoice.receipt.so_hd_dien_tu && (
                    <p className="text-xs font-sans text-slate-500">Số HĐĐT: <strong>{selectedInvoice.receipt.so_hd_dien_tu}</strong></p>
                  )}
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">BIÊN LAI THU TIỀN HỌC PHÍ</h2>
                <p className="text-xs italic text-slate-600 font-sans">(Liên 2: Giao cho người nộp tiền)</p>
                <p className="text-xs font-sans text-slate-600 pt-1">
                  Ngày lập biên lai: {selectedInvoice.receipt.ngay_thang ? String(selectedInvoice.receipt.ngay_thang).slice(0, 19).replace('T', ' ') : new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs font-sans border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div>
                  <span className="text-slate-500">Họ và tên:</span>{' '}
                  <strong className="text-slate-900 uppercase">{selectedInvoice.svInfo.ho_ten}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mã sinh viên (MSSV):</span>{' '}
                  <strong className="text-slate-900 font-mono">{selectedInvoice.svInfo.ma_sv}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Lớp:</span>{' '}
                  <strong className="text-slate-900">{selectedInvoice.svInfo.ten_lop}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Khoa:</span>{' '}
                  <strong className="text-slate-900">{selectedInvoice.svInfo.ten_khoa}</strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-300 text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-2.5 text-center border-r border-slate-300 w-12">STT</th>
                      <th className="p-2.5 border-r border-slate-300">Nội dung thu</th>
                      <th className="p-2.5 text-center border-r border-slate-300">Học kỳ / Năm</th>
                      <th className="p-2.5 text-right">Số tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2.5 text-center border-r border-slate-300">1</td>
                      <td className="p-2.5 border-r border-slate-300 font-medium">
                        {selectedInvoice.receipt.khoan_thu_chi || 'Học phí học kỳ'}
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-300">
                        Học kỳ {selectedInvoice.receipt.hoc_ky} ({selectedInvoice.receipt.nam_hoc})
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatNumber(selectedInvoice.receipt.so_tien)}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-300 bg-slate-50/80 font-bold">
                      <td colSpan={3} className="p-2.5 text-right border-r border-slate-300 uppercase">Tổng cộng:</td>
                      <td className="p-2.5 text-right text-emerald-700 text-sm">
                        {formatNumber(selectedInvoice.receipt.so_tien)} VNĐ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs font-sans">
                <div>
                  <p className="font-bold text-slate-800">Người nộp tiền</p>
                  <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
                  <div className="h-14 flex items-center justify-center font-semibold text-slate-700 italic">
                    {selectedInvoice.svInfo.ho_ten}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="p-1.5 border border-slate-200 rounded-lg bg-slate-50">
                    <QrCode className="w-12 h-12 text-slate-700" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Quét QR tra cứu HĐĐT</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800">Thủ quỹ / Kế toán</p>
                  <p className="text-[11px] text-slate-400 italic">(Đã ký số điện tử)</p>
                  <div className="h-14 flex flex-col items-center justify-center text-emerald-600 font-semibold text-[11px]">
                    <div className="border border-emerald-500 rounded px-2 py-0.5 bg-emerald-50 text-[10px] uppercase font-bold">
                      ✓ ĐÃ XÁC THỰC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL CẤU HÌNH ĐỊNH MỨC HỌC PHÍ KHOA (3 PHẦN)
          ========================================================================= */}
      {showRateModal && editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Cấu Hình Định Mức Học Phí: {editingFaculty.ten_khoa}</h3>
              </div>
              <button
                onClick={() => setShowRateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-4 text-xs">
              <div className="p-3 bg-sky-50 rounded-xl text-sky-900 space-y-1">
                <strong>Quy định cấu hình:</strong> Định mức này sẽ áp dụng cho toàn bộ sinh viên thuộc {editingFaculty.ten_khoa} khi tạo đợt thu học kỳ.
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mức học phí chuẩn 1 học kỳ (VNĐ)</label>
                <input
                  type="number"
                  value={rateForm.hoc_phi_ky_chuan}
                  onChange={(e) => setRateForm({ ...rateForm, hoc_phi_ky_chuan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">VD: CNTT: 11,800,000đ • Kế toán: 10,800,000đ • Điện tử: 11,200,000đ</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Đơn giá 1 Tín chỉ (VNĐ)</label>
                  <input
                    type="number"
                    value={rateForm.don_gia_tin_chi}
                    onChange={(e) => setRateForm({ ...rateForm, don_gia_tin_chi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phí Bảo hiểm y tế (VNĐ)</label>
                  <input
                    type="number"
                    value={rateForm.phi_bhyt}
                    onChange={(e) => setRateForm({ ...rateForm, phi_bhyt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Quy định & Hướng dẫn thanh toán của Khoa</label>
                <textarea
                  rows={2}
                  value={rateForm.thong_tin_quy_dinh}
                  onChange={(e) => setRateForm({ ...rateForm, thong_tin_quy_dinh: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="Hướng dẫn sinh viên chuyển khoản hoặc đóng tại trường..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Lưu cấu hình mức thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL ÁP DỤNG ĐỊNH MỨC CHO LỚP / KHOA TRONG KỲ MỚI
          ========================================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Áp Dụng Định Mức Thu Kỳ Mới</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyRateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Khoa áp dụng</label>
                <select
                  value={applyForm.khoa_id}
                  onChange={(e) => setApplyForm({ ...applyForm, khoa_id: e.target.value, lop_id: 'all' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  required
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.ten_khoa} (Định mức chuẩn: {formatVND(f.hoc_phi_ky_chuan)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Phạm vi áp dụng (Lớp sinh hoạt)</label>
                <select
                  value={applyForm.lop_id}
                  onChange={(e) => setApplyForm({ ...applyForm, lop_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                >
                  <option value="all">Toàn bộ sinh viên trong Khoa này</option>
                  {applyClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.ten_lop} ({c.ten_nganh})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ô NHẬP MỨC THU CỤ THỂ CỦA KỲ */}
              <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-sky-900 uppercase">
                    Mức thu học phí áp dụng cho kỳ này (VNĐ)
                  </label>
                  <span className="text-[11px] text-sky-700 font-semibold bg-white px-2 py-0.5 rounded border border-sky-200">
                    Tùy chỉnh theo từng kỳ
                  </span>
                </div>
                <input
                  type="number"
                  value={applyForm.muc_thu_hoc_phi}
                  onChange={(e) => setApplyForm({ ...applyForm, muc_thu_hoc_phi: e.target.value })}
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl font-bold text-sky-800 text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="VD: 11800000"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Mặc định gợi ý theo định mức của Khoa. Bạn có thể tự do điều chỉnh mức thu riêng cho từng kỳ (VD: HK1: 10.800.000đ, HK2: 11.800.000đ, HK3: 6.000.000đ...).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Học kỳ hệ thống</label>
                  <select
                    value={applyForm.hoc_ky_id}
                    onChange={(e) => setApplyForm({ ...applyForm, hoc_ky_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                    required
                  >
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.ten_hoc_ky} - {s.nam_hoc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Học kỳ niên khóa</label>
                  <select
                    value={applyForm.hoc_ky_nien_khoa}
                    onChange={(e) => setApplyForm({ ...applyForm, hoc_ky_nien_khoa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="1">Học kỳ 1</option>
                    <option value="2">Học kỳ 2</option>
                    <option value="3">Học kỳ 3 (Hè)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Năm học niên khóa</label>
                  <input
                    type="text"
                    value={applyForm.nam_hoc_nien_khoa}
                    onChange={(e) => setApplyForm({ ...applyForm, nam_hoc_nien_khoa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                    placeholder="2025-2026"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hạn chót nộp</label>
                  <input
                    type="date"
                    value={applyForm.han_chot_nop}
                    onChange={(e) => setApplyForm({ ...applyForm, han_chot_nop: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* TÙY CHỌN TÍNH LẠI TOÀN BỘ */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={applyForm.cap_nhat_tat_ca}
                    onChange={(e) => setApplyForm({ ...applyForm, cap_nhat_tat_ca: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded accent-sky-600 cursor-pointer"
                  />
                  <span>Tính lại tổng phải nộp cho toàn bộ sinh viên (kể cả đã nộp hoặc chưa nộp)</span>
                </label>
                <p className="text-[11px] text-slate-500 ml-6">
                  Đảm bảo 100% sinh viên đều có mức thu chuẩn xác theo kỳ, tự động đối soát số tiền đã nộp và số tiền còn nợ.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Xác nhận sinh công nợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
