import os
import jwt
import httpx
from functools import lru_cache
from fastapi import Header, HTTPException, Depends
from typing import Optional

# Configuration
ISSUER = os.getenv("SSO_ISSUER", "http://localhost:8000")
AUDIENCE = os.getenv("SSO_CLIENT_ID", "client_5XUv807ZGIcV5LG0R-CE6w")

@lru_cache
def get_jwks():
    try:
        resp = httpx.get(f"{ISSUER}/.well-known/jwks.json")
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return None

def verify_access_token(token: str) -> dict:
    try:
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Missing kid in token header")
        
        jwks = get_jwks()
        if not jwks:
            raise HTTPException(status_code=500, detail="Could not fetch JWKS")
            
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if not key:
            # Clear cache and retry once
            get_jwks.cache_clear()
            jwks = get_jwks()
            key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
            if not key:
                raise HTTPException(status_code=401, detail="Invalid token key ID")
        
        from jwt.algorithms import RSAAlgorithm
        public_key = RSAAlgorithm.from_jwk(key)
        
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=ISSUER,
            options={"verify_aud": False}, # access_token usually doesn't have aud
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        return verify_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
