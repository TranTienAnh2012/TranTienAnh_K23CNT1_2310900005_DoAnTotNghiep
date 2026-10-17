import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import FacultyDetailModal from './FacultyDetailModal';
import FacultyEditModal from './FacultyEditModal';
import FacultyDeleteModal from './FacultyDeleteModal';
import {
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Users,
  GraduationCap,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';

export default function FacultyManagement() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  // Modal thêm khoa
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    ma_khoa: '',
    ten_khoa: '',
    so_dien_thoai: '',
    email: '',
    van_phong: '',
    truong_khoa: ''
  });

  // 3 Popups: Details, Edit, Delete
  const [detailFaculty, setDetailFaculty] = useState(null);
  const [editFaculty, setEditFaculty] = useState(null);
  const [deleteFaculty, setDeleteFaculty] = useState(null);

  const loadFaculties = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFaculties();
      if (res.success) setFaculties(res.data);
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculties();
  }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createFaculty(form);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCreateModalOpen(false);
        setForm({
          ma_khoa: '',
          ten_khoa: '',
          so_dien_thoai: '',
          email: '',
          van_phong: '',
          truong_khoa: ''
        });
        loadFaculties();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const columns = [
    {
      header: 'Mã Khoa',
      accessor: 'ma_khoa',
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {row.ma_khoa}
        </span>
      )
    },
    {
      header: 'Tên Khoa / Viện',
      accessor: 'ten_khoa',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Building2 size={16} />
          </div>
          <div>
            <span className="font-semibold text-slate-800 text-sm block">{row.ten_khoa}</span>
            <span className="text-xs text-slate-500">
              VP: {row.van_phong || 'Chưa cập nhật'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Trưởng Khoa',
      accessor: 'truong_khoa',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <UserCheck size={14} className="text-blue-600 shrink-0" />
          <span>{row.truong_khoa || 'Chưa phân công'}</span>
        </div>
      )
    },
    {
      header: 'Liên hệ',
      render: (row) => (
        <div className="text-xs text-slate-600 flex flex-col gap-0.5">
          {row.email && (
            <div className="flex items-center gap-1 text-slate-500">
              <Mail size={12} className="shrink-0" /> {row.email}
            </div>
          )}
          <div className="flex items-center gap-1 text-slate-500">
            <Phone size={12} className="shrink-0" /> {row.so_dien_thoai || '---'}
          </div>
        </div>
      )
    },
    {
      header: 'Quy mô',
      render: (row) => (
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            {row.total_classes || 0} lớp
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            {row.total_teachers || 0} GV
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {row.total_students || 0} SV
          </span>
        </div>
      )
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
            row.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {row.is_active !== false ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDetailFaculty(row)}
            title="Xem chi tiết"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditFaculty(row)}
            title="Chỉnh sửa"
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteFaculty(row)}
            title="Xóa khoa"
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  const renderListItem = (item) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 hover:border-blue-200 hover:shadow-sm transition-all gap-4 flex-wrap">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Building2 size={20} />
        </div>
        <div>
          <div className="font-bold text-slate-800 text-base">{item.ten_khoa}</div>
          <div className="text-xs text-slate-500 flex gap-2 flex-wrap mt-0.5">
            <span>Mã: <strong className="text-blue-600 font-mono">{item.ma_khoa}</strong></span>
            {item.truong_khoa && <span>• Trưởng khoa: <strong>{item.truong_khoa}</strong></span>}
            {item.van_phong && <span>• VP: {item.van_phong}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1.5">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            {item.total_classes || 0} lớp
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            {item.total_teachers || 0} GV
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {item.total_students || 0} SV
          </span>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-1.5">
          <Phone size={14} className="text-slate-400" />
          {item.so_dien_thoai || 'Chưa có SĐT'}
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
            item.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {item.is_active !== false ? 'Hoạt động' : 'Tạm dừng'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDetailFaculty(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <Eye size={13} /> Chi tiết
          </button>
          <button
            onClick={() => setEditFaculty(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors"
          >
            <Edit2 size={13} /> Sửa
          </button>
          <button
            onClick={() => setDeleteFaculty(item)}
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderBoxItem = (item) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all">
      <div>
        <div className="flex items-start justify-between mb-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Building2 size={22} />
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
              item.is_active !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {item.is_active !== false ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>

        <div className="text-base font-bold text-slate-800 mb-1">
          {item.ten_khoa}
        </div>
        <div className="text-xs text-slate-500 font-mono mb-3">
          Mã khoa: <span className="font-semibold text-slate-700">{item.ma_khoa}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 font-medium">Trưởng khoa:</span> <span className="font-semibold text-slate-700">{item.truong_khoa || 'Chưa phân công'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Văn phòng:</span> <span className="font-semibold text-slate-700">{item.van_phong || 'Chưa có'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Hotline:</span> <span className="font-semibold text-slate-700">{item.so_dien_thoai || '---'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Lớp</div>
            <div className="text-sm font-extrabold text-blue-700">{item.total_classes || 0}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">GV</div>
            <div className="text-sm font-extrabold text-emerald-700">{item.total_teachers || 0}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">SV</div>
            <div className="text-sm font-extrabold text-indigo-700">{item.total_students || 0}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button
          onClick={() => setDetailFaculty(item)}
          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Chi tiết"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() => setEditFaculty(item)}
          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Sửa"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => setDeleteFaculty(item)}
          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          title="Xóa"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* Main DataView */}
      <DataView
        title="Quản lý Khoa / Viện Đào tạo"
        subtitle="Quản lý danh sách các khoa, ban chuyên môn, ban chủ nhiệm và cơ cấu tổ chức"
        data={faculties}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        loading={loading}
        searchFields={['ten_khoa', 'ma_khoa', 'so_dien_thoai', 'truong_khoa', 'van_phong', 'email']}
        searchPlaceholder="Tìm kiếm khoa theo tên, mã, trưởng khoa, phòng làm việc..."
        actionButton={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow"
          >
            <Plus size={16} /> Thêm Khoa mới
          </button>
        }
      />

      {/* Modal Thêm Khoa */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Khoa / Viện Mới"
      >
        <form onSubmit={handleCreateFaculty} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Mã Khoa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="vd: CNTT"
                value={form.ma_khoa}
                onChange={(e) => setForm({ ...form, ma_khoa: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Tên Khoa / Viện <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="vd: Khoa Công nghệ Thông tin"
                value={form.ten_khoa}
                onChange={(e) => setForm({ ...form, ten_khoa: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Trưởng khoa phụ trách
              </label>
              <input
                type="text"
                placeholder="vd: PGS.TS. Nguyễn Văn A"
                value={form.truong_khoa}
                onChange={(e) => setForm({ ...form, truong_khoa: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Văn phòng khoa
              </label>
              <input
                type="text"
                placeholder="vd: P.305 - Nhà C"
                value={form.van_phong}
                onChange={(e) => setForm({ ...form, van_phong: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email văn phòng
              </label>
              <input
                type="email"
                placeholder="vd: fit@smartedu.edu.vn"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Hotline / SĐT
              </label>
              <input
                type="text"
                placeholder="vd: 02438691234"
                value={form.so_dien_thoai}
                onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-colors shadow-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow"
            >
              Tạo Khoa
            </button>
          </div>
        </form>
      </Modal>

      {/* 3 Popups: Details, Edit, Delete */}
      <FacultyDetailModal
        isOpen={Boolean(detailFaculty)}
        faculty={detailFaculty}
        onClose={() => setDetailFaculty(null)}
        onEdit={(f) => setEditFaculty(f)}
      />

      <FacultyEditModal
        isOpen={Boolean(editFaculty)}
        faculty={editFaculty}
        onClose={() => setEditFaculty(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Cập nhật khoa thành công!' });
          loadFaculties();
        }}
      />

      <FacultyDeleteModal
        isOpen={Boolean(deleteFaculty)}
        faculty={deleteFaculty}
        onClose={() => setDeleteFaculty(null)}
        onSuccess={() => {
          setNotice({ type: 'success', message: 'Đã xóa khoa thành công!' });
          loadFaculties();
        }}
      />
    </div>
  );
}
