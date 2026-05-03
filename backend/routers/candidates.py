import json
import os
from fastapi import APIRouter
from models.schemas import DebateRequest
from services.claude_service import complete, SYSTEM_DEBATE

router = APIRouter()

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "candidates.json")


def load_candidates():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/candidates")
async def get_candidates():
    return load_candidates()


@router.post("/candidates/debate")
async def debate(req: DebateRequest):
    all_candidates = load_candidates()
    selected = [c for c in all_candidates if c["name"] in req.candidates]

    if not selected:
        selected = all_candidates[:2]

    responses = []
    for candidate in selected:
        prompt = f"""Simulate how {candidate["name"]} ({candidate["party"]}) would respond to this policy question,
based on their publicly stated positions and party manifesto:

Question: "{req.question}"

Background on {candidate["name"]}:
- Party: {candidate["party"]}
- Key Promises: {", ".join(candidate["keyPromises"])}
- Stances: {json.dumps(candidate["stances"])}

Write a 3-4 sentence response in the candidate's likely voice based on their known positions.
Start with their name. Make it realistic but clearly based on public manifesto statements.
Add at the end: "[AI-simulated based on public manifesto statements]" """

        try:
            text = await complete(prompt, SYSTEM_DEBATE)
        except ValueError as e:
            if "CREDIT_EXHAUSTED" in str(e):
                # Build a factual fallback from manifesto data
                stances = candidate.get("stances", {})
                promises = candidate.get("keyPromises", [])
                text = (
                    f"{candidate['name']} ({candidate['party']}) has publicly committed to: "
                    f"{promises[0] if promises else 'see party manifesto'}. "
                    f"On key policy areas: economy — {stances.get('economy', 'N/A')}; "
                    f"health — {stances.get('health', 'N/A')}. "
                    f"[Based on official {candidate['party']} 2024 manifesto — AI simulation unavailable]"
                )
            else:
                raise

        responses.append({
            "candidate": candidate["name"],
            "party": candidate["party"],
            "partyColor": candidate["partyColor"],
            "response": text
        })

    return {"question": req.question, "responses": responses}
