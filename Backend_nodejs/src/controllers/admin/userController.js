const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');
const faceAiService = require('../../services/faceAiService');

/**
 * Controller Quản trị Người dùng (Admin)
 * Quản lý các bảng: users, giang_vien, sinh_vien
 */
const userController = {
  // --- Thống kê tổng quan ---
  async getDashboardStats(req, res) {
    try {
      const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE is_deleted = FALSE');
      const [[{ totalTeachers }]] = await pool.query('SELECT COUNT(*) AS totalTeachers FROM giang_vien WHERE is_deleted = FALSE');
      const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM sinh_vien WHERE is_deleted = FALSE');
      const [[{ registeredFaces }]] = await pool.query('SELECT COUNT(*) AS registeredFaces FROM sinh_vien WHERE face_embedding IS NOT NULL AND is_deleted = FALSE');
      const [[{ totalClasses }]] = await pool.query('SELECT COUNT(*) AS totalClasses FROM lop_hoc_phan WHERE is_deleted = FALSE');
      const [[{ todayCheckins }]] = await pool.query('SELECT COUNT(*) AS todayCheckins FROM lich_su_diem_danh WHERE DATE(thoi_gian_checkin) = CURDATE()');

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalTeachers,
          totalStudents,
          registeredFaces,
          totalClasses,
          todayCheckins
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- Quản lý Tài khoản (Users) ---
  async getAllUsers(req, res) {
    try {
      const query = `
        SELECT 
          u.id, 
          u.username, 
          u.role, 
          u.is_active, 
          u.created_at, 
          u.updated_at,
          -- Thông tin giảng viên (nếu role = 'teacher')
          gv.id AS giang_vien_id,
          gv.ma_gv,
          -- Thông tin sinh viên (nếu role = 'student')
          sv.id AS sinh_vien_id,
          sv.ma_sv,
          (sv.face_embedding IS NOT NULL) AS has_face_registered,
          -- Họ tên & Email tổng hợp
          COALESCE(gv.ho_ten, sv.ho_ten, CASE WHEN u.role = 'admin' THEN 'Quản trị viên Hệ thống' ELSE u.username END) AS ho_ten,
          COALESCE(gv.email, sv.email, '') AS email,
          -- Mã định danh
          COALESCE(gv.ma_gv, sv.ma_sv, u.username) AS ma_dinh_danh,
          -- Thông tin Khoa
          COALESCE(k_gv.ten_khoa, k_sv.ten_khoa, 'Hệ thống chung') AS ten_khoa,
          COALESCE(k_gv.id, k_sv.id, NULL) AS khoa_id,
          COALESCE(k_gv.ma_khoa, k_sv.ma_khoa, NULL) AS ma_khoa,
          -- Thông tin Lớp (đối với sinh viên)
          l.ten_lop,
          l.ma_lop,
          l.id AS lop_id
        FROM users u
        LEFT JOIN giang_vien gv ON u.id = gv.user_id AND gv.is_deleted = FALSE
        LEFT JOIN khoa k_gv ON gv.khoa_id = k_gv.id
        LEFT JOIN sinh_vien sv ON u.id = sv.user_id AND sv.is_deleted = FALSE
        LEFT JOIN lop l ON sv.lop_id = l.id
        LEFT JOIN khoa k_sv ON l.khoa_id = k_sv.id
        WHERE u.is_deleted = FALSE
        ORDER BY u.id DESC
      `;
      const [users] = await pool.query(query);
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const targetPass = (newPassword && newPassword.trim()) ? newPassword.trim() : '123456';

      const [user] = await pool.execute('SELECT username FROM users WHERE id = ? AND is_deleted = FALSE', [id]);
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(targetPass, salt);

      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);

      return res.status(200).json({
        success: true,
        message: `Đã đặt lại mật khẩu cho tài khoản "${user[0].username}" về "${targetPass}" thành công!`,
        newPassword: targetPass
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi đặt lại mật khẩu: ' + error.message });
    }
  },

  async provisionAccount(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { role, username, password, ho_ten, email, ma_dinh_danh, khoa_id, lop_id, ngay_sinh, gioi_tinh } = req.body;

      if (!role || !username || !ho_ten) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin: Vai trò, Username, Họ tên.' });
      }

      // Kiểm tra username đã tồn tại chưa
      const [existUsers] = await connection.execute('SELECT id FROM users WHERE username = ? AND is_deleted = FALSE', [username]);
      if (existUsers.length > 0) {
        return res.status(400).json({ success: false, message: `Tên tài khoản "${username}" đã tồn tại trong hệ thống!` });
      }

      const defaultPass = (password && password.trim()) ? password.trim() : '123456';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPass, salt);

      // 1. Tạo user
      const [userRes] = await connection.execute(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, passwordHash, role]
      );
      const userId = userRes.insertId;

      // 2. Tạo hoặc liên kết hồ sơ tương ứng
      if (role === 'teacher') {
        const maGv = ma_dinh_danh || username;
        // Kiểm tra xem đã có giảng viên này trong hệ thống chưa
        const [existGv] = await connection.execute(
          'SELECT id, user_id FROM giang_vien WHERE ma_gv = ? AND is_deleted = FALSE',
          [maGv]
        );

        if (existGv.length > 0) {
          if (existGv[0].user_id) {
            throw new Error(`Giảng viên có mã "${maGv}" đã được cấp tài khoản trước đó.`);
          }
          // Đã có hồ sơ thông tin, nay liên kết tài khoản user_id
          await connection.execute('UPDATE giang_vien SET user_id = ? WHERE id = ?', [userId, existGv[0].id]);
        } else {
          // Chưa có hồ sơ -> tạo mới
          if (!khoa_id) {
            throw new Error('Vui lòng chọn Khoa công tác cho giảng viên.');
          }
          await connection.execute(
            'INSERT INTO giang_vien (user_id, ma_gv, ho_ten, email, khoa_id) VALUES (?, ?, ?, ?, ?)',
            [userId, maGv, ho_ten, email || `${username}@smartedu.edu.vn`, khoa_id]
          );
        }
      } else if (role === 'student') {
        const maSv = ma_dinh_danh || username;
        // Kiểm tra xem đã có sinh viên này trong hệ thống chưa
        const [existSv] = await connection.execute(
          'SELECT id, user_id FROM sinh_vien WHERE ma_sv = ? AND is_deleted = FALSE',
          [maSv]
        );

        if (existSv.length > 0) {
          if (existSv[0].user_id) {
            throw new Error(`Sinh viên có mã "${maSv}" đã được cấp tài khoản trước đó.`);
          }
          // Đã có hồ sơ thông tin, nay liên kết tài khoản user_id
          await connection.execute('UPDATE sinh_vien SET user_id = ? WHERE id = ?', [userId, existSv[0].id]);
        } else {
          // Chưa có hồ sơ -> tạo mới
          if (!lop_id) {
            throw new Error('Vui lòng chọn Lớp học cho sinh viên.');
          }
          await connection.execute(
            'INSERT INTO sinh_vien (user_id, ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, lop_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              userId,
              maSv,
              ho_ten,
              ngay_sinh || '2005-01-01',
              gioi_tinh || 'Nam',
              email || `${username}@smartedu.edu.vn`,
              lop_id
            ]
          );
        }
      }

      await connection.commit();
      return res.status(201).json({
        success: true,
        message: `Đã cấp tài khoản "${username}" thành công cho ${ho_ten}! Mật khẩu mặc định: ${defaultPass}`,
        data: { userId, username, role, ho_ten }
      });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  },

  async bulkProvisionAccounts(req, res) {
    try {
      const { students = [], default_lop_id } = req.body;

      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách sinh viên tải lên rỗng hoặc không đúng định dạng.'
        });
      }

      // Pre-cache classes: key by ma_lop uppercase and id
      const [allClasses] = await pool.query('SELECT id, ma_lop, ten_lop, khoa_id FROM lop WHERE is_deleted = FALSE');
      const classByCode = new Map();
      const classById = new Map();
      allClasses.forEach((c) => {
        if (c.ma_lop) classByCode.set(c.ma_lop.trim().toUpperCase(), c);
        classById.set(c.id, c);
      });

      const successList = [];
      const failedList = [];

      // Salt for bcrypt
      const salt = await bcrypt.genSalt(10);
      const cachedPasswordHashes = new Map();

      for (let i = 0; i < students.length; i++) {
        const item = students[i];
        const rowIdx = i + 1;
        const ma_sv = item.ma_sv ? String(item.ma_sv).trim() : '';
        const ho_ten = item.ho_ten ? String(item.ho_ten).trim() : '';
        const rawMaLop = item.ma_lop ? String(item.ma_lop).trim().toUpperCase() : '';

        if (!ma_sv || !ho_ten) {
          failedList.push({
            row: rowIdx,
            ma_sv: ma_sv || '(Trống)',
            ho_ten: ho_ten || '(Trống)',
            reason: 'Thiếu Mã sinh viên (MSSV) hoặc Họ và tên.'
          });
          continue;
        }

        // Tìm lớp phù hợp (ưu tiên theo mã lớp trong file -> mã lớp id -> lớp mặc định)
        let targetClass = null;
        if (rawMaLop && classByCode.has(rawMaLop)) {
          targetClass = classByCode.get(rawMaLop);
        } else if (item.lop_id && classById.has(Number(item.lop_id))) {
          targetClass = classById.get(Number(item.lop_id));
        } else if (default_lop_id && classById.has(Number(default_lop_id))) {
          targetClass = classById.get(Number(default_lop_id));
        }

        if (!targetClass) {
          failedList.push({
            row: rowIdx,
            ma_sv,
            ho_ten,
            reason: rawMaLop
              ? `Không tìm thấy mã lớp "${rawMaLop}" trên hệ thống.`
              : 'Chưa chọn lớp mặc định hoặc mã lớp không hợp lệ.'
          });
          continue;
        }

        const lopId = targetClass.id;
        const username = item.username ? String(item.username).trim().toLowerCase() : ma_sv.toLowerCase();
        const rawPassword = item.password ? String(item.password).trim() : '123456';
        const email = item.email && String(item.email).trim()
          ? String(item.email).trim()
          : `${username}@smartedu.edu.vn`;

        let gioiTinh = 'Nam';
        if (item.gioi_tinh) {
          const gt = String(item.gioi_tinh).trim().toLowerCase();
          if (gt === 'nu' || gt === 'nữ' || gt === 'female') {
            gioiTinh = 'Nu';
          } else if (gt === 'khac' || gt === 'khác') {
            gioiTinh = 'Khac';
          }
        }

        let ngaySinh = '2005-01-01';
        if (item.ngay_sinh) {
          try {
            const parsed = new Date(item.ngay_sinh);
            if (!isNaN(parsed.getTime())) {
              ngaySinh = parsed.toISOString().split('T')[0];
            }
          } catch {
            ngaySinh = '2005-01-01';
          }
        }

        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();

          // 1. Kiểm tra username trong users
          const [existUser] = await connection.execute(
            'SELECT id FROM users WHERE username = ? AND is_deleted = FALSE',
            [username]
          );
          if (existUser.length > 0) {
            throw new Error(`Tài khoản "${username}" đã tồn tại trên hệ thống.`);
          }

          // 2. Kiểm tra sinh viên trong bảng sinh_vien
          const [existSv] = await connection.execute(
            'SELECT id, user_id FROM sinh_vien WHERE ma_sv = ? AND is_deleted = FALSE',
            [ma_sv]
          );
          if (existSv.length > 0 && existSv[0].user_id) {
            throw new Error(`Sinh viên mã "${ma_sv}" đã được liên kết tài khoản trước đó.`);
          }

          // 3. Hash mật khẩu (cache để tăng tốc xử lý cho danh sách lớn)
          let passwordHash = cachedPasswordHashes.get(rawPassword);
          if (!passwordHash) {
            passwordHash = await bcrypt.hash(rawPassword, salt);
            cachedPasswordHashes.set(rawPassword, passwordHash);
          }

          // 4. Tạo User
          const [userRes] = await connection.execute(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, "student")',
            [username, passwordHash]
          );
          const userId = userRes.insertId;

          // 5. Cập nhật hoặc Thêm mới sinh_vien
          if (existSv.length > 0) {
            await connection.execute(
              'UPDATE sinh_vien SET user_id = ?, lop_id = ?, email = COALESCE(?, email) WHERE id = ?',
              [userId, lopId, email, existSv[0].id]
            );
          } else {
            await connection.execute(
              'INSERT INTO sinh_vien (user_id, ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, lop_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [userId, ma_sv, ho_ten, ngaySinh, gioiTinh, email, lopId]
            );
          }

          await connection.commit();
          successList.push({
            row: rowIdx,
            ma_sv,
            ho_ten,
            username,
            password: rawPassword,
            ten_lop: targetClass.ten_lop,
            ma_lop: targetClass.ma_lop
          });
        } catch (err) {
          await connection.rollback();
          failedList.push({
            row: rowIdx,
            ma_sv,
            ho_ten,
            reason: err.message
          });
        } finally {
          connection.release();
        }
      }

      return res.status(200).json({
        success: true,
        message: `Cấp tài khoản hoàn tất: ${successList.length} thành công, ${failedList.length} thất bại.`,
        summary: {
          total: students.length,
          successCount: successList.length,
          failedCount: failedList.length
        },
        successList,
        failedList
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cấp tài khoản hàng loạt: ' + error.message });
    }
  },

  async toggleUserActive(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT is_active FROM users WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'User không tồn tại.' });

      const newStatus = !rows[0].is_active;
      await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

      return res.status(200).json({
        success: true,
        message: `Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản thành công!`,
        is_active: newStatus
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- Quản lý Giảng viên ---
  async getAllTeachers(req, res) {
    try {
      const query = `
        SELECT 
          gv.id, gv.user_id, gv.ma_gv, gv.ho_ten, gv.email, gv.khoa_id, gv.avatar_url, gv.is_active,
          k.ten_khoa, k.ma_khoa, u.username
        FROM giang_vien gv
        LEFT JOIN users u ON gv.user_id = u.id AND u.is_deleted = FALSE
        LEFT JOIN khoa k ON gv.khoa_id = k.id
        WHERE gv.is_deleted = FALSE
        ORDER BY gv.id DESC
      `;
      const [teachers] = await pool.query(query);
      return res.status(200).json({ success: true, data: teachers });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createTeacher(req, res) {
    try {
      const { ma_gv, ho_ten, email, khoa_id } = req.body;

      if (!ma_gv || !ho_ten || !email || !khoa_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ các trường: Mã GV, Họ tên, Email, Khoa.' });
      }

      // Kiểm tra trùng ma_gv
      const [existGv] = await pool.execute(
        'SELECT id FROM giang_vien WHERE ma_gv = ? AND is_deleted = FALSE',
        [ma_gv.trim()]
      );
      if (existGv.length > 0) {
        return res.status(400).json({ success: false, message: `Mã giảng viên "${ma_gv}" đã tồn tại.` });
      }

      // Kiểm tra trùng email
      const [existEmail] = await pool.execute(
        'SELECT id FROM giang_vien WHERE email = ? AND is_deleted = FALSE',
        [email.trim()]
      );
      if (existEmail.length > 0) {
        return res.status(400).json({ success: false, message: `Email "${email}" đã được sử dụng.` });
      }

      // Tạo hồ sơ giảng viên (chưa gán tài khoản)
      const [gvRes] = await pool.execute(
        'INSERT INTO giang_vien (user_id, ma_gv, ho_ten, email, khoa_id) VALUES (NULL, ?, ?, ?, ?)',
        [ma_gv.trim(), ho_ten.trim(), email.trim(), khoa_id]
      );

      return res.status(201).json({
        success: true,
        message: 'Thêm hồ sơ giảng viên thành công! Tài khoản hệ thống có thể được cấp tại mục Quản lý Tài khoản.',
        data: { id: gvRes.insertId, ma_gv, ho_ten, email }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo giảng viên: ' + error.message });
    }
  },

  // --- Quản lý Sinh viên ---
  async getAllStudents(req, res) {
    try {
      const query = `
        SELECT 
          sv.id, sv.user_id, sv.ma_sv, sv.ho_ten, sv.ngay_sinh, sv.gioi_tinh, sv.email, 
          sv.lop_id, sv.avatar_url, sv.face_updated_at, sv.is_active,
          (sv.face_embedding IS NOT NULL) AS has_face_registered,
          l.ten_lop, l.ma_lop, l.khoa_id, k.ten_khoa, k.ma_khoa, u.username
        FROM sinh_vien sv
        LEFT JOIN users u ON sv.user_id = u.id AND u.is_deleted = FALSE
        LEFT JOIN lop l ON sv.lop_id = l.id
        LEFT JOIN khoa k ON l.khoa_id = k.id
        WHERE sv.is_deleted = FALSE
        ORDER BY sv.id DESC
      `;
      const [students] = await pool.query(query);
      return res.status(200).json({ success: true, data: students });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createStudent(req, res) {
    try {
      const { ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, lop_id } = req.body;

      if (!ma_sv || !ho_ten || !ngay_sinh || !gioi_tinh || !email || !lop_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ các thông tin: Mã SV, Họ tên, Ngày sinh, Giới tính, Email, Lớp.' });
      }

      // Kiểm tra trùng ma_sv
      const [existSv] = await pool.execute(
        'SELECT id FROM sinh_vien WHERE ma_sv = ? AND is_deleted = FALSE',
        [ma_sv.trim()]
      );
      if (existSv.length > 0) {
        return res.status(400).json({ success: false, message: `Mã sinh viên "${ma_sv}" đã tồn tại.` });
      }

      // Kiểm tra trùng email
      const [existEmail] = await pool.execute(
        'SELECT id FROM sinh_vien WHERE email = ? AND is_deleted = FALSE',
        [email.trim()]
      );
      if (existEmail.length > 0) {
        return res.status(400).json({ success: false, message: `Email "${email}" đã được sử dụng.` });
      }

      // Tạo sinh_vien (chưa gán tài khoản, user_id = NULL)
      const [svRes] = await pool.execute(
        'INSERT INTO sinh_vien (user_id, ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, lop_id) VALUES (NULL, ?, ?, ?, ?, ?, ?)',
        [ma_sv.trim(), ho_ten.trim(), ngay_sinh, gioi_tinh, email.trim(), lop_id]
      );

      return res.status(201).json({
        success: true,
        message: 'Thêm thông tin sinh viên thành công! Tài khoản hệ thống có thể được cấp tại mục Quản lý Tài khoản.',
        data: { id: svRes.insertId, ma_sv, ho_ten, email }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo sinh viên: ' + error.message });
    }
  },

  // --- CẬP NHẬT & XÓA USER (TÀI KHOẢN) ---
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role, is_active, password } = req.body;
      
      const updates = [];
      const values = [];

      if (role) {
        updates.push('role = ?');
        values.push(role);
      }
      if (typeof is_active !== 'undefined') {
        updates.push('is_active = ?');
        values.push(is_active ? 1 : 0);
      }
      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password.trim(), salt);
        updates.push('password_hash = ?');
        values.push(hash);
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có thông tin nào để cập nhật.' });
      }

      values.push(id);
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

      return res.status(200).json({ success: true, message: 'Cập nhật tài khoản thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật tài khoản: ' + error.message });
    }
  },

  async deleteUser(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      // Soft delete user
      await connection.execute('UPDATE users SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      // Soft delete related giang_vien or sinh_vien
      await connection.execute('UPDATE giang_vien SET is_deleted = TRUE, is_active = FALSE WHERE user_id = ?', [id]);
      await connection.execute('UPDATE sinh_vien SET is_deleted = TRUE, is_active = FALSE WHERE user_id = ?', [id]);

      await connection.commit();
      return res.status(200).json({ success: true, message: 'Xóa tài khoản thành công!' });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: 'Lỗi xóa tài khoản: ' + error.message });
    } finally {
      connection.release();
    }
  },

  // --- CẬP NHẬT & XÓA GIẢNG VIÊN ---
  async updateTeacher(req, res) {
    try {
      const { id } = req.params;
      const { ho_ten, email, khoa_id, is_active } = req.body;

      if (!ho_ten || !email || !khoa_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ họ tên, email và khoa.' });
      }

      await pool.execute(
        'UPDATE giang_vien SET ho_ten = ?, email = ?, khoa_id = ?, is_active = ? WHERE id = ?',
        [ho_ten, email, khoa_id, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );

      return res.status(200).json({ success: true, message: 'Cập nhật thông tin giảng viên thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật giảng viên: ' + error.message });
    }
  },

  async deleteTeacher(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      // Tìm user_id của giảng viên
      const [rows] = await connection.execute('SELECT user_id FROM giang_vien WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy giảng viên.' });
      }
      const userId = rows[0].user_id;

      await connection.execute('UPDATE giang_vien SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      if (userId) {
        await connection.execute('UPDATE users SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [userId]);
      }

      await connection.commit();
      return res.status(200).json({ success: true, message: 'Xóa hồ sơ giảng viên thành công!' });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: 'Lỗi xóa giảng viên: ' + error.message });
    } finally {
      connection.release();
    }
  },

  // --- CẬP NHẬT & XÓA SINH VIÊN ---
  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const { ho_ten, ngay_sinh, gioi_tinh, email, lop_id, is_active } = req.body;

      if (!ho_ten || !ngay_sinh || !gioi_tinh || !email || !lop_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin sinh viên.' });
      }

      // Convert ngày sinh chuẩn format YYYY-MM-DD
      const formattedDate = new Date(ngay_sinh).toISOString().split('T')[0];

      await pool.execute(
        'UPDATE sinh_vien SET ho_ten = ?, ngay_sinh = ?, gioi_tinh = ?, email = ?, lop_id = ?, is_active = ? WHERE id = ?',
        [ho_ten, formattedDate, gioi_tinh, email, lop_id, typeof is_active !== 'undefined' ? (is_active ? 1 : 0) : 1, id]
      );

      return res.status(200).json({ success: true, message: 'Cập nhật thông tin sinh viên thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật sinh viên: ' + error.message });
    }
  },

  async deleteStudent(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      const [rows] = await connection.execute('SELECT user_id FROM sinh_vien WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
      }
      const userId = rows[0].user_id;

      await connection.execute('UPDATE sinh_vien SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);
      if (userId) {
        await connection.execute('UPDATE users SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [userId]);
      }

      await connection.commit();
      return res.status(200).json({ success: true, message: 'Xóa hồ sơ sinh viên thành công!' });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: 'Lỗi xóa sinh viên: ' + error.message });
    } finally {
      connection.release();
    }
  },

  // --- ĐĂNG KÝ / XÓA KHUÔN MẶT CHO SINH VIÊN (ADMIN) ---
  async registerStudentFace(req, res) {
    try {
      const { id } = req.params;
      const [students] = await pool.execute('SELECT id, ma_sv, ho_ten FROM sinh_vien WHERE id = ? AND is_deleted = FALSE', [id]);
      if (students.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp file ảnh chân dung rõ nét.' });
      }

      const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
      const imagePath = req.file.path;

      // Trích xuất vector embedding bằng Face AI Service
      const aiResult = await faceAiService.extractEmbedding(imagePath, req.file.filename);
      if (!aiResult.success) {
        return res.status(400).json({
          success: false,
          message: aiResult.message || 'Không thể trích xuất đặc trưng khuôn mặt từ ảnh này. Vui lòng chụp/chọn ảnh góc nhìn rõ hơn.'
        });
      }

      const embeddingJson = JSON.stringify(aiResult.embedding);
      await pool.execute(
        `UPDATE sinh_vien 
         SET avatar_url = ?, face_embedding = ?, face_updated_at = NOW() 
         WHERE id = ?`,
        [avatarRelativePath, embeddingJson, id]
      );

      return res.status(200).json({
        success: true,
        message: `Đăng ký dữ liệu khuôn mặt cho sinh viên ${students[0].ho_ten} (${students[0].ma_sv}) thành công!`,
        data: {
          avatar_url: avatarRelativePath,
          quality: aiResult.quality,
          face_updated_at: new Date()
        }
      });
    } catch (error) {
      console.error('[userController.registerStudentFace]', error);
      return res.status(500).json({ success: false, message: 'Lỗi đăng ký khuôn mặt: ' + error.message });
    }
  },

  async deleteStudentFace(req, res) {
    try {
      const { id } = req.params;
      await pool.execute(
        'UPDATE sinh_vien SET face_embedding = NULL, face_updated_at = NULL WHERE id = ?',
        [id]
      );
      return res.status(200).json({ success: true, message: 'Đã xóa dữ liệu khuôn mặt mẫu của sinh viên thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa dữ liệu khuôn mặt: ' + error.message });
    }
  },

  // --- ĐĂNG KÝ / XÓA KHUÔN MẶT CHO GIẢNG VIÊN (ADMIN) ---
  async registerTeacherFace(req, res) {
    try {
      const { id } = req.params;
      const [teachers] = await pool.execute('SELECT id, ma_gv, ho_ten FROM giang_vien WHERE id = ? AND is_deleted = FALSE', [id]);
      if (teachers.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên.' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp file ảnh chân dung rõ nét.' });
      }

      const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
      const imagePath = req.file.path;

      // Trích xuất vector embedding bằng Face AI Service
      const aiResult = await faceAiService.extractEmbedding(imagePath, req.file.filename);
      if (!aiResult.success) {
        return res.status(400).json({
          success: false,
          message: aiResult.message || 'Không thể trích xuất đặc trưng khuôn mặt từ ảnh này. Vui lòng chụp/chọn ảnh góc nhìn rõ hơn.'
        });
      }

      const embeddingJson = JSON.stringify(aiResult.embedding);
      await pool.execute(
        `UPDATE giang_vien 
         SET avatar_url = ?, face_embedding = ?, face_updated_at = NOW() 
         WHERE id = ?`,
        [avatarRelativePath, embeddingJson, id]
      );

      return res.status(200).json({
        success: true,
        message: `Đăng ký dữ liệu khuôn mặt cho giảng viên ${teachers[0].ho_ten} (${teachers[0].ma_gv}) thành công!`,
        data: {
          avatar_url: avatarRelativePath,
          quality: aiResult.quality,
          face_updated_at: new Date()
        }
      });
    } catch (error) {
      console.error('[userController.registerTeacherFace]', error);
      return res.status(500).json({ success: false, message: 'Lỗi đăng ký khuôn mặt giảng viên: ' + error.message });
    }
  },

  async deleteTeacherFace(req, res) {
    try {
      const { id } = req.params;
      await pool.execute(
        'UPDATE giang_vien SET face_embedding = NULL, face_updated_at = NULL WHERE id = ?',
        [id]
      );
      return res.status(200).json({ success: true, message: 'Đã xóa dữ liệu khuôn mặt mẫu của giảng viên thành công!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa dữ liệu khuôn mặt: ' + error.message });
    }
  }
};

module.exports = userController;
