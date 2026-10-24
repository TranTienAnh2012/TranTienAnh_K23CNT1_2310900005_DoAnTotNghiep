# KẾ HOẠCH TỐI ƯU HÓA CƠ SỞ DỮ LIỆU SMARTEDU (TỪ 30 BẢNG XUỐNG 12 BẢNG)
> **Đề tài:** Hệ thống Quản lý Đào tạo & Điểm danh Sinh viên bằng Nhận diện Khuôn mặt (SmartEdu)  
> **Sinh viên thực hiện:** Trần Tiến Anh - K23CNT1 - 2310900005  
> **Mục tiêu:** Tinh giản cấu trúc CSDL từ 30 bảng xuống **12 bảng cốt lõi**, chuẩn hóa mô hình ERD phục vụ bảo vệ đồ án tốt nghiệp, **giữ nguyên 100% nghiệp vụ quản lý theo Khoa, hồ sơ cá nhân, khung CTĐT, điểm danh Face AI và API contracts trên Backend/Frontend**.

---

## I. TẠI SAO PHẢI TỐI ƯU VÀ NGUYÊN TẮC GIỮ NGUYÊN NGHIỆP VỤ

### 1. Vấn đề của CSDL 30 bảng hiện tại khi bảo vệ Đồ án
1. **Phân mảnh 1-1 quá đà (Over-normalization):** 
   - Một sinh viên nhưng bị xé nhỏ ra 4 bảng: `sinh_vien`, `ho_so_sinh_vien`, `thong_tin_tuyen_sinh`, `quan_he_gia_dinh`.
   - Giảng viên và Quản lý khoa bị tách đôi: `giang_vien` và `quan_ly_khoa` trong khi Quản lý khoa thực chất là giảng viên/cán bộ thuộc Khoa có chức vụ Trưởng khoa/Phó khoa/Giáo vụ.
2. **Trùng lặp quan hệ N-N:**
   - Cả 2 bảng `dang_ky_hoc_phan` và `sinh_vien_lhp` đều làm cùng một nhiệm vụ: gắn sinh viên vào lớp học phần.
   - Bảng điểm `bang_diem_sinh_vien` tách riêng với `dang_ky_hoc_phan` khiến mọi thao tác xem điểm, nhập điểm đều phải JOIN phức tạp.
3. **Phân tán tiện ích học vụ:**
   - `cong_no_hoc_phi` và `dinh_muc_hoc_phi` tách rời.
   - `canh_bao_hoc_vu`, `diem_ren_luyen`, `khen_thuong_ky_luat`, `y_kien_sinh_vien` mỗi mục 1 bảng nhỏ lẻ (0 - 2 bản ghi), làm biểu đồ ERD bị rối mắt.

### 2. Nguyên tắc bất di bất dịch khi tối ưu hóa
> [!IMPORTANT]
> - **Giữ nguyên 100% phân quyền theo Khoa:** Cán bộ Khoa nào chỉ xem và quản lý dữ liệu Sinh viên, Giảng viên, Lớp học phần, Khung CTĐT của Khoa đó. Admin toàn quyền quản lý toàn trường.
> - **Giữ nguyên 100% API Contracts (Routes & Response):** Frontend không cần sửa bất kỳ dòng code nào. Tất cả URL `/api/faculty/...`, `/api/student/...`, `/api/admin/...` và format JSON trả về giữ nguyên tuyệt đối.
> - **Chỉ thay đổi câu lệnh SQL bên trong Backend:** Thay vì SELECT/INSERT qua 4-5 bảng rời rạc, Backend sẽ query trực tiếp trên 12 bảng đã được gom nhóm thông minh.

---

## II. MA TRẬN RÚT GỌN: TỪ 30 BẢNG CŨ SANG 12 BẢNG MỚI

