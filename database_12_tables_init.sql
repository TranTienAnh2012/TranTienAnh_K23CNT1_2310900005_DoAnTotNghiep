-- ==============================================================================
-- SMARTEDU - DATABASE 12 BẢNG CHUẨN TỐI ƯU HÓA CHO ĐỒ ÁN TỐT NGHIỆP
-- Đề tài: Hệ thống Quản lý Đào tạo & Điểm danh Sinh viên bằng Face AI
-- Sinh viên: Trần Tiến Anh - K23CNT1 - 2310900005
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS smart_edu_v2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smart_edu_v2;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. BẢNG KHOA
DROP TABLE IF EXISTS khoa;
CREATE TABLE khoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_khoa VARCHAR(20) NOT NULL UNIQUE,
    ten_khoa VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG LỚP CHUYÊN NGÀNH (Gộp nganh_hoc + lop)
DROP TABLE IF EXISTS lop;
CREATE TABLE lop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,
    ma_lop VARCHAR(30) NOT NULL UNIQUE,
    ten_lop VARCHAR(100) NOT NULL,
    ma_nganh VARCHAR(20) DEFAULT '7480201',
    ten_nganh VARCHAR(100) DEFAULT 'Công nghệ thông tin',
    khoa_hoc VARCHAR(20) NOT NULL,
    he_dao_tao VARCHAR(50) DEFAULT 'Đại học chính quy',
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG USERS (Tài khoản xác thực toàn hệ thống)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty_manager', 'teacher', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG GIẢNG VIÊN & CÁN BỘ QUẢN LÝ KHOA (Gộp giang_vien + quan_ly_khoa)
DROP TABLE IF EXISTS giang_vien;
CREATE TABLE giang_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL UNIQUE,
    khoa_id INT NOT NULL,
    ma_gv VARCHAR(20) NOT NULL UNIQUE,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    hoc_ham_hoc_vi VARCHAR(50) DEFAULT 'Thạc sĩ',
    chuc_vu ENUM('GiangVien', 'GiaoVu', 'PhoKhoa', 'TruongKhoa') DEFAULT 'GiangVien',
    chuyen_mon VARCHAR(150),
    avatar_url VARCHAR(255),
    face_embedding JSON,
    face_updated_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG SINH VIÊN TOÀN DIỆN & FACE AI (Gộp sinh_vien + ho_so + gia_dinh + tuyen_sinh)
