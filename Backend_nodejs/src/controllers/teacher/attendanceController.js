const { pool } = require('../../config/db');

/**
 * Controller Quản lý & Duyệt Điểm danh (Teacher)
 */
const attendanceController = {
  // Lấy chi tiết danh sách điểm danh của 1 buổi học
  async getSessionAttendance(req, res) {
    try {
      const { sessionId } = req.params;

      // 1. Lấy thông tin buổi học
      const sessionQuery = `
        SELECT 
          bh.*, lhp.ma_lhp, lhp.ten_lhp, mh.ten_mon, mh.so_tin_chi
        FROM buoi_hoc bh
        JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id
        WHERE bh.id = ? AND bh.is_deleted = FALSE
      `;
      const [sessions] = await pool.execute(sessionQuery, [sessionId]);
      if (sessions.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học.' });
      }

      // 2. Lấy danh sách toàn bộ sinh viên và trạng thái điểm danh
      const attendanceQuery = `
        SELECT 
          sv.id AS sinh_vien_id, sv.ma_sv, sv.ho_ten, sv.email, sv.avatar_url,
          (sv.face_embedding IS NOT NULL) AS has_face_registered,
          l.ten_lop,
          dd.id AS attendance_id,
          dd.thoi_gian_checkin,
          dd.similarity_score,
          dd.captured_image_url,
          COALESCE(dd.trang_thai, 'Absent') AS trang_thai,
          COALESCE(dd.phuong_thuc, 'Manual_Override') AS phuong_thuc
        FROM sinh_vien sv
        LEFT JOIN lop l ON sv.lop_id = l.id
        LEFT JOIN lich_su_diem_danh dd ON dd.sinh_vien_id = sv.id AND dd.buoi_hoc_id = ?
        WHERE sv.is_deleted = FALSE
        ORDER BY sv.ma_sv ASC
      `;
      const [attendees] = await pool.execute(attendanceQuery, [sessionId]);

      return res.status(200).json({
        success: true,
        data: {
          session: sessions[0],
          attendees
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Giảng viên cập nhật điểm danh thủ công (Manual_Override)
  async manualOverride(req, res) {
    try {
      const { sessionId } = req.params;
      const { sinh_vien_id, trang_thai } = req.body; // 'Present', 'Late', 'Absent'

      if (!sinh_vien_id || !trang_thai) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp sinh_vien_id và trạng thái.' });
      }

      const validStatuses = ['Present', 'Late', 'Absent'];
      if (!validStatuses.includes(trang_thai)) {
        return res.status(400).json({ success: false, message: 'Trạng thái điểm danh không hợp lệ.' });
      }

      const checkinTime = trang_thai !== 'Absent' ? new Date() : null;

      const query = `
        INSERT INTO lich_su_diem_danh 
          (buoi_hoc_id, sinh_vien_id, thoi_gian_checkin, similarity_score, trang_thai, phuong_thuc)
        VALUES 
          (?, ?, ?, 1.0, ?, 'Manual_Override')
        ON DUPLICATE KEY UPDATE
          thoi_gian_checkin = VALUES(thoi_gian_checkin),
          trang_thai = VALUES(trang_thai),
          phuong_thuc = 'Manual_Override'
      `;

      await pool.execute(query, [sessionId, sinh_vien_id, checkinTime, trang_thai]);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật điểm danh thủ công thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = attendanceController;
