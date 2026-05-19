import os
import hmac
import hashlib
import json
import datetime
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional

router = APIRouter()

WEBHOOK_SECRET = os.getenv("WYTSAAS_WEBHOOK_SECRET", "")
APP_ID         = os.getenv("WYTSAAS_APP_ID", "")

# In-memory store of marketplace installs (replace with DB in production)
marketplace_users: dict = {}


def verify_signature(payload: bytes, signature: str) -> bool:
    """Verify HMAC-SHA256 signature from WytSaaS."""
    if not WEBHOOK_SECRET:
        return True  # Skip verification if secret not configured (dev mode)
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature.removeprefix("sha256="))


@router.post("/webhooks/wytsaas")
async def wytsaas_webhook(
    request: Request,
    x_wytsaas_signature: Optional[str] = Header(None),
    x_wytsaas_event: Optional[str] = Header(None),
):
    """
    WytSaaS Marketplace Webhook Endpoint.
    Receives events when marketplace users install / uninstall VoteSmart AI.
    """
    payload = await request.body()

    # Verify signature
    if x_wytsaas_signature and not verify_signature(payload, x_wytsaas_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        data = json.loads(payload)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = x_wytsaas_event or data.get("event", "unknown")
    user_id    = data.get("user_id") or data.get("wytpass_id")
    user_email = data.get("email", "")
    timestamp  = datetime.datetime.utcnow().isoformat()

    print(f"\n{'='*60}")
    print(f"📦 WytSaaS Event: {event_type}")
    print(f"   App ID    : {APP_ID}")
    print(f"   User ID   : {user_id}")
    print(f"   Email     : {user_email}")
    print(f"   Received  : {timestamp}")
    print(f"{'='*60}\n")

    if event_type in ("user.subscribed", "subscription.created", "install"):
        # Grant marketplace access
        marketplace_users[user_id] = {
            "email": user_email,
            "subscribed_at": timestamp,
            "active": True
        }
        print(f"✅ Granted marketplace access to {user_email}")

    elif event_type in ("user.cancelled", "subscription.cancelled", "uninstall"):
        # Revoke marketplace access
        if user_id in marketplace_users:
            marketplace_users[user_id]["active"] = False
        print(f"❌ Revoked marketplace access for {user_email}")

    return {"status": "received", "event": event_type, "app_id": APP_ID}


@router.get("/api/wytsaas/status")
async def wytsaas_status():
    """Health check endpoint for WytSaaS integration verification."""
    return {
        "status": "active",
        "app_id": APP_ID,
        "marketplace_users": len([u for u in marketplace_users.values() if u.get("active")]),
        "webhook_endpoint": "/webhooks/wytsaas",
        "integration": "WytSaaS Marketplace"
    }
