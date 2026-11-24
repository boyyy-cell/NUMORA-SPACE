# NUMORA SPACE — Google Login Bugfix Report

## Status

**Local source fixes and regression suites pass. Real Google login is still BLOCKED by Google OAuth origin configuration and is not claimed to work.** A fresh local browser load at `http://127.0.0.1:5174/login` showed the GIS button, but Google returned a 403 with “The given origin is not allowed for the given client ID.” No real account sign-in or production request was performed.

No `.env` file was opened, no credential/client ID value is included here, and no account, database, or research data was changed. There was no staging, commit, push, or deployment.

## Root causes found

1. **Confirmed external blocker — OAuth origin rejected.** The current local page origin is not authorized for the Google Web Client ID used by GIS. The GIS button can render while Google refuses the origin; selecting an account therefore does not prove that GIS issued a credential or that backend login completed. This requires a manual Google Cloud Console change.
2. **Confirmed frontend defect — local API could resolve to remote production.** `resolveApiBaseUrl` returned any configured non-local URL before checking whether the browser itself was on localhost/LAN. A local `VITE_API_BASE_URL` pointing to the production API could send `/auth/google` and `/auth/me` from a local origin, where CORS may reject them. The effective `.env` value was intentionally not inspected, so whether this affected this specific attempt is unknown. Local browser origins now take precedence and use the local API.
3. **Confirmed session-recovery defect.** On refresh, any `/auth/me` network/server error set the user to null, even when the stored token had not been rejected. That redirected users back to login during transient outages. The client now clears the session only on 401; transient verification errors end loading and retain the stored session. Backend authorization remains authoritative.
4. **Confirmed timeout gap.** The API timeout was cleared as soon as response headers arrived, before reading JSON/text. A stalled body could leave login loading unresolved. The timeout now covers the complete response-body read.
5. **Confirmed GIS initialization warning.** The browser logged repeated `google.accounts.id.initialize()` calls. `React.StrictMode` re-runs effects in development, and the page initialized GIS on each effect setup. GIS now initializes once per client ID and dispatches credentials to the currently mounted callback.

## Changes made

- Local and LAN frontend origins now resolve to a local backend even if a remote API URL is configured; remote frontend deployments still use their explicit remote API URL or the production fallback.
- API request timeout includes response body parsing and error-body reading.
- AuthContext retains a stored session for temporary `/auth/me` network/server failures, still clearing it on 401. It validates response role/email before accepting a new session and prevents concurrent Google login requests.
- GIS initialization is guarded against repeat initialization; GIS loading has a 10-second terminal error state. Login displays an explicit verification/loading status and maps 429 responses to a clear message.
- Regression checks cover local/remote API URL separation, response-body timeout, GIS singleton initialization, API endpoint/payload, session state and recovery, role destinations, guest protection, loading termination, and backend token outcomes.

## Files changed

- `frontend/src/services/apiBaseUrl.js`
- `frontend/src/services/api.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `tests/test_final_verification.js`
- `tests/test_login_auth_suite.js`
- `tests/test_google_auth_request_timeout.mjs`
- `docs/NUMORA_GOOGLE_LOGIN_BUGFIX_REPORT.md`

Backend login implementation was not weakened or changed. Existing backend regression tests were run for successful Google auth (using a verifier test double), failed/invalid Google tokens, and session validation.

## Verification results

| Test | Result |
|---|---|
| Full backend pytest suite | **PASS:** 74 passed, 0 failed. One existing Starlette/httpx TestClient deprecation warning. Google verifier is mocked in automated login tests. |
| `test_final_verification.js` | **PASS:** 9 API URL scenarios, including local origin overriding a remote URL; remaining API/math checks passed. |
| `test_landing_login_evaluation.js` | **PASS:** 21/21. |
| `test_login_auth_suite.js` | **PASS:** 23/23 checks. React state/routing checks in this legacy suite inspect source behavior; they are not a real Google-browser callback test. |
| `test_phase1_revisions.js` | **PASS:** all three test groups. |
| `test_runner_shuffle.js` | **PASS:** full suite and simulations. |
| `test_stability_and_features.js` | **PASS.** |
| `test_google_auth_request_timeout.mjs` | **PASS:** an intentionally stalled response body is classified as timeout and releases the request. |
| Vite production build | **PASS:** 1,532 modules transformed. Existing >500 kB JavaScript chunk warning remains. |
| Local browser smoke check | **PARTIAL:** login UI and GIS button render; Google rejects the current origin with 403. No real credential callback, backend Google exchange, or post-login browser redirect was verified. |
| `git diff --check` | **PASS:** no whitespace errors; Git emitted only existing LF/CRLF notices. |

## Required manual action / remaining blocker

In the Google Cloud Console project containing the Web OAuth client used by this app:

1. Open **APIs & Services → Credentials** and select the correct **OAuth 2.0 Client ID (Web application)**.
2. Under **Authorized JavaScript origins**, add exactly `http://127.0.0.1:5174`. If the app is also opened as `http://localhost:5174`, add that origin separately.
3. Save, allow the setting to propagate, then reload the local login page.
4. Confirm the frontend `VITE_GOOGLE_CLIENT_ID` and backend `GOOGLE_CLIENT_ID` are the same Web Client ID without sharing either value in chat.
5. Manually test one authorized student account and one already-provisioned researcher account. Confirm callback, backend verification, dashboard routing, and refresh. Do not change production origins as part of this local fix.

Until Google allows the local origin and a real account completes the flow, **Google login is not verified end-to-end**. No production configuration was accessed or changed.