| STT | Bảng Mới Tinh Gọn (12 Bảng) | Các Bảng Cũ Được Hợp Nhất (30 Bảng) | Vai trò & Nghiệp vụ Giữ lại |
| :---: | :--- | :--- | :--- |
| **1** | **`khoa`** | `khoa` | Quản lý các Khoa đào tạo (Khoa CNTT, Ngoại ngữ, Kinh tế...). |
| **2** | **`lop`** | `lop`, `nganh_hoc` | Quản lý Lớp chuyên ngành thuộc Khoa, tích hợp thông tin Ngành và Khóa học. |
| **3** | **`users`** | `users` | Tài khoản xác thực đăng nhập (username, password_hash, role, status). |
| **4** | **`giang_vien`** | `giang_vien`, `quan_ly_khoa` | **Hồ sơ Giảng viên & Cán bộ Quản lý Khoa** (có `khoa_id`, chức vụ, Face AI). |
| **5** | **`sinh_vien`** | `sinh_vien`, `ho_so_sinh_vien`, `thong_tin_tuyen_sinh`, `quan_he_gia_dinh` | **Hồ sơ Sinh viên toàn diện theo Khoa/Lớp**: Lý lịch cá nhân, CCCD, Bố mẹ, Tuyển sinh & **Face Embedding AI**. |
| **6** | **`mon_hoc`** | `mon_hoc` | Danh mục toàn bộ môn học trong trường. |
| **7** | **`chuong_trinh_dao_tao`** | `chuong_trinh_dao_tao` | Khung CTĐT ban hành theo Khoa, Khóa tuyển sinh, Hệ đào tạo và Chuyên ngành. |
| **8** | **`ctdt_hoc_phan`** | `ctdt_hoc_phan` | Danh mục 12 cột chuẩn môn học trong Khung CTĐT (Kỳ học, Số tiết, Bắt buộc/Tự chọn, Nhóm, Tiên quyết). |
| **9** | **`lop_hoc_phan`** | `lop_hoc_phan`, `hoc_ky` | Lớp học phần mở theo từng học kỳ cho sinh viên đăng ký, gắn Giảng viên phụ trách. |
| **10** | **`buoi_hoc`** | `buoi_hoc` | Lịch dạy, phòng học, ca học và trạng thái kích hoạt điểm danh Face AI của từng buổi. |
| **11** | **`diem_danh_nhan_dien`** | `lich_su_diem_danh` | **Nhật ký điểm danh Face AI**: Sinh viên, Độ tin cậy (Confidence), Ảnh check-in, Thời gian, Trạng thái (Có mặt / Muộn / Vắng). |
| **12** | **`dang_ky_va_ket_qua`** | `dang_ky_hoc_phan`, `sinh_vien_lhp`, `bang_diem_sinh_vien`, `ca_thi`, `sinh_vien_ca_thi` | Hợp nhất: Đăng ký học phần + Bảng điểm thành phần (chuyên cần, giữa kỳ, cuối kỳ, tổng kết) + Lịch thi của SV. |
| **+** | **`so_hoc_vu`** *(Mở rộng)* | `cong_no_hoc_phi`, `dinh_muc_hoc_phi`, `canh_bao_hoc_vu`, `diem_ren_luyen`, `khen_thuong_ky_luat`, `y_kien_sinh_vien`, `tong_ket_hoc_ky` | Sổ theo dõi học kỳ của SV: Học phí (phải nộp, đã nộp), Điểm rèn luyện, Mức cảnh báo học vụ, Khen thưởng/Kỷ luật. |

> **Tổng kết:** Từ 30 bảng cồng kềnh $\rightarrow$ Gom lại thành **12 bảng nghiệp vụ cốt lõi** (hoặc 13 bảng nếu tách riêng bảng Sổ học vụ). Giảm **60% số lượng bảng**, triệt tiêu toàn bộ quan hệ dư thừa!

---

## III. THIẾT KẾ CSDL CHI TIẾT 12 BẢNG (CHUẨN BẢO VỆ ĐỒ ÁN)

