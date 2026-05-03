from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest
from services.claude_service import chat_stream, complete, SYSTEM_REGISTRATION

router = APIRouter()

REGISTRATION_FALLBACK = """To register as a voter in India, follow these steps:

1. **Check Eligibility**: You must be 18+ years old on January 1 of the current year and an Indian citizen.

2. **Apply Online**: Visit voters.eci.gov.in or the Voter Helpline App.
   - Fill Form 6 (new registration) or Form 8 (correction/update).

3. **Documents Needed**: Age proof (birth certificate/10th marksheet), address proof (Aadhaar/utility bill), passport-size photo.

4. **Submit**: Upload documents online at voters.eci.gov.in or visit your local BLO (Booth Level Officer).

5. **Track Application**: Use your reference number at voters.eci.gov.in/track-application.

6. **Get EPIC/e-EPIC**: Your Electors Photo Identity Card (Voter ID) will be issued within 30–45 days.

📞 **Voter Helpline**: 1950 | 🌐 **Website**: voters.eci.gov.in

*For the most accurate and up-to-date information, always refer to the official ECI website.*"""


@router.post("/chat")
async def chat(req: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    async def generator():
        async for chunk in chat_stream(messages, req.language):
            yield chunk

    return StreamingResponse(generator(), media_type="text/plain")


@router.post("/registration/check")
async def registration_check(req: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    prompt = messages[-1]["content"] if messages else "How do I register to vote in India?"

    try:
        result = await complete(prompt, SYSTEM_REGISTRATION)
        return {"response": result}
    except ValueError as e:
        if "CREDIT_EXHAUSTED" in str(e):
            return {"response": REGISTRATION_FALLBACK, "ai_unavailable": True}
        raise


@router.get("/quiz/questions")
async def get_quiz_questions():
    questions = [
        {
            "id": 1,
            "question": "At what age can an Indian citizen vote?",
            "options": ["16", "18", "21", "25"],
            "answer": 1,
            "explanation": "Indian citizens who are 18 years or older on the qualifying date are eligible to vote.",
            "category": "Rights"
        },
        {
            "id": 2,
            "question": "Which document is used to apply for voter registration?",
            "options": ["Form 6", "Form 7", "Form 8A", "Form 16"],
            "answer": 0,
            "explanation": "Form 6 is used by new voters to enroll in the electoral rolls.",
            "category": "Process"
        },
        {
            "id": 3,
            "question": "What is the Voter Helpline number in India?",
            "options": ["100", "1950", "1800", "108"],
            "answer": 1,
            "explanation": "1950 is the national voter helpline number operated by the Election Commission of India.",
            "category": "Rights"
        },
        {
            "id": 4,
            "question": "What is EPIC?",
            "options": [
                "Election Process Identification Card",
                "Electors Photo Identity Card",
                "Electronic Poll Identity Certificate",
                "Election Participation Identity Code"
            ],
            "answer": 1,
            "explanation": "EPIC stands for Electors Photo Identity Card, commonly known as the Voter ID card.",
            "category": "Process"
        },
        {
            "id": 5,
            "question": "How many phases were there in the 2024 Indian General Election?",
            "options": ["5", "6", "7", "8"],
            "answer": 2,
            "explanation": "The 2024 Indian General Election was held in 7 phases from April 19 to June 1, 2024.",
            "category": "History"
        },
        {
            "id": 6,
            "question": "Which body conducts elections in India?",
            "options": [
                "Ministry of Home Affairs",
                "Election Commission of India",
                "Supreme Court of India",
                "Parliament of India"
            ],
            "answer": 1,
            "explanation": "The Election Commission of India (ECI) is the constitutional body responsible for administering elections.",
            "category": "Constitution"
        },
        {
            "id": 7,
            "question": "What is the Model Code of Conduct?",
            "options": [
                "A law passed by Parliament",
                "Guidelines for voters on election day",
                "Guidelines for political parties during elections",
                "Rules for EVM usage"
            ],
            "answer": 2,
            "explanation": "The Model Code of Conduct is a set of guidelines issued by the ECI for political parties and candidates during elections.",
            "category": "Process"
        },
        {
            "id": 8,
            "question": "What is EVM?",
            "options": [
                "Electronic Voter Management",
                "Electronic Voting Machine",
                "Election Verification Method",
                "Electoral Vote Monitor"
            ],
            "answer": 1,
            "explanation": "EVM stands for Electronic Voting Machine, used in Indian elections since 1999 nationwide.",
            "category": "Process"
        },
        {
            "id": 9,
            "question": "Can a person vote if they have shifted to a new constituency?",
            "options": [
                "No, they must vote in the old constituency",
                "Yes, they can vote anywhere",
                "Yes, after updating via Form 8A or Form 6",
                "No, they lose voting rights"
            ],
            "answer": 2,
            "explanation": "A voter who has moved must update their address using Form 8A (address change) or Form 6 (new registration) in the new constituency.",
            "category": "Process"
        },
        {
            "id": 10,
            "question": "What is VVPAT?",
            "options": [
                "Voter Verified Paper Audit Trail",
                "Verified Voter Poll Authentication Terminal",
                "Virtual Voting Paper Audit Track",
                "Voter Validation and Protection Act Trail"
            ],
            "answer": 0,
            "explanation": "VVPAT (Voter Verified Paper Audit Trail) provides a paper slip confirmation of the vote cast on EVM.",
            "category": "Process"
        }
    ]
    return {"questions": questions, "total": len(questions)}


@router.post("/quiz/certificate")
async def generate_certificate(name: str, score: int, total: int):
    percentage = (score / total) * 100
    grade = "Excellent" if percentage >= 80 else "Good" if percentage >= 60 else "Participant"
    return {
        "name": name,
        "score": score,
        "total": total,
        "percentage": round(percentage, 1),
        "grade": grade,
        "issued_by": "VoteSmart AI",
        "date": "2026",
        "message": f"Congratulations {name}! You scored {score}/{total} on the Election Knowledge Quiz."
    }
