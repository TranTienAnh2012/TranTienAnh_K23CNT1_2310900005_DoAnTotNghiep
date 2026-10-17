import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { teacherService } from '../../services/teacherService';
import Notification from '../../components/common/Notification';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Camera,
  Check,
  AlertCircle,
  Calendar,
  Users,
  Search,
  BookOpenCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function AttendanceManager() {
  const [searchParams] = useSearchParams();
  const initialSessionId = searchParams.get('sessionId');

  const [schedule, setSchedule] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || '');
  const [sessionData, setSessionData] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await teacherService.getMySchedule();
        if (res.success && res.data.length > 0) {
          setSchedule(res.data);
          if (!selectedSessionId) {
            setSelectedSessionId(res.data[0].id);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải lịch dạy:', err.message);
      }
    }
    loadSchedule();
  }, []);

  const loadAttendance = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await teacherService.getSessionAttendance(sessionId);
      if (res.success) {
        setSessionData(res.data.session);
        setAttendees(res.data.attendees || []);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      loadAttendance(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleManualOverride = async (sinhVienId, newStatus) => {
    try {
      const res = await teacherService.manualOverride(selectedSessionId, {
        sinh_vien_id: sinhVienId,
        trang_thai: newStatus
      });
      if (res.success) {
        setNotice({ type: 'success', message: 'Cập nhật điểm danh thành công!' });
        loadAttendance(selectedSessionId);
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const presentCount = attendees.filter((a) => a.trang_thai === 'Present').length;
  const lateCount = attendees.filter((a) => a.trang_thai === 'Late').length;
  const absentCount = attendees.filter((a) => a.trang_thai === 'Absent' || !a.trang_thai).length;

  const filteredAttendees = attendees.filter((a) => {
    const matchSearch =
      !searchTerm ||
      a.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ma_sv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ten_lop?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Present' && a.trang_thai === 'Present') ||
      (statusFilter === 'Late' && a.trang_thai === 'Late') ||
      (statusFilter === 'Absent' && (a.trang_thai === 'Absent' || !a.trang_thai));

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* Header & Bộ chọn buổi học */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shadow-sm shrink-0">
              <BookOpenCheck size={22} />
            </div>
            Duyệt & Quản Lý Điểm Danh Lớp Học
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi trạng thái điểm danh Face AI + GPS và duyệt thủ công linh hoạt cho từng sinh viên
          </p>
        </div>

        {/* Dropdown chọn Buổi học */}
        <div className="w-full lg:w-96">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Chọn Buổi Học Cần Điểm Danh
          </label>
          <div className="relative">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {schedule.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ngay_hoc} - {s.ca_hoc} | {s.ten_lhp} ({s.phong_hoc})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Thông tin buổi học & KPI */}
      {sessionData && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {sessionData.ma_lhp}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Phòng: {sessionData.phong_hoc}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-1.5">
                {sessionData.ten_lhp} — {sessionData.ten_mon}
              </h2>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Ngày học: <strong className="text-slate-700">{sessionData.ngay_hoc}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-slate-400" />
                  Ca học: <strong className="text-slate-700">{sessionData.ca_hoc}</strong>
                </span>
              </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sĩ Số</div>
                <div className="text-base font-black text-slate-900">{attendees.length}</div>
              </div>
              <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Có Mặt</div>
                <div className="text-base font-black text-emerald-700">{presentCount}</div>
              </div>
              <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-center">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Đi Muộn</div>
                <div className="text-base font-black text-amber-700">{lateCount}</div>
              </div>
              <div className="bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 text-center">
                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Vắng Mặt</div>
                <div className="text-base font-black text-rose-700">{absentCount}</div>
              </div>
            </div>
          </div>

          {/* Thanh lọc & tìm kiếm */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm sinh viên theo tên, mã SV, lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({attendees.length})
              </button>
              <button
                onClick={() => setStatusFilter('Present')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'Present'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Có mặt ({presentCount})
              </button>
              <button
                onClick={() => setStatusFilter('Late')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'Late'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Đi muộn ({lateCount})
              </button>
              <button
                onClick={() => setStatusFilter('Absent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'Absent'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Vắng ({absentCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng danh sách sinh viên */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">Sinh Viên</th>
                <th className="py-3 px-4">Lớp Sinh Hoạt</th>
                <th className="py-3 px-4">Ảnh Điểm Danh (AI)</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4">Phương Thức</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Duyệt Thủ Công (Override)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-xs font-semibold">Đang cập nhật danh sách sinh viên...</p>
                  </td>
                </tr>
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 opacity-30" size={36} />
                    <p className="text-sm font-semibold text-slate-600">Không tìm thấy sinh viên nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-0.5">Thử đổi từ khóa hoặc bộ lọc trạng thái</p>
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((r) => {
                  const isPresent = r.trang_thai === 'Present';
                  const isLate = r.trang_thai === 'Late';
                  const isAbsent = r.trang_thai === 'Absent' || !r.trang_thai;

                  return (
                    <tr key={r.sinh_vien_id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Sinh viên */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                            {r.ho_ten ? r.ho_ten.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{r.ho_ten}</div>
                            <div className="text-[11px] font-mono text-slate-400">{r.ma_sv}</div>
                          </div>
                        </div>
                      </td>

                      {/* Lớp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-semibold">
                        {r.ten_lop || 'Chưa gán'}
                      </td>

                      {/* Ảnh AI */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {r.captured_image_url ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={`http://localhost:5000${r.captured_image_url}`}
                              alt="Check-in AI"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm"
                            />
                            {r.similarity_score && (
                              <span className="text-xs font-bold text-blue-600 font-mono">
                                {(r.similarity_score * 100).toFixed(0)}%
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
                        {r.thoi_gian_checkin || '---'}
                      </td>

                      {/* Phương thức */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            r.phuong_thuc === 'FaceAI'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Sparkles size={11} />
                          {r.phuong_thuc === 'FaceAI' ? 'FaceAI + GPS' : 'Giảng viên sửa'}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Có mặt
                          </span>
                        ) : isLate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={12} /> Đi muộn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={12} /> Vắng mặt
                          </span>
                        )}
                      </td>

                      {/* Nút override */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleManualOverride(r.sinh_vien_id, 'Present')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="Xác nhận Có mặt"
                          >
                            Có mặt
                          </button>
                          <button
                            onClick={() => handleManualOverride(r.sinh_vien_id, 'Late')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              isLate
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                            title="Đánh dấu Đi muộn"
                          >
                            Muộn
                          </button>
                          <button
                            onClick={() => handleManualOverride(r.sinh_vien_id, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                            title="Đánh dấu Vắng mặt"
                          >
                            Vắng
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
