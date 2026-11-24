# NUMORA SPACE — Final Security Review & Regression Audit

## Kesimpulan

**LULUS untuk regression source lokal; BELUM TERVERIFIKASI untuk production.** Seluruh tes backend dan enam suite JavaScript lulus, dan production build berhasil. Hasil ini tidak membuktikan Google OAuth atau provider AI live berfungsi, konfigurasi proxy hosting benar, atau deployment production menjalankan kode yang sama. NUMORA belum dapat dinyatakan siap production berdasarkan audit lokal ini.

Audit hanya membaca/mengubah source code dan tes lokal. Tidak ada `.env` yang dibuka atau nilainya dicetak, database/akun/data penelitian yang diubah, server production yang diakses, maupun commit, staging, push, atau deployment. `tests/conftest.py` mengarahkan tes ke database sementara dan menghapusnya setelah sesi tes.

## Lulus

### Autentikasi dan otorisasi

- Tiga route researcher (`subjects`, `sessions`, dan `cognitive-load-status`) diuji: tanpa token mendapat 401, akun student mendapat 403, dan researcher yang diprovisi mendapat 200. Penghapusan status provisioning pada akun sintetis membuat akses berikutnya ditolak.
- Pengujian Google memakai verifier test double dan mencakup audience, issuer, expiration, `email_verified`, `sub`, pendaftaran publik sebagai student, serta role researcher yang telah diprovisi. Ini bukan uji Google dengan akun sungguhan.
- Tes memakai akun sintetis pada database sementara. Akun atau role nyata, termasuk S-001, S-002, dan P-001, tidak dibaca atau diubah.

### Rate limiting, proxy, dan request NORA

- Google Auth dibatasi 5 request/menit dan NORA 20 request/menit dengan scope terpisah. Tes menguji konkurensi SQLite lintas store yang memakai file database sama dan pemisahan scope.
- Pembersihan entri rate-limit lama kini berlangsung paling sering tiap lima menit per store, maksimal 10.000 baris per batch, hanya untuk baris berumur lebih dari 24 jam. Perubahan memakai tabel yang sudah ada; tidak menambah skema, menjalankan migrasi, atau menyentuh database penelitian. Window rate limit di atas 24 jam ditolak.
- Resolusi IP hanya memakai `X-Forwarded-For` jika peer langsung berada di rentang `TRUSTED_PROXIES`; rantai malformed/untrusted kembali ke peer. Konfigurasi IP/CIDR invalid dan rentang catch-all `0.0.0.0/0` atau `::/0` kini ditolak. Nilai default source adalah daftar kosong.
- Batas body 12 KiB untuk Google Auth dan 32 KiB untuk NORA, batas pesan 1.000 karakter, riwayat maksimal enam entri, serta role/mode tervalidasi memiliki regression tests.
- NORA tetap dapat diakses publik. Endpoint menerima lima mode (`explain`, `ask`, `hint`, `review`, `chat`) pada tes. Tes mode memastikan jalur request dan respons, bukan kualitas semantik review dari provider live.
- Ketika provider tidak dikonfigurasi, fallback NORA bersifat lokal/berbasis aturan dan ditandai non-generatif; UI menampilkan bahwa respons bukan keluaran provider AI. Tes juga memastikan kegagalan provider tidak membocorkan key dan menghasilkan respons 503 yang aman.

### Frontend, pembelajaran, dan integritas data

- Tes JavaScript memeriksa alur login Google di frontend, verifikasi sesi sebelum halaman terlindungi, penolakan navigasi student ke portal researcher, progres student, evaluasi lokal, dan NUMORA RUN.
- Researcher dashboard tidak menggunakan skor `localStorage` sebagai data penelitian atau sumber ekspor. Skor lokal tetap untuk progres belajar personal, bukan hasil penelitian terverifikasi.
- Hook otomasi evaluasi dan runner hanya diaktifkan dalam development. Tes pengacakan NUMORA RUN mencakup 1.000 simulasi akurasi dan 10.000 simulasi distribusi posisi jawaban.
- `.gitignore` mencakup `.env`, file key/certificate, database runtime, dan `scratch/`. `git check-ignore` mengonfirmasi pola `.env`, backend/frontend `.env`, serta database security-store diabaikan. Ini bukan pemindaian isi seluruh dokumen atau bukti bahwa semua file tracked bebas rahasia.

## Gagal

- Tidak ada kegagalan pada tes final atau production build.
- Pemanggilan pertama `npm run build` gagal karena PowerShell memblokir `npm.ps1`; perintah yang sama berhasil melalui `npm.cmd run build`. Ini kendala execution policy, bukan kegagalan build.

## Risiko yang belum terselesaikan

