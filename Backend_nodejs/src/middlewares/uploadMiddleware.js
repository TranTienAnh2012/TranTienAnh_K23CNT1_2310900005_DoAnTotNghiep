const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsBaseDir = path.resolve(__dirname, '../uploads');
const avatarsDir = path.join(uploadsBaseDir, 'avatars');
const checkinsDir = path.join(uploadsBaseDir, 'checkins');

// Đảm bảo các thư mục upload tồn tại
[uploadsBaseDir, avatarsDir, checkinsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Phân loại thư mục lưu ảnh dựa theo route hoặc field
    if (file.fieldname === 'avatar' || req.originalUrl.includes('/register-face') || req.originalUrl.includes('/avatar')) {
      cb(null, avatarsDir);
    } else {
      cb(null, checkinsDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const timestamp = Date.now();
    const userId = req.user?.id || 'guest';
    cb(null, `${file.fieldname}_u${userId}_${timestamp}${ext}`);
  }
});

// Bộ lọc định dạng file ảnh
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các file ảnh có định dạng JPEG, PNG hoặc WebP!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Tối đa 10MB
  }
});

module.exports = upload;
