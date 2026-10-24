import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Globe2,
  Users,
  Compass,
  Cpu,
  Palette,
  Briefcase,
  Languages,
  Building2,
  Plane,
  ChevronDown,
  ChevronUp,
  Send,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  TrendingUp,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  // State tìm kiếm ngành học
  const [searchQuery, setSearchQuery] = useState('');

  // State tab tin tức
  const [newsTab, setNewsTab] = useState('all');

  // State Accordion FAQ
  const [openFaq, setOpenFaq] = useState(0);

  // State Form tư vấn tuyển sinh
  const [formData, setFormData] = useState({
    ho_ten: '',
    so_dien_thoai: '',
    email: '',
    nganh_hoc: 'Công nghệ thông tin (AI & Phần mềm)',
    tinh_thanh: '',
    ghi_chu: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.ho_ten || !formData.so_dien_thoai) {
      alert('Vui lòng điền họ tên và số điện thoại để Ban Tuyển sinh liên hệ!');
      return;
    }
    setFormSubmitted(true);
  };

  // Danh mục khối ngành đào tạo NTU
  const majorCategories = [
    {
      id: 'it',
      title: 'Công nghệ & Máy tính',
      code: 'Khoa CNTT & Trí tuệ nhân tạo',
      desc: 'Trí tuệ nhân tạo (AI), Kỹ thuật phần mềm, An toàn thông tin, Thiết kế vi mạch bán dẫn.',
      icon: Cpu,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Đón đầu xu thế AI 2026',
      studentsCount: '1.200+ Sinh viên'
    },
    {
      id: 'design',
      title: 'Mỹ thuật ứng dụng & Thiết kế',
      code: 'Khoa Mỹ thuật ứng dụng',
      desc: 'Thiết kế đồ họa 3D, Đồ họa Game & Hoạt hình, Thiết kế nội thất, Thiết kế thời trang.',
      icon: Palette,
      color: 'from-pink-600 to-rose-600',
      badge: 'Thực hành studio chuyên nghiệp',
      studentsCount: '950+ Sinh viên'
    },
    {
      id: 'business',
      title: 'Kinh tế & Quản trị',
      code: 'Khoa Kinh tế & Quản trị kinh doanh',
      desc: 'Quản trị kinh doanh số, Marketing & E-commerce, Logistics & Chuỗi cung ứng, Tài chính số.',
      icon: Briefcase,
      color: 'from-amber-600 to-orange-600',
      badge: '100% Thực tập tại tập đoàn',
      studentsCount: '1.500+ Sinh viên'
    },
    {
      id: 'languages',
      title: 'Ngôn ngữ & Văn hóa Quốc tế',
      code: 'Khoa Ngôn ngữ Quốc tế',
      desc: 'Ngôn ngữ Hàn Quốc, Ngôn ngữ Nhật Bản, Ngôn ngữ Anh thương mại quốc tế.',
      icon: Languages,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Học bổng du học Nhật - Hàn',
      studentsCount: '1.100+ Sinh viên'
    },
    {
      id: 'architecture',
      title: 'Kiến trúc & Công trình',
      code: 'Khoa Kiến trúc - Xây dựng',
      desc: 'Kiến trúc công trình, Quy hoạch đô thị xanh, Quản lý dự án kiến trúc cảnh quan.',
      icon: Building2,
      color: 'from-cyan-600 to-blue-600',
      badge: 'Chứng chỉ hành nghề quốc gia',
      studentsCount: '600+ Sinh viên'
    },
    {
      id: 'tourism',
      title: 'Du lịch & Khách sạn Quốc tế',
      code: 'Khoa Du lịch & Lữ hành',
      desc: 'Quản trị khách sạn 5 sao, Quản trị dịch vụ du lịch & Lữ hành quốc tế, Sự kiện & Hội nghị.',
      icon: Plane,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Thực tập hưởng lương 5 sao',
      studentsCount: '750+ Sinh viên'
    }
  ];

  // Danh sách tin tức
  const newsList = [
    {
      id: 1,
      title: 'Đại học Nguyễn Trãi ký kết hợp tác chiến lược đào tạo AI & Chuyển giao công nghệ cùng đối tác Nhật Bản',
      category: 'Hợp tác quốc tế',
      date: '18 Tháng 10, 2026',
      summary: 'Thỏa thuận mang lại hơn 200 suất học bổng toàn phần và cam kết việc làm tại Tokyo cho sinh viên chuyên ngành Công nghệ thông tin & Trí tuệ nhân tạo NTU.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop',
      featured: true
    },
    {
      id: 2,
      title: 'Thông báo xét tuyển sớm Đại học chính quy đợt 1 năm 2026 bằng học bạ THPT',
      category: 'Tuyển sinh 2026',
      date: '15 Tháng 10, 2026',
      summary: 'Chính sách học bổng khuyến tài lên tới 100% học phí toàn khóa học dành cho thí sinh đăng ký sớm.',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=500&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Triển lãm đồ án Mỹ thuật ứng dụng & Thiết kế đồ họa sáng tạo thường niên NTU Design Expo',
      category: 'Đời sống sinh viên',
      date: '12 Tháng 10, 2026',
      summary: 'Hơn 150 tác phẩm nghệ thuật, mô hình thiết kế nội thất và bộ nhận diện thương hiệu của sinh viên được các giám đốc sáng tạo đánh giá cao.',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=500&auto=format&fit=crop'
    },
    {
      id: 4,
      title: 'Chung kết cuộc thi Khởi nghiệp Sáng tạo Sinh viên NTU Startup Innovation 2026',
      category: 'Khởi nghiệp & Đổi mới',
      date: '08 Tháng 10, 2026',
      summary: 'Dự án ứng dụng SmartEdu AI Biometric điểm danh khuôn mặt của nhóm sinh viên CNTT xuất sắc giành giải Nhất trị giá 100 triệu đồng.',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=500&auto=format&fit=crop'
    }
  ];

  // Câu hỏi thường gặp FAQ
  const faqs = [
    {
      q: 'Trường Đại học Nguyễn Trãi tuyển sinh năm 2026 gồm những phương thức nào?',
      a: 'Năm 2026, NTU tuyển sinh đại học chính quy theo 4 phương thức linh hoạt: (1) Xét tuyển dựa trên kết quả học bạ THPT (tổng điểm trung bình 3 môn lớp 12 hoặc 3 học kỳ từ 18.0 điểm); (2) Xét tuyển theo điểm thi Tốt nghiệp THPT 2026; (3) Xét tuyển theo kết quả kỳ thi Đánh giá năng lực của ĐHQGHN; (4) Xét tuyển thẳng học sinh giỏi và thí sinh có chứng chỉ quốc tế (IELTS, TOPIK, JLPT).'
    },
    {
      q: 'Mô hình "Đại học Ứng dụng" tại Đại học Nguyễn Trãi có gì khác biệt?',
      a: 'Tại NTU, thời lượng đào tạo được phân bổ 30% lý thuyết nền tảng và 70% thực hành thực chiến. Sinh viên được học tập trực tiếp tại các xưởng studio, phòng Lab AI và tham gia kỳ thực tập doanh nghiệp có hưởng lương ngay từ năm thứ 2, giúp sinh viên tích lũy kinh nghiệm làm việc thực tế trước khi ra trường.'
    },
    {
      q: 'Chính sách học bổng doanh nghiệp và hỗ trợ việc làm của NTU ra sao?',
      a: 'NTU có quỹ học bổng "Khát vọng Nguyễn Trãi" và học bổng doanh nghiệp Nhật - Hàn tài trợ với mức từ 30%, 50% đến 100% học phí toàn khóa. Đặc biệt, nhà trường ký cam kết bằng văn bản đảm bảo 100% sinh viên tốt nghiệp đúng hạn và đạt chuẩn đầu ra được giới thiệu việc làm phù hợp tại các đối tác chiến lược.'
    },
    {
      q: 'Hệ thống SmartEdu Face AI của trường hỗ trợ sinh viên như thế nào?',
      a: 'SmartEdu là nền tảng số hóa sinh trắc học hiện đại của trường, tích hợp nhận diện khuôn mặt 512D chuẩn YuNet & ArcFace. Sinh viên điểm danh vào giảng đường và phòng thi hoàn toàn tự động bằng khuôn mặt trong 1 giây, tra cứu lịch học, xem điểm thi và theo dõi tiến độ đào tạo minh bạch 24/7.'
    },
    {
      q: 'Sinh viên các ngành Ngôn ngữ có cơ hội du học chuyển tiếp không?',
      a: 'Có. Sinh viên khoa Ngôn ngữ & Văn hóa Quốc tế (Tiếng Hàn, Tiếng Nhật, Tiếng Anh) được tham gia các chương trình trao đổi sinh viên 1 kỳ hoặc chuyển tiếp 2+2, 3+1 nhận song bằng quốc tế tại các trường đại học đối tác hàng đầu tại Seoul, Busan, Tokyo và Osaka.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* =========================================================================
          SECTION 1: HERO BANNER (TRI THỨC KHAI MỞ. TƯƠNG LAI RỘNG MỞ)
      ========================================================================= */}
      <section id="hero" className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl min-h-[580px] lg:min-h-[640px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 border border-slate-800">
            {/* Ảnh nền Campus sinh viên chất lượng cao với overlay gradient */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop"
                alt="Đại học Nguyễn Trãi Campus"
                className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
              <div className="absolute inset-0 bg-radial-at-t from-orange-500/15 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Nội dung chính Hero */}
            <div className="relative z-10 max-w-3xl space-y-5 sm:space-y-6 pt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-400 text-xs font-bold backdrop-blur-md">
                <Sparkles size={14} className="text-orange-400" />
                <span>TUYỂN SINH ĐẠI HỌC CHÍNH QUY NĂM 2026</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Tri thức khai mở. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                  Tương lai rộng mở.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
                Trường Đại học Nguyễn Trãi kiến tạo môi trường đại học ứng dụng thông minh, kết nối toàn cầu và nuôi dưỡng tinh thần khởi nghiệp sáng tạo cho thế hệ dẫn đầu kỷ nguyên số.
              </p>

              {/* THANH TÌM KIẾM NGÀNH HỌC (NHƯ TRONG ẢNH MẪU) */}
              <div className="pt-2 max-w-xl">
                <div className="bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2">
                  <div className="pl-3 text-slate-400 shrink-0">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Bạn muốn tìm ngành học gì? (VD: Công nghệ thông tin, Thiết kế đồ họa...)"
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden py-1.5"
                  />
                  <a
                    href="#programs"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shrink-0 shadow-md transition-all active:scale-95"
                  >
                    Tìm kiếm
                  </a>
                </div>
              </div>
            </div>

            {/* Quote góc dưới bên phải Hero */}
            <div className="relative z-10 hidden sm:flex items-center justify-between pt-8 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-emerald-300">Đang nhận hồ sơ xét tuyển Đợt 1 - Học bổng đến 100%</span>
              </div>
              <div className="text-slate-400 italic">
                “Khát vọng Nguyễn Trãi - Vươn tầm quốc tế”
              </div>
            </div>
          </div>

          {/* 4 THẺ QUICK-STATS TRƯỢT DƯỚI HERO (GIỐNG ẢNH MẪU) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 -mt-8 relative z-20 px-2 sm:px-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-start gap-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-slate-900">100%</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Cam kết việc làm</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Mạng lưới 50+ tập đoàn liên kết</div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-start gap-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-slate-900">70%</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Thực hành thực chiến</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Đào tạo theo chuẩn doanh nghiệp</div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-start gap-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Globe2 size={20} />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-slate-900">20+</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Đối tác quốc tế</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Chuyển tiếp Nhật Bản, Hàn Quốc</div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-start gap-3.5 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-slate-900">Face AI</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">SmartEdu 512D</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Sinh trắc học thông minh 100%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: "NHỮNG CÂU CHUYỆN ĐANG MỞ RA" (TIN TỨC, ĐỜI SỐNG, SỰ KIỆN NTU)
      ========================================================================= */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                Đời sống & Sự kiện NTU
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Những câu chuyện đang mở ra
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {['all', 'admissions', 'startup', 'international'].map((t) => {
                const labels = {
                  all: 'Tất cả',
                  admissions: 'Tuyển sinh 2026',
                  startup: 'Khởi nghiệp & Đổi mới',
                  international: 'Hợp tác quốc tế'
                };
                return (
                  <button
                    key={t}
                    onClick={() => setNewsTab(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      newsTab === t
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRID LAYOUT: 1 BÀI VIẾT LỚN BÊN TRÁI + 3 BÀI VIẾT BÊN PHẢI (CHUẨN HÌNH MẪU) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Bài viết lớn tiêu điểm */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src={newsList[0].imageUrl}
                  alt={newsList[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-bold shadow-sm">
                  {newsList[0].category}
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{newsList[0].date}</span>
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                    {newsList[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {newsList[0].summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span className="flex items-center gap-1 group-hover:gap-2 transition-all">
                    Đọc toàn bộ bài viết <ArrowRight size={14} />
                  </span>
                  <span className="text-slate-400 text-[11px] font-normal">5 phút đọc</span>
                </div>
              </div>
            </div>

            {/* Danh sách 3 bài viết nhỏ bên phải */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {newsList.slice(1).map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-orange-200 hover:shadow-xs transition-all flex gap-4 group cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 group-hover:scale-102 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-orange-600">{item.category}</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "ĐÚNG THÔNG TIN. ĐÚNG THỜI ĐIỂM." (LỊCH TUYỂN SINH 2026)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-200/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
              Lịch Tuyển Sinh & Nhập Học
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Đúng thông tin. <br />Đúng thời điểm.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Theo dõi sát các mốc thời gian xét tuyển và chỉ tiêu học bổng để không bỏ lỡ cơ hội gia nhập cộng đồng sinh viên Đại học Nguyễn Trãi.
            </p>
            <a
              href="#admissions-form"
              className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline pt-2"
            >
              Xem hướng dẫn nộp hồ sơ chi tiết <ArrowRight size={14} />
            </a>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {[
              {
                badge: 'ĐỢT 1 (ĐANG MỞ)',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                title: 'Xét tuyển sớm bằng Học bạ THPT & Học bổng Khởi nghiệp',
                time: 'Từ ngày 15/01/2026 đến hết 30/04/2026',
                note: 'Tặng ngay 5.000.000đ học phí và xét học bổng 50% - 100% cho 300 hồ sơ đầu tiên.'
              },
              {
                badge: 'ĐỢT 2',
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                title: 'Xét tuyển theo kết quả kỳ thi Đánh giá năng lực ĐHQGHN & ĐHQG-HCM',
                time: 'Từ ngày 02/05/2026 đến 30/06/2026',
                note: 'Nhận kết quả xét tuyển trực tuyến trong vòng 48h qua cổng thông tin tuyển sinh.'
              },
              {
                badge: 'ĐỢT 3',
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                title: 'Xét tuyển theo điểm thi Tốt nghiệp THPT Quốc gia 2026',
                time: 'Theo lịch trình chung của Bộ Giáo dục & Đào tạo',
                note: 'Áp dụng cho tất cả các tổ hợp xét tuyển A00, A01, D01, D07, V00, H00...'
              }
            ].map((ev, idx) => (
              <div
                key={idx}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ev.color}`}>
                      {ev.badge}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{ev.time}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{ev.title}</h4>
                  <p className="text-[11px] text-slate-500">{ev.note}</p>
                </div>

                <a
                  href="#admissions-form"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-bold text-xs shrink-0 text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>Nộp hồ sơ</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "BẠN MUỐN TẠO DẤU ẤN TRONG LĨNH VỰC NÀO?" (KHỐI NGÀNH ĐÀO TẠO)
      ========================================================================= */}
      <section id="programs" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="space-y-8">
          <div className="flex items-end justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                Chương trình đào tạo cử nhân & kiến trúc sư
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Bạn muốn tạo dấu ấn trong lĩnh vực nào?
              </h2>
            </div>
            <a
              href="#admissions-form"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
            >
              Tải sổ tay tuyển sinh 2026 (PDF) <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Thẻ truyền cảm hứng bên trái (như hình mẫu) */}
            <div className="lg:col-span-4 rounded-3xl overflow-hidden bg-slate-950 text-white relative flex flex-col justify-between p-7 shadow-lg border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                alt="Sinh viên Đại học Nguyễn Trãi"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

              <div className="relative z-10 space-y-2">
                <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Mô hình A-U-E tiên phong
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-snug mt-2">
                  Được bước ra biển lớn để thấy mình là bước tiến mới.
                </h3>
              </div>

              <div className="relative z-10 space-y-4 pt-12">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tại Đại học Nguyễn Trãi, bạn không chỉ học để thi. Bạn học để sáng tạo, để tự tin khởi nghiệp và khẳng định giá trị bản thân trong môi trường doanh nghiệp quốc tế.
                </p>
                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-orange-400 font-bold">
                  <span>Khám phá 16 chuyên ngành đào tạo</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* Lưới các khối ngành đào tạo */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {majorCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform`}>
                          <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.studentsCount}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="text-[10px] font-bold text-orange-600 tracking-wide mt-0.5">
                          {item.code}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-medium text-[10px]">
                        ✓ {item.badge}
                      </span>
                      <span className="text-orange-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Chi tiết →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "KHÔNG CHỈ NGHE GIẢNG. HÃY THỬ, LÀM VÀ KHÁM PHÁ." (MÔ HÌNH 70% THỰC HÀNH)
      ========================================================================= */}
      <section id="model" className="bg-slate-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Ảnh Lab thực hành bên trái */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=900&auto=format&fit=crop"
                  alt="Thực hành tại Đại học Nguyễn Trãi"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-xs">
                  <div className="font-bold text-orange-400">Không gian Lab SmartEdu AI & Studio Sáng Tạo</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">Trang bị máy móc hiện đại và công nghệ nhận diện Face AI thông minh</div>
                </div>
              </div>
            </div>

            {/* Nội dung giá trị bên phải */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-400/30">
                  Triết lý giáo dục ứng dụng
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Không chỉ nghe giảng. <br />
                  <span className="text-orange-400">Hãy thử, làm và khám phá.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Chúng tôi tin rằng sinh viên trưởng thành nhanh nhất khi được nhúng mình vào các dự án thực tế. Mô hình đào tạo tại NTU loại bỏ lý thuyết khô khan, trao cho bạn quyền sáng tạo và trải nghiệm thực tế ngay trong trường học.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">70% thời lượng thực hành thực chiến</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Sinh viên làm đồ án, giải quyết bài toán thực tế của doanh nghiệp dưới sự hướng dẫn của giảng viên và cố vấn cấp cao.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Thực tập có lương từ năm thứ 2</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Cơ hội tham gia mạng lưới thực tập và làm việc tại hơn 50+ doanh nghiệp hàng đầu tại Việt Nam, Nhật Bản và Hàn Quốc.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Cơ sở vật chất sinh trắc học Face AI SmartEdu</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Điểm danh lớp học và phòng thi tự động không chạm 100%, bảo mật danh tính, quản lý dữ liệu học tập thông minh.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: "HƠN MỘT GIẢNG ĐƯỜNG. MỘT PHẦN TUỔI TRẺ." (ĐỜI SỐNG SINH VIÊN)
      ========================================================================= */}
      <section id="life" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
              Môi trường sống & Học tập
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hơn một giảng đường. Một phần tuổi trẻ.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tại NTU, những năm tháng đại học của bạn sẽ tràn đầy năng lượng với các hoạt động câu lạc bộ, lễ hội quốc tế và cơ hội gắn kết bạn bè trọn đời.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop"
                  alt="Không gian sinh viên NTU"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Cộng đồng sinh viên gắn kết & Đa văn hóa
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Giao lưu cùng bạn bè quốc tế, tham gia hơn 20 câu lạc bộ học thuật, thể thao, văn nghệ và tình nguyện sôi nổi.
                </p>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=600&auto=format&fit=crop"
                  alt="Thư viện số NTU"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Thư viện số & Co-working Space hiện đại
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hàng triệu đầu sách điện tử, không gian học nhóm sáng tạo, mở cửa phục vụ sinh viên nghiên cứu và làm đồ án 24/7.
                </p>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop"
                  alt="Lễ hội âm nhạc NTU"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Lễ hội văn hóa & Ngày hội việc làm Job Fair
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kết nối trực tiếp với các nhà tuyển dụng hàng đầu, phỏng vấn tuyển dụng trực tiếp ngay tại sân trường trước lễ tốt nghiệp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: "HÀNH TRÌNH XÉT TUYỂN, RÕ RÀNG TỪ ĐẦU" (4 BƯỚC QUY TRÌNH)
      ========================================================================= */}
      <section id="admissions" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-200/80 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
              Quy trình nhập học 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hành trình xét tuyển, rõ ràng từ đầu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Quy trình xét tuyển và xác nhận nhập học tại Đại học Nguyễn Trãi được số hóa toàn diện, đơn giản và nhanh chóng.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Tìm hiểu ngành học',
                desc: 'Khám phá 16 chuyên ngành đào tạo, tổ hợp môn xét tuyển và điều kiện học bổng phù hợp với năng lực bản thân.'
              },
              {
                step: '02',
                title: 'Chuẩn bị hồ sơ',
                desc: 'Bản photo công chứng Học bạ THPT, Căn cước công dân và Giấy chứng nhận tốt nghiệp tạm thời (hoặc bằng THPT).'
              },
              {
                step: '03',
                title: 'Đăng ký xét tuyển',
                desc: 'Điền form đăng ký xét tuyển trực tuyến tại website hoặc nộp hồ sơ trực tiếp tại Văn phòng Tuyển sinh NTU.'
              },
              {
                step: '04',
                title: 'Nhận kết quả & Nhập học',
                desc: 'Nhận Giấy báo trúng tuyển chính thức, đăng ký sinh trắc học Face ID SmartEdu và nhận lịch tuần sinh hoạt công dân.'
              }
            ].map((st) => (
              <div
                key={st.step}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 relative group hover:border-orange-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {st.step}
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {st.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-orange-600 shrink-0" />
              <span><strong>Cam kết minh bạch:</strong> Học phí toàn khóa học ổn định theo quy định, không phát sinh chi phí phụ vô lý.</span>
            </div>
            <a
              href="#admissions-form"
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              Đăng ký ngay bây giờ
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: "NHỮNG ĐIỀU BẠN ĐANG BĂN KHOĂN" (FAQ ACCORDION)
      ========================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
              Giải đáp thắc mắc
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Những điều bạn đang băn khoăn
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tổng hợp những câu hỏi thí sinh và quý phụ huynh thường quan tâm nhất khi xét tuyển vào trường.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 text-slate-400">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: "BẠN CÓ CÂU HỎI? CHÚNG MÌNH CÙNG TÌM CÂU TRẢ LỜI." (FORM ĐĂNG KÝ TƯ VẤN)
      ========================================================================= */}
      <section id="admissions-form" className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-12 border border-slate-800 shadow-2xl text-white grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Cột trái: Lời nhắn & Hotline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-bold border border-orange-400/30">
              <Phone size={13} />
              <span>TƯ VẤN XÉT TUYỂN 1-1 MIỄN PHÍ</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Bạn có câu hỏi? <br />
              <span className="text-orange-400">Chúng mình cùng tìm câu trả lời.</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hãy để lại thông tin, Ban Tuyển sinh Trường Đại học Nguyễn Trãi sẽ liên hệ trực tiếp trong vòng 24 giờ để tư vấn chọn ngành, hướng dẫn hồ sơ và thẩm định học bổng cho bạn.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center font-bold">
                  <Phone size={14} />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Hotline Tư vấn 24/7:</div>
                  <div className="font-extrabold text-white text-sm">098.192.4966 • 024.3352.1228</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center font-bold">
                  <Mail size={14} />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Email nhận hồ sơ:</div>
                  <div className="font-bold text-white">tuyensinh@ntu-hn.edu.vn</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center font-bold">
                  <MapPin size={14} />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Văn phòng Tuyển sinh:</div>
                  <div className="text-white text-[11px]">Tầng 1, Nhà A, Số 28A Lê Trọng Tấn, Hà Đông, Hà Nội</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Form đăng ký tư vấn */}
          <div className="lg:col-span-7">
            <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Đăng Ký Tư Vấn & Xét Tuyển Trực Tuyến 2026
              </h3>
              <p className="text-[11px] text-slate-500 mb-5">
                Nhận ngay bộ cẩm nang hướng nghiệp và ưu tiên xét duyệt học bổng đợt 1.
              </p>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-extrabold text-sm text-emerald-800">
                    Đăng Ký Thành Công!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cảm ơn bạn <strong>{formData.ho_ten}</strong> đã quan tâm tới Trường Đại học Nguyễn Trãi! Thầy/Cô ban tuyển sinh sẽ liên hệ qua số điện thoại <strong>{formData.so_dien_thoai}</strong> trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormSubmitted(false)}
                    className="text-xs font-bold text-orange-600 hover:underline pt-2 cursor-pointer"
                  >
                    Gửi đăng ký khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên thí sinh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ho_ten}
                      onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số điện thoại / Zalo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.so_dien_thoai}
                        onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                        placeholder="0981 xxx xxx"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email liên hệ
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngành học quan tâm
                      </label>
                      <select
                        value={formData.nganh_hoc}
                        onChange={(e) => setFormData({ ...formData, nganh_hoc: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                      >
                        <option>Công nghệ thông tin (AI & Phần mềm)</option>
                        <option>Thiết kế đồ họa & Mỹ thuật ứng dụng</option>
                        <option>Quản trị kinh doanh & Marketing số</option>
                        <option>Logistics & Chuỗi cung ứng</option>
                        <option>Ngôn ngữ Hàn Quốc</option>
                        <option>Ngôn ngữ Nhật Bản</option>
                        <option>Ngôn ngữ Anh</option>
                        <option>Kiến trúc & Công trình xanh</option>
                        <option>Quản trị khách sạn & Du lịch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tỉnh / Thành phố đang học THPT
                      </label>
                      <input
                        type="text"
                        value={formData.tinh_thanh}
                        onChange={(e) => setFormData({ ...formData, tinh_thanh: e.target.value })}
                        placeholder="Hà Nội, Hải Dương, Nam Định..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Câu hỏi cần tư vấn thêm (nếu có)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.ghi_chu}
                      onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                      placeholder="Em muốn hỏi về điều kiện xét học bổng, ký túc xá..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Gửi Đăng Ký Tư Vấn & Xét Tuyển Ngay</span>
                  </button>

                  <div className="text-[10px] text-slate-400 text-center">
                    🔒 Thông tin của bạn được cam kết bảo mật theo chính sách quyền riêng tư của NTU.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
