"""
History Service - manages prediction history.
Following SRP (Single Responsibility Principle): Only handles history management.
"""
# History service implementation
import logging
from datetime import datetime
from typing import List

try:
    # Try relative imports (when running as module)
    from ..models.prediction_models import HistoryEntry, HistoryCreateRequest
except ImportError:
    # Fall back to absolute imports (when running directly)
    from models.prediction_models import HistoryEntry, HistoryCreateRequest

logger = logging.getLogger(__name__)


class HistoryService:
    """
    Service for managing prediction history.
    Uses in-memory storage for simplicity (in production, would use a database).
    """
    
    def __init__(self):
        """Initialize with an empty history (populated by real predictions)."""
        self._history: List[HistoryEntry] = []
        logger.info("HistoryService initialized (empty)")
    
    def get_history(self, limit: int = 10) -> List[HistoryEntry]:
        """
        Get prediction history.
        
        Args:
            limit: Maximum number of entries to return
            
        Returns:
            List of history entries sorted by timestamp (newest first)
        """
        logger.info(f"Retrieving history, limit: {limit}")
        sorted_history = sorted(self._history, key=lambda x: x.timestamp, reverse=True)
        return sorted_history[:limit]
    
    def add_prediction(self, request: HistoryCreateRequest) -> HistoryEntry:
        """
        Add a new prediction to history.
        
        Args:
            request: History creation request with crop, disease, and confidence
            
        Returns:
            The newly created history entry
        """
        logger.info(f"Adding new prediction: {request.crop} - {request.disease}")
        entry = HistoryEntry(
            timestamp=datetime.now(),
            crop=request.crop,
            disease=request.disease,
            confidence=request.confidence
        )
        self._history.append(entry)
        logger.info(f"History now contains {len(self._history)} entries")
        return entry


