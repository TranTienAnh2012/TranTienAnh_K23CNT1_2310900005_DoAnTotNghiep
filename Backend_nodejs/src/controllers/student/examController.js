const { pool } = require('../../config/db');
const gpsService = require('../../services/gpsService');
const faceAiService = require('../../services/faceAiService');
const sharedQueryService = require('../../services/sharedQueryService');

/**
 * Controller Check-in Ca Thi (Student)
 * Xác minh danh tính thí sinh bước vào phòng thi bằng Face AI + GPS
 */
const studentExamController = {
  // Lấy danh sách các ca thi của sinh viên
  async getMyExams(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      const query = `
        SELECT 
          dk.id AS registration_id, dk.so_bao_danh, dk.vi_tri_ngoi,
          dk.thoi_gian_checkin_thi AS thoi_gian_checkin, dk.similarity_score_thi AS similarity_score, dk.captured_image_url_thi AS captured_image_url,
          dk.trang_thai_thi AS trang_thai,
          ct.id AS ca_thi_id, ct.ngay_thi, ct.gio_bat_dau, ct.gio_ket_thuc, ct.phong_thi, ct.is_active,
          mh.ten_mon, mh.ma_mon, mh.so_tin_chi,
          hk.ten_hoc_ky
        FROM dang_ky_hoc_phan dk
        JOIN ca_thi ct ON dk.ca_thi_id = ct.id AND ct.is_deleted = FALSE
        JOIN mon_hoc mh ON ct.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        JOIN hoc_ky hk ON ct.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
        WHERE dk.sinh_vien_id = ?
        ORDER BY ct.ngay_thi ASC, ct.gio_bat_dau ASC
      `;
      const [rows] = await pool.execute(query, [studentId]);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // THỰC HIỆN CHECK-IN CA THI
  async checkinExam(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      const { examId, latitude, longitude } = req.body;

      if (!examId) {
        return res.status(400).json({ success: false, message: 'Thiếu mã ca thi (examId).' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh chụp từ camera để xác minh danh tính thí sinh.' });
      }

      // 1. Kiểm tra trạng thái ca thi
      const exam = await sharedQueryService.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Ca thi không tồn tại.' });
      }
      if (!exam.is_active) {
        return res.status(400).json({ success: false, message: 'Cổng check-in phòng thi hiện đang bị đóng.' });
      }

      // 2. Kiểm tra xem sinh viên có trong danh sách thí sinh không
      const [candidateRows] = await pool.execute(
        'SELECT id, so_bao_danh, vi_tri_ngoi, trang_thai_thi AS trang_thai FROM dang_ky_hoc_phan WHERE ca_thi_id = ? AND sinh_vien_id = ?',
        [examId, studentId]
      );
      if (candidateRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có tên trong danh sách thí sinh của ca thi này.'
        });
      }

      // 3. Kiểm tra tọa độ GPS
      const gpsResult = gpsService.verifyGpsLocation(latitude, longitude);
      if (!gpsResult.isWithinRange) {
        return res.status(400).json({
          success: false,
          isGpsPassed: false,
          distance: gpsResult.distanceMeters,
          message: gpsResult.message
        });
      }

      // 4. Lấy vector khuôn mặt đã đăng ký của sinh viên
      const [students] = await pool.execute(
        'SELECT face_embedding, ho_ten FROM sinh_vien WHERE id = ?',
        [studentId]
      );
      if (students.length === 0 || !students[0].face_embedding) {
        return res.status(400).json({
          success: false,
          isGpsPassed: true,
          message: 'Bạn chưa đăng ký mẫu khuôn mặt trên hệ thống để tham gia check-in thi.'
        });
      }

      let registeredEmbedding = students[0].face_embedding;
      if (typeof registeredEmbedding === 'string') {
        registeredEmbedding = JSON.parse(registeredEmbedding);
      }

      // 5. Gọi Face AI Microservice để đối soát khuôn mặt
      const imagePath = req.file.path;
      const capturedRelativeUrl = `/uploads/checkins/${req.file.filename}`;

      const aiResult = await faceAiService.verifyFace(
        imagePath,
        registeredEmbedding,
        req.file.filename
      );

      if (!aiResult.success || !aiResult.isMatch) {
        // Ghi nhận cảnh báo khả nghi nếu điểm tương đồng quá thấp
        await pool.execute(
          `UPDATE dang_ky_hoc_phan 
           SET similarity_score_thi = ?, captured_image_url_thi = ?, trang_thai_thi = 'suspicious' 
           WHERE ca_thi_id = ? AND sinh_vien_id = ?`,
          [aiResult.similarity, capturedRelativeUrl, examId, studentId]
        );

        return res.status(400).json({
          success: false,
          isGpsPassed: true,
          isFaceMatched: false,
          similarityScore: aiResult.similarity,
          threshold: aiResult.threshold,
          message: 'Khuôn mặt không khớp với hồ sơ thí sinh! Hệ thống đã ghi nhận trạng thái khả nghi cần giám thị kiểm tra trực tiếp.'
        });
      }

      // 6. Check-in phòng thi thành công
      const checkinTime = new Date();
      await pool.execute(
        `UPDATE dang_ky_hoc_phan 
         SET thoi_gian_checkin_thi = ?, similarity_score_thi = ?, captured_image_url_thi = ?, trang_thai_thi = 'checkin'
         WHERE ca_thi_id = ? AND sinh_vien_id = ?`,
        [checkinTime, aiResult.similarity, capturedRelativeUrl, examId, studentId]
      );

      return res.status(200).json({
        success: true,
        message: 'Xác thực thí sinh và check-in phòng thi thành công!',
        data: {
          ho_ten: students[0].ho_ten,
          mon_thi: exam.ten_mon,
          so_bao_danh: candidateRows[0].so_bao_danh,
          vi_tri_ngoi: candidateRows[0].vi_tri_ngoi,
          phong_thi: exam.phong_thi,
          thoi_gian_checkin: checkinTime,
          similarityScore: aiResult.similarity,
          distanceMeters: gpsResult.distanceMeters,
          capturedImageUrl: capturedRelativeUrl
        }
      });
    } catch (error) {
      console.error('[studentExamController.checkinExam]', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi trong quá trình check-in ca thi: ' + error.message
      });
    }
  }
};

module.exports = studentExamController;
