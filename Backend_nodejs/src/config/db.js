const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+07:00',
  dateStrings: true
});

// Hàm kiểm tra kết nối CSDL lúc khởi động
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL] Kết nối thành công tới database '${config.DB_NAME}' tại ${config.DB_HOST}:${config.DB_PORT}`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[MySQL WARNING] Chưa thể kết nối tới MySQL: ${error.message}. Hệ thống vẫn khởi chạy chế độ dự phòng.`);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
