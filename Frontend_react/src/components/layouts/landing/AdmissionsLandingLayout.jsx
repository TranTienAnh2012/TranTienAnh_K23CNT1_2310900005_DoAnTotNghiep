import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  ArrowRight,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Building2,
  BookOpen,
  Users,
  Compass,
  Cpu,
  Palette,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Award,
  ShieldCheck,
  Send,
  MessageSquare,
  Globe2,
  ExternalLink,
  Menu,
  X,
  Repeat,
  FileText,
  Clock
} from 'lucide-react';

export default function AdmissionsLandingLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0); // Accordion mở câu đầu tiên

  const dashboardLink = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'faculty_manager'
      ? '/faculty'
      : user.role === 'teacher'
      ? '/teacher'
      : '/student'
    : '/login';

  const dashboardLabel = user
    ? user.role === 'admin'
      ? 'Vào Quản trị'
      : user.role === 'faculty_manager'
      ? 'Cổng Quản lý Khoa'
      : user.role === 'teacher'
      ? 'Bàn Giảng viên'
      : 'Bàn Sinh viên'
    : 'Đăng nhập Cổng Đào Tạo';
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    major: 'cntt',
    province: 'Hà Nội',
    note: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      alert('Cảm ơn bạn! Ban tuyển sinh Trường Đại học Nguyễn Trãi đã nhận được thông tin và sẽ liên hệ sớm nhất.');
      setIsSubmitted(false);
    }, 800);
  };

  const faqList = [
    {
      q: 'Điều kiện xét tuyển học bạ THPT năm 2026 vào Trường Đại học Nguyễn Trãi như thế nào?',
      a: 'Thí sinh có tổng điểm trung bình 3 môn xét tuyển của cả năm lớp 12 hoặc điểm trung bình 3 học kỳ (học kỳ 1, 2 lớp 11 và học kỳ 1 lớp 12) đạt từ 18.0 điểm trở lên (đã bao gồm điểm ưu tiên đối tượng và khu vực) là đủ điều kiện nộp hồ sơ xét tuyển sớm.'
    },
    {
      q: 'Chính sách học bổng dành cho tân sinh viên năm 2026 có những gói nào?',
      a: 'Đại học Nguyễn Trãi dành quỹ học bổng trị giá hơn 20 tỷ đồng cho tân sinh viên tài năng: Học bổng 100% học phí toàn khóa cho thủ khoa; Học bổng 50% - 70% cho thí sinh có thành tích xuất sắc trong học tập, nghiên cứu khoa học hoặc đạt giải học sinh giỏi cấp tỉnh/thành phố.'
    },
    {
      q: 'Sinh viên có được cam kết thực tập và cơ hội việc làm sau tốt nghiệp không?',
      a: '100% sinh viên NTU được tham gia chương trình thực tập hưởng lương tại mạng lưới hơn 200 doanh nghiệp đối tác hàng đầu trong và ngoài nước (Hàn Quốc, Nhật Bản, Đài Loan). Nhà trường cam kết hỗ trợ giới thiệu việc làm đúng chuyên ngành sau khi tốt nghiệp.'
    },
    {
      q: 'Mức học phí của trường có tăng qua các năm học không?',
      a: 'Nhà trường cam kết công khai học phí toàn khóa và duy trì mức ổn định, không tăng đột biến theo đúng lộ trình đã công bố trong đề án tuyển sinh, giúp phụ huynh và sinh viên hoàn toàn chủ động kế hoạch tài chính.'
    },
    {
      q: 'Hồ sơ xét tuyển sớm cần chuẩn bị những giấy tờ gì?',
      a: 'Hồ sơ gồm: Phiếu đăng ký xét tuyển theo mẫu của NTU, Bản sao công chứng Học bạ THPT (hoặc bảng điểm có xác nhận của trường THPT), Bản sao CCCD và Giấy chứng nhận ưu tiên (nếu có). Bạn có thể nộp trực tuyến qua website tuyển sinh.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#e45318] selection:text-white">
      {/* =========================================================================
          FLOATING QUICK SWITCHER (CHUYỂN NHANH QUA LẠI GIỮA 2 GIAO DIỆN)
      ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#0e2a47] text-white p-2 sm:p-2.5 rounded-full shadow-2xl border-2 border-orange-500/80 backdrop-blur-md">
        <span className="hidden sm:inline text-xs font-bold pl-2 text-orange-400 flex items-center gap-1.5">
          <Repeat size={13} /> Giao diện:
        </span>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium hover:text-white transition-colors cursor-pointer"
        >
          ← 1. Trang Chủ NTU
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-full bg-[#e45318] text-white text-xs font-bold shadow-sm"
        >
          2. Cổng Tuyển Sinh 2026
        </button>
      </div>

      {/* =========================================================================
          TOP BANNER THÔNG BÁO XÉT TUYỂN
      ========================================================================= */}
      <div className="bg-[#0b1f33] text-slate-300 text-xs border-b border-slate-700/60 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#e45318] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              HOT
            </span>
            <span>Đang mở cổng nhận hồ sơ xét tuyển sớm Học bạ Đợt 1 năm 2026</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={12} className="text-[#e45318]" /> Hotline: 098.192.4302 - 024.3562.7777
            </span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={12} className="text-[#e45318]" /> tuyensinh@ntu-hn.edu.vn
            </span>
            <Link to="/" className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1">
              ← Về Cổng thông tin NTU
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HEADER TUYỂN SINH NTU (ĐỒNG BỘ CÂN ĐỐI VỚI TRANG CHỦ)
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo NTU & SmartEdu đồng bộ kích cỡ với trang chủ */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo-smartedu2.png"
              alt="SmartEdu Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="border-l border-slate-300 pl-2.5">
              <div className="font-black text-sm tracking-tight text-[#0e2a47] uppercase leading-none">
                SmartEdu
              </div>
              <div className="text-[9px] font-bold text-[#e45318] tracking-widest uppercase mt-0.5">
                CỔNG TUYỂN SINH 2026
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-[13px] font-semibold text-slate-700">
            <Link to="/" className="hover:text-[#e45318] transition-colors">
              Trang chủ trường
            </Link>
            <a href="#nganh-dao-tao" className="hover:text-[#e45318] transition-colors">
              Ngành đào tạo
            </a>
            <a href="#quy-trinh" className="hover:text-[#e45318] transition-colors">
              Phương thức xét tuyển
            </a>
            <a href="#doi-song" className="hover:text-[#e45318] transition-colors">
              Đời sống sinh viên
            </a>
            <a href="#faq" className="hover:text-[#e45318] transition-colors">
              Hỏi đáp FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              to={dashboardLink}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${
                user
                  ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  : 'text-slate-700 hover:text-[#0e2a47] bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {user ? dashboardLabel : 'Tra cứu hồ sơ / Đăng nhập'}
            </Link>
            <a
              href="#form-dang-ky"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e45318] hover:bg-[#cf4711] text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
            >
              <span>Đăng ký tư vấn</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 text-sm font-semibold text-slate-800">
              Trang chủ trường NTU
            </Link>
            <a href="#nganh-dao-tao" className="block py-2 text-sm font-semibold text-slate-800">
              Ngành đào tạo 2026
            </a>
            <a href="#quy-trinh" className="block py-2 text-sm font-semibold text-slate-800">
              Phương thức xét tuyển
            </a>
            <a href="#doi-song" className="block py-2 text-sm font-semibold text-slate-800">
              Đời sống sinh viên
            </a>
            <a href="#faq" className="block py-2 text-sm font-semibold text-slate-800">
              Hỏi đáp tuyển sinh
            </a>
            <a
              href="#form-dang-ky"
              className="block text-center py-2.5 rounded-lg bg-[#e45318] text-white text-sm font-bold"
            >
              Đăng ký tư vấn ngay
            </a>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION SPLIT (CHÍNH XÁC NHƯ HÌNH BÊN PHẢI)
          Nửa trái: Dark Navy (#0e2a47) có text "Tương lai của bạn. Bắt đầu từ điều bạn chọn."
          Nửa phải: Ảnh nhóm sinh viên vui vẻ trên giảng đường/sân trường
      ========================================================================= */}
      <section className="relative bg-[#0e2a47] text-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* CỘT TRÁI: Dark Navy content */}
          <div className="lg:col-span-6 px-6 sm:px-12 lg:px-16 py-16 lg:py-20 flex flex-col justify-center">
            {/* Tag nhỏ */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e45318] animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest font-bold text-orange-400">
                TUYỂN SINH ĐẠI HỌC NGUYỄN TRÃI 2026
              </span>
            </div>

            {/* Headline lớn */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Tương lai của bạn.{' '}
              <span className="block text-[#e45318] mt-1">Bắt đầu từ điều bạn chọn.</span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
              Môi trường giáo dục ứng dụng thông minh, đào tạo gắn liền với thực tiễn doanh nghiệp
              quốc tế. Nơi bạn làm chủ năng lực cá nhân, kiến tạo sự nghiệp rạng rỡ ngay từ giảng
              đường.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#form-dang-ky"
                className="px-6 py-3.5 rounded-lg bg-[#e45318] hover:bg-[#cf450f] text-white text-sm font-bold shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2"
              >
                Đăng ký xét tuyển ↗
              </a>
              <a
                href="#nganh-dao-tao"
                className="px-6 py-3.5 rounded-lg border border-slate-600 hover:border-slate-400 text-slate-200 hover:text-white text-sm font-semibold transition-colors"
              >
                Khám phá ngành học
              </a>
            </div>

            {/* Mini stats / quote chân hero bên trái */}
            <div className="mt-10 pt-6 border-t border-slate-800 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#e45318]" />
                <span>Xét học bạ online nhanh chóng</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#e45318]" />
                <span>Học bổng tài năng lên tới 100%</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Ảnh sinh viên rực rỡ có dải caption */}
          <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop"
              alt="Sinh viên Đại học Nguyễn Trãi"
              className="w-full h-full object-cover"
            />
            {/* Lớp gradient nhẹ bảo đảm độ nét text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Box quote dưới góc ảnh như mẫu Phenikaa */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 bg-black/60 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-sm sm:text-base font-semibold leading-snug">
                  "Mỗi sinh viên là một phiên bản xuất sắc của chính mình."
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Đồng hành cùng bạn trên con đường chinh phục ước mơ nghề nghiệp.
                </p>
              </div>
              <a
                href="#doi-song"
                className="w-10 h-10 rounded-full bg-[#e45318] hover:bg-[#cf450f] text-white flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105"
                title="Khám phá ngay"
              >
                <ArrowUpRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 ĐIỂM NHẤN (CHỌN TRƯỜNG - CHỌN TRƯỞNG THÀNH)
      ========================================================================= */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Cột 1: Heading */}
            <div className="pt-4 md:pt-0">
              <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 block mb-1">
                GIÁ TRỊ KHÁC BIỆT
              </span>
              <h3 className="text-xl font-extrabold text-[#0e2a47] leading-snug">
                Không chỉ chọn trường. Chọn cách bạn trưởng thành.
              </h3>
            </div>

            {/* Cột 2 */}
            <div className="pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#e45318] flex items-center justify-center">
                  <Compass size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#0e2a47]">Môi trường thực chiến</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                70% thời lượng chương trình dành cho thực hành xưởng Lab, dự án doanh nghiệp thực tế.
              </p>
            </div>

            {/* Cột 3 */}
            <div className="pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#e45318] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#0e2a47]">Hệ sinh thái khởi nghiệp</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ươm mầm ý tưởng, hỗ trợ vốn và cố vấn từ các CEO hàng đầu ngay trong trường học.
              </p>
            </div>

            {/* Cột 4 */}
            <div className="pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#e45318] flex items-center justify-center">
                  <Globe2 size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#0e2a47]">Lợi thế hội nhập toàn cầu</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mạng lưới liên kết trường đại học & doanh nghiệp Nhật Bản, Hàn Quốc uy tín.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION CÁC KHỐI NGÀNH: "BẠN MUỐN TẠO DẤU ẤN TRONG LĨNH VỰC NÀO?"
          Bên trái: Thẻ ảnh lớn có câu quote "Được vươn ra biển lớn để thấy mình là bước tiến mới."
          Bên phải: Lưới 6 ô khối ngành viền nhẹ có mũi tên cam ↗
      ========================================================================= */}
      <section id="nganh-dao-tao" className="py-16 sm:py-20 bg-[#faf7f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#e45318] block mb-2">
                CHƯƠNG TRÌNH ĐÀO TẠO ĐẠI HỌC 2026
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e2a47] tracking-tight">
                Bạn muốn tạo dấu ấn trong lĩnh vực nào?
              </h2>
            </div>
            <a
              href="#form-dang-ky"
              className="text-xs font-bold text-slate-600 hover:text-[#e45318] flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              Xem toàn bộ danh mục ngành đào tạo ↗
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Card lớn bên trái */}
            <div className="lg:col-span-5 bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col group hover:shadow-md transition-shadow">
              <div className="relative h-64 sm:h-72 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop"
                  alt="Nữ sinh viên Đại học Nguyễn Trãi tự tin"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-4 left-4 bg-[#e45318] text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                  CÂU CHUYỆN SINH VIÊN
                </span>
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0e2a47] mb-2 leading-snug">
                    "Được vươn ra biển lớn để thấy mình là bước tiến mới."
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Khám phá trải nghiệm thực tế từ các thế hệ sinh viên NTU đã xuất sắc nhận học
                    bổng quốc tế và tự tin làm việc tại các tập đoàn công nghệ lớn.
                  </p>
                </div>
                <a
                  href="#form-dang-ky"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e45318] hover:text-[#cf450f]"
                >
                  Tìm hiểu hành trình sinh viên NTU ↗
                </a>
              </div>
            </div>

            {/* Lưới 6 ô ngành bên phải */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Cpu className="text-[#e45318]" size={22} />,
                  title: 'Công nghệ & Máy tính',
                  desc: 'Khoa học máy tính, Kỹ thuật phần mềm, Trí tuệ nhân tạo (AI), An toàn thông tin.',
                  code: 'Mã ngành: 7480101'
                },
                {
                  icon: <Compass className="text-[#e45318]" size={22} />,
                  title: 'Kỹ thuật & Công nghệ số',
                  desc: 'Tự động hóa, Vi mạch bán dẫn, Robot & Hệ thống thông minh, Công nghệ ô tô điện.',
                  code: 'Mã ngành: 7520114'
                },
                {
                  icon: <Building2 className="text-[#e45318]" size={22} />,
                  title: 'Kinh tế & Quản trị',
                  desc: 'Quản trị kinh doanh, Marketing kỹ thuật số, Tài chính - Ngân hàng số, Thương mại điện tử.',
                  code: 'Mã ngành: 7340101'
                },
                {
                  icon: <Palette className="text-[#e45318]" size={22} />,
                  title: 'Mỹ thuật & Thiết kế',
                  desc: 'Thiết kế đồ họa, Thiết kế nội thất, Kiến trúc ứng dụng, Hoạt hình & Game 3D.',
                  code: 'Mã ngành: 7210403'
                },
                {
                  icon: <Globe2 className="text-[#e45318]" size={22} />,
                  title: 'Ngôn ngữ & Xã hội',
                  desc: 'Ngôn ngữ Hàn Quốc, Ngôn ngữ Nhật Bản, Ngôn ngữ Anh, Quản trị du lịch & lữ hành.',
                  code: 'Mã ngành: 7220201'
                },
                {
                  icon: <Briefcase className="text-[#e45318]" size={22} />,
                  title: 'Truyền thông & Luật số',
                  desc: 'Quan hệ công chúng (PR), Truyền thông đa phương tiện số, Luật kinh tế quốc tế.',
                  code: 'Mã ngành: 7320101'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-slate-200/90 hover:border-[#e45318]/50 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-slate-400 group-hover:text-[#e45318] transition-colors"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-[#0e2a47] group-hover:text-[#e45318] transition-colors mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>{item.code}</span>
                    <span className="text-[#e45318] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Chi tiết ↗
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION DARK NAVY: "KHÔNG CHỈ NGHE GIẢNG. HÃY THỬ, LÀM VÀ KHÁM PHÁ."
          (Y hệt như section tối màu ở giữa trang bên phải)
      ========================================================================= */}
      <section className="bg-[#0b2038] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Ảnh bên trái */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop"
                  alt="Thực hành nghiên cứu sinh viên NTU"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
              {/* Box nhỏ góc dưới */}
              <div className="absolute -bottom-4 left-6 bg-[#0e2a47] border border-orange-500/40 p-3.5 rounded-xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e45318] text-white flex items-center justify-center font-bold text-xs">
                  NTU
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Hệ thống Lab & Studio đạt chuẩn doanh nghiệp
                </div>
              </div>
            </div>

            {/* Nội dung bên phải */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-orange-400 block mb-2">
                  TRIẾT LÝ ĐÀO TẠO THỰC CHIẾN
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Không chỉ nghe giảng. <br />
                  <span className="text-[#e45318]">Hãy thử, làm và khám phá.</span>
                </h2>
                <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                  Tại Trường Đại học Nguyễn Trãi, kiến thức không chỉ nằm trên những trang giáo
                  trình mà được hiện thực hóa qua từng dòng code, từng bản thiết kế và từng dự án
                  sáng tạo thực tế.
                </p>
              </div>

              {/* 3 Block gạch đầu dòng */}
              <div className="space-y-3.5">
                {[
                  {
                    title: '70% thời lượng thực hành chuyên sâu',
                    desc: 'Rèn luyện kỹ năng thực tế với hệ thống máy móc, thiết bị và phần mềm chuyên dụng hiện đại.'
                  },
                  {
                    title: 'Thực tập hưởng lương ngay từ năm thứ 2',
                    desc: 'Cọ xát với môi trường làm việc chuyên nghiệp tại hơn 200 tập đoàn doanh nghiệp đối tác.'
                  },
                  {
                    title: 'Cố vấn 1-1 từ chuyên gia đầu ngành',
                    desc: 'Được các giảng viên tận tâm và cố vấn doanh nghiệp đồng hành, định hướng sự nghiệp bài bản.'
                  }
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 transition-colors flex items-start gap-3.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#e45318]/20 text-[#e45318] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} className="text-[#e45318]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">{row.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: "HƠN MỘT GIẢNG ĐƯỜNG. MỘT PHẦN TUỔI TRẺ." (ĐỜI SỐNG SINH VIÊN)
      ========================================================================= */}
      <section id="doi-song" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase tracking-widest font-bold text-[#e45318] block mb-2">
              TRẢI NGHIỆM ĐẠI HỌC TOÀN DIỆN
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e2a47] tracking-tight">
              Hơn một giảng đường. Một phần tuổi trẻ.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Những năm tháng đại học tại NTU không chỉ là việc tích lũy kiến thức mà là hành trình
              khám phá chính mình qua các câu lạc bộ, sự kiện âm nhạc, thể thao và giao lưu quốc tế.
            </p>
          </div>

          {/* 3 Khung ảnh đời sống sinh viên */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop"
                  alt="Không gian kết nối sinh viên"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h4 className="text-sm font-bold text-[#0e2a47] mb-1">
                  Gắn kết bạn bè trong không gian mở
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Khuôn viên trường với nhiều góc chill, quán cà phê sinh viên và không gian xanh mát.
                </p>
              </div>
            </div>

            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop"
                  alt="Hoạt động ngoại khóa và sự kiện"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h4 className="text-sm font-bold text-[#0e2a47] mb-1">
                  Sôi động cùng hơn 30 Câu lạc bộ
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Từ CLB Công nghệ, Robot, tiếng Hàn, tiếng Nhật đến ban nhạc acoustic, thể thao.
                </p>
              </div>
            </div>

            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=800&auto=format&fit=crop"
                  alt="Thư viện hiện đại"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h4 className="text-sm font-bold text-[#0e2a47] mb-1">
                  Thư viện điện tử & Co-working
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hàng triệu đầu sách số hóa và không gian làm việc nhóm sáng tạo mở cửa 24/7.
                </p>
              </div>
            </div>
          </div>

          {/* Nút lớn cam như mẫu */}
          <div className="mt-8">
            <a
              href="#form-dang-ky"
              className="w-full py-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#e45318] text-sm font-bold flex items-center justify-center gap-2 border border-orange-200 transition-colors"
            >
              Đời sống sinh viên tại NTU ↗
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: "HÀNH TRÌNH XÉT TUYỂN, RÕ RÀNG TỪ ĐẦU" (4 BƯỚC VÒNG TRÒN)
      ========================================================================= */}
      <section id="quy-trinh" className="py-16 sm:py-20 bg-[#faf7f2] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#e45318] block mb-2">
                HƯỚNG DẪN XÉT TUYỂN ĐẠI HỌC 2026
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e2a47] tracking-tight">
                Hành trình xét tuyển, rõ ràng từ đầu
              </h2>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-slate-600 hover:text-[#e45318] flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              Tra cứu hồ sơ đăng ký ↗
            </Link>
          </div>

          {/* 4 Bước đánh số vòng tròn 01 -> 02 -> 03 -> 04 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Tìm hiểu ngành & phương thức',
                desc: 'Khám phá các khối ngành đào tạo, điều kiện xét tuyển học bạ hoặc điểm thi THPT quốc gia.'
              },
              {
                step: '02',
                title: 'Chuẩn bị hồ sơ đăng ký',
                desc: 'Bản sao học bạ THPT (hoặc phiếu điểm), CCCD và các chứng chỉ ưu tiên (IELTS, giải HSG).'
              },
              {
                step: '03',
                title: 'Đăng ký xét tuyển trực tuyến',
                desc: 'Điền thông tin và tải ảnh chụp học bạ lên Cổng tuyển sinh online NTU trong vòng 3 phút.'
              },
              {
                step: '04',
                title: 'Nhận kết quả & Nhập học',
                desc: 'Nhận giấy báo trúng tuyển sớm có điều kiện và được cán bộ tuyển sinh hướng dẫn làm thủ tục.'
              }
            ].map((stepItem, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-[#e45318] transition-colors"
              >
                <div className="w-12 h-12 rounded-full border-2 border-[#e45318] text-[#e45318] font-black text-lg flex items-center justify-center mb-4 group-hover:bg-[#e45318] group-hover:text-white transition-colors">
                  {stepItem.step}
                </div>
                <h4 className="text-sm font-bold text-[#0e2a47] mb-2 leading-snug">
                  {stepItem.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>

          {/* Note cam kết bên dưới */}
          <div className="mt-8 p-4 rounded-xl bg-orange-50/80 border border-orange-200/80 flex items-center gap-3 text-xs text-[#0e2a47]">
            <ShieldCheck size={18} className="text-[#e45318] shrink-0" />
            <span>
              <strong>Lưu ý:</strong> Thí sinh đăng ký xét tuyển sớm vẫn cần tốt nghiệp THPT theo quy
              định của Bộ Giáo dục & Đào tạo để chính thức trở thành tân sinh viên Đại học Nguyễn
              Trãi.
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: "NHỮNG ĐIỀU BẠN ĐANG BĂN KHOĂN" (ACCORDION FAQ)
      ========================================================================= */}
      <section id="faq" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cột trái: Tiêu đề + Hotline hỗ trợ */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#e45318] block mb-2">
                  GIẢI ĐÁP THẮC MẮC
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e2a47] tracking-tight">
                  Những điều bạn đang băn khoăn.
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  Tổng hợp những thắc mắc thường gặp nhất về phương thức tuyển sinh, chính sách học
                  phí, học bổng và môi trường học tập tại Trường Đại học Nguyễn Trãi.
                </p>
              </div>

              {/* Box tư vấn nhanh màu kem */}
              <div className="bg-[#faf7f2] p-6 rounded-2xl border border-orange-200">
                <h4 className="text-sm font-bold text-[#0e2a47] mb-1.5 flex items-center gap-2">
                  <Phone size={16} className="text-[#e45318]" /> Cần được tư vấn ngay qua Hotline?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Đội ngũ chuyên viên tuyển sinh của NTU sẵn sàng hỗ trợ và giải đáp trực tiếp cho
                  bạn 24/7.
                </p>
                <a
                  href="tel:0981924302"
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-[#e45318] hover:underline"
                >
                  Hotline: 098.192.4302 ↗
                </a>
              </div>
            </div>

            {/* Cột phải: Accordion FAQ */}
            <div className="lg:col-span-7 space-y-3">
              {faqList.map((item, idx) => {
                const isOpen = faqOpen === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setFaqOpen(isOpen ? -1 : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#0e2a47]">
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-[#e45318] shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION FORM: "BẠN CÓ CÂU HỎI. CHÚNG MÌNH CÙNG TÌM CÂU TRẢ LỜI."
          (Dark Navy nền bên trái + Form đăng ký trực tuyến nền trắng bên phải)
      ========================================================================= */}
      <section id="form-dang-ky" className="bg-[#0e2a47] text-white py-16 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Cột trái */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-orange-400 block mb-2">
                  TƯ VẤN TRỰC TUYẾN 1-1
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Bạn có câu hỏi. <br />
                  <span className="text-[#e45318]">Chúng mình cùng tìm câu trả lời.</span>
                </h2>
                <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                  Để lại thông tin bên dưới để nhận được cẩm nang tuyển sinh chi tiết, định hướng
                  ngành nghề phù hợp và các suất học bổng hấp dẫn từ Đại học Nguyễn Trãi.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-[#e45318]" />
                  <span>Tư vấn hoàn toàn miễn phí từ chuyên viên tuyển sinh</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-[#e45318]" />
                  <span>Nhận trọn bộ cẩm nang đề thi và thông tin học bổng</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-[#e45318]" />
                  <span>Hỗ trợ nộp hồ sơ xét tuyển sớm nhanh chóng</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <p>📍 Trụ sở chính: 28A Lê Trọng Tấn, Hà Đông, Hà Nội</p>
                <p>☎ Điện thoại tuyển sinh: (024) 3562 7777 - 098.192.4302</p>
                <p>✉ Email tiếp nhận: tuyensinh@ntu-hn.edu.vn</p>
              </div>
            </div>

            {/* Cột phải: Form nền trắng nổi bật */}
            <div className="lg:col-span-6">
              <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-200">
                <div className="mb-6">
                  <h3 className="text-xl font-extrabold text-[#0e2a47]">Đăng ký tư vấn</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Điền đầy đủ thông tin để nhận hỗ trợ xét tuyển sớm nhất
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên thí sinh <span className="text-[#e45318]">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e45318] focus:ring-1 focus:ring-[#e45318]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số điện thoại (Zalo) <span className="text-[#e45318]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="0912 345 678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e45318] focus:ring-1 focus:ring-[#e45318]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email liên hệ
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e45318] focus:ring-1 focus:ring-[#e45318]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngành bạn quan tâm <span className="text-[#e45318]">*</span>
                      </label>
                      <select
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e45318] focus:ring-1 focus:ring-[#e45318] bg-white"
                      >
                        <option value="cntt">Công nghệ thông tin & AI</option>
                        <option value="kythuat">Kỹ thuật & Vi mạch bán dẫn</option>
                        <option value="kinhte">Kinh tế & Marketing số</option>
                        <option value="thietke">Mỹ thuật & Thiết kế đồ họa</option>
                        <option value="ngonngu">Ngôn ngữ Hàn / Nhật / Anh</option>
                        <option value="truyenthong">Quan hệ công chúng & PR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tỉnh / Thành phố hiện tại
                      </label>
                      <input
                        type="text"
                        name="province"
                        placeholder="Hà Nội, Nam Định, v.v."
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e45318] focus:ring-1 focus:ring-[#e45318]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Câu hỏi hoặc câu băn khoăn của bạn
                    </label>
                    <textarea
                      name="note"
                      rows={3}
                      placeholder="Em muốn hỏi thêm về học bổng hoặc học phí..."
                      value={formData.note}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e45318] focus:ring-1 focus:ring-[#e45318] resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitted}
                    className="w-full py-3.5 rounded-lg bg-[#e45318] hover:bg-[#cf450f] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitted ? (
                      'Đang gửi thông tin...'
                    ) : (
                      <>
                        Gửi thông tin đăng ký tư vấn ↗
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER CHUẨN ĐẠI HỌC NGUYỄN TRÃI (DARK NAVY #0b1d30)
      ========================================================================= */}
      <footer className="bg-[#0b1d30] text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Cột 1 & 2: Thông tin trường */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 px-2 py-1 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src="/logo-smartedu2.png"
                    alt="SmartEdu Logo"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white uppercase tracking-tight">
                    Đại Học Nguyễn Trãi
                  </div>
                  <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                    Nguyen Trai University - SmartEdu 2026
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Trường Đại học Nguyễn Trãi - Đào tạo ứng dụng thực chiến theo mô hình đại học thông minh,
                chuẩn mực quốc tế gắn kết doanh nghiệp.
              </p>
              <div className="space-y-1.5 text-slate-400 text-xs">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#e45318]" /> 28A Lê Trọng Tấn, Hà Đông, Hà Nội
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-[#e45318]" /> 098.192.4302 - (024) 3562 7777
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-[#e45318]" /> tuyensinh@ntu-hn.edu.vn
                </p>
              </div>
            </div>

            {/* Cột 3: Tuyển sinh */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#e45318] pl-2">
                Tuyển sinh 2026
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#quy-trinh" className="hover:text-white transition-colors">
                    Phương thức xét tuyển
                  </a>
                </li>
                <li>
                  <a href="#nganh-dao-tao" className="hover:text-white transition-colors">
                    Danh mục ngành đào tạo
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Chính sách học bổng
                  </a>
                </li>
                <li>
                  <a href="#form-dang-ky" className="hover:text-white transition-colors">
                    Đăng ký tư vấn trực tuyến
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Tra cứu kết quả xét tuyển
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 4: Ngành thế mạnh */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#e45318] pl-2">
                Khối ngành nổi bật
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#nganh-dao-tao" className="hover:text-white transition-colors">
                    Công nghệ thông tin & AI
                  </a>
                </li>
                <li>
                  <a href="#nganh-dao-tao" className="hover:text-white transition-colors">
                    Kỹ thuật vi mạch bán dẫn
                  </a>
                </li>
                <li>
                  <a href="#nganh-dao-tao" className="hover:text-white transition-colors">
                    Thiết kế đồ họa & Nội thất
                  </a>
                </li>
                <li>
                  <a href="#nganh-dao-tao" className="hover:text-white transition-colors">
                    Quản trị kinh doanh số
                  </a>
                </li>
                <li>
                  <a href="#nganh-dao-tao" className="hover:text-white transition-colors">
                    Ngôn ngữ Hàn - Nhật - Anh
                  </a>
                </li>
              </ul>
            </div>

            {/* Cột 5: Liên kết nhanh */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#e45318] pl-2">
                Liên kết trường
              </h5>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">
                    Trang chủ Đại học Nguyễn Trãi ↗
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Cổng sinh viên SmartEdu
                  </Link>
                </li>
                <li>
                  <a href="https://ntu-hn.edu.vn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Cổng thông tin điện tử NTU
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Hỏi đáp thường gặp FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 Trường Đại học Nguyễn Trãi (NTU). Bản quyền thuộc về Ban Tuyển sinh & Truyền thông.
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-400">Điều khoản sử dụng</a>
              <a href="#" className="hover:text-slate-400">Chính sách bảo mật</a>
              <Link to="/" className="hover:text-slate-400">Về Trang chủ NTU</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