### 1. Bảng `khoa` (Đơn vị Đào tạo)
Quản lý các khoa trong trường, làm gốc rễ cho toàn bộ phân quyền quản lý theo Khoa.
```sql
CREATE TABLE khoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_khoa VARCHAR(20) NOT NULL UNIQUE,       -- VD: 'CNTT', 'KT', 'NN'
    ten_khoa VARCHAR(100) NOT NULL,            -- VD: 'Khoa Công nghệ Thông tin'
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);
```

### 2. Bảng `lop` (Lớp Chuyên ngành & Hành chính)
Gộp bảng `nganh_hoc` vào `lop` giúp giảm 1 bảng mà vẫn quản lý chuẩn xác Ngành và Khoa.
```sql
CREATE TABLE lop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,                      -- Thuộc Khoa nào
    ma_lop VARCHAR(30) NOT NULL UNIQUE,        -- VD: 'K23CNT1'
    ten_lop VARCHAR(100) NOT NULL,             -- VD: 'Lớp K23 Công nghệ thông tin 1'
    ma_nganh VARCHAR(20) NOT NULL,             -- VD: '7480201' (CNTT)
    ten_nganh VARCHAR(100) NOT NULL,           -- VD: 'Công nghệ thông tin'
    khoa_hoc VARCHAR(20) NOT NULL,             -- VD: 'K23', '2023'
    he_dao_tao VARCHAR(50) DEFAULT 'Đại học chính quy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
);
```

### 3. Bảng `users` (Tài khoản & Xác thực Toàn trường)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,      -- Mã SV / Mã GV / Tên đăng nhập Admin
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty_manager', 'teacher', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Bảng `giang_vien` (Hồ sơ Giảng viên & Cán bộ Quản lý Khoa)
Hợp nhất `giang_vien` và `quan_ly_khoa`: Giảng viên có thêm trường `chuc_vu` ('TruongKhoa', 'PhoKhoa', 'GiaoVu', 'GiangVien'). Khi phân quyền, nếu `chuc_vu` khác 'GiangVien' thì có quyền Quản lý Khoa!
```sql
CREATE TABLE giang_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    khoa_id INT NOT NULL,                      -- Thuộc Khoa nào (Phân quyền theo khoa)
    ma_gv VARCHAR(20) NOT NULL UNIQUE,         -- VD: 'GV001'
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    hoc_ham_hoc_vi VARCHAR(50) DEFAULT 'Thạc sĩ',
    chuc_vu ENUM('GiangVien', 'GiaoVu', 'PhoKhoa', 'TruongKhoa') DEFAULT 'GiangVien',
    chuyen_mon VARCHAR(150),
    avatar_url VARCHAR(255),
    face_embedding JSON,                       -- AI Face Embedding của GV
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
);
```

### 5. Bảng `sinh_vien` (Hồ sơ Sinh viên Toàn diện & Nhận diện Khuôn mặt AI)
Hợp nhất 4 bảng (`sinh_vien`, `ho_so_sinh_vien`, `thong_tin_tuyen_sinh`, `quan_he_gia_dinh`). Quản lý sinh viên theo Khoa (thông qua `lop.khoa_id`).
```sql
CREATE TABLE sinh_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    lop_id INT NOT NULL,                       -- Xác định Sinh viên thuộc Lớp và Khoa nào
    ma_sv VARCHAR(20) NOT NULL UNIQUE,         -- VD: '2310900005'
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh ENUM('Nam', 'Nu', 'Khac') DEFAULT 'Nam',
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    so_cmnd_cccd VARCHAR(20),
    avatar_url VARCHAR(255),
    
    -- TRỌNG TÂM FACE AI
    face_embedding JSON,                       -- Vector đặc trưng khuôn mặt (128D/512D)
    face_registered_at TIMESTAMP NULL,
    
    -- SƠ YẾU LÝ LỊCH TOÀN DIỆN (Gộp bảng gia đình, tuyển sinh)
    dia_chi_thuong_tru TEXT,
    que_quan VARCHAR(150),
    dan_toc VARCHAR(30) DEFAULT 'Kinh',
    ton_giao VARCHAR(30) DEFAULT 'Không',
    thong_tin_gia_dinh JSON,                   -- [ { quan_he: 'Bo', ho_ten: '...', sdt: '...', nghe_nghiep: '...' }, { quan_he: 'Me', ... } ]
    thong_tin_tuyen_sinh JSON,                 -- { nam_tot_nghiep_c3: 2023, truong_thpt: '...', khoi_thi: 'A00', diem_thi: 24.5 }
    
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lop_id) REFERENCES lop(id)
);
```

