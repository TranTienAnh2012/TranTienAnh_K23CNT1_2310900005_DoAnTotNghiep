import json
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.services.detector import detector_instance
from app.services.embedder import embedder_instance
from app.services.matcher import cosine_similarity, verify_match
from app.schemas.face_schema import ExtractEmbeddingResponse, VerifyFaceResponse
from app.core.config import settings

logger = logging.getLogger("SmartEdu_Endpoints")
router = APIRouter(tags=["Face AI Recognition"])

@router.post("/extract-embedding", response_model=ExtractEmbeddingResponse)
async def extract_face_embedding(file: UploadFile = File(...)):
    """
    Trích xuất vector đặc trưng 512 chiều từ ảnh chân dung khuôn mặt
    Dùng cho tính năng Đăng ký mẫu khuôn mặt (Face Registration)
    """
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File ảnh rỗng.")

        # 1. Phát hiện khuôn mặt
        cropped, bbox, quality, full_img = detector_instance.detect_face(content)

        # 2. Trích xuất embedding
        embedding = embedder_instance.extract_features(cropped, full_img, bbox)

        return ExtractEmbeddingResponse(
            success=True,
            embedding=embedding,
            quality=quality,
            box=bbox,
            message="Trích xuất vector khuôn mặt 512 chiều thành công."
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Lỗi extract-embedding: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi phân tích AI: {str(e)}")

@router.post("/verify-face", response_model=VerifyFaceResponse)
async def verify_face(
    file: UploadFile = File(...),
    registered_embedding: str = Form(..., description="Vector embedding đã đăng ký (JSON string)"),
    threshold: float = Form(default=settings.SIMILARITY_THRESHOLD, description="Ngưỡng tương đồng (0.0 - 1.0)")
):
    """
    Đối soát khuôn mặt điểm danh hoặc vào phòng thi với dữ liệu sinh viên đã đăng ký
    """
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File ảnh rỗng.")

        # Parse vector mẫu
        try:
            target_vec = json.loads(registered_embedding)
            if not isinstance(target_vec, list) or len(target_vec) == 0:
                raise ValueError()
        except Exception:
            raise HTTPException(status_code=400, detail="registered_embedding không phải là mảng JSON hợp lệ.")

        # 1. Phát hiện khuôn mặt trong ảnh chụp check-in
        cropped, bbox, quality, full_img = detector_instance.detect_face(content)

        # 2. Trích xuất embedding của ảnh check-in
        checkin_embedding = embedder_instance.extract_features(cropped, full_img, bbox)

        # 3. Tính Cosine Similarity
        score = cosine_similarity(checkin_embedding, target_vec)
        is_matched = verify_match(score, threshold)

        msg = "Xác thực danh tính thành công." if is_matched else "Khuôn mặt không trùng khớp với hồ sơ đăng ký."

        return VerifyFaceResponse(
            success=True,
            is_match=is_matched,
            similarity_score=round(score, 4),
            threshold=threshold,
            message=msg
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Lỗi verify-face: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý xác thực khuôn mặt: {str(e)}")

@router.post("/detect-pose")
async def detect_face_pose(file: UploadFile = File(...)):
    """
    Phát hiện góc xoay đầu (Head Pose Yaw/Pitch/Roll) và landmarks thời gian thực phục vụ Biometric HUD
    """
    try:
        content = await file.read()
        if len(content) == 0:
            return {"face_detected": False, "message": "File rỗng"}
        
        result = detector_instance.detect_pose(content)
        return {"success": True, **result}
    except Exception as e:
        logger.error(f"Lỗi detect-pose: {e}", exc_info=True)
        return {"face_detected": False, "error": str(e)}

