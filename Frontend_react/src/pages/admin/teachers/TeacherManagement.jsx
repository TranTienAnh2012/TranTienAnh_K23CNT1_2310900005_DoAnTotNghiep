import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import TeacherDetailModal from './TeacherDetailModal';
import TeacherEditModal from './TeacherEditModal';
import TeacherDeleteModal from './TeacherDeleteModal';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  // Modal thêm giảng viên (Chỉ thông tin, không tạo tài khoản)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    ma_gv: '',
    ho_ten: '',
    email: '',
    khoa_id: ''
  });

  // 3 Popups: Details, Edit, Delete
  const [detailTeacher, setDetailTeacher] = useState(null);
  const [editTeacher, setEditTeacher] = useState(null);
  const [deleteTeacher, setDeleteTeacher] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, fRes] = await Promise.all([
        adminService.getTeachers(),
        adminService.getFaculties()
      ]);
      if (tRes.success) setTeachers(tRes.data || []);
      if (fRes.success) {
        setFaculties(fRes.data || []);
        if (fRes.data?.length > 0 && !form.khoa_id) {
          setForm((prev) => ({ ...prev, khoa_id: fRes.data[0].id }));
        }
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ma_gv: form.ma_gv.trim(),
        ho_ten: form.ho_ten.trim(),
        email: form.email.trim(),
        khoa_id: form.khoa_id
      };
      const res = await adminService.createTeacher(payload);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCreateModalOpen(false);
        setForm({
          ma_gv: '',
          ho_ten: '',
          email: '',
          khoa_id: faculties[0]?.id || ''
        });
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const displayTeachers = selectedFaculty === 'all'
    ? teachers
    : teachers.filter((t) => String(t.khoa_id) === String(selectedFaculty));

  const totalCount = teachers.length;
  const activeCount = teachers.filter((t) => t.is_active !== false).length;

  const columns = [
    {
      header: 'Mã GV',
      accessor: 'ma_gv',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 tracking-tight text-xs sm:text-sm">
          {row.ma_gv}
        </span>
      )
    },
    {
      header: 'Họ và Tên',
      accessor: 'ho_ten',
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
            {row.ho_ten ? row.ho_ten.charAt(0) : 'G'}
          </div>
          <div>
            <div className="font-bold text-slate-900 whitespace-nowrap">{row.ho_ten}</div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap">
              Giảng viên cơ hữu
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Khoa / Bộ môn',
      accessor: 'ten_khoa',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-md font-medium whitespace-nowrap">
          <Building2 size={13} className="text-indigo-600 shrink-0" />
          {row.ten_khoa || 'Chưa phân khoa'}
        </span>
      )
    },
    {
      header: 'Email & Tài khoản',
      accessor: 'email',
      render: (row) => (
        <div className="min-w-[150px]">
          <div className="text-xs text-slate-700 whitespace-nowrap">{row.email}</div>
          <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
            {row.username ? `@${row.username}` : 'Chưa cấp tài khoản'}
          </div>
        </div>
      )
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
            row.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {row.is_active !== false ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {row.is_active !== false ? 'Đang công tác' : 'Tạm dừng'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDetailTeacher(row)}
            title="Xem chi tiết"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setEditTeacher(row)}
            title="Chỉnh sửa"
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteTeacher(row)}
            title="Xóa hồ sơ"
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  const renderListItem = (item) => (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center border border-blue-100 shrink-0">
          {item.ho_ten ? item.ho_ten.charAt(0) : 'G'}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{item.ho_ten}</h4>
          <span className="text-xs text-slate-500 font-mono">Mã GV: {item.ma_gv}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs">
        <span className="inline-flex items-center gap-1.5 text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-md font-medium">
          <Building2 size={13} className="text-indigo-600 shrink-0" />
          {item.ten_khoa || 'Chưa phân khoa'}
        </span>

        <span className="text-slate-600 flex items-center gap-1">
          <Mail size={13} className="text-slate-400" />
          {item.email}
        </span>

        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            item.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {item.is_active !== false ? 'Đang công tác' : 'Tạm dừng'}
        </span>

        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
          <button
            onClick={() => setDetailTeacher(item)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setEditTeacher(item)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteTeacher(item)}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderBoxItem = (item) => (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between p-4">
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 font-bold text-base flex items-center justify-center border border-blue-100 shrink-0">
            {item.ho_ten ? item.ho_ten.charAt(0) : 'G'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{item.ho_ten}</h4>
            <span className="text-xs text-indigo-600 font-mono font-medium">Mã: {item.ma_gv}</span>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            item.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {item.is_active !== false ? 'Đang công tác' : 'Nghỉ'}
        </span>
      </div>

      <div className="py-3 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Khoa / Bộ môn:</span>
          <span className="font-semibold text-slate-800 text-right truncate max-w-[150px]">{item.ten_khoa || 'Hệ thống'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Email:</span>
          <span className="text-slate-700 truncate max-w-[150px]">{item.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Tài khoản:</span>
          <span className="font-mono text-slate-600">{item.username ? `@${item.username}` : 'Chưa cấp'}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
        <button
          onClick={() => setDetailTeacher(item)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={() => setEditTeacher(item)}
          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={() => setDeleteTeacher(item)}
          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng số giảng viên</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đang công tác</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng số Khoa / Viện</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{faculties.length}</div>
          </div>
        </div>
      </div>

      <DataView
        title="Quản lý Giảng viên"
        subtitle="Quản lý đội ngũ giảng viên, học hàm, đơn vị công tác và phân công giảng dạy"
        data={displayTeachers}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        loading={loading}
        searchKeys={['ho_ten', 'ma_gv', 'email', 'ten_khoa']}
        searchPlaceholder="Tìm kiếm giảng viên theo tên, mã GV, khoa..."
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
          >
            <UserPlus size={15} /> <span>Thêm Giảng viên</span>
          </button>
        }
        filters={
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="py-2 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer min-w-[160px]"
          >
            <option value="all">Tất cả các khoa ({teachers.length})</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.ten_khoa}
              </option>
            ))}
          </select>
        }
      />

      {/* Modal Thêm Giảng viên (Không tạo tài khoản ở đây) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Hồ sơ Giảng viên mới"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-3.5">
          {/* Thông báo phân định rõ luồng tài khoản */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-800 text-xs leading-relaxed">
            💡 <strong>Hệ thống nội bộ:</strong> Thêm hồ sơ giảng viên tại đây không yêu cầu tạo tài khoản. Việc cấp tài khoản đăng nhập do Quản trị viên cấp riêng và tập trung tại mục <strong>Quản lý Tài khoản Hệ thống</strong>.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khoa / Bộ môn trực thuộc *
            </label>
            <select
              value={form.khoa_id}
              onChange={(e) => setForm({ ...form, khoa_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
              required
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ten_khoa} ({f.ma_khoa})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Giảng viên (MSGV) *
              </label>
              <input
                type="text"
                required
                placeholder="vd: GV001"
                value={form.ma_gv}
                onChange={(e) => setForm({ ...form, ma_gv: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và Tên *
              </label>
              <input
                type="text"
                required
                placeholder="vd: TS. Nguyễn Văn Hùng"
                value={form.ho_ten}
                onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email công tác *
            </label>
            <input
              type="email"
              required
              placeholder="hung.nv@smartedu.edu.vn"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
            >
              Lưu Hồ sơ Giảng viên
            </button>
          </div>
        </form>
      </Modal>

      {/* 3 Popups: Details, Edit, Delete */}
      <TeacherDetailModal
        isOpen={Boolean(detailTeacher)}
        teacher={detailTeacher}
        onClose={() => setDetailTeacher(null)}
        onEdit={(t) => setEditTeacher(t)}
      />

      <TeacherEditModal
        isOpen={Boolean(editTeacher)}
        teacher={editTeacher}
        faculties={faculties}
        onClose={() => setEditTeacher(null)}
        onSuccess={() => {
          loadData();
          setNotice({ type: 'success', message: 'Cập nhật giảng viên thành công!' });
        }}
      />

      <TeacherDeleteModal
        isOpen={Boolean(deleteTeacher)}
        teacher={deleteTeacher}
        onClose={() => setDeleteTeacher(null)}
        onSuccess={() => {
          loadData();
          setNotice({ type: 'success', message: 'Đã xóa giảng viên khỏi hệ thống!' });
        }}
      />
    </div>
  );
}