### 6. Bảng `mon_hoc` (Danh mục Môn học Toàn trường)
```sql
CREATE TABLE mon_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,                      -- Khoa chuyên môn phụ trách môn
    ma_mon VARCHAR(20) NOT NULL UNIQUE,        -- VD: 'FL01-J101', 'CSN27'
    ten_mon VARCHAR(150) NOT NULL,             -- VD: 'Tiếng Nhật Sơ cấp 1.1'
    so_tin_chi INT NOT NULL DEFAULT 3,
    so_tiet INT DEFAULT 45,
    loai_mon ENUM('LyThuyet', 'ThucHanh', 'DoAn') DEFAULT 'LyThuyet',
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
);
```

### 7. Bảng `chuong_trinh_dao_tao` (Khung CTĐT Ban hành theo Khoa & Khóa)
```sql
CREATE TABLE chuong_trinh_dao_tao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_id INT NOT NULL,                      -- Quản lý theo Khoa
    nganh_hoc_ten VARCHAR(100) NOT NULL,       -- VD: 'Công nghệ thông tin'
    ma_ctdt VARCHAR(50) NOT NULL UNIQUE,       -- VD: 'CTDT_CNTT_K23'
    ten_ctdt VARCHAR(255) NOT NULL,
    khoa_tuyen_sinh VARCHAR(20) NOT NULL,      -- VD: '2023', 'K23'
    he_dao_tao VARCHAR(50) DEFAULT 'Đại học chính quy 25',
    chuyen_nganh VARCHAR(100) DEFAULT 'Chuyên Ngành Chính',
    tong_tin_chi_yeu_cau INT DEFAULT 135,
    nam_ban_hanh INT DEFAULT 2023,
    quyet_dinh_ban_hanh VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (khoa_id) REFERENCES khoa(id)
);
```

### 8. Bảng `ctdt_hoc_phan` (Chi tiết 12 cột Môn học trong Khung CTĐT)
```sql
CREATE TABLE ctdt_hoc_phan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chuong_trinh_dao_tao_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    hoc_ky_goi_y INT NOT NULL DEFAULT 1,       -- Kỳ 1 đến 8
    khoi_kien_thuc ENUM('DaiCuong', 'CoSoNganh', 'ChuyenNganh', 'TotNghiep') DEFAULT 'CoSoNganh',
    loai_hoc_phan ENUM('BatBuoc', 'TuChon') DEFAULT 'BatBuoc',
    so_tiet INT DEFAULT 45,
    dieu_kien_tien_quyet VARCHAR(200),         -- VD: 'Tiên quyết : Toán cao cấp 1&2'
    nhom_tu_chon VARCHAR(20),                  -- VD: '10', '2'
    ghi_chu VARCHAR(255),
    de_cuong_url VARCHAR(255),
    mon_tien_quyet_id INT NULL,
    FOREIGN KEY (chuong_trinh_dao_tao_id) REFERENCES chuong_trinh_dao_tao(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc(id),
    FOREIGN KEY (mon_tien_quyet_id) REFERENCES mon_hoc(id)
);
```

