const { pool } = require('../../config/db');
const gpsService = require('../../services/gpsService');
const faceAiService = require('../../services/faceAiService');
const sharedQueryService = require('../../services/sharedQueryService');

/**
 * Controller Điểm danh Buổi học (Student)
 * Tích hợp kiểm tra tọa độ GPS và nhận diện khuôn mặt Face AI
 */
const studentAttendanceController = {
  // Lấy danh sách các buổi học cần điểm danh hôm nay của sinh viên
  async getTodaySessions(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      const query = `
        SELECT 
          bh.id AS buoi_hoc_id, bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc, bh.ghi_chu, bh.is_active,
          lhp.id AS lop_hoc_phan_id, lhp.ma_lhp, lhp.ten_lhp,
          mh.ten_mon, mh.so_tin_chi,
          gv.ho_ten AS ten_giang_vien,
          dd.trang_thai, dd.thoi_gian_checkin, dd.similarity_score, dd.phuong_thuc
        FROM buoi_hoc bh
        JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
        LEFT JOIN lich_su_diem_danh dd ON dd.buoi_hoc_id = bh.id AND dd.sinh_vien_id = ?
        WHERE bh.ngay_hoc = CURDATE() AND bh.is_deleted = FALSE
        ORDER BY bh.ca_hoc ASC
      `;
      const [rows] = await pool.execute(query, [studentId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lịch sử điểm danh toàn bộ của sinh viên
  async getAttendanceHistory(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      const query = `
        SELECT 
          dd.*,
          bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc,
          lhp.ma_lhp, lhp.ten_lhp,
          mh.ten_mon
        FROM lich_su_diem_danh dd
        JOIN buoi_hoc bh ON dd.buoi_hoc_id = bh.id
        JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id
        WHERE dd.sinh_vien_id = ?
        ORDER BY bh.ngay_hoc DESC, dd.thoi_gian_checkin DESC
      `;
      const [rows] = await pool.execute(query, [studentId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // THỰC HIỆN ĐIỂM DANH: KIỂM TRA GPS + NHẬN DIỆN KHUÔN MẶT
  async checkinSession(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      const { sessionId, latitude, longitude } = req.body;

      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Thiếu mã buổi học (sessionId).' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh chụp từ camera để xác thực khuôn mặt.' });
      }

      // 1. Kiểm tra trạng thái buổi học
      const session = await sharedQueryService.getSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Buổi học không tồn tại.' });
      }
      if (!session.is_active) {
        return res.status(400).json({ success: false, message: 'Cổng điểm danh của buổi học này hiện đang bị đóng.' });
      }

      // 2. Kiểm tra tọa độ GPS
      const gpsResult = gpsService.verifyGpsLocation(latitude, longitude);
      if (!gpsResult.isWithinRange) {
        return res.status(400).json({
          success: false,
          isGpsPassed: false,
          distance: gpsResult.distanceMeters,
          message: gpsResult.message
        });
      }

      // 3. Lấy vector khuôn mặt đã đăng ký của sinh viên
      const [students] = await pool.execute(
        'SELECT face_embedding, ho_ten FROM sinh_vien WHERE id = ?',
        [studentId]
      );
      if (students.length === 0 || !students[0].face_embedding) {
        return res.status(400).json({
          success: false,
          isGpsPassed: true,
          message: 'Bạn chưa đăng ký mẫu khuôn mặt trên hệ thống. Vui lòng vào mục "Đăng ký khuôn mặt" trước.'
        });
      }

      let registeredEmbedding = students[0].face_embedding;
      if (typeof registeredEmbedding === 'string') {
        registeredEmbedding = JSON.parse(registeredEmbedding);
      }

      // 4. Gọi Face AI Microservice để đối soát khuôn mặt
      const imagePath = req.file.path;
      const capturedRelativeUrl = `/uploads/checkins/${req.file.filename}`;

      const aiResult = await faceAiService.verifyFace(
        imagePath,
        registeredEmbedding,
        req.file.filename
      );

      if (!aiResult.success || !aiResult.isMatch) {
        return res.status(400).json({
          success: false,
          isGpsPassed: true,
          isFaceMatched: false,
          similarityScore: aiResult.similarity,
          threshold: aiResult.threshold,
          message: 'Nhận diện khuôn mặt không trùng khớp (Độ tương đồng: ' + (aiResult.similarity * 100).toFixed(1) + '%). Vui lòng điều chỉnh góc mặt và chụp lại.'
        });
      }

      // 5. Điểm danh thành công -> Lưu vào bảng lich_su_diem_danh
      const status = 'Present';
      const checkinTime = new Date();

      await pool.execute(
        `INSERT INTO lich_su_diem_danh 
          (buoi_hoc_id, sinh_vien_id, thoi_gian_checkin, similarity_score, captured_image_url, trang_thai, phuong_thuc)
         VALUES 
          (?, ?, ?, ?, ?, ?, 'FaceAI')
         ON DUPLICATE KEY UPDATE
          thoi_gian_checkin = VALUES(thoi_gian_checkin),
          similarity_score = VALUES(similarity_score),
          captured_image_url = VALUES(captured_image_url),
          trang_thai = VALUES(trang_thai),
          phuong_thuc = 'FaceAI'`,
        [sessionId, studentId, checkinTime, aiResult.similarity, capturedRelativeUrl, status]
      );

      return res.status(200).json({
        success: true,
        message: 'Điểm danh thành công bằng Face AI + GPS!',
        data: {
          sinh_vien: students[0].ho_ten,
          mon_hoc: session.ten_mon,
          phong_hoc: session.phong_hoc,
          thoi_gian: checkinTime,
          trang_thai: status,
          similarityScore: aiResult.similarity,
          distanceMeters: gpsResult.distanceMeters,
          capturedImageUrl: capturedRelativeUrl
        }
      });
    } catch (error) {
      console.error('[studentAttendanceController.checkinSession]', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi trong quá trình điểm danh: ' + error.message
      });
    }
  }
};

module.exports = studentAttendanceController;
