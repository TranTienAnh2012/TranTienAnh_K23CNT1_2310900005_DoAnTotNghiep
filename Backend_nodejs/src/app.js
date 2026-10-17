const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const { testConnection } = require('./config/db');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// 1. Cấu hình CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-secret']
}));

// 2. Parser dữ liệu
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 3. Phục vụ thư mục ảnh tĩnh (Static Files)
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// 4. Endpoint kiểm tra sức khỏe hệ thống
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'SmartEdu Academic & Face AI Management System',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'SmartEdu Academic & Face AI Management System',
    timestamp: new Date().toISOString()
  });
});

// 5. Gắn toàn bộ router chính tại tiền tố /api
app.use('/api', routes);

// 6. Middleware bắt lỗi tập trung (Error Handler)
app.use(errorMiddleware);

// 7. Khởi động máy chủ
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.PORT;
  app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(`🚀 SmartEdu Backend Server running on port ${PORT}`);
    console.log(`📡 URL API: http://localhost:${PORT}/api`);
    console.log(`🖼️ Uploads URL: http://localhost:${PORT}/uploads`);
    console.log(`====================================================`);
    await testConnection();
  });
}

module.exports = app;