### 9. Bảng `lop_hoc_phan` (Lớp Học Phần Mở theo Học kỳ)
Tích hợp học kỳ và năm học vào trực tiếp bảng, loại bỏ bảng `hoc_ky` riêng biệt.
```sql
CREATE TABLE lop_hoc_phan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mon_hoc_id INT NOT NULL,
    giang_vien_id INT NOT NULL,                -- Giảng viên giảng dạy
    ma_lhp VARCHAR(50) NOT NULL UNIQUE,        -- VD: 'LHP_CSN27_HK1_2024'
    ten_lhp VARCHAR(150) NOT NULL,
    hoc_ky VARCHAR(20) NOT NULL,               -- VD: 'HK1_2024_2025'
    nam_hoc VARCHAR(20) NOT NULL,              -- VD: '2024-2025'
    so_luong_toi_da INT DEFAULT 60,
    phong_hoc_mac_dinh VARCHAR(50) DEFAULT 'P.302',
    trang_thai ENUM('DangMo', 'DangHoc', 'DaKetThuc', 'DaHuy') DEFAULT 'DangHoc',
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc(id),
    FOREIGN KEY (giang_vien_id) REFERENCES giang_vien(id)
);
```

### 10. Bảng `buoi_hoc` (Lịch dạy & Kích hoạt Face AI Check-in)
```sql
CREATE TABLE buoi_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lop_hoc_phan_id INT NOT NULL,
    ngay_hoc DATE NOT NULL,
    ca_hoc INT NOT NULL,                       -- Ca 1, 2, 3...
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    phong_hoc VARCHAR(50),
    chu_de_bai_hoc VARCHAR(255),
    trang_thai_diem_danh ENUM('ChuaDiemDanh', 'DangDiemDanh', 'DaDong') DEFAULT 'ChuaDiemDanh',
    FOREIGN KEY (lop_hoc_phan_id) REFERENCES lop_hoc_phan(id) ON DELETE CASCADE
);
```

### 11. Bảng `diem_danh_nhan_dien` (Nhật ký Điểm danh bằng Khuôn mặt AI)
```sql
CREATE TABLE diem_danh_nhan_dien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buoi_hoc_id INT NOT NULL,
    sinh_vien_id INT NOT NULL,
    thoi_gian_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('CoMat', 'Muon', 'Vang') DEFAULT 'Vang',
    phuong_thuc ENUM('FaceAI', 'ManualTeacher') DEFAULT 'FaceAI',
    confidence_score FLOAT,                    -- Độ tương đồng AI (0.85, 0.92...)
    anh_capture_url VARCHAR(255),              -- Ảnh khuôn mặt lúc check-in
    ghi_chu VARCHAR(200),
    FOREIGN KEY (buoi_hoc_id) REFERENCES buoi_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id)
);
```

### 12. Bảng `dang_ky_va_ket_qua` (Hợp nhất Đăng ký học, Bảng điểm & Lịch thi)
Bảng trung tâm kết quả học tập của Sinh viên, giải quyết triệt để 5 bảng cũ (`dang_ky_hoc_phan`, `sinh_vien_lhp`, `bang_diem_sinh_vien`, `ca_thi`, `sinh_vien_ca_thi`).
```sql
CREATE TABLE dang_ky_va_ket_qua (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    lop_hoc_phan_id INT NOT NULL,
    ngay_dang_ky TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- KẾT QUẢ ĐIỂM SỐ
    diem_chuyen_can FLOAT DEFAULT NULL,
    diem_giua_ky FLOAT DEFAULT NULL,
    diem_cuoi_ky FLOAT DEFAULT NULL,
    diem_tong_ket FLOAT DEFAULT NULL,
    diem_chu VARCHAR(5) DEFAULT NULL,          -- 'A', 'B+', 'C', 'F'
    ket_qua ENUM('ChuaXet', 'Dat', 'KhongDat') DEFAULT 'ChuaXet',
    
    -- LỊCH THI CỦA SINH VIÊN (Tích hợp từ bảng ca_thi)
    ngay_thi DATE DEFAULT NULL,
    gio_thi TIME DEFAULT NULL,
    phong_thi VARCHAR(50) DEFAULT NULL,
    so_bao_danh VARCHAR(20) DEFAULT NULL,
    hinh_thuc_thi VARCHAR(50) DEFAULT 'TuLuan',
    
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id),
    FOREIGN KEY (lop_hoc_phan_id) REFERENCES lop_hoc_phan(id),
    UNIQUE KEY uq_sv_lhp (sinh_vien_id, lop_hoc_phan_id)
);
```

