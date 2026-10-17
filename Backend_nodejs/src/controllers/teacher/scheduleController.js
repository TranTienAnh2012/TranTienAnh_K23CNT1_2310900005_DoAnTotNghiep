const { pool } = require('../../config/db');
const faceAiService = require('../../services/faceAiService');
const sharedQueryService = require('../../services/sharedQueryService');

/**
 * Controller Lịch giảng dạy & Hồ sơ của Giảng viên (Teacher)
 */
const scheduleController = {
  // Lấy thông tin cá nhân của giảng viên
  async getMyProfile(req, res) {
    try {
      const teacherId = req.user.teacherProfile?.id;
      if (!teacherId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên.' });
      }

      const profile = await sharedQueryService.getTeacherProfile(teacherId, false);
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Đăng ký mẫu khuôn mặt giảng viên (Trích xuất vector 512 chiều và lưu vào MySQL)
  async registerFace(req, res) {
    try {
      const teacherId = req.user.teacherProfile?.id;
      if (!teacherId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên.' });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp file ảnh chụp chân dung rõ nét.'
        });
      }

      const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
      const imagePath = req.file.path;

      // 1. Gọi Face AI service để trích xuất embedding
      const aiResult = await faceAiService.extractEmbedding(imagePath, req.file.filename);
      if (!aiResult.success) {
        return res.status(400).json({
          success: false,
          message: aiResult.message || 'Không thể trích xuất đặc trưng khuôn mặt từ ảnh này. Vui lòng thử lại với ánh sáng tốt hơn.'
        });
      }

      // 2. Lưu avatar_url và face_embedding (JSON) vào bảng giang_vien
      const embeddingJson = JSON.stringify(aiResult.embedding);
      await pool.execute(
        `UPDATE giang_vien 
         SET avatar_url = ?, face_embedding = ?, face_updated_at = NOW() 
         WHERE id = ?`,
        [avatarRelativePath, embeddingJson, teacherId]
      );

      return res.status(200).json({
        success: true,
        message: 'Đăng ký khuôn mặt giảng viên thành công!',
        data: {
          avatar_url: avatarRelativePath,
          quality: aiResult.quality,
          face_updated_at: new Date()
        }
      });
    } catch (error) {
      console.error('[scheduleController.registerFace]', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi đăng ký khuôn mặt giảng viên: ' + error.message
      });
    }
  },

  // Ước lượng Head Pose & Landmarks từ camera phục vụ 3D HUD
  async detectPose(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Thiếu frame ảnh.' });
      }
      const result = await faceAiService.detectPose(req.file.path, req.file.filename);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // Lấy danh sách các lớp học phần được phân công dạy
  async getMyCourses(req, res) {
    try {
      const teacherId = req.user.teacherProfile?.id;
      if (!teacherId) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên.' });
      }

      const query = `
        SELECT 
          lhp.*,
          mh.ma_mon, mh.ten_mon, mh.so_tin_chi,
          hk.ten_hoc_ky, hk.nam_hoc,
          (SELECT COUNT(*) FROM buoi_hoc bh WHERE bh.lop_hoc_phan_id = lhp.id AND bh.is_deleted = FALSE) AS total_sessions
        FROM lop_hoc_phan lhp
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
        WHERE lhp.giang_vien_id = ? AND lhp.is_deleted = FALSE
        ORDER BY lhp.id DESC
      `;
      const [rows] = await pool.execute(query, [teacherId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy lịch dạy theo tuần/ngày của giảng viên
  async getMySchedule(req, res) {
    try {
      const teacherId = req.user.teacherProfile?.id;
      if (!teacherId) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên.' });
      }

      const query = `
        SELECT 
          bh.id, bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc, bh.ghi_chu, bh.is_active,
          lhp.id AS lop_hoc_phan_id, lhp.ma_lhp, lhp.ten_lhp,
          mh.ten_mon, mh.so_tin_chi,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Present') AS count_present,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Late') AS count_late,
          (SELECT COUNT(*) FROM lich_su_diem_danh dd WHERE dd.buoi_hoc_id = bh.id AND dd.trang_thai = 'Absent') AS count_absent
        FROM buoi_hoc bh
        JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        WHERE lhp.giang_vien_id = ? AND bh.is_deleted = FALSE
        ORDER BY bh.ngay_hoc DESC, bh.ca_hoc ASC
      `;
      const [rows] = await pool.execute(query, [teacherId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = scheduleController;
