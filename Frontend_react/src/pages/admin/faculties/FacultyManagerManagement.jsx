import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

export default function FacultyManagerManagement() {
  const [managers, setManagers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  // Modal thêm/sửa
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    ma_can_bo: '',
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    khoa_id: '',
    chuc_vu: 'Trợ lý Giáo vụ Khoa'
  });

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFacultyManagers({
        khoa_id: selectedFaculty,
        search
      });
      const payload = res?.data || res;
      const list = payload?.managers || res?.managers || [];
      const facs = payload?.faculties || res?.faculties || [];
      setManagers(list);
      setFaculties(facs);
      if (facs.length > 0 && !formData.khoa_id) {
        setFormData((prev) => ({ ...prev, khoa_id: facs[0].id }));
      }
    } catch (err) {
      console.error('Lỗi tải cán bộ khoa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [selectedFaculty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchManagers();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      username: '',
      password: '',
      ma_can_bo: '',
      ho_ten: '',
      email: '',
      so_dien_thoai: '',
      khoa_id: faculties[0]?.id || '',
      chuc_vu: 'Trợ lý Giáo vụ Khoa'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m) => {
    setEditingId(m.id);
    setFormData({
      username: m.username,
      password: '',
      ma_can_bo: m.ma_can_bo,
      ho_ten: m.ho_ten,
      email: m.email,
      so_dien_thoai: m.so_dien_thoai || '',
      khoa_id: m.khoa_id,
      chuc_vu: m.chuc_vu || 'Trợ lý Giáo vụ Khoa'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateFacultyManager(editingId, formData);
        alert('Cập nhật thông tin cán bộ khoa thành công!');
      } else {
        await adminService.createFacultyManager(formData);
        alert('Tạo tài khoản và bổ nhiệm cán bộ quản lý khoa thành công!');
      }
      setShowModal(false);
      fetchManagers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cán bộ quản lý này khỏi hệ thống?')) return;
    try {
      await adminService.deleteFacultyManager(id);
      fetchManagers();
      alert('Đã xóa cán bộ khoa thành công!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Phân quyền & Cơ cấu Tổ chức</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Cán bộ Quản lý Khoa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân quyền tài khoản Quản lý Khoa (`faculty_manager`) để phụ trách CTĐT, điểm rèn luyện và cảnh báo học vụ
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Bổ nhiệm Cán bộ Khoa mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Lọc theo Khoa:</label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="all">Toàn bộ các Khoa trong Trường</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.ma_khoa} - {f.ten_khoa}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên cán bộ, mã, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4">Cán bộ Quản lý</th>
                <th className="py-3.5 px-4">Khoa phụ trách</th>
                <th className="py-3.5 px-4">Tài khoản đăng nhập</th>
                <th className="py-3.5 px-4">Chức vụ</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Đang tải danh sách cán bộ quản lý khoa...
                  </td>
                </tr>
              ) : managers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Chưa có cán bộ quản lý khoa nào được bổ nhiệm.
                  </td>
                </tr>
              ) : (
                managers.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {m.ho_ten?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{m.ho_ten}</p>
                          <p className="text-xs text-slate-400 font-mono">{m.ma_can_bo} • {m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-indigo-700">
                        {m.ma_khoa}
                      </span>{' '}
                      {m.ten_khoa}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-medium text-slate-700">
                      {m.username}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {m.chuc_vu || 'Trợ lý khoa'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hoạt động</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Cán bộ Khoa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b">
              {editingId ? 'Chỉnh sửa Cán bộ Quản lý Khoa' : 'Bổ nhiệm Cán bộ Quản lý Khoa Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Khoa phụ trách (*)</label>
                <select
                  required
                  value={formData.khoa_id}
                  onChange={(e) => setFormData({ ...formData, khoa_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.ma_khoa} - {f.ten_khoa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Cán bộ (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CB_CNTT_02"
                    value={formData.ma_can_bo}
                    onChange={(e) => setFormData({ ...formData, ma_can_bo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chức vụ</label>
                  <input
                    type="text"
                    placeholder="Trợ lý Giáo vụ Khoa"
                    value={formData.chuc_vu}
                    onChange={(e) => setFormData({ ...formData, chuc_vu: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên cán bộ quản lý"
                  value={formData.ho_ten}
                  onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email (*)</label>
                  <input
                    type="email"
                    required
                    placeholder="email@smartedu.edu.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0912..."
                    value={formData.so_dien_thoai}
                    onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {!editingId && (
                <div className="p-3 bg-slate-50 border rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tài khoản đăng nhập hệ thống (Role: faculty_manager)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Tên đăng nhập (*)</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: khoacntt02"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Mật khẩu (*)</label>
                      <input
                        type="password"
                        required
                        placeholder="Mật khẩu ban đầu"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  {editingId ? 'Lưu thay đổi' : 'Bổ nhiệm Cán bộ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
