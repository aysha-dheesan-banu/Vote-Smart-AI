import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

SECTION_MAP = {
    "results":              "results.json",
    "budget":               "budget.json",
    "rights":               "rights.json",
    "howto":                "howto.json",
    "manifesto-priorities": "manifesto_priorities.json",
    "registration":         "registration.json",
    "candidates":           "candidates.json",
    "timeline":             "timeline.json",
    "constituencies":       "constituencies.json",
    "values-questions":     "values_questions.json",
}


def load(filename: str) -> dict:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"Data file {filename} not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/data/{section}")
async def get_section(section: str):
    if section not in SECTION_MAP:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown section '{section}'. Available: {list(SECTION_MAP.keys())}"
        )
    return load(SECTION_MAP[section])


@router.get("/data")
async def list_sections():
    return {"sections": list(SECTION_MAP.keys())}