DROP TABLE IF EXISTS sinh_vien;
CREATE TABLE sinh_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL UNIQUE,
    lop_id INT NOT NULL,
    ma_sv VARCHAR(20) NOT NULL UNIQUE,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh ENUM('Nam', 'Nu', 'Khac') DEFAULT 'Nam',
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    so_cmnd_cccd VARCHAR(20),
    avatar_url VARCHAR(255),
    
    -- Trọng tâm Face AI
    face_embedding JSON,
    face_updated_at TIMESTAMP NULL,
    
    -- Sơ yếu lý lịch mở rộng
    dia_chi_thuong_tru TEXT,
    que_quan VARCHAR(150),
    dan_toc VARCHAR(30) DEFAULT 'Kinh',
    ton_giao VARCHAR(30) DEFAULT 'Không',
    thong_tin_gia_dinh JSON,
    thong_tin_tuyen_sinh JSON,
    
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lop_id) REFERENCES lop(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG MÔN HỌC
DROP TABLE IF EXISTS mon_hoc;
CREATE TABLE mon_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,
    ma_mon VARCHAR(20) NOT NULL UNIQUE,
    ten_mon VARCHAR(150) NOT NULL,
    so_tin_chi INT NOT NULL DEFAULT 3,
    so_tiet INT DEFAULT 45,
    loai_mon ENUM('LyThuyet', 'ThucHanh', 'DoAn') DEFAULT 'LyThuyet',
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG KHUNG CHƯƠNG TRÌNH ĐÀO TẠO
DROP TABLE IF EXISTS chuong_trinh_dao_tao;
CREATE TABLE chuong_trinh_dao_tao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,
    nganh_hoc_ten VARCHAR(100) NOT NULL DEFAULT 'Công nghệ thông tin',
    ma_ctdt VARCHAR(50) NOT NULL UNIQUE,
    ten_ctdt VARCHAR(255) NOT NULL,
    khoa_tuyen_sinh VARCHAR(20) NOT NULL,
    he_dao_tao VARCHAR(50) DEFAULT 'Đại học chính quy 25',
    chuyen_nganh VARCHAR(100) DEFAULT 'Chuyên Ngành Chính',
    tong_tin_chi_yeu_cau INT DEFAULT 135,
    nam_ban_hanh INT DEFAULT 2023,
    quyet_dinh_ban_hanh VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG CHI TIẾT MÔN HỌC TRONG KHUNG CTĐT (Chuẩn 12 cột)
DROP TABLE IF EXISTS ctdt_hoc_phan;
CREATE TABLE ctdt_hoc_phan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chuong_trinh_dao_tao_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    hoc_ky_goi_y INT NOT NULL DEFAULT 1,
    khoi_kien_thuc ENUM('DaiCuong', 'CoSoNganh', 'ChuyenNganh', 'TotNghiep') DEFAULT 'CoSoNganh',
    loai_hoc_phan ENUM('BatBuoc', 'TuChon') DEFAULT 'BatBuoc',
    so_tiet INT DEFAULT 45,
    dieu_kien_tien_quyet VARCHAR(200),
    nhom_tu_chon VARCHAR(20),
    ghi_chu VARCHAR(255),
    de_cuong_url VARCHAR(255),
    mon_tien_quyet_id INT NULL,
    FOREIGN KEY (chuong_trinh_dao_tao_id) REFERENCES chuong_trinh_dao_tao(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc(id),
    FOREIGN KEY (mon_tien_quyet_id) REFERENCES mon_hoc(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG LỚP HỌC PHẦN (Tích hợp thông tin học kỳ)
DROP TABLE IF EXISTS lop_hoc_phan;
CREATE TABLE lop_hoc_phan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mon_hoc_id INT NOT NULL,
    giang_vien_id INT NOT NULL,
    ma_lhp VARCHAR(50) NOT NULL UNIQUE,
    ten_lhp VARCHAR(150) NOT NULL,
    hoc_ky VARCHAR(20) NOT NULL DEFAULT 'HK1',
    nam_hoc VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    phong_hoc_mac_dinh VARCHAR(50) DEFAULT 'P.302',
    so_luong_toi_da INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc(id),
    FOREIGN KEY (giang_vien_id) REFERENCES giang_vien(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG BUỔI HỌC (Lịch dạy & Kích hoạt Face AI)
DROP TABLE IF EXISTS buoi_hoc;
CREATE TABLE buoi_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lop_hoc_phan_id INT NOT NULL,
    ngay_hoc DATE NOT NULL,
    ca_hoc INT NOT NULL DEFAULT 1,
    gio_bat_dau TIME NOT NULL DEFAULT '07:30:00',
    gio_ket_thuc TIME NOT NULL DEFAULT '11:30:00',
    phong_hoc VARCHAR(50) DEFAULT 'P.302',
    chu_de_bai_hoc VARCHAR(255),
    trang_thai_diem_danh ENUM('ChuaDiemDanh', 'DangDiemDanh', 'DaDong') DEFAULT 'ChuaDiemDanh',
    FOREIGN KEY (lop_hoc_phan_id) REFERENCES lop_hoc_phan(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BẢNG ĐIỂM DANH FACE AI (Nhật ký nhận diện khuôn mặt)
DROP TABLE IF EXISTS diem_danh_nhan_dien;
CREATE TABLE diem_danh_nhan_dien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buoi_hoc_id INT NOT NULL,
    sinh_vien_id INT NOT NULL,
    thoi_gian_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('CoMat', 'Muon', 'Vang') DEFAULT 'Vang',
    phuong_thuc ENUM('FaceAI', 'ManualTeacher') DEFAULT 'FaceAI',
    confidence_score FLOAT DEFAULT NULL,
    anh_capture_url VARCHAR(255) DEFAULT NULL,
    ghi_chu VARCHAR(200) DEFAULT NULL,
    FOREIGN KEY (buoi_hoc_id) REFERENCES buoi_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BẢNG ĐĂNG KÝ HỌC PHẦN, BẢNG ĐIỂM & LỊCH THI
DROP TABLE IF EXISTS dang_ky_va_ket_qua;
CREATE TABLE dang_ky_va_ket_qua (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    lop_hoc_phan_id INT NOT NULL,
    ngay_dang_ky TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dieu_kien_du_thi BOOLEAN DEFAULT TRUE,
    
    -- Kết quả điểm số (Gộp bang_diem_sinh_vien)
    diem_chuyen_can FLOAT DEFAULT NULL,
    diem_giua_ky FLOAT DEFAULT NULL,
    diem_cuoi_ky FLOAT DEFAULT NULL,
    diem_tong_ket_he10 FLOAT DEFAULT NULL,
    diem_tong_ket_he4 FLOAT DEFAULT NULL,
    diem_chu VARCHAR(5) DEFAULT NULL,
    ket_qua ENUM('ChuaXet', 'Dat', 'KhongDat') DEFAULT 'ChuaXet',
    
    -- Lịch thi (Gộp ca_thi & sinh_vien_ca_thi)
    ngay_thi DATE DEFAULT NULL,
    gio_thi TIME DEFAULT NULL,
    phong_thi VARCHAR(50) DEFAULT NULL,
    so_bao_danh VARCHAR(20) DEFAULT NULL,
    
    ghi_chu VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id),
    FOREIGN KEY (lop_hoc_phan_id) REFERENCES lop_hoc_phan(id),
    UNIQUE KEY uq_sv_lhp (sinh_vien_id, lop_hoc_phan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13 (MỞ RỘNG). SỔ THEO DÕI HỌC VỤ & HỌC PHÍ THEO HỌC KỲ
DROP TABLE IF EXISTS so_hoc_vu;
CREATE TABLE so_hoc_vu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    hoc_ky VARCHAR(20) NOT NULL,
    
    -- Học phí
    hoc_phi_phai_dong DECIMAL(12,2) DEFAULT 0,
    hoc_phi_da_dong DECIMAL(12,2) DEFAULT 0,
    trang_thai_hoc_phi ENUM('DaHoanThanh', 'ConNo') DEFAULT 'ConNo',
    
    -- Học vụ & Rèn luyện
    diem_ren_luyen INT DEFAULT 80,
    xep_loai_ren_luyen VARCHAR(30) DEFAULT 'Tot',
    canh_bao_hoc_vu ENUM('BinhThuong', 'CanhBao_Muc1', 'CanhBao_Muc2', 'DinhChi') DEFAULT 'BinhThuong',
    ly_do_canh_bao TEXT,
    khen_thuong_ky_luat TEXT,
    
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id),
    UNIQUE KEY uq_sv_hk (sinh_vien_id, hoc_ky)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
