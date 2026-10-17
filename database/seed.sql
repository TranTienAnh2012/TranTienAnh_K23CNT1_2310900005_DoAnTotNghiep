-- ==========================================================
-- SMARTEDU SEED DATA
-- Mật khẩu mặc định cho các tài khoản là: 123456
-- Hash bcrypt 10 rounds: $2a$10$wT0XkOvhzZ/U7P1N0a3JcOeK9cK3vB1Z6wF3B7A8N8K1D6A7B8C9D (hoặc tương đương)
-- ==========================================================

USE smart_edu_db;

-- 1. Tài khoản users
-- Password hash: $2a$10$m67xP6i.2tK8RkHqC0rVp.cZg2W8e0f6j4n9u7x1l5p8m3q2w7e1r (123456)
INSERT INTO users (id, username, password_hash, role, is_active, is_deleted) VALUES
(1, 'admin', '$2a$10$m67xP6i.2tK8RkHqC0rVp.cZg2W8e0f6j4n9u7x1l5p8m3q2w7e1r', 'admin', 1, 0),
(2, 'gv01', '$2a$10$m67xP6i.2tK8RkHqC0rVp.cZg2W8e0f6j4n9u7x1l5p8m3q2w7e1r', 'teacher', 1, 0),
(3, 'sv01', '$2a$10$m67xP6i.2tK8RkHqC0rVp.cZg2W8e0f6j4n9u7x1l5p8m3q2w7e1r', 'student', 1, 0),
(4, 'sv02', '$2a$10$m67xP6i.2tK8RkHqC0rVp.cZg2W8e0f6j4n9u7x1l5p8m3q2w7e1r', 'student', 1, 0)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 2. Bảng khoa
INSERT INTO khoa (id, ma_khoa, ten_khoa, so_dien_thoai, is_active, is_deleted) VALUES
(1, 'CNTT', 'Khoa Công nghệ Thông tin', '02438691234', 1, 0),
(2, 'DTVT', 'Khoa Điện tử Viễn thông', '02438695678', 1, 0),
(3, 'KT', 'Khoa Kinh tế & Quản lý', '02438699012', 1, 0)
ON DUPLICATE KEY UPDATE ten_khoa = VALUES(ten_khoa);

-- 3. Bảng giang_vien
INSERT INTO giang_vien (id, user_id, ma_gv, ho_ten, email, khoa_id, is_active, is_deleted) VALUES
(1, 2, 'GV001', 'TS. Nguyễn Văn Hùng', 'hung.nv@smartedu.edu.vn', 1, 1, 0)
ON DUPLICATE KEY UPDATE ho_ten = VALUES(ho_ten);

-- 4. Bảng lop
INSERT INTO lop (id, ma_lop, ten_lop, khoa_hoc, khoa_id, is_active, is_deleted) VALUES
(1, 'K23CNT1', 'K23 Công nghệ Thông tin 1', 'K23 (2023-2027)', 1, 1, 0),
(2, 'K23CNT2', 'K23 Công nghệ Thông tin 2', 'K23 (2023-2027)', 1, 1, 0)
ON DUPLICATE KEY UPDATE ten_lop = VALUES(ten_lop);

-- 5. Bảng sinh_vien
INSERT INTO sinh_vien (id, user_id, ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, lop_id, is_active, is_deleted) VALUES
(1, 3, '2310900005', 'Trần Tiến Anh', '2004-05-15', 'Nam', 'tienanh.tran@smartedu.edu.vn', 1, 1, 0),
(2, 4, '2310900006', 'Lê Thị Mai', '2004-08-20', 'Nu', 'mai.le@smartedu.edu.vn', 1, 1, 0)
ON DUPLICATE KEY UPDATE ho_ten = VALUES(ho_ten);

-- 6. Bảng mon_hoc
INSERT INTO mon_hoc (id, ma_mon, ten_mon, so_tin_chi, khoa_id, is_active, is_deleted) VALUES
(1, 'IT301', 'Trí tuệ nhân tạo & Thị giác máy tính', 3, 1, 1, 0),
(2, 'IT302', 'Phát triển ứng dụng Web nâng cao', 3, 1, 1, 0),
(3, 'IT303', 'Hệ quản trị cơ sở dữ liệu phân tán', 3, 1, 1, 0)
ON DUPLICATE KEY UPDATE ten_mon = VALUES(ten_mon);

-- 7. Bảng hoc_ky
INSERT INTO hoc_ky (id, ten_hoc_ky, nam_hoc, ngay_bat_dau, ngay_ket_thuc, is_active, is_deleted) VALUES
(1, 'Học kỳ 1', '2025-2026', '2025-09-01', '2026-01-15', 0, 0),
(2, 'Học kỳ 2', '2025-2026', '2026-02-01', '2026-06-30', 1, 0)
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

-- 8. Bảng lop_hoc_phan
INSERT INTO lop_hoc_phan (id, ma_lhp, ten_lhp, mon_hoc_id, hoc_ky_id, giang_vien_id, phong_hoc_mac_dinh, is_active, is_deleted) VALUES
(1, 'LHP_IT301_01', 'Trí tuệ nhân tạo (Lớp 01)', 1, 2, 1, 'P.502 - Nhà A1', 1, 0),
(2, 'LHP_IT302_01', 'Lập trình Web nâng cao (Lớp 01)', 2, 2, 1, 'Lab 305 - Nhà C2', 1, 0)
ON DUPLICATE KEY UPDATE ten_lhp = VALUES(ten_lhp);

-- 9. Bảng buoi_hoc
INSERT INTO buoi_hoc (id, lop_hoc_phan_id, ngay_hoc, ca_hoc, phong_hoc, ghi_chu, is_active, is_deleted) VALUES
(1, 1, CURDATE(), 'Ca 2 (09:15 - 11:45)', 'P.502 - Nhà A1', 'Điểm danh buổi thực hành nhận diện khuôn mặt', 1, 0),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Ca 2 (09:15 - 11:45)', 'P.502 - Nhà A1', 'Kiểm tra giữa kỳ', 1, 0),
(3, 2, CURDATE(), 'Ca 3 (13:00 - 15:30)', 'Lab 305 - Nhà C2', 'Buổi học React & Express', 1, 0)
ON DUPLICATE KEY UPDATE phong_hoc = VALUES(phong_hoc);

-- 10. Bảng ca_thi
INSERT INTO ca_thi (id, mon_hoc_id, hoc_ky_id, ngay_thi, gio_bat_dau, gio_ket_thuc, phong_thi, is_active, is_deleted) VALUES
(1, 1, 2, CURDATE(), '08:00:00', '10:00:00', 'P.Thi 401 - Nhà B1', 1, 0),
(2, 2, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '16:00:00', 'P.Thi 402 - Nhà B1', 1, 0)
ON DUPLICATE KEY UPDATE phong_thi = VALUES(phong_thi);

-- 11. Bảng sinh_vien_ca_thi
INSERT INTO sinh_vien_ca_thi (id, ca_thi_id, sinh_vien_id, so_bao_danh, vi_tri_ngoi, trang_thai) VALUES
(1, 1, 1, 'SBD001', 'Bàn 01 - Dãy A', 'not_checkin'),
(2, 1, 2, 'SBD002', 'Bàn 02 - Dãy A', 'not_checkin')
ON DUPLICATE KEY UPDATE so_bao_danh = VALUES(so_bao_danh);
