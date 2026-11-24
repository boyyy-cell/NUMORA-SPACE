# NUMORA SPACE — Security Remediation Report

**Date:** 2026-11-23  
**Scope:** local source code and isolated automated tests only  
**Production / database changes:** none

## Executive summary

Local source controls were strengthened for researcher authorization, Google authentication rate limiting, NORA request abuse, and request-body size limits. Browser-local evaluation scores are no longer treated as researcher data or included in researcher exports. Production deployment was not tested or changed.

**Not all remediation is complete.** Research sessions still reside in process memory, and student learning results still use browser storage for the student's own progress. A persistent research-data store needs an approved architecture and explicit, additive migration plan; none was selected or applied. Production authorization remains unverified despite the earlier audit's report of an unauthenticated production response.

## Findings and plan recorded before implementation

1. Research routes had a router-level researcher guard, but authorization trusted the JWT role without confirming the account's current role and researcher provisioning in persistent account storage.
2. The SQLite rate-limit helper used an atomic transaction but had no endpoint call sites. `TRUSTED_PROXIES` was configured as a setting but was not used for client-IP resolution.
3. NORA is embedded on the public landing page and had no rate limit, bounded history, or effective request-body limit.
4. `ResearchStore` kept sessions in memory. The researcher dashboard read and exported student-controlled `localStorage` scores.
5. Authentication uses Google GIS and JWTs; `ProtectedRoute` is a client-side navigation guard and cannot replace backend authorization.

The implementation plan was to add backend account/role revalidation, scoped rate limiting, trusted-proxy-aware IP resolution, bounded NORA schemas and request bodies, remove browser scores from researcher exports, gate test hooks to development, and add regression tests. Persistent research storage was explicitly deferred pending an architecture and migration decision.

## Changes made

### Researcher authorization and authentication

- `get_current_user` now checks that the JWT subject exists in the account store, that the stored role and `subject_id` still match the token, and that researcher accounts remain provisioned. Missing or stale accounts fail with 401; database failures continue to fail closed through the store's 503 response.
- The `/api/v1/research` router continues to apply `require_researcher` to all current research routes: subjects, sessions, and cognitive-load status.
- Google token verification and JWT format/algorithm/signature/expiry/JTI/revocation logic were not weakened or replaced. `ProtectedRoute` remains a user-interface guard; server-side checks are authoritative.
- The public NORA preview remains usable without login to preserve the landing-page experience. It is rate-limited instead; this does not make NORA an authenticated or confidential endpoint.

### Rate limiting and request limits

- Google authentication is limited to **5 attempts per minute per resolved client key**.
- NORA is limited to **20 requests per minute per resolved client key**. The two endpoints use separate scopes in the existing rate-limit table, so one does not consume the other's quota.
- The existing SQLite `BEGIN IMMEDIATE` transaction is reused; no table or database migration was introduced.
- Client IP resolution ignores `X-Forwarded-For` unless the direct peer matches a configured `TRUSTED_PROXIES` IP or CIDR. Forwarded chains are bounded and parsed from the nearest proxy outward; malformed/untrusted headers fall back to the direct peer.
- Request bodies are capped at **12 KiB** for Google login and **32 KiB** for NORA, including streamed bodies without `Content-Length`. CORS remains present on size-limit responses.
- NORA message text is limited to 1,000 characters; history to six entries of at most 1,000 characters each; roles and modes are enumerated; hint tier is constrained to 1–3. The frontend sends only the latest six bounded context entries and limits typed input.

### Research-score integrity and test hooks

- The researcher dashboard no longer reads evaluation scores from browser `localStorage`, displays them as study results, or exports them. Exports mark scores `N/A`/`NOT_COLLECTED` and include an integrity notice.
- Student-side local evaluation remains available as personal learning progress only; it is not a verified research record.
- Global test hooks for evaluation and NUMORA RUN are available only in Vite development mode and are omitted from production builds.

### Files touched by this remediation

- Backend: `backend/app/core/network.py`, `backend/app/core/middleware.py`, `backend/app/core/dependencies.py`, `backend/app/main.py`, `backend/app/api/v1/endpoints/auth.py`, `backend/app/api/v1/endpoints/nora.py`, `backend/app/services/auth_service.py`, `backend/app/services/token_revocation_store.py`, `backend/app/schemas/nora.py`.
- Frontend: `frontend/src/features/nora/NoraChatPreview.jsx`, `frontend/src/features/learning/MathematicalChallenge.jsx`, `frontend/src/features/runner/NumoraRunner3D.jsx`, `frontend/src/pages/ResearcherDashboard.jsx`.
- Tests: `tests/test_backend_security_phase2.py`, `tests/test_backend_security_phase3.py`, `tests/test_api.py`, `tests/test_nora_open_ai.py`, `tests/test_landing_login_evaluation.js`.
- Report: `docs/NUMORA_SECURITY_REMEDIATION_REPORT.md`.

The worktree already contained changes before this task. The files above include pre-existing modified/untracked files that were edited in place; unrelated local changes were retained.

## Persistent research-data design — not implemented

The current service does not provide authoritative durable research-session or evaluation storage. `ResearchStore` keeps sessions in memory, and student scores remain in browser storage for learning continuity. No real/default database was opened, written, or migrated; pytest was configured to use a temporary isolated database.