### Bảng Mở rộng (Bổ trợ nếu cần lưu Học phí & Rèn luyện): Bảng `so_hoc_vu`
```sql
CREATE TABLE so_hoc_vu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT NOT NULL,
    hoc_ky VARCHAR(20) NOT NULL,               -- 'HK1_2024_2025'
    
    -- HỌC PHÍ (Gộp cong_no_hoc_phi + dinh_muc)
    hoc_phi_phai_dong DECIMAL(12,2) DEFAULT 0,
    hoc_phi_da_dong DECIMAL(12,2) DEFAULT 0,
    trang_thai_hoc_phi ENUM('DaHoanThanh', 'ConNo') DEFAULT 'ConNo',
    
    -- RÈN LUYỆN & HỌC VỤ (Gộp canh_bao_hoc_vu + diem_ren_luyen + khen_thuong)
    diem_ren_luyen INT DEFAULT 80,
    xep_loai_ren_luyen VARCHAR(30) DEFAULT 'Tot',
    canh_bao_hoc_vu ENUM('BinhThuong', 'CanhBao_Muc1', 'CanhBao_Muc2', 'DinhChi') DEFAULT 'BinhThuong',
    ly_do_canh_bao TEXT,
    khen_thuong_ky_luat TEXT,
    
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id),
    UNIQUE KEY uq_sv_hk (sinh_vien_id, hoc_ky)
);
```

---

## IV. BÀI TOÁN QUẢN LÝ THEO KHOA SAU KHI TỐI ƯU HÓA

Bạn hoàn toàn yên tâm vì **toàn bộ tính năng phân quyền theo Khoa vẫn chạy chính xác 100%**:

```
                       ┌─────────────────┐
                       │   Bảng KHOA     │
                       └────────┬────────┘
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
      [ lop ] (Khoa_id)   [ giang_vien ]     [ chuong_trinh_dao_tao ]
             │             (Khoa_id)            (Khoa_id)
             ▼
      [ sinh_vien ] 
    (Lop_id -> Khoa_id)
```

1. **Quản lý Giảng viên theo Khoa:**
   - Khi cán bộ Khoa CNTT (`khoa_id = 1`) đăng nhập:
     ```sql
     SELECT * FROM giang_vien WHERE khoa_id = 1 AND is_deleted = FALSE;
     ```
   - Cán bộ Khoa chỉ thấy danh sách giảng viên trong Khoa mình. Admin có thể xem toàn bộ hoặc lọc theo bất kỳ khoa nào.

2. **Quản lý Sinh viên & Sơ yếu lý lịch theo Khoa:**
   - Sinh viên thuộc về `lop`, mà `lop` có `khoa_id`.
   - Query lấy sinh viên của Khoa:
     ```sql
     SELECT sv.*, l.ma_lop, l.ten_lop, l.ten_nganh, k.ten_khoa
     FROM sinh_vien sv
     JOIN lop l ON sv.lop_id = l.id
     JOIN khoa k ON l.khoa_id = k.id
     WHERE l.khoa_id = ?;
     ```
   - Lấy sơ yếu lý lịch đầy đủ của sinh viên (bố mẹ, quê quán, điểm tuyển sinh): Không cần JOIN 4 bảng nữa, chỉ cần `SELECT thong_tin_gia_dinh, thong_tin_tuyen_sinh FROM sinh_vien WHERE id = ?`. Nhanh hơn gấp 4 lần!

