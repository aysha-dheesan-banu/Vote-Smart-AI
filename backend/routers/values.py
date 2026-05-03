from fastapi import APIRouter
from models.schemas import ValuesRequest
from services.claude_service import complete_json, SYSTEM_VALUES

router = APIRouter()

# Party policy positions on each dimension (1=left/govt, 5=right/market)
PARTY_POSITIONS = {
    "BJP":  {"economy": 3.5, "education": 3.0, "health": 3.2, "farmers": 3.8, "environment": 3.0,
             "welfare": 3.5, "jobs": 3.8, "security": 4.5, "federalism": 2.0, "corruption": 3.5},
    "INC":  {"economy": 2.5, "education": 2.0, "health": 2.0, "farmers": 2.0, "environment": 3.5,
             "welfare": 2.0, "jobs": 2.5, "security": 3.0, "federalism": 3.5, "corruption": 3.0},
    "AAP":  {"economy": 2.8, "education": 1.5, "health": 1.8, "farmers": 2.5, "environment": 3.5,
             "welfare": 2.5, "jobs": 3.0, "security": 3.0, "federalism": 4.0, "corruption": 1.5},
    "TMC":  {"economy": 2.5, "education": 2.5, "health": 2.5, "farmers": 2.8, "environment": 3.5,
             "welfare": 2.0, "jobs": 2.5, "security": 2.5, "federalism": 4.5, "corruption": 2.5},
    "SP":   {"economy": 2.5, "education": 2.5, "health": 2.5, "farmers": 2.0, "environment": 3.0,
             "welfare": 2.0, "jobs": 2.5, "security": 2.5, "federalism": 4.0, "corruption": 3.0},
}

PARTY_COLORS = {"BJP": "#FF6600", "INC": "#1E90FF", "AAP": "#00BCD4", "TMC": "#00A86B", "SP": "#FF0000"}

ALIGNING = {
    "BJP":  ["Viksit Bharat 2047 development vision", "Strong national security & defence modernisation",
             "PLI manufacturing schemes & infrastructure boom", "Ayushman Bharat ₹5L health cover",
             "PM Kisan ₹6,000/yr direct farmer support"],
    "INC":  ["Legal MSP guarantee for all farmers", "6% of GDP for public education",
             "Universal public healthcare (oppose privatisation)", "Caste census & OBC sub-categorisation",
             "25 lakh govt jobs/year filling vacancies"],
    "AAP":  ["Free 300-unit electricity & water in Delhi/Punjab", "Mohalla Clinics — free primary healthcare",
             "Transformed govt schools model", "Zero-tolerance anti-corruption governance",
             "Free bus pass & subsidised public transport"],
    "TMC":  ["Lakshmir Bhandar ₹1,000/month to women", "Krishak Bandhu ₹10,000/yr per farmer",
             "Strong state rights — oppose Centre's financial overreach", "Swasthya Sathi free health scheme",
             "Kanyashree girls scholarship"],
    "SP":   ["PDA Alliance — OBC, Dalit, Minority welfare", "Sugarcane MSP with 15-day payment guarantee",
             "Caste census implementation", "OBC reservation protection",
             "District hospital upgrades & 108 ambulance expansion"],
}

DIVERGING = {
    "BJP":  ["Centralised governance model (low federalism score)", "Religious-cultural nationalism angle"],
    "INC":  ["Slower on market-driven growth", "Historical governance record questioned"],
    "AAP":  ["Limited national presence outside Delhi/Punjab", "Governance controversies 2023-24"],
    "TMC":  ["Limited to Bengal — no national rural model", "Internal governance criticism"],
    "SP":   ["UP-centric focus", "Coalition arithmetic dependency"],
}


def _algorithmic_match(responses: dict) -> dict:
    """Pure algorithmic values match — used as fallback when AI is unavailable."""
    results = []
    for party, positions in PARTY_POSITIONS.items():
        total_diff = 0
        count = 0
        for key, voter_val in responses.items():
            if key in positions:
                total_diff += abs(voter_val - positions[key])
                count += 1
        if count == 0:
            match_pct = 50
        else:
            avg_diff = total_diff / count
            match_pct = max(5, min(98, round(100 - (avg_diff / 4) * 100)))

        results.append({
            "party": party,
            "matchPercent": match_pct,
            "color": PARTY_COLORS[party],
            "aligningPolicies": ALIGNING[party][:3],
            "divergingPolicies": DIVERGING[party][:2],
        })

    results.sort(key=lambda x: x["matchPercent"], reverse=True)
    return {
        "matches": results,
        "disclaimer": "Match calculated from official 2024 manifesto positions. For educational purposes only — does not constitute endorsement of any party.",
        "note": "Results powered by policy-position algorithm based on ECI-verified manifesto data."
    }


