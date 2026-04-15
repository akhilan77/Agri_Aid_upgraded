"""
Pytest configuration file for shared fixtures.
"""
# Test configuration
import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    """Provide a test client for FastAPI app"""
    return TestClient(app)

