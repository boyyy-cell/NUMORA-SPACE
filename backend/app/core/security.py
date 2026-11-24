import hmac
import hashlib
import base64
import json
import math
import re
import time
import secrets
from typing import Dict, Any, Optional
from datetime import timedelta
from backend.app.core.config import settings


class SecurityError(Exception):
    """Base exception for cryptographic security errors."""
    pass


class TokenExpiredError(SecurityError):
    """Raised when an access token has expired."""
    pass


class InvalidTokenError(SecurityError):
    """Raised when an access token has an invalid signature or structure."""
    pass


def _b64url_encode(data: bytes) -> str:
    """Encodes bytes to standard URL-safe Base64 without padding."""
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def _b64url_decode(data: str) -> bytes:
    """Decode a URL-safe Base64 segment without accepting invalid characters or padding."""
    if not isinstance(data, str) or not data:
        raise InvalidTokenError("Invalid token encoding.")
    if not re.fullmatch(r"[A-Za-z0-9_-]+={0,2}", data):
        raise InvalidTokenError("Invalid token encoding.")
    clean_data = data.rstrip('=')
    rem = len(clean_data) % 4
    if rem == 1:
        raise InvalidTokenError("Invalid token encoding.")
    if rem > 0:
        clean_data += '=' * (4 - rem)
    try:
        return base64.b64decode(clean_data.encode("ascii"), altchars=b"-_", validate=True)
    except (ValueError, UnicodeEncodeError):
        raise InvalidTokenError("Invalid token encoding.")


def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a cryptographically secure random salt.
    Format: pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>
    """
    if not isinstance(password, str) or len(password) < 6:
        raise ValueError("Kata sandi harus berupa string minimal 6 karakter.")
    if len(password) > 128:
        raise ValueError("Kata sandi melebihi batas maksimum 128 karakter.")
    salt = secrets.token_bytes(16)
    iterations = 600_000
    derived = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${derived.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a stored PBKDF2-HMAC-SHA256 hash
    using constant-time comparison to prevent timing attacks.
    """
    if not isinstance(plain_password, str) or len(plain_password) > 128:
        return False
    if not isinstance(hashed_password, str) or not hashed_password:
        return False
    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False
        iterations = int(parts[1])
        if not (50_000 <= iterations <= 1_000_000):
            return False
        salt = bytes.fromhex(parts[2])
        if len(salt) != 16:
            return False
        expected_hash = bytes.fromhex(parts[3])
        if len(expected_hash) != hashlib.sha256().digest_size:
            return False
        actual_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
        return hmac.compare_digest(actual_hash, expected_hash)
    except (ValueError, TypeError, OverflowError):
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates an RFC 7519 compliant JSON Web Token (JWT) signed with HMAC-SHA256 (HS256).
    Payload includes:
      - sub: user identifier (email)
      - role: authorization role ('student' | 'researcher')
      - iat: issued at timestamp
      - exp: expiration timestamp
      - jti: unique token ID for revocation tracking
    """
    now = int(time.time())
    if expires_delta:
        expire = now + int(expires_delta.total_seconds())
    else:
        expire = now + (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["iat"] = now
    payload["exp"] = expire
    if "jti" not in payload or not payload["jti"]:
        payload["jti"] = secrets.token_hex(16)

    # Validasi bahwa claim wajib ada dan benar
    if not isinstance(payload.get("sub"), str) or not payload["sub"].strip():
        raise ValueError("JWT data wajib memuat claim 'sub' berupa string.")
    if "role" not in payload or payload["role"] not in ("student", "researcher"):
        raise ValueError("JWT data wajib memuat claim 'role' bernilai 'student' atau 'researcher'.")
    if not isinstance(payload["jti"], str) or len(payload["jti"]) < 16:
        raise ValueError("JWT data memuat claim 'jti' yang tidak valid.")

    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_json = json.dumps(payload, separators=(',', ':')).encode('utf-8')

    header_b64 = _b64url_encode(header_json)
    payload_b64 = _b64url_encode(payload_json)

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    secret = settings.jwt_signing_secret.encode('utf-8')

    signature = hmac.new(secret, signing_input, hashlib.sha256).digest()
    signature_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates an RFC 7519 HMAC-SHA256 signed access token.
    Validates:
      1. Structural integrity (3 segments).
      2. Cryptographic signature with constant-time comparison.
      3. Algorithm: explicitly HS256, rejects 'none' and other algorithms.
      4. Required claims presence and types: sub (str), role (student|researcher), iat (int/float), exp (int/float), jti (str).
      5. Expiration time (exp claim).
    Returns the decoded payload dict.
    Raises TokenExpiredError or InvalidTokenError on failure.
    """
    if not token or not isinstance(token, str) or len(token) > 8192 or token.strip() != token:
        raise InvalidTokenError("Invalid token.")
    parts = token.split('.')
    if len(parts) != 3:
        raise InvalidTokenError("Invalid token.")

    header_b64, payload_b64, signature_b64 = parts

    try:
        header_json = _b64url_decode(header_b64)
        header = json.loads(header_json.decode('utf-8'))
        if not isinstance(header, dict) or header.get("alg") != "HS256" or header.get("typ") != "JWT":
            raise InvalidTokenError("Invalid token.")
    except InvalidTokenError:
        raise
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise InvalidTokenError("Invalid token.")

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    secret = settings.jwt_signing_secret.encode('utf-8')
    expected_sig = hmac.new(secret, signing_input, hashlib.sha256).digest()

    try:
        actual_sig = _b64url_decode(signature_b64)
    except InvalidTokenError:
        raise InvalidTokenError("Invalid token.")

    if len(actual_sig) != len(expected_sig) or not hmac.compare_digest(actual_sig, expected_sig):
        raise InvalidTokenError("Invalid token.")

    try:
        payload_json = _b64url_decode(payload_b64)
        payload = json.loads(payload_json.decode('utf-8'))
        if not isinstance(payload, dict):
            raise InvalidTokenError("Invalid token.")
    except InvalidTokenError:
        raise
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise InvalidTokenError("Invalid token.")

    required_claims = ("sub", "role", "iat", "exp", "jti")
    if any(claim not in payload for claim in required_claims):
        raise InvalidTokenError("Invalid token.")
    exp = payload["exp"]
    iat = payload["iat"]
    if (
        isinstance(exp, bool) or not isinstance(exp, (int, float)) or not math.isfinite(exp)
        or isinstance(iat, bool) or not isinstance(iat, (int, float)) or not math.isfinite(iat)
    ):
        raise InvalidTokenError("Invalid token.")
    now = int(time.time())
    sub = payload.get("sub")
    role = payload.get("role")
    jti = payload.get("jti")
    if exp <= now:
        raise TokenExpiredError("Token expired.")
    if iat > now or iat > exp:
        raise InvalidTokenError("Invalid token.")
    if not isinstance(sub, str) or not sub.strip() or len(sub) > 320:
        raise InvalidTokenError("Invalid token.")
    if role not in ("student", "researcher"):
        raise InvalidTokenError("Invalid token.")
    if not isinstance(jti, str) or len(jti) < 16 or len(jti) > 256 or not jti.strip():
        raise InvalidTokenError("Invalid token.")

    return payload
