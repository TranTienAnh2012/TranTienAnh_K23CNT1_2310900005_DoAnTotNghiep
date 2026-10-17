from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ExtractEmbeddingResponse(BaseModel):
    success: bool
    embedding: List[float] = Field(..., description="Vector đặc trưng khuôn mặt 512 chiều")
    quality: Dict[str, Any] = Field(default_factory=dict, description="Điểm độ sáng, độ nét")
    box: Dict[str, Any] = Field(default_factory=dict, description="Tọa độ khung mặt phát hiện")
    message: str

class VerifyFaceResponse(BaseModel):
    success: bool
    is_match: bool = Field(..., description="True nếu độ tương đồng >= ngưỡng")
    similarity_score: float = Field(..., description="Điểm Cosine Similarity (0.0 - 1.0)")
    threshold: float
    message: str

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
