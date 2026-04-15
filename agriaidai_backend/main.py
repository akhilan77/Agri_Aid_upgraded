"""
FastAPI Main Application - Entry point for AgriAidAI Backend.
Following DIP (Dependency Inversion): Routes depend on service abstractions.
Following SRP: Main module only handles routing and dependency injection.
"""
import logging
import os
from contextlib import asynccontextmanager

# Suppress TensorFlow oneDNN / C++ verbose logs before TF is imported
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from .models.prediction_models import (
        PredictionResponse,
        HistoryResponse,
        HistoryCreateRequest,
        HistoryEntry,
        WeatherResponse,
        AdminStatsResponse,
    )
    from .services.prediction_service import PlantDiseasePredictor, _load_artifacts
    from .services.history_service import HistoryService
    from .services.weather_service import WeatherService
    from .services.admin_service import AdminService
except ImportError:
    from models.prediction_models import (
        PredictionResponse,
        HistoryResponse,
        HistoryCreateRequest,
        HistoryEntry,
        WeatherResponse,
        AdminStatsResponse,
    )
    from services.prediction_service import PlantDiseasePredictor, _load_artifacts
    from services.history_service import HistoryService
    from services.weather_service import WeatherService
    from services.admin_service import AdminService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (replaces deprecated @app.on_event) ─────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-warm the ML model on startup."""
    logger.info("=" * 60)
    logger.info("AgriAidAI Backend - Real Model Service Started")
    logger.info("=" * 60)
    logger.info("Endpoints: POST /predict  GET /history  GET /weather  GET /admin/stats  GET /docs")
    logger.info("=" * 60)

    try:
        _load_artifacts()
        logger.info("✅ ML model loaded and ready.")
    except Exception as exc:
        logger.warning(f"⚠️  Could not pre-load model at startup: {exc}")

    yield  # application runs here


# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AgriAidAI Backend API",
    description="AgriAidAI Smart Crop Disease Detection — powered by MobileNetV2 (TensorFlow)",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services (instantiated once at module load)
predictor       = PlantDiseasePredictor()
history_service = HistoryService()
weather_service = WeatherService()
admin_service   = AdminService(history_service)  # inject real history


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "AgriAidAI Backend API", "version": "2.0.0", "status": "running", "docs": "/docs"}


@app.post("/predict", response_model=PredictionResponse, status_code=200)
async def predict_disease(
    crop: str = Form(..., description="Type of crop"),
    file: UploadFile = File(..., description="Image file of the crop"),
):
    """Predict crop disease from an uploaded image."""
    logger.info(f"Prediction request — crop: {crop}, file: {file.filename}")
    try:
        image_bytes = await file.read()
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        prediction = await predictor.predict(crop, image_bytes)
        logger.info(f"Prediction: {prediction.disease} ({prediction.confidence:.3f})")
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


@app.get("/history", response_model=HistoryResponse, status_code=200)
async def get_history():
    predictions = history_service.get_history(limit=10)
    return HistoryResponse(predictions=predictions)


@app.post("/history", response_model=HistoryEntry, status_code=200)
async def add_history_entry(request: HistoryCreateRequest):
    return history_service.add_prediction(request)


@app.get("/weather", response_model=WeatherResponse, status_code=200)
async def get_weather(city: str = "Coimbatore", lat: float | None = None, lon: float | None = None):
    """Get real-time weather. Accepts lat/lon (from browser geolocation) or a city name."""
    return weather_service.get_weather(city=city, lat=lat, lon=lon)


@app.get("/admin/stats", response_model=AdminStatsResponse, status_code=200)
async def get_admin_stats():
    return admin_service.get_stats()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
