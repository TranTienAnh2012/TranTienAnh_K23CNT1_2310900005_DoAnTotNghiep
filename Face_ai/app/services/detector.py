import cv2
import numpy as np
from PIL import Image
import math
import logging
from app.core.config import settings

logger = logging.getLogger("SmartEdu_Detector")

class FaceDetector:
    def __init__(self):
        self.yunet_path = str(settings.YUNET_MODEL_PATH)
        self.detector = None
        self._init_detector()

    def _init_detector(self):
        try:
            if hasattr(cv2, 'FaceDetectorYN'):
                self.detector = cv2.FaceDetectorYN.create(
                    self.yunet_path,
                    "",
                    (320, 320),
                    score_threshold=0.6,
                    nms_threshold=0.3,
                    top_k=5000
                )
                logger.info("FaceDetectorYN (YuNet) initialized successfully.")
            else:
                logger.warning("cv2.FaceDetectorYN not available, will use Haar Cascade fallback.")
        except Exception as e:
            logger.warning(f"Error initializing YuNet: {e}")

    def check_anti_spoofing(self, crop_bgr: np.ndarray) -> dict:
        """
        Kiểm tra Liveness & Chống giả mạo (Anti-Spoofing):
        1. Phân tích kết cấu tần số cao (Moiré pattern khi chụp qua màn hình).
        2. Phân bố sắc tố da trong không gian YCrCb.
        3. Phát hiện phản xạ lóa sáng (Screen reflection/glare).
        """
        if crop_bgr is None or crop_bgr.size == 0:
            return {"is_live": False, "score": 0.0, "reason": "empty_crop"}

        h, w = crop_bgr.shape[:2]
        
        # 1. Texture Score (Laplacian variance)
        gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        texture_score = float(laplacian.var())
        norm_texture = min(1.0, texture_score / 250.0)

        # 2. Phân bố màu da YCrCb (Human skin tone)
        ycrcb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2YCrCb)
        cr = ycrcb[:, :, 1]
        cb = ycrcb[:, :, 2]
        skin_mask = (cr >= 130) & (cr <= 175) & (cb >= 75) & (cb <= 130)
        skin_ratio = float(np.sum(skin_mask)) / float(h * w)
        chroma_score = min(1.0, skin_ratio / 0.35)

        # 3. Flat Glare / Screen Reflection Detection
        hsv = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2HSV)
        val = hsv[:, :, 2]
        glare_pixels = np.sum(val > 252)
        glare_ratio = float(glare_pixels) / float(h * w)
        glare_penalty = max(0.0, 1.0 - (glare_ratio * 8.0))

        # Điểm liveness tổng hợp
        liveness_score = float(0.40 * norm_texture + 0.40 * chroma_score + 0.20 * glare_penalty)
        liveness_score = float(np.clip(liveness_score, 0.0, 1.0))

        is_live = liveness_score >= 0.45

        return {
            "is_live": is_live,
            "liveness_score": round(liveness_score, 2),
            "skin_ratio": round(skin_ratio, 2),
            "texture_score": round(texture_score, 2)
        }

    def detect_face(self, image_bytes: bytes):
        """
        Phát hiện khuôn mặt, kiểm tra độ nét, độ sáng và chống giả mạo:
        Trả về: (cropped_face_bgr, bbox_dict, quality_dict, img_bgr)
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("Không thể giải mã dữ liệu ảnh.")

        h, w, _ = img_bgr.shape

        # 1. Phát hiện bằng YuNet
        if self.detector:
            self.detector.setInputSize((w, h))
            _, faces = self.detector.detect(img_bgr)
            if faces is not None and len(faces) > 0:
                best_face = max(faces, key=lambda f: f[-1])
                x, y, fw, fh = map(int, best_face[:4])

                pad_x = int(fw * 0.12)
                pad_y = int(fh * 0.12)
                x1 = max(0, x - pad_x)
                y1 = max(0, y - pad_y)
                x2 = min(w, x + fw + pad_x)
                y2 = min(h, y + fh + pad_y)

                cropped = img_bgr[y1:y2, x1:x2]
                bbox = {"x": x, "y": y, "width": fw, "height": fh, "confidence": float(best_face[-1])}

                # Độ sáng & Độ nét chuẩn hóa 160x160
                norm_crop = cv2.resize(cropped, (160, 160))
                gray_norm = cv2.cvtColor(norm_crop, cv2.COLOR_BGR2GRAY)
                blur_score = float(cv2.Laplacian(gray_norm, cv2.CV_64F).var())
                brightness = float(np.mean(gray_norm))

                # Kiểm tra liveness
                liveness = self.check_anti_spoofing(cropped)

                quality = {
                    "blur_score": round(blur_score, 2),
                    "brightness": round(brightness, 2),
                    "face_count": len(faces),
                    "anti_spoofing": liveness
                }

                return cropped, bbox, quality, img_bgr

        # 2. Fallback: Haar Cascade
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(settings.MIN_FACE_SIZE, settings.MIN_FACE_SIZE)
        )

        if len(faces) > 0:
            x, y, fw, fh = max(faces, key=lambda b: b[2] * b[3])
            cropped = img_bgr[y:y+fh, x:x+fw]
            bbox = {"x": int(x), "y": int(y), "width": int(fw), "height": int(fh), "confidence": 0.88}
            norm_crop = cv2.resize(cropped, (160, 160))
            gray_norm = cv2.cvtColor(norm_crop, cv2.COLOR_BGR2GRAY)
            blur_score = float(cv2.Laplacian(gray_norm, cv2.CV_64F).var())
            brightness = float(np.mean(gray_norm))
            liveness = self.check_anti_spoofing(cropped)

            quality = {
                "blur_score": round(blur_score, 2),
                "brightness": round(brightness, 2),
                "face_count": len(faces),
                "anti_spoofing": liveness
            }
            return cropped, bbox, quality, img_bgr

        raise ValueError("Không tìm thấy khuôn mặt rõ nét trong ảnh. Vui lòng căn chỉnh mặt vào giữa camera.")

    def detect_pose(self, image_bytes: bytes) -> dict:
        """
        Phát hiện khuôn mặt và ước lượng góc xoay 3D (Yaw, Pitch, Roll) và landmarks phục vụ Biometric HUD
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            return {"face_detected": False, "reason": "decode_failed"}

        h, w, _ = img_bgr.shape

        if self.detector:
            self.detector.setInputSize((w, h))
            _, faces = self.detector.detect(img_bgr)
            if faces is not None and len(faces) > 0:
                best = max(faces, key=lambda f: f[-1])
                x, y, fw, fh = map(int, best[:4])
                
                # Landmarks từ YuNet
                re = {"x": float(best[4]), "y": float(best[5])}
                le = {"x": float(best[6]), "y": float(best[7])}
                nt = {"x": float(best[8]), "y": float(best[9])}
                mr = {"x": float(best[10]), "y": float(best[11])}
                ml = {"x": float(best[12]), "y": float(best[13])}

                # Ước lượng Yaw (Góc quay ngang)
                dist_r = abs(nt["x"] - re["x"])
                dist_l = abs(le["x"] - nt["x"])
                eye_dist = abs(le["x"] - re["x"])
                yaw_deg = 0.0
                if eye_dist > 0:
                    ratio = (dist_r - dist_l) / eye_dist
                    yaw_deg = float(np.clip(ratio * 45.0, -45.0, 45.0))

                # Ước lượng Pitch (Góc ngửa/cúi)
                mid_eye_y = (re["y"] + le["y"]) / 2.0
                mid_mouth_y = (mr["y"] + ml["y"]) / 2.0
                eye_nose_dy = nt["y"] - mid_eye_y
                nose_mouth_dy = mid_mouth_y - nt["y"]
                pitch_deg = 0.0
                if (eye_nose_dy + nose_mouth_dy) > 0:
                    pitch_ratio = (nose_mouth_dy - eye_nose_dy) / (eye_nose_dy + nose_mouth_dy)
                    pitch_deg = float(np.clip(pitch_ratio * 40.0, -40.0, 40.0))

                # Ước lượng Roll (Góc nghiêng đầu)
                dx = le["x"] - re["x"]
                dy = le["y"] - re["y"]
                roll_deg = float(math.degrees(math.atan2(dy, dx))) if dx != 0 else 0.0

                # Phân loại Pose
                pose_label = "STRAIGHT"
                if yaw_deg >= 12:
                    pose_label = "TURN_LEFT"
                elif yaw_deg <= -12:
                    pose_label = "TURN_RIGHT"
                elif pitch_deg >= 10:
                    pose_label = "LOOK_UP"
                elif pitch_deg <= -10:
                    pose_label = "LOOK_DOWN"

                return {
                    "face_detected": True,
                    "bbox": {"x": x, "y": y, "width": fw, "height": fh, "confidence": float(best[-1])},
                    "pose": {
                        "pose": pose_label,
                        "yaw_deg": round(yaw_deg, 1),
                        "pitch_deg": round(pitch_deg, 1),
                        "roll_deg": round(roll_deg, 1)
                    },
                    "landmarks": {
                        "right_eye": re,
                        "left_eye": le,
                        "nose_tip": nt,
                        "mouth_right": mr,
                        "mouth_left": ml
                    }
                }

        # Fallback khi không có mặt
        return {"face_detected": False}

detector_instance = FaceDetector()