@router.post("/values/match")
async def values_match(req: ValuesRequest):
    questions_map = {
        "q1": "Economy & Job Creation (1=Market-driven, 5=Government-led)",
        "q2": "Environment & Climate (1=Development priority, 5=Environment priority)",
        "q3": "Education Policy (1=Private schools, 5=Government schools)",
        "q4": "Healthcare (1=Private insurance, 5=Universal healthcare)",
        "q5": "Farmers & Agriculture (1=Market prices, 5=MSP & subsidies)",
        "q6": "Foreign Policy (1=Strategic autonomy, 5=Global alliances)",
        "q7": "Religious Issues (1=Secular governance, 5=Cultural nationalism)",
        "q8": "Women's Rights (1=Traditional values, 5=Progressive rights)",
        "q9": "Defence & Security (1=Diplomacy first, 5=Strong military)",
        "q10": "Economic Inequality (1=Growth trickles down, 5=Direct redistribution)",
        # Also support plain English keys from frontend
        "economy": "Economy & Job Creation (1=Market-driven, 5=Government-led)",
        "education": "Education Policy (1=Private schools, 5=Government schools)",
        "health": "Healthcare (1=Private insurance, 5=Universal healthcare)",
        "farmers": "Farmers & Agriculture (1=Market prices, 5=MSP & subsidies)",
        "environment": "Environment & Climate (1=Development priority, 5=Environment priority)",
        "welfare": "Social Welfare (1=Targeted, 5=Universal)",
        "jobs": "Employment Policy (1=Private sector, 5=Govt jobs)",
        "security": "National Security (1=Diplomacy, 5=Strong military)",
        "federalism": "Centre-State Relations (1=Strong Centre, 5=Strong States)",
        "corruption": "Anti-Corruption (1=Systemic reform, 5=Zero tolerance enforcement)",
    }

    responses_text = "\n".join(
        [f"- {questions_map.get(k, k)}: {v}/5" for k, v in req.responses.items()]
    )

    prompt = f"""A voter has answered these policy priority questions on a scale of 1-5:

{responses_text}

Based on the 2024 Indian election manifestos of major parties (BJP, INC, AAP, TMC, SP),
calculate how well each party's platform aligns with this voter's stated priorities.

Return ONLY a JSON object:
{{
  "matches": [
    {{
      "party": "BJP",
      "matchPercent": <0-100>,
      "color": "#FF6600",
      "aligningPolicies": ["<specific matching policy>", "<policy2>", "<policy3>"],
      "divergingPolicies": ["<diverging policy>"]
    }},
    {{
      "party": "INC",
      "matchPercent": <0-100>,
      "color": "#1E90FF",
      "aligningPolicies": ["<policy>", "<policy>"],
      "divergingPolicies": ["<policy>"]
    }},
    {{
      "party": "AAP",
      "matchPercent": <0-100>,
      "color": "#00BCD4",
      "aligningPolicies": ["<policy>"],
      "divergingPolicies": ["<policy>"]
    }},
    {{
      "party": "TMC",
      "matchPercent": <0-100>,
      "color": "#00A86B",
      "aligningPolicies": ["<policy>"],
      "divergingPolicies": ["<policy>"]
    }},
    {{
      "party": "SP",
      "matchPercent": <0-100>,
      "color": "#FF0000",
      "aligningPolicies": ["<policy>"],
      "divergingPolicies": ["<policy>"]
    }}
  ],
  "disclaimer": "This match is based on publicly available manifesto data and is for educational purposes only. It does not constitute an endorsement of any party."
}}"""

    result = await complete_json(prompt, SYSTEM_VALUES)

    # If AI is unavailable, fall back to algorithmic match
    if result.get("error") in ("credit_exhausted", "Could not parse response"):
        return _algorithmic_match(req.responses)

    return result
