const { pool } = require('../../config/db');

/**
 * Controller Nghiệp vụ Đào tạo Sinh viên (Cổng Sinh viên)
 * Bao gồm: Chương trình đào tạo, Điểm số, Cảnh báo học vụ, Học phí, Điểm rèn luyện, Ý kiến
 */
const academicController = {
  /**
   * 1. Lấy Khung Chương trình đào tạo (CTĐT) áp dụng cho sinh viên
   * GET /api/student/curriculum
   */
  async getCurriculum(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      // Lấy thông tin lớp, khoa, khóa học của SV
      const [svInfo] = await pool.execute(
        `SELECT sv.id, sv.lop_id, l.khoa_hoc, l.khoa_id, l.ma_nganh, k.ten_khoa 
         FROM sinh_vien sv
         LEFT JOIN lop l ON sv.lop_id = l.id
         LEFT JOIN khoa k ON l.khoa_id = k.id
         WHERE sv.id = ?`,
        [studentId]
      );

      if (svInfo.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
      }

      const { khoa_id, khoa_hoc, ten_khoa, ma_nganh } = svInfo[0];
      const yearMatch = khoa_hoc ? (khoa_hoc.match(/\d{4}/)?.[0] || khoa_hoc) : '2023';

      // Tìm khung CTĐT phù hợp với Khoa và Ngành/Khóa
      const [ctdtList] = await pool.execute(
        `SELECT ctdt.id, ctdt.ma_ctdt, ctdt.ten_ctdt, ctdt.khoa_tuyen_sinh, ctdt.tong_tin_chi_yeu_cau,
                ctdt.chuyen_nganh, ctdt.he_dao_tao,
                n.ma_nganh, n.ten_nganh
         FROM chuong_trinh_dao_tao ctdt
         JOIN nganh_hoc n ON ctdt.nganh_hoc_id = n.id
         WHERE ctdt.is_deleted = FALSE 
           AND (ctdt.khoa_id = ? OR ? IS NULL)
         ORDER BY 
           CASE WHEN n.ma_nganh = ? THEN 1 ELSE 2 END,
           CASE WHEN ctdt.khoa_tuyen_sinh = ? OR ctdt.khoa_tuyen_sinh LIKE CONCAT('%', ?, '%') THEN 1 ELSE 2 END,
           ctdt.id DESC
         LIMIT 1`,
        [khoa_id || null, khoa_id || null, ma_nganh || '', yearMatch, yearMatch]
      );

      let curriculum = ctdtList[0] || null;
      let courses = [];

      if (curriculum) {
        // Lấy danh sách các học phần trong khung CTĐT
        const [courseRows] = await pool.execute(
          `SELECT 
            chp.id, chp.hoc_ky_goi_y, chp.khoi_kien_thuc, chp.loai_hoc_phan,
            COALESCE(chp.so_tiet, mh.so_tin_chi * 15) AS so_tiet,
            chp.dieu_kien_tien_quyet, chp.nhom_tu_chon, chp.ghi_chu, chp.de_cuong_url,
            mh.id AS mon_hoc_id, mh.ma_mon, mh.ten_mon, mh.so_tin_chi, mh.so_buoi_hoc,
            tq.ma_mon AS ma_mon_tien_quyet, tq.ten_mon AS ten_mon_tien_quyet,
            sh.ma_mon AS ma_mon_song_hanh, sh.ten_mon AS ten_mon_song_hanh,
            -- Kiểm tra xem sinh viên đã học môn này chưa và kết quả
            (SELECT dkhp.ket_qua 
             FROM dang_ky_hoc_phan dkhp
             JOIN lop_hoc_phan lhp ON dkhp.lop_hoc_phan_id = lhp.id
             WHERE dkhp.sinh_vien_id = ? AND lhp.mon_hoc_id = mh.id
             ORDER BY dkhp.id DESC LIMIT 1) AS trang_thai_hoc
           FROM ctdt_hoc_phan chp
           JOIN mon_hoc mh ON chp.mon_hoc_id = mh.id
           LEFT JOIN mon_hoc tq ON chp.mon_tien_quyet_id = tq.id
           LEFT JOIN mon_hoc sh ON chp.mon_song_hanh_id = sh.id
           WHERE chp.chuong_trinh_dao_tao_id = ?
           ORDER BY chp.hoc_ky_goi_y ASC, chp.loai_hoc_phan ASC, mh.ma_mon ASC`,
          [studentId, curriculum.id]
        );
        courses = courseRows;
      }

      return res.status(200).json({
        success: true,
        data: {
          curriculum,
          facultyName: ten_khoa,
          courses
        }
      });
    } catch (error) {
      console.error('[academicController.getCurriculum]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 2. Lấy Bảng điểm chi tiết & Tổng kết học kỳ
   * GET /api/student/grades
   */
  async getGrades(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      // Lấy danh sách điểm các môn theo học kỳ trực tiếp từ dang_ky_hoc_phan
      const [grades] = await pool.execute(
        `SELECT 
          dkhp.id AS dang_ky_hoc_phan_id,
          hk.id AS hoc_ky_id, hk.ten_hoc_ky, hk.nam_hoc,
          lhp.ma_lhp, lhp.ten_lhp, lhp.phong_hoc_mac_dinh,
          mh.ma_mon, mh.ten_mon, mh.so_tin_chi,
          gv.ho_ten AS ten_giang_vien, gv.email AS email_giang_vien,
          -- Điểm thành phần trực tiếp từ dang_ky_hoc_phan
          dkhp.diem_chuyen_can,
          dkhp.diem_giua_ky,
          dkhp.diem_cuoi_ky,
          dkhp.diem_tong_ket_he10,
          dkhp.diem_tong_ket_he4,
          dkhp.diem_chu,
          dkhp.ket_qua,
          dkhp.dieu_kien_du_thi,
          -- Thông tin thi cử
          dkhp.so_bao_danh,
          dkhp.vi_tri_ngoi,
          dkhp.thoi_gian_checkin_thi,
          dkhp.trang_thai_thi,
          ct.ngay_thi, ct.gio_bat_dau AS gio_thi, ct.gio_ket_thuc, ct.phong_thi,
          -- Tỷ lệ điểm danh thực tế từ Face AI
          (SELECT COUNT(*) FROM lich_su_diem_danh dd 
           JOIN buoi_hoc bh ON dd.buoi_hoc_id = bh.id 
           WHERE bh.lop_hoc_phan_id = lhp.id AND dd.sinh_vien_id = ? AND dd.trang_thai = 'Present') AS so_buoi_co_mat,
          (SELECT COUNT(*) FROM buoi_hoc bh 
           WHERE bh.lop_hoc_phan_id = lhp.id AND bh.is_deleted = FALSE) AS tong_so_buoi_da_hoc
         FROM dang_ky_hoc_phan dkhp
         JOIN lop_hoc_phan lhp ON dkhp.lop_hoc_phan_id = lhp.id
         JOIN mon_hoc mh ON lhp.mon_hoc_id = mh.id
         JOIN hoc_ky hk ON lhp.hoc_ky_id = hk.id
         LEFT JOIN giang_vien gv ON lhp.giang_vien_id = gv.id
         LEFT JOIN ca_thi ct ON dkhp.ca_thi_id = ct.id
         WHERE dkhp.sinh_vien_id = ?
         ORDER BY hk.id DESC, mh.ma_mon ASC`,
        [studentId, studentId]
      );

      // TỰ ĐỘNG TÍNH TOÁN BẢNG TỔNG HỢP HỌC KỲ (GPA / CPA / XẾP LOẠI) TRỰC TIẾP TỪ GRADES
      const semesterMap = {};
      grades.forEach(g => {
        const hkId = g.hoc_ky_id || 1;
        if (!semesterMap[hkId]) {
          semesterMap[hkId] = {
            hoc_ky_id: hkId,
            ten_hoc_ky: g.ten_hoc_ky || 'Học kỳ 1',
            nam_hoc: g.nam_hoc || '2024-2025',
            courses: []
          };
        }
        semesterMap[hkId].courses.push(g);
      });

      const semesterList = Object.values(semesterMap);
      let cummulativePassedCredits = 0;
      let cummulativeWeightedPoints = 0;
      let cummulativeTotalCreditsForGpa = 0;

      const summaries = semesterList.map(sem => {
        let semCredits = 0;
        let semPassedCredits = 0;
        let semWeightedPoints10 = 0;
        let semWeightedPoints4 = 0;
        let semCreditsWithGrades = 0;
        let soMonThiLai = 0;
        let soMonHocLai = 0;
        let soMonChoDiem = 0;

        sem.courses.forEach(c => {
          const tc = Number(c.so_tin_chi) || 0;
          semCredits += tc;
          if (c.ket_qua === 'Dat') {
            semPassedCredits += tc;
          }
          if (c.diem_tong_ket_he4 !== null && c.diem_tong_ket_he4 !== undefined) {
            const h4 = Number(c.diem_tong_ket_he4);
            const h10 = Number(c.diem_tong_ket_he10) || 0;
            semWeightedPoints4 += h4 * tc;
            semWeightedPoints10 += h10 * tc;
            semCreditsWithGrades += tc;

            cummulativeWeightedPoints += h4 * tc;
            cummulativeTotalCreditsForGpa += tc;

            if (h4 === 0 || c.diem_chu === 'F') {
              soMonHocLai += 1;
            }
          } else {
            soMonChoDiem += 1;
          }

          if (c.ket_qua === 'KhongDat' || (c.diem_cuoi_ky !== null && Number(c.diem_cuoi_ky) < 4.0)) {
            soMonThiLai += 1;
          }
        });

        cummulativePassedCredits += semPassedCredits;

        const gpa_he4 = semCreditsWithGrades > 0 ? Number((semWeightedPoints4 / semCreditsWithGrades).toFixed(2)) : null;
        const gpa_he10 = semCreditsWithGrades > 0 ? Number((semWeightedPoints10 / semCreditsWithGrades).toFixed(2)) : null;
        const cpa_tich_luy_he4 = cummulativeTotalCreditsForGpa > 0 
          ? Number((cummulativeWeightedPoints / cummulativeTotalCreditsForGpa).toFixed(2)) 
          : gpa_he4;

        let xep_loai_hoc_luc = 'Đang học';
        const scoreToCheck = cpa_tich_luy_he4 !== null ? cpa_tich_luy_he4 : gpa_he4;
        if (scoreToCheck !== null) {
          if (scoreToCheck >= 3.6) xep_loai_hoc_luc = 'Xuất sắc';
          else if (scoreToCheck >= 3.2) xep_loai_hoc_luc = 'Giỏi';
          else if (scoreToCheck >= 2.5) xep_loai_hoc_luc = 'Khá';
          else if (scoreToCheck >= 2.0) xep_loai_hoc_luc = 'Trung bình';
          else xep_loai_hoc_luc = 'Yếu';
        }

        let xep_loai_he10 = 'Đang học';
        if (gpa_he10 !== null) {
          if (gpa_he10 >= 9.0) xep_loai_he10 = 'Xuất sắc';
          else if (gpa_he10 >= 8.0) xep_loai_he10 = 'Giỏi';
          else if (gpa_he10 >= 6.5) xep_loai_he10 = 'Khá';
          else if (gpa_he10 >= 5.0) xep_loai_he10 = 'Trung bình';
          else xep_loai_he10 = 'Yếu';
        }

        return {
          id: sem.hoc_ky_id,
          sinh_vien_id: studentId,
          hoc_ky_id: sem.hoc_ky_id,
          ten_hoc_ky: sem.ten_hoc_ky,
          nam_hoc: sem.nam_hoc,
          so_tin_chi_hoc_ky: semCredits,
          so_tin_chi_dat: semPassedCredits,
          gpa_he10: gpa_he10 !== null ? gpa_he10 : 0,
          gpa_he4: gpa_he4 !== null ? gpa_he4 : 0,
          so_tin_chi_tich_luy: cummulativePassedCredits,
          cpa_tich_luy_he4: cpa_tich_luy_he4 !== null ? cpa_tich_luy_he4 : 0,
          xep_loai_hoc_luc,
          xep_hang_hoc_luc: xep_loai_hoc_luc,
          xep_loai_he4: xep_loai_hoc_luc,
          xep_loai_he10,
          so_mon_thi_lai: soMonThiLai,
          so_mon_hoc_lai: soMonHocLai,
          so_mon_cho_diem: soMonChoDiem
        };
      });

      // Nếu sinh viên chưa có môn nào, trả về 1 bản ghi mặc định an toàn
      if (summaries.length === 0) {
        summaries.push({
          sinh_vien_id: studentId,
          so_tin_chi_hoc_ky: 0,
          so_tin_chi_dat: 0,
          gpa_he10: 0,
          gpa_he4: 0,
          so_tin_chi_tich_luy: 0,
          cpa_tich_luy_he4: 0,
          xep_loai_hoc_luc: 'Đang học',
          xep_hang_hoc_luc: 'Đang học',
          xep_loai_he4: 'Đang học',
          xep_loai_he10: 'Đang học',
          so_mon_thi_lai: 0,
          so_mon_hoc_lai: 0,
          so_mon_cho_diem: 0
        });
      }

      // Format gọn điểm số nếu có sai số dấu phẩy động FLOAT từ MySQL
      const formattedGrades = grades.map(g => ({
        ...g,
        diem_chuyen_can: g.diem_chuyen_can !== null ? Number(Number(g.diem_chuyen_can).toFixed(1)) : null,
        diem_giua_ky: g.diem_giua_ky !== null ? Number(Number(g.diem_giua_ky).toFixed(1)) : null,
        diem_cuoi_ky: g.diem_cuoi_ky !== null ? Number(Number(g.diem_cuoi_ky).toFixed(1)) : null,
        diem_tong_ket_he10: g.diem_tong_ket_he10 !== null ? Number(Number(g.diem_tong_ket_he10).toFixed(1)) : null,
        diem_tong_ket_he4: g.diem_tong_ket_he4 !== null ? Number(Number(g.diem_tong_ket_he4).toFixed(2)) : null,
      }));

      return res.status(200).json({
        success: true,
        data: {
          grades: formattedGrades,
          summaries
        }
      });
    } catch (error) {
      console.error('[academicController.getGrades]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 3. Lấy danh sách Cảnh báo học vụ của sinh viên
   * GET /api/student/academic-warnings
   */
  async getAcademicWarnings(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      // Trả về danh sách cảnh báo học vụ (Học lực tốt, không có cảnh báo)
      return res.status(200).json({
        success: true,
        data: []
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 4. Tra cứu Học phí & Tình trạng nộp
   * GET /api/student/tuition
   */
  async getTuition(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      // Lấy thông tin sinh viên và khoa, lớp
      const [students] = await pool.execute(
        `SELECT 
          sv.id, sv.ma_sv, sv.ho_ten, sv.ngay_sinh, sv.gioi_tinh,
          l.ten_lop, l.ma_lop, l.ten_nganh,
          k.ten_khoa, k.ma_khoa
         FROM sinh_vien sv
         JOIN lop l ON sv.lop_id = l.id
         JOIN khoa k ON l.khoa_id = k.id
         WHERE sv.id = ?`,
        [studentId]
      );
      const studentInfo = students[0] || {};

      // Lấy danh sách công nợ học phí từ CSDL hiện tại (không thay đổi cấu trúc bảng)
      const [tuitionList] = await pool.execute(
        `SELECT 
          cn.*, 
          hk.ten_hoc_ky, hk.nam_hoc,
          u.username AS nguoi_xac_nhan_ten
         FROM cong_no_hoc_phi cn
         LEFT JOIN hoc_ky hk ON cn.hoc_ky_id = hk.id
         LEFT JOIN users u ON cn.nguoi_xac_nhan_id = u.id
         WHERE cn.sinh_vien_id = ?
         ORDER BY cn.id ASC`,
        [studentId]
      );

      // Tính toán các chỉ số Tổng hợp
      let tongPhaiNop = 0;
      let tongDaNop = 0;
      let tongHoanTra = 0;
      let tongMienGiam = 0;

      // Group theo khoản thu cho Section I: TỔNG HỢP CHUNG
      const groupKhoanThu = {};

      tuitionList.forEach(item => {
        const phaiNop = parseFloat(item.tong_hoc_phi_phai_nop || 0);
        const daNop = parseFloat(item.so_tien_da_dong || 0);
        const mienGiam = parseFloat(item.so_tien_mien_giam || 0);
        const isChi = item.loai_giao_dich === 'Chi';
        const hoanTra = isChi ? daNop : 0;

        tongPhaiNop += phaiNop;
        tongDaNop += (isChi ? 0 : daNop);
        tongHoanTra += hoanTra;
        tongMienGiam += mienGiam;

        const kName = item.khoan_thu || 'Học phí học kỳ';
        if (!groupKhoanThu[kName]) {
          groupKhoanThu[kName] = {
            khoan_thu: kName,
            so_tien_phai_nop: 0,
            so_tien_da_nop: 0,
            so_tien_hoan_tra: 0,
            so_tien_mien_giam: 0
          };
        }
        groupKhoanThu[kName].so_tien_phai_nop += phaiNop;
        groupKhoanThu[kName].so_tien_da_nop += (isChi ? 0 : daNop);
        groupKhoanThu[kName].so_tien_hoan_tra += hoanTra;
        groupKhoanThu[kName].so_tien_mien_giam += mienGiam;
      });

      // Tạo mảng I. TỔNG HỢP CHUNG
      const tongHopChung = Object.values(groupKhoanThu).map((g, idx) => {
        const phaiDongThucTe = Math.max(0, g.so_tien_phai_nop - g.so_tien_mien_giam);
        const thieuThua = phaiDongThucTe - g.so_tien_da_nop;
        return {
          stt: idx + 1,
          khoan_thu: g.khoan_thu,
          so_tien_phai_nop: g.so_tien_phai_nop,
          so_tien_da_nop: g.so_tien_da_nop,
          so_tien_hoan_tra: g.so_tien_hoan_tra,
          so_tien_thieu_thua: thieuThua > 0 ? thieuThua : 0
        };
      });

      // Section II: CÁC KHOẢN PHẢI NỘP
      const cacKhoanPhaiNop = tuitionList.map((item, idx) => {
        const phaiNop = parseFloat(item.tong_hoc_phi_phai_nop || 0);
        const mienGiam = parseFloat(item.so_tien_mien_giam || 0);
        const conNop = Math.max(0, phaiNop - mienGiam);
        return {
          stt: idx + 1,
          id: item.id,
          hoc_ky: item.hoc_ky_nien_khoa || (item.ten_hoc_ky ? item.ten_hoc_ky.replace(/\D/g, '') : '1'),
          nam_hoc: item.nam_hoc_nien_khoa || item.nam_hoc || '2025-2026',
          dot: item.dot || 1,
          khoan_thu: item.khoan_thu || 'Học phí học kỳ',
          so_tien_phai_nop: phaiNop,
          so_tien_mien_giam: mienGiam,
          so_tien_con_nop: conNop,
          so_tien_da_dong: parseFloat(item.so_tien_da_dong || 0),
          trang_thai: item.trang_thai
        };
      });

      // Section III: CÁC BIÊN LAI ĐÃ THU/CHI
      const bienLaiDaThuChi = tuitionList
        .filter(item => parseFloat(item.so_tien_da_dong || 0) > 0 || item.so_bien_lai)
        .map((item, idx) => ({
          stt: idx + 1,
          id: item.id,
          hoc_ky: item.hoc_ky_nien_khoa || (item.ten_hoc_ky ? item.ten_hoc_ky.replace(/\D/g, '') : '1'),
          nam_hoc: item.nam_hoc_nien_khoa || item.nam_hoc || '2025-2026',
          so_phieu: item.so_bien_lai || `${item.id}`,
          so_hd_dien_tu: item.so_hd_dien_tu || '',
          ngay_thang: item.ngay_nop_tien ? item.ngay_nop_tien : item.created_at,
          khoan_thu_chi: item.khoan_thu || 'Học phí học kỳ',
          so_tien: parseFloat(item.so_tien_da_dong || 0),
          thu: item.loai_giao_dich !== 'Chi',
          chi: item.loai_giao_dich === 'Chi',
          ghi_chu: item.ghi_chu_ke_toan || ''
        }));

      // Tổng số tiền thừa/thiếu
      const phaiNopSauMienGiam = Math.max(0, tongPhaiNop - tongMienGiam);
      const tongThuaThieu = phaiNopSauMienGiam - tongDaNop;

      const summary = {
        tong_phai_nop: tongPhaiNop,
        tong_da_nop: tongDaNop,
        tong_hoan_tra: tongHoanTra,
        tong_thua_thieu: tongThuaThieu > 0 ? tongThuaThieu : 0,
        tong_mien_giam: tongMienGiam
      };

      return res.status(200).json({
        success: true,
        data: {
          studentInfo,
          summary,
          tong_hop_chung: tongHopChung,
          cac_khoan_phai_nop: cacKhoanPhaiNop,
          bien_lai_thu_chi: bienLaiDaThuChi,
          rawList: tuitionList
        }
      });
    } catch (error) {
      console.error('[academicController.getTuition]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 5. Điểm rèn luyện của sinh viên
   * GET /api/student/conduct-scores
   */
  async getConductScores(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const [scores] = await pool.execute(
        `SELECT 
          drl.*, hk.ten_hoc_ky, hk.nam_hoc 
         FROM diem_ren_luyen drl
         JOIN hoc_ky hk ON drl.hoc_ky_id = hk.id
         WHERE drl.sinh_vien_id = ?
         ORDER BY hk.id DESC`,
        [studentId]
      );

      return res.status(200).json({ success: true, data: scores });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Sinh viên tự đánh giá điểm rèn luyện
   * POST /api/student/conduct-scores/self-evaluate
   */
  async selfEvaluateConduct(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const { hoc_ky_id, diem_tu_danh_gia } = req.body;

      if (!hoc_ky_id || diem_tu_danh_gia === undefined) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp học kỳ và điểm tự đánh giá (0-100).' });
      }

      const scoreNum = Math.min(100, Math.max(0, parseInt(diem_tu_danh_gia, 10)));

      // Upsert
      await pool.execute(
        `INSERT INTO diem_ren_luyen (sinh_vien_id, hoc_ky_id, diem_tu_danh_gia, trang_thai_duyet)
         VALUES (?, ?, ?, 'ChoLopDuyet')
         ON DUPLICATE KEY UPDATE 
           diem_tu_danh_gia = VALUES(diem_tu_danh_gia),
           trang_thai_duyet = 'ChoLopDuyet'`,
        [studentId, hoc_ky_id, scoreNum]
      );

      return res.status(200).json({
        success: true,
        message: 'Lưu điểm rèn luyện tự đánh giá thành công!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 6. Xem Khen thưởng & Kỷ luật
   * GET /api/student/rewards-disciplines
   */
  async getRewardsAndDisciplines(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const [list] = await pool.execute(
        `SELECT * FROM khen_thuong_ky_luat WHERE sinh_vien_id = ? ORDER BY ngay_quyet_dinh DESC`,
        [studentId]
      );

      return res.status(200).json({ success: true, data: list });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * 7. Quản lý Ý kiến & Khiếu nại của sinh viên
   * GET /api/student/feedback
   */
  async getFeedbackHistory(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const [list] = await pool.execute(
        `SELECT yk.*, u.username AS nguoi_phan_hoi_ten
         FROM y_kien_sinh_vien yk
         LEFT JOIN users u ON yk.nguoi_phan_hoi_id = u.id
         WHERE yk.sinh_vien_id = ?
         ORDER BY yk.created_at DESC`,
        [studentId]
      );

      return res.status(200).json({ success: true, data: list });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Gửi ý kiến phản hồi mới
   * POST /api/student/feedback
   */
  async submitFeedback(req, res) {
    try {
      const studentId = req.user.studentProfile?.id;
      const { tieu_de, noi_dung, danh_muc } = req.body;

      if (!tieu_de || !noi_dung) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề và nội dung ý kiến.' });
      }

      await pool.execute(
        `INSERT INTO y_kien_sinh_vien (sinh_vien_id, tieu_de, noi_dung, danh_muc, trang_thai)
         VALUES (?, ?, ?, ?, 'TiepNhan')`,
        [studentId, tieu_de, noi_dung, danh_muc || 'HocTap']
      );

      return res.status(201).json({
        success: true,
        message: 'Gửi ý kiến đóng góp thành công! Nhà trường/Khoa sẽ sớm phản hồi cho bạn.'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = academicController;
