import json
import os
from fastapi import APIRouter
from models.schemas import ConstituencyRequest
from services.claude_service import complete_json, SYSTEM_CONSTITUENCY

router = APIRouter()

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "constituencies.json")


def load_constituencies():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/constituency")
async def get_constituency(req: ConstituencyRequest):
    constituencies = load_constituencies()

    # Try local data first
    query_lower = req.query.lower()
    for c in constituencies:
        if query_lower in c["name"].lower() or query_lower in c["state"].lower():
            return c

    # Fall back to Claude for unknown constituencies
    prompt = f"""Provide detailed information about the Indian parliamentary/assembly constituency: "{req.query}"

Return a JSON object with this structure:
{{
  "name": "<constituency name>",
  "state": "<state name>",
  "type": "Lok Sabha" | "Vidhan Sabha",
  "currentRep": "<current MP/MLA name>",
  "party": "<party name>",
  "results": [
    {{"year": 2024, "winner": "<name>", "party": "<party>", "votes": <number>, "margin": <number>, "turnout": <percentage>}},
    {{"year": 2019, "winner": "<name>", "party": "<party>", "votes": <number>, "margin": <number>, "turnout": <percentage>}},
    {{"year": 2014, "winner": "<name>", "party": "<party>", "votes": <number>, "margin": <number>, "turnout": <percentage>}}
  ],
  "issues": ["<local issue 1>", "<local issue 2>", "<local issue 3>"],
  "coordinates": {{"lat": <latitude>, "lng": <longitude>}},
  "description": "<brief description of the constituency>"
}}"""

    result = await complete_json(prompt, SYSTEM_CONSTITUENCY)
    if result.get("error") == "credit_exhausted":
        return {
            "name": req.query,
            "state": "India",
            "type": "Lok Sabha",
            "currentRep": "Please check eci.gov.in for current representative",
            "party": "—",
            "results": [],
            "issues": ["Visit eci.gov.in for constituency-specific data"],
            "coordinates": {"lat": 20.5937, "lng": 78.9629},
            "description": f"AI lookup unavailable. For official data on {req.query}, visit eci.gov.in or the respective state election commission website.",
            "ai_unavailable": True
        }
    return result
