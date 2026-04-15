"""
Unit tests for admin stats endpoint.
Tests validate status code 200 and response keys.
"""
# Admin endpoint tests
import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_admin_stats_endpoint():
    """Test GET /admin/stats endpoint returns 200 with correct response structure"""
    response = client.get("/admin/stats")
    
    assert response.status_code == 200
    json_response = response.json()
    
    # Validate all required keys
    assert "users" in json_response
    assert "predictions" in json_response
    assert "avgConfidence" in json_response
    assert "predictionsPerDay" in json_response
    
    # Validate types
    assert isinstance(json_response["users"], int)
    assert isinstance(json_response["predictions"], int)
    assert isinstance(json_response["avgConfidence"], float)
    assert isinstance(json_response["predictionsPerDay"], list)
    
    # Validate values match requirements
    assert json_response["users"] == 35
    assert json_response["predictions"] == 142
    assert json_response["avgConfidence"] == 0.84
    
    # Validate predictionsPerDay structure
    assert len(json_response["predictionsPerDay"]) == 7
    assert all(isinstance(x, int) for x in json_response["predictionsPerDay"])
    assert json_response["predictionsPerDay"] == [10, 15, 22, 30, 25, 20, 28]
    
    # Validate confidence range
    assert 0.0 <= json_response["avgConfidence"] <= 1.0

