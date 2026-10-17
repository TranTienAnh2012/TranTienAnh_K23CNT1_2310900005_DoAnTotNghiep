import pytest
from app.services.matcher import cosine_similarity, verify_match

def test_cosine_similarity_identical():
    v1 = [1.0, 0.0, 0.0, 0.5]
    v2 = [1.0, 0.0, 0.0, 0.5]
    score = cosine_similarity(v1, v2)
    assert abs(score - 1.0) < 1e-5
    assert verify_match(score, 0.68) is True

def test_cosine_similarity_orthogonal():
    v1 = [1.0, 0.0]
    v2 = [0.0, 1.0]
    score = cosine_similarity(v1, v2)
    assert abs(score - 0.0) < 1e-5
    assert verify_match(score, 0.68) is False

def test_verify_match_threshold():
    assert verify_match(0.70, 0.68) is True
    assert verify_match(0.65, 0.68) is False
