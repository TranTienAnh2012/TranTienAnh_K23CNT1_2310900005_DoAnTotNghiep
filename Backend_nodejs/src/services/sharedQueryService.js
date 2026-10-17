const { pool } = require('../config/db');

/**
 * Các hàm truy vấn CSDL dùng chung giữa các Role
 */
const sharedQueryService = {
  /**
   * Lấy chi tiết thông tin một buổi học
   */
  async getSessionById(sessionId) {
    const query = `
      SELECT 
        bh.id, bh.lop_hoc_phan_id, bh.ngay_hoc, bh.ca_hoc, bh.phong_hoc, bh.ghi_chu, bh.is_active,
        lhp.ma_lhp, lhp.ten_lhp, lhp.giang_vien_id,
        mh.ma_mon, mh.ten_mon, mh.so_tin_chi,
        gv.ho_ten AS ten_giang_vien, gv.email AS email_giang_vien
      FROM buoi_hoc bh
      JOIN lop_hoc_phan lhp ON bh.lop_hoc_phan_id = lhp.id AND lhp.is_deleted = FALSE
      JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
      LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id AND gv.is_deleted = FALSE
      WHERE bh.id = ? AND bh.is_deleted = FALSE
    `;
    const [rows] = await pool.execute(query, [sessionId]);
    return rows[0] || null;
  },

  /**
   * Lấy chi tiết một ca thi
   */
  async getExamById(examId) {
    const query = `
      SELECT 
        ct.id, ct.mon_hoc_id, ct.hoc_ky_id, ct.ngay_thi, ct.gio_bat_dau, ct.gio_ket_thuc, 
        ct.phong_thi, ct.is_active,
        mh.ma_mon, mh.ten_mon,
        hk.ten_hoc_ky, hk.nam_hoc
      FROM ca_thi ct
      JOIN mon_hoc mh ON ct.mon_hoc_id = mh.id AND mh.is_deleted = FALSE
      JOIN hoc_ky hk ON ct.hoc_ky_id = hk.id AND hk.is_deleted = FALSE
      WHERE ct.id = ? AND ct.is_deleted = FALSE
    `;
    const [rows] = await pool.execute(query, [examId]);
    return rows[0] || null;
  },

  /**
   * Lấy thông tin sinh viên theo user_id hoặc sinh_vien.id
   */
  async getStudentProfile(identifier, isUserId = false) {
    const column = isUserId ? 'sv.user_id' : 'sv.id';
    const query = `
      SELECT 
        sv.id, sv.user_id, sv.ma_sv, sv.ho_ten, sv.ngay_sinh, sv.gioi_tinh, sv.email, 
        sv.lop_id, sv.avatar_url, sv.face_embedding, sv.face_updated_at, sv.is_active,
        l.ma_lop, l.ten_lop, l.khoa_hoc,
        k.ma_khoa, k.ten_khoa
      FROM sinh_vien sv
      JOIN lop l ON sv.lop_id = l.id AND l.is_deleted = FALSE
      JOIN khoa k ON l.khoa_id = k.id AND k.is_deleted = FALSE
      WHERE ${column} = ? AND sv.is_deleted = FALSE
    `;
    const [rows] = await pool.execute(query, [identifier]);
    return rows[0] || null;
  },

  /**
   * Lấy thông tin giảng viên theo user_id hoặc giang_vien.id
   */
  async getTeacherProfile(identifier, isUserId = false) {
    const column = isUserId ? 'gv.user_id' : 'gv.id';
    const query = `
      SELECT 
        gv.id, gv.user_id, gv.ma_gv, gv.ho_ten, gv.email, gv.khoa_id, 
        gv.avatar_url, gv.face_embedding, gv.face_updated_at,
        (gv.face_embedding IS NOT NULL) AS has_face_registered,
        gv.is_active,
        k.ma_khoa, k.ten_khoa
      FROM giang_vien gv
      JOIN khoa k ON gv.khoa_id = k.id AND k.is_deleted = FALSE
      WHERE ${column} = ? AND gv.is_deleted = FALSE
    `;
    const [rows] = await pool.execute(query, [identifier]);
    return rows[0] || null;
  }
};

module.exports = sharedQueryService;
