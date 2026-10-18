const { pool } = require('../../config/db');

/**
 * Controller Quản lý Học phần & Buổi học (Admin)
 * Quản lý các bảng: lop_hoc_phan, buoi_hoc
 */
const courseController = {
  // --- LỚP HỌC PHẦN ---
  async getAllCourses(req, res) {
    try {
      const query = `
        SELECT 
          lhp.*, 
          mh.ten_mon, mh.ma_mon, mh.so_tin_chi, mh.so_buoi_hoc,
          hk.ten_hoc_ky, hk.nam_hoc,
          gv.ho_ten AS ten_giang_vien, gv.email AS email_giang_vien,
          (SELECT COUNT(*) FROM buoi_hoc bh WHERE bh.lop_hoc_phan_id = lhp.id AND bh.is_deleted = FALSE) AS total_sessions,
          (SELECT COUNT(*) FROM dang_ky_hoc_phan dkhp WHERE dkhp.lop_hoc_phan_id = lhp.id) AS total_enrolled_students
        FROM lop_hoc_phan lhp
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
        LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
        WHERE lhp.is_deleted = FALSE
        ORDER BY lhp.id DESC
      `;
      const [rows] = await pool.query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createCourse(req, res) {
    try {
      const { ma_lhp, ten_lhp, mon_hoc_id, hoc_ky_id, giang_vien_id, phong_hoc_mac_dinh, so_luong_toi_da, lop_id } = req.body;
      if (!ma_lhp || !ten_lhp || !mon_hoc_id || !hoc_ky_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ các trường bắt buộc của Lớp học phần.' });
      }

      const [result] = await pool.execute(
        'INSERT INTO lop_hoc_phan (ma_lhp, ten_lhp, mon_hoc_id, hoc_ky_id, giang_vien_id, phong_hoc_mac_dinh, so_luong_toi_da) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ma_lhp, ten_lhp, mon_hoc_id, hoc_ky_id, giang_vien_id || null, phong_hoc_mac_dinh || null, so_luong_toi_da || 50]
      );

      const newCourseId = result.insertId;
      let enrolledCount = 0;

      // Nếu có chọn lớp sinh hoạt, tự động ghi danh tất cả sinh viên của lớp vào LHP này
      if (lop_id) {
        const [students] = await pool.query(
          'SELECT id FROM sinh_vien WHERE lop_id = ? AND is_deleted = FALSE',
          [lop_id]
        );
        for (const sv of students) {
          await pool.execute(
            `INSERT INTO dang_ky_hoc_phan (lop_hoc_phan_id, sinh_vien_id, phuong_thuc, ghi_chu) 
             VALUES (?, ?, 'admin', 'Ghi danh theo lớp sinh hoạt khi tạo LHP') 
             ON DUPLICATE KEY UPDATE ngay_dang_ky = NOW()`,
            [newCourseId, sv.id]
          );
        }
        enrolledCount = students.length;
      }

      return res.status(201).json({
        success: true,
        message: `Tạo lớp học phần thành công!${enrolledCount > 0 ? ` Đã tự động ghi danh ${enrolledCount} sinh viên của lớp vào học phần.` : ''}`,
        data: { id: newCourseId, enrolledCount }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- BUỔI HỌC (SESSIONS) ---
  // Lấy tất cả buổi học toàn hệ thống có lọc theo LHP hoặc Ngày
  async getAllSessions(req, res) {
    try {
      const { courseId, date, semesterId } = req.query;
      let query = `
        SELECT 
          bh.*,
          lhp.ma_lhp, lhp.ten_lhp,
          mh.ten_mon, mh.ma_mon, mh.so_buoi_hoc,
          hk.ten_hoc_ky,
          gv.ho_ten AS ten_giang_vien,
          (SELECT COUNT(*) FROM dang_ky_hoc_phan dkhp WHERE dkhp.lop_hoc_phan_id = lhp.id) AS total_enrolled,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Present') AS count_present,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Late') AS count_late,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Absent') AS count_absent
        FROM buoi_hoc bh
        JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
        LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
        WHERE bh.is_deleted = FALSE
      `;
      const params = [];

      if (courseId) {
        query += ' AND bh.lop_hoc_phan_id = ?';
        params.push(courseId);
      }
      if (date) {
        query += ' AND bh.ngay_hoc = ?';
        params.push(date);
      }
      if (semesterId) {
        query += ' AND lhp.hoc_ky_id = ?';
        params.push(semesterId);
      }

      query += ' ORDER BY bh.ngay_hoc DESC, bh.ca_hoc ASC';

      const [rows] = await pool.query(query, params);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getSessionsByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const query = `
        SELECT 
          bh.*,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Present') AS count_present,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Late') AS count_late,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Absent') AS count_absent
        FROM buoi_hoc bh
        WHERE bh.lop_hoc_phan_id = ? AND bh.is_deleted = FALSE
        ORDER BY bh.ngay_hoc ASC
      `;
      const [rows] = await pool.execute(query, [courseId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createSession(req, res) {
    try {
      const { lop_hoc_phan_id, ngay_hoc, ca_hoc, phong_hoc, ghi_chu } = req.body;
      if (!lop_hoc_phan_id || !ngay_hoc || !ca_hoc || !phong_hoc) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ ngày học, ca học và phòng học.' });
      }

      const formattedDate = new Date(ngay_hoc).toISOString().split('T')[0];

      const [result] = await pool.execute(
        'INSERT INTO buoi_hoc (lop_hoc_phan_id, ngay_hoc, ca_hoc, phong_hoc, ghi_chu) VALUES (?, ?, ?, ?, ?)',
        [lop_hoc_phan_id, formattedDate, ca_hoc, phong_hoc, ghi_chu || null]
      );

      return res.status(201).json({
        success: true,
        message: 'Thêm buổi học thành công!',
        data: { id: result.insertId }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateSession(req, res) {
    try {
      const { id } = req.params;
      const { ngay_hoc, ca_hoc, phong_hoc, ghi_chu, is_active } = req.body;
      if (!ngay_hoc || !ca_hoc || !phong_hoc) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ ngày học, ca học và phòng học.' });
      }

      const formattedDate = new Date(ngay_hoc).toISOString().split('T')[0];

      await pool.execute(
        'UPDATE buoi_hoc SET ngay_hoc = ?, ca_hoc = ?, phong_hoc = ?, ghi_chu = ?, is_active = ? WHERE id = ?',
        [formattedDate, ca_hoc, phong_hoc, ghi_chu || null, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );

      return res.status(200).json({ success: true, message: 'Cập nhật buổi học thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật buổi học: ' + error.message });
    }
  },

  async deleteSession(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('UPDATE buoi_hoc SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa buổi học thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa buổi học: ' + error.message });
    }
  },

  async toggleSessionActive(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT is_active FROM buoi_hoc WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Buổi học không tồn tại.' });

      const newStatus = !rows[0].is_active;
      await pool.execute('UPDATE buoi_hoc SET is_active = ? WHERE id = ?', [newStatus, id]);

      return res.status(200).json({
        success: true,
        message: `Đã ${newStatus ? 'mở' : 'khóa'} cổng điểm danh buổi học thành công!`,
        is_active: newStatus
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cập nhật lớp học phần
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const { ten_lhp, mon_hoc_id, hoc_ky_id, giang_vien_id, phong_hoc_mac_dinh, is_active } = req.body;
      if (!ten_lhp || !mon_hoc_id || !hoc_ky_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ tên lớp học phần, môn học và học kỳ.' });
      }

      await pool.execute(
        'UPDATE lop_hoc_phan SET ten_lhp = ?, mon_hoc_id = ?, hoc_ky_id = ?, giang_vien_id = ?, phong_hoc_mac_dinh = ?, is_active = ? WHERE id = ?',
        [ten_lhp, mon_hoc_id, hoc_ky_id, giang_vien_id || null, phong_hoc_mac_dinh || null, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );

      return res.status(200).json({ success: true, message: 'Cập nhật lớp học phần thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật lớp học phần: ' + error.message });
    }
  },

  // Xóa mềm lớp học phần
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('UPDATE lop_hoc_phan SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa lớp học phần thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa lớp học phần: ' + error.message });
    }
  },

  // --- QUẢN LÝ SINH VIÊN THEO HỌC TRONG LỚP HỌC PHẦN (DANG_KY_HOC_PHAN) ---
  async getCourseStudents(req, res) {
    try {
      const { courseId } = req.params;
      const query = `
        SELECT 
          sv.id, sv.ma_sv, sv.ho_ten, sv.email, sv.avatar_url, sv.is_active,
          (sv.face_embedding IS NOT NULL) AS has_face_registered,
          l.ten_lop, k.ten_khoa,
          dkhp.ngay_dang_ky, dkhp.dieu_kien_du_thi, dkhp.phuong_thuc, dkhp.ghi_chu,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd JOIN buoi_hoc bh ON dd.buoi_hoc_id = bh.id 
           WHERE bh.lop_hoc_phan_id = ? AND dd.sinh_vien_id = sv.id AND dd.trang_thai = 'Present') AS present_count,
          (SELECT COUNT(*) FROM buoi_hoc bh WHERE bh.lop_hoc_phan_id = ? AND bh.is_deleted = FALSE) AS total_sessions
        FROM dang_ky_hoc_phan dkhp
        JOIN sinh_vien sv ON dkhp.sinh_vien_id = sv.id AND sv.is_deleted = FALSE
        LEFT JOIN lop l ON sv.lop_id = l.id
        LEFT JOIN khoa k ON l.khoa_id = k.id
        WHERE dkhp.lop_hoc_phan_id = ?
        ORDER BY sv.ho_ten ASC
      `;
      const [rows] = await pool.execute(query, [courseId, courseId, courseId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async enrollStudent(req, res) {
    try {
      const { courseId } = req.params;
      const { sinh_vien_id, sinh_vien_ids, lop_id, phuong_thuc, ghi_chu } = req.body;

      // 1. Ghi danh toàn bộ sinh viên của một lớp sinh hoạt
      if (lop_id) {
        const [students] = await pool.query(
          'SELECT id FROM sinh_vien WHERE lop_id = ? AND is_deleted = FALSE',
          [lop_id]
        );
        if (students.length === 0) {
          return res.status(400).json({ success: false, message: 'Lớp sinh hoạt này hiện chưa có sinh viên nào.' });
        }

        for (const sv of students) {
          await pool.execute(
            `INSERT INTO dang_ky_hoc_phan (lop_hoc_phan_id, sinh_vien_id, phuong_thuc, ghi_chu) 
             VALUES (?, ?, 'admin', ?) 
             ON DUPLICATE KEY UPDATE ngay_dang_ky = NOW()`,
            [courseId, sv.id, ghi_chu || 'Gán theo lớp sinh hoạt']
          );
        }

        return res.status(200).json({
          success: true,
          message: `Đã ghi danh thành công toàn bộ ${students.length} sinh viên của lớp vào học phần!`
        });
      }

      // 2. Ghi danh danh sách nhiều sinh viên được chọn
      if (Array.isArray(sinh_vien_ids) && sinh_vien_ids.length > 0) {
        for (const sId of sinh_vien_ids) {
          await pool.execute(
            `INSERT INTO dang_ky_hoc_phan (lop_hoc_phan_id, sinh_vien_id, phuong_thuc, ghi_chu) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE ngay_dang_ky = NOW()`,
            [courseId, sId, phuong_thuc || 'admin', ghi_chu || null]
          );
        }

        return res.status(200).json({
          success: true,
          message: `Đã ghi danh thành công ${sinh_vien_ids.length} sinh viên vào lớp học phần!`
        });
      }

      // 3. Ghi danh 1 sinh viên lẻ
      if (sinh_vien_id) {
        await pool.execute(
          `INSERT INTO dang_ky_hoc_phan (lop_hoc_phan_id, sinh_vien_id, phuong_thuc, ghi_chu) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE ngay_dang_ky = NOW(), ghi_chu = VALUES(ghi_chu)`,
          [courseId, sinh_vien_id, phuong_thuc || 'admin', ghi_chu || null]
        );

        return res.status(200).json({ success: true, message: 'Đã thêm sinh viên vào lớp học phần thành công!' });
      }

      return res.status(400).json({ success: false, message: 'Vui lòng chọn lớp hoặc sinh viên cần ghi danh.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async removeStudentFromCourse(req, res) {
    try {
      const { courseId, studentId } = req.params;
      await pool.execute('DELETE FROM dang_ky_hoc_phan WHERE lop_hoc_phan_id = ? AND sinh_vien_id = ?', [courseId, studentId]);
      return res.status(200).json({ success: true, message: 'Đã rút sinh viên khỏi lớp học phần!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async toggleEligibility(req, res) {
    try {
      const { courseId, studentId } = req.params;
      const { dieu_kien_du_thi, ghi_chu } = req.body;
      if (!['du_dieu_kien', 'cam_thi'].includes(dieu_kien_du_thi)) {
        return res.status(400).json({ success: false, message: 'Điều kiện dự thi không hợp lệ.' });
      }

      await pool.execute(
        'UPDATE dang_ky_hoc_phan SET dieu_kien_du_thi = ?, ghi_chu = ? WHERE lop_hoc_phan_id = ? AND sinh_vien_id = ?',
        [dieu_kien_du_thi, ghi_chu || null, courseId, studentId]
      );

      return res.status(200).json({ success: true, message: 'Đã cập nhật điều kiện dự thi của sinh viên!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = courseController;
