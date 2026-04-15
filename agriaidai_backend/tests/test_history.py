"""
Unit tests for history endpoints.
Tests validate status code 200 and response keys.
"""
# History endpoint tests
import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_history_endpoint():
    """Test GET /history endpoint returns 200 with correct response structure"""
    response = client.get("/history")
    
    assert response.status_code == 200
    json_response = response.json()
    
    # Validate required keys
    assert "predictions" in json_response
    assert isinstance(json_response["predictions"], list)
    
    # Should have 5 mock entries initially
    assert len(json_response["predictions"]) >= 5
    
    # Validate structure of each entry
    for entry in json_response["predictions"]:
        assert "timestamp" in entry
        assert "crop" in entry
        assert "disease" in entry
        assert "confidence" in entry
        assert isinstance(entry["confidence"], float)
        assert 0.0 <= entry["confidence"] <= 1.0


def test_post_history_endpoint():
    """Test POST /history endpoint returns 200 with correct response structure"""
    data = {
        "crop": "TestCrop",
        "disease": "TestDisease",
        "confidence": 0.88
    }
    
    response = client.post("/history", json=data)
    
    assert response.status_code == 200
    json_response = response.json()
    
    # Validate all required keys
    assert "timestamp" in json_response
    assert "crop" in json_response
    assert "disease" in json_response
    assert "confidence" in json_response
    
    # Validate values
    assert json_response["crop"] == "TestCrop"
    assert json_response["disease"] == "TestDisease"
    assert json_response["confidence"] == 0.88


def test_post_history_then_get():
    """Test that adding history entry makes it appear in GET /history"""
    # Add a unique entry
    data = {
        "crop": "UniqueCrop123",
        "disease": "UniqueDisease123",
        "confidence": 0.91
    }
    
    post_response = client.post("/history", json=data)
    assert post_response.status_code == 200
    
    # Get history and verify entry appears
    get_response = client.get("/history")
    assert get_response.status_code == 200
    
    predictions = get_response.json()["predictions"]
    found = any(
        p["crop"] == "UniqueCrop123" and p["disease"] == "UniqueDisease123"
        for p in predictions
    )
    assert found, "Newly added history entry should appear in GET /history"

