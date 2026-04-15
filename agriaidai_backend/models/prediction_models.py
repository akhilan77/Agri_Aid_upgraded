"""
Pydantic models for request and response schemas.
Following DIP (Dependency Inversion Principle): Models define contracts that services must follow.
"""
# Data models
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Request model for prediction endpoint"""
    crop: str = Field(..., description="Type of crop being analyzed")


class PredictionResponse(BaseModel):
    """Response model for prediction endpoint - follows the exact format required"""
    crop: str = Field(..., description="Type of crop analyzed")
    disease: str = Field(..., description="Detected disease name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    symptoms: List[str] = Field(..., description="List of disease symptoms observed")
    treatments: List[str] = Field(..., description="Recommended treatment options")
    preventiveTips: List[str] = Field(..., description="Preventive measures to avoid future occurrences")


class HistoryEntry(BaseModel):
    """Model for a single history entry"""
    timestamp: datetime = Field(..., description="When the prediction was made")
    crop: str = Field(..., description="Crop type analyzed")
    disease: str = Field(..., description="Disease detected")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")


class HistoryResponse(BaseModel):
    """Response model for GET /history endpoint"""
    predictions: List[HistoryEntry] = Field(..., description="List of previous predictions")


class HistoryCreateRequest(BaseModel):
    """Request model for POST /history endpoint"""
    crop: str = Field(..., description="Crop type")
    disease: str = Field(..., description="Disease detected")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")


class WeatherResponse(BaseModel):
    """Response model for weather endpoint"""
    city: str = Field(..., description="City name")
    temp: int = Field(..., description="Temperature in Celsius")
    humidity: int = Field(..., description="Humidity percentage")
    condition: str = Field(default="Unknown", description="Weather condition description")
    wind_speed: int = Field(default=0, description="Wind speed in km/h")


class AdminStatsResponse(BaseModel):
    """Response model for admin stats endpoint"""
    users: int = Field(..., description="Total number of users")
    predictions: int = Field(..., description="Total number of predictions")
    avgConfidence: float = Field(..., ge=0.0, le=1.0, description="Average confidence score")
    predictionsPerDay: List[int] = Field(..., description="Daily prediction counts for the week")




