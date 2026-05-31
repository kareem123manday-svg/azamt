from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (kept for future use, app uses localStorage primarily)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="منظم الصلاة - Islamic Daily Planner API")
api_router = APIRouter(prefix="/api")


class PrayerTimesResponse(BaseModel):
    fajr: str
    sunrise: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    date_gregorian: str
    date_hijri: str
    city: Optional[str] = None
    country: Optional[str] = None
    method: int


@api_router.get("/")
async def root():
    return {"message": "Salah First - Islamic Daily Planner"}


@api_router.get("/prayer-times", response_model=PrayerTimesResponse)
async def get_prayer_times(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    method: int = Query(4, description="Calculation method (4 = Umm Al-Qura)"),
):
    """Proxy to Aladhan API for prayer times based on coordinates."""
    url = "https://api.aladhan.com/v1/timings"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "method": method,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as http:
            r = await http.get(url, params=params)
            r.raise_for_status()
            data = r.json()["data"]
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Aladhan API error: {e}")

    timings = data["timings"]
    date = data["date"]
    meta = data.get("meta", {})

    return PrayerTimesResponse(
        fajr=timings["Fajr"],
        sunrise=timings["Sunrise"],
        dhuhr=timings["Dhuhr"],
        asr=timings["Asr"],
        maghrib=timings["Maghrib"],
        isha=timings["Isha"],
        date_gregorian=date["gregorian"]["date"],
        date_hijri=f"{date['hijri']['day']} {date['hijri']['month']['ar']} {date['hijri']['year']}",
        method=meta.get("method", {}).get("id", method) if isinstance(meta.get("method"), dict) else method,
    )


@api_router.get("/prayer-times/by-city", response_model=PrayerTimesResponse)
async def get_prayer_times_by_city(
    city: str = Query(..., description="City name"),
    country: str = Query(..., description="Country name"),
    method: int = Query(4, description="Calculation method"),
):
    """Proxy to Aladhan API for prayer times based on city name."""
    url = "https://api.aladhan.com/v1/timingsByCity"
    params = {"city": city, "country": country, "method": method}
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as http:
            r = await http.get(url, params=params)
            r.raise_for_status()
            data = r.json()["data"]
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Aladhan API error: {e}")

    timings = data["timings"]
    date = data["date"]

    return PrayerTimesResponse(
        fajr=timings["Fajr"],
        sunrise=timings["Sunrise"],
        dhuhr=timings["Dhuhr"],
        asr=timings["Asr"],
        maghrib=timings["Maghrib"],
        isha=timings["Isha"],
        date_gregorian=date["gregorian"]["date"],
        date_hijri=f"{date['hijri']['day']} {date['hijri']['month']['ar']} {date['hijri']['year']}",
        city=city,
        country=country,
        method=method,
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
