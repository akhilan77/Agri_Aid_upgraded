"""
Unit tests for prediction endpoint.
Tests validate status code 200 and response keys as required.
"""
# Prediction endpoint tests
import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_predict_endpoint():
    """Test POST /predict endpoint returns 200 with correct response structure"""
    # Create a dummy image file
    image_content = b"fake image content"
    files = {"file": ("test_image.jpg", image_content, "image/jpeg")}
    data = {"crop": "Tomato"}
    
    response = client.post("/predict", files=files, data=data)
    
    assert response.status_code == 200
    json_response = response.json()
    
    # Validate all required keys are present
    assert "crop" in json_response
    assert "disease" in json_response
    assert "confidence" in json_response
    assert "symptoms" in json_response
    assert "treatments" in json_response
    assert "preventiveTips" in json_response
    
    # Validate types
    assert isinstance(json_response["crop"], str)
    assert isinstance(json_response["disease"], str)
    assert isinstance(json_response["confidence"], float)
    assert isinstance(json_response["symptoms"], list)
    assert isinstance(json_response["treatments"], list)
    assert isinstance(json_response["preventiveTips"], list)
    
    # Validate confidence range
    assert 0.0 <= json_response["confidence"] <= 1.0


def test_predict_with_different_crops():
    """Test prediction with various crop types"""
    crops = ["Tomato", "Corn", "Wheat", "Rice", "Potato", "Apple"]
    image_content = b"fake image content"
    
    for crop in crops:
        files = {"file": ("test_image.jpg", image_content, "image/jpeg")}
        data = {"crop": crop}
        
        response = client.post("/predict", files=files, data=data)
        assert response.status_code == 200
        json_response = response.json()
        assert json_response["crop"].capitalize() == crop.capitalize()


def test_predict_invalid_image_type():
    """Test prediction with non-image file"""
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    data = {"crop": "Tomato"}
    
    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 400


