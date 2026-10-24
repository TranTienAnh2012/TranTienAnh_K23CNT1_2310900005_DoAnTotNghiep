const { pool } = require('../../config/db');

/**
 * Controller Lịch học & Thời khóa biểu Sinh viên
 * Hỗ trợ tra cứu lịch cá nhân hoặc băm nhỏ theo Khoa -> Lớp
 */
const studentScheduleController = {
  /**
   * 1. Lấy thời khóa biểu / lịch học của sinh viên
   * GET /api/student/schedule
   * Params: mode, khoa_id, lop_id, hoc_ky_id, from_date, to_date
   */
  async getStudentSchedule(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      // Lấy thông tin sinh viên hiện tại (Lớp, Khoa)
      const [studentRows] = await pool.execute(
        `SELECT sv.id, sv.ma_sv, sv.ho_ten, sv.lop_id, l.ma_lop, l.ten_lop, l.khoa_id, k.ma_khoa, k.ten_khoa
         FROM sinh_vien sv
         LEFT JOIN lop l ON sv.lop_id = l.id
         LEFT JOIN khoa k ON l.khoa_id = k.id
         WHERE sv.id = ?`,
        [studentId]
      );

      if (studentRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên trong hệ thống.' });
      }

      const myInfo = studentRows[0];
      const { mode = 'my_schedule', khoa_id, lop_id, hoc_ky_id, from_date, to_date } = req.query;

      let query = '';
      let params = [];

      if (mode === 'by_class' && lop_id) {
        // Tra cứu lịch học băm nhỏ theo một Lớp sinh hoạt cụ thể
        query = `
          SELECT DISTINCT
            bh.id AS buoi_hoc_id, bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc, bh.ghi_chu, bh.is_active,
            lhp.id AS lop_hoc_phan_id, lhp.ma_lhp, lhp.ten_lhp, lhp.so_luong_toi_da,
            mh.id AS mon_hoc_id, mh.ma_mon, mh.ten_mon, mh.so_tin_chi, mh.so_buoi_hoc,
            k.id AS khoa_id, k.ma_khoa, k.ten_khoa,
            hk.id AS hoc_ky_id, hk.ten_hoc_ky, hk.nam_hoc,
            gv.ho_ten AS ten_giang_vien, gv.email AS email_giang_vien, gv.so_dien_thoai AS sdt_giang_vien,
            (SELECT COUNT(*) FROM dang_ky_hoc_phan dkm WHERE dkm.lop_hoc_phan_id = lhp.id) AS total_enrolled,
            target_l.id AS lop_id, target_l.ten_lop, target_l.ma_lop,
            my_dd.id AS diem_danh_id, my_dd.trang_thai AS trang_thai_diem_danh, 
            my_dd.thoi_gian_checkin, my_dd.similarity_score, my_dd.phuong_thuc
          FROM buoi_hoc bh
          JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
          JOIN dang_ky_hoc_phan dkhp ON dkhp.lop_hoc_phan_id = lhp.id
          JOIN sinh_vien sv_lop ON dkhp.sinh_vien_id = sv_lop.id AND sv_lop.lop_id = ?
          JOIN lop target_l ON target_l.id = ?
          JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
          JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
          LEFT JOIN khoa k ON mh.khoa_id = k.id AND k.is_deleted = FALSE
          LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
          LEFT JOIN lich_su_diem_danh my_dd ON my_dd.buoi_hoc_id = bh.id AND my_dd.sinh_vien_id = ?
          WHERE bh.is_deleted = FALSE
        `;
        params.push(lop_id, lop_id, studentId);

        if (hoc_ky_id && hoc_ky_id !== 'all') {
          query += ' AND lhp.hoc_ky_id = ?';
          params.push(hoc_ky_id);
        }
        if (from_date && to_date) {
          query += ' AND bh.ngay_hoc BETWEEN ? AND ?';
          params.push(from_date, to_date);
        }
        query += ' ORDER BY bh.ngay_hoc ASC, bh.ca_hoc ASC';

      } else if (mode === 'by_class' && khoa_id) {
        // Tra cứu lịch học băm nhỏ theo Khoa
        query = `
          SELECT DISTINCT
            bh.id AS buoi_hoc_id, bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc, bh.ghi_chu, bh.is_active,
            lhp.id AS lop_hoc_phan_id, lhp.ma_lhp, lhp.ten_lhp, lhp.so_luong_toi_da,
            mh.id AS mon_hoc_id, mh.ma_mon, mh.ten_mon, mh.so_tin_chi, mh.so_buoi_hoc,
            k.id AS khoa_id, k.ma_khoa, k.ten_khoa,
            hk.id AS hoc_ky_id, hk.ten_hoc_ky, hk.nam_hoc,
            gv.ho_ten AS ten_giang_vien, gv.email AS email_giang_vien, gv.so_dien_thoai AS sdt_giang_vien,
            (SELECT COUNT(*) FROM dang_ky_hoc_phan dkm WHERE dkm.lop_hoc_phan_id = lhp.id) AS total_enrolled,
            my_dd.id AS diem_danh_id, my_dd.trang_thai AS trang_thai_diem_danh, 
            my_dd.thoi_gian_checkin, my_dd.similarity_score, my_dd.phuong_thuc
          FROM buoi_hoc bh
          JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
          JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
          JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
          JOIN khoa k ON mh.khoa_id = k.id AND k.is_deleted = FALSE
          LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
          LEFT JOIN lich_su_diem_danh my_dd ON my_dd.buoi_hoc_id = bh.id AND my_dd.sinh_vien_id = ?
          WHERE bh.is_deleted = FALSE AND k.id = ?
        `;
        params.push(studentId, khoa_id);

        if (hoc_ky_id && hoc_ky_id !== 'all') {
          query += ' AND lhp.hoc_ky_id = ?';
          params.push(hoc_ky_id);
        }
        if (from_date && to_date) {
          query += ' AND bh.ngay_hoc BETWEEN ? AND ?';
          params.push(from_date, to_date);
        }
        query += ' ORDER BY bh.ngay_hoc ASC, bh.ca_hoc ASC';

      } else {
        // Mặc định: Lịch học cá nhân của chính sinh viên đó
        query = `
          SELECT 
            bh.id AS buoi_hoc_id, bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc, bh.ghi_chu, bh.is_active,
            lhp.id AS lop_hoc_phan_id, lhp.ma_lhp, lhp.ten_lhp, lhp.so_luong_toi_da,
            mh.id AS mon_hoc_id, mh.ma_mon, mh.ten_mon, mh.so_tin_chi, mh.so_buoi_hoc,
            k.id AS khoa_id, k.ma_khoa, k.ten_khoa,
            hk.id AS hoc_ky_id, hk.ten_hoc_ky, hk.nam_hoc,
            gv.ho_ten AS ten_giang_vien, gv.email AS email_giang_vien, gv.so_dien_thoai AS sdt_giang_vien,
            (SELECT COUNT(*) FROM dang_ky_hoc_phan dkm WHERE dkm.lop_hoc_phan_id = lhp.id) AS total_enrolled,
            dd.id AS diem_danh_id, dd.trang_thai AS trang_thai_diem_danh, 
            dd.thoi_gian_checkin, dd.similarity_score, dd.phuong_thuc,
            l.id AS lop_id, l.ten_lop, l.ma_lop
          FROM buoi_hoc bh
          JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
          JOIN dang_ky_hoc_phan dkhp ON dkhp.lop_hoc_phan_id = lhp.id AND dkhp.sinh_vien_id = ?
          JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
          JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
          LEFT JOIN khoa k ON mh.khoa_id = k.id AND k.is_deleted = FALSE
          LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
          LEFT JOIN lich_su_diem_danh dd ON dd.buoi_hoc_id = bh.id AND dd.sinh_vien_id = ?
          LEFT JOIN sinh_vien sv ON sv.id = ?
          LEFT JOIN lop l ON sv.lop_id = l.id
          WHERE bh.is_deleted = FALSE
        `;
        params.push(studentId, studentId, studentId);

        if (hoc_ky_id && hoc_ky_id !== 'all') {
          query += ' AND lhp.hoc_ky_id = ?';
          params.push(hoc_ky_id);
        }
        if (from_date && to_date) {
          query += ' AND bh.ngay_hoc BETWEEN ? AND ?';
          params.push(from_date, to_date);
        }
        query += ' ORDER BY bh.ngay_hoc ASC, bh.ca_hoc ASC';
      }

      const [sessions] = await pool.execute(query, params);

      // Lấy danh sách Khoa phục vụ băm nhỏ bộ lọc
      const [faculties] = await pool.query(
        'SELECT id, ma_khoa, ten_khoa FROM khoa WHERE is_deleted = FALSE ORDER BY id ASC'
      );

      // Lấy danh sách Lớp sinh hoạt phục vụ băm nhỏ bộ lọc Khoa -> Lớp
      const [classes] = await pool.query(
        `SELECT l.id, l.ma_lop, l.ten_lop, l.khoa_id, l.khoa_hoc,
                (SELECT COUNT(*) FROM sinh_vien sv WHERE sv.lop_id = l.id AND sv.is_deleted = FALSE) AS total_students
         FROM lop l
         WHERE l.is_deleted = FALSE
         ORDER BY l.khoa_id ASC, l.ten_lop ASC`
      );

      // Lấy danh sách Học kỳ
      const [semesters] = await pool.query(
        'SELECT id, ten_hoc_ky, nam_hoc, is_active FROM hoc_ky WHERE is_deleted = FALSE ORDER BY id DESC'
      );

      return res.status(200).json({
        success: true,
        data: sessions,
        myInfo,
        faculties,
        classes,
        semesters
      });
    } catch (error) {
      console.error('[studentScheduleController.getStudentSchedule] error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 2. Lấy thông tin chi tiết một buổi học và danh sách sinh viên cùng học
   * GET /api/student/schedule/session/:sessionId/students
   */
  async getSessionStudentDetails(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Thiếu mã buổi học (sessionId).' });
      }

      // Thông tin chi tiết buổi học
      const sessionQuery = `
        SELECT 
          bh.id AS buoi_hoc_id, bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc, bh.ghi_chu, bh.is_active,
          lhp.id AS lop_hoc_phan_id, lhp.ma_lhp, lhp.ten_lhp, lhp.so_luong_toi_da,
          mh.id AS mon_hoc_id, mh.ma_mon, mh.ten_mon, mh.so_tin_chi, mh.so_buoi_hoc,
          k.ten_khoa, hk.ten_hoc_ky, hk.nam_hoc,
          gv.ho_ten AS ten_giang_vien, gv.email AS email_giang_vien, gv.so_dien_thoai AS sdt_giang_vien
        FROM buoi_hoc bh
        JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
        JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
        JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
        LEFT JOIN khoa k ON mh.khoa_id = k.id AND k.is_deleted = FALSE
        LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
        WHERE bh.id = ? AND bh.is_deleted = FALSE
      `;
      const [sessionRows] = await pool.execute(sessionQuery, [sessionId]);
      if (sessionRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học này.' });
      }

      const session = sessionRows[0];

      // Lấy danh sách toàn bộ sinh viên trong lớp học phần kèm trạng thái điểm danh buổi này
      const studentListQuery = `
        SELECT 
          sv.id AS sinh_vien_id, sv.ma_sv, sv.ho_ten, sv.email, sv.avatar_url,
          (sv.face_embedding IS NOT NULL) AS has_face_registered,
          COALESCE(l.ten_lop, 'Chưa xếp lớp') AS ten_lop,
          l.khoa_id,
          dd.id AS attendance_id,
          dd.thoi_gian_checkin,
          dd.similarity_score,
          dd.captured_image_url,
          COALESCE(dd.trang_thai, 'Chưa điểm danh') AS trang_thai,
          dd.phuong_thuc,
          (sv.id = ?) AS is_me
        FROM dang_ky_hoc_phan dkhp
        JOIN sinh_vien sv ON dkhp.sinh_vien_id = sv.id AND sv.is_deleted = FALSE
        LEFT JOIN lop l ON sv.lop_id = l.id
        LEFT JOIN lich_su_diem_danh dd ON dd.sinh_vien_id = sv.id AND dd.buoi_hoc_id = ?
        WHERE dkhp.lop_hoc_phan_id = ?
        ORDER BY (sv.id = ?) DESC, sv.ma_sv ASC
      `;
      const [students] = await pool.execute(studentListQuery, [
        studentId,
        sessionId,
        session.lop_hoc_phan_id,
        studentId
      ]);

      // Thống kê nhanh
      const stats = {
        total: students.length,
        present: students.filter(s => s.trang_thai === 'Present' || s.trang_thai === 'Có mặt').length,
        late: students.filter(s => s.trang_thai === 'Late' || s.trang_thai === 'Đi muộn').length,
        absent: students.filter(s => s.trang_thai === 'Absent' || s.trang_thai === 'Vắng').length,
        pending: students.filter(s => !s.trang_thai || s.trang_thai === 'Chưa điểm danh').length
      };

      return res.status(200).json({
        success: true,
        data: {
          session,
          students,
          stats
        }
      });
    } catch (error) {
      console.error('[studentScheduleController.getSessionStudentDetails] error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = studentScheduleController;
