const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/env');

async function runMigration() {
  console.log('🚀 Bắt đầu thực thi Migration CSDL SmartEdu...');
  
  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    multipleStatements: true,
  });

  console.log(`✅ Đã kết nối MySQL: '${config.DB_NAME}' tại ${config.DB_HOST}:${config.DB_PORT}`);

  try {
    const sqlPath = path.join(__dirname, '../../../database/migration_expand_features.sql');
    console.log(`📂 Đọc file SQL: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('⏳ Đang áp dụng các bảng mới vào CSDL...');
    await connection.query(sqlContent);
    console.log('🎉 Migration hoàn tất thành công 100%!\n');

    // Kiểm tra danh sách bảng sau khi migration
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`📋 Tổng số bảng hiện tại (${tableNames.length} bảng):`);
    tableNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });

    // Kiểm tra enum users.role
    const [roleCol] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");
    console.log('\n👤 Cấu hình ENUM users.role mới:', roleCol[0].Type);

  } catch (error) {
    console.error('❌ Lỗi khi thực thi migration:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
