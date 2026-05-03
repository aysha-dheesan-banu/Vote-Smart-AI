import json
import os
from fastapi import APIRouter

router = APIRouter()

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "timeline.json")


@router.get("/timeline")
async def get_timeline():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
