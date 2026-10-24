const { pool } = require('../../config/db');

/**
 * Controller Quản lý Học thuật (Admin)
 * Quản lý các bảng: khoa, lop, mon_hoc, hoc_ky
 */
const academicController = {
  // --- KHOA ---
  async getFaculties(req, res) {
    try {
      const query = `
        SELECT 
          k.*,
          (SELECT COUNT(*) FROM lop l WHERE l.khoa_id = k.id AND l.is_deleted = FALSE) AS total_classes,
          (SELECT COUNT(*) FROM giang_vien gv WHERE gv.khoa_id = k.id AND gv.is_deleted = FALSE) AS total_teachers,
          (SELECT COUNT(*) FROM sinh_vien sv JOIN lop l ON sv.lop_id = l.id WHERE l.khoa_id = k.id AND sv.is_deleted = FALSE) AS total_students
        FROM khoa k
        WHERE k.is_deleted = FALSE
        ORDER BY k.id ASC
      `;
      const [rows] = await pool.query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createFaculty(req, res) {
    try {
      const { ma_khoa, ten_khoa, so_dien_thoai, email, van_phong, truong_khoa } = req.body;
      if (!ma_khoa || !ten_khoa) {
        return res.status(400).json({ success: false, message: 'Mã khoa và Tên khoa không được để trống.' });
      }
      const [result] = await pool.execute(
        'INSERT INTO khoa (ma_khoa, ten_khoa, so_dien_thoai, email, van_phong, truong_khoa) VALUES (?, ?, ?, ?, ?, ?)',
        [ma_khoa, ten_khoa, so_dien_thoai || null, email || null, van_phong || null, truong_khoa || null]
      );
      return res.status(201).json({ success: true, message: 'Thêm khoa thành công!', data: { id: result.insertId } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- LỚP ---
  async getClasses(req, res) {
    try {
      const query = `
        SELECT l.*, k.ten_khoa, (SELECT COUNT(*) FROM sinh_vien sv WHERE sv.lop_id = l.id AND sv.is_deleted = FALSE) AS total_students
        FROM lop l
        LEFT JOIN khoa k ON l.khoa_id = k.id
        WHERE l.is_deleted = FALSE
        ORDER BY l.id DESC
      `;
      const [rows] = await pool.query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createClass(req, res) {
    try {
      const { ma_lop, ten_lop, khoa_hoc, khoa_id } = req.body;
      if (!ma_lop || !ten_lop || !khoa_hoc || !khoa_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin lớp học.' });
      }
      const [result] = await pool.execute(
        'INSERT INTO lop (ma_lop, ten_lop, khoa_hoc, khoa_id) VALUES (?, ?, ?, ?)',
        [ma_lop, ten_lop, khoa_hoc, khoa_id]
      );
      return res.status(201).json({ success: true, message: 'Thêm lớp học thành công!', data: { id: result.insertId } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- MÔN HỌC ---
  async getSubjects(req, res) {
    try {
      const query = `
        SELECT mh.*, k.ten_khoa 
        FROM mon_hoc mh
        LEFT JOIN khoa k ON mh.khoa_id = k.id
        WHERE mh.is_deleted = FALSE
        ORDER BY mh.id ASC
      `;
      const [rows] = await pool.query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createSubject(req, res) {
    try {
      const { ma_mon, ten_mon, so_tin_chi, so_buoi_hoc, khoa_id } = req.body;
      if (!ma_mon || !ten_mon || !so_tin_chi || !khoa_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin môn học.' });
      }
      const sessionsCount = so_buoi_hoc ? parseInt(so_buoi_hoc) : (parseInt(so_tin_chi) * 5 || 15);
      const [result] = await pool.execute(
        'INSERT INTO mon_hoc (ma_mon, ten_mon, so_tin_chi, so_buoi_hoc, khoa_id) VALUES (?, ?, ?, ?, ?)',
        [ma_mon, ten_mon, so_tin_chi, sessionsCount, khoa_id]
      );
      return res.status(201).json({ success: true, message: 'Thêm môn học thành công!', data: { id: result.insertId } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- HỌC KỲ ---
  async getSemesters(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM hoc_ky WHERE is_deleted = FALSE ORDER BY ngay_bat_dau DESC');
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createSemester(req, res) {
    try {
      const { ten_hoc_ky, nam_hoc, ngay_bat_dau, ngay_ket_thuc, is_active } = req.body;
      if (!ten_hoc_ky || !nam_hoc || !ngay_bat_dau || !ngay_ket_thuc) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin học kỳ.' });
      }
      const [result] = await pool.execute(
        'INSERT INTO hoc_ky (ten_hoc_ky, nam_hoc, ngay_bat_dau, ngay_ket_thuc, is_active) VALUES (?, ?, ?, ?, ?)',
        [ten_hoc_ky, nam_hoc, ngay_bat_dau, ngay_ket_thuc, is_active ? 1 : 0]
      );
      return res.status(201).json({ success: true, message: 'Thêm học kỳ thành công!', data: { id: result.insertId } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- CẬP NHẬT & XÓA KHOA ---
  async updateFaculty(req, res) {
    try {
      const { id } = req.params;
      const { ten_khoa, so_dien_thoai, email, van_phong, truong_khoa, is_active } = req.body;
      if (!ten_khoa) {
        return res.status(400).json({ success: false, message: 'Tên khoa không được để trống.' });
      }
      await pool.execute(
        'UPDATE khoa SET ten_khoa = ?, so_dien_thoai = ?, email = ?, van_phong = ?, truong_khoa = ?, is_active = ? WHERE id = ?',
        [ten_khoa, so_dien_thoai || null, email || null, van_phong || null, truong_khoa || null, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );
      return res.status(200).json({ success: true, message: 'Cập nhật khoa thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật khoa: ' + error.message });
    }
  },

  // Lấy danh sách sinh viên thuộc lớp
  async getClassStudents(req, res) {
    try {
      const { classId } = req.params;
      const query = `
        SELECT 
          sv.id, sv.ma_sv, sv.ho_ten, sv.email, sv.ngay_sinh, sv.gioi_tinh, sv.avatar_url, sv.is_active,
          (sv.face_embedding IS NOT NULL) AS has_face_registered,
          l.ten_lop, l.ma_lop, k.ten_khoa
        FROM sinh_vien sv
        JOIN lop l ON sv.lop_id = l.id
        LEFT JOIN khoa k ON l.khoa_id = k.id
        WHERE sv.lop_id = ? AND sv.is_deleted = FALSE
        ORDER BY sv.ho_ten ASC
      `;
      const [rows] = await pool.execute(query, [classId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteFaculty(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('UPDATE khoa SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa khoa thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa khoa: ' + error.message });
    }
  },

  // --- CẬP NHẬT & XÓA LỚP ---
  async updateClass(req, res) {
    try {
      const { id } = req.params;
      const { ten_lop, khoa_hoc, khoa_id, is_active } = req.body;
      if (!ten_lop || !khoa_hoc || !khoa_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ tên lớp, khóa học và khoa.' });
      }
      await pool.execute(
        'UPDATE lop SET ten_lop = ?, khoa_hoc = ?, khoa_id = ?, is_active = ? WHERE id = ?',
        [ten_lop, khoa_hoc, khoa_id, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );
      return res.status(200).json({ success: true, message: 'Cập nhật lớp thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật lớp: ' + error.message });
    }
  },

  async deleteClass(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('UPDATE lop SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa lớp thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa lớp: ' + error.message });
    }
  },

  // --- CẬP NHẬT & XÓA MÔN HỌC ---
  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const { ten_mon, so_tin_chi, so_buoi_hoc, khoa_id, is_active } = req.body;
      if (!ten_mon || !so_tin_chi || !khoa_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin môn học.' });
      }
      const sessionsCount = so_buoi_hoc ? parseInt(so_buoi_hoc) : (parseInt(so_tin_chi) * 5 || 15);
      await pool.execute(
        'UPDATE mon_hoc SET ten_mon = ?, so_tin_chi = ?, so_buoi_hoc = ?, khoa_id = ?, is_active = ? WHERE id = ?',
        [ten_mon, so_tin_chi, sessionsCount, khoa_id, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );
      return res.status(200).json({ success: true, message: 'Cập nhật môn học thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật môn học: ' + error.message });
    }
  },

  async deleteSubject(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('UPDATE mon_hoc SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa môn học thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa môn học: ' + error.message });
    }
  },

  // --- CẬP NHẬT & XÓA HỌC KỲ ---
  async updateSemester(req, res) {
    try {
      const { id } = req.params;
      const { ten_hoc_ky, nam_hoc, ngay_bat_dau, ngay_ket_thuc, is_active } = req.body;
      if (!ten_hoc_ky || !nam_hoc || !ngay_bat_dau || !ngay_ket_thuc) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin học kỳ.' });
      }
      const formattedStart = new Date(ngay_bat_dau).toISOString().split('T')[0];
      const formattedEnd = new Date(ngay_ket_thuc).toISOString().split('T')[0];

      await pool.execute(
        'UPDATE hoc_ky SET ten_hoc_ky = ?, nam_hoc = ?, ngay_bat_dau = ?, ngay_ket_thuc = ?, is_active = ? WHERE id = ?',
        [ten_hoc_ky, nam_hoc, formattedStart, formattedEnd, is_active ? 1 : 0, id]
      );
      return res.status(200).json({ success: true, message: 'Cập nhật học kỳ thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật học kỳ: ' + error.message });
    }
  },

  async deleteSemester(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('UPDATE hoc_ky SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa học kỳ thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa học kỳ: ' + error.message });
    }
  },

  // --- NGÀNH ĐÀO TẠO (nganh_hoc) ---
  async getMajors(req, res) {
    try {
      const { khoa_id } = req.query;
      let query = `
        SELECT 
          n.*,
          k.ten_khoa, k.ma_khoa,
          (SELECT COUNT(*) FROM chuong_trinh_dao_tao ctdt WHERE ctdt.nganh_hoc_id = n.id AND ctdt.is_deleted = FALSE) AS total_curriculums,
          (SELECT COUNT(*) FROM lop l WHERE l.ma_nganh = n.ma_nganh AND l.is_deleted = FALSE) AS total_classes
        FROM nganh_hoc n
        JOIN khoa k ON n.khoa_id = k.id
        WHERE n.is_deleted = FALSE
      `;
      const params = [];
      if (khoa_id && khoa_id !== 'all') {
        query += ' AND n.khoa_id = ?';
        params.push(khoa_id);
      }
      query += ' ORDER BY k.id ASC, n.ma_nganh ASC';
      const [rows] = await pool.execute(query, params);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi tải danh sách ngành học: ' + error.message });
    }
  },

  async createMajor(req, res) {
    try {
      const { khoa_id, ma_nganh, ten_nganh, thoi_gian_dao_tao_nam, tong_tin_chi_yeu_cau } = req.body;
      if (!khoa_id || !ma_nganh || !ten_nganh) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn Khoa, nhập Mã ngành và Tên ngành đào tạo.' });
      }

      const [dup] = await pool.execute('SELECT id FROM nganh_hoc WHERE ma_nganh = ? AND is_deleted = FALSE', [ma_nganh.trim()]);
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: 'Mã ngành đào tạo này đã tồn tại trong hệ thống.' });
      }

      const [result] = await pool.execute(
        `INSERT INTO nganh_hoc (khoa_id, ma_nganh, ten_nganh, thoi_gian_dao_tao_nam, tong_tin_chi_yeu_cau, is_active, is_deleted)
         VALUES (?, ?, ?, ?, ?, 1, 0)`,
        [
          khoa_id,
          ma_nganh.trim(),
          ten_nganh.trim(),
          parseFloat(thoi_gian_dao_tao_nam) || 4,
          parseInt(tong_tin_chi_yeu_cau, 10) || 135
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Thêm ngành đào tạo mới thành công!',
        data: { id: result.insertId }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi thêm ngành học: ' + error.message });
    }
  },

  async updateMajor(req, res) {
    try {
      const { id } = req.params;
      const { khoa_id, ma_nganh, ten_nganh, thoi_gian_dao_tao_nam, tong_tin_chi_yeu_cau, is_active } = req.body;
      if (!khoa_id || !ma_nganh || !ten_nganh) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin ngành đào tạo.' });
      }

      const [dup] = await pool.execute('SELECT id FROM nganh_hoc WHERE ma_nganh = ? AND id != ? AND is_deleted = FALSE', [ma_nganh.trim(), id]);
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: 'Mã ngành đào tạo này đã trùng với ngành khác.' });
      }

      await pool.execute(
        `UPDATE nganh_hoc 
         SET khoa_id = ?, ma_nganh = ?, ten_nganh = ?, thoi_gian_dao_tao_nam = ?, tong_tin_chi_yeu_cau = ?, is_active = ?
         WHERE id = ?`,
        [
          khoa_id,
          ma_nganh.trim(),
          ten_nganh.trim(),
          parseFloat(thoi_gian_dao_tao_nam) || 4,
          parseInt(tong_tin_chi_yeu_cau, 10) || 135,
          is_active !== undefined ? (is_active ? 1 : 0) : 1,
          id
        ]
      );

      return res.status(200).json({ success: true, message: 'Cập nhật ngành đào tạo thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật ngành học: ' + error.message });
    }
  },

  async deleteMajor(req, res) {
    try {
      const { id } = req.params;
      const [ctdtCheck] = await pool.execute('SELECT id FROM chuong_trinh_dao_tao WHERE nganh_hoc_id = ? AND is_deleted = FALSE', [id]);
      if (ctdtCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa ngành học này vì đã có Khung CTĐT đang áp dụng.'
        });
      }

      await pool.execute('UPDATE nganh_hoc SET is_deleted = TRUE, is_active = 0 WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa ngành đào tạo thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa ngành học: ' + error.message });
    }
  }
};

module.exports = academicController;
