-- ==========================================================
-- SMARTEDU MIGRATION: MỞ RỘNG PHÂN HỆ ĐÀO TẠO & PHÂN QUYỀN KHOA
-- Căn cứ theo kế hoạch nghiệp vụ đại học SmartEdu
-- ==========================================================

USE smart_edu_db;

-- 1. Cập nhật ENUM role của bảng users để thêm 'faculty_manager'
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'faculty_manager', 'teacher', 'student') NOT NULL;

-- 2. Bảng quan_ly_khoa (Cán bộ / Trợ lý quản lý của Khoa)
CREATE TABLE IF NOT EXISTS quan_ly_khoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    ma_can_bo VARCHAR(20) NOT NULL UNIQUE,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(15) NULL,
    khoa_id INT NOT NULL,
    chuc_vu VARCHAR(100) DEFAULT 'Trợ lý khoa',
    avatar_url VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_qlk_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_qlk_khoa FOREIGN KEY (khoa_id) 
        REFERENCES khoa(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Phân hệ Sơ yếu lý lịch sinh viên
-- 3.1. Bảng ho_so_sinh_vien
CREATE TABLE IF NOT EXISTS ho_so_sinh_vien (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL UNIQUE,
    so_cmnd_cccd VARCHAR(20) NULL,
    ngay_cap_cccd DATE NULL,
    noi_cap_cccd VARCHAR(150) NULL,
    noi_sinh VARCHAR(100) NULL,
    que_quan VARCHAR(255) NULL,
    quoc_tich VARCHAR(50) NOT NULL DEFAULT 'Việt Nam',
    dan_toc VARCHAR(50) NOT NULL DEFAULT 'Kinh',
    ton_giao VARCHAR(50) NOT NULL DEFAULT 'Không',
    thanh_phan_xuat_than VARCHAR(100) NULL,
    ngay_vao_doan DATE NULL,
    ngay_vao_dang DATE NULL,
    so_dien_thoai_ca_nhan VARCHAR(15) NULL,
    so_dien_thoai_gia_dinh VARCHAR(15) NULL,
    dia_chi_thuong_tru TEXT NULL,
    xa_phuong VARCHAR(100) NULL,
    quan_huyen VARCHAR(100) NULL,
    tinh_thanh_pho VARCHAR(100) NULL,
    dia_chi_tam_tru_hien_nay TEXT NULL,
    doi_tuong_chinh_sach VARCHAR(100) NULL,
    doi_tuong_tro_cap VARCHAR(100) NULL,
    nhom_doi_tuong VARCHAR(50) NULL,
    dia_chi_bao_tin TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hssv_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.2. Bảng quan_he_gia_dinh
CREATE TABLE IF NOT EXISTS quan_he_gia_dinh (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    moi_quan_he ENUM('Cha', 'Me', 'NguoiGiamHo', 'AnhChiEm') NOT NULL,
    ho_ten VARCHAR(150) NOT NULL,
    nam_sinh INT NULL,
    nghe_nghiep VARCHAR(150) NULL,
    co_quan_lam_viec VARCHAR(255) NULL,
    so_dien_thoai VARCHAR(15) NULL,
    dia_chi_hien_nay TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qhgd_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.3. Bảng thong_tin_tuyen_sinh
CREATE TABLE IF NOT EXISTS thong_tin_tuyen_sinh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL UNIQUE,
    phuong_thuc_xet_tuyen VARCHAR(100) NULL,
    khoi_thi VARCHAR(20) NULL,
    diem_xet_tuyen FLOAT NULL,
    diem_uu_tien FLOAT NULL DEFAULT 0,
    nam_tot_nghiep_c3 INT NULL,
    truong_thpt VARCHAR(255) NULL,
    so_bao_danh VARCHAR(50) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ttts_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Phân hệ Chương trình đào tạo (CTĐT) - Phụ thuộc trực tiếp vào Khoa & Ngành
-- 4.1. Bảng nganh_hoc
CREATE TABLE IF NOT EXISTS nganh_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,
    ma_nganh VARCHAR(20) NOT NULL UNIQUE,
    ten_nganh VARCHAR(150) NOT NULL,
    thoi_gian_dao_tao_nam FLOAT NOT NULL DEFAULT 4.0,
    tong_tin_chi_yeu_cau INT NOT NULL DEFAULT 135,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nganh_khoa FOREIGN KEY (khoa_id) 
        REFERENCES khoa(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.2. Bảng chuong_trinh_dao_tao (Phụ thuộc vào Khoa & Ngành)
CREATE TABLE IF NOT EXISTS chuong_trinh_dao_tao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,
    nganh_hoc_id INT NOT NULL,
    ma_ctdt VARCHAR(50) NOT NULL UNIQUE,
    ten_ctdt VARCHAR(255) NOT NULL,
    khoa_tuyen_sinh VARCHAR(20) NOT NULL COMMENT 'VD: K22, K23, K24',
    nam_ban_hanh INT NOT NULL,
    quyet_dinh_ban_hanh VARCHAR(255) NULL,
    tong_tin_chi_yeu_cau INT NOT NULL DEFAULT 135,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ctdt_khoa FOREIGN KEY (khoa_id) 
        REFERENCES khoa(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ctdt_nganh FOREIGN KEY (nganh_hoc_id) 
        REFERENCES nganh_hoc(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.3. Bảng ctdt_hoc_phan
CREATE TABLE IF NOT EXISTS ctdt_hoc_phan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chuong_trinh_dao_tao_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    hoc_ky_goi_y INT NOT NULL DEFAULT 1 COMMENT '1..8',
    khoi_kien_thuc ENUM('DaiCuong', 'CoSoNganh', 'ChuyenNganh', 'TotNghiep') NOT NULL DEFAULT 'CoSoNganh',
    loai_hoc_phan ENUM('BatBuoc', 'TuChon') NOT NULL DEFAULT 'BatBuoc',
    mon_tien_quyet_id INT NULL,
    mon_song_hanh_id INT NULL,
    CONSTRAINT fk_ctdthp_ctdt FOREIGN KEY (chuong_trinh_dao_tao_id) 
        REFERENCES chuong_trinh_dao_tao(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ctdthp_monhoc FOREIGN KEY (mon_hoc_id) 
        REFERENCES mon_hoc(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ctdthp_tienquyet FOREIGN KEY (mon_tien_quyet_id) 
        REFERENCES mon_hoc(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_ctdthp_songhanh FOREIGN KEY (mon_song_hanh_id) 
        REFERENCES mon_hoc(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Phân hệ Đợt Đăng ký học phần
CREATE TABLE IF NOT EXISTS dot_dang_ky_hoc_phan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoc_ky_id INT NOT NULL,
    ten_dot VARCHAR(150) NOT NULL,
    thoi_gian_bat_dau DATETIME NOT NULL,
    thoi_gian_ket_thuc DATETIME NOT NULL,
    tin_chi_toi_thieu INT NOT NULL DEFAULT 12,
    tin_chi_toi_da INT NOT NULL DEFAULT 24,
    trang_thai ENUM('ChuaMo', 'DangMo', 'DaDong', 'Huy') NOT NULL DEFAULT 'ChuaMo',
    ap_dung_khoa VARCHAR(100) NULL COMMENT 'K21, K22, K23...',
    ghi_chu VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ddkhp_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Phân hệ Học phí & Quản lý Công nợ (Kế toán kiểm duyệt thủ công)
-- 6.1. Bảng dinh_muc_hoc_phi
CREATE TABLE IF NOT EXISTS dinh_muc_hoc_phi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoc_ky_id INT NOT NULL,
    nganh_hoc_id INT NOT NULL,
    don_gia_tin_chi_ly_thuyet DECIMAL(12, 2) NOT NULL DEFAULT 450000.00,
    don_gia_tin_chi_thuc_hanh DECIMAL(12, 2) NOT NULL DEFAULT 600000.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dmhp_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_dmhp_nganh FOREIGN KEY (nganh_hoc_id) 
        REFERENCES nganh_hoc(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.2. Bảng cong_no_hoc_phi (Kế toán duyệt, hỗ trợ kiểm tra nộp tiền mặt/chuyển khoản)
CREATE TABLE IF NOT EXISTS cong_no_hoc_phi (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    tong_tin_chi_dang_ky INT NOT NULL DEFAULT 0,
    tong_hoc_phi_phai_nop DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    so_tien_mien_giam DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    so_tien_da_dong DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    so_tien_con_no DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    han_chot_nop DATE NULL,
    trang_thai ENUM('ChuaDong', 'DongMotPhan', 'DaHoanThanh', 'QuaHan', 'ChoKiemDuyet') NOT NULL DEFAULT 'ChuaDong',
    ngay_nop_tien DATETIME NULL,
    nguoi_xac_nhan_id INT NULL COMMENT 'ID cán bộ kế toán xác nhận',
    ngay_xac_nhan DATETIME NULL,
    so_bien_lai VARCHAR(100) NULL,
    ghi_chu_ke_toan TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cnhp_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cnhp_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cnhp_nguoixacnhan FOREIGN KEY (nguoi_xac_nhan_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE KEY uq_sv_hocky_congno (sinh_vien_id, hoc_ky_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Phân hệ Bảng điểm, Kết quả học tập & Cảnh báo học vụ
-- 7.1. Bảng bang_diem_sinh_vien
CREATE TABLE IF NOT EXISTS bang_diem_sinh_vien (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dang_ky_hoc_phan_id BIGINT NOT NULL UNIQUE,
    diem_chuyen_can FLOAT NULL COMMENT 'Tự động tính từ tỷ lệ điểm danh Face AI',
    diem_giua_ky FLOAT NULL,
    diem_cuoi_ky FLOAT NULL,
    diem_tong_ket_he10 FLOAT NULL,
    diem_tong_ket_he4 FLOAT NULL,
    diem_chu VARCHAR(5) NULL,
    ket_qua ENUM('Dat', 'KhongDat', 'ChuaXet') NOT NULL DEFAULT 'ChuaXet',
    ghi_chu VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bdsv_dkhp FOREIGN KEY (dang_ky_hoc_phan_id) 
        REFERENCES dang_ky_hoc_phan(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.2. Bảng tong_ket_hoc_ky
CREATE TABLE IF NOT EXISTS tong_ket_hoc_ky (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    so_tin_chi_hoc_ky INT NOT NULL DEFAULT 0,
    gpa_he10 FLOAT NOT NULL DEFAULT 0,
    gpa_he4 FLOAT NOT NULL DEFAULT 0,
    so_tin_chi_tich_luy INT NOT NULL DEFAULT 0,
    cpa_tich_luy_he4 FLOAT NOT NULL DEFAULT 0,
    xep_loai_hoc_luc ENUM('XuatSac', 'Gioi', 'Kha', 'TrungBinh', 'Yeu', 'Kem') NOT NULL DEFAULT 'TrungBinh',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tkhk_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tkhk_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_sv_hocky_tongket (sinh_vien_id, hoc_ky_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.3. Bảng canh_bao_hoc_vu
CREATE TABLE IF NOT EXISTS canh_bao_hoc_vu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    muc_canh_bao ENUM('NhacNho', 'CanhBao_Muc1', 'CanhBao_Muc2', 'BuocThoiHoc') NOT NULL,
    ly_do TEXT NOT NULL,
    so_quyet_dinh VARCHAR(100) NULL,
    ngay_ra_quyet_dinh DATE NULL,
    nguoi_ky_id INT NULL,
    trang_thai_khac_phuc ENUM('DangTheoDoi', 'DaKhacPhuc', 'ThiHanhKyLuat') NOT NULL DEFAULT 'DangTheoDoi',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbhv_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cbhv_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cbhv_nguoiky FOREIGN KEY (nguoi_ky_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Phân hệ Điểm rèn luyện, Khen thưởng & Ý kiến sinh viên
-- 8.1. Bảng diem_ren_luyen
CREATE TABLE IF NOT EXISTS diem_ren_luyen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    diem_tu_danh_gia INT NOT NULL DEFAULT 0,
    diem_lop_danh_gia INT NOT NULL DEFAULT 0,
    diem_khoa_duyet INT NOT NULL DEFAULT 0,
    xep_loai ENUM('XuatSac', 'Tot', 'Kha', 'TrungBinh', 'Yeu', 'Kem') NOT NULL DEFAULT 'Kha',
    trang_thai_duyet ENUM('ChoSinhVienCham', 'ChoLopDuyet', 'ChoKhoaDuyet', 'DaKhoaDiem') NOT NULL DEFAULT 'ChoSinhVienCham',
    ngay_duyet DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drl_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_drl_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_sv_hocky_drl (sinh_vien_id, hoc_ky_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.2. Bảng khen_thuong_ky_luat
CREATE TABLE IF NOT EXISTS khen_thuong_ky_luat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    loai ENUM('KhenThuong', 'KyLuat') NOT NULL,
    hinh_thuc VARCHAR(150) NOT NULL,
    noi_dung TEXT NOT NULL,
    so_quyet_dinh VARCHAR(100) NULL,
    ngay_quyet_dinh DATE NULL,
    co_quan_ban_hanh VARCHAR(150) DEFAULT 'Trường / Khoa',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ktkl_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.3. Bảng y_kien_sinh_vien
CREATE TABLE IF NOT EXISTS y_kien_sinh_vien (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT NOT NULL,
    danh_muc ENUM('HocTap', 'HocPhi', 'LichThi', 'DiemDanh', 'HoSoCaNhan', 'Khac') NOT NULL DEFAULT 'HocTap',
    file_dinh_kem VARCHAR(255) NULL,
    trang_thai ENUM('TiepNhan', 'DangXuLy', 'DaPhanHoi', 'Dong') NOT NULL DEFAULT 'TiepNhan',
    noi_dung_phan_hoi TEXT NULL,
    nguoi_phan_hoi_id INT NULL,
    ngay_phan_hoi DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_yksv_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_yksv_nguoiphanhoi FOREIGN KEY (nguoi_phan_hoi_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
