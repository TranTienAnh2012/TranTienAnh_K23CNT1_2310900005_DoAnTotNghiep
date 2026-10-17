import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import ClassDetailModal from './ClassDetailModal';
import ClassEditModal from './ClassEditModal';
import ClassDeleteModal from './ClassDeleteModal';
import ClassStudentsModal from './ClassStudentsModal';
import {
  Users,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  UserCheck
} from 'lucide-react';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  // Modal thêm lớp
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    ma_lop: '',
    ten_lop: '',
    khoa_hoc: '',
    khoa_id: ''
  });

  // 4 Popups: Details, Edit, Delete, Students List
  const [detailClass, setDetailClass] = useState(null);
  const [editClass, setEditClass] = useState(null);
  const [deleteClass, setDeleteClass] = useState(null);
  const [studentsClass, setStudentsClass] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        adminService.getClasses(),
        adminService.getFaculties()
      ]);
      if (cRes.success) setClasses(cRes.data);
      if (fRes.success) {
        setFaculties(fRes.data);
        if (fRes.data.length > 0 && !form.khoa_id) {
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

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createClass(form);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setIsCreateModalOpen(false);
        setForm({
          ma_lop: '',
          ten_lop: '',
          khoa_hoc: '',
          khoa_id: faculties[0]?.id || ''
        });
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const displayClasses = selectedFaculty === 'all'
    ? classes
    : classes.filter((c) => String(c.khoa_id) === String(selectedFaculty));

  const columns = [
    {
      header: 'Mã Lớp',
      accessor: 'ma_lop',
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {row.ma_lop}
        </span>
      )
    },
    {
      header: 'Tên Lớp sinh hoạt',
      accessor: 'ten_lop',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users size={16} />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.ten_lop}</span>
        </div>
      )
    },
    {
      header: 'Khoa / Viện',
      accessor: 'ten_khoa',
      render: (row) => (
        <span className="text-slate-600 text-xs font-medium">
          {row.ten_khoa || 'Chưa gán'}
        </span>
      )
    },
    {
      header: 'Khóa học',
      accessor: 'khoa_hoc',
      render: (row) => (
        <span className="text-slate-500 text-xs font-medium">{row.khoa_hoc}</span>
      )
    },
    {
      header: 'Sĩ số',
      accessor: 'total_students',
      render: (row) => (
        <button
          onClick={() => setStudentsClass(row)}
          title="Bấm để xem danh sách sinh viên của lớp"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            row.total_students > 0
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          <Users size={12} />
          {row.total_students || 0} SV
        </button>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStudentsClass(row)}
            title="Danh sách sinh viên"
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Users size={14} />
          </button>
          <button
            onClick={() => setDetailClass(row)}
            title="Xem chi tiết"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditClass(row)}
            title="Chỉnh sửa"
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteClass(row)}
            title="Xóa lớp"
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
          <Users size={20} />
        </div>
        <div>
          <div className="font-bold text-slate-800 text-sm">{item.ten_lop}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Mã: <span className="font-mono text-blue-600 font-semibold">{item.ma_lop}</span> • Khoa: {item.ten_khoa || 'Chưa gán'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-xs text-slate-600 font-medium">
          Khóa: <span className="font-bold text-slate-800">{item.khoa_hoc}</span>
        </div>

        <button
          onClick={() => setStudentsClass(item)}
          title="Xem danh sách sinh viên"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <Users size={12} />
          {item.total_students || 0} sinh viên
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDetailClass(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <Eye size={13} /> Chi tiết
          </button>
          <button
            onClick={() => setEditClass(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors"
          >
            <Edit2 size={13} /> Sửa
          </button>
          <button
            onClick={() => setDeleteClass(item)}
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
            <Users size={22} />
          </div>

          <button
            onClick={() => setStudentsClass(item)}
            title="Xem danh sách sinh viên"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Users size={12} />
            {item.total_students || 0} SV
          </button>
        </div>

        <div className="text-base font-bold text-slate-800 mb-1">
          {item.ten_lop}
        </div>
        <div className="text-xs text-slate-500 font-mono mb-3">
          Mã lớp: <span className="font-semibold text-slate-700">{item.ma_lop}</span>
        </div>

        <div className="text-xs text-slate-600 flex flex-col gap-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 font-medium">Khóa:</span> <span className="font-semibold text-slate-700">{item.khoa_hoc}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Khoa:</span> <span className="font-semibold text-slate-700">{item.ten_khoa || 'Chưa gán'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button
          onClick={() => setDetailClass(item)}
          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Chi tiết"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() => setEditClass(item)}
          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Sửa"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => setDeleteClass(item)}
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

      <DataView
        title="Quản lý Lớp sinh hoạt"
        subtitle="Danh sách các lớp sinh hoạt hành chính theo từng khóa và khoa phụ trách"
        data={displayClasses}
        columns={columns}
        renderListItem={renderListItem}
        renderBoxItem={renderBoxItem}
        loading={loading}
        searchFields={['ten_lop', 'ma_lop', 'khoa_hoc', 'ten_khoa']}
        searchPlaceholder="Tìm kiếm lớp theo tên, mã lớp, khóa, khoa..."
        actionButton={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow"
          >
            <Plus size={16} /> Thêm Lớp mới
          </button>
        }
        filterComponent={
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="all">Tất cả các khoa ({classes.length})</option>
            {faculties.map((f) => {
              const count = classes.filter((c) => String(c.khoa_id) === String(f.id)).length;
              return (
                <option key={f.id} value={f.id}>
                  {f.ten_khoa} ({count} lớp)
                </option>
              );
            })}
          </select>
        }
      />

      {/* Modal Thêm Lớp Mới */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Lớp Sinh Hoạt Mới"
      >
        <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Mã Lớp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: K23CNT1"
              value={form.ma_lop}
              onChange={(e) => setForm({ ...form, ma_lop: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Tên Lớp Sinh Hoạt <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Công nghệ Thông tin 1 - K23"
              value={form.ten_lop}
              onChange={(e) => setForm({ ...form, ten_lop: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Khóa Học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: 2023-2027 hoặc K23"
                value={form.khoa_hoc}
                onChange={(e) => setForm({ ...form, khoa_hoc: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Khoa Quản Lý <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.khoa_id}
                onChange={(e) => setForm({ ...form, khoa_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.ten_khoa}
                  </option>
                ))}
              </select>
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
              Tạo mới Lớp
            </button>
          </div>
        </form>
      </Modal>

      {/* 4 Popups nghiệp vụ: Chi tiết, Sửa, Xóa, Danh sách SV */}
      <ClassDetailModal
        isOpen={Boolean(detailClass)}
        onClose={() => setDetailClass(null)}
        targetClass={detailClass}
        onEdit={(cls) => setEditClass(cls)}
      />

      <ClassEditModal
        isOpen={Boolean(editClass)}
        onClose={() => setEditClass(null)}
        targetClass={editClass}
        faculties={faculties}
        onSuccess={loadData}
      />

      <ClassDeleteModal
        isOpen={Boolean(deleteClass)}
        onClose={() => setDeleteClass(null)}
        targetClass={deleteClass}
        onSuccess={loadData}
      />

      <ClassStudentsModal
        isOpen={Boolean(studentsClass)}
        onClose={() => setStudentsClass(null)}
        targetClass={studentsClass}
      />
    </div>
  );
}
