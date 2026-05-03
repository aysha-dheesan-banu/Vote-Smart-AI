import os
import json
import asyncio
from typing import AsyncGenerator
import google.genai as genai
from google.genai import types

SYSTEM_NONPARTISAN = """You are VoteSmart AI, a nonpartisan Indian election information assistant.
You provide accurate, balanced, and factual information about Indian elections, voting processes,
candidates, and civic education. You do not favor any political party or candidate.
Always recommend visiting official ECI sources (eci.gov.in) for authoritative information.
You can respond in Hindi or English based on the user's language preference."""

SYSTEM_FACTCHECK = """You are an expert nonpartisan fact-checker specializing in Indian political claims.
Analyze claims objectively using publicly available information.
Always return a JSON object with this exact structure:
{
  "verdict": "TRUE" | "MISLEADING" | "FALSE" | "UNVERIFIABLE",
  "confidence": <number 0-100>,
  "explanation": "<detailed explanation>",
  "red_flags": ["<flag1>", "<flag2>"],
  "what_is_true": "<what parts if any are accurate>",
  "sources": ["<source1>", "<source2>"]
}"""

SYSTEM_CONSTITUENCY = """You are an expert on Indian parliamentary and assembly constituencies.
Provide detailed, accurate information about constituencies including historical election data,
current representatives, local issues, and development status.
Always return structured JSON data."""

SYSTEM_DEBATE = """You are a debate moderator simulating how Indian political candidates might respond
to policy questions based on their publicly stated positions and party manifestos.
Responses must be clearly labeled as AI-simulated and based on public manifesto statements.
Be balanced and fair to all candidates. Never make up facts."""

SYSTEM_VALUES = """You are a nonpartisan political analyst helping Indian voters understand which
parties align with their stated priorities. Analyze the voter's responses and match them to
party policy positions based on official manifestos and public statements.
Always include prominent disclaimers that this is for educational purposes only."""

SYSTEM_REGISTRATION = """You are a helpful assistant guiding Indian citizens through the voter
registration process using official ECI guidelines. Provide step-by-step, accurate information
about Form 6, Form 8, required documents, and the NVSP/Voter Helpline Portal."""

MODEL = "gemini-2.5-flash-lite"

_client = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    return _client


async def chat_stream(messages: list, language: str = "en") -> AsyncGenerator[str, None]:
    system = SYSTEM_NONPARTISAN
    if language == "hi":
        system += "\nThe user prefers Hindi. Respond in Hindi (Devanagari script)."

    # Build conversation history for Gemini
    gemini_contents = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        gemini_contents.append(types.Content(role=role, parts=[types.Part(text=m["content"])]))

    try:
        loop = asyncio.get_event_loop()

        def _stream_sync():
            chunks = []
            for chunk in get_client().models.generate_content_stream(
                model=MODEL,
                contents=gemini_contents,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    max_output_tokens=1024,
                ),
            ):
                if chunk.text:
                    chunks.append(chunk.text)
            return chunks

        chunks = await loop.run_in_executor(None, _stream_sync)
        for chunk in chunks:
            yield chunk

    except Exception as e:
        err = str(e)
        if "quota" in err.lower() or "billing" in err.lower() or "429" in err:
            yield "\n\n⚠️ **AI quota exceeded** — please check your Google AI Studio billing."
        else:
            yield f"\n[Error: {err}]"


async def complete(prompt: str, system_prompt: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            loop = asyncio.get_event_loop()

            def _call():
                response = get_client().models.generate_content(
                    model=MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        max_output_tokens=2048,
                    ),
                )
                return response.text

            return await loop.run_in_executor(None, _call)

        except Exception as e:
            err = str(e)
            if "quota" in err.lower() or "billing" in err.lower() or "429" in err:
                raise ValueError("CREDIT_EXHAUSTED")
            if attempt == retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)
    return ""


async def complete_json(prompt: str, system_prompt: str, retries: int = 3) -> dict:
    try:
        text = await complete(prompt, system_prompt, retries)
    except ValueError as e:
        if str(e) == "CREDIT_EXHAUSTED":
            return {"error": "credit_exhausted", "message": "AI quota exceeded"}
        raise

    # Extract JSON from markdown code blocks if present
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end])
            except json.JSONDecodeError:
                pass
        return {"error": "Could not parse response", "raw": text}
