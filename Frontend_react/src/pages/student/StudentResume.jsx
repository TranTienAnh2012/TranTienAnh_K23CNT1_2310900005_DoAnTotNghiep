import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import {
  User,
  GraduationCap,
  FileText,
  Users,
  Award,
  BookOpen,
  Printer,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function StudentResume() {
  const [activeTab, setActiveTab] = useState('personal'); // personal, major, documents, family, admission, academic
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Dữ liệu từ API
  const [basicInfo, setBasicInfo] = useState({});
  const [formData, setFormData] = useState({
    so_cmnd_cccd: '',
    ngay_cap_cccd: '',
    noi_cap_cccd: '',
    noi_sinh: '',
    que_quan: '',
    quoc_tich: 'Việt Nam',
    dan_toc: 'Kinh',
    ton_giao: 'Không',
    thanh_phan_xuat_than: '',
    ngay_vao_doan: '',
    ngay_vao_dang: '',
    so_dien_thoai_ca_nhan: '',
    so_dien_thoai_gia_dinh: '',
    dia_chi_thuong_tru: '',
    xa_phuong: '',
    quan_huyen: '',
    tinh_thanh_pho: '',
    dia_chi_tam_tru_hien_nay: '',
    doi_tuong_chinh_sach: '',
    doi_tuong_tro_cap: '',
    nhom_doi_tuong: '',
    dia_chi_bao_tin: ''
  });

  const [familyList, setFamilyList] = useState([]);
  const [admissionInfo, setAdmissionInfo] = useState({
    phuong_thuc_xet_tuyen: 'Thi THPT Quốc gia',
    khoi_thi: 'A00',
    diem_xet_tuyen: '24.5',
    diem_uu_tien: '0.5',
    nam_tot_nghiep_c3: '2023',
    truong_thpt: 'THPT Chuyên / THPT Gia Viễn',
    so_bao_danh: '23019882'
  });

  // Modal thêm thân nhân
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState(null);
  const [familyForm, setFamilyForm] = useState({
    moi_quan_he: 'Cha',
    ho_ten: '',
    nam_sinh: '',
    nghe_nghiep: '',
    co_quan_lam_viec: '',
    so_dien_thoai: '',
    dia_chi_hien_nay: ''
  });

  // Load hồ sơ ban đầu
  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await studentService.getResume();
      const resPayload = res?.data?.success ? res.data.data : (res?.success ? res.data : (res?.basicInfo ? res : null));
      if (resPayload) {
        const { basicInfo, personalDetail, family, admission } = resPayload;
        setBasicInfo(basicInfo || {});
        if (personalDetail) {
          setFormData((prev) => ({
            ...prev,
            ...personalDetail,
            ngay_cap_cccd: personalDetail.ngay_cap_cccd ? personalDetail.ngay_cap_cccd.substring(0, 10) : '',
            ngay_vao_doan: personalDetail.ngay_vao_doan ? personalDetail.ngay_vao_doan.substring(0, 10) : '',
            ngay_vao_dang: personalDetail.ngay_vao_dang ? personalDetail.ngay_vao_dang.substring(0, 10) : ''
          }));
        }
        if (family) setFamilyList(family);
        if (admission) setAdmissionInfo(admission);
      }
    } catch (err) {
      console.error('Lỗi tải sơ yếu lý lịch:', err);
      showAlert('danger', 'Không thể tải sơ yếu lý lịch: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Lưu thông tin cá nhân mở rộng
  const handleSavePersonal = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await studentService.updatePersonalInfo(formData);
      if (res?.success || res?.data?.success) {
        showAlert('success', 'Đã lưu và cập nhật sơ yếu lý lịch thành công!');
      }
    } catch (err) {
      showAlert('danger', 'Lỗi lưu hồ sơ: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Lưu thân nhân
  const handleSaveFamily = async (e) => {
    e.preventDefault();
    try {
      if (!familyForm.ho_ten || !familyForm.moi_quan_he) {
        alert('Vui lòng nhập họ tên và mối quan hệ');
        return;
      }
      if (editingFamilyId) {
        await studentService.updateFamilyMember(editingFamilyId, familyForm);
      } else {
        await studentService.addFamilyMember(familyForm);
      }
      setShowFamilyModal(false);
      setEditingFamilyId(null);
      setFamilyForm({
        moi_quan_he: 'Cha',
        ho_ten: '',
        nam_sinh: '',
        nghe_nghiep: '',
        co_quan_lam_viec: '',
        so_dien_thoai: '',
        dia_chi_hien_nay: ''
      });
      fetchResume();
      showAlert('success', 'Đã lưu thông tin thân nhân thành công!');
    } catch (err) {
      showAlert('danger', 'Lỗi lưu thân nhân: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteFamily = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thân nhân này?')) return;
    try {
      await studentService.deleteFamilyMember(id);
      fetchResume();
      showAlert('success', 'Đã xóa thân nhân thành công!');
    } catch (err) {
      showAlert('danger', 'Lỗi xóa thân nhân: ' + err.message);
    }
  };

  // In hồ sơ sơ yếu lý lịch
  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân (CẬP NHẬT HỒ SƠ)', icon: User },
    { id: 'major', label: 'Ngành học', icon: GraduationCap },
    { id: 'documents', label: 'Giấy tờ nhập học', icon: FileText },
    { id: 'family', label: 'Quan hệ gia đình', icon: Users },
    { id: 'admission', label: 'Tuyển sinh', icon: Award },
    { id: 'academic', label: 'Kết quả học tập tại Trường', icon: BookOpen }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Đang tải hồ sơ sinh viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-fade-in ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header Profile Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            {basicInfo.avatar_url ? (
              <img
                src={basicInfo.avatar_url}
                alt={basicInfo.ho_ten}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500/20 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {basicInfo.ho_ten?.charAt(0) || 'SV'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-white text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-bold text-slate-900">{basicInfo.ho_ten || 'Trần Tiến Anh'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                {basicInfo.ma_sv || '2310900005'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Lớp: <span className="font-medium text-slate-700">{basicInfo.ma_lop || 'K23CNT1'}</span> •{' '}
              {basicInfo.ten_khoa || 'Khoa Công nghệ Thông tin'} • Niên khóa: {basicInfo.khoa_hoc || '2023 - 2027'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Sơ yếu lý lịch</span>
          </button>
          <button
            onClick={handleSavePersonal}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium text-sm transition-all shadow-md shadow-sky-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu Navigation (Phong cách Cổng sinh viên UniSoft) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-sky-500 text-sky-600 bg-sky-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Thông tin cá nhân chi tiết (CẬP NHẬT HỒ SƠ) */}
        {activeTab === 'personal' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Thông tin cá nhân (CẬP NHẬT HỒ SƠ)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vui lòng kiểm tra và hoàn thiện chính xác các thông tin hộ tịch, căn cước và cư trú
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-200">
                Lưu ý: Thông tin CCCD sẽ dùng để cấp văn bằng tốt nghiệp
              </span>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-6">
              {/* Hàng 1: Mã SV, Họ tên, Ngày sinh, Giới tính */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mã sinh viên</label>
                  <input
                    type="text"
                    disabled
                    value={basicInfo.ma_sv || '2310900005'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    disabled
                    value={basicInfo.ho_ten || 'Trần Tiến Anh'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày sinh</label>
                  <input
                    type="text"
                    disabled
                    value={basicInfo.ngay_sinh ? basicInfo.ngay_sinh.substring(0, 10) : '20/12/2005'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Giới tính</label>
                  <input
                    type="text"
                    disabled
                    value={basicInfo.gioi_tinh || 'Nam'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Hàng 2: Nơi sinh, Quê quán, Quốc tịch, Dân tộc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nơi sinh</label>
                  <input
                    type="text"
                    name="noi_sinh"
                    value={formData.noi_sinh || ''}
                    onChange={handleInputChange}
                    placeholder="Tỉnh/Thành phố sinh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quê quán</label>
                  <input
                    type="text"
                    name="que_quan"
                    value={formData.que_quan || ''}
                    onChange={handleInputChange}
                    placeholder="Xã/Huyện/Tỉnh nguyên quán"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quốc tịch</label>
                  <input
                    type="text"
                    name="quoc_tich"
                    value={formData.quoc_tich || 'Việt Nam'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dân tộc</label>
                  <input
                    type="text"
                    name="dan_toc"
                    value={formData.dan_toc || 'Kinh'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Hàng 3: Tôn giáo, TP xuất thân, Ngày vào Đoàn, Ngày vào Đảng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tôn giáo</label>
                  <input
                    type="text"
                    name="ton_giao"
                    value={formData.ton_giao || 'Không'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">TP xuất thân</label>
                  <input
                    type="text"
                    name="thanh_phan_xuat_than"
                    value={formData.thanh_phan_xuat_than || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Học sinh, Nông dân, Cán bộ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày vào Đoàn</label>
                  <input
                    type="date"
                    name="ngay_vao_doan"
                    value={formData.ngay_vao_doan || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày vào Đảng</label>
                  <input
                    type="date"
                    name="ngay_vao_dang"
                    value={formData.ngay_vao_dang || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Hàng 4: Nơi thường trú, Xã/phường, Quận/huyện, Tỉnh/TP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nơi thường trú (Thôn/Xóm/Đường)</label>
                  <input
                    type="text"
                    name="dia_chi_thuong_tru"
                    value={formData.dia_chi_thuong_tru || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Xóm 2, Thôn Mai Sơn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Xã/phường</label>
                  <input
                    type="text"
                    name="xa_phuong"
                    value={formData.xa_phuong || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Xã Gia Lạc"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quận/huyện</label>
                  <input
                    type="text"
                    name="quan_huyen"
                    value={formData.quan_huyen || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Huyện Gia Viễn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tỉnh/TP</label>
                  <input
                    type="text"
                    name="tinh_thanh_pho"
                    value={formData.tinh_thanh_pho || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Tỉnh Ninh Bình"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Hàng 5: Đối tượng chính sách, trợ cấp, nhóm ĐT, ĐT nhà riêng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Đối tượng CS</label>
                  <input
                    type="text"
                    name="doi_tuong_chinh_sach"
                    value={formData.doi_tuong_chinh_sach || ''}
                    onChange={handleInputChange}
                    placeholder="Con thương binh, vùng sâu..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Đối tượng trợ cấp</label>
                  <input
                    type="text"
                    name="doi_tuong_tro_cap"
                    value={formData.doi_tuong_tro_cap || ''}
                    onChange={handleInputChange}
                    placeholder="Hộ nghèo, mồ côi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nhóm ĐT</label>
                  <input
                    type="text"
                    name="nhom_doi_tuong"
                    value={formData.nhom_doi_tuong || ''}
                    onChange={handleInputChange}
                    placeholder="Ưu tiên 1, Ưu tiên 2..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">ĐT nhà riêng (Gia đình)</label>
                  <input
                    type="text"
                    name="so_dien_thoai_gia_dinh"
                    value={formData.so_dien_thoai_gia_dinh || ''}
                    onChange={handleInputChange}
                    placeholder="0243..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Hàng 6: ĐT cá nhân, Email, Số CMND/CCCD, Địa chỉ báo tin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">ĐT cá nhân (*)</label>
                  <input
                    type="text"
                    name="so_dien_thoai_ca_nhan"
                    value={formData.so_dien_thoai_ca_nhan || ''}
                    onChange={handleInputChange}
                    placeholder="0345862097"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 font-medium text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email liên hệ</label>
                  <input
                    type="email"
                    disabled
                    value={basicInfo.email || 'tienanhtran755@gmail.com'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số CMND / Căn cước CD (*)</label>
                  <input
                    type="text"
                    name="so_cmnd_cccd"
                    value={formData.so_cmnd_cccd || ''}
                    onChange={handleInputChange}
                    placeholder="12 chữ số CCCD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 font-medium text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Địa chỉ báo tin</label>
                  <input
                    type="text"
                    name="dia_chi_bao_tin"
                    value={formData.dia_chi_bao_tin || ''}
                    onChange={handleInputChange}
                    placeholder="Người nhận và địa chỉ khi cần báo gấp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Hàng 7: Nơi ở hiện nay */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nơi ở hiện nay (Tạm trú / Ngoại trú / KTX)</label>
                <input
                  type="text"
                  name="dia_chi_tam_tru_hien_nay"
                  value={formData.dia_chi_tam_tru_hien_nay || ''}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ số nhà, ngõ ngách nơi sinh viên đang sinh sống học tập"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800 text-sm outline-none transition-all"
                />
              </div>

              {/* Action Button Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-all shadow-md shadow-sky-500/20 active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Sơ yếu lý lịch</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Đang lưu hồ sơ...' : 'Cập nhật Sơ yếu lý lịch'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Ngành học */}
        {activeTab === 'major' && (
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide pb-4 border-b border-slate-100">
              Thông tin Ngành học & Lớp sinh hoạt
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3 text-sky-600 font-semibold text-sm">
                  <GraduationCap className="w-5 h-5" />
                  <span>Chuyên ngành đào tạo</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Mã ngành:</span> <strong className="text-slate-800">7480201</strong></p>
                  <p><span className="text-slate-500">Tên ngành:</span> <strong className="text-slate-800">Công nghệ Thông tin</strong></p>
                  <p><span className="text-slate-500">Khoa quản lý:</span> <strong className="text-slate-800">{basicInfo.ten_khoa || 'Khoa Công nghệ Thông tin'}</strong></p>
                  <p><span className="text-slate-500">Hệ đào tạo:</span> <strong className="text-slate-800">Đại học Chính quy</strong></p>
                  <p><span className="text-slate-500">Thời gian đào tạo:</span> <strong className="text-slate-800">4 năm (8 học kỳ)</strong></p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3 text-indigo-600 font-semibold text-sm">
                  <Building className="w-5 h-5" />
                  <span>Lớp sinh hoạt & Cố vấn</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Lớp niên chế:</span> <strong className="text-slate-800">{basicInfo.ma_lop || 'K23CNT1'}</strong></p>
                  <p><span className="text-slate-500">Khóa tuyển sinh:</span> <strong className="text-slate-800">{basicInfo.khoa_hoc || 'K23 (2023 - 2027)'}</strong></p>
                  <p><span className="text-slate-500">Cố vấn học tập:</span> <strong className="text-slate-800">TS. Đỗ Thị Hương</strong></p>
                  <p><span className="text-slate-500">Trạng thái học vụ:</span> <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Đang theo học chính thức</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Giấy tờ nhập học */}
        {activeTab === 'documents' && (
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide pb-4 border-b border-slate-100">
              Danh mục Giấy tờ Hồ sơ nhập học
            </h2>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {[
                { name: 'Giấy báo trúng tuyển bản chính', status: 'Đã nộp', date: '15/09/2023', code: 'GT-01' },
                { name: 'Học bạ THPT (Bản sao công chứng)', status: 'Đã nộp', date: '15/09/2023', code: 'GT-02' },
                { name: 'Giấy chứng nhận tốt nghiệp THPT tạm thời / Bằng tốt nghiệp', status: 'Đã nộp', date: '15/09/2023', code: 'GT-03' },
                { name: 'Bản sao Giấy khai sinh hợp lệ', status: 'Đã nộp', date: '15/09/2023', code: 'GT-04' },
                { name: 'Căn cước công dân gắn chip (Photo công chứng)', status: 'Đã nộp', date: '15/09/2023', code: 'GT-05' },
                { name: 'Giấy chuyển sinh hoạt Đảng / Sổ Đoàn', status: 'Đã nộp', date: '20/09/2023', code: 'GT-06' },
                { name: 'Giấy khám sức khỏe đầu khóa', status: 'Đạt chuẩn', date: '22/09/2023', code: 'GT-07' }
              ].map((doc, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-400">Mã hồ sơ: {doc.code} • Ngày thu nhận: {doc.date}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{doc.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Quan hệ gia đình */}
        {activeTab === 'family' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Thông tin Quan hệ Gia đình / Thân nhân
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lưu trữ thông tin liên lạc của Bố, Mẹ hoặc Người giám hộ để nhà trường liên hệ khi cần
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingFamilyId(null);
                  setFamilyForm({
                    moi_quan_he: 'Cha',
                    ho_ten: '',
                    nam_sinh: '',
                    nghe_nghiep: '',
                    co_quan_lam_viec: '',
                    so_dien_thoai: '',
                    dia_chi_hien_nay: ''
                  });
                  setShowFamilyModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm thân nhân</span>
              </button>
            </div>

            {familyList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">Chưa có thông tin thân nhân nào được khai báo.</p>
                <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm thân nhân" ở trên để bổ sung thông tin Bố, Mẹ hoặc Người giám hộ.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {familyList.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-300 transition-all shadow-sm relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                          {f.moi_quan_he === 'Cha' ? 'Bố' : f.moi_quan_he === 'Me' ? 'Mẹ' : 'Hộ'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{f.ho_ten}</h3>
                          <span className="text-xs text-slate-500 font-medium">
                            Quan hệ: <strong>{f.moi_quan_he}</strong> {f.nam_sinh ? `• Sinh năm: ${f.nam_sinh}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingFamilyId(f.id);
                            setFamilyForm(f);
                            setShowFamilyModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFamily(f.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>SĐT: <strong className="text-slate-800">{f.so_dien_thoai || 'Chưa cập nhật'}</strong></span>
                      </p>
                      <p><span className="text-slate-400">Nghề nghiệp:</span> {f.nghe_nghiep || 'Tự do'} {f.co_quan_lam_viec ? `(${f.co_quan_lam_viec})` : ''}</p>
                      {f.dia_chi_hien_nay && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{f.dia_chi_hien_nay}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Tuyển sinh */}
        {activeTab === 'admission' && (
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide pb-4 border-b border-slate-100">
              Thông tin Kết quả Tuyển sinh Đại học
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Phương thức xét tuyển</p>
                <p className="text-base font-bold text-slate-900 mt-1">{admissionInfo.phuong_thuc_xet_tuyen || 'Thi tốt nghiệp THPT'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Khối thi / Tổ hợp môn</p>
                <p className="text-base font-bold text-sky-600 mt-1">{admissionInfo.khoi_thi || 'A00 (Toán, Lý, Hóa)'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Điểm xét tuyển trúng tuyển</p>
                <p className="text-base font-bold text-emerald-600 mt-1">
                  {admissionInfo.diem_xet_tuyen || '24.5'} điểm {admissionInfo.diem_uu_tien ? `(+${admissionInfo.diem_uu_tien} ĐƯT)` : ''}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Số báo danh kỳ thi</p>
                <p className="text-base font-bold text-slate-800 mt-1">{admissionInfo.so_bao_danh || '23019882'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Năm tốt nghiệp cấp 3</p>
                <p className="text-base font-bold text-slate-800 mt-1">{admissionInfo.nam_tot_nghiep_c3 || '2023'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Trường THPT tốt nghiệp</p>
                <p className="text-base font-bold text-slate-800 mt-1">{admissionInfo.truong_thpt || 'THPT Gia Viễn C, Ninh Bình'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Kết quả học tập tại Trường */}
        {activeTab === 'academic' && (
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide pb-4 border-b border-slate-100">
              Tổng kết Tiến độ Học tập & Điểm danh Face AI
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-sky-700">Tín chỉ tích lũy</p>
                <p className="text-2xl font-black text-sky-900 mt-1">45 / 135</p>
                <p className="text-xs text-sky-600 mt-1">Đạt 33.3% tiến độ CTĐT</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-emerald-700">Điểm trung bình (GPA)</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">3.42 / 4.0</p>
                <p className="text-xs text-emerald-600 mt-1">Xếp loại: Giỏi</p>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-violet-700">Chuyên cần Face AI</p>
                <p className="text-2xl font-black text-violet-900 mt-1">96.8%</p>
                <p className="text-xs text-violet-600 mt-1">Đủ điều kiện dự thi tất cả môn</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-amber-700">Cảnh báo học vụ</p>
                <p className="text-2xl font-black text-amber-900 mt-1">0</p>
                <p className="text-xs text-emerald-600 mt-1">Học vụ bình thường</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa Thân nhân */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingFamilyId ? 'Chỉnh sửa thông tin thân nhân' : 'Thêm mới quan hệ gia đình'}
            </h3>

            <form onSubmit={handleSaveFamily} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mối quan hệ (*)</label>
                  <select
                    value={familyForm.moi_quan_he}
                    onChange={(e) => setFamilyForm({ ...familyForm, moi_quan_he: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500"
                  >
                    <option value="Cha">Cha / Bố</option>
                    <option value="Me">Mẹ</option>
                    <option value="NguoiGiamHo">Người giám hộ</option>
                    <option value="AnhChiEm">Anh / Chị / Em</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Năm sinh</label>
                  <input
                    type="number"
                    value={familyForm.nam_sinh || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, nam_sinh: e.target.value })}
                    placeholder="VD: 1975"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên (*)</label>
                <input
                  type="text"
                  required
                  value={familyForm.ho_ten || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, ho_ten: e.target.value })}
                  placeholder="Họ và tên thân nhân"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại (*)</label>
                  <input
                    type="text"
                    value={familyForm.so_dien_thoai || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, so_dien_thoai: e.target.value })}
                    placeholder="0988..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nghề nghiệp</label>
                  <input
                    type="text"
                    value={familyForm.nghe_nghiep || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, nghe_nghiep: e.target.value })}
                    placeholder="VD: Kỹ sư, Giáo viên"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cơ quan làm việc</label>
                <input
                  type="text"
                  value={familyForm.co_quan_lam_viec || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, co_quan_lam_viec: e.target.value })}
                  placeholder="Tên công ty hoặc cơ quan công tác"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Địa chỉ hiện nay</label>
                <input
                  type="text"
                  value={familyForm.dia_chi_hien_nay || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, dia_chi_hien_nay: e.target.value })}
                  placeholder="Số nhà, đường, thôn xóm, quận huyện, tỉnh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFamilyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm"
                >
                  Lưu thân nhân
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
