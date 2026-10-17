const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config/env');

/**
 * Service gọi HTTP sang Face_ai microservice (Python + FastAPI)
 */
class FaceAiService {
  constructor() {
    this.baseUrl = config.FACE_AI_URL;
    this.secret = config.INTERNAL_AI_SECRET;
  }

  /**
   * Tạo axios instance đính kèm Secret Header xác thực nội bộ
   */
  getClient() {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'x-internal-secret': this.secret
      }
    });
  }

  /**
   * Trích xuất vector embedding (512 chiều) từ ảnh đăng ký khuôn mặt
   * @param {string|Buffer} imageInput Đường dẫn file ảnh hoặc Buffer
   * @param {string} [filename='image.jpg'] Tên file
   * @returns {Promise<{ success: boolean, embedding: number[], quality: object, message?: string }>}
   */
  async extractEmbedding(imageInput, filename = 'image.jpg') {
    try {
      const client = this.getClient();
      const form = new FormData();

      if (typeof imageInput === 'string') {
        form.append('file', fs.createReadStream(imageInput));
      } else {
        form.append('file', imageInput, { filename });
      }

      const response = await client.post('/extract-embedding', form, {
        headers: {
          ...form.getHeaders()
        }
      });

      return {
        success: true,
        embedding: response.data.embedding,
        quality: response.data.quality || {},
        faceBox: response.data.box,
        message: response.data.message || 'Trích xuất đặc trưng khuôn mặt thành công'
      };
    } catch (error) {
      console.warn(`[FaceAiService] extractEmbedding failed: ${error.message}`);
      
      // Dự phòng nếu Face_ai đang khởi động hoặc chưa chạy:
      // Tạo embedding mô phỏng chuẩn hóa (normalized 512 dimensions) cho mục đích phát triển
      if (config.NODE_ENV === 'development') {
        console.info('[FaceAiService] Fallback to simulated 512-d embedding in dev mode');
        const simulated = Array.from({ length: 512 }, () => (Math.random() - 0.5) * 0.1);
        const norm = Math.sqrt(simulated.reduce((sum, v) => sum + v * v, 0));
        return {
          success: true,
          embedding: simulated.map(v => v / norm),
          quality: { brightness: 120, blurScore: 85, isFrontal: true },
          message: 'Trích xuất đặc trưng khuôn mặt thành công (Chế độ mô phỏng AI Dev)'
        };
      }

      return {
        success: false,
        message: 'Lỗi từ dịch vụ AI nhận diện: ' + (error.response?.data?.detail || error.message)
      };
    }
  }

  /**
   * Đối soát khuôn mặt điểm danh/ca thi với embedding đã đăng ký
   * @param {string|Buffer} imageInput File ảnh chụp lúc check-in
   * @param {number[]} registeredEmbedding Vector 512 chiều đã lưu trong CSDL
   * @param {string} [filename='checkin.jpg']
   * @returns {Promise<{ success: boolean, isMatch: boolean, similarity: number, threshold: number, message: string }>}
   */
  async verifyFace(imageInput, registeredEmbedding, filename = 'checkin.jpg') {
    try {
      const client = this.getClient();
      const form = new FormData();

      if (typeof imageInput === 'string') {
        form.append('file', fs.createReadStream(imageInput));
      } else {
        form.append('file', imageInput, { filename });
      }

      form.append('registered_embedding', JSON.stringify(registeredEmbedding));
      form.append('threshold', config.SIMILARITY_THRESHOLD.toString());

      const response = await client.post('/verify-face', form, {
        headers: {
          ...form.getHeaders()
        }
      });

      return {
        success: true,
        isMatch: response.data.is_match,
        similarity: response.data.similarity_score,
        threshold: response.data.threshold || config.SIMILARITY_THRESHOLD,
        message: response.data.message || 'Xác thực khuôn mặt thành công'
      };
    } catch (error) {
      console.warn(`[FaceAiService] verifyFace failed: ${error.message}`);

      // Chế độ mô phỏng kiểm thử trong môi trường Development
      if (config.NODE_ENV === 'development') {
        const mockScore = 0.85; // Trên ngưỡng 0.68
        return {
          success: true,
          isMatch: true,
          similarity: mockScore,
          threshold: config.SIMILARITY_THRESHOLD,
          message: 'Khuôn mặt hợp lệ khớp danh tính sinh viên (Dev simulation)'
        };
      }

      return {
        success: false,
        isMatch: false,
        similarity: 0,
        threshold: config.SIMILARITY_THRESHOLD,
        message: 'Không thể kết nối dịch vụ Face AI: ' + (error.response?.data?.detail || error.message)
      };
    }
  }

  /**
   * Ước lượng góc xoay đầu (Head Pose Yaw/Pitch/Roll) và landmarks thời gian thực
   * @param {string|Buffer} imageInput
   * @param {string} [filename='frame.jpg']
   */
  async detectPose(imageInput, filename = 'frame.jpg') {

    try {
      const client = this.getClient();
      const form = new FormData();
      if (typeof imageInput === 'string') {
        form.append('file', fs.createReadStream(imageInput));
      } else {
        form.append('file', imageInput, { filename });
      }
      const response = await client.post('/detect-pose', form, {
        headers: { ...form.getHeaders() }
      });
      return response.data;
    } catch (error) {
      return { success: false, face_detected: false, error: error.message };
    }
  }
}

module.exports = new FaceAiService();

