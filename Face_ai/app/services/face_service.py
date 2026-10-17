import os
import time
import numpy as np
from typing import Optional, Dict, Any, List
from pathlib import Path
from app.config import settings
from app.core.face_detector import FaceDetector
from app.core.face_embedder import FaceEmbedder
from app.core.liveness_checker import LivenessChecker
from app.core.face_storage import FaceStorage
from app.schemas.models import (
    FaceEnrollResponse,
    FaceRecognizeResponse,
    FaceVerifyResponse,
    FaceRecognitionCandidate,
    DetectedFace
)

try:
    import cv2
except ImportError:
    cv2 = None

class FaceService:
    """
    Core orchestrator combining Detection, Quality, Liveness, Alignment, Embedding, and Storage.
    """

    def __init__(self):
        self.detector = FaceDetector()
        self.embedder = FaceEmbedder()
        self.storage = FaceStorage()

    def enroll_employee(
        self,
        image_bgr: np.ndarray,
        employee_id: str,
        full_name: Optional[str] = None,
        department: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        check_quality: bool = True
    ) -> FaceEnrollResponse:
        """
        Enrolls a new face profile for an employee.
        """
        if image_bgr is None:
            return FaceEnrollResponse(
                success=False,
                employee_id=employee_id,
                message="Invalid image provided",
                face_detected=False,
                quality_passed=False,
                reasons=["Could not decode image"]
            )

        # 1. Detect faces
        faces = self.detector.detect_faces(image_bgr)
        if len(faces) == 0:
            return FaceEnrollResponse(
                success=False,
                employee_id=employee_id,
                message="No face detected",
                face_detected=False,
                quality_passed=False,
                reasons=["FACE_NOT_FOUND: No face detected in image. Please center your face in camera."]
            )

        # Sort by area descending
        faces.sort(key=lambda f: f.bbox.width * f.bbox.height, reverse=True)

        if len(faces) > 1:
            largest_area = faces[0].bbox.width * faces[0].bbox.height
            second_area = faces[1].bbox.width * faces[1].bbox.height
            if largest_area < 3.0 * second_area:
                return FaceEnrollResponse(
                    success=False,
                    employee_id=employee_id,
                    message="Multiple faces detected",
                    face_detected=True,
                    quality_passed=False,
                    reasons=["MULTIPLE_FACES: Only 1 person allowed during enrollment."]
                )

        face = faces[0]

        # 2. Quality Check
        quality_passed = face.quality.valid
        if check_quality and not quality_passed:
            return FaceEnrollResponse(
                success=False,
                employee_id=employee_id,
                message="Face image quality check failed",
                face_detected=True,
                quality_passed=False,
                reasons=face.quality.reasons
            )


        # 3. Align face and extract embedding vector
        aligned_face = self.embedder.align_face(image_bgr, face)
        embedding = self.embedder.extract_embedding(aligned_face)

        # 4. Save vector to DB (Không lưu ảnh ra đĩa để tiết kiệm dung lượng)
        self.storage.save_face(
            employee_id=employee_id,
            embedding=embedding,
            full_name=full_name,
            department=department,
            image_path="",
            metadata=metadata
        )

        return FaceEnrollResponse(
            success=True,
            employee_id=employee_id,
            message=f"Successfully enrolled face for {full_name or employee_id}",
            face_detected=True,
            quality_passed=True,
            image_saved_path="",
            registered_angles=["straight"],
            embeddings={"straight": embedding.tolist() if hasattr(embedding, 'tolist') else list(embedding)},
            reasons=[]
        )

    def enroll_employee_multi_angle(
        self,
        images_dict: Dict[str, np.ndarray],
        employee_id: str,
        full_name: Optional[str] = None,
        department: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        check_quality: bool = True
    ) -> FaceEnrollResponse:
        """
        Enrolls multi-angle face embeddings for accurate recognition,
        and saves ONLY 1 single frontal/straight panorama image into www/register.
        """
        if not images_dict or len(images_dict) == 0:
            return FaceEnrollResponse(
                success=False,
                employee_id=employee_id,
                message="No angle images provided",
                face_detected=False,
                quality_passed=False,
                reasons=["MISSING_IMAGES: Please provide images for straight, left, and right angles."]
            )

        embeddings_dict = {}
        all_reasons = []
        registered_angles = []
        image_paths_dict = {}

        # Không lưu trữ ảnh khuôn mặt ra ổ đĩa để tiết kiệm dung lượng, trích xuất vector trực tiếp từ RAM
        image_paths_dict = {}
        primary_path_str = ""

        # 1. Trích xuất đặc trưng ArcFace Vector (512D) cho từng góc khuôn mặt
        for angle_name, img_bgr in images_dict.items():
            if img_bgr is None or img_bgr.size == 0:
                continue

            faces = self.detector.detect_faces(img_bgr)
            if len(faces) == 0:
                all_reasons.append(f"FACE_NOT_FOUND: Không phát hiện khuôn mặt ở góc '{angle_name}'.")
                continue

            faces.sort(key=lambda f: f.bbox.width * f.bbox.height, reverse=True)
            face = faces[0]

            if check_quality and not face.quality.valid:
                all_reasons.extend([f"[{angle_name}] {r}" for r in face.quality.reasons])
                continue

            aligned = self.embedder.align_face(img_bgr, face)
            vec = self.embedder.extract_embedding(aligned)
            embeddings_dict[angle_name] = vec
            registered_angles.append(angle_name)

        # Fallback: Nếu chất lượng bị cảnh báo nhưng khuôn mặt vẫn được phát hiện rõ, vẫn tiến hành trích xuất vector 512D
        if len(embeddings_dict) == 0:
            for angle_name, img_bgr in images_dict.items():
                if img_bgr is None or img_bgr.size == 0:
                    continue
                faces = self.detector.detect_faces(img_bgr)
                if len(faces) == 0:
                    continue
                faces.sort(key=lambda f: f.bbox.width * f.bbox.height, reverse=True)
                aligned = self.embedder.align_face(img_bgr, faces[0])
                vec = self.embedder.extract_embedding(aligned)
                embeddings_dict[angle_name] = vec
                registered_angles.append(angle_name)

        if len(embeddings_dict) == 0:
            return FaceEnrollResponse(
                success=False,
                employee_id=employee_id,
                message="Không thể trích xuất vector đặc trưng hợp lệ từ các góc ảnh gửi lên.",
                face_detected=False,
                quality_passed=False,
                reasons=all_reasons or ["Lỗi xử lý ảnh góc khuôn mặt."]
            )

        # 3. Lưu trữ toàn bộ 5 vector đặc trưng vào Storage (JSON Vector DB + MongoDB)
        self.storage.save_face_multi_angle(
            employee_id=employee_id,
            embeddings=embeddings_dict,
            full_name=full_name,
            department=department,
            image_paths=image_paths_dict,
            metadata=metadata
        )

        # Convert numpy embeddings to float lists for JSON response
        serializable_embeddings = {
            k: (v.tolist() if hasattr(v, 'tolist') else list(v))
            for k, v in embeddings_dict.items()
        }

        return FaceEnrollResponse(
            success=True,
            employee_id=employee_id,
            message=f"Successfully registered {len(registered_angles)} angles ({', '.join(registered_angles)}) for {full_name or employee_id}",
            face_detected=True,
            quality_passed=True,
            image_saved_path=primary_path_str,
            registered_angles=registered_angles,
            embeddings=serializable_embeddings,
            reasons=all_reasons
        )

    def recognize_face(
        self,
        image_bgr: np.ndarray,
        threshold: float = settings.SIMILARITY_THRESHOLD,
        check_liveness: bool = True,
        check_quality: bool = True
    ) -> FaceRecognizeResponse:
        """
        1:N Search - Identifies who is in the image against all enrolled profiles.
        """
        if image_bgr is None:
            return FaceRecognizeResponse(
                matched=False,
                similarity=0.0,
                threshold=threshold,
                liveness_passed=False,
                liveness_score=0.0,
                reasons=["Could not decode image"]
            )

        # 1. Detect faces
        faces = self.detector.detect_faces(image_bgr)
        if len(faces) == 0:
            return FaceRecognizeResponse(
                matched=False,
                similarity=0.0,
                threshold=threshold,
                liveness_passed=False,
                liveness_score=0.0,
                reasons=["FACE_NOT_FOUND: No face detected."]
            )

        # Sort faces by area descending (largest first)
        faces.sort(key=lambda f: f.bbox.width * f.bbox.height, reverse=True)

        # If multiple faces exist, check if the largest face is the dominant foreground subject
        if len(faces) > 1:
            largest_area = faces[0].bbox.width * faces[0].bbox.height
            second_area = faces[1].bbox.width * faces[1].bbox.height
            if largest_area < 2.5 * second_area:
                return FaceRecognizeResponse(
                    matched=False,
                    similarity=0.0,
                    threshold=threshold,
                    liveness_passed=False,
                    liveness_score=0.0,
                    reasons=["MULTIPLE_FACES: Multiple subjects detected in frame. Please ensure only 1 person is centered."]
                )

        face = faces[0]

        # 2. Quality Check (Keep as info reasons, do not block recognition if face is clear)
        quality_reasons = []
        if not face.quality.valid:
            quality_reasons = face.quality.reasons


        # 3. Liveness Check
        liveness_passed = True
        liveness_score = 1.0
        reasons = []

        if check_liveness:
            liveness = LivenessChecker.check_liveness(image_bgr, face.bbox)
            liveness_score = liveness.score
            liveness_passed = liveness.is_live
            if not liveness_passed:
                reasons.append(f"SPOOF_DETECTED: Liveness check failed (Score: {liveness_score:.2f}/{settings.LIVENESS_THRESHOLD})")

        # 4. Align & Extract Embedding
        aligned_face = self.embedder.align_face(image_bgr, face)
        query_embedding = self.embedder.extract_embedding(aligned_face)

        # 5. Search in storage
        candidates = self.storage.search_similar_faces(query_embedding, top_k=5, threshold=threshold)

        if not candidates:
            return FaceRecognizeResponse(
                matched=False,
                similarity=0.0,
                threshold=threshold,
                liveness_passed=liveness_passed,
                liveness_score=liveness_score,
                candidates=[],
                reasons=reasons or ["NO_MATCH: No matching employee in database."],
                face_box=face.bbox
            )

        best_match = candidates[0]
        is_matched = (best_match.similarity >= threshold) and liveness_passed

        if not is_matched and best_match.similarity < threshold:
            reasons.append(f"LOW_SIMILARITY: Best match was {best_match.employee_id} ({best_match.similarity:.2f} < threshold {threshold})")

        return FaceRecognizeResponse(
            matched=is_matched,
            employee_id=best_match.employee_id if is_matched else None,
            full_name=best_match.full_name if is_matched else None,
            similarity=best_match.similarity,
            threshold=threshold,
            liveness_passed=liveness_passed,
            liveness_score=liveness_score,
            candidates=candidates,
            reasons=reasons,
            face_box=face.bbox
        )

    def verify_employee(
        self,
        image_bgr: np.ndarray,
        employee_id: str,
        threshold: float = settings.SIMILARITY_THRESHOLD,
        check_liveness: bool = True,
        check_quality: bool = True
    ) -> FaceVerifyResponse:
        """
        1:1 Verification - Verifies if the image matches a claimed employee_id.
        """
        profile = self.storage.get_face(employee_id)
        if not profile:
            return FaceVerifyResponse(
                matched=False,
                employee_id=employee_id,
                similarity=0.0,
                threshold=threshold,
                liveness_passed=False,
                liveness_score=0.0,
                reasons=[f"EMPLOYEE_NOT_ENROLLED: Employee ID '{employee_id}' has not registered face data."]
            )

        # Run recognition
        rec_res = self.recognize_face(image_bgr, threshold=threshold, check_liveness=check_liveness, check_quality=check_quality)

        
        # Calculate direct 1:1 similarity against ALL registered angle vectors of the claimed employee
        faces = self.detector.detect_faces(image_bgr)
        if len(faces) == 0:
            return FaceVerifyResponse(
                matched=False,
                employee_id=employee_id,
                full_name=profile.get("full_name"),
                similarity=0.0,
                threshold=threshold,
                liveness_passed=False,
                liveness_score=0.0,
                reasons=["FACE_NOT_FOUND: No face detected in image."]
            )

        faces.sort(key=lambda f: f.bbox.width * f.bbox.height, reverse=True)
        primary_face = faces[0]

        aligned = self.embedder.align_face(image_bgr, primary_face)
        query_vec = self.embedder.extract_embedding(aligned)

        # Multi-angle similarity match
        vectors = self.storage.get_face_vectors(employee_id)
        best_sim = 0.0
        best_angle = "straight"

        for angle_name, db_vec in vectors:
            sim = self.embedder.compute_similarity(query_vec, db_vec)
            if sim > best_sim:
                best_sim = sim
                best_angle = angle_name

        is_matched = (best_sim >= threshold) and rec_res.liveness_passed
        reasons = list(rec_res.reasons)
        if not is_matched and best_sim < threshold:
            reasons.append(f"MISMATCH: Face does not match employee '{employee_id}' (Similarity: {best_sim:.2f} < {threshold})")

        return FaceVerifyResponse(
            matched=is_matched,
            employee_id=employee_id,
            full_name=profile.get("full_name"),
            similarity=round(best_sim, 4),
            threshold=threshold,
            matched_angle=best_angle,
            liveness_passed=rec_res.liveness_passed,
            liveness_score=rec_res.liveness_score,
            reasons=reasons,
            face_box=rec_res.face_box
        )

    def detect_face_action(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Realtime tracking of facial bounding box, 5 landmarks, head pose (yaw/pitch), and eye blinks.
        """
        if image_bgr is None:
            return {"face_detected": False}

        faces = self.detector.detect_faces(image_bgr)
        if not faces:
            return {"face_detected": False}

        # Select primary dominant face
        faces.sort(key=lambda f: f.bbox.width * f.bbox.height, reverse=True)
        face = faces[0]

        # Pose & Eye state analysis
        pose_info = LivenessChecker.estimate_head_pose(face.landmarks, face.bbox)
        eye_info = LivenessChecker.analyze_eye_state(image_bgr, face.landmarks, face.bbox)
        liveness = LivenessChecker.check_liveness(image_bgr, face.bbox)

        combined_pose = {
            "pose": pose_info["pose"],
            "yaw_deg": pose_info.get("yaw_deg", 0.0),
            "pitch_deg": pose_info.get("pitch_deg", 0.0),
            "roll_deg": pose_info.get("roll_deg", 0.0),
            "yaw_ratio": round(pose_info.get("yaw_deg", 0.0) / 45.0, 3),
            "pitch_ratio": round(pose_info.get("pitch_deg", 0.0) / 45.0, 3),
            "vert_ratio": pose_info.get("vert_ratio", 1.4),
            "blink_detected": eye_info["blink_detected"],
            "eye_open_score": eye_info["eye_open_score"]
        }

        # Fast Real-time Identification against registered database
        identity = {
            "matched": False,
            "employee_id": None,
            "full_name": None,
            "similarity": 0.0
        }

        if len(self.storage.profiles) > 0:
            try:
                aligned = self.embedder.align_face(image_bgr, face)
                query_vec = self.embedder.extract_embedding(aligned)
                candidates = self.storage.search_similar_faces(query_vec, top_k=1, threshold=settings.SIMILARITY_THRESHOLD)
                if candidates:
                    best = candidates[0]
                    is_match = best.similarity >= settings.SIMILARITY_THRESHOLD
                    identity = {
                        "matched": is_match,
                        "employee_id": best.employee_id if is_match else None,
                        "full_name": best.full_name if is_match else None,
                        "similarity": best.similarity
                    }
            except Exception as e:
                pass

        return {
            "face_detected": True,
            "bbox": face.bbox.dict() if hasattr(face.bbox, 'dict') else face.bbox.model_dump(),
            "landmarks": face.landmarks.dict() if hasattr(face.landmarks, 'dict') else face.landmarks.model_dump() if face.landmarks else None,
            "pose": combined_pose,
            "quality": face.quality.dict() if hasattr(face.quality, 'dict') else face.quality.model_dump(),
            "liveness_score": liveness.score,
            "identity": identity
        }


