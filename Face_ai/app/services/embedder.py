import cv2
import numpy as np
import logging
from app.core.config import settings

logger = logging.getLogger("SmartEdu_Embedder")

class FaceEmbedder:
    def __init__(self):
        self.sface_path = str(settings.SFACE_MODEL_PATH)
        self.recognizer = None
        self._init_recognizer()

    def _init_recognizer(self):
        try:
            if hasattr(cv2, 'FaceRecognizerSF'):
                self.recognizer = cv2.FaceRecognizerSF.create(self.sface_path, "")
                logger.info("FaceRecognizerSF (SFace) initialized successfully.")
            else:
                logger.warning("cv2.FaceRecognizerSF not available.")
        except Exception as e:
            logger.warning(f"Error initializing SFace model: {e}")

    def extract_features(self, cropped_face_bgr, full_img_bgr=None, bbox=None):
        """
        Trích xuất vector đặc trưng khuôn mặt (L2 normalized vector)
        """
        if self.recognizer and full_img_bgr is not None and bbox is not None:
            try:
                # SFace yêu cầu định dạng 15 phần tử (bbox + 5 facial landmarks + score)
                if isinstance(bbox, dict) and "raw_face" in bbox:
                    face_box = np.array(bbox["raw_face"], dtype=np.float32)
                else:
                    face_box = np.array([
                        bbox["x"], bbox["y"], bbox["width"], bbox["height"],
                        bbox["x"] + bbox["width"]*0.3, bbox["y"] + bbox["height"]*0.3,
                        bbox["x"] + bbox["width"]*0.7, bbox["y"] + bbox["height"]*0.3,
                        bbox["x"] + bbox["width"]*0.5, bbox["y"] + bbox["height"]*0.6,
                        bbox["x"] + bbox["width"]*0.35, bbox["y"] + bbox["height"]*0.8,
                        bbox["x"] + bbox["width"]*0.65, bbox["y"] + bbox["height"]*0.8,
                        bbox.get("confidence", 0.9)
                    ], dtype=np.float32)

                aligned_face = self.recognizer.alignCrop(full_img_bgr, face_box)
                feature = self.recognizer.feature(aligned_face)
                feature = feature.flatten()
                # Chuẩn hóa L2
                norm = np.linalg.norm(feature)
                if norm > 0:
                    feature = feature / norm
                return feature.tolist()
            except Exception as e:
                logger.warning(f"SFace alignCrop/feature extraction failed: {e}")

        # Fallback thuật toán trích xuất màu sắc và cấu trúc không gian (512 chiều chuẩn hóa)
        resized = cv2.resize(cropped_face_bgr, (112, 112))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        dct = cv2.dct(np.float32(gray))
        # Lấy 512 hệ số tần số thấp của biến đổi DCT
        vec = dct[:16, :32].flatten()
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedder_instance = FaceEmbedder()
