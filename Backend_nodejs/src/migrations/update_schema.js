const { pool } = require('../config/db');

async function migrate() {
  try {
    console.log('Running database migration for rich academic fields...');

    // 1. Thêm cột cho bảng khoa nếu chưa có
    const [colsKhoa] = await pool.query('SHOW COLUMNS FROM khoa');
    const colNamesKhoa = colsKhoa.map((c) => c.Field);
    if (!colNamesKhoa.includes('email')) {
      await pool.query('ALTER TABLE khoa ADD COLUMN email VARCHAR(100) NULL AFTER so_dien_thoai');
      console.log('Added email to khoa');
    }
    if (!colNamesKhoa.includes('van_phong')) {
      await pool.query('ALTER TABLE khoa ADD COLUMN van_phong VARCHAR(150) NULL AFTER email');
      console.log('Added van_phong to khoa');
    }
    if (!colNamesKhoa.includes('truong_khoa')) {
      await pool.query('ALTER TABLE khoa ADD COLUMN truong_khoa VARCHAR(100) NULL AFTER van_phong');
      console.log('Added truong_khoa to khoa');
    }

    // 2. Tạo bảng dang_ky_hoc_phan nếu chưa có
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dang_ky_hoc_phan (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        lop_hoc_phan_id INT NOT NULL,
        sinh_vien_id INT NOT NULL,
        ngay_dang_ky DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dieu_kien_du_thi ENUM('du_dieu_kien', 'cam_thi') NOT NULL DEFAULT 'du_dieu_kien',
        phuong_thuc ENUM('admin', 'sinh_vien') NOT NULL DEFAULT 'admin',
        ghi_chu VARCHAR(255) NULL,
        CONSTRAINT fk_dkhp_lhp FOREIGN KEY (lop_hoc_phan_id) REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
        CONSTRAINT fk_dkhp_sinhvien FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE,
        UNIQUE KEY uk_lhp_sv (lop_hoc_phan_id, sinh_vien_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Checked dang_ky_hoc_phan table');

    // Thêm cột so_luong_toi_da cho lop_hoc_phan nếu chưa có
    const [colsLhp] = await pool.query('SHOW COLUMNS FROM lop_hoc_phan');
    const colNamesLhp = colsLhp.map((c) => c.Field);
    if (!colNamesLhp.includes('so_luong_toi_da')) {
      await pool.query('ALTER TABLE lop_hoc_phan ADD COLUMN so_luong_toi_da INT NOT NULL DEFAULT 50 AFTER phong_hoc_mac_dinh');
      console.log('Added so_luong_toi_da to lop_hoc_phan');
    }

    // Thêm cột so_buoi_hoc cho mon_hoc nếu chưa có
    const [colsMonHoc] = await pool.query('SHOW COLUMNS FROM mon_hoc');
    const colNamesMonHoc = colsMonHoc.map((c) => c.Field);
    if (!colNamesMonHoc.includes('so_buoi_hoc')) {
      await pool.query('ALTER TABLE mon_hoc ADD COLUMN so_buoi_hoc TINYINT NOT NULL DEFAULT 15 AFTER so_tin_chi');
      console.log('Added so_buoi_hoc to mon_hoc');
    }

    // Sao chép dữ liệu từ sinh_vien_lhp cũ sang dang_ky_hoc_phan nếu có bảng cũ
    const [tables] = await pool.query("SHOW TABLES LIKE 'sinh_vien_lhp'");
    if (tables.length > 0) {
      await pool.query(`
        INSERT IGNORE INTO dang_ky_hoc_phan (lop_hoc_phan_id, sinh_vien_id, ngay_dang_ky)
        SELECT lop_hoc_phan_id, sinh_vien_id, ngay_dang_ky FROM sinh_vien_lhp
      `);
      console.log('Migrated data from sinh_vien_lhp to dang_ky_hoc_phan');
    }

    // 3. Thêm cột giang_vien_id cho ca_thi nếu chưa có
    const [colsCaThi] = await pool.query('SHOW COLUMNS FROM ca_thi');
    const colNamesCaThi = colsCaThi.map((c) => c.Field);
    if (!colNamesCaThi.includes('giang_vien_id')) {
      await pool.query('ALTER TABLE ca_thi ADD COLUMN giang_vien_id INT NULL AFTER hoc_ky_id, ADD CONSTRAINT fk_cathi_giangvien FOREIGN KEY (giang_vien_id) REFERENCES giang_vien(id) ON DELETE SET NULL');
      console.log('Added giang_vien_id to ca_thi');
    }

    // Nạp sinh viên vào dang_ky_hoc_phan cho các lớp học phần hiện có
    const [existingLhp] = await pool.query('SELECT id FROM lop_hoc_phan');
    const [allSv] = await pool.query('SELECT id FROM sinh_vien WHERE is_deleted = FALSE');
    if (existingLhp.length > 0 && allSv.length > 0) {
      for (const lhp of existingLhp) {
        for (const sv of allSv) {
          await pool.query("INSERT IGNORE INTO dang_ky_hoc_phan (lop_hoc_phan_id, sinh_vien_id, phuong_thuc) VALUES (?, ?, 'admin')", [lhp.id, sv.id]);
        }
      }
      console.log('Seeded dang_ky_hoc_phan with students');
    }

    // Cập nhật thông tin bổ sung cho các khoa mẫu
    await pool.query(`
      UPDATE khoa SET 
        email = 'cntt@smartedu.edu.vn', 
        van_phong = 'Tầng 4 - Nhà C', 
        truong_khoa = 'PGS.TS Trần Mạnh Cường' 
      WHERE ma_khoa = 'CNTT' AND (email IS NULL OR email = '')
    `);
    await pool.query(`
      UPDATE khoa SET 
        email = 'dtvt@smartedu.edu.vn', 
        van_phong = 'Tầng 2 - Nhà B', 
        truong_khoa = 'TS. Lê Hoàng Nam' 
      WHERE ma_khoa = 'DTVT' AND (email IS NULL OR email = '')
    `);
    await pool.query(`
      UPDATE khoa SET 
        email = 'kt@smartedu.edu.vn', 
        van_phong = 'Tầng 1 - Nhà A1', 
        truong_khoa = 'TS. Vũ Minh Thảo' 
      WHERE ma_khoa = 'KT' AND (email IS NULL OR email = '')
    `);

    // Gán giảng viên coi thi cho các ca thi hiện có nếu chưa có
    const [existingGv] = await pool.query('SELECT id FROM giang_vien LIMIT 1');
    if (existingGv.length > 0) {
      await pool.query('UPDATE ca_thi SET giang_vien_id = ? WHERE giang_vien_id IS NULL', [existingGv[0].id]);
    // Đảm bảo buoi_hoc.ca_hoc là VARCHAR(100) để lưu đúng tên ca học và giờ học
    await pool.query("ALTER TABLE buoi_hoc MODIFY COLUMN ca_hoc VARCHAR(100) NOT NULL DEFAULT 'Ca 1 (07:00 - 09:15)'");

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
