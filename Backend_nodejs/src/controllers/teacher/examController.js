const { pool } = require('../../config/db');

/**
 * Controller Giám sát Phòng thi (Teacher)
 */
const teacherExamController = {
  // Lấy danh sách ca thi hôm nay và sắp tới
  async getExamList(req, res) {
    try {
      const query = `
        SELECT 
          ct.*,
          mh.ten_mon, mh.ma_mon,
          hk.ten_hoc_ky,
          (SELECT COUNT(*) FROM dang_ky_hoc_phan dk WHERE dk.ca_thi_id = ct.id) AS total_candidates,
          (SELECT COUNT(*) FROM dang_ky_hoc_phan dk WHERE dk.ca_thi_id = ct.id AND dk.trang_thai_thi = 'checkin') AS checked_in_count
        FROM ca_thi ct
        JOIN mon_hoc mh ON ct.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        JOIN hoc_ky hk ON ct.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
        WHERE ct.is_deleted = FALSE
        ORDER BY ct.ngay_thi ASC, ct.gio_bat_dau ASC
      `;
      const [rows] = await pool.query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Giám sát thí sinh trong 1 ca thi theo thời gian thực
  async getExamSupervision(req, res) {
    try {
      const { examId } = req.params;

      const examQuery = `
        SELECT ct.*, mh.ten_mon, mh.ma_mon
        FROM ca_thi ct
        JOIN mon_hoc mh ON ct.mon_hoc_id = mh.id
        WHERE ct.id = ? AND ct.is_deleted = FALSE
      `;
      const [exams] = await pool.execute(examQuery, [examId]);
      if (exams.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy ca thi.' });
      }

      const candidatesQuery = `
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
      const [candidates] = await pool.execute(candidatesQuery, [examId]);

      return res.status(200).json({
        success: true,
        data: {
          exam: exams[0],
          candidates
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cập nhật trạng thái thí sinh thủ công nếu có sự cố (e.g. suspicious, checkin)
  async updateCandidateStatus(req, res) {
    try {
      const { examId } = req.params;
      const { sinh_vien_id, trang_thai } = req.body;

      await pool.execute(
        'UPDATE dang_ky_hoc_phan SET trang_thai_thi = ? WHERE ca_thi_id = ? AND sinh_vien_id = ?',
        [trang_thai, examId, sinh_vien_id]
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thí sinh thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = teacherExamController;
