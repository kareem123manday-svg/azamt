"""Backend API tests for عَزَمْتَ (Islamic Daily Planner)"""
import os
from typing import List

import pytest
import requests

BASE_URL: str = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://salah-first-daily.preview.emergentagent.com",
).rstrip("/")


@pytest.fixture
def api_client() -> requests.Session:
    s: requests.Session = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Root endpoint ---
def test_root_welcome(api_client: requests.Session) -> None:
    r: requests.Response = api_client.get(f"{BASE_URL}/api/", timeout=20)
    assert r.status_code == 200
    data: dict = r.json()
    assert "message" in data
    assert isinstance(data["message"], str) and len(data["message"]) > 0


# --- Prayer times by coordinates ---
def test_prayer_times_by_coords(api_client: requests.Session) -> None:
    r: requests.Response = api_client.get(
        f"{BASE_URL}/api/prayer-times",
        params={"latitude": 21.4225, "longitude": 39.8262, "method": 4},
        timeout=30,
    )
    assert r.status_code == 200
    d: dict = r.json()
    required_fields: List[str] = [
        "fajr",
        "sunrise",
        "dhuhr",
        "asr",
        "maghrib",
        "isha",
        "date_gregorian",
        "date_hijri",
    ]
    for k in required_fields:
        assert k in d and d[k], f"Missing/empty field {k}"
    assert d["method"] == 4


def test_prayer_times_missing_params(api_client: requests.Session) -> None:
    r: requests.Response = api_client.get(f"{BASE_URL}/api/prayer-times", timeout=15)
    assert r.status_code == 422  # FastAPI validation


# --- Prayer times by city ---
def test_prayer_times_by_city(api_client: requests.Session) -> None:
    r: requests.Response = api_client.get(
        f"{BASE_URL}/api/prayer-times/by-city",
        params={"city": "Makkah", "country": "Saudi Arabia", "method": 4},
        timeout=30,
    )
    assert r.status_code == 200
    d: dict = r.json()
    required_fields: List[str] = [
        "fajr",
        "sunrise",
        "dhuhr",
        "asr",
        "maghrib",
        "isha",
        "date_gregorian",
        "date_hijri",
    ]
    for k in required_fields:
        assert k in d and d[k]
    assert d["city"] == "Makkah"
    assert d["country"] == "Saudi Arabia"


def test_prayer_times_by_invalid_city(api_client: requests.Session) -> None:
    r: requests.Response = api_client.get(
        f"{BASE_URL}/api/prayer-times/by-city",
        params={"city": "ZzzNotARealCity123", "country": "Nowhere", "method": 4},
        timeout=30,
    )
    # Should NOT be 200 - should fail gracefully with an error status
    assert r.status_code >= 400, f"Expected error status for invalid city, got {r.status_code}"
