import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  Users,
  Compass,
  Cpu,
  Palette,
  Briefcase,
  ChevronRight,
  Menu,
  X,
  LogIn,
  ExternalLink,
  Layers,
  Repeat
} from 'lucide-react';

export default function UniversityLandingLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newsTab, setNewsTab] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

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
    : 'Đăng nhập';

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#e45318] selection:text-white">
      {/* =========================================================================
          FLOATING QUICK SWITCHER (GIÚP CHUYỂN ĐỔI NHANH GIỮA 2 GIAO DIỆN)
      ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#0e2a47] text-white p-2 sm:p-2.5 rounded-full shadow-2xl border-2 border-orange-500/80 backdrop-blur-md">
        <span className="hidden sm:inline text-xs font-bold pl-2 text-orange-400 flex items-center gap-1.5">
          <Repeat size={13} /> Giao diện:
        </span>
        <button
          type="button"
          className="px-3 py-1.5 rounded-full bg-[#e45318] text-white text-xs font-bold shadow-sm"
        >
          1. Trang Chủ NTU
        </button>
        <button
          type="button"
          onClick={() => navigate('/tuyensinh')}
          className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium hover:text-white transition-colors cursor-pointer"
        >
          2. Cổng Tuyển Sinh 2026 →
        </button>
      </div>

      {/* =========================================================================
          TOP UTILITY BAR (Địa chỉ, Hotline, Cổng thông tin)
      ========================================================================= */}
      <div className="bg-[#0b1d30] text-slate-300 text-[11px] py-2 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[#e45318]" />
              <span>Số 28A Lê Trọng Tấn, Hà Đông, Hà Nội</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Phone size={12} className="text-[#e45318]" />
              <span>Hotline: <strong>098.192.4966 - 024.3352.1228</strong></span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] ml-auto">
            <Link to="/tuyensinh" className="text-orange-400 hover:underline font-bold flex items-center gap-1">
              <span>Cổng Tuyển Sinh 2026</span>
              <ArrowUpRight size={12} />
            </Link>
            <span className="text-slate-700">|</span>
            <Link to={dashboardLink} className="text-slate-300 hover:text-white font-medium flex items-center gap-1">
              <LogIn size={12} />
              <span>{user ? `Cổng: ${dashboardLabel}` : 'Cổng SmartEdu Face AI'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HEADER & NAVBAR (ĐÚNG PHONG CÁCH HÌNH MẪU 1)
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo Trường Đại học Nguyễn Trãi/ SmartEdu */}
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
                Edu Platform
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-[13px] font-semibold text-slate-700">
            <Link to="/" className="text-[#e45318] font-bold">Trang chủ</Link>
            <a href="#about" className="hover:text-[#e45318] transition-colors">Về NTU</a>
            <a href="#academics" className="hover:text-[#e45318] transition-colors">Đào tạo</a>
            <Link to="/tuyensinh" className="hover:text-[#e45318] transition-colors flex items-center gap-0.5 font-bold text-slate-900">
              Tuyển sinh <span className="w-1.5 h-1.5 rounded-full bg-[#e45318]" />
            </Link>
            <a href="#research" className="hover:text-[#e45318] transition-colors">Nghiên cứu</a>
            <a href="#life" className="hover:text-[#e45318] transition-colors">Đời sống NTU</a>
            <a href="#partners" className="hover:text-[#e45318] transition-colors">Hợp tác</a>
          </nav>

          {/* Action Button: Tuyển sinh 2026 màu cam rực rỡ */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/tuyensinh"
              className="px-4 py-2 rounded-xl bg-[#e45318] hover:bg-[#cf4711] text-white font-bold text-xs shadow-md shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Tuyển sinh 2026</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to={dashboardLink}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${user
                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
            >
              <LogIn size={13} className={user ? 'text-purple-600' : 'text-slate-500'} />
              <span>{dashboardLabel}</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-[#e45318] py-1">Trang chủ</Link>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1">Về NTU</a>
              <a href="#academics" onClick={() => setMobileMenuOpen(false)} className="py-1">Đào tạo</a>
              <Link to="/tuyensinh" onClick={() => setMobileMenuOpen(false)} className="text-orange-600 font-bold py-1">Tuyển sinh 2026 (Giao diện 2)</Link>
              <a href="#research" onClick={() => setMobileMenuOpen(false)} className="py-1">Nghiên cứu & Sáng chế</a>
              <a href="#life" onClick={() => setMobileMenuOpen(false)} className="py-1">Đời sống sinh viên</a>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/tuyensinh"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#e45318] text-white font-bold text-xs text-center flex items-center justify-center gap-1.5"
              >
                <span>Chuyển sang Cổng Tuyển Sinh 2026</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to={dashboardLink}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-1.5"
              >
                <LogIn size={13} />
                <span>{dashboardLabel}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 1: HERO TOÀN CẢNH (TRI THỨC KHAI MỞ. TƯƠNG LAI RỘNG MỞ)
      ========================================================================= */}
      <section className="relative bg-[#0b1d30] text-white overflow-hidden min-h-[560px] lg:min-h-[620px] flex items-center">
        {/* Background Image với lớp phủ tối và ánh sáng viền */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop"
            alt="Khuôn viên Đại học Nguyễn Trãi"
            className="w-full h-full object-cover opacity-35 object-center scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1d30]/95 via-[#0b1d30]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d30] via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 relative z-10 w-full flex flex-col justify-between min-h-[500px]">
          <div className="max-w-3xl space-y-5">
            <div className="text-[11px] font-bold text-[#e45318] tracking-widest uppercase flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#e45318]" />
              TRƯỜNG ĐẠI HỌC NGUYỄN TRÃI (NTU)
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Tri thức khai mở. <br />
              <span className="text-slate-100 font-light">Tương lai rộng mở.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed font-normal">
              Mô hình đại học ứng dụng thông minh hàng đầu, gắn kết trực tiếp cùng 50+ tập đoàn quốc tế, trao quyền làm chủ tương lai cho thế hệ trẻ.
            </p>

            {/* Thanh Search Bar như trong ảnh trái */}
            <div className="pt-2 max-w-lg">
              <div className="bg-white p-1.5 rounded-xl shadow-lg flex items-center gap-2">
                <div className="pl-3 text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Bạn muốn tìm thông tin gì?"
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden py-1.5"
                />
                <button
                  type="button"
                  onClick={() => navigate('/tuyensinh')}
                  className="px-5 py-2.5 rounded-lg bg-[#e45318] hover:bg-[#cf4711] text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>

          {/* Chú thích góc dưới bên phải */}
          <div className="pt-10 flex items-end justify-between text-xs text-slate-400">
            <div className="hidden sm:flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Hệ thống Đào tạo & Face AI Biometric SmartEdu 2026</span>
            </div>
            <div className="text-right text-[11px] text-slate-300 italic max-w-xs ml-auto">
              Khuôn viên đào tạo ứng dụng thông minh Nguyễn Trãi University, Hà Đông, Hà Nội.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4 THẺ ICON TRÒN DƯỚI HERO (CHUẨN HÌNH MẪU 1)
      ========================================================================= */}
      <section className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Đào tạo chuẩn quốc tế', desc: 'Chương trình song ngữ, chuyển tiếp Nhật - Hàn', icon: Globe2 },
              { title: 'Cơ sở vật chất 5 sao', desc: 'Hệ thống phòng Lab AI & Studio sáng tạo', icon: Building2 },
              { title: '100% Việc làm sau tốt nghiệp', desc: 'Cam kết bằng văn bản với doanh nghiệp', icon: Briefcase },
              { title: 'Học bổng lên tới 100%', desc: 'Quỹ học bổng doanh nghiệp hơn 20 tỷ đồng', icon: Award },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl hover:bg-slate-50 transition-colors flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 text-[#e45318] flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: "NHỮNG CÂU CHUYỆN ĐANG MỞ RA" (TIN TỨC, ĐỜI SỐNG NTU)
      ========================================================================= */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-[11px] font-bold text-[#e45318] tracking-widest uppercase">
                Tin tức & Hoạt động
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2a47] tracking-tight mt-1">
                Những câu chuyện đang mở ra
              </h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'news', 'admissions', 'research', 'life'].map((t) => {
                const labels = {
                  all: 'Tất cả',
                  news: 'Tin nổi bật',
                  admissions: 'Tuyển sinh',
                  research: 'Nghiên cứu',
                  life: 'Đời sống sinh viên'
                };
                return (
                  <button
                    key={t}
                    onClick={() => setNewsTab(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${newsTab === t
                      ? 'bg-[#0e2a47] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout: 1 bài lớn bên trái + 3 bài nhỏ bên phải (Chuẩn y hệt ảnh 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Bài viết lớn bên trái */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop"
                  alt="Sinh viên NTU nghiên cứu"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#e45318] text-white text-[10px] font-bold uppercase tracking-wider">
                  Tiêu Điểm
                </div>
              </div>
              <div className="p-6 sm:p-7 space-y-3">
                <div className="text-[11px] text-slate-400 font-medium">18 Tháng 10, 2026 • Hợp tác quốc tế</div>
                <h3 className="text-base sm:text-xl font-black text-[#0e2a47] group-hover:text-[#e45318] transition-colors leading-snug">
                  Từ phòng đường đến giảng đường: ĐH Nguyễn Trãi kiến tạo thế hệ công dân toàn cầu thực chiến
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Lễ ký kết thỏa thuận hợp tác đào tạo và cung ứng nhân lực chất lượng cao ngành Trí tuệ nhân tạo (AI) và Thiết kế đồ họa với các tập đoàn công nghệ lớn từ Tokyo và Seoul.
                </p>
                <div className="pt-2 text-xs font-bold text-[#e45318] flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>Xem chi tiết bài viết</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>

            {/* 3 bài nhỏ xếp dọc bên phải */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {[
                {
                  id: 1,
                  tag: 'Tuyển sinh 2026',
                  title: 'Đại học Nguyễn Trãi chính thức mở cổng xét tuyển sớm đợt 1 năm 2026',
                  date: '15 Tháng 10, 2026',
                  img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop'
                },
                {
                  id: 2,
                  tag: 'Nghiên cứu khoa học',
                  title: 'Dự án SmartEdu AI Biometric điểm danh khuôn mặt đạt giải Nhất Sáng tạo Trẻ',
                  date: '10 Tháng 10, 2026',
                  img: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=400&auto=format&fit=crop'
                },
                {
                  id: 3,
                  tag: 'Đời sống sinh viên',
                  title: 'Khai mạc tuần lễ Triển lãm Mỹ thuật Ứng dụng & Không gian Kiến trúc xanh NTU Expo',
                  date: '05 Tháng 10, 2026',
                  img: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=400&auto=format&fit=crop'
                }
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-orange-300 transition-all flex gap-4 group cursor-pointer"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-102 transition-transform"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[#e45318] mb-1">{item.tag}</div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0e2a47] line-clamp-2 group-hover:text-[#e45318] transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "ĐÚNG THÔNG TIN. ĐÚNG THỜI ĐIỂM." (TIMELINE THÔNG BÁO)
      ========================================================================= */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-3">
              <div className="text-[11px] font-bold text-[#e45318] tracking-widest uppercase">
                THÔNG BÁO MỚI NHẤT
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2a47] tracking-tight">
                Đúng thông tin. <br />Đúng thời điểm.
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mọi mốc thời gian xét tuyển, thời hạn nộp học bổng và lịch tuần sinh hoạt công dân đều được công bố chính xác và minh bạch.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-slate-200 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
              {[
                { date: '15.01', year: '2026', title: 'Thông báo nhận hồ sơ xét tuyển sớm Học bạ THPT Đợt 1 năm 2026', tag: 'Tuyển sinh' },
                { date: '20.02', year: '2026', title: 'Công bố quỹ học bổng Doanh nghiệp Khát Vọng Nguyễn Trãi trị giá 20 tỷ đồng', tag: 'Học bổng' },
                { date: '15.03', year: '2026', title: 'Tổ chức ngày hội Open Day Trải nghiệm 1 ngày làm sinh viên Đại học Nguyễn Trãi', tag: 'Sự kiện' },
                { date: '20.04', year: '2026', title: 'Lịch thi năng khiếu vẽ Mỹ thuật và Thiết kế đồ họa đợt đầu tiên', tag: 'Năng khiếu' },
              ].map((row, idx) => (
                <div key={idx} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4 group cursor-pointer hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="text-center shrink-0">
                      <div className="text-base sm:text-lg font-black text-[#e45318] leading-none">{row.date}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.year}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#0e2a47] group-hover:text-[#e45318] transition-colors truncate">
                        {row.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{row.tag}</div>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-[#e45318] transition-colors shrink-0">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "KIẾN THỨC VỮNG VÀNG. TƯ DUY KHÔNG GIỚI HẠN."
      ========================================================================= */}
      <section id="academics" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Cột trái: Ảnh thư viện hiện đại 2 tầng có banner cam bên dưới */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=900&auto=format&fit=crop"
                alt="Thư viện hiện đại NTU"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="p-4 bg-[#e45318] text-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">HỌC ĐỂ KIẾN TẠO • TRẢI NGHIỆM ĐỂ VƯƠN XA</div>
                  <div className="text-[11px] text-orange-100">Khuôn viên học tập mở và truyền cảm hứng sáng tạo</div>
                </div>
                <ArrowUpRight size={20} className="shrink-0" />
              </div>
            </div>
          </div>

          {/* Cột phải: Các bậc đào tạo */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#e45318] tracking-widest uppercase">
                HỆ THỐNG ĐÀO TẠO ĐA BẬC
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0e2a47] tracking-tight leading-tight">
                Kiến thức vững vàng. <br />Tư duy không giới hạn.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Đại học Nguyễn Trãi phát triển hệ thống chương trình đào tạo hiện đại, chuẩn quốc tế từ bậc Đại học, Thạc sĩ đến các chương trình song bằng và chuyển tiếp toàn cầu.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Đào tạo Đại học Chính quy', desc: '16 chuyên ngành đào tạo đón đầu nhu cầu kỷ nguyên số và trí tuệ nhân tạo' },
                { title: 'Đào tạo Sau Đại học (Thạc sĩ)', desc: 'Nâng cao năng lực quản trị, tư duy nghiên cứu chiến lược và lãnh đạo doanh nghiệp' },
                { title: 'Chương trình Quốc tế & Chuyển tiếp', desc: 'Liên kết 2+2, 3+1 cùng các trường đại học hàng đầu Nhật Bản và Hàn Quốc' },
              ].map((lvl, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/tuyensinh')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0e2a47] group-hover:text-[#e45318] transition-colors">
                      {lvl.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-400 group-hover:text-[#e45318] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "TỪ KHÁM PHÁ TRI THỨC ĐẾN GIÁ TRỊ CHO CỘNG ĐỒNG" (DARK NAVY BANNER)
      ========================================================================= */}
      <section id="research" className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="bg-[#0e2a47] rounded-3xl p-6 sm:p-12 text-white border border-slate-700 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Ảnh phòng lab nghiên cứu bên trái */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-600 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=700&auto=format&fit=crop"
                  alt="Nghiên cứu khoa học tại NTU"
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#e45318] text-white text-[10px] font-bold">
                  Trung tâm R&D NTU
                </div>
              </div>
            </div>

            {/* Cột phải: 3 mục nghiên cứu chuyển giao */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="text-[10px] font-bold text-orange-400 tracking-widest uppercase">
                  NGHIÊN CỨU & ĐỔI MỚI SÁNG TẠO
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Từ khám phá tri thức đến giá trị cho cộng đồng.
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Đại học Nguyễn Trãi tập trung nghiên cứu ứng dụng thực tiễn, giải quyết các bài toán công nghệ số, đô thị thông minh và chuyển đổi xanh.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Nghiên cứu khoa học ↗', desc: 'Các công bố khoa học quốc tế Scopus và đề tài cấp Nhà nước, cấp Bộ' },
                  { title: 'Sáng chế & Chuyển giao công nghệ ↗', desc: 'Ứng dụng giải pháp Face AI và tự động hóa vào trường học và doanh nghiệp' },
                  { title: 'Khởi nghiệp & Đổi mới sáng tạo ↗', desc: 'Vườn ươm dự án khởi nghiệp NTU Innovation Hub tài trợ vốn hạt giống' },
                ].map((res, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#16385d] border border-slate-700 hover:border-orange-400 transition-colors cursor-pointer group">
                    <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-orange-400 transition-colors flex items-center justify-between">
                      <span>{res.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{res.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: "CÙNG HÒA VÀO NHỊP SỐNG ĐẠI HỌC" (3 CARDS HOẠT ĐỘNG)
      ========================================================================= */}
      <section id="life" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-[11px] font-bold text-[#e45318] tracking-widest uppercase">
                MÔI TRƯỜNG SINH VIÊN
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2a47] tracking-tight mt-1">
                Cùng hòa vào nhịp sống đại học
              </h2>
            </div>
            <Link to="/tuyensinh" className="text-xs font-bold text-[#e45318] hover:underline flex items-center gap-1">
              <span>Khám phá thêm</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Khám phá trường, luôn có những chân trời mới',
                desc: 'Hệ thống giảng đường hiện đại, khuôn viên xanh và các tiện ích hỗ trợ sinh viên học tập toàn diện.',
                img: 'https://thuonghieuvaphapluat.vn/Images/bavu/2023/10/29/11.jpg'
              },
              {
                title: 'Giảng đường đa dạng và các sự kiện trí thức',
                desc: 'Hội thảo chuyên đề cùng các CEO tập đoàn, talkshow hướng nghiệp và diễn đàn khoa học sinh viên.',
                img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop'
              },
              {
                title: 'Kết nối đam mê qua hàng loạt giải đấu & hoạt động',
                desc: 'Giải thể thao sinh viên, liên hoan âm nhạc và các chuyến đi tình nguyện ý nghĩa vì cộng đồng.',
                img: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=80&w=600&auto=format&fit=crop'
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div className="h-48 overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0e2a47] group-hover:text-[#e45318] transition-colors leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-[#e45318] flex items-center gap-1">
                    Tìm hiểu chi tiết →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: "CÙNG KIẾN TẠO NHỮNG GIÁ TRỊ BỀN VỮNG" (MÀU BE / KEM SANG TRỌNG)
      ========================================================================= */}
      <section id="partners" className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-[#faf7f2] rounded-3xl p-6 sm:p-12 border border-amber-200/60 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-[11px] font-bold text-[#e45318] tracking-widest uppercase">
                CAM KẾT CHẤT LƯỢNG ĐÀO TẠO
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0e2a47] tracking-tight">
                Cùng kiến tạo những giá trị bền vững.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Chúng tôi đồng hành cùng mỗi sinh viên trong suốt 4 năm học tập và cả chặng đường sự nghiệp sau tốt nghiệp, mang đến nền tảng tri thức vững chắc và giá trị sống nhân văn.
              </p>
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate('/tuyensinh')}
                  className="px-5 py-2.5 rounded-xl bg-[#0e2a47] hover:bg-[#16385d] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <span>Khám phá Cổng Tuyển Sinh 2026</span>
                  <ArrowUpRight size={14} />
                </button>
                <a
                  href="#about"
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <span>Trải nghiệm học tập</span>
                </a>
              </div>
            </div>

            {/* Ảnh sinh viên tốt nghiệp bên phải */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-md border border-amber-200/80">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=700&auto=format&fit=crop"
                  alt="Sinh viên tốt nghiệp Đại học Nguyễn Trãi"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER ĐẠI HỌC NGUYỄN TRÃI (CHUẨN DARK NAVY #0b1d30)
      ========================================================================= */}
      <footer className="bg-[#0b1d30] text-slate-400 text-xs pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-3 text-white font-black text-lg">
                <div className="h-10 px-2 py-1 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src="/logo-smartedu2.png"
                    alt="SmartEdu Logo"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <span>ĐẠI HỌC NGUYỄN TRÃI</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Trường Đại học Nguyễn Trãi - Mô hình Đại học Ứng dụng tiên phong, kiến tạo thế hệ công dân toàn cầu thực chiến và khởi nghiệp sáng tạo.
              </p>
              <div className="space-y-1.5 text-[11px] pt-1">
                <div><strong>Trụ sở:</strong> 28A Lê Trọng Tấn, Hà Đông, Hà Nội</div>
                <div><strong>Hotline Tuyển sinh:</strong> 098.192.4966 - 024.3352.1228</div>
                <div><strong>Email:</strong> tuyensinh@ntu-hn.edu.vn</div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-2.5">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-orange-400">Đào Tạo & Khối Ngành</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/tuyensinh" className="hover:text-white">Công nghệ thông tin & Trí tuệ nhân tạo (AI)</Link></li>
                <li><Link to="/tuyensinh" className="hover:text-white">Thiết kế đồ họa & Mỹ thuật ứng dụng</Link></li>
                <li><Link to="/tuyensinh" className="hover:text-white">Quản trị kinh doanh & Marketing số</Link></li>
                <li><Link to="/tuyensinh" className="hover:text-white">Ngôn ngữ & Văn hóa Hàn Quốc</Link></li>
                <li><Link to="/tuyensinh" className="hover:text-white">Ngôn ngữ & Văn hóa Nhật Bản</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-2.5">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-orange-400">Tuyển Sinh 2026</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/tuyensinh" className="hover:text-white font-bold text-orange-400">Cổng Tuyển sinh 2026 →</Link></li>
                <li><Link to="/tuyensinh" className="hover:text-white">Xét tuyển học bạ THPT</Link></li>
                <li><Link to="/tuyensinh" className="hover:text-white">Học bổng Doanh nghiệp</Link></li>
                <li><Link to="/tuyensinh" className="hover:text-white">Đăng ký tư vấn trực tuyến</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-2.5">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-orange-400">Hệ Sinh Thái Số SmartEdu</h4>
              <p className="text-[11px] text-slate-400">
                Hệ thống Quản lý Đào tạo & Điểm danh Sinh trắc học Face AI 512 chiều độc quyền tại NTU.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors mt-1"
              >
                <LogIn size={13} />
                <span>Cổng SmartEdu (SV & GV)</span>
              </Link>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between flex-wrap gap-4 text-[11px] text-slate-500">
            <div>© 2026 Trường Đại học Nguyễn Trãi (NTU). Bản quyền thuộc về ĐH Nguyễn Trãi.</div>
            <div className="flex gap-4">
              <span>Chính sách bảo mật</span>
              <span>•</span>
              <span>Quy chế tuyển sinh</span>
              <span>•</span>
              <span>Sơ đồ trang</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
