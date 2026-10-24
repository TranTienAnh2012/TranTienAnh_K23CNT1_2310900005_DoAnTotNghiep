const { pool } = require('../../config/db');

/**
 * Controller Quản lý Thi cử (Admin)
 * Quản lý các bảng: ca_thi, sinh_vien_ca_thi
 */
const examController = {
  // Lấy danh sách ca thi
  async getAllExams(req, res) {
    try {
      const query = `
        SELECT 
          ct.*,
          mh.ten_mon, mh.ma_mon,
          hk.ten_hoc_ky, hk.nam_hoc,
          gv.ho_ten AS ten_giam_thi, gv.ma_gv AS ma_giam_thi,
          (SELECT COUNT(*) FROM dang_ky_hoc_phan dk WHERE dk.ca_thi_id = ct.id) AS total_candidates,
          (SELECT COUNT(*) FROM dang_ky_hoc_phan dk WHERE dk.ca_thi_id = ct.id AND dk.trang_thai_thi = 'checkin') AS checked_in_count
        FROM ca_thi ct
        JOIN mon_hoc mh ON ct.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        JOIN hoc_ky hk ON ct.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
        LEFT JOIN giang_vien gv ON ct.giang_vien_id = gv.id AND gv.is_deleted = FALSE
        WHERE ct.is_deleted = FALSE
        ORDER BY ct.ngay_thi DESC, ct.gio_bat_dau DESC
      `;
      const [rows] = await pool.query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Tạo ca thi mới
  async createExam(req, res) {
    try {
      const { mon_hoc_id, hoc_ky_id, giang_vien_id, ngay_thi, gio_bat_dau, gio_ket_thuc, phong_thi } = req.body;
      if (!mon_hoc_id || !hoc_ky_id || !ngay_thi || !gio_bat_dau || !gio_ket_thuc || !phong_thi) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ các trường bắt buộc của ca thi.' });
      }

      const [result] = await pool.execute(
        'INSERT INTO ca_thi (mon_hoc_id, hoc_ky_id, giang_vien_id, ngay_thi, gio_bat_dau, gio_ket_thuc, phong_thi) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [mon_hoc_id, hoc_ky_id, giang_vien_id || null, ngay_thi, gio_bat_dau, gio_ket_thuc, phong_thi]
      );

      return res.status(201).json({
        success: true,
        message: 'Tạo ca thi thành công!',
        data: { id: result.insertId }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy danh sách thí sinh trong ca thi
  async getExamCandidates(req, res) {
    try {
      const { examId } = req.params;
      const query = `
        SELECT 
          dk.id, dk.ca_thi_id, dk.sinh_vien_id, dk.so_bao_danh, dk.vi_tri_ngoi,
          dk.thoi_gian_checkin_thi AS thoi_gian_checkin, dk.similarity_score_thi AS similarity_score,
          dk.captured_image_url_thi AS captured_image_url, dk.trang_thai_thi AS trang_thai,
          sv.ma_sv, sv.ho_ten, sv.avatar_url,
          (sv.face_embedding IS NOT NULL) AS has_face_registered,
          l.ten_lop
        FROM dang_ky_hoc_phan dk
        JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id AND sv.is_deleted = FALSE
        LEFT JOIN lop l ON sv.lop_id = l.id
        WHERE dk.ca_thi_id = ?
        ORDER BY dk.so_bao_danh ASC
      `;
      const [rows] = await pool.execute(query, [examId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Gán thí sinh vào ca thi
  async assignCandidate(req, res) {
    try {
      const { examId } = req.params;
      const { sinh_vien_id, so_bao_danh, vi_tri_ngoi } = req.body;

      if (!sinh_vien_id || !so_bao_danh) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp sinh viên và số báo danh.' });
      }

      await pool.execute(
        `UPDATE dang_ky_hoc_phan 
         SET ca_thi_id = ?, so_bao_danh = ?, vi_tri_ngoi = ?
         WHERE sinh_vien_id = ? AND (ca_thi_id = ? OR ca_thi_id IS NULL)
         LIMIT 1`,
        [examId, so_bao_danh, vi_tri_ngoi || null, sinh_vien_id, examId]
      );

      return res.status(200).json({
        success: true,
        message: 'Đã xếp sinh viên vào ca thi thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Đóng/Mở cổng check-in phòng thi
  async toggleExamActive(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT is_active FROM ca_thi WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Ca thi không tồn tại.' });

      const newStatus = !rows[0].is_active;
      await pool.execute('UPDATE ca_thi SET is_active = ? WHERE id = ?', [newStatus, id]);

      return res.status(200).json({
        success: true,
        message: `Đã ${newStatus ? 'mở' : 'đóng'} cổng check-in ca thi thành công!`,
        is_active: newStatus
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cập nhật ca thi
  async updateExam(req, res) {
    try {
      const { id } = req.params;
      const { mon_hoc_id, hoc_ky_id, giang_vien_id, ngay_thi, gio_bat_dau, gio_ket_thuc, phong_thi, is_active } = req.body;
      if (!mon_hoc_id || !hoc_ky_id || !ngay_thi || !gio_bat_dau || !gio_ket_thuc || !phong_thi) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ các trường bắt buộc của ca thi.' });
      }

      const formattedDate = new Date(ngay_thi).toISOString().split('T')[0];

      await pool.execute(
        'UPDATE ca_thi SET mon_hoc_id = ?, hoc_ky_id = ?, giang_vien_id = ?, ngay_thi = ?, gio_bat_dau = ?, gio_ket_thuc = ?, phong_thi = ?, is_active = ? WHERE id = ?',
        [mon_hoc_id, hoc_ky_id, giang_vien_id || null, formattedDate, gio_bat_dau, gio_ket_thuc, phong_thi, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );

      return res.status(200).json({ success: true, message: 'Cập nhật ca thi thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật ca thi: ' + error.message });
    }
  },

  // Xóa mềm ca thi
  async deleteExam(req, res) {
    try {
      const { id } = req.params;
      await pool.execute('UPDATE ca_thi SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa ca thi thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa ca thi: ' + error.message });
    }
  }
};

module.exports = examController;
