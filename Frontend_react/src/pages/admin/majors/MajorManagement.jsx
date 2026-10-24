import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import DataView from '../../../components/common/DataView';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';
import {
  GraduationCap,
  Plus,
  Building2,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  Layers,
  BookOpenCheck
} from 'lucide-react';

export default function MajorManagement() {
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  // Bộ lọc
  const [filterKhoa, setFilterKhoa] = useState('all');

  // Modal tạo mới / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [form, setForm] = useState({
    khoa_id: '',
    ma_nganh: '',
    ten_nganh: '',
    thoi_gian_dao_tao_nam: 4,
    tong_tin_chi_yeu_cau: 135,
    is_active: 1
  });

  // Modal xóa
  const [deleteMajor, setDeleteMajor] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [majorRes, facRes] = await Promise.all([
        adminService.getMajors(),
        adminService.getFaculties()
      ]);
      if (majorRes.success) setMajors(majorRes.data);
      if (facRes.success) setFaculties(facRes.data);
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingMajor(null);
    setForm({
      khoa_id: faculties[0]?.id || '',
      ma_nganh: '',
      ten_nganh: '',
      thoi_gian_dao_tao_nam: 4,
      tong_tin_chi_yeu_cau: 135,
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMajor(m);
    setForm({
      khoa_id: m.khoa_id,
      ma_nganh: m.ma_nganh,
      ten_nganh: m.ten_nganh,
      thoi_gian_dao_tao_nam: m.thoi_gian_dao_tao_nam || 4,
      tong_tin_chi_yeu_cau: m.tong_tin_chi_yeu_cau || 135,
      is_active: m.is_active ? 1 : 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMajor) {
        const res = await adminService.updateMajor(editingMajor.id, form);
        if (res.success) {
          setNotice({ type: 'success', message: res.message });
          setIsModalOpen(false);
          loadData();
        }
      } else {
        const res = await adminService.createMajor(form);
        if (res.success) {
          setNotice({ type: 'success', message: res.message });
          setIsModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteMajor) return;
    try {
      const res = await adminService.deleteMajor(deleteMajor.id);
      if (res.success) {
        setNotice({ type: 'success', message: res.message });
        setDeleteMajor(null);
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const filteredMajors = majors.filter((m) => {
    if (filterKhoa !== 'all' && String(m.khoa_id) !== String(filterKhoa)) return false;
    return true;
  });

  const columns = [
    {
      header: 'Mã Ngành',
      accessor: 'ma_nganh',
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {row.ma_nganh}
        </span>
      )
    },
    {
      header: 'Tên Ngành Đào tạo',
      accessor: 'ten_nganh',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <GraduationCap size={16} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{row.ten_nganh}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <span>{row.ten_khoa}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Khoa Quản lý',
      accessor: 'ten_khoa',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
          <Building2 className="w-3 h-3 text-slate-400" />
          {row.ten_khoa}
        </span>
      )
    },
    {
      header: 'Thời gian đào tạo',
      accessor: 'thoi_gian_dao_tao_nam',
      render: (row) => (
        <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.thoi_gian_dao_tao_nam || 4} Năm</span>
          <span className="text-slate-400">({(row.thoi_gian_dao_tao_nam || 4) * 2} Kỳ)</span>
        </div>
      )
    },
    {
      header: 'Tín chỉ quy chuẩn',
      accessor: 'tong_tin_chi_yeu_cau',
      render: (row) => (
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          {row.tong_tin_chi_yeu_cau || 135} TC
        </span>
      )
    },
    {
      header: 'CTĐT Áp dụng',
      accessor: 'total_curriculums',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
          {row.total_curriculums || 0} Khung
        </span>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'is_active',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.is_active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.is_active ? 'Đang tuyển sinh' : 'Tạm dừng'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Chỉnh sửa ngành"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteMajor(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa ngành"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {notice && (
        <Notification
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <Layers className="w-4 h-4" />
            <span>Danh mục Học thuật Toàn trường</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Ngành Đào tạo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Khai báo mã ngành, thời gian đào tạo, tổng số tín chỉ và phân bổ ngành theo từng Khoa
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          <span>Thêm Ngành đào tạo</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Tổng số Ngành đào tạo</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{majors.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Khoa Đào tạo liên kết</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{faculties.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Số Khung CTĐT ban hành</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {majors.reduce((acc, cur) => acc + (parseInt(cur.total_curriculums, 10) || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* DataView */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Lọc theo Khoa:</span>
            <select
              value={filterKhoa}
              onChange={(e) => setFilterKhoa(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả các Khoa ({faculties.length})</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ten_khoa} ({f.ma_khoa})
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataView
          columns={columns}
          data={filteredMajors}
          loading={loading}
          searchPlaceholder="Tìm theo mã ngành hoặc tên ngành đào tạo..."
          searchKeys={['ma_nganh', 'ten_nganh', 'ten_khoa']}
        />
      </div>

      {/* Modal Thêm / Chỉnh sửa Ngành */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMajor ? 'Chỉnh sửa Ngành Đào tạo' : 'Thêm Ngành Đào tạo Mới'}
        description="Điền thông tin định danh mã ngành theo chuẩn Bộ GD&ĐT và phân bổ về Khoa trực thuộc."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khoa Trực thuộc (*)
            </label>
            <select
              required
              value={form.khoa_id}
              onChange={(e) => setForm({ ...form, khoa_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium"
            >
              <option value="">-- Chọn Khoa --</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ten_khoa} ({f.ma_khoa})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Ngành đào tạo (*)
              </label>
              <input
                type="text"
                required
                placeholder="VD: 7480201, 7340301..."
                value={form.ma_nganh}
                onChange={(e) => setForm({ ...form, ma_nganh: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Ngành đào tạo (*)
              </label>
              <input
                type="text"
                required
                placeholder="VD: Công nghệ Thông tin, Kế toán..."
                value={form.ten_nganh}
                onChange={(e) => setForm({ ...form, ten_nganh: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian đào tạo (Số năm)
              </label>
              <input
                type="number"
                step="0.5"
                min="2"
                max="7"
                required
                value={form.thoi_gian_dao_tao_nam}
                onChange={(e) => setForm({ ...form, thoi_gian_dao_tao_nam: parseFloat(e.target.value) || 4 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tổng tín chỉ yêu cầu
              </label>
              <input
                type="number"
                min="60"
                max="250"
                required
                value={form.tong_tin_chi_yeu_cau}
                onChange={(e) => setForm({ ...form, tong_tin_chi_yeu_cau: parseInt(e.target.value, 10) || 135 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-bold text-indigo-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_major"
              checked={!!form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300"
            />
            <label htmlFor="is_active_major" className="text-xs font-medium text-slate-700 cursor-pointer">
              Đang mở tuyển sinh & Đào tạo ngành này
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {editingMajor ? 'Cập nhật Ngành' : 'Tạo Ngành Mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Xóa Ngành */}
      <Modal
        isOpen={!!deleteMajor}
        onClose={() => setDeleteMajor(null)}
        title="Xác nhận Xóa Ngành Đào tạo"
        description="Bạn có chắc chắn muốn xóa ngành đào tạo này không?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Ngành: <strong className="text-slate-900">{deleteMajor?.ten_nganh}</strong> ({deleteMajor?.ma_nganh})
          </p>
          <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-xs">
            Lưu ý: Nếu ngành đã có Khung CTĐT ban hành thì sẽ không được phép xóa để đảm bảo toàn vẹn dữ liệu.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteMajor(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm cursor-pointer"
            >
              Xác nhận Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
