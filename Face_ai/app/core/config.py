import os
from pathlib import Path
from dotenv import load_dotenv

# Thư mục gốc Face_ai và thư mục gốc của toàn bộ hệ thống SmartEdu
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent

# Ưu tiên nạp file .env từ thư mục gốc của hệ thống
root_env = ROOT_DIR / ".env"
local_env = BASE_DIR / ".env"

if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=True)
elif local_env.exists():
    load_dotenv(dotenv_path=local_env, override=True)

class Settings:
    # Ứng dụng
    APP_NAME: str = "SmartEdu Face AI Microservice"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("NODE_ENV", "development") == "development"
    
    # Máy chủ
    HOST: str = os.getenv("FACE_AI_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("FACE_AI_PORT", 8000))
    INTERNAL_AI_SECRET: str = os.getenv("INTERNAL_AI_SECRET", "SmartEdu_FaceAI_Secret_Key_9999")
    
    # MySQL Database (smart_edu_db)
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", 3306))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "smart_edu_db")
    
    # Nhận diện khuôn mặt & Trọng số ONNX
    MODELS_DIR: Path = BASE_DIR / "models_weights"
    YUNET_MODEL_PATH: Path = MODELS_DIR / "face_detection_yunet.onnx"
    SFACE_MODEL_PATH: Path = MODELS_DIR / "face_recognition_sface.onnx"
    
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", 0.68))
    EMBEDDING_DIM: int = 512
    MIN_FACE_SIZE: int = 50

settings = Settings()
