-- ==========================================================
-- SMARTEDU DATABASE SCHEMA
-- Hệ thống Quản lý Đào tạo tích hợp Nhận diện Khuôn mặt
-- ==========================================================

CREATE DATABASE IF NOT EXISTS smart_edu_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_edu_db;

-- 1. Bảng users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: Hoạt động, FALSE: Khóa tài khoản',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE: Đã xóa mềm',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng khoa
CREATE TABLE IF NOT EXISTS khoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_khoa VARCHAR(20) NOT NULL UNIQUE,
    ten_khoa VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng giang_vien
CREATE TABLE IF NOT EXISTS giang_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    ma_gv VARCHAR(20) NOT NULL UNIQUE,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    khoa_id INT NOT NULL,
    avatar_url VARCHAR(255) NULL,
    face_embedding JSON NULL,
    face_updated_at DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: Đang công tác, FALSE: Tạm nghỉ/Chuyển công tác',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_giangvien_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_giangvien_khoa FOREIGN KEY (khoa_id) 
        REFERENCES khoa(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng lop
CREATE TABLE IF NOT EXISTS lop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_lop VARCHAR(20) NOT NULL UNIQUE,
    ten_lop VARCHAR(100) NOT NULL,
    khoa_hoc VARCHAR(20) NOT NULL,
    khoa_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_lop_khoa FOREIGN KEY (khoa_id) 
        REFERENCES khoa(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng sinh_vien
CREATE TABLE IF NOT EXISTS sinh_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    ma_sv VARCHAR(20) NOT NULL UNIQUE,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE NOT NULL,
    gioi_tinh ENUM('Nam', 'Nu', 'Khac') NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    lop_id INT NOT NULL,
    avatar_url VARCHAR(255) NULL,
    face_embedding JSON NULL,
    face_updated_at DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: Đang theo học, FALSE: Bảo lưu/Thôi học',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_sinhvien_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sinhvien_lop FOREIGN KEY (lop_id) 
        REFERENCES lop(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng mon_hoc
CREATE TABLE IF NOT EXISTS mon_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_mon VARCHAR(20) NOT NULL UNIQUE,
    ten_mon VARCHAR(150) NOT NULL,
    so_tin_chi TINYINT NOT NULL,
    so_buoi_hoc TINYINT NOT NULL DEFAULT 15 COMMENT 'Số buổi học quy định của môn',
    khoa_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_monhoc_khoa FOREIGN KEY (khoa_id) 
        REFERENCES khoa(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng hoc_ky
CREATE TABLE IF NOT EXISTS hoc_ky (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_hoc_ky VARCHAR(50) NOT NULL,
    nam_hoc VARCHAR(20) NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Đánh dấu học kỳ hiện hành',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng lop_hoc_phan
CREATE TABLE IF NOT EXISTS lop_hoc_phan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_lhp VARCHAR(30) NOT NULL UNIQUE,
    ten_lhp VARCHAR(150) NOT NULL,
    mon_hoc_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    giang_vien_id INT NULL,
    phong_hoc_mac_dinh VARCHAR(50) NULL,
    so_luong_toi_da INT NOT NULL DEFAULT 50 COMMENT 'Sĩ số tối đa của lớp học phần',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: Đang mở, FALSE: Đã kết thúc/Đóng lớp',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_lhp_monhoc FOREIGN KEY (mon_hoc_id) 
        REFERENCES mon_hoc(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_lhp_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_lhp_giangvien FOREIGN KEY (giang_vien_id) 
        REFERENCES giang_vien(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.1. Bảng dang_ky_hoc_phan (Bảng trung gian quản lý sinh viên đăng ký lớp học phần)
CREATE TABLE IF NOT EXISTS dang_ky_hoc_phan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lop_hoc_phan_id INT NOT NULL,
    sinh_vien_id INT NOT NULL,
    ngay_dang_ky DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dieu_kien_du_thi ENUM('du_dieu_kien', 'cam_thi') NOT NULL DEFAULT 'du_dieu_kien' COMMENT 'Điều kiện dự thi cuối kỳ',
    phuong_thuc ENUM('admin', 'sinh_vien') NOT NULL DEFAULT 'admin' COMMENT 'admin: Admin gán, sinh_vien: SV tự đăng ký',
    ghi_chu VARCHAR(255) NULL,
    CONSTRAINT fk_dkhp_lhp FOREIGN KEY (lop_hoc_phan_id) 
        REFERENCES lop_hoc_phan(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_dkhp_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_lhp_sv (lop_hoc_phan_id, sinh_vien_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng buoi_hoc
CREATE TABLE IF NOT EXISTS buoi_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lop_hoc_phan_id INT NOT NULL,
    ngay_hoc DATE NOT NULL,
    ca_hoc VARCHAR(50) NOT NULL,
    phong_hoc VARCHAR(50) NOT NULL,
    ghi_chu TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: Cho phép điểm danh, FALSE: Khóa điểm danh',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_buoihoc_lhp FOREIGN KEY (lop_hoc_phan_id) 
        REFERENCES lop_hoc_phan(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng lich_su_diem_danh
CREATE TABLE IF NOT EXISTS lich_su_diem_danh (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buoi_hoc_id INT NOT NULL,
    sinh_vien_id INT NOT NULL,
    thoi_gian_checkin DATETIME NULL,
    similarity_score FLOAT NULL,
    captured_image_url VARCHAR(255) NULL,
    trang_thai ENUM('Present', 'Late', 'Absent') NOT NULL DEFAULT 'Absent',
    phuong_thuc ENUM('FaceAI', 'Manual_Override') NOT NULL DEFAULT 'FaceAI',
    CONSTRAINT fk_diemdanh_buoihoc FOREIGN KEY (buoi_hoc_id) 
        REFERENCES buoi_hoc(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_diemdanh_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_buoihoc_sinhvien (buoi_hoc_id, sinh_vien_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bảng ca_thi
CREATE TABLE IF NOT EXISTS ca_thi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mon_hoc_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    ngay_thi DATE NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    phong_thi VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: Mở cổng check-in, FALSE: Đóng cổng',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_cathi_monhoc FOREIGN KEY (mon_hoc_id) 
        REFERENCES mon_hoc(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cathi_hocky FOREIGN KEY (hoc_ky_id) 
        REFERENCES hoc_ky(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Bảng sinh_vien_ca_thi
CREATE TABLE IF NOT EXISTS sinh_vien_ca_thi (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ca_thi_id INT NOT NULL,
    sinh_vien_id INT NOT NULL,
    so_bao_danh VARCHAR(20) NOT NULL,
    vi_tri_ngoi VARCHAR(20) NULL,
    thoi_gian_checkin DATETIME NULL,
    similarity_score FLOAT NULL,
    captured_image_url VARCHAR(255) NULL,
    trang_thai ENUM('not_checkin', 'checkin', 'checkout', 'suspicious') NOT NULL DEFAULT 'not_checkin',
    CONSTRAINT fk_svcathi_cathi FOREIGN KEY (ca_thi_id) 
        REFERENCES ca_thi(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_svcathi_sinhvien FOREIGN KEY (sinh_vien_id) 
        REFERENCES sinh_vien(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_cathi_sinhvien (ca_thi_id, sinh_vien_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
