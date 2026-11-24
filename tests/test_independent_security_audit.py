import hashlib
import secrets
from uuid import uuid4

from backend.app.core.security import hash_password, verify_password


def test_password_hash_uses_random_salts_and_secure_pbkdf2_iterations():
    first_hash = hash_password("a password with spaces ")
    second_hash = hash_password("a password with spaces ")
    algorithm, iterations, salt, digest = first_hash.split("$")

    assert algorithm == "pbkdf2_sha256"
    assert int(iterations) >= 600_000
    assert len(bytes.fromhex(salt)) == 16
    assert len(bytes.fromhex(digest)) == hashlib.sha256().digest_size
    assert first_hash != second_hash
    assert verify_password("a password with spaces ", first_hash)
    assert not verify_password("a password with spaces", first_hash)


def test_legacy_pbkdf2_hashes_remain_verifiable_without_rehashing():
    salt = secrets.token_bytes(16)
    password = "legacy password"
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    legacy_hash = f"pbkdf2_sha256$100000${salt.hex()}${digest.hex()}"

    assert verify_password(password, legacy_hash)
    assert not verify_password(password + " ", legacy_hash)


def test_password_verification_rejects_malformed_and_excessive_iterations():
    salt = secrets.token_bytes(16).hex()
    digest = secrets.token_bytes(32).hex()

    assert not verify_password("valid password", f"pbkdf2_sha256$1${salt}${digest}")
    assert not verify_password("valid password", f"pbkdf2_sha256$1000001${salt}${digest}")
    assert not verify_password("valid password", "not-a-password-hash")


def test_public_password_registration_endpoint_is_removed(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": f"legacy-{uuid4().hex}@example.test",
            "password": "valid legacy password",
        },
    )

    assert response.status_code == 404
