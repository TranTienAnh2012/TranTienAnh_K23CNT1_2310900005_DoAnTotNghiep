import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { Printer, X, Check, FileText, QrCode } from 'lucide-react';

export default function StudentTuition() {
  const [loading, setLoading] = useState(true);
  const [tuitionData, setTuitionData] = useState({
    studentInfo: {},
    summary: {
      tong_phai_nop: 81232000,
      tong_da_nop: 76600000,
      tong_hoan_tra: 0,
      tong_thua_thieu: 632000,
      tong_mien_giam: 4000000
    },
    tong_hop_chung: [],
    cac_khoan_phai_nop: [],
    bien_lai_thu_chi: []
  });

  // Modal in hóa đơn
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchTuition = async () => {
    try {
      setLoading(true);
      const res = await studentService.getTuition();
      const payload = res?.data?.success ? res.data.data : (res?.success ? res.data : null);

      if (payload && payload.summary) {
        setTuitionData(payload);
      } else if (Array.isArray(payload) || Array.isArray(res)) {
        // Fallback nếu API trả về mảng thô
        const raw = Array.isArray(payload) ? payload : res;
        buildDataFromRaw(raw);
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin học phí:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildDataFromRaw = (list) => {
    let pNop = 0, dNop = 0, hTra = 0, mGiam = 0;
    const group = {};

    list.forEach(item => {
      const p = parseFloat(item.tong_hoc_phi_phai_nop || 0);
      const d = parseFloat(item.so_tien_da_dong || 0);
      const m = parseFloat(item.so_tien_mien_giam || 0);
      const isChi = item.loai_giao_dich === 'Chi';
      pNop += p;
      dNop += (isChi ? 0 : d);
      hTra += (isChi ? d : 0);
      mGiam += m;

      const k = item.khoan_thu || 'Học phí học kỳ';
      if (!group[k]) group[k] = { khoan_thu: k, phai_nop: 0, da_nop: 0, hoan_tra: 0, mien_giam: 0 };
      group[k].phai_nop += p;
      group[k].da_nop += (isChi ? 0 : d);
      group[k].hoan_tra += (isChi ? d : 0);
      group[k].mien_giam += m;
    });

    const thucNop = Math.max(0, pNop - mGiam);
    const thieu = thucNop - dNop;

    const tongHop = Object.values(group).map((g, idx) => ({
      stt: idx + 1,
      khoan_thu: g.khoan_thu,
      so_tien_phai_nop: g.phai_nop,
      so_tien_da_nop: g.da_nop,
      so_tien_hoan_tra: g.hoan_tra,
      so_tien_thieu_thua: Math.max(0, (g.phai_nop - g.mien_giam) - g.da_nop)
    }));

    const phaiNopList = list.map((item, idx) => ({
      stt: idx + 1,
      id: item.id,
      hoc_ky: item.hoc_ky_nien_khoa || 1,
      nam_hoc: item.nam_hoc_nien_khoa || '2025-2026',
      dot: item.dot || 1,
      khoan_thu: item.khoan_thu || 'Học phí học kỳ',
      so_tien_phai_nop: parseFloat(item.tong_hoc_phi_phai_nop || 0),
      so_tien_mien_giam: parseFloat(item.so_tien_mien_giam || 0),
      so_tien_con_nop: Math.max(0, parseFloat(item.tong_hoc_phi_phai_nop || 0) - parseFloat(item.so_tien_mien_giam || 0))
    }));

    const bienLaiList = list
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

    setTuitionData({
      studentInfo: {},
      summary: {
        tong_phai_nop: pNop,
        tong_da_nop: dNop,
        tong_hoan_tra: hTra,
        tong_thua_thieu: thieu > 0 ? thieu : 0,
        tong_mien_giam: mGiam
      },
      tong_hop_chung: tongHop,
      cac_khoan_phai_nop: phaiNopList,
      bien_lai_thu_chi: bienLaiList
    });
  };

  useEffect(() => {
    fetchTuition();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const handleOpenInvoice = (receipt) => {
    setSelectedReceipt(receipt);
    setShowInvoiceModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num) => {
    if (!num) return 'Không đồng';
    // Đọc số tiếng Việt cơ bản cho hóa đơn
    const units = ['', 'nghìn', 'triệu', 'tỷ'];
    return `${formatNumber(num)} đồng (Việt Nam Đồng)`;
  };

  const {
    summary = {
      tong_phai_nop: 0,
      tong_da_nop: 0,
      tong_hoan_tra: 0,
      tong_thua_thieu: 0,
      tong_mien_giam: 0
    },
    tong_hop_chung = [],
    cac_khoan_phai_nop = [],
    bien_lai_thu_chi = [],
    studentInfo = {}
  } = tuitionData || {};

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans p-4 sm:p-6 space-y-6">
      {/* TIÊU ĐỀ CHÍNH THEO HÌNH ẢNH */}
      <div>
        <h1 className="text-lg sm:text-xl font-medium tracking-wide text-slate-800 uppercase">
          THÔNG TIN HỌC PHÍ, LỆ PHÍ SINH VIÊN
        </h1>
      </div>

      {/* 4 Ô TỔNG SỐ TIỀN TRÊN CÙNG (DẠNG INPUT READONLY CHUẨN GIAO DIỆN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng số tiền phải nộp */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm text-slate-700">
            Tổng số tiền phải nộp:
          </label>
          <div className="bg-slate-50 border border-slate-200/90 rounded px-3 py-2 text-sm text-slate-800 font-medium select-all shadow-inner">
            {formatNumber(summary.tong_phai_nop)}
          </div>
        </div>

        {/* 2. Tổng số tiền đã nộp */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm text-slate-700">
            Tổng số tiền đã nộp:
          </label>
          <div className="bg-slate-50 border border-slate-200/90 rounded px-3 py-2 text-sm text-slate-800 font-medium select-all shadow-inner">
            {formatNumber(summary.tong_da_nop)}
          </div>
        </div>

        {/* 3. Tổng số tiền hoàn trả */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm text-slate-700">
            Tổng số tiền hoàn trả:
          </label>
          <div className="bg-slate-50 border border-slate-200/90 rounded px-3 py-2 text-sm text-slate-800 font-medium select-all shadow-inner">
            {formatNumber(summary.tong_hoan_tra)}
          </div>
        </div>

        {/* 4. Tổng số tiền thừa/thiếu */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm text-slate-700">
            Tổng số tiền thừa/thiếu:
          </label>
          <div className="bg-slate-50 border border-slate-200/90 rounded px-3 py-2 text-sm text-slate-800 font-medium select-all shadow-inner">
            {formatNumber(summary.tong_thua_thieu)}
          </div>
        </div>
      </div>

      {/* MỤC I. TỔNG HỢP CHUNG */}
      <div className="space-y-2 pt-2">
        <h2 className="text-sm sm:text-base font-bold text-sky-500 uppercase tracking-wide">
          I. TỔNG HỢP CHUNG
        </h2>

        <div className="overflow-x-auto border-t border-b border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 text-center sm:text-left">KHOẢN THU</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN PHẢI NỘP</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN ĐÃ NỘP</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN HOÀN TRẢ</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN THIẾU/THỪA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Đang tải dữ liệu tổng hợp chung...
                  </td>
                </tr>
              ) : tong_hop_chung.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Chưa có khoản thu nào.
                  </td>
                </tr>
              ) : (
                tong_hop_chung.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/60 transition">
                    <td className="py-2 px-3 text-center text-slate-600">{item.stt || index + 1}</td>
                    <td className="py-2 px-4 text-slate-800 font-medium">{item.khoan_thu}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_phai_nop)}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_da_nop)}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_hoan_tra)}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_thieu_thua)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MỤC II. CÁC KHOẢN PHẢI NỘP */}
      <div className="space-y-2 pt-2">
        <h2 className="text-sm sm:text-base font-bold text-sky-500 uppercase tracking-wide">
          II. CÁC KHOẢN PHẢI NỘP
        </h2>

        <div className="overflow-x-auto border-t border-b border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3 text-center">HỌC KỲ</th>
                <th className="py-2.5 px-3 text-center">NĂM HỌC</th>
                <th className="py-2.5 px-3 text-center">ĐỢT</th>
                <th className="py-2.5 px-4 text-center sm:text-left">KHOẢN THU</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN PHẢI NỘP</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN MIỄN GIẢM</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN CÒN NỘP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Đang tải danh sách khoản phải nộp...
                  </td>
                </tr>
              ) : cac_khoan_phai_nop.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không có khoản phải nộp.
                  </td>
                </tr>
              ) : (
                cac_khoan_phai_nop.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/60 transition">
                    <td className="py-2 px-3 text-center text-slate-600">{item.stt || index + 1}</td>
                    <td className="py-2 px-3 text-center text-slate-700">{item.hoc_ky}</td>
                    <td className="py-2 px-3 text-center text-slate-700">{item.nam_hoc}</td>
                    <td className="py-2 px-3 text-center text-slate-700">{item.dot || 1}</td>
                    <td className="py-2 px-4 text-slate-800 font-medium">{item.khoan_thu}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_phai_nop)}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_mien_giam)}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien_con_nop)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MỤC III. CÁC BIÊN LAI ĐÃ THU/CHI */}
      <div className="space-y-2 pt-2">
        <h2 className="text-sm sm:text-base font-bold text-sky-500 uppercase tracking-wide">
          III. CÁC BIÊN LAI ĐÃ THU/CHI
        </h2>

        <div className="overflow-x-auto border-t border-b border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3 text-center">HỌC KỲ</th>
                <th className="py-2.5 px-3 text-center">NĂM HỌC</th>
                <th className="py-2.5 px-3 text-center">
                  <div>SỐ PHIẾU/</div>
                  <div>MÃ GD</div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div>SỐ HĐ</div>
                  <div>ĐIỆN TỬ</div>
                </th>
                <th className="py-2.5 px-3">NGÀY THÁNG</th>
                <th className="py-2.5 px-4">KHOẢN THU/CHI</th>
                <th className="py-2.5 px-4 text-right">SỐ TIỀN</th>
                <th className="py-2.5 px-3 text-center">THU</th>
                <th className="py-2.5 px-3 text-center">CHI</th>
                <th className="py-2.5 px-3 text-center">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Đang tải danh sách biên lai thu/chi...
                  </td>
                </tr>
              ) : bien_lai_thu_chi.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Chưa có biên lai thu tiền.
                  </td>
                </tr>
              ) : (
                bien_lai_thu_chi.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/60 transition">
                    <td className="py-2 px-3 text-center text-slate-600">{item.stt || index + 1}</td>
                    <td className="py-2 px-3 text-center text-slate-700">{item.hoc_ky}</td>
                    <td className="py-2 px-3 text-center text-slate-700">{item.nam_hoc}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-700">{item.so_phieu}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-600">{item.so_hd_dien_tu || ''}</td>
                    <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                      {item.ngay_thang ? String(item.ngay_thang).replace('T', ' ').slice(0, 19) : ''}
                    </td>
                    <td className="py-2 px-4 text-slate-800 font-medium">{item.khoan_thu_chi}</td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800">{formatNumber(item.so_tien)}</td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.thu}
                        readOnly
                        className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 accent-sky-600 cursor-default"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.chi}
                        readOnly
                        className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 accent-sky-600 cursor-default"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleOpenInvoice(item)}
                        className="text-sky-600 hover:text-sky-800 hover:underline font-medium text-xs whitespace-nowrap cursor-pointer"
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

      {/* FOOTER BẢN QUYỀN CHUẨN GIAO DIỆN HÌNH ẢNH */}
      <div className="pt-6 pb-2 text-xs text-slate-500">
        Copyright © 2025 Thien An Technology
      </div>

      {/* MODAL IN HÓA ĐƠN / BIÊN LAI ĐIỆN TỬ */}
      {showInvoiceModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:max-w-none print:w-full print:m-0">
            {/* Action Bar (ẩn khi in) */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-sm">Hóa đơn điện tử / Biên lai thu tiền</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
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

            {/* Nội dung hóa đơn chính */}
            <div className="p-8 space-y-6 text-slate-800 font-serif print:p-6 print:text-black">
              {/* Header trường */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-5">
                <div>
                  <p className="text-xs uppercase font-sans font-bold text-slate-600 tracking-wider">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                  <p className="text-sm font-sans font-bold text-slate-900 tracking-wide">TRƯỜNG ĐẠI HỌC SMART EDU</p>
                  <p className="text-xs font-sans text-slate-500">Phòng Kế hoạch & Tài chính</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-sans text-slate-500">Mẫu số: <strong>01-BLHP/2025</strong></p>
                  <p className="text-xs font-sans text-slate-500">Số phiếu / Mã GD: <strong className="text-slate-900 font-mono text-sm">{selectedReceipt.so_phieu}</strong></p>
                  {selectedReceipt.so_hd_dien_tu && (
                    <p className="text-xs font-sans text-slate-500">Số HĐĐT: <strong>{selectedReceipt.so_hd_dien_tu}</strong></p>
                  )}
                </div>
              </div>

              {/* Tên Biên lai */}
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-900">
                  BIÊN LAI THU TIỀN HỌC PHÍ
                </h2>
                <p className="text-xs italic text-slate-600 font-sans">
                  (Liên 2: Giao cho người nộp tiền)
                </p>
                <p className="text-xs font-sans text-slate-600 pt-1">
                  Ngày lập biên lai: {selectedReceipt.ngay_thang ? String(selectedReceipt.ngay_thang).slice(0, 19) : new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Thông tin sinh viên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs font-sans border border-slate-200 rounded-lg p-4 bg-slate-50/50 print:bg-white print:border-black">
                <div>
                  <span className="text-slate-500">Họ và tên người nộp:</span>{' '}
                  <strong className="text-slate-900 uppercase">{studentInfo.ho_ten || 'Trần Tiến Anh'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mã sinh viên (MSSV):</span>{' '}
                  <strong className="text-slate-900 font-mono">{studentInfo.ma_sv || '2310900005'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Lớp sinh hoạt:</span>{' '}
                  <strong className="text-slate-900">{studentInfo.ten_lop || 'K23CNT1'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Khoa đào tạo:</span>{' '}
                  <strong className="text-slate-900">{studentInfo.ten_khoa || 'Công nghệ Thông tin'}</strong>
                </div>
              </div>

              {/* Bảng chi tiết khoản thu */}
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
                        {selectedReceipt.khoan_thu_chi || 'Học phí học kỳ'}
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-300">
                        Học kỳ {selectedReceipt.hoc_ky} ({selectedReceipt.nam_hoc})
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatNumber(selectedReceipt.so_tien)}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-300 bg-slate-50/80 font-bold">
                      <td colSpan={3} className="p-2.5 text-right border-r border-slate-300 uppercase">
                        Tổng cộng:
                      </td>
                      <td className="p-2.5 text-right text-emerald-700 text-sm">
                        {formatNumber(selectedReceipt.so_tien)} VNĐ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Số tiền bằng chữ */}
              <div className="text-xs font-sans space-y-1">
                <p>
                  <strong>Số tiền bằng chữ:</strong>{' '}
                  <span className="italic">{numberToWords(selectedReceipt.so_tien)}</span>
                </p>
                <p className="text-slate-500">
                  Hình thức thanh toán: <strong>Chuyển khoản trực tuyến / Thu ngân nhà trường</strong>
                </p>
              </div>

              {/* Chữ ký & QR code */}
              <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs font-sans">
                <div>
                  <p className="font-bold text-slate-800">Người nộp tiền</p>
                  <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-semibold text-slate-700 italic">{studentInfo.ho_ten || 'Trần Tiến Anh'}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <QrCode className="w-14 h-14 text-slate-700" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Quét QR tra cứu HĐĐT</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800">Thủ quỹ / Kế toán</p>
                  <p className="text-[11px] text-slate-400 italic">(Đã ký số điện tử)</p>
                  <div className="h-16 flex flex-col items-center justify-center text-emerald-600 font-semibold text-[11px]">
                    <div className="border border-emerald-500 rounded px-2 py-0.5 bg-emerald-50 text-[10px] uppercase font-bold">
                      ✓ ĐÃ XÁC THỰC
                    </div>
                    <span className="mt-1 text-slate-600">Phòng Kế toán</span>
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
