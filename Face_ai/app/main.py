import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as endpoints_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SmartEdu Face AI Microservice - Nhận diện khuôn mặt & Check-in đào tạo thông minh"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn router API chính thức (Stateless - Sử dụng trực tiếp vector từ MySQL)
app.include_router(endpoints_router)
app.include_router(endpoints_router, prefix="/api")


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "models": {
            "yunet_exists": os.path.exists(settings.YUNET_MODEL_PATH),
            "sface_exists": os.path.exists(settings.SFACE_MODEL_PATH)
        }
    }

@app.get("/", tags=["System"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
