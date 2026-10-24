const { pool } = require('../../config/db');

/**
 * Controller Quản lý Sơ yếu lý lịch Sinh viên (Student)
 * Đã tối ưu hoá: Toàn bộ thông tin cá nhân, CCCD, quan hệ gia đình (JSON), 
 * và trúng tuyển (JSON) được lưu trữ tập trung trong bảng `sinh_vien`.
 */
const resumeController = {
  /**
   * 1. Lấy toàn bộ Sơ yếu lý lịch của sinh viên
   * GET /api/student/resume
   */
  async getFullResume(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      // 1. Thông tin cơ bản & Hồ sơ cá nhân từ bảng sinh_vien
      const [svRows] = await pool.execute(
        `SELECT 
          sv.*,
          l.ma_lop, l.ten_lop, l.khoa_hoc, l.he_dao_tao,
          k.ma_khoa, k.ten_khoa
         FROM sinh_vien sv
         JOIN lop l ON sv.lop_id = l.id
         JOIN khoa k ON l.khoa_id = k.id
         WHERE sv.id = ? AND sv.is_deleted = FALSE`,
        [studentId]
      );

      if (svRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Sinh viên không tồn tại.' });
      }
      const basicInfo = svRows[0];

      // Parse JSON quan hệ gia đình & tuyển sinh
      let family = [];
      let admission = null;
      try {
        if (basicInfo.thong_tin_gia_dinh) {
          family = typeof basicInfo.thong_tin_gia_dinh === 'string' 
            ? JSON.parse(basicInfo.thong_tin_gia_dinh) 
            : basicInfo.thong_tin_gia_dinh;
        }
        if (basicInfo.thong_tin_tuyen_sinh) {
          admission = typeof basicInfo.thong_tin_tuyen_sinh === 'string' 
            ? JSON.parse(basicInfo.thong_tin_tuyen_sinh) 
            : basicInfo.thong_tin_tuyen_sinh;
        }
      } catch (e) {
        console.error('Error parsing student JSON resume:', e);
      }

      const personalDetail = {
        id: basicInfo.id,
        sinh_vien_id: basicInfo.id,
        so_cmnd_cccd: basicInfo.so_cmnd_cccd,
        que_quan: basicInfo.que_quan,
        dan_toc: basicInfo.dan_toc,
        ton_giao: basicInfo.ton_giao,
        dia_chi_thuong_tru: basicInfo.dia_chi_thuong_tru,
        so_dien_thoai_ca_nhan: basicInfo.so_dien_thoai
      };

      return res.status(200).json({
        success: true,
        data: {
          basicInfo,
          personalDetail,
          family,
          admission
        }
      });
    } catch (error) {
      console.error('[resumeController.getFullResume]', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải hồ sơ sinh viên: ' + error.message
      });
    }
  },

  /**
   * Cập nhật / Lưu thông tin cá nhân mở rộng vào bảng sinh_vien
   * PUT /api/student/resume/personal
   */
  async updatePersonalInfo(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      const {
        so_cmnd_cccd, que_quan, dan_toc, ton_giao,
        so_dien_thoai_ca_nhan, dia_chi_thuong_tru
      } = req.body;

      await pool.execute(
        `UPDATE sinh_vien SET
          so_cmnd_cccd = COALESCE(?, so_cmnd_cccd),
          que_quan = COALESCE(?, que_quan),
          dan_toc = COALESCE(?, dan_toc),
          ton_giao = COALESCE(?, ton_giao),
          so_dien_thoai = COALESCE(?, so_dien_thoai),
          dia_chi_thuong_tru = COALESCE(?, dia_chi_thuong_tru)
         WHERE id = ?`,
        [
          so_cmnd_cccd || null,
          que_quan || null,
          dan_toc || null,
          ton_giao || null,
          so_dien_thoai_ca_nhan || null,
          dia_chi_thuong_tru || null,
          studentId
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin sơ yếu lý lịch thành công!'
      });
    } catch (error) {
      console.error('[resumeController.updatePersonalInfo]', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật lý lịch cá nhân: ' + error.message
      });
    }
  },

  /**
   * Thêm quan hệ gia đình (Lưu vào JSON thong_tin_gia_dinh)
   * POST /api/student/resume/family
   */
  async addFamilyMember(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const { moi_quan_he, ho_ten, nam_sinh, nghe_nghiep, so_dien_thoai } = req.body;

      if (!moi_quan_he || !ho_ten) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mối quan hệ và họ tên thân nhân.' });
      }

      const [svRows] = await pool.execute('SELECT thong_tin_gia_dinh FROM sinh_vien WHERE id = ?', [studentId]);
      let family = [];
      try {
        if (svRows[0]?.thong_tin_gia_dinh) {
          family = typeof svRows[0].thong_tin_gia_dinh === 'string'
            ? JSON.parse(svRows[0].thong_tin_gia_dinh)
            : svRows[0].thong_tin_gia_dinh;
        }
      } catch (e) {}

      const newId = family.length > 0 ? Math.max(...family.map(f => f.id || 0)) + 1 : 1;
      const newMember = {
        id: newId,
        moi_quan_he,
        ho_ten,
        nam_sinh: nam_sinh || null,
        nghe_nghiep: nghe_nghiep || null,
        so_dien_thoai: so_dien_thoai || null
      };
      family.push(newMember);

      await pool.execute('UPDATE sinh_vien SET thong_tin_gia_dinh = ? WHERE id = ?', [JSON.stringify(family), studentId]);

      return res.status(201).json({
        success: true,
        message: 'Thêm thông tin thân nhân thành công!',
        data: { id: newId }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Cập nhật quan hệ gia đình
   * PUT /api/student/resume/family/:id
   */
  async updateFamilyMember(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const { id } = req.params;
      const { moi_quan_he, ho_ten, nam_sinh, nghe_nghiep, so_dien_thoai } = req.body;

      const [svRows] = await pool.execute('SELECT thong_tin_gia_dinh FROM sinh_vien WHERE id = ?', [studentId]);
      let family = [];
      try {
        if (svRows[0]?.thong_tin_gia_dinh) {
          family = typeof svRows[0].thong_tin_gia_dinh === 'string'
            ? JSON.parse(svRows[0].thong_tin_gia_dinh)
            : svRows[0].thong_tin_gia_dinh;
        }
      } catch (e) {}

      family = family.map(f => {
        if (String(f.id) === String(id)) {
          return {
            ...f,
            moi_quan_he: moi_quan_he || f.moi_quan_he,
            ho_ten: ho_ten || f.ho_ten,
            nam_sinh: nam_sinh || f.nam_sinh,
            nghe_nghiep: nghe_nghiep || f.nghe_nghiep,
            so_dien_thoai: so_dien_thoai || f.so_dien_thoai
          };
        }
        return f;
      });

      await pool.execute('UPDATE sinh_vien SET thong_tin_gia_dinh = ? WHERE id = ?', [JSON.stringify(family), studentId]);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thân nhân thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Xóa quan hệ gia đình
   * DELETE /api/student/resume/family/:id
   */
  async deleteFamilyMember(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const { id } = req.params;

      const [svRows] = await pool.execute('SELECT thong_tin_gia_dinh FROM sinh_vien WHERE id = ?', [studentId]);
      let family = [];
      try {
        if (svRows[0]?.thong_tin_gia_dinh) {
          family = typeof svRows[0].thong_tin_gia_dinh === 'string'
            ? JSON.parse(svRows[0].thong_tin_gia_dinh)
            : svRows[0].thong_tin_gia_dinh;
        }
      } catch (e) {}

      family = family.filter(f => String(f.id) !== String(id));

      await pool.execute('UPDATE sinh_vien SET thong_tin_gia_dinh = ? WHERE id = ?', [JSON.stringify(family), studentId]);

      return res.status(200).json({
        success: true,
        message: 'Đã xóa thông tin thân nhân.'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Cập nhật thông tin trúng tuyển (Lưu vào JSON thong_tin_tuyen_sinh)
   * PUT /api/student/resume/admission
   */
  async updateAdmissionInfo(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const { phuong_thuc_xet_tuyen, khoi_thi, diem_xet_tuyen, diem_uu_tien, nam_tot_nghiep_c3, truong_thpt, so_bao_danh } = req.body;

      const admissionData = {
        phuong_thuc_xet_tuyen: phuong_thuc_xet_tuyen || null,
        khoi_thi: khoi_thi || null,
        diem_xet_tuyen: diem_xet_tuyen || null,
        diem_uu_tien: diem_uu_tien || 0,
        nam_tot_nghiep_c3: nam_tot_nghiep_c3 || null,
        truong_thpt: truong_thpt || null,
        so_bao_danh: so_bao_danh || null
      };

      await pool.execute(
        'UPDATE sinh_vien SET thong_tin_tuyen_sinh = ? WHERE id = ?',
        [JSON.stringify(admissionData), studentId]
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin tuyển sinh thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = resumeController;
