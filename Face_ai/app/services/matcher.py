import numpy as np

def cosine_similarity(vec1: list, vec2: list) -> float:
    """
    Tính Cosine Similarity giữa hai vector đặc trưng khuôn mặt:
    Score = dot(v1, v2) / (norm(v1) * norm(v2))
    Kết quả nằm trong khoảng [-1.0, 1.0] (thông thường từ 0.0 đến 1.0 cho face features)
    """
    v1 = np.array(vec1, dtype=np.float32)
    v2 = np.array(vec2, dtype=np.float32)
    
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    dot_product = np.dot(v1, v2)
    similarity = dot_product / (norm1 * norm2)
    
    # Clip trong khoảng [0, 1] để phục vụ giao diện hiển thị phần trăm
    return float(np.clip(similarity, 0.0, 1.0))

def verify_match(similarity: float, threshold: float = 0.68) -> bool:
    """
    So sánh độ tương đồng với ngưỡng (threshold)
    """
    return similarity >= threshold
