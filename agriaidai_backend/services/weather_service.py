"""
Weather Service - fetches real-time weather from Open-Meteo (free, no API key).
Geocodes city name → lat/lon, then fetches current weather conditions.
"""
import logging
import httpx
from datetime import datetime

try:
    from ..models.prediction_models import WeatherResponse
except ImportError:
    from models.prediction_models import WeatherResponse

logger = logging.getLogger(__name__)

# Open-Meteo WMO weather code → human-readable condition
_WMO_CONDITIONS: dict[int, str] = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers",
    95: "Thunderstorm", 96: "Thunderstorm w/ Hail", 99: "Thunderstorm w/ Heavy Hail",
}

_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
_WEATHER_URL   = "https://api.open-meteo.com/v1/forecast"


class WeatherService:

    def get_weather(self, city: str = "Coimbatore",
                    lat: float | None = None,
                    lon: float | None = None) -> WeatherResponse:
        """
        Fetch live weather. If lat/lon are provided (from browser geolocation)
        they are used directly, skipping geocoding. Otherwise geocodes the city.
        """
        logger.info(f"Fetching weather — lat={lat}, lon={lon}, city={city}")
        try:
            if lat is not None and lon is not None:
                # Use coordinates directly; get city name via reverse geocode
                resolved_city = self._reverse_geocode(lat, lon)
                return self._fetch_weather(lat, lon, resolved_city)
            else:
                lat_g, lon_g, resolved_city = self._geocode(city)
                return self._fetch_weather(lat_g, lon_g, resolved_city)
        except Exception as exc:
            logger.warning(f"Weather fetch failed ({exc}), returning fallback")
            return WeatherResponse(
                city=city,
                temp=0,
                humidity=0,
                condition="Unavailable",
                wind_speed=0,
            )

    # ── helpers ──────────────────────────────────────────────────────────────

    def _reverse_geocode(self, lat: float, lon: float) -> str:
        """Return a human-readable city name for given coordinates."""
        try:
            with httpx.Client(timeout=5) as client:
                r = client.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={"lat": lat, "lon": lon, "format": "json"},
                    headers={"User-Agent": "AgriAidAI/1.0"},
                )
                r.raise_for_status()
            addr = r.json().get("address", {})
            city = (
                addr.get("city")
                or addr.get("town")
                or addr.get("village")
                or addr.get("county", "Your Location")
            )
            country = addr.get("country_code", "").upper()
            return f"{city}, {country}" if country else city
        except Exception:
            return f"{lat:.2f}°N, {lon:.2f}°E"

    def _geocode(self, city: str) -> tuple[float, float, str]:
        """Return (latitude, longitude, canonical_city_name)."""
        with httpx.Client(timeout=8) as client:
            r = client.get(_GEOCODING_URL, params={"name": city, "count": 1, "language": "en"})
            r.raise_for_status()
        results = r.json().get("results", [])
        if not results:
            raise ValueError(f"City not found: {city!r}")
        hit = results[0]
        name = f"{hit['name']}, {hit.get('country', '')}"
        return hit["latitude"], hit["longitude"], name

    def _fetch_weather(self, lat: float, lon: float, city: str) -> WeatherResponse:
        """Call Open-Meteo current-weather endpoint."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            "wind_speed_unit": "kmh",
            "timezone": "auto",
        }
        with httpx.Client(timeout=8) as client:
            r = client.get(_WEATHER_URL, params=params)
            r.raise_for_status()

        current = r.json()["current"]
        code    = current.get("weather_code", 0)
        condition = _WMO_CONDITIONS.get(code, f"Code {code}")

        return WeatherResponse(
            city=city,
            temp=int(round(current["temperature_2m"])),
            humidity=int(current["relative_humidity_2m"]),
            condition=condition,
            wind_speed=int(round(current["wind_speed_10m"])),
        )
