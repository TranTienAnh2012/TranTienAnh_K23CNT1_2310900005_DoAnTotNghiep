const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedExpandedData() {
  console.log('🌱 Đang tạo dữ liệu mẫu cho Quản lý Khoa & Chương trình đào tạo...');

  try {
    // 1. Tạo tài khoản Quản lý Khoa CNTT (khoacntt / 123456)
    const passwordHash = await bcrypt.hash('123456', 10);
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE username = ?', ['khoacntt']);

    let facultyUserId;
    if (existingUser.length === 0) {
      const [userRes] = await pool.execute(
        `INSERT INTO users (username, password_hash, role) VALUES ('khoacntt', ?, 'faculty_manager')`,
        [passwordHash]
      );
      facultyUserId = userRes.insertId;
      console.log('  + Đã tạo user khoacntt (id:', facultyUserId, ')');
    } else {
      facultyUserId = existingUser[0].id;
      await pool.execute("UPDATE users SET role = 'faculty_manager' WHERE id = ?", [facultyUserId]);
    }

    // 2. Thêm vào bảng quan_ly_khoa
    const [existingQlk] = await pool.execute('SELECT id FROM quan_ly_khoa WHERE user_id = ?', [facultyUserId]);
    if (existingQlk.length === 0) {
      await pool.execute(
        `INSERT INTO quan_ly_khoa (user_id, ma_can_bo, ho_ten, email, so_dien_thoai, khoa_id, chuc_vu)
         VALUES (?, 'CB_CNTT_01', 'ThS. Nguyễn Văn Khoa', 'trolykhoa.cntt@smartedu.edu.vn', '0912345678', 1, 'Trợ lý Giáo vụ Khoa CNTT')`,
        [facultyUserId]
      );
      console.log('  + Đã tạo thông tin cán bộ quan_ly_khoa');
    }

    // 3. Thêm ngành học ngành CNTT
    const [existingNganh] = await pool.execute("SELECT id FROM nganh_hoc WHERE ma_nganh = '7480201'");
    let nganhId;
    if (existingNganh.length === 0) {
      const [nganhRes] = await pool.execute(
        `INSERT INTO nganh_hoc (khoa_id, ma_nganh, ten_nganh, thoi_gian_dao_tao_nam, tong_tin_chi_yeu_cau)
         VALUES (1, '7480201', 'Công nghệ Thông tin', 4.0, 135)`
      );
      nganhId = nganhRes.insertId;
      console.log('  + Đã tạo ngành học Công nghệ Thông tin (id:', nganhId, ')');
    } else {
      nganhId = existingNganh[0].id;
    }

    // 4. Thêm khung Chương trình đào tạo K23
    const [existingCtdt] = await pool.execute("SELECT id FROM chuong_trinh_dao_tao WHERE ma_ctdt = 'CTDT_CNTT_K23'");
    let ctdtId;
    if (existingCtdt.length === 0) {
      const [ctdtRes] = await pool.execute(
        `INSERT INTO chuong_trinh_dao_tao (khoa_id, nganh_hoc_id, ma_ctdt, ten_ctdt, khoa_tuyen_sinh, nam_ban_hanh, quyet_dinh_ban_hanh, tong_tin_chi_yeu_cau)
         VALUES (1, ?, 'CTDT_CNTT_K23', 'Chương trình Đào tạo Đại học Chính quy ngành CNTT Khóa 23', 'K23', 2023, 'QĐ số 1205/QĐ-ĐHNT', 135)`,
        [nganhId]
      );
      ctdtId = ctdtRes.insertId;
      console.log('  + Đã tạo khung CTĐT CTDT_CNTT_K23 (id:', ctdtId, ')');
    } else {
      ctdtId = existingCtdt[0].id;
    }

    // 5. Thêm các môn học vào khung CTĐT
    const [allCourses] = await pool.execute('SELECT id, ma_mon, ten_mon FROM mon_hoc LIMIT 8');
    if (allCourses.length > 0) {
      for (let i = 0; i < allCourses.length; i++) {
        const c = allCourses[i];
        const hocKy = Math.floor(i / 3) + 1;
        const khoiKT = i < 2 ? 'DaiCuong' : (i < 5 ? 'CoSoNganh' : 'ChuyenNganh');
        await pool.execute(
          `INSERT INTO ctdt_hoc_phan (chuong_trinh_dao_tao_id, mon_hoc_id, hoc_ky_goi_y, khoi_kien_thuc, loai_hoc_phan)
           VALUES (?, ?, ?, ?, 'BatBuoc')
           ON DUPLICATE KEY UPDATE hoc_ky_goi_y = VALUES(hoc_ky_goi_y)`,
          [ctdtId, c.id, hocKy, khoiKT]
        );
      }
      console.log('  + Đã gán', allCourses.length, 'môn học vào khung CTĐT');
    }

    // 6. Cập nhật hồ sơ sơ yếu lý lịch mẫu cho sinh viên đầu tiên (Trần Tiến Anh - Ninh Bình)
    const [students] = await pool.execute('SELECT id, ma_sv, ho_ten FROM sinh_vien LIMIT 1');
    if (students.length > 0) {
      const sv = students[0];
      await pool.execute(
        `INSERT INTO ho_so_sinh_vien (
          sinh_vien_id, so_cmnd_cccd, noi_sinh, que_quan, quoc_tich, dan_toc, ton_giao,
          so_dien_thoai_ca_nhan, dia_chi_thuong_tru, xa_phuong, quan_huyen, tinh_thanh_pho,
          dia_chi_tam_tru_hien_nay, dia_chi_bao_tin
        ) VALUES (?, '037205001234', 'Ninh Bình', 'Gia Lạc, Gia Viễn, Ninh Bình', 'Việt Nam', 'Kinh', 'Không',
          '0345862097', 'Xóm 2, Thôn Mai Sơn', 'Xã Gia Lạc', 'Huyện Gia Viễn', 'Tỉnh Ninh Bình',
          'Ký túc xá Đại học / Nhà trọ sinh viên', 'Bố mẹ: Xóm 2, Thôn Mai Sơn, Xã Gia Lạc, H. Gia Viễn, T. Ninh Bình'
        ) ON DUPLICATE KEY UPDATE que_quan = VALUES(que_quan)`,
        [sv.id]
      );

      // Thân nhân
      await pool.execute(
        `INSERT INTO quan_he_gia_dinh (sinh_vien_id, moi_quan_he, ho_ten, nam_sinh, nghe_nghiep, so_dien_thoai)
         VALUES (?, 'Cha', 'Trần Văn An', 1975, 'Kỹ sư xây dựng', '0988123456')`,
        [sv.id]
      );
      await pool.execute(
        `INSERT INTO quan_he_gia_dinh (sinh_vien_id, moi_quan_he, ho_ten, nam_sinh, nghe_nghiep, so_dien_thoai)
         VALUES (?, 'Me', 'Nguyễn Thị Hoa', 1978, 'Giáo viên', '0977654321')`,
        [sv.id]
      );

      // Học phí mẫu
      const [semesters] = await pool.execute('SELECT id FROM hoc_ky LIMIT 1');
      if (semesters.length > 0) {
        await pool.execute(
          `INSERT INTO cong_no_hoc_phi (sinh_vien_id, hoc_ky_id, tong_tin_chi_dang_ky, tong_hoc_phi_phai_nop, so_tien_da_dong, so_tien_con_no, trang_thai, han_chot_nop)
           VALUES (?, ?, 18, 8100000, 8100000, 0, 'DaHoanThanh', '2026-11-15')
           ON DUPLICATE KEY UPDATE so_tien_da_dong = VALUES(so_tien_da_dong)`,
          [sv.id, semesters[0].id]
        );
      }
      console.log('  + Đã tạo sơ yếu lý lịch, gia đình, công nợ học phí mẫu cho sinh viên:', sv.ho_ten);
    }

    console.log('✅ Hoàn tất Seed Dữ liệu mẫu!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi Seed data:', error);
    process.exit(1);
  }
}

seedExpandedData();