1. **`TRUSTED_PROXIES` production belum diverifikasi.** Tidak ditemukan konfigurasi jaringan proxy backend dalam source lokal. Default kosong memang fail-closed, tetapi bila backend berada di belakang reverse proxy, semua klien dapat berbagi IP peer yang sama untuk rate limit. Nilai proxy harus diperoleh dari konfigurasi/penyedia hosting; tidak ditebak dalam audit ini.
2. **Topologi rate limit.** SQLite hanya mengoordinasikan proses yang memakai file database persisten yang sama. Hosting multi-instance atau filesystem ephemeral memerlukan store terdistribusi/persisten yang disetujui. Pembersihan stale row dibatasi 10.000 baris per lima menit; churn IP ekstrem yang terus melampaui laju itu tetap dapat menumbuhkan tabel.
3. **Persistensi riset.** `ResearchStore` masih menyimpan sesi di memori proses. Progres dan skor pembelajaran siswa masih lokal di browser dan bukan sumber riset otoritatif. Penyimpanan persisten memerlukan keputusan arsitektur, kebijakan retensi, backup, serta migrasi additive yang disetujui; tidak dilakukan.
4. **Integrasi eksternal belum diuji.** Tidak ada login dengan akun Google sungguhan atau permintaan ke provider AI live. Client ID/provider availability/kuota dan callback eksternal perlu diuji manual pada lingkungan yang berizin.
5. **Status production belum diketahui.** Tidak ada probe production, pemeriksaan variabel hosting, atau verifikasi revision/route/CORS deployment. Audit ini tidak menyatakan backend production online atau aman.
6. **Token browser.** Mekanisme sesi masih menyimpan bearer token di browser storage. Perubahan ke cookie HttpOnly memerlukan desain sesi/CSRF terpisah.
7. **Peringatan tooling/build.** Pylance melaporkan import `pydantic`, `pydantic_settings`, dan `fastapi` tidak terselesaikan pada environment editor, serta peringatan lama mengenai anotasi `contextmanager`. Pytest berhasil dengan virtual environment proyek. Vite juga memperingatkan bundle JavaScript utama 1.192,03 kB melebihi ambang 500 kB.

## File yang berubah pada final review ini

- `backend/app/core/config.py` — validasi `TRUSTED_PROXIES`, menolak nilai invalid/catch-all.
- `backend/app/core/network.py` — memakai nilai proxy yang telah divalidasi tanpa mengabaikan konfigurasi invalid secara diam-diam.
- `backend/app/services/token_revocation_store.py` — pembersihan berkala stale rate-limit rows dengan batch dan retensi terbatas.
- `tests/test_backend_security_phase3.py` — tes catch-all/invalid proxy dan pembersihan batch rate limit.
- `tests/test_nora_intent_suite.py` — tes semua mode NORA pada preview publik dengan fallback non-generatif.
- `docs/NUMORA_FINAL_SECURITY_REVIEW.md` — laporan ini.

Worktree sudah berisi perubahan lokal dan file untracked dari pekerjaan sebelumnya; perubahan tersebut dipertahankan dan tidak diatribusikan sebagai perubahan final review ini.

## Hasil setiap pengujian

| Pemeriksaan | Hasil |
|---|---|
| `backend\venv314\Scripts\python.exe -m pytest -q` | **LULUS:** 74 passed, 0 failed. Satu warning deprecation Starlette/httpx pada TestClient. Tes memakai database sementara. |
| `test_final_verification.js` | **LULUS:** pemeriksaan API base URL, percakapan NORA, MathEngine, isolasi storage multi-akun, dan CORS. |
| `test_landing_login_evaluation.js` | **LULUS:** 21/21. |
| `test_login_auth_suite.js` | **LULUS:** 15/15. |
| `test_phase1_revisions.js` | **LULUS:** seluruh tiga kelompok uji. |
| `test_runner_shuffle.js` | **LULUS:** seluruh assertion dan simulasi acak. |
| `test_stability_and_features.js` | **LULUS:** seluruh pemeriksaan stabilitas/API/CORS. |
| `npm.cmd run build` | **LULUS:** Vite mengubah 1.532 modul; peringatan ukuran chunk >500 kB tetap ada. |
| Pylance syntax checks untuk file Python yang diubah | **LULUS:** tidak ditemukan syntax error. |
| `git diff --check` setelah laporan | **LULUS:** tidak ada whitespace error; Git mengeluarkan notice konversi LF/CRLF pada file lokal yang sudah berubah. |
| Login Google sungguhan, provider AI live, dan deployment production | **BELUM DIUJI:** memerlukan akun/kredensial/akses eksternal yang sesuai. |

## Keputusan atau tindakan yang diperlukan

- Minta nilai jaringan proxy backend yang resmi dari penyedia hosting, kemudian set `TRUSTED_PROXIES` secara spesifik dan uji topologi deployment; jangan gunakan rentang catch-all.
- Putuskan store persisten dan topologi deployment untuk sesi/hasil penelitian sebelum merancang migrasi. Jangan memindahkan nilai dari `localStorage` menjadi data riset tanpa protokol dan persetujuan.
- Lakukan uji manual Google OAuth dan provider AI pada environment yang berwenang, lalu audit deployment production secara terpisah.
- Evaluasi pemecahan bundle frontend dan rencana token browser sebagai pekerjaan terpisah.

Tidak ada staging, commit, push, deployment, migrasi database, atau perubahan akun/data penelitian dalam audit ini.
