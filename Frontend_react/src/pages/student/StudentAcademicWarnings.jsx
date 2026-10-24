import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { AlertTriangle, CheckCircle2, ShieldAlert, FileText, Info } from 'lucide-react';

export default function StudentAcademicWarnings() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarnings = async () => {
      try {
        setLoading(true);
        const res = await studentService.getAcademicWarnings();
        if (res?.success) {
          setWarnings(res.data || []);
        } else if (res.data?.success) {
          setWarnings(res.data.data || []);
        } else if (Array.isArray(res)) {
          setWarnings(res);
        }
      } catch (err) {
        console.error('Lỗi tải cảnh báo:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWarnings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu học vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Quy chế Đào tạo & Học vụ</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Theo dõi Cảnh báo Học vụ</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quy định xử lý học vụ theo tín chỉ: Cảnh báo mức 1, Mức 2 và Buộc thôi học khi GPA &lt; 2.0 hoặc nợ môn quá hạn
          </p>
        </div>
      </div>

      {warnings.length === 0 ? (
        <div className="bg-emerald-50/60 rounded-2xl p-8 border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-900">Tình trạng Học vụ Bình thường</h3>
          <p className="text-sm text-emerald-700 max-w-lg mx-auto">
            Chúc mừng bạn! Hiện tại bạn không có bất kỳ nhắc nhở hay quyết định cảnh báo học vụ nào từ Nhà trường và Khoa.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  {w.muc_canh_bao}
                </span>
                <span className="text-xs text-slate-400">
                  Ngày ra quyết định: {w.ngay_ra_quyet_dinh ? w.ngay_ra_quyet_dinh.substring(0, 10) : ''}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{w.ly_do}</p>
              {w.so_quyet_dinh && (
                <p className="text-xs text-slate-500">Số quyết định: <strong>{w.so_quyet_dinh}</strong></p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
