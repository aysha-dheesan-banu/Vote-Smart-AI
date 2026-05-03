from dotenv import load_dotenv
load_dotenv()  # must run before any router imports so ANTHROPIC_API_KEY is set

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, factcheck, constituency, candidates, timeline, values, data

app = FastAPI(title="VoteSmart AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",
                   "http://localhost:5174", "http://127.0.0.1:5174",
                   "http://localhost:5175", "http://127.0.0.1:5175",
                   "http://localhost:5176", "http://127.0.0.1:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(factcheck.router, prefix="/api")
app.include_router(constituency.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(values.router, prefix="/api")
app.include_router(data.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "VoteSmart AI"}
