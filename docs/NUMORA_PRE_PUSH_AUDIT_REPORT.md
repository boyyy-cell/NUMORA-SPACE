# NUMORA SPACE — Pre-Push Audit Report

**Audit date:** 2026-11-23  
**Decision:** **NOT READY for public release or push**

## Scope and safeguards

This audit covered the working tree, backend and frontend source, available automated tests, selected local and production HTTP probes, and a read-only database inventory. No source/configuration changes, database writes, staging, commits, pushes, or deployments were performed. This report is the requested audit deliverable.

Actual `.env` files were not opened, printed, or copied. Tests and endpoint authorization checks used temporary test storage, not the research database. The live production service could not be consistently reached, so an unavailable endpoint is not evidence that its deployed configuration is safe.

## Status summary

| Area | Status | Evidence |
|---|---|---|
| Git inventory and secret-file exclusion | **LULUS, with publication caveats** | After creating this report: 36 modified, 27 untracked, 17 collapsed ignored entries in normal status output, and nothing staged. A recursive ignored-file listing expands to 14,992 paths, primarily generated/local files under `frontend/` and `backend/`. Actual `.env` files and local database/backup files are ignored and were not found among tracked files. A text scan found no private-key/JWT/API-key-shaped values in the scanned documents and examples. |
| Backend automated tests | **LULUS** | Pytest: 52 passed, 0 failed; one Starlette/httpx deprecation warning. |
| Research API source authorization | **LULUS (isolated test only)** | For subjects, sessions, and cognitive-load-status: no token returned 401, student returned 403, researcher returned 200 using a temporary database. This does not establish production deployment parity. |
| Frontend automated scripts | **LULUS, evidence limited** | Six JavaScript scripts completed successfully; some are static/source checks or simulations, not browser-to-API integration tests. |
| Frontend production build | **LULUS with warning** | Build completed. The main JavaScript bundle is about 1.2 MB and exceeds the configured/tooling 500 KB warning threshold. |
| Local API | **PARTIAL / GAGAL parity check** | Health and CORS preflight responded 200, but the live process's OpenAPI still exposes an email/password login route absent from current source. The running process therefore does not match the reviewed source. |
| Production API and frontend | **GAGAL / UNSTABLE** | Latest probes: API root 503; health/auth/research probes 502; frontend root and `/login` returned 404. Results varied across earlier probes. |
| Production researcher-data exposure | **TIDAK AMAN — high priority** | An earlier unauthenticated probe of `/api/v1/research/subjects` returned 200. Its response body was not inspected. A later probe was unavailable (502); exposure must be treated as unresolved until verified and blocked. |
| Google sign-in end-to-end | **BELUM DIUJI** | No real Google-account callback, live token verification, session persistence, or role redirect was exercised in this audit. |
| Live NORA/provider response | **BELUM DIUJI** | Automated tests do not establish that production credentials/provider are configured or that a live provider returned an answer. |
| Research-data persistence/integrity | **TIDAK AMAN for empirical use without remediation** | Research session storage is in-memory; evaluation results are browser `localStorage` and can be altered by the user. |

## Tests and checks performed

| Check | Result |
|---|---|
| Backend pytest suite | **LULUS:** 52 passed, 0 failed; 1 deprecation warning. |
| Research endpoint role checks with TestClient and temporary DB | **LULUS:** unauthenticated 401, student 403, researcher 200 for the three source routes tested. No live research DB was used. |
| `test_final_verification.js` | **LULUS**, but its CORS subsection uses a hard-coded regex rather than the backend middleware and is not reliable proof of deployed CORS policy. |
| `test_landing_login_evaluation.js` | **LULUS:** 19/19 checks. |
| `test_login_auth_suite.js` | **LULUS:** 15/15 checks. Assertions check that demo accounts are absent; the file header still describes email/demo login cases and is stale. |
| `test_phase1_revisions.js` | **LULUS.** |
| `test_runner_shuffle.js` | **LULUS:** 12,477 checks/iterations. |
| `test_stability_and_features.js` | **LULUS**, but largely simulation/static evidence rather than live integration. |
| Frontend production build | **LULUS**, with the bundle-size warning above. |
| Local HTTP health and CORS preflight | **LULUS for those probes only:** HTTP 200. Stale OpenAPI route exposure remains a mismatch. |
| Production HTTP probes | **GAGAL/UNSTABLE:** latest results are 503/502 for API probes and 404 for frontend root/login; earlier results differed. |
| Real Google OAuth and live NORA provider request | **BELUM DIUJI.** |
| `git diff --check` | **LULUS:** exit code 0; Git emitted only line-ending conversion notices. The new report also has no trailing whitespace. |
| NPM test/lint scripts | **NOT AVAILABLE:** `frontend/package.json` defines a build script but no `test` or `lint` script. The JavaScript checks are standalone scripts. |

