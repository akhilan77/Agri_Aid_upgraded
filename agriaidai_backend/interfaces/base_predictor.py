"""
Abstract base class for prediction services.
Following SOLID principles:
- OCP (Open/Closed Principle): Can extend with new predictor types without modifying existing code
- LSP (Liskov Substitution Principle): Any implementation can substitute BasePredictor
- ISP (Interface Segregation Principle): Small, focused interface for prediction only
- DIP (Dependency Inversion Principle): High-level modules depend on this abstraction
"""
# Base predictor interface
from abc import ABC, abstractmethod
from typing import List

try:
    # Try relative imports (when running as module)
    from ..models.prediction_models import PredictionResponse
except ImportError:
    # Fall back to absolute imports (when running directly)
    from models.prediction_models import PredictionResponse


class BasePredictor(ABC):
    """
    Abstract interface for crop disease prediction.
    This allows us to swap implementations (Mock, ML Model, etc.) without changing dependent code.
    """
    
    @abstractmethod
    async def predict(self, crop: str, image_bytes: bytes) -> PredictionResponse:
        """
        Predict disease from crop type and image.
        
        Args:
            crop: Type of crop (e.g., "Tomato", "Corn")
            image_bytes: Raw image file bytes
            
        Returns:
            PredictionResponse with disease, confidence, symptoms, treatments, and tips
        """
        pass


