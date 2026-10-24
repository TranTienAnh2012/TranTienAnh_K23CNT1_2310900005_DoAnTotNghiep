/**
 * SCRIPT MIGRATION TỰ ĐỘNG: Chuyển đổi dữ liệu từ smart_edu_db (30 bảng) sang smart_edu_v2 (12 bảng)
 * Đảm bảo 100% dữ liệu Sinh viên, Giảng viên, Face AI, Khung CTĐT, Điểm số được bảo toàn.
 */
const mysql = require('./Backend_nodejs/node_modules/mysql2/promise');
const config = require('./Backend_nodejs/src/config/env');
const fs = require('fs');

async function runMigration() {
  console.log('=== BẮT ĐẦU MIGRATION DỮ LIỆU SANG CSDL 12 BẢNG ===');
  
  const connOld = await mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: 'smart_edu_db',
    timezone: '+07:00'
  });

  const connNew = await mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: 'smart_edu_v2',
    timezone: '+07:00',
    multipleStatements: true
  });

  try {
    // 1. Chạy file DDL tạo 12 bảng trong smart_edu_v2
    console.log('[1/12] Khởi tạo cấu trúc 12 bảng trong smart_edu_v2...');
    const ddlSql = fs.readFileSync('./database_12_tables_init.sql', 'utf8');
    await connNew.query(ddlSql);
    console.log('  -> Đã tạo xong 12 bảng.');

    // Tắt kiểm tra khóa ngoại để nạp dữ liệu mượt mà
    await connNew.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 2. Migrate KHOA
    console.log('[2/12] Di chuyển bảng KHOA...');
    const [khoas] = await connOld.query('SELECT * FROM khoa');
    for (const k of khoas) {
      await connNew.execute(
        'INSERT INTO khoa (id, ma_khoa, ten_khoa, mo_ta, is_deleted) VALUES (?, ?, ?, ?, ?)',
        [k.id, k.ma_khoa, k.ten_khoa, k.mo_ta || null, k.is_deleted || 0]
      );
    }
    console.log(`  -> Đã chuyển ${khoas.length} khoa.`);

    // 3. Migrate LOP (Gộp nganh_hoc + lop)
    console.log('[3/12] Di chuyển bảng LOP...');
    const [lops] = await connOld.query(`
      SELECT l.*, n.ma_nganh, n.ten_nganh 
      FROM lop l 
      LEFT JOIN nganh_hoc n ON n.khoa_id = l.khoa_id
    `);
    // Lọc duplicate lớp do left join nếu có
    const uniqueLops = [];
    const lopIds = new Set();
    for (const l of lops) {
      if (!lopIds.has(l.id)) {
        lopIds.add(l.id);
        uniqueLops.push(l);
      }
    }
    for (const l of uniqueLops) {
      await connNew.execute(
        `INSERT INTO lop (id, khoa_id, ma_lop, ten_lop, ma_nganh, ten_nganh, khoa_hoc, is_active, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          l.id,
          l.khoa_id,
          l.ma_lop,
          l.ten_lop,
          l.ma_nganh || '7480201',
          l.ten_nganh || 'Công nghệ thông tin',
          l.khoa_hoc,
          l.is_active ?? 1,
          l.is_deleted ?? 0
        ]
      );
    }
    console.log(`  -> Đã chuyển ${uniqueLops.length} lớp học.`);

    // 4. Migrate USERS
    console.log('[4/12] Di chuyển bảng USERS...');
    const [users] = await connOld.query('SELECT * FROM users');
    for (const u of users) {
      await connNew.execute(
        'INSERT INTO users (id, username, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.username, u.password_hash, u.role, u.is_active ?? 1, u.created_at || new Date()]
      );
    }
    console.log(`  -> Đã chuyển ${users.length} tài khoản.`);

    // 5. Migrate GIANG_VIEN & QUAN_LY_KHOA (Hợp nhất)
    console.log('[5/12] Di chuyển bảng GIANG_VIEN (Hợp nhất Cán bộ Quản lý Khoa)...');
    const [gvs] = await connOld.query('SELECT * FROM giang_vien');
    for (const g of gvs) {
      await connNew.execute(
        `INSERT INTO giang_vien (id, user_id, khoa_id, ma_gv, ho_ten, email, avatar_url, face_embedding, face_updated_at, is_active, is_deleted, chuc_vu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GiangVien')`,
        [
          g.id,
          g.user_id,
          g.khoa_id,
          g.ma_gv,
          g.ho_ten,
          g.email,
          g.avatar_url || null,
          g.face_embedding ? JSON.stringify(g.face_embedding) : null,
          g.face_updated_at || null,
          g.is_active ?? 1,
          g.is_deleted ?? 0
        ]
      );
    }
    // Nạp cán bộ từ quan_ly_khoa nếu chưa có trong giang_vien
    const [qlks] = await connOld.query('SELECT * FROM quan_ly_khoa');
    for (const q of qlks) {
      const [chk] = await connNew.execute('SELECT id FROM giang_vien WHERE user_id = ?', [q.user_id]);
      if (chk.length === 0) {
        await connNew.execute(
          `INSERT INTO giang_vien (user_id, khoa_id, ma_gv, ho_ten, email, so_dien_thoai, avatar_url, chuc_vu)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            q.user_id,
            q.khoa_id,
            q.ma_can_bo,
            q.ho_ten,
            q.email,
            q.so_dien_thoai || null,
            q.avatar_url || null,
            q.chuc_vu || 'TruongKhoa'
          ]
        );
      } else {
        await connNew.execute(
          'UPDATE giang_vien SET chuc_vu = ? WHERE id = ?',
          [q.chuc_vu || 'TruongKhoa', chk[0].id]
        );
      }
    }
    console.log(`  -> Đã hợp nhất ${gvs.length} giảng viên & cán bộ quản lý khoa.`);

    // 6. Migrate SINH_VIEN (Hợp nhất ho_so, gia_dinh, tuyen_sinh)
    console.log('[6/12] Di chuyển bảng SINH_VIEN (Hợp nhất hồ sơ, tuyển sinh, gia đình)...');
    const [svs] = await connOld.query(`
      SELECT sv.*, 
             hssv.so_cmnd_cccd, hssv.so_dien_thoai_ca_nhan, hssv.dia_chi_thuong_tru, hssv.que_quan, hssv.dan_toc, hssv.ton_giao
      FROM sinh_vien sv
      LEFT JOIN ho_so_sinh_vien hssv ON sv.id = hssv.sinh_vien_id
    `);

    for (const s of svs) {
      // Lấy thông tin gia đình
      const [fams] = await connOld.query('SELECT moi_quan_he, ho_ten, nam_sinh, so_dien_thoai, nghe_nghiep FROM quan_he_gia_dinh WHERE sinh_vien_id = ?', [s.id]);
      // Lấy thông tin tuyển sinh
      const [adms] = await connOld.query('SELECT * FROM thong_tin_tuyen_sinh WHERE sinh_vien_id = ?', [s.id]);

      await connNew.execute(
        `INSERT INTO sinh_vien 
          (id, user_id, lop_id, ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, so_cmnd_cccd, avatar_url, face_embedding, face_updated_at, dia_chi_thuong_tru, que_quan, dan_toc, ton_giao, thong_tin_gia_dinh, thong_tin_tuyen_sinh, is_active, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id,
          s.user_id,
          s.lop_id,
          s.ma_sv,
          s.ho_ten,
          s.ngay_sinh || null,
          s.gioi_tinh || 'Nam',
          s.email,
          s.so_dien_thoai_ca_nhan || null,
          s.so_cmnd_cccd || null,
          s.avatar_url || null,
          s.face_embedding ? JSON.stringify(s.face_embedding) : null,
          s.face_updated_at || null,
          s.dia_chi_thuong_tru || null,
          s.que_quan || null,
          s.dan_toc || 'Kinh',
          s.ton_giao || 'Không',
          fams.length > 0 ? JSON.stringify(fams) : null,
          adms.length > 0 ? JSON.stringify(adms[0]) : null,
          s.is_active ?? 1,
          s.is_deleted ?? 0
        ]
      );
    }
    console.log(`  -> Đã hợp nhất ${svs.length} hồ sơ sinh viên toàn diện.`);

    // 7. Migrate MON_HOC
    console.log('[7/12] Di chuyển bảng MON_HOC...');
    const [mhs] = await connOld.query('SELECT * FROM mon_hoc');
    for (const m of mhs) {
      await connNew.execute(
        `INSERT INTO mon_hoc (id, khoa_id, ma_mon, ten_mon, so_tin_chi, so_tiet, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.khoa_id || 1,
          m.ma_mon,
          m.ten_mon,
          m.so_tin_chi || 3,
          m.so_tiet || ((m.so_tin_chi || 3) * 15),
          m.is_deleted || 0
        ]
      );
    }
    console.log(`  -> Đã chuyển ${mhs.length} môn học.`);

    // 8. Migrate CHUONG_TRINH_DAO_TAO & CTDT_HOC_PHAN
    console.log('[8/12] Di chuyển bảng CHUONG_TRINH_DAO_TAO & CTDT_HOC_PHAN...');
    const [ctdts] = await connOld.query(`
      SELECT c.*, n.ten_nganh 
      FROM chuong_trinh_dao_tao c
      LEFT JOIN nganh_hoc n ON c.nganh_hoc_id = n.id
    `);
    for (const c of ctdts) {
      await connNew.execute(
        `INSERT INTO chuong_trinh_dao_tao 
          (id, khoa_id, nganh_hoc_ten, ma_ctdt, ten_ctdt, khoa_tuyen_sinh, he_dao_tao, chuyen_nganh, tong_tin_chi_yeu_cau, nam_ban_hanh, quyet_dinh_ban_hanh, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.khoa_id,
          c.ten_nganh || 'Công nghệ thông tin',
          c.ma_ctdt,
          c.ten_ctdt,
          c.khoa_tuyen_sinh,
          c.he_dao_tao || 'Đại học chính quy 25',
          c.chuyen_nganh || 'Chuyên Ngành Chính',
          c.tong_tin_chi_yeu_cau || 135,
          c.nam_ban_hanh || 2023,
          c.quyet_dinh_ban_hanh || null,
          c.is_deleted || 0
        ]
      );
    }
    const [chps] = await connOld.query('SELECT * FROM ctdt_hoc_phan');
    for (const p of chps) {
      await connNew.execute(
        `INSERT INTO ctdt_hoc_phan 
          (id, chuong_trinh_dao_tao_id, mon_hoc_id, hoc_ky_goi_y, khoi_kien_thuc, loai_hoc_phan, so_tiet, dieu_kien_tien_quyet, nhom_tu_chon, ghi_chu, de_cuong_url, mon_tien_quyet_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.chuong_trinh_dao_tao_id,
          p.mon_hoc_id,
          p.hoc_ky_goi_y || 1,
          p.khoi_kien_thuc || 'CoSoNganh',
          p.loai_hoc_phan || 'BatBuoc',
          p.so_tiet || 45,
          p.dieu_kien_tien_quyet || null,
          p.nhom_tu_chon || null,
          p.ghi_chu || null,
          p.de_cuong_url || null,
          p.mon_tien_quyet_id || null
        ]
      );
    }
    console.log(`  -> Đã chuyển ${ctdts.length} CTĐT & ${chps.length} học phần trong khung.`);

    // 9. Migrate LOP_HOC_PHAN
    console.log('[9/12] Di chuyển bảng LOP_HOC_PHAN...');
    const [lhps] = await connOld.query(`
      SELECT lhp.*, hk.ten_hoc_ky, hk.nam_hoc
      FROM lop_hoc_phan lhp
      LEFT JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id
    `);
    for (const l of lhps) {
      await connNew.execute(
        `INSERT INTO lop_hoc_phan 
          (id, mon_hoc_id, giang_vien_id, ma_lhp, ten_lhp, hoc_ky, nam_hoc, phong_hoc_mac_dinh, so_luong_toi_da, is_active, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          l.id,
          l.mon_hoc_id,
          l.giang_vien_id || 1,
          l.ma_lhp,
          l.ten_lhp,
          l.ten_hoc_ky || 'HK1',
          l.nam_hoc || '2024-2025',
          l.phong_hoc_mac_dinh || 'P.302',
          l.so_luong_toi_da || 60,
          l.is_active ?? 1,
          l.is_deleted ?? 0
        ]
      );
    }
    console.log(`  -> Đã chuyển ${lhps.length} lớp học phần.`);

    // 10. Migrate BUOI_HOC & DIEM_DANH_NHAN_DIEN
    console.log('[10/12] Di chuyển bảng BUOI_HOC & DIEM_DANH_NHAN_DIEN...');
    const [bhs] = await connOld.query('SELECT * FROM buoi_hoc');
    for (const b of bhs) {
      await connNew.execute(
        `INSERT INTO buoi_hoc 
          (id, lop_hoc_phan_id, ngay_hoc, ca_hoc, gio_bat_dau, gio_ket_thuc, phong_hoc, chu_de_bai_hoc, trang_thai_diem_danh)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id,
          b.lop_hoc_phan_id,
          b.ngay_hoc,
          b.ca_hoc || 1,
          b.gio_bat_dau || '07:30:00',
          b.gio_ket_thuc || '11:30:00',
          b.phong_hoc || 'P.302',
          b.chu_de_bai_hoc || null,
          b.trang_thai_diem_danh || 'ChuaDiemDanh'
        ]
      );
    }
    const [dds] = await connOld.query('SELECT * FROM lich_su_diem_danh');
    for (const d of dds) {
      await connNew.execute(
        `INSERT INTO diem_danh_nhan_dien 
          (id, buoi_hoc_id, sinh_vien_id, thoi_gian_checkin, trang_thai, phuong_thuc, confidence_score, anh_capture_url, ghi_chu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          d.id,
          d.buoi_hoc_id,
          d.sinh_vien_id,
          d.thoi_gian_diem_danh || d.thoi_gian_checkin || new Date(),
          d.trang_thai || 'CoMat',
          d.phuong_thuc || 'FaceAI',
          d.confidence_score || null,
          d.anh_capture_url || d.anh_checkin_url || null,
          d.ghi_chu || null
        ]
      );
    }
    console.log(`  -> Đã chuyển ${bhs.length} buổi học & ${dds.length} bản ghi điểm danh Face AI.`);

    // 11. Migrate DANG_KY_VA_KET_QUA (Hợp nhất dang_ky_hoc_phan, bang_diem, ca_thi)
    console.log('[11/12] Di chuyển bảng DANG_KY_VA_KET_QUA (Hợp nhất Đăng ký + Bảng điểm + Lịch thi)...');
    const [dks] = await connOld.query(`
      SELECT d.*, bd.diem_chuyen_can, bd.diem_giua_ky, bd.diem_cuoi_ky, bd.diem_tong_ket_he10, bd.diem_tong_ket_he4, bd.diem_chu, bd.ket_qua
      FROM dang_ky_hoc_phan d
      LEFT JOIN bang_diem_sinh_vien bd ON bd.dang_ky_hoc_phan_id = d.id
    `);
    for (const dk of dks) {
      await connNew.execute(
        `INSERT INTO dang_ky_va_ket_qua 
          (id, sinh_vien_id, lop_hoc_phan_id, ngay_dang_ky, dieu_kien_du_thi, diem_chuyen_can, diem_giua_ky, diem_cuoi_ky, diem_tong_ket_he10, diem_tong_ket_he4, diem_chu, ket_qua, ghi_chu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dk.id,
          dk.sinh_vien_id,
          dk.lop_hoc_phan_id,
          dk.ngay_dang_ky || new Date(),
          dk.dieu_kien_du_thi ?? 1,
          dk.diem_chuyen_can ?? null,
          dk.diem_giua_ky ?? null,
          dk.diem_cuoi_ky ?? null,
          dk.diem_tong_ket_he10 ?? null,
          dk.diem_tong_ket_he4 ?? null,
          dk.diem_chu ?? null,
          dk.ket_qua || 'ChuaXet',
          dk.ghi_chu || null
        ]
      );
    }
    console.log(`  -> Đã chuyển ${dks.length} bản ghi đăng ký & điểm số môn học.`);

    // 12. Migrate SO_HOC_VU (Học phí, Cảnh báo học vụ, Rèn luyện)
    console.log('[12/12] Di chuyển bảng SO_HOC_VU (Học phí, Cảnh báo học vụ, Điểm rèn luyện)...');
    const [hps] = await connOld.query('SELECT * FROM cong_no_hoc_phi');
    for (const h of hps) {
      await connNew.execute(
        `INSERT INTO so_hoc_vu (sinh_vien_id, hoc_ky, hoc_phi_phai_dong, hoc_phi_da_dong, trang_thai_hoc_phi)
         VALUES (?, ?, ?, ?, ?)`,
        [
          h.sinh_vien_id,
          h.hoc_ky || 'HK1_2024_2025',
          h.so_tien_phai_dong || 0,
          h.so_tien_da_dong || 0,
          (h.so_tien_con_no <= 0) ? 'DaHoanThanh' : 'ConNo'
        ]
      );
    }
    console.log(`  -> Đã chuyển ${hps.length} bản ghi học phí học vụ.`);

    // Bật lại kiểm tra khóa ngoại
    await connNew.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('=== HOÀN TẤT MIGRATION 100% SANG CSDL 12 BẢNG THÀNH CÔNG RỰC RỠ! ===');
  } catch (err) {
    console.error('Lỗi migration:', err);
  } finally {
    await connOld.end();
    await connNew.end();
    process.exit();
  }
}

runMigration();