## Security and integrity findings

### High priority

1. **Production research route access is unresolved.** A prior unauthenticated request to `/api/v1/research/subjects` received HTTP 200. The route response body was not examined. Current production probes fail, so source guards cannot be assumed to protect the deployed service. Verify deployed revision, route authentication, and CORS from an authorized environment before any public release.
2. **Research evaluation results are not authoritative.** The student evaluation is stored in browser `localStorage`; the researcher dashboard reads/exports those values. Users can alter browser storage, so these results are not verified empirical records. The evaluation component also exposes `window.__NUMORA_EVALUATION__` in production code, including a direct submission/storage hook.
3. **Research session records are process-local.** `ResearchStore` keeps sessions in memory. Data can disappear on restart and will not be shared reliably across multiple instances. Hosting persistence and multi-instance behavior were not verifiable from this workspace.
4. **NORA resource controls are insufficiently evidenced.** The NORA route has no visible researcher/student authentication dependency or route-level rate-limit call; the request schema does not show bounded message/history lengths. The SQLite rate-limit helper uses a transaction, but no production authentication call-site was found during the audit. This increases abuse/resource-exhaustion risk, especially if a paid provider is enabled.
5. **Production is not currently demonstrably operational.** API and frontend probes fail or vary, while the local running API's OpenAPI differs from source. Production revision, environment configuration, CORS, and storage must be reconciled before release.
6. **Research/data references in existing documentation need sanitization.** The document scan found local filesystem paths, private-network IP addresses, and non-example email addresses in some `docs/` reports. No values are repeated here. Do not publish affected reports until reviewed and sanitized.

### Medium priority

1. **Production test hooks remain exposed.** `window.__NUMORA_RUNNER__` exports game controls/state; `window.__NUMORA_EVALUATION__` exports quiz controls and persistence. These are not authentication bypasses by themselves, but should be development/test-only, particularly because evaluation scores are used by the researcher dashboard.
2. **Local runtime is stale.** The running backend advertises an email/password route absent from reviewed source. Restart it from the intended source and recheck OpenAPI and auth routes before treating local integration results as current.
3. **Database snapshot differs from the previous audit snapshot.** Current read-only inventory: 4 user rows, 11 revoked-token rows, and 5 rate-limit rows. The prior audit recorded 2 user rows and 9 revoked-token rows. This audit's tests used temporary databases and made no writes to the default database, but the difference is unexplained in this shared environment. Do not infer the cause or alter accounts. Current subject counts: S-001 has no user row; S-002 and P-001 each have one. A database backup was present. No account or research record was inspected or modified.
4. **One frontend CORS test is misleading.** `test_final_verification.js` accepts a broad `numora-space.*.vercel.app` pattern in its own local regex. It does not evaluate the actual backend production CORS configuration.
5. **Frontend example config should be checked for completeness.** The frontend example includes the `VITE_GOOGLE_CLIENT_ID` setting name; backend example includes `GOOGLE_CLIENT_ID` and JWT setting names. This confirms only example-file names, not actual `.env` or hosting values. Production values and authorized Google origins were not inspected.
6. **Some scan findings are sensitive identifiers.** The files below contain one or more categories of local path, private IP, or non-example email; this is a filename list only and does not reproduce the values:
   - `docs/NUMORA_DEPLOYMENT_READINESS_REPORT.md`
   - `docs/NUMORA_FINAL_VERIFICATION_REPORT.md`
   - `docs/NUMORA_LIVE_BROWSER_TESTING_REPORT.md`
   - `docs/NUMORA_REVISION_TRACKER.md`
   - `docs/NUMORA_SUPABASE_PHASE_2A_AUDIT.md`
   - `docs/NUMORA_V16_FINAL_REFINEMENT_REPORT.md`
   - `docs/NUMORA_COMPLETE_REVISION_REPORT.md`
   - `docs/NUMORA_FINAL_CODE_INTEGRITY_REPORT.md`
   - `docs/NUMORA_FINAL_DEEP_INTERACTION_REPORT.md`
   - `docs/NUMORA_FINAL_TECHNICAL_REPORT.md`
   - `docs/NUMORA_FINAL_VALIDATION_REPORT.md`
   - `docs/NUMORA_V16_BUGFIX_REPORT.md`
   - `docs/NUMORA_V16_BASELINE_AUDIT.md`
   - `docs/NUMORA_V16_PHASE15_IMPLEMENTATION.md`
   - `docs/NUMORA_V16_PHASE1_IMPLEMENTATION.md`
   - `docs/NUMORA_V16_VISUAL_IDENTITY.md`
   - `docs/NUMORA_STABILITY_FIX_REPORT.md`

