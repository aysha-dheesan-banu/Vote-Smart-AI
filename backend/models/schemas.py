from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    language: str = "en"


class FactCheckRequest(BaseModel):
    claim: str


class ConstituencyRequest(BaseModel):
    query: str


class DebateRequest(BaseModel):
    question: str
    candidates: List[str]


class ValuesRequest(BaseModel):
    responses: Dict[str, int]


class RegistrationRequest(BaseModel):
    query: str
    step: Optional[int] = None


class QuizCertificateRequest(BaseModel):
    name: str
    score: int
    total: int


class FactCheckResponse(BaseModel):
    verdict: str
    confidence: int
    explanation: str
    red_flags: List[str]
    what_is_true: str
    sources: List[str]


class CandidateStance(BaseModel):
    economy: str
    education: str
    health: str
    farmers: str
    environment: str


class Candidate(BaseModel):
    id: str
    name: str
    party: str
    partyColor: str
    partySymbol: str
    constituency: str
    state: str
    image: Optional[str]
    keyPromises: List[str]
    stances: CandidateStance
    background: str
