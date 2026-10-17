import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Nạp biến môi trường từ file .env ở thư mục gốc SmartEdu_System
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const port = parseInt(env.FRONTEND_PORT || 5173, 10);

  return {
    plugins: [react()],
    // Chỉ định Vite đọc trực tiếp file .env từ thư mục gốc
    envDir: '../',
    server: {
      port,
      host: true
    }
  };
});
