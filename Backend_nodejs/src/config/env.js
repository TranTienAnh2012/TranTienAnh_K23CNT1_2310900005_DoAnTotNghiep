const path = require('path');
const dotenv = require('dotenv');

// Nạp file .env từ thư mục gốc dự án SmartEdu_System
const rootEnvPath = path.resolve(__dirname, '../../../.env');
const localEnvPath = path.resolve(__dirname, '../../.env');

const result = dotenv.config({ path: rootEnvPath });
if (result.error) {
  dotenv.config({ path: localEnvPath });
}

const PORT = parseInt(process.env.PORT || process.env.BACKEND_PORT, 10) || 5000;
const HOST = process.env.HOST || 'localhost';

const FACE_AI_PORT = parseInt(process.env.FACE_AI_PORT, 10) || 8000;
const FACE_AI_HOST = process.env.FACE_AI_HOST || '127.0.0.1';

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT,
  HOST,

  // Database MySQL (Lấy trực tiếp từ DB_PORT trong .env)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3309,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'smart_edu_db',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'smartedu_super_secret_jwt_key_2026_graduation_project',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Face AI Service (Tự động lắp ghép từ FACE_AI_HOST & FACE_AI_PORT)
  FACE_AI_PORT,
  FACE_AI_HOST,
  FACE_AI_URL: process.env.FACE_AI_URL || `http://${FACE_AI_HOST}:${FACE_AI_PORT}`,
  INTERNAL_AI_SECRET: process.env.INTERNAL_AI_SECRET || 'SmartEdu_FaceAI_Secret_Key_9999',
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.68,

  // GPS Config
  CAMPUS_LAT: parseFloat(process.env.CAMPUS_LAT) || 21.028511,
  CAMPUS_LNG: parseFloat(process.env.CAMPUS_LNG) || 105.854444,
  ALLOWED_RADIUS_METERS: parseFloat(process.env.ALLOWED_RADIUS_METERS) || 150,

  // Server Base URL (Tự động lắp ghép từ PORT)
  BACKEND_URL: process.env.BACKEND_URL || `http://${HOST}:${PORT}`,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};
