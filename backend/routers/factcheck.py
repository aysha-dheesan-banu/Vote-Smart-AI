from fastapi import APIRouter, HTTPException
from models.schemas import FactCheckRequest
from services.claude_service import complete_json, SYSTEM_FACTCHECK

router = APIRouter()


@router.post("/factcheck")
async def fact_check(req: FactCheckRequest):
    if not req.claim.strip():
        raise HTTPException(status_code=400, detail="Claim cannot be empty")

    prompt = f"""Fact-check this claim about Indian politics/elections:

"{req.claim}"

Return ONLY a JSON object with this exact structure:
{{
  "verdict": "TRUE" | "MISLEADING" | "FALSE" | "UNVERIFIABLE",
  "confidence": <integer 0-100>,
  "explanation": "<2-3 sentences explaining your verdict>",
  "red_flags": ["<specific misleading element>", ...],
  "what_is_true": "<what parts are accurate, or empty string>",
  "sources": ["Election Commission of India", "<other source>", ...]
}}"""

    result = await complete_json(prompt, SYSTEM_FACTCHECK)

    if result.get("error") == "credit_exhausted":
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0,
            "explanation": "AI fact-checking is temporarily unavailable (API credits depleted). Please verify this claim directly on eci.gov.in or pib.gov.in.",
            "red_flags": [],
            "what_is_true": "Unable to assess at this time.",
            "sources": ["eci.gov.in", "pib.gov.in"],
            "ai_unavailable": True
        }

    return result