3. **Quản lý Khung CTĐT theo Khoa:**
   - `chuong_trinh_dao_tao` liên kết trực tiếp với `khoa_id`. Khoa nào tự ban hành và quản lý khung đào tạo theo khóa của Khoa đó.

---

## V. CÁCH VIẾT LẠI TRUY VẤN SQL Ở BACKEND (API CONTRACTS GIỮ NGUYÊN)

Nhờ giữ nguyên cấu trúc JSON trả về của các Controller, **Frontend hoàn toàn không nhận ra database đã thay đổi**:

### Ví dụ 1: API Lấy Hồ sơ Sơ yếu lý lịch SV (`GET /api/faculty/students/:id/resume`)
- **Trước đây (Join 4 bảng):**
  - Query vào `sinh_vien` $\rightarrow$ Query vào `ho_so_sinh_vien` $\rightarrow$ Query vào `quan_he_gia_dinh` $\rightarrow$ Query vào `thong_tin_tuyen_sinh`.
- **Sau tối ưu:**
  ```javascript
  const [rows] = await pool.execute(
    `SELECT sv.*, l.ma_lop, l.ten_lop, l.ten_nganh, k.ten_khoa
     FROM sinh_vien sv
     JOIN lop l ON sv.lop_id = l.id
     JOIN khoa k ON l.khoa_id = k.id
     WHERE sv.id = ?`,
    [id]
  );
  const sv = rows[0];
  return res.json({
    success: true,
    data: {
      basicInfo: sv,
      personalDetail: { cccd: sv.so_cmnd_cccd, dia_chi: sv.dia_chi_thuong_tru, que_quan: sv.que_quan },
      family: sv.thong_tin_gia_dinh || [],
      admission: sv.thong_tin_tuyen_sinh || {}
    }
  });
  ```
  *(Dữ liệu trả về đúng y hệt Frontend mong đợi, nhưng database chỉ cần đúng 1 bảng `sinh_vien`).*

### Ví dụ 2: API Đăng ký môn & Bảng điểm (`GET /api/student/grades`)
- **Trước đây:** JOIN `dang_ky_hoc_phan` + `bang_diem_sinh_vien` + `sinh_vien_lhp`.
- **Sau tối ưu:** Query trực tiếp trên bảng `dang_ky_va_ket_qua`.

---

## VI. KẾ HOẠCH TRIỂN KHAI THEO 4 GIAI ĐOẠN

```
[ Giai đoạn 1 ] Tạo Script Migration (Tạo 12 bảng mới & Copy dữ liệu an toàn)
      │
[ Giai đoạn 2 ] Cập nhật SQL Queries trong Backend Controllers (Giữ nguyên Route & API Format)
      │
[ Giai đoạn 3 ] Kiểm thử toàn diện API (Postman / Test Suite) & Giao diện React
      │
[ Giai đoạn 4 ] Xuất sơ đồ ERD 12 bảng & Bàn giao tài liệu thuyết minh bảo vệ đồ án
```

### Kế hoạch an toàn dữ liệu:
1. Tạo một cơ sở dữ liệu mới (hoặc prefix `_v2`) để chạy thử nghiệm migration mà không đụng chạm đến database hiện tại.
2. Viết script `migrate_to_12_tables.js` tự động chuyển đổi toàn bộ 262 dòng dữ liệu từ 30 bảng cũ sang 12 bảng mới.
3. Khi kiểm thử thành công 100%, mới tiến hành switch kết nối DB.

---

> Bạn có thể duyệt kế hoạch này để chúng ta tiến hành tạo file script SQL tạo 12 bảng mới và file chuyển đổi dữ liệu tự động mà không làm gián đoạn hệ thống hiện tại!
