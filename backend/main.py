from dotenv import load_dotenv
load_dotenv()  # must run before any router imports so env vars are set

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, factcheck, constituency, candidates, timeline, values, data, wytsaas

app = FastAPI(title="VoteSmart AI API", version="1.0.0")

# In production (Cloud Run), allow all origins since frontend URL is dynamic
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://project.dhilip.in")
origins = [
    FRONTEND_URL,
    FRONTEND_URL.rstrip('/'),
    "https://project.dhilip.in",
    "http://localhost:5173", "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

app.include_router(chat.router, prefix="/api")
app.include_router(factcheck.router, prefix="/api")
app.include_router(constituency.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(values.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(wytsaas.router)  # WytSaaS marketplace integration

from fastapi.responses import FileResponse

# Serve frontend files from /static directory
if os.path.exists("static"):
    # 1. Mount static directory for existing files (css, js, etc.)
    app.mount("/static", StaticFiles(directory="static"), name="static_assets")
    
    # 2. Fallback for SPA routing (all non-api routes return index.html)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If it starts with api/, health, or is an existing file, let it through
        if full_path.startswith("api/") or full_path == "health":
            raise HTTPException(status_code=404)
        
        file_path = os.path.join("static", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse("static/index.html")

from services.auth import get_current_user
from fastapi import Depends

@app.get("/api/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@app.get("/health")
async def health():
    return {"status": "ok", "service": "VoteSmart AI"}
