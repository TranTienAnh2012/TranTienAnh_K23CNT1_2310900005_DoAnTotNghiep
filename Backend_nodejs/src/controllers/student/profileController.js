const { pool } = require('../../config/db');
const faceAiService = require('../../services/faceAiService');
const sharedQueryService = require('../../services/sharedQueryService');
const path = require('path');

/**
 * Controller Hồ sơ Cá nhân & Đăng ký Khuôn mặt (Student)
 */
const profileController = {
  // Lấy thông tin cá nhân của sinh viên
  async getMyProfile(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      const profile = await sharedQueryService.getStudentProfile(studentId, false);
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Đăng ký mẫu khuôn mặt (Trích xuất face_embedding 512 chiều và lưu vào MySQL)
  async registerFace(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
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

      // 2. Lưu face_embedding (JSON) vào bảng sinh_vien (Không ghi đè avatar_url)
      const embeddingJson = JSON.stringify(aiResult.embedding);
      await pool.execute(
        `UPDATE sinh_vien 
         SET face_embedding = ?, face_updated_at = NOW() 
         WHERE id = ?`,
        [embeddingJson, studentId]
      );

      return res.status(200).json({
        success: true,
        message: 'Đăng ký dữ liệu khuôn mặt thành công!',
        data: {
          quality: aiResult.quality,
          face_updated_at: new Date()
        }
      });
    } catch (error) {
      console.error('[profileController.registerFace]', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi đăng ký khuôn mặt: ' + error.message
      });
    }
  }
};

module.exports = profileController;
