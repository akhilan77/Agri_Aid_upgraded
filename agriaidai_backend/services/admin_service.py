"""
Admin Service - provides real statistics derived from HistoryService.
"""
import logging
from collections import defaultdict
from datetime import datetime, timedelta

try:
    from ..models.prediction_models import AdminStatsResponse
    from ..services.history_service import HistoryService
except ImportError:
    from models.prediction_models import AdminStatsResponse
    from services.history_service import HistoryService

logger = logging.getLogger(__name__)


class AdminService:

    def __init__(self, history_service: HistoryService):
        self._history = history_service

    def get_stats(self) -> AdminStatsResponse:
        """
        Derive real stats from the in-memory prediction history.
        - predictions: total count
        - avgConfidence: mean confidence across all predictions
        - predictionsPerDay: count for each of the last 7 days (oldest → newest)
        - users: not tracked yet, returns 0 until auth is in place
        """
        logger.info("Computing real admin statistics from history")
        all_predictions = self._history.get_history(limit=10_000)

        total = len(all_predictions)
        avg_conf = round(
            sum(p.confidence for p in all_predictions) / total, 4
        ) if total else 0.0

        # Build per-day counts for the last 7 days
        today = datetime.now().date()
        day_counts: dict[int, int] = defaultdict(int)  # offset 0=oldest … 6=today
        for p in all_predictions:
            delta = (today - p.timestamp.date()).days
            if 0 <= delta < 7:
                day_counts[6 - delta] += 1  # map to slot 0–6

        per_day = [day_counts[i] for i in range(7)]

        return AdminStatsResponse(
            users=0,                          # real auth not yet implemented
            predictions=total,
            avgConfidence=avg_conf,
            predictionsPerDay=per_day,
        )
