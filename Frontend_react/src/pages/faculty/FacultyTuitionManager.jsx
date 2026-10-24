import React, { useState, useEffect, useMemo } from 'react';
import { facultyService } from '../../services/facultyService';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Receipt,
  Printer,
  FileText,
  QrCode,
  X
} from 'lucide-react';

export default function FacultyTuitionManager() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy' (Nhóm theo lớp) | 'flat' (Bảng phẳng tra cứu)
  const [selectedDrillClassId, setSelectedDrillClassId] = useState(null);
  const [selectedDrillStudentId, setSelectedDrillStudentId] = useState(null);
  const [classFilterStatus, setClassFilterStatus] = useState('all');
  const [classSearch, setClassSearch] = useState('');

  // Modal In Biên Lai / Hóa Đơn Điện Tử
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Pagination for class students
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [data, setData] = useState({
    summary: {
      tong_sinh_vien: 0,
      tong_ban_ghi: 0,
      tong_phai_thu: 0,
      tong_da_thu: 0,
      tong_con_no: 0,
      tong_mien_giam: 0,
      ti_le_hoan_thanh: 100
    },
    tuitions: [],
    classes: [],
    semesters: []
  });

  // Filters for flat view
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  const fetchFacultyTuition = async () => {
    try {
      setLoading(true);
      const res = await facultyService.getFacultyTuition({
        lop_id: selectedClass !== 'all' ? selectedClass : undefined,
        hoc_ky_id: selectedSemester !== 'all' ? selectedSemester : undefined,
        trang_thai: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: search || undefined
      });

      if (res?.data?.success) {
        setData(res.data.data);
      } else if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu học phí khoa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyTuition();
  }, [selectedClass, selectedSemester, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFacultyTuition();
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  const { summary, tuitions, classes, semesters } = data;

  // Gom nhóm dữ liệu theo từng Lớp sinh hoạt
  const classTree = useMemo(() => {
    const cMap = {};

    tuitions.forEach(t => {
      const cId = t.lop_id || 0;
      const cName = t.ten_lop || 'Lớp chưa phân loại';
      const cCode = t.ma_lop || '';
      const cNganh = t.ten_nganh || '';

      const pNop = parseFloat(t.tong_hoc_phi_phai_nop || 0);
      const dThu = parseFloat(t.so_tien_da_dong || 0);
      const cNo = parseFloat(t.so_tien_con_no || 0);
      const isCompleted = t.trang_thai === 'DaHoanThanh';

      if (!cMap[cId]) {
        cMap[cId] = {
          id: cId,
          ten_lop: cName,
          ma_lop: cCode,
          ten_nganh: cNganh,
          tong_sv_set: new Set(),
          tong_phai_thu: 0,
          tong_da_thu: 0,
          tong_con_no: 0,
          so_sv_hoan_thanh: 0,
          so_sv_con_no: 0,
          students: []
        };
      }

      const cg = cMap[cId];
      cg.tong_sv_set.add(t.sinh_vien_id);
      cg.tong_phai_thu += pNop;
      cg.tong_da_thu += dThu;
      cg.tong_con_no += cNo;
      if (isCompleted) cg.so_sv_hoan_thanh++;
      else cg.so_sv_con_no++;
      cg.students.push(t);
    });

    return Object.values(cMap).map(cg => ({
      ...cg,
      tong_sv: cg.tong_sv_set.size,
      ti_le_hoan_thanh: cg.tong_phai_thu > 0 ? Math.round((cg.tong_da_thu / cg.tong_phai_thu) * 100) : 100
    }));
  }, [tuitions]);

  // Lớp đang được chọn drill-down
  const activeClassObj = useMemo(() => {
    if (!selectedDrillClassId) return null;
    return classTree.find(c => c.id === selectedDrillClassId) || null;
  }, [classTree, selectedDrillClassId]);

  // Danh sách Tóm tắt từng Sinh viên trong Lớp (Mỗi SV = 1 dòng tổng hợp)
  const studentSummariesInClass = useMemo(() => {
    if (!activeClassObj) return [];
    const svMap = {};

    activeClassObj.students.forEach(t => {
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
  }, [activeClassObj, classFilterStatus, classSearch]);

  // Phân trang danh sách sinh viên
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return studentSummariesInClass.slice(start, start + pageSize);
  }, [studentSummariesInClass, currentPage, pageSize]);

  const totalPages = Math.ceil(studentSummariesInClass.length / pageSize) || 1;

  // Dữ liệu chi tiết của Cá nhân Sinh viên được chọn (TẦNG CHI TIẾT SINH VIÊN)
  const activeStudentFinancialProfile = useMemo(() => {
    if (!activeClassObj || !selectedDrillStudentId) return null;
    const svRecords = activeClassObj.students.filter(t => t.sinh_vien_id === selectedDrillStudentId);
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
      ten_lop: baseInfo.ten_lop,
      ten_khoa: baseInfo.ten_khoa || 'Khoa Công Nghệ Thông Tin',
      tong_phai_nop: pNop,
      tong_da_nop: dNop,
      tong_con_no: cNo,
      tong_mien_giam: mGiam,
      tong_hop_chung: tongHopChung,
      items: svRecords,
      bien_lai_list: bienLaiList
    };
  }, [activeClassObj, selectedDrillStudentId]);

  const handleOpenInvoiceModal = (receipt, svInfo) => {
    setSelectedInvoice({ receipt, svInfo });
    setShowInvoiceModal(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Ban Quản lý Khoa • Theo dõi Tài chính & Học phí</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Tiến Độ Thu Học Phí & Công Nợ Sinh Viên</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gom nhóm quản lý theo từng Lớp sinh hoạt: rà soát tình hình nộp đủ / còn nợ để đôn đốc trước kỳ thi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switcher View Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setViewMode('hierarchy'); setSelectedDrillClassId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'hierarchy' ? 'bg-white text-sky-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Nhóm theo Lớp</span>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'flat' ? 'bg-white text-sky-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tra cứu Toàn Khoa</span>
            </button>
          </div>

          <button
            onClick={fetchFacultyTuition}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Thẻ KPI Thống Kê Tổng Quan Khoa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Sinh Viên</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatNumber(summary.tong_sinh_vien)} SV</h3>
            <p className="text-xs text-slate-400 mt-0.5">{classTree.length} Lớp trong Khoa</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Tiền Phải Thu</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatVND(summary.tong_phai_thu)}</h3>
            <p className="text-xs text-amber-600 mt-0.5">Miễn giảm: {formatVND(summary.tong_mien_giam)}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Đã Thu</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatVND(summary.tong_da_thu)}</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Đạt {summary.ti_le_hoan_thanh}% kế hoạch</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Còn Nợ</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{formatVND(summary.tong_con_no)}</h3>
            <p className="text-xs text-rose-500 mt-0.5">Cần nhắc nhở sinh viên</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CHẾ ĐỘ 1: XEM THEO TỪNG LỚP SINH HOẠT (HIERARCHY VIEW)
          ------------------------------------------------------------- */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-6">
          {/* Breadcrumb điều hướng */}
          <div className="bg-white rounded-2xl px-5 py-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
              <button
                onClick={() => {
                  setSelectedDrillClassId(null);
                  setSelectedDrillStudentId(null);
                }}
                className={`hover:text-sky-600 transition cursor-pointer ${
                  !selectedDrillClassId ? 'font-bold text-sky-600' : ''
                }`}
              >
                🏫 Tất Cả Các Lớp Trong Khoa ({classTree.length})
              </button>

              {activeClassObj && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <button
                    onClick={() => setSelectedDrillStudentId(null)}
                    className={`hover:text-sky-600 transition cursor-pointer ${
                      selectedDrillClassId && !selectedDrillStudentId ? 'font-bold text-sky-600' : ''
                    }`}
                  >
                    Lớp: {activeClassObj.ten_lop} ({activeClassObj.tong_sv} SV)
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

            {(selectedDrillClassId || selectedDrillStudentId) && (
              <button
                onClick={() => {
                  if (selectedDrillStudentId) setSelectedDrillStudentId(null);
                  else setSelectedDrillClassId(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {selectedDrillStudentId
                    ? `Quay lại DS lớp ${activeClassObj?.ten_lop || ''}`
                    : 'Quay lại danh sách Lớp'}
                </span>
              </button>
            )}
          </div>

          {/* Khi chưa chọn lớp -> Hiển thị danh sách Card các Lớp */}
          {!selectedDrillClassId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {classTree.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          Mã: {cls.ma_lop}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{cls.ten_lop}</h3>
                        {cls.ten_nganh && (
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">{cls.ten_nganh}</p>
                        )}
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                        {cls.tong_sv} SV
                      </div>
                    </div>

                    <div className="pt-2 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Tỷ lệ hoàn thành:</span>
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
                          ✓ {cls.so_sv_hoan_thanh} nộp đủ
                        </span>
                        {cls.so_sv_con_no > 0 && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700">
                            ⚠ {cls.so_sv_con_no} còn nợ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDrillClassId(cls.id);
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
          )}

          {/* ĐÃ CHỌN LỚP -> DANH SÁCH SINH VIÊN CỦA LỚP (MỖI SV = 1 DÒNG TỔNG HỢP) */}
          {activeClassObj && !selectedDrillStudentId && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Danh Sách Học Phí Lớp: {activeClassObj.ten_lop}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sĩ số: <strong>{activeClassObj.tong_sv} sinh viên</strong> • Bấm <strong>"Xem chi tiết học phí"</strong> của từng sinh viên để xem sinh viên này đã nộp những khoản nào & biên lai
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                    <button
                      onClick={() => { setClassFilterStatus('all'); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        classFilterStatus === 'all' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả ({activeClassObj.tong_sv})
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
                      placeholder="Tìm MSSV, tên..."
                      value={classSearch}
                      onChange={(e) => { setClassSearch(e.target.value); setCurrentPage(1); }}
                      className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white w-48"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>
              </div>

              {/* Bảng tổng hợp từng sinh viên */}
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

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, studentSummariesInClass.length)} trên {studentSummariesInClass.length} SV
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

          {/* ĐÃ CHỌN CÁ NHÂN SINH VIÊN -> CHI TIẾT TÀI CHÍNH & CÔNG NỢ */}
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
          CHẾ ĐỘ 2: TRA CỨU TOÀN KHOA DẠNG BẢNG PHẲNG
          ------------------------------------------------------------- */}
      {viewMode === 'flat' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Lớp sinh hoạt</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium"
                >
                  <option value="all">Tất cả các lớp trong khoa</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ten_lop} ({c.ma_lop})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Học kỳ</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium"
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
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Trạng thái</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="DaHoanThanh">Đã hoàn thành</option>
                  <option value="ChuaDong">Chưa đóng / Còn nợ</option>
                  <option value="QuaHan">Quá hạn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tìm kiếm MSSV, Tên</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập MSSV, họ tên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3">MSSV</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-3">Lớp</th>
                    <th className="py-3 px-3">Khoản thu</th>
                    <th className="py-3 px-3 text-center">Học kỳ</th>
                    <th className="py-3 px-3 text-right">Phải nộp</th>
                    <th className="py-3 px-3 text-right">Miễn giảm</th>
                    <th className="py-3 px-3 text-right">Đã nộp</th>
                    <th className="py-3 px-3 text-right">Còn nợ</th>
                    <th className="py-3 px-3 text-center">Trạng thái</th>
                    <th className="py-3 px-3">Số biên lai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tuitions.map((t, index) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 text-center text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-3 px-3 font-bold text-sky-700">{t.ma_sv}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{t.ho_ten}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{t.ten_lop}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{t.khoan_thu || 'Học phí học kỳ'}</td>
                      <td className="py-3 px-3 text-center text-slate-600 font-medium">
                        HK{t.hoc_ky_nien_khoa || 1}
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
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {t.so_bien_lai || <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL IN BIÊN LAI / HÓA ĐƠN ĐIỆN TỬ
          ========================================================================= */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Xem & In Biên Lai Thu Tiền Học Phí</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu Thu</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Khung Hóa đơn / Biên lai Chuẩn */}
            <div className="border-2 border-slate-300 rounded-xl p-6 bg-white space-y-4 font-serif text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h4 className="font-bold text-sm uppercase text-slate-900">TRƯỜNG ĐẠI HỌC NGUYỄN TRÃI</h4>
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
    </div>
  );
}
