const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');

/**
 * Controller Admin quản lý các phân hệ của Khoa & Tài chính Học phí
 * Admin có toàn quyền trên toàn bộ các Khoa
 */
const facultyOperationsController = {
  // ==========================================
  // 1. QUẢN LÝ CÁN BỘ KHOA (quan_ly_khoa)
  // ==========================================

  /**
   * Lấy danh sách cán bộ quản lý khoa
   * GET /api/admin/faculty-managers
   */
  async getFacultyManagers(req, res) {
    try {
      const { khoa_id, search } = req.query;
      let query = `
        SELECT 
          qlk.*,
          u.username, u.is_active AS user_active,
          k.ma_khoa, k.ten_khoa
        FROM quan_ly_khoa qlk
        JOIN users u ON qlk.user_id = u.id
        JOIN khoa k ON qlk.khoa_id = k.id
        WHERE qlk.is_deleted = FALSE AND u.is_deleted = FALSE
      `;
      const params = [];

      if (khoa_id && khoa_id !== 'all') {
        query += ' AND qlk.khoa_id = ?';
        params.push(parseInt(khoa_id, 10));
      }

      if (search) {
        query += ' AND (qlk.ma_can_bo LIKE ? OR qlk.ho_ten LIKE ? OR qlk.email LIKE ? OR u.username LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }

      query += ' ORDER BY k.ma_khoa ASC, qlk.ma_can_bo ASC';
      const [managers] = await pool.execute(query, params);

      const [faculties] = await pool.execute('SELECT id, ma_khoa, ten_khoa FROM khoa WHERE is_deleted = FALSE');

      return res.status(200).json({
        success: true,
        data: {
          managers,
          faculties
        }
      });
    } catch (error) {
      console.error('[facultyOperationsController.getFacultyManagers]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Thêm mới cán bộ quản lý khoa & tạo tài khoản
   * POST /api/admin/faculty-managers
   */
  async createFacultyManager(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { username, password, ma_can_bo, ho_ten, email, so_dien_thoai, khoa_id, chuc_vu } = req.body;

      if (!username || !password || !ma_can_bo || !ho_ten || !email || !khoa_id) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đủ: Tên đăng nhập, Mật khẩu, Mã cán bộ, Họ tên, Email và Khoa quản lý.'
        });
      }

      // Kiểm tra username đã tồn tại
      const [dupUser] = await connection.execute('SELECT id FROM users WHERE username = ?', [username.trim()]);
      if (dupUser.length > 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã tồn tại trên hệ thống.' });
      }

      // Kiểm tra ma_can_bo hoặc email đã tồn tại
      const [dupQlk] = await connection.execute(
        'SELECT id FROM quan_ly_khoa WHERE ma_can_bo = ? OR email = ?',
        [ma_can_bo.trim(), email.trim()]
      );
      if (dupQlk.length > 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Mã cán bộ hoặc Email này đã tồn tại.' });
      }

      // 1. Tạo User với role faculty_manager
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      const [userRes] = await connection.execute(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username.trim(), passwordHash, 'faculty_manager']
      );
      const userId = userRes.insertId;

      // 2. Tạo bản ghi quan_ly_khoa
      await connection.execute(
        `INSERT INTO quan_ly_khoa (user_id, ma_can_bo, ho_ten, email, so_dien_thoai, khoa_id, chuc_vu)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, ma_can_bo.trim(), ho_ten.trim(), email.trim(), so_dien_thoai || null, khoa_id, chuc_vu || 'Trợ lý khoa']
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'Tạo tài khoản và bổ nhiệm Cán bộ Quản lý Khoa thành công!'
      });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  },

  /**
   * Cập nhật thông tin cán bộ khoa
   * PUT /api/admin/faculty-managers/:id
   */
  async updateFacultyManager(req, res) {
    try {
      const { id } = req.params;
      const { ho_ten, email, so_dien_thoai, khoa_id, chuc_vu, is_active } = req.body;

      await pool.execute(
        `UPDATE quan_ly_khoa SET
          ho_ten = ?, email = ?, so_dien_thoai = ?, khoa_id = ?, chuc_vu = ?,
          is_active = ?, updated_at = NOW()
         WHERE id = ?`,
        [ho_ten, email, so_dien_thoai || null, khoa_id, chuc_vu || 'Trợ lý khoa', is_active !== false, id]
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật cán bộ quản lý khoa thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Xóa cán bộ khoa
   * DELETE /api/admin/faculty-managers/:id
   */
  async deleteFacultyManager(req, res) {
    try {
      const { id } = req.params;
      const [qlk] = await pool.execute('SELECT user_id FROM quan_ly_khoa WHERE id = ?', [id]);
      if (qlk.length > 0) {
        await pool.execute('UPDATE users SET is_deleted = TRUE WHERE id = ?', [qlk[0].user_id]);
      }
      await pool.execute('UPDATE quan_ly_khoa SET is_deleted = TRUE WHERE id = ?', [id]);

      return res.status(200).json({
        success: true,
        message: 'Đã xóa cán bộ quản lý khoa.'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================
  // 2. QUẢN LÝ HỌC PHÍ & CÔNG NỢ TOÀN TRƯỜNG
  // ==========================================

  /**
   * Lấy danh sách công nợ học phí toàn trường
   * GET /api/admin/tuition
   */
  async getAllTuition(req, res) {
    try {
      const { khoa_id, lop_id, hoc_ky_id, trang_thai, search } = req.query;

      let query = `
        SELECT 
          cn.*,
          sv.ma_sv, sv.ho_ten, sv.email,
          l.id AS lop_id, l.ma_lop, l.ten_lop, l.ten_nganh,
          k.id AS khoa_id, k.ma_khoa, k.ten_khoa,
          hk.ten_hoc_ky, hk.nam_hoc,
          u.username AS nguoi_xac_nhan_ten
        FROM cong_no_hoc_phi cn
        JOIN sinh_vien sv ON cn.sinh_vien_id = sv.id
        JOIN lop l ON sv.lop_id = l.id
        JOIN khoa k ON l.khoa_id = k.id
        LEFT JOIN hoc_ky hk ON cn.hoc_ky_id = hk.id
        LEFT JOIN users u ON cn.nguoi_xac_nhan_id = u.id
        WHERE sv.is_deleted = FALSE
      `;
      const params = [];

      if (khoa_id && khoa_id !== 'all') {
        query += ' AND k.id = ?';
        params.push(parseInt(khoa_id, 10));
      }

      if (lop_id && lop_id !== 'all') {
        query += ' AND l.id = ?';
        params.push(parseInt(lop_id, 10));
      }

      if (hoc_ky_id && hoc_ky_id !== 'all') {
        query += ' AND cn.hoc_ky_id = ?';
        params.push(parseInt(hoc_ky_id, 10));
      }

      if (trang_thai && trang_thai !== 'all') {
        query += ' AND cn.trang_thai = ?';
        params.push(trang_thai);
      }

      if (search) {
        query += ' AND (sv.ma_sv LIKE ? OR sv.ho_ten LIKE ? OR cn.so_bien_lai LIKE ? OR cn.so_hd_dien_tu LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }

      query += ' ORDER BY cn.id DESC LIMIT 150';
      const [list] = await pool.execute(query, params);

      const [faculties] = await pool.execute('SELECT id, ma_khoa, ten_khoa, hoc_phi_ky_chuan, don_gia_tin_chi, phi_bhyt, cau_hinh_khoan_thu FROM khoa WHERE is_deleted = FALSE ORDER BY ten_khoa ASC');
      const [classes] = await pool.execute('SELECT id, ma_lop, ten_lop, khoa_id, ten_nganh FROM lop WHERE is_deleted = FALSE ORDER BY ten_lop ASC');
      const [semesters] = await pool.execute('SELECT id, ten_hoc_ky, nam_hoc FROM hoc_ky WHERE is_deleted = FALSE ORDER BY id DESC');

      return res.status(200).json({
        success: true,
        data: {
          tuitions: list,
          faculties,
          classes,
          semesters
        }
      });
    } catch (error) {
      console.error('[facultyOperationsController.getAllTuition]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy cấu hình định mức học phí các khoa
   * GET /api/admin/tuition/faculty-rates
   */
  async getFacultyTuitionRates(req, res) {
    try {
      const [faculties] = await pool.execute(`
        SELECT 
          k.id, k.ma_khoa, k.ten_khoa, 
          COALESCE(k.hoc_phi_ky_chuan, 11800000.00) AS hoc_phi_ky_chuan,
          COALESCE(k.don_gia_tin_chi, 450000.00) AS don_gia_tin_chi,
          COALESCE(k.phi_bhyt, 632000.00) AS phi_bhyt,
          k.cau_hinh_khoan_thu,
          COUNT(DISTINCT l.id) AS tong_so_lop,
          COUNT(DISTINCT sv.id) AS tong_so_sinh_vien
        FROM khoa k
        LEFT JOIN lop l ON l.khoa_id = k.id AND l.is_deleted = FALSE
        LEFT JOIN sinh_vien sv ON sv.lop_id = l.id AND sv.is_deleted = FALSE
        WHERE k.is_deleted = FALSE
        GROUP BY k.id
        ORDER BY k.ten_khoa ASC
      `);

      return res.status(200).json({
        success: true,
        data: faculties
      });
    } catch (error) {
      console.error('[getFacultyTuitionRates]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Cập nhật định mức học phí cho 1 Khoa
   * PUT /api/admin/tuition/faculty-rates/:id
   */
  async updateFacultyTuitionRates(req, res) {
    try {
      const { id } = req.params;
      const { hoc_phi_ky_chuan, don_gia_tin_chi, phi_bhyt, cau_hinh_khoan_thu } = req.body;

      await pool.execute(
        `UPDATE khoa SET
          hoc_phi_ky_chuan = COALESCE(?, hoc_phi_ky_chuan),
          don_gia_tin_chi = COALESCE(?, don_gia_tin_chi),
          phi_bhyt = COALESCE(?, phi_bhyt),
          cau_hinh_khoan_thu = COALESCE(?, cau_hinh_khoan_thu)
         WHERE id = ?`,
        [
          hoc_phi_ky_chuan !== undefined ? parseFloat(hoc_phi_ky_chuan) : null,
          don_gia_tin_chi !== undefined ? parseFloat(don_gia_tin_chi) : null,
          phi_bhyt !== undefined ? parseFloat(phi_bhyt) : null,
          cau_hinh_khoan_thu ? (typeof cau_hinh_khoan_thu === 'object' ? JSON.stringify(cau_hinh_khoan_thu) : cau_hinh_khoan_thu) : null,
          id
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật cấu hình định mức học phí của Khoa thành công!'
      });
    } catch (error) {
      console.error('[updateFacultyTuitionRates]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Áp dụng định mức học phí Khoa cho 1 Lớp hoặc cả Khoa trong Học kỳ mới
   * Cho phép thay đổi mức thu của mỗi kỳ và tính lại tổng phải nộp cho toàn bộ sinh viên (kể cả đã nộp hoặc chưa nộp)
   * POST /api/admin/tuition/apply-rate
   */
  async applyFacultyTuitionRate(req, res) {
    try {
      const {
        khoa_id,
        lop_id,
        hoc_ky_id,
        hoc_ky_nien_khoa = '1',
        nam_hoc_nien_khoa = '2025-2026',
        dot = 1,
        han_chot_nop,
        muc_thu_hoc_phi, // Mức thu học phí tùy chỉnh của kỳ này
        cap_nhat_tat_ca = true // Tính lại cho cả sinh viên đã có bản ghi
      } = req.body;

      if (!khoa_id || !hoc_ky_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn Khoa và Học kỳ áp dụng.' });
      }

      const [khoaRows] = await pool.execute(
        'SELECT id, ten_khoa, hoc_phi_ky_chuan, don_gia_tin_chi, phi_bhyt, cau_hinh_khoan_thu FROM khoa WHERE id = ?',
        [khoa_id]
      );
      if (khoaRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin khoa.' });
      }
      const kInfo = khoaRows[0];
      
      // Mức thu của kỳ: Ưu tiên mức thu do Admin nhập, nếu để trống thì lấy định mức chuẩn của khoa
      const hocPhiKy = (muc_thu_hoc_phi !== undefined && muc_thu_hoc_phi !== null && muc_thu_hoc_phi !== '')
        ? parseFloat(muc_thu_hoc_phi)
        : parseFloat(kInfo.hoc_phi_ky_chuan || 11800000);

      // Lưu lịch sử / cấu hình mức thu theo kỳ vào khoa.cau_hinh_khoan_thu
      let parsedConfig = {};
      try {
        if (kInfo.cau_hinh_khoan_thu) {
          parsedConfig = typeof kInfo.cau_hinh_khoan_thu === 'string'
            ? JSON.parse(kInfo.cau_hinh_khoan_thu)
            : kInfo.cau_hinh_khoan_thu;
        }
      } catch (e) {
        parsedConfig = {};
      }
      if (!parsedConfig.dinh_muc_theo_ky) parsedConfig.dinh_muc_theo_ky = {};
      parsedConfig.dinh_muc_theo_ky[`HK${hoc_ky_nien_khoa}`] = hocPhiKy;
      parsedConfig.dinh_muc_theo_ky[`ky_${hoc_ky_id}`] = hocPhiKy;

      await pool.execute(
        'UPDATE khoa SET cau_hinh_khoan_thu = ? WHERE id = ?',
        [JSON.stringify(parsedConfig), khoa_id]
      );

      let svQuery = `
        SELECT sv.id, sv.ma_sv, sv.ho_ten, sv.lop_id
        FROM sinh_vien sv
        JOIN lop l ON sv.lop_id = l.id
        WHERE sv.is_deleted = FALSE AND l.khoa_id = ?
      `;
      const svParams = [khoa_id];
      if (lop_id && lop_id !== 'all') {
        svQuery += ' AND sv.lop_id = ?';
        svParams.push(parseInt(lop_id, 10));
      }

      const [students] = await pool.execute(svQuery, svParams);
      if (students.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có sinh viên nào trong phạm vi đã chọn.' });
      }

      let createdCount = 0;
      let updatedCount = 0;

      for (const sv of students) {
        const [existing] = await pool.execute(
          `SELECT id, tong_hoc_phi_phai_nop, so_tien_mien_giam, so_tien_da_dong, trang_thai 
           FROM cong_no_hoc_phi 
           WHERE sinh_vien_id = ? AND hoc_ky_id = ? AND khoan_thu = 'Học phí học kỳ'`,
          [sv.id, hoc_ky_id]
        );

        if (existing.length === 0) {
          // Sinh mới công nợ cho sinh viên
          await pool.execute(
            `INSERT INTO cong_no_hoc_phi (
              sinh_vien_id, hoc_ky_id, khoan_thu, dot, hoc_ky_nien_khoa, nam_hoc_nien_khoa,
              tong_tin_chi_dang_ky, tong_hoc_phi_phai_nop, so_tien_mien_giam, so_tien_da_dong,
              so_tien_con_no, han_chot_nop, trang_thai, loai_giao_dich
            ) VALUES (?, ?, 'Học phí học kỳ', ?, ?, ?, 15, ?, 0, 0, ?, ?, 'ChuaDong', 'Thu')`,
            [sv.id, hoc_ky_id, dot, hoc_ky_nien_khoa, nam_hoc_nien_khoa, hocPhiKy, hocPhiKy, han_chot_nop || null]
          );
          createdCount++;
        } else if (cap_nhat_tat_ca) {
          // Cập nhật lại mức thu cho sinh viên đã có bản ghi (kể cả đã nộp hoặc chưa nộp)
          const curr = existing[0];
          const mienGiam = parseFloat(curr.so_tien_mien_giam || 0);
          const daDong = parseFloat(curr.so_tien_da_dong || 0);
          const conNoMoi = Math.max(0, hocPhiKy - mienGiam - daDong);
          const trangThaiMoi = conNoMoi === 0 ? 'DaHoanThanh' : 'ChuaDong';

          await pool.execute(
            `UPDATE cong_no_hoc_phi SET
              tong_hoc_phi_phai_nop = ?,
              so_tien_con_no = ?,
              trang_thai = ?,
              dot = ?,
              hoc_ky_nien_khoa = ?,
              nam_hoc_nien_khoa = ?,
              han_chot_nop = COALESCE(?, han_chot_nop)
             WHERE id = ?`,
            [hocPhiKy, conNoMoi, trangThaiMoi, dot, hoc_ky_nien_khoa, nam_hoc_nien_khoa, han_chot_nop || null, curr.id]
          );
          updatedCount++;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Đã áp dụng mức thu ${new Intl.NumberFormat('vi-VN').format(hocPhiKy)}đ/kỳ cho ${students.length} sinh viên (Tạo mới: ${createdCount}, Cập nhật tính lại: ${updatedCount})!`
      });
    } catch (error) {
      console.error('[applyFacultyTuitionRate]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Kế toán / Admin xác nhận nộp học phí & xuất biên lai
   * PUT /api/admin/tuition/:id/confirm
   */
  async confirmTuition(req, res) {
    try {
      const { id } = req.params;
      const {
        so_tien_da_dong,
        so_tien_con_no,
        so_tien_mien_giam,
        trang_thai,
        so_bien_lai,
        so_hd_dien_tu,
        ghi_chu_ke_toan,
        ngay_nop_tien
      } = req.body;

      const adminId = req.user.id;

      await pool.execute(
        `UPDATE cong_no_hoc_phi SET
          so_tien_da_dong = ?,
          so_tien_con_no = ?,
          so_tien_mien_giam = COALESCE(?, so_tien_mien_giam),
          trang_thai = ?,
          so_bien_lai = ?,
          so_hd_dien_tu = COALESCE(?, so_hd_dien_tu),
          ghi_chu_ke_toan = ?,
          loai_giao_dich = 'Thu',
          nguoi_xac_nhan_id = ?,
          ngay_xac_nhan = NOW(),
          ngay_nop_tien = COALESCE(?, NOW()),
          updated_at = NOW()
         WHERE id = ?`,
        [
          so_tien_da_dong || 0,
          so_tien_con_no || 0,
          so_tien_mien_giam !== undefined ? so_tien_mien_giam : null,
          trang_thai || 'DaHoanThanh',
          so_bien_lai || null,
          so_hd_dien_tu || '',
          ghi_chu_ke_toan || null,
          adminId,
          ngay_nop_tien || null,
          id
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Kế toán đã xác nhận thu tiền và cập nhật học phí thành công! Biên lai đã được xuất và đồng bộ ngay sang Cổng sinh viên.'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Tạo khoản thu học phí mới cho sinh viên
   * POST /api/admin/tuition
   */
  async createTuition(req, res) {
    try {
      const {
        sinh_vien_id,
        hoc_ky_id,
        khoan_thu = 'Học phí học kỳ',
        dot = 1,
        hoc_ky_nien_khoa = '1',
        nam_hoc_nien_khoa = '2025-2026',
        tong_tin_chi_dang_ky = 15,
        tong_hoc_phi_phai_nop = 0,
        so_tien_mien_giam = 0,
        so_tien_da_dong = 0,
        han_chot_nop,
        trang_thai = 'ChuaDong',
        so_bien_lai,
        so_hd_dien_tu = '',
        loai_giao_dich = 'Thu',
        ghi_chu_ke_toan
      } = req.body;

      if (!sinh_vien_id || !hoc_ky_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn sinh viên và học kỳ.' });
      }

      const phaiNop = parseFloat(tong_hoc_phi_phai_nop || 0);
      const mienGiam = parseFloat(so_tien_mien_giam || 0);
      const daDong = parseFloat(so_tien_da_dong || 0);
      const conNo = Math.max(0, phaiNop - mienGiam - daDong);

      const [result] = await pool.execute(
        `INSERT INTO cong_no_hoc_phi (
          sinh_vien_id, hoc_ky_id, khoan_thu, dot, hoc_ky_nien_khoa, nam_hoc_nien_khoa,
          tong_tin_chi_dang_ky, tong_hoc_phi_phai_nop, so_tien_mien_giam, so_tien_da_dong,
          so_tien_con_no, han_chot_nop, trang_thai, so_bien_lai, so_hd_dien_tu,
          loai_giao_dich, ghi_chu_ke_toan, nguoi_xac_nhan_id, ngay_xac_nhan, ngay_nop_tien
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sinh_vien_id,
          hoc_ky_id,
          khoan_thu,
          dot,
          hoc_ky_nien_khoa,
          nam_hoc_nien_khoa,
          tong_tin_chi_dang_ky,
          phaiNop,
          mienGiam,
          daDong,
          conNo,
          han_chot_nop || null,
          trang_thai,
          so_bien_lai || null,
          so_hd_dien_tu,
          loai_giao_dich,
          ghi_chu_ke_toan || null,
          daDong > 0 ? req.user.id : null,
          daDong > 0 ? new Date() : null,
          daDong > 0 ? new Date() : null
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Tạo khoản thu học phí thành công!',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('[facultyOperationsController.createTuition]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Cập nhật thông tin khoản thu học phí
   * PUT /api/admin/tuition/:id
   */
  async updateTuition(req, res) {
    try {
      const { id } = req.params;
      const {
        khoan_thu,
        dot,
        hoc_ky_nien_khoa,
        nam_hoc_nien_khoa,
        tong_tin_chi_dang_ky,
        tong_hoc_phi_phai_nop,
        so_tien_mien_giam,
        so_tien_da_dong,
        han_chot_nop,
        trang_thai,
        so_bien_lai,
        so_hd_dien_tu,
        loai_giao_dich,
        ghi_chu_ke_toan
      } = req.body;

      const phaiNop = parseFloat(tong_hoc_phi_phai_nop || 0);
      const mienGiam = parseFloat(so_tien_mien_giam || 0);
      const daDong = parseFloat(so_tien_da_dong || 0);
      const conNo = Math.max(0, phaiNop - mienGiam - daDong);

      await pool.execute(
        `UPDATE cong_no_hoc_phi SET
          khoan_thu = COALESCE(?, khoan_thu),
          dot = COALESCE(?, dot),
          hoc_ky_nien_khoa = COALESCE(?, hoc_ky_nien_khoa),
          nam_hoc_nien_khoa = COALESCE(?, nam_hoc_nien_khoa),
          tong_tin_chi_dang_ky = COALESCE(?, tong_tin_chi_dang_ky),
          tong_hoc_phi_phai_nop = ?,
          so_tien_mien_giam = ?,
          so_tien_da_dong = ?,
          so_tien_con_no = ?,
          han_chot_nop = COALESCE(?, han_chot_nop),
          trang_thai = COALESCE(?, trang_thai),
          so_bien_lai = COALESCE(?, so_bien_lai),
          so_hd_dien_tu = COALESCE(?, so_hd_dien_tu),
          loai_giao_dich = COALESCE(?, loai_giao_dich),
          ghi_chu_ke_toan = COALESCE(?, ghi_chu_ke_toan),
          updated_at = NOW()
         WHERE id = ?`,
        [
          khoan_thu,
          dot,
          hoc_ky_nien_khoa,
          nam_hoc_nien_khoa,
          tong_tin_chi_dang_ky,
          phaiNop,
          mienGiam,
          daDong,
          conNo,
          han_chot_nop,
          trang_thai,
          so_bien_lai,
          so_hd_dien_tu,
          loai_giao_dich,
          ghi_chu_ke_toan,
          id
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin học phí thành công!'
      });
    } catch (error) {
      console.error('[facultyOperationsController.updateTuition]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Xóa bản ghi học phí
   * DELETE /api/admin/tuition/:id
   */
  async deleteTuition(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('DELETE FROM cong_no_hoc_phi WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Đã xóa bản ghi học phí thành công!' });
    } catch (error) {
      console.error('[facultyOperationsController.deleteTuition]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = facultyOperationsController;
