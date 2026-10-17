import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import { Calendar, Clock, MapPin, CheckCircle2, BookOpen, Layers, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeachingSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await teacherService.getMySchedule();
        if (res.success) setSchedule(res.data || []);
      } catch (err) {
        console.warn('Lỗi nạp lịch dạy:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shadow-sm shrink-0">
              <Calendar size={22} />
            </div>
            Lịch Giảng Dạy & Buổi Học
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Xem toàn bộ danh sách các buổi học được phân công và mở cổng điểm danh cho sinh viên
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Danh sách buổi giảng dạy ({schedule.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">Ngày Học</th>
                <th className="py-3 px-4">Ca Học</th>
                <th className="py-3 px-4">Lớp Học Phần</th>
                <th className="py-3 px-4">Môn Học</th>
                <th className="py-3 px-4">Phòng Học</th>
                <th className="py-3 px-4">Thống Kê Điểm Danh</th>
                <th className="py-3 px-4">Trạng Thái Cổng</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-xs font-semibold">Đang tải lịch giảng dạy...</p>
                  </td>
                </tr>
              ) : schedule.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Calendar className="mx-auto mb-2 opacity-30" size={36} />
                    <p className="text-sm font-semibold text-slate-600">Bạn chưa có lịch dạy nào</p>
                  </td>
                </tr>
              ) : (
                schedule.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Ngày học */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 font-mono">
                      {r.ngay_hoc}
                    </td>

                    {/* Ca học */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={13} className="text-slate-400" />
                        <span>{r.ca_hoc}</span>
                      </div>
                    </td>

                    {/* Lớp HP */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-blue-700">
                      {r.ten_lhp}
                    </td>

                    {/* Môn học */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-800">
                      {r.ten_mon}
                    </td>

                    {/* Phòng học */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                        <MapPin size={12} className="text-slate-500" />
                        {r.phong_hoc || '---'}
                      </span>
                    </td>

                    {/* Thống kê SV */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Có mặt: {r.count_present || 0}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Vắng: {r.count_absent || 0}
                        </span>
                      </div>
                    </td>

                    {/* Cổng điểm danh */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          r.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {r.is_active ? 'Đang mở' : 'Đã khóa'}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        to={`/teacher/attendance?sessionId=${r.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow"
                      >
                        <CheckCircle2 size={13} />
                        <span>Duyệt điểm danh</span>
                      </Link>
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
