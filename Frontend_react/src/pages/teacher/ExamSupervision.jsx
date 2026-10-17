import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import Notification from '../../components/common/Notification';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Users,
  Search,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  Camera
} from 'lucide-react';

export default function ExamSupervision() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examData, setExamData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await teacherService.getExams();
        if (res.success && res.data.length > 0) {
          setExams(res.data);
          setSelectedExamId(res.data[0].id);
        }
      } catch (err) {
        console.warn('Lỗi nạp danh sách ca thi:', err.message);
      }
    }
    loadExams();
  }, []);

  const loadSupervision = async (examId) => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await teacherService.getExamSupervision(examId);
      if (res.success) {
        setExamData(res.data.exam);
        setCandidates(res.data.candidates || []);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      loadSupervision(selectedExamId);
    }
  }, [selectedExamId]);

  const handleUpdateStatus = async (sinhVienId, newStatus) => {
    try {
      const res = await teacherService.updateCandidateStatus(selectedExamId, {
        sinh_vien_id: sinhVienId,
        trang_thai: newStatus
      });
      if (res.success) {
        setNotice({ type: 'success', message: 'Cập nhật trạng thái thí sinh thành công!' });
        loadSupervision(selectedExamId);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  // Lọc thí sinh theo từ khóa và trạng thái
  const filteredCandidates = candidates.filter((c) => {
    const matchSearch =
      !searchTerm ||
      c.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ma_sv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.so_bao_danh?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'checkin' && c.trang_thai === 'checkin') ||
      (statusFilter === 'suspicious' && c.trang_thai === 'suspicious') ||
      (statusFilter === 'pending' && (!c.trang_thai || c.trang_thai === 'chua_vao'));

    return matchSearch && matchStatus;
  });

  const checkedInCount = candidates.filter((c) => c.trang_thai === 'checkin').length;
  const suspiciousCount = candidates.filter((c) => c.trang_thai === 'suspicious').length;
  const pendingCount = candidates.length - checkedInCount - suspiciousCount;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* Header & Bộ chọn ca thi */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shadow-sm shrink-0">
              <FileCheck2 size={22} />
            </div>
            Giám Sát Phòng Thi & Điểm Danh AI
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi trạng thái check-in thí sinh theo thời gian thực và phát hiện cảnh báo nhận diện sai mặt
          </p>
        </div>

        {/* Dropdown chọn Ca thi */}
        <div className="w-full lg:w-96">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Chọn Ca Thi Đang Diễn Ra
          </label>
          <div className="relative">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.ngay_thi} ({ex.gio_bat_dau} - {ex.gio_ket_thuc}) | {ex.ten_mon} - Phòng {ex.phong_thi}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Thông tin chi tiết & KPI ca thi */}
      {examData && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Mã MH: {examData.ma_mon}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Phòng: {examData.phong_thi}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-1.5">
                {examData.ten_mon}
              </h2>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Ngày thi: <strong className="text-slate-700">{examData.ngay_thi}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-slate-400" />
                  Thời gian: <strong className="text-slate-700">{examData.gio_bat_dau} – {examData.gio_ket_thuc}</strong>
                </span>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng Sĩ Số</div>
                <div className="text-base font-black text-slate-900">{candidates.length}</div>
              </div>
              <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Đã Vào Phòng</div>
                <div className="text-base font-black text-emerald-700">{checkedInCount}</div>
              </div>
              <div className="bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 text-center">
                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Nghi Vấn</div>
                <div className="text-base font-black text-rose-700">{suspiciousCount}</div>
              </div>
              <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-center">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Chưa Đến</div>
                <div className="text-base font-black text-amber-700">{pendingCount}</div>
              </div>
            </div>
          </div>

          {/* Thanh tìm kiếm & Bộ lọc nhanh */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm thí sinh theo tên, mã SV, SBD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({candidates.length})
              </button>
              <button
                onClick={() => setStatusFilter('checkin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'checkin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Đã vào ({checkedInCount})
              </button>
              <button
                onClick={() => setStatusFilter('suspicious')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'suspicious'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Nghi vấn ({suspiciousCount})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Chưa đến ({pendingCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng danh sách thí sinh */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">SBD</th>
                <th className="py-3 px-4">Thí Sinh</th>
                <th className="py-3 px-4">Lớp Sinh Hoạt</th>
                <th className="py-3 px-4">Vị Trí Ngồi</th>
                <th className="py-3 px-4">Xác Thực FaceAI</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Xử Lý Giám Thị</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-purple-500 border-t-transparent"></div>
                    <p className="mt-2 text-xs font-semibold">Đang cập nhật danh sách phòng thi...</p>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 opacity-30" size={36} />
                    <p className="text-sm font-semibold text-slate-600">Không tìm thấy thí sinh nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-0.5">Thử đổi từ khóa hoặc bộ lọc trạng thái</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const isCheckin = c.trang_thai === 'checkin';
                  const isSuspicious = c.trang_thai === 'suspicious';

                  return (
                    <tr key={c.sinh_vien_id} className="hover:bg-slate-50/70 transition-colors">
                      {/* SBD */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs">
                          {c.so_bao_danh || '---'}
                        </span>
                      </td>

                      {/* Họ tên & Mã SV */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                            {c.ho_ten ? c.ho_ten.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{c.ho_ten}</div>
                            <div className="text-[11px] font-mono text-slate-400">{c.ma_sv}</div>
                          </div>
                        </div>
                      </td>

                      {/* Lớp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {c.ten_lop || 'Chưa gán'}
                      </td>

                      {/* Vị trí ngồi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                          {c.vi_tri_ngoi || 'Bàn ' + (c.so_bao_danh || '#')}
                        </span>
                      </td>

                      {/* Ảnh Check-in FaceAI */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.captured_image_url ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={`http://localhost:5000${c.captured_image_url}`}
                              alt="Webcam capture"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm"
                            />
                            {c.similarity_score && (
                              <span className="text-xs font-bold text-blue-600 font-mono">
                                {(c.similarity_score * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1">
                            <Camera size={13} /> Chưa có ảnh
                          </span>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-mono">
                        {c.thoi_gian_checkin || '---'}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isCheckin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Đã vào phòng
                          </span>
                        ) : isSuspicious ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <ShieldAlert size={12} /> Nghi vấn (Sai mặt)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            Chưa vào
                          </span>
                        )}
                      </td>

                      {/* Xử lý nhanh */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(c.sinh_vien_id, 'checkin')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              isCheckin
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="Xác nhận cho thí sinh vào phòng thi"
                          >
                            Hợp lệ
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(c.sinh_vien_id, 'suspicious')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              isSuspicious
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                            title="Đánh dấu nghi vấn gian lận thi cử"
                          >
                            Nghi vấn
                          </button>
                        </div>
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