### Low priority / quality

- Pytest emitted one Starlette/httpx deprecation warning.
- Pylance reported missing imports under the editor-selected environment even though the project virtual environment ran pytest successfully; select/verify the project interpreter before treating those diagnostics as code failures.
- Backend dependency requirements are not fully locked to exact versions.
- The frontend production bundle exceeds the 500 KB warning threshold.
- No direct use of Python `eval`/`exec`, `pickle`, shell execution, or logging statements that print token/password/secret/API-key values was found in the scanned backend/frontend source. This is a bounded search result, not a complete security certification.

## GitHub publication guidance

### Candidate files

Source and test files under `backend/app/`, `frontend/src/`, and `tests/`, plus `README`, `.gitignore`, dependency manifests/lockfiles, and `.env.example` files are candidate files **only after the blockers above are addressed and a reviewer checks the final diff**. The report itself contains no credential values or personal data found by the report scan.

### Exclude from GitHub

- Actual `.env` files and any credential/token/private-key files.
- SQLite databases, database backups, and generated research data.
- Python virtual environments, `node_modules`, build output such as `dist/`, caches, coverage output, and local logs.
- `scratch/`, including `scratch/audit_backend_security.py`; it is ignored and its direct-handler calls bypass dependency authorization, so it is not valid evidence of route protection.
- The documentation files listed above until their local identifiers are sanitized.

The `.env` files and local database/backup files were ignored and not tracked in the audited Git inventory. Do not use blanket staging; stage reviewed paths selectively after sanitization.

## Required actions before push

1. Identify and verify the exact production deployment/revision. From a controlled environment, confirm all researcher endpoints return 401 without auth, 403 for a student, and authorized results only for an authenticated researcher. Recheck production CORS and deployment health.
2. Reconcile local OpenAPI with source by restarting the intended backend process; confirm removed login routes are no longer served.
3. Move research/evaluation records to an authenticated, persistent backend store with authorization and integrity controls before treating them as research evidence. Confirm hosting provides persistent storage and define backup/restore procedures.
4. Add appropriate NORA request-size limits, rate limiting, and authentication/authorization policy; verify provider quotas and safe error handling with a live provider test that does not expose keys.
5. Remove or development-gate browser test hooks and ensure client-controlled scores cannot be used as trusted research results.
6. Sanitize the listed documentation and review every untracked file before publishing.
7. Re-run backend/frontend tests, production build, actual deployed authorization/CORS probes, and `git diff --check` after remediation.

## Production and data limitations

- **Backend production:** currently not verifiably healthy; latest probes returned 503/502. Persistent disk and uptime guarantees were not accessible for verification.
- **Frontend production:** latest root and login probes returned 404.
- **Google OAuth:** actual live sign-in was not tested. No credential values were inspected or reported; configured Google Cloud origins and production environment values remain unverified.
- **NORA AI:** no live provider response was tested. Provider availability, quota, and production keys remain unverified.
- **Database:** this audit performed only a read-only inventory; no migration, reset, account edit, or research-data edit occurred. The difference from the previous count is unresolved and should be investigated by the system owner before data is relied on.
- **Git/deployment:** no staging, commit, push, or deployment was performed.
