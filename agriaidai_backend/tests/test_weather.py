"""
Unit tests for weather endpoint.
Tests validate status code 200 and response keys.
"""
# Weather endpoint tests
import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_weather_endpoint():
    """Test GET /weather endpoint returns 200 with correct response structure"""
    response = client.get("/weather")
    
    assert response.status_code == 200
    json_response = response.json()
    
    # Validate all required keys are present
    assert "city" in json_response
    assert "temp" in json_response
    assert "humidity" in json_response
    
    # Validate values
    assert json_response["city"] == "Coimbatore"
    assert json_response["temp"] == 31
    assert json_response["humidity"] == 85
    
    # Validate types
    assert isinstance(json_response["city"], str)
    assert isinstance(json_response["temp"], int)
    assert isinstance(json_response["humidity"], int)