Recommended design for owner review:

1. Select the production store only after confirming hosting persistence and instance topology. SQLite is acceptable for local development or a verified single-instance persistent volume; a managed transactional database is preferable if production is ephemeral or multi-instance. Keep research records separate from authentication/revocation data unless the owner explicitly approves a shared schema.
2. Define additive, versioned tables for actual session events and evaluation submissions. Preserve `S-001` and `S-002` as protocol subject identifiers; `P-001` remains the researcher identity, not a participant record. Enforce subject membership server-side and derive the submitting student's subject from the authenticated account, never from a client-selected ID.
3. Compute scores on the server from a versioned question set and submitted answers; do not accept a client-provided score as authoritative. Record provenance, protocol/question version, timestamps, and an audit identifier. Keep records append-only where practical, and decide consent, raw-answer retention, export, backup, and deletion policy before storing participant data.
4. Protect all reads/exports with researcher authorization. Do not copy browser-local scores into the research store or fabricate historical sessions.
5. Before any migration, inventory the active database read-only, verify a restorable backup, obtain approval for the target schema/storage, and run an explicit additive migration with row-count and `S-001`/`S-002`/`P-001` integrity checks. Do not run migrations at application import/startup.

This design needs an owner decision about the production database/persistent volume and data-retention policy. Therefore no persistence migration or backfill was attempted.

## Test results

| Validation | Result |
|---|---|
| Full backend pytest suite | **PASS:** 67 passed, 0 failed; one Starlette/httpx deprecation warning. Tests used temporary storage. |
| Research authorization | **PASS:** all three routes reject unauthenticated users (401), reject students (403), and allow provisioned researchers (200); a researcher whose provisioning/role is removed is rejected. |
| JWT/account synchronization | **PASS:** tests cover missing persisted accounts, existing student/researcher accounts, role mismatch, Google claims, token revocation, and researcher access. Google verification uses a test double; no real Google account was used. |
| Authentication rate limit | **PASS:** first five requests are processed and the sixth receives 429 with `Retry-After`. |
| NORA rate limit and public preview | **PASS:** 20 bounded guest requests succeed and the next receives 429; this confirms public access is retained while rate-limited. |
| NORA validation/body limits | **PASS:** oversized body returns 413 with CORS; overlong messages/history and invalid role values return 422. Streamed-body middleware tests cover both rejection and replay of a bounded body. |
| Trusted proxy handling | **PASS:** untrusted forwarded headers are ignored; a configured proxy chain resolves the client; malformed chains fall back to the peer. |
| Frontend JavaScript suites | **PASS:** all six standalone suites passed, including 21/21 landing/evaluation checks and 15/15 auth checks. |
| Frontend production build | **PASS:** Vite transformed 1,532 modules. The main bundle is about 1.19 MB and still triggers the existing 500 KB chunk warning. Searches of the production output found neither global test-hook name. |
| `git diff --check` | **PASS:** exit code 0; only Git line-ending conversion notices. The new report has no trailing whitespace. |
| Real Google OAuth / live AI provider | **NOT TESTED:** no production credentials or real external sign-in/provider response were used. |
| Production route/CORS/deployment | **NOT TESTED in this task:** no production changes or probes were made. The previous report's unauthenticated production research response remains unresolved until independently retested against the deployed revision. |
| Database integrity | **NOT MODIFIED:** identifiers and real accounts were not inspected or edited. Tests used temporary synthetic accounts only. |

Pylance in the current editor environment still reports unresolved third-party imports, while the project virtual-environment test run imports and executes successfully. No Pylance signature incompatibility was found for the rate-limit helper's call sites. The standalone frontend CORS simulation scripts remain weaker evidence than the backend middleware TestClient checks.

## Remaining risks and required next steps

1. **Production route exposure:** source authorization is strengthened, but production may still run a stale or different revision. Verify every deployed research endpoint from an authorized environment before treating it as closed.
2. **Persistent research storage:** sessions are still in-memory and research scores are not yet stored server-side. The dashboard intentionally omits client-side scores. Approve a durable store and migration/backup plan before implementing this part.
3. **Rate-limit deployment topology:** configure `TRUSTED_PROXIES` with the actual proxy networks. With no trusted proxy configuration, forwarded headers are intentionally ignored; behind a reverse proxy, clients may share the proxy's rate-limit bucket. SQLite rate limits are also local to one database file and are not globally coordinated across ephemeral or multiple instances.
4. **Public NORA policy:** NORA remains guest-accessible because it is presented on the landing page. If it should become student-only, that is a product/access decision requiring a corresponding frontend flow and user confirmation.
5. **Session-token storage:** the frontend continues to persist its bearer token in browser storage. The existing session flow was retained; a move to HttpOnly cookies would require a separate CSRF/session architecture change.
6. **Research schema provenance:** the existing `ResearchSessionLog` schema still has a legacy `DEMO_SEED` default. No session-creation endpoint currently writes these records, but the default should be replaced with required, explicit provenance as part of the approved persistent-store design.
7. **Production integration:** real Google OAuth, hosting environment values, provider availability, persistent-disk guarantees, and production CORS remain unverified. No secrets were printed or changed.

No `.env` values were printed, no database/account/research data was changed, and there was no staging, commit, push, or deployment.
