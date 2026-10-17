import pymysql
import json
import logging
from app.core.config import settings

logger = logging.getLogger("SmartEdu_FaceAI_DB")

def get_mysql_connection():
    """Tạo kết nối tới CSDL MySQL smart_edu_db"""
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=5
        )
        return connection
    except Exception as e:
        logger.warning(f"Không thể kết nối MySQL: {e}")
        return None

def get_student_embedding(student_id: int):
    """Lấy vector embedding khuôn mặt của sinh viên theo id"""
    conn = get_mysql_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cursor:
            sql = "SELECT face_embedding FROM sinh_vien WHERE id = %s AND is_deleted = FALSE"
            cursor.execute(sql, (student_id,))
            result = cursor.fetchone()
            if result and result.get("face_embedding"):
                raw = result["face_embedding"]
                return json.loads(raw) if isinstance(raw, str) else raw
        return None
    finally:
        conn.close()

def update_student_embedding(student_id: int, embedding: list, avatar_url: str = None):
    """Cập nhật vector embedding và đường dẫn ảnh của sinh viên"""
    conn = get_mysql_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cursor:
            if avatar_url:
                sql = """UPDATE sinh_vien 
                         SET face_embedding = %s, avatar_url = %s, face_updated_at = NOW() 
                         WHERE id = %s"""
                cursor.execute(sql, (json.dumps(embedding), avatar_url, student_id))
            else:
                sql = """UPDATE sinh_vien 
                         SET face_embedding = %s, face_updated_at = NOW() 
                         WHERE id = %s"""
                cursor.execute(sql, (json.dumps(embedding), student_id))
            conn.commit()
            return True
    finally:
        conn.close()
