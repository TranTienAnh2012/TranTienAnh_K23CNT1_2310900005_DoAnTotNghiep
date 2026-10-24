const { pool } = require('../../config/db');

/**
 * Controller Quản lý Khoa (Role: faculty_manager & admin)
 * Giới hạn phạm vi dữ liệu theo Khoa của cán bộ quản lý
 */
const facultyController = {
  // Lấy ID Khoa từ Token hoặc Query param (nếu là Admin)
  _getKhoaId(req) {
    if (req.user.role === 'admin') {
      if (req.query.khoa_id && req.query.khoa_id !== 'all') {
        return parseInt(req.query.khoa_id, 10);
      }
      return null; // Admin xem toàn trường
    }
    return req.user.facultyProfile?.khoa_id || 1;
  },

  /**
   * 1. Thống kê Dashboard Khoa / Toàn trường (nếu Admin)
   * GET /api/faculty/dashboard
   */
  async getDashboardStats(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);

      const svWhere = khoaId ? 'WHERE l.khoa_id = ? AND sv.is_deleted = FALSE' : 'WHERE sv.is_deleted = FALSE';
      const svParams = khoaId ? [khoaId] : [];
      const [svCount] = await pool.execute(
        `SELECT COUNT(*) AS total FROM sinh_vien sv JOIN lop l ON sv.lop_id = l.id ${svWhere}`,
        svParams
      );

      const gvWhere = khoaId ? 'WHERE khoa_id = ? AND is_deleted = FALSE' : 'WHERE is_deleted = FALSE';
      const gvParams = khoaId ? [khoaId] : [];
      const [gvCount] = await pool.execute(
        `SELECT COUNT(*) AS total FROM giang_vien ${gvWhere}`,
        gvParams
      );

      const lopWhere = khoaId ? 'WHERE khoa_id = ? AND is_deleted = FALSE' : 'WHERE is_deleted = FALSE';
      const lopParams = khoaId ? [khoaId] : [];
      const [lopCount] = await pool.execute(
        `SELECT COUNT(*) AS total FROM lop ${lopWhere}`,
        lopParams
      );

      const ctdtWhere = khoaId ? 'WHERE khoa_id = ? AND is_deleted = FALSE' : 'WHERE is_deleted = FALSE';
      const ctdtParams = khoaId ? [khoaId] : [];
      const [ctdtCount] = await pool.execute(
        `SELECT COUNT(*) AS total FROM chuong_trinh_dao_tao ${ctdtWhere}`,
        ctdtParams
      );

      const warnWhere = khoaId ? 'WHERE l.khoa_id = ? AND cb.trang_thai_khac_phuc = "DangTheoDoi"' : 'WHERE cb.trang_thai_khac_phuc = "DangTheoDoi"';
      const warnParams = khoaId ? [khoaId] : [];
      const [warningCount] = await pool.execute(
        `SELECT COUNT(*) AS total FROM canh_bao_hoc_vu cb JOIN sinh_vien sv ON cb.sinh_vien_id = sv.id JOIN lop l ON sv.lop_id = l.id ${warnWhere}`,
        warnParams
      );

      const fbWhere = khoaId ? 'WHERE l.khoa_id = ? AND yk.trang_thai = "TiepNhan"' : 'WHERE yk.trang_thai = "TiepNhan"';
      const fbParams = khoaId ? [khoaId] : [];
      const [feedbackCount] = await pool.execute(
        `SELECT COUNT(*) AS total FROM y_kien_sinh_vien yk JOIN sinh_vien sv ON yk.sinh_vien_id = sv.id JOIN lop l ON sv.lop_id = l.id ${fbWhere}`,
        fbParams
      );

      // Thông tin khoa (nếu chọn cụ thể) hoặc toàn trường
      let khoaInfo = null;
      if (khoaId) {
        const [kRows] = await pool.execute('SELECT * FROM khoa WHERE id = ?', [khoaId]);
        khoaInfo = kRows[0] || null;
      } else {
        khoaInfo = { ten_khoa: 'Toàn bộ các Khoa (Quyền Quản trị viên Trường)' };
      }

      return res.status(200).json({
        success: true,
        data: {
          khoa: khoaInfo,
          stats: {
            totalStudents: svCount[0]?.total || 0,
            totalTeachers: gvCount[0]?.total || 0,
            totalClasses: lopCount[0]?.total || 0,
            totalCurriculums: ctdtCount[0]?.total || 0,
            pendingWarnings: warningCount[0]?.total || 0,
            pendingFeedbacks: feedbackCount[0]?.total || 0
          }
        }
      });
    } catch (error) {
      console.error('[facultyController.getDashboardStats]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 2. Danh sách Sinh viên thuộc Khoa / Toàn trường
   * GET /api/faculty/students
   */
  async getStudents(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);
      const { lop_id, search, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      let query = `
        SELECT 
          sv.id, sv.ma_sv, sv.ho_ten, sv.ngay_sinh, sv.gioi_tinh, sv.email, sv.avatar_url,
          (sv.face_embedding IS NOT NULL) AS has_face,
          l.id AS lop_id, l.ma_lop, l.ten_lop, l.khoa_hoc,
          sv.so_dien_thoai AS so_dien_thoai_ca_nhan, sv.so_cmnd_cccd
        FROM sinh_vien sv
        JOIN lop l ON sv.lop_id = l.id
        JOIN khoa k ON l.khoa_id = k.id
        WHERE sv.is_deleted = FALSE
      `;
      const params = [];

      if (khoaId) {
        query += ' AND l.khoa_id = ?';
        params.push(khoaId);
      }

      if (lop_id) {
        query += ' AND sv.lop_id = ?';
        params.push(lop_id);
      }

      if (search) {
        query += ' AND (sv.ma_sv LIKE ? OR sv.ho_ten LIKE ? OR sv.email LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      query += ` ORDER BY l.ma_lop ASC, sv.ma_sv ASC LIMIT ${parseInt(limit, 10)} OFFSET ${offset}`;

      const [students] = await pool.execute(query, params);

      // Lấy danh sách các lớp để làm bộ lọc
      const classWhere = khoaId ? 'WHERE khoa_id = ? AND is_deleted = FALSE' : 'WHERE is_deleted = FALSE';
      const classParams = khoaId ? [khoaId] : [];
      const [classes] = await pool.execute(
        `SELECT id, ma_lop, ten_lop, khoa_hoc FROM lop ${classWhere}`,
        classParams
      );

      const [faculties] = await pool.execute('SELECT id, ma_khoa, ten_khoa FROM khoa WHERE is_deleted = FALSE');

      return res.status(200).json({
        success: true,
        data: {
          students,
          classes,
          faculties
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 3. Xem chi tiết Sơ yếu lý lịch sinh viên trong Khoa / Toàn trường
   * GET /api/faculty/students/:id/resume
   */
  async getStudentResume(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);
      const { id } = req.params;

      let query = `
        SELECT sv.*, l.ma_lop, l.ten_lop, l.khoa_hoc, k.ten_khoa 
        FROM sinh_vien sv
        JOIN lop l ON sv.lop_id = l.id
        JOIN khoa k ON l.khoa_id = k.id
        WHERE sv.id = ? AND sv.is_deleted = FALSE
      `;
      const params = [id];

      if (khoaId) {
        query += ' AND l.khoa_id = ?';
        params.push(khoaId);
      }

      const [svRows] = await pool.execute(query, params);

      if (svRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Sinh viên không thuộc phạm vi quản lý của bạn.' });
      }

      const sv = svRows[0];
      let family = [];
      let admission = null;
      try {
        if (sv.thong_tin_gia_dinh) {
          family = typeof sv.thong_tin_gia_dinh === 'string' ? JSON.parse(sv.thong_tin_gia_dinh) : sv.thong_tin_gia_dinh;
        }
        if (sv.thong_tin_tuyen_sinh) {
          admission = typeof sv.thong_tin_tuyen_sinh === 'string' ? JSON.parse(sv.thong_tin_tuyen_sinh) : sv.thong_tin_tuyen_sinh;
        }
      } catch (e) {}

      return res.status(200).json({
        success: true,
        data: {
          basicInfo: sv,
          personalDetail: {
            id: sv.id,
            sinh_vien_id: sv.id,
            so_cmnd_cccd: sv.so_cmnd_cccd,
            que_quan: sv.que_quan,
            dan_toc: sv.dan_toc,
            ton_giao: sv.ton_giao,
            dia_chi_thuong_tru: sv.dia_chi_thuong_tru,
            so_dien_thoai_ca_nhan: sv.so_dien_thoai
          },
          family,
          admission
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 4. Quản lý Khung Chương trình đào tạo (CTĐT) của Khoa / Toàn trường
   * GET /api/faculty/curriculums
   */
  async getCurriculums(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);

      let query = `
        SELECT ctdt.*, k.ma_khoa, k.ten_khoa, n.ma_nganh, n.ten_nganh,
               (SELECT COUNT(*) FROM ctdt_hoc_phan WHERE chuong_trinh_dao_tao_id = ctdt.id) AS so_hoc_phan,
               (SELECT COALESCE(SUM(mh.so_tin_chi), 0) FROM ctdt_hoc_phan chp JOIN mon_hoc mh ON chp.mon_hoc_id = mh.id WHERE chp.chuong_trinh_dao_tao_id = ctdt.id) AS tong_tin_chi_thuc_te
        FROM chuong_trinh_dao_tao ctdt
        JOIN khoa k ON ctdt.khoa_id = k.id
        JOIN nganh_hoc n ON ctdt.nganh_hoc_id = n.id
        WHERE ctdt.is_deleted = FALSE
      `;
      const params = [];

      if (khoaId) {
        query += ' AND ctdt.khoa_id = ?';
        params.push(khoaId);
      }

      query += ' ORDER BY k.ma_khoa ASC, ctdt.khoa_tuyen_sinh DESC, ctdt.id DESC';
      const [curriculums] = await pool.execute(query, params);

      const majorWhere = khoaId ? 'WHERE khoa_id = ? AND is_deleted = FALSE' : 'WHERE is_deleted = FALSE';
      const majorParams = khoaId ? [khoaId] : [];
      const [majors] = await pool.execute(
        `SELECT id, khoa_id, ma_nganh, ten_nganh FROM nganh_hoc ${majorWhere}`,
        majorParams
      );

      const [faculties] = await pool.execute('SELECT id, ma_khoa, ten_khoa FROM khoa WHERE is_deleted = FALSE');

      return res.status(200).json({
        success: true,
        data: {
          curriculums,
          majors,
          faculties
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Tạo khung CTĐT mới (hỗ trợ kèm danh sách môn học ban đầu)
   * POST /api/faculty/curriculums
   */
  async createCurriculum(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      let khoaId = facultyController._getKhoaId(req) || req.body.khoa_id;
      const {
        nganh_hoc_id,
        ma_ctdt,
        ten_ctdt,
        khoa_tuyen_sinh,
        nam_ban_hanh,
        quyet_dinh_ban_hanh,
        tong_tin_chi_yeu_cau,
        chuyen_nganh,
        he_dao_tao,
        courses = []
      } = req.body;

      if (!nganh_hoc_id || !ma_ctdt || !ten_ctdt || !khoa_tuyen_sinh) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ mã, tên CTĐT, ngành và khóa tuyển sinh.' });
      }

      if (!khoaId && nganh_hoc_id) {
        const [nganhRows] = await connection.execute('SELECT khoa_id FROM nganh_hoc WHERE id = ?', [nganh_hoc_id]);
        if (nganhRows.length > 0) {
          khoaId = nganhRows[0].khoa_id;
        }
      }
      if (!khoaId) khoaId = 1;

      const [result] = await connection.execute(
        `INSERT INTO chuong_trinh_dao_tao (khoa_id, nganh_hoc_id, ma_ctdt, ten_ctdt, khoa_tuyen_sinh, nam_ban_hanh, quyet_dinh_ban_hanh, tong_tin_chi_yeu_cau, chuyen_nganh, he_dao_tao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          khoaId,
          nganh_hoc_id,
          ma_ctdt.trim(),
          ten_ctdt.trim(),
          khoa_tuyen_sinh.trim(),
          nam_ban_hanh || new Date().getFullYear(),
          quyet_dinh_ban_hanh || null,
          tong_tin_chi_yeu_cau || 135,
          chuyen_nganh || 'Chuyên Ngành Chính',
          he_dao_tao || 'Đại học chính quy'
        ]
      );
      const ctdtId = result.insertId;

      // Nếu có kèm danh sách môn ban đầu
      if (Array.isArray(courses) && courses.length > 0) {
        for (const item of courses) {
          if (item.mon_hoc_id) {
            await connection.execute(
              `INSERT INTO ctdt_hoc_phan 
                (chuong_trinh_dao_tao_id, mon_hoc_id, hoc_ky_goi_y, khoi_kien_thuc, loai_hoc_phan, so_tiet, dieu_kien_tien_quyet, nhom_tu_chon, ghi_chu, de_cuong_url, mon_tien_quyet_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                ctdtId,
                item.mon_hoc_id,
                item.hoc_ky_goi_y || 1,
                item.khoi_kien_thuc || 'CoSoNganh',
                item.loai_hoc_phan || 'BatBuoc',
                item.so_tiet || null,
                item.dieu_kien_tien_quyet || null,
                item.nhom_tu_chon || null,
                item.ghi_chu || null,
                item.de_cuong_url || null,
                item.mon_tien_quyet_id || null
              ]
            );
          }
        }
      }

      await connection.commit();
      return res.status(201).json({
        success: true,
        message: 'Tạo khung chương trình đào tạo thành công!',
        data: { id: ctdtId }
      });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  },

  /**
   * Chi tiết khung CTĐT + Danh sách môn học chuẩn theo bảng thực tế
   * GET /api/faculty/curriculums/:id
   */
  async getCurriculumDetail(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);
      const { id } = req.params;

      const [ctdtRows] = await pool.execute(
        `SELECT ctdt.*, n.ma_nganh, n.ten_nganh, k.ten_khoa, k.ma_khoa 
         FROM chuong_trinh_dao_tao ctdt
         JOIN nganh_hoc n ON ctdt.nganh_hoc_id = n.id
         JOIN khoa k ON ctdt.khoa_id = k.id
         WHERE ctdt.id = ? AND ctdt.is_deleted = FALSE`,
        [id]
      );

      if (ctdtRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khung CTĐT.' });
      }

      const [courses] = await pool.execute(
        `SELECT 
          chp.id, chp.hoc_ky_goi_y, chp.khoi_kien_thuc, chp.loai_hoc_phan,
          COALESCE(chp.so_tiet, mh.so_tin_chi * 15) AS so_tiet,
          chp.dieu_kien_tien_quyet, chp.nhom_tu_chon, chp.ghi_chu, chp.de_cuong_url,
          mh.id AS mon_hoc_id, mh.ma_mon, mh.ten_mon, mh.so_tin_chi, mh.so_buoi_hoc,
          tq.id AS mon_tien_quyet_id, tq.ma_mon AS ma_mon_tien_quyet, tq.ten_mon AS ten_mon_tien_quyet
         FROM ctdt_hoc_phan chp
         JOIN mon_hoc mh ON chp.mon_hoc_id = mh.id
         LEFT JOIN mon_hoc tq ON chp.mon_tien_quyet_id = tq.id
         WHERE chp.chuong_trinh_dao_tao_id = ?
         ORDER BY chp.hoc_ky_goi_y ASC, chp.loai_hoc_phan ASC, mh.ma_mon ASC`,
        [id]
      );

      // Lấy danh sách môn học thuộc Khoa hoặc môn Đại Cương liên khoa để lựa chọn thêm vào khung
      const ctdtKhoaId = ctdtRows[0].khoa_id;
      const [allCourses] = await pool.execute(
        `SELECT id, ma_mon, ten_mon, so_tin_chi, khoa_id 
         FROM mon_hoc 
         WHERE (khoa_id = ? OR loai_mon = 'DaiCuong') AND is_deleted = FALSE 
         ORDER BY ma_mon ASC, ten_mon ASC`,
        [ctdtKhoaId]
      );

      return res.status(200).json({
        success: true,
        data: {
          curriculum: ctdtRows[0],
          courses,
          allCourses
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Thêm môn học vào khung CTĐT
   * POST /api/faculty/curriculums/:id/courses
   */
  async addCourseToCurriculum(req, res) {
    try {
      const { id } = req.params;
      const {
        mon_hoc_id,
        hoc_ky_goi_y,
        khoi_kien_thuc,
        loai_hoc_phan,
        so_tiet,
        dieu_kien_tien_quyet,
        nhom_tu_chon,
        ghi_chu,
        de_cuong_url,
        mon_tien_quyet_id
      } = req.body;

      if (!mon_hoc_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn môn học cần thêm.' });
      }

      // Kiểm tra môn có thuộc Khoa quản lý của CTĐT hoặc là môn đại cương không
      const [ctdtRows] = await pool.execute('SELECT khoa_id FROM chuong_trinh_dao_tao WHERE id = ?', [id]);
      if (ctdtRows.length > 0) {
        const ctdtKhoa = ctdtRows[0].khoa_id;
        const [mhRows] = await pool.execute('SELECT khoa_id, loai_mon FROM mon_hoc WHERE id = ?', [mon_hoc_id]);
        if (mhRows.length > 0 && mhRows[0].khoa_id !== ctdtKhoa && mhRows[0].loai_mon !== 'DaiCuong') {
          return res.status(400).json({
            success: false,
            message: 'Môn học này thuộc Khoa khác, không thể đưa vào Khung chương trình đào tạo của Khoa này.'
          });
        }
      }

      // Kiểm tra môn đã có trong CTĐT chưa
      const [dup] = await pool.execute(
        'SELECT id FROM ctdt_hoc_phan WHERE chuong_trinh_dao_tao_id = ? AND mon_hoc_id = ?',
        [id, mon_hoc_id]
      );
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: 'Môn học này đã có trong khung CTĐT rồi.' });
      }

      // Lấy thông tin số tín chỉ của môn nếu chưa nhập số tiết
      let finalSoTiet = so_tiet ? parseInt(so_tiet, 10) : null;
      if (!finalSoTiet) {
        const [mh] = await pool.execute('SELECT so_tin_chi FROM mon_hoc WHERE id = ?', [mon_hoc_id]);
        if (mh.length > 0) {
          finalSoTiet = mh[0].so_tin_chi * 15;
        }
      }

      await pool.execute(
        `INSERT INTO ctdt_hoc_phan 
          (chuong_trinh_dao_tao_id, mon_hoc_id, hoc_ky_goi_y, khoi_kien_thuc, loai_hoc_phan, so_tiet, dieu_kien_tien_quyet, nhom_tu_chon, ghi_chu, de_cuong_url, mon_tien_quyet_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          mon_hoc_id,
          hoc_ky_goi_y || 1,
          khoi_kien_thuc || 'CoSoNganh',
          loai_hoc_phan || 'BatBuoc',
          finalSoTiet,
          dieu_kien_tien_quyet || null,
          nhom_tu_chon || null,
          ghi_chu || null,
          de_cuong_url || null,
          mon_tien_quyet_id || null
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Thêm môn học vào khung chương trình thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Cập nhật thông tin môn học trong khung CTĐT
   * PUT /api/faculty/curriculums/:id/courses/:courseId
   */
  async updateCourseInCurriculum(req, res) {
    try {
      const { courseId } = req.params;
      const {
        hoc_ky_goi_y,
        khoi_kien_thuc,
        loai_hoc_phan,
        so_tiet,
        dieu_kien_tien_quyet,
        nhom_tu_chon,
        ghi_chu,
        de_cuong_url,
        mon_tien_quyet_id
      } = req.body;

      await pool.execute(
        `UPDATE ctdt_hoc_phan 
         SET hoc_ky_goi_y = ?, khoi_kien_thuc = ?, loai_hoc_phan = ?, so_tiet = ?, 
             dieu_kien_tien_quyet = ?, nhom_tu_chon = ?, ghi_chu = ?, de_cuong_url = ?, mon_tien_quyet_id = ?
         WHERE id = ?`,
        [
          hoc_ky_goi_y || 1,
          khoi_kien_thuc || 'CoSoNganh',
          loai_hoc_phan || 'BatBuoc',
          so_tiet || null,
          dieu_kien_tien_quyet || null,
          nhom_tu_chon || null,
          ghi_chu || null,
          de_cuong_url || null,
          mon_tien_quyet_id || null,
          courseId
        ]
      );

      return res.status(200).json({ success: true, message: 'Cập nhật môn học thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Thêm hàng loạt môn học vào khung CTĐT
   * POST /api/faculty/curriculums/:id/courses/bulk
   */
  async bulkAddCoursesToCurriculum(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;
      const { courses = [] } = req.body;

      if (!Array.isArray(courses) || courses.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách môn học gửi lên rỗng.' });
      }

      let addedCount = 0;
      for (const item of courses) {
        if (!item.mon_hoc_id) continue;
        const [dup] = await connection.execute(
          'SELECT id FROM ctdt_hoc_phan WHERE chuong_trinh_dao_tao_id = ? AND mon_hoc_id = ?',
          [id, item.mon_hoc_id]
        );
        if (dup.length === 0) {
          await connection.execute(
            `INSERT INTO ctdt_hoc_phan 
              (chuong_trinh_dao_tao_id, mon_hoc_id, hoc_ky_goi_y, khoi_kien_thuc, loai_hoc_phan, so_tiet, dieu_kien_tien_quyet, nhom_tu_chon, ghi_chu, de_cuong_url, mon_tien_quyet_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.mon_hoc_id,
              item.hoc_ky_goi_y || 1,
              item.khoi_kien_thuc || 'CoSoNganh',
              item.loai_hoc_phan || 'BatBuoc',
              item.so_tiet || null,
              item.dieu_kien_tien_quyet || null,
              item.nhom_tu_chon || null,
              item.ghi_chu || null,
              item.de_cuong_url || null,
              item.mon_tien_quyet_id || null
            ]
          );
          addedCount++;
        }
      }

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: `Đã thêm thành công ${addedCount} môn học vào khung CTĐT!`
      });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  },

  /**
   * Xóa môn khỏi khung CTĐT
   * DELETE /api/faculty/curriculums/:id/courses/:courseId
   */
  async removeCourseFromCurriculum(req, res) {
    try {
      const { courseId } = req.params;
      await pool.execute('DELETE FROM ctdt_hoc_phan WHERE id = ?', [courseId]);
      return res.status(200).json({ success: true, message: 'Đã xóa môn khỏi khung đào tạo.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 5. Quản lý Cảnh báo học vụ
   * GET /api/faculty/academic-warnings
   */
  async getAcademicWarnings(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);

      let query = `
        SELECT 
          cb.*,
          sv.ma_sv, sv.ho_ten, sv.email,
          l.ma_lop, l.ten_lop,
          k.ten_khoa,
          hk.ten_hoc_ky, hk.nam_hoc
        FROM canh_bao_hoc_vu cb
        JOIN sinh_vien sv ON cb.sinh_vien_id = sv.id
        JOIN lop l ON sv.lop_id = l.id
        JOIN khoa k ON l.khoa_id = k.id
        JOIN hoc_ky hk ON cb.hoc_ky_id = hk.id
      `;
      const params = [];

      if (khoaId) {
        query += ' WHERE l.khoa_id = ?';
        params.push(khoaId);
      }

      query += ' ORDER BY cb.ngay_ra_quyet_dinh DESC, cb.id DESC';
      const [warnings] = await pool.execute(query, params);

      const [semesters] = await pool.execute('SELECT id, ten_hoc_ky, nam_hoc FROM hoc_ky WHERE is_deleted = FALSE');
      const [faculties] = await pool.execute('SELECT id, ma_khoa, ten_khoa FROM khoa WHERE is_deleted = FALSE');

      return res.status(200).json({
        success: true,
        data: {
          warnings,
          semesters,
          faculties
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Ban hành Cảnh báo học vụ
   * POST /api/faculty/academic-warnings
   */
  async createAcademicWarning(req, res) {
    try {
      const { sinh_vien_id, hoc_ky_id, muc_canh_bao, ly_do, so_quyet_dinh, ngay_ra_quyet_dinh } = req.body;

      if (!sinh_vien_id || !hoc_ky_id || !muc_canh_bao || !ly_do) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin sinh viên, học kỳ, mức cảnh báo và lý do.' });
      }

      await pool.execute(
        `INSERT INTO canh_bao_hoc_vu (sinh_vien_id, hoc_ky_id, muc_canh_bao, ly_do, so_quyet_dinh, ngay_ra_quyet_dinh, nguoi_ky_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sinh_vien_id, hoc_ky_id, muc_canh_bao, ly_do, so_quyet_dinh || null, ngay_ra_quyet_dinh || new Date(), req.user.id]
      );

      return res.status(201).json({
        success: true,
        message: 'Ghi nhận quyết định xử lý học vụ thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 6. Phê duyệt Điểm rèn luyện
   * GET /api/faculty/conduct-scores
   */
  async getConductScores(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);
      const { hoc_ky_id } = req.query;

      let query = `
        SELECT 
          drl.*,
          sv.ma_sv, sv.ho_ten,
          l.ma_lop,
          hk.ten_hoc_ky, hk.nam_hoc
        FROM diem_ren_luyen drl
        JOIN sinh_vien sv ON drl.sinh_vien_id = sv.id
        JOIN lop l ON sv.lop_id = l.id
        JOIN hoc_ky hk ON drl.hoc_ky_id = hk.id
        WHERE l.khoa_id = ?
      `;
      const params = [khoaId];

      if (hoc_ky_id) {
        query += ' AND drl.hoc_ky_id = ?';
        params.push(hoc_ky_id);
      }

      query += ' ORDER BY drl.trang_thai_duyet ASC, sv.ma_sv ASC';

      const [scores] = await pool.execute(query, params);
      return res.status(200).json({ success: true, data: scores });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Hội đồng Khoa duyệt điểm rèn luyện
   * PUT /api/faculty/conduct-scores/:id/approve
   */
  async approveConductScore(req, res) {
    try {
      const { id } = req.params;
      const { diem_khoa_duyet, xep_loai } = req.body;

      await pool.execute(
        `UPDATE diem_ren_luyen SET
          diem_khoa_duyet = ?,
          xep_loai = ?,
          trang_thai_duyet = 'DaKhoaDiem',
          ngay_duyet = NOW()
         WHERE id = ?`,
        [diem_khoa_duyet, xep_loai || 'Kha', id]
      );

      return res.status(200).json({
        success: true,
        message: 'Phê duyệt điểm rèn luyện chính thức thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 7. Quản lý Ý kiến / Khiếu nại của sinh viên trong Khoa
   * GET /api/faculty/feedback
   */
  async getFeedbacks(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);

      const [feedbacks] = await pool.execute(
        `SELECT 
          yk.*,
          sv.ma_sv, sv.ho_ten, sv.email,
          l.ma_lop,
          u.username AS nguoi_phan_hoi_ten
         FROM y_kien_sinh_vien yk
         JOIN sinh_vien sv ON yk.sinh_vien_id = sv.id
         JOIN lop l ON sv.lop_id = l.id
         LEFT JOIN users u ON yk.nguoi_phan_hoi_id = u.id
         WHERE l.khoa_id = ?
         ORDER BY yk.created_at DESC`,
        [khoaId]
      );

      return res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Phản hồi ý kiến sinh viên
   * PUT /api/faculty/feedback/:id/reply
   */
  async replyFeedback(req, res) {
    try {
      const { id } = req.params;
      const { noi_dung_phan_hoi, trang_thai = 'DaPhanHoi' } = req.body;

      if (!noi_dung_phan_hoi) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung phản hồi.' });
      }

      await pool.execute(
        `UPDATE y_kien_sinh_vien SET
          noi_dung_phan_hoi = ?,
          nguoi_phan_hoi_id = ?,
          ngay_phan_hoi = NOW(),
          trang_thai = ?
         WHERE id = ?`,
        [noi_dung_phan_hoi, req.user.id, trang_thai, id]
      );

      return res.status(200).json({
        success: true,
        message: 'Gửi phản hồi cho sinh viên thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 7. Quản lý / Theo dõi Học phí sinh viên trong Khoa
   * GET /api/faculty/tuition
   */
  async getFacultyTuition(req, res) {
    try {
      const khoaId = facultyController._getKhoaId(req);
      const { lop_id, hoc_ky_id, trang_thai, search } = req.query;

      let whereConditions = ['sv.is_deleted = FALSE'];
      let params = [];

      if (khoaId) {
        whereConditions.push('l.khoa_id = ?');
        params.push(khoaId);
      }

      if (lop_id && lop_id !== 'all') {
        whereConditions.push('sv.lop_id = ?');
        params.push(parseInt(lop_id, 10));
      }

      if (hoc_ky_id && hoc_ky_id !== 'all') {
        whereConditions.push('cn.hoc_ky_id = ?');
        params.push(parseInt(hoc_ky_id, 10));
      }

      if (trang_thai && trang_thai !== 'all') {
        whereConditions.push('cn.trang_thai = ?');
        params.push(trang_thai);
      }

      if (search) {
        whereConditions.push('(sv.ma_sv LIKE ? OR sv.ho_ten LIKE ? OR cn.so_bien_lai LIKE ?)');
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          cn.*,
          sv.ma_sv, sv.ho_ten, sv.email, sv.sdt,
          l.ma_lop, l.ten_lop,
          k.id AS khoa_id, k.ten_khoa,
          hk.ten_hoc_ky, hk.nam_hoc,
          u.username AS nguoi_xac_nhan_ten
        FROM cong_no_hoc_phi cn
        JOIN sinh_vien sv ON cn.sinh_vien_id = sv.id
        JOIN lop l ON sv.lop_id = l.id
        JOIN khoa k ON l.khoa_id = k.id
        LEFT JOIN hoc_ky hk ON cn.hoc_ky_id = hk.id
        LEFT JOIN users u ON cn.nguoi_xac_nhan_id = u.id
        ${whereClause}
        ORDER BY cn.id DESC
      `;

      const [tuitionList] = await pool.execute(query, params);

      // Thống kê tổng quan cho Khoa
      let tongPhaiThu = 0;
      let tongDaThu = 0;
      let tongConNo = 0;
      let tongMienGiam = 0;
      const uniqueSv = new Set();

      tuitionList.forEach(t => {
        tongPhaiThu += parseFloat(t.tong_hoc_phi_phai_nop || 0);
        tongDaThu += parseFloat(t.so_tien_da_dong || 0);
        tongConNo += parseFloat(t.so_tien_con_no || 0);
        tongMienGiam += parseFloat(t.so_tien_mien_giam || 0);
        uniqueSv.add(t.sinh_vien_id);
      });

      // Lấy danh sách lớp và học kỳ phục vụ bộ lọc
      const classWhere = khoaId ? 'WHERE khoa_id = ? AND is_deleted = FALSE' : 'WHERE is_deleted = FALSE';
      const classParams = khoaId ? [khoaId] : [];
      const [classes] = await pool.execute(`SELECT id, ma_lop, ten_lop FROM lop ${classWhere} ORDER BY ten_lop ASC`, classParams);
      const [semesters] = await pool.execute('SELECT id, ten_hoc_ky, nam_hoc FROM hoc_ky WHERE is_deleted = FALSE ORDER BY id DESC');

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            tong_sinh_vien: uniqueSv.size,
            tong_ban_ghi: tuitionList.length,
            tong_phai_thu: tongPhaiThu,
            tong_da_thu: tongDaThu,
            tong_con_no: tongConNo,
            tong_mien_giam: tongMienGiam,
            ti_le_hoan_thanh: tongPhaiThu > 0 ? Math.round((tongDaThu / (tongPhaiThu - tongMienGiam || 1)) * 100) : 100
          },
          tuitions: tuitionList,
          classes,
          semesters
        }
      });
    } catch (error) {
      console.error('[facultyController.getFacultyTuition]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = facultyController;
