# NUMORA SPACE — LAPORAN FINAL REVIEW PHASE 0
**Audit Validasi Berkas Backup, Integritas Database, Skrip Verifikasi & Status Git**

**Tanggal Audit:** 23 November 2026  
**Status Evaluasi:** FINAL PRE-PHASE-1 AUDIT (READ-ONLY)  
**Lingkungan:** Python 3.14.7, SQLite 3, Git  

---

## 1. STATUS KEBERADAAN & KETERBUKAAN FILE DATABASE

Pemeriksaan read-only terhadap ketiga berkas database menunjukkan hasil sebagai berikut:

| No | Path Berkas Database | Status Keberadaan | Ukuran Berkas | Status Akses (Read-Only) |
| :---: | :--- | :---: | :---: | :---: |
| 1 | `backend/app/data/security_store.db` (Database Asli) | **ADA (True)** | 36.864 bytes | **Berhasil Dibuka (URI `mode=ro`)** |
| 2 | `backend/app/data/backups/security_store_backup_20261123_092957.db` (File Backup) | **ADA (True)** | 36.864 bytes | **Berhasil Dibuka (URI `mode=ro`)** |
| 3 | `backend/app/data/backups/security_store_drill_restore_20261123_092957.db` (Hasil Uji Pemulihan) | **ADA (True)** | 36.864 bytes | **Berhasil Dibuka (URI `mode=ro`)** |

---

## 2. PEMERIKSAAN INTEGRITAS, JUMLAH RECORD & FINGERPRINT KRIPTOGRAFIS

Seluruh pemeriksaan dilakukan secara *read-only* dengan URI mode `file:...db?mode=ro`. Untuk memastikan konsistensi data tanpa membocorkan data sensitif (password hash, secret, token, atau rincian otentikasi), dilakukan kalkulasi sidik jari SHA-256 kanonikal pada setiap tabel:

### A. Integritas Fisik Database (`PRAGMA integrity_check`)
- `security_store.db` (Asli): `[('ok',)]` $\rightarrow$ **VALID & SEHAT**
- `security_store_backup_20261123_092957.db` (Backup): `[('ok',)]` $\rightarrow$ **VALID & SEHAT**
- `security_store_drill_restore_20261123_092957.db` (Restore): `[('ok',)]` $\rightarrow$ **VALID & SEHAT**

### B. Jumlah Record Tiap Tabel
| Nama Tabel | Database Asli | File Backup | Salinan Drill Restore | Status Kesesuaian |
| :--- | :---: | :---: | :---: | :---: |
| **`users`** | 4 record | 4 record | 4 record | **100% IDENTIK** |
| **`revoked_tokens`** | 14 record | 14 record | 14 record | **100% IDENTIK** |
| **`login_rate_limits`** | 6 record | 6 record | 6 record | **100% IDENTIK** |

### C. Sidik Jari Kriptografis Tabel (SHA-256 Table Content Fingerprints)
Sidik jari dihitung dari representasi baris yang diurutkan secara deterministik (`ORDER BY rowid`):

| Nama Tabel | SHA-256 Fingerprint Database Asli | SHA-256 Fingerprint File Backup | SHA-256 Fingerprint Hasil Restore | Status Komparasi |
| :--- | :--- | :--- | :--- | :---: |
| `users` | `1b88a6fefe1600ab5d4a4963e718f6c6b5a4626de2287e458286b3afacd43dd7` | `1b88a6fefe1600ab5d4a4963e718f6c6b5a4626de2287e458286b3afacd43dd7` | `1b88a6fefe1600ab5d4a4963e718f6c6b5a4626de2287e458286b3afacd43dd7` | **MATCH (Identik)** |
| `revoked_tokens` | `6ae53f2c05dd0a760291677e9a2805fa44bec675bdf29fc03affa2640d5c6758` | `6ae53f2c05dd0a760291677e9a2805fa44bec675bdf29fc03affa2640d5c6758` | `6ae53f2c05dd0a760291677e9a2805fa44bec675bdf29fc03affa2640d5c6758` | **MATCH (Identik)** |
| `login_rate_limits` | `938b4e27a43a1c0918de3f130b0d4fdf4bdee2d8290d381c2a1460a558360c3f` | `938b4e27a43a1c0918de3f130b0d4fdf4bdee2d8290d381c2a1460a558360c3f` | `938b4e27a43a1c0918de3f130b0d4fdf4bdee2d8290d381c2a1460a558360c3f` | **MATCH (Identik)** |

---

## 3. AUDIT KESELAMATAN SKRIP `phase0_backup_and_verify.py`

Pemeriksaan baris demi baris pada berkas `backend/scripts/phase0_backup_and_verify.py` memastikan:
1. **Database Asli Hanya Dibaca (*Read-Only Consumer*):**
   - Pada baris 84–89, koneksi database asli dibuka sebagai `src_conn`, dan dieksekusi `src_conn.backup(dst_conn, pages=100)`. Dalam arsitektur SQLite Backup API, `src_conn` bertindak eksklusif sebagai penyedia halaman baca (*source*).
2. **Nol Operasi Destruktif:**
   - Tidak ditemukan satu pun perintah `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, atau penulisan transaksi pada database asli. Seluruh query berupa pembacaan metadata (`PRAGMA integrity_check`, `SELECT name FROM sqlite_master`, `SELECT COUNT(*)`).
3. **Pemisahan File Target Mutlak:**
   - File backup ditulis ke path terpisah: `backend/app/data/backups/security_store_backup_<timestamp>.db`.
   - File pemulihan drill restore ditulis ke path terpisah: `backend/app/data/backups/security_store_drill_restore_<timestamp>.db`.
   - Tidak ada operasi penimpaan (*overwrite*) ke file database asli.

---

## 4. AUDIT `.gitignore` DAN STATUS PELACAKAN GIT

Pemeriksaan status Git menghasilkan temuan spesifik berikut:

### A. Status Berkas Database Utama (`security_store.db`)
- Perintah: `git status --ignored -s backend/app/data/security_store.db`
- Hasil: `!! backend/app/data/security_store.db` (Simbol `!!` menandakan berkas **BENAR-BENAR DIABAIKAN OLEH GIT** berkat aturan `backend/app/data/*.db` pada `.gitignore`).
- Berkas `security_store.db` **tidak staged dan tidak tracked**.

### B. Temuan Khusus pada Direktori Cadangan (`backend/app/data/backups/`)
- Perintah: `git status -s backend/app/data/backups/`
- Hasil: `?? backend/app/data/backups/` (Simbol `??` menandakan direktori berstatus **UNTRACKED**).
- **Akar Masalah:**
  Pada berkas `.gitignore`, aturan saat ini tertulis:
  ```gitignore
  # Runtime security database
  backend/app/data/*.db
  backend/app/data/*.sqlite*
  ```
  Dalam sintaks pathspec Git, pola `backend/app/data/*.db` hanya mencocokkan berkas `.db` yang berada langsung di direktori `backend/app/data/` (tingkat 1), **bukan** di dalam subdirektori `backend/app/data/backups/`.
- **Status Saat Ini:** Berkas backup dan drill restore **TIDAK STAGED** (`Changes to be committed` kosong), namun berstatus `Untracked files`.
- **Kepatuhan Terhadap Instruksi:** Sesuai batasan eksplisit dari pengguna (*"Jangan mengubah atau menghapus file apa pun untuk menyelesaikan audit ini"*), berkas `.gitignore` **TIDAK DIUBAH**. Masalah ini dilaporkan secara transparan.
- **Rekomendasi Tindakan (Menunggu Izin):** Saat diinstruksikan oleh pengguna, baris `.gitignore` cukup disempurnakan dengan menambahkan:
  ```gitignore
  backend/app/data/backups/
  ```
  sehingga seluruh isi direktori cadangan diabaikan secara otomatis oleh Git.

---

## 5. AUDIT PRESERVASI EMPAT AKUN ASLI & DATA PENELITIAN

Pemeriksaan non-sensitif terhadap 4 akun pengguna pada ketiga salinan database:

| No | Label Akun / Identifier | Peran (Role) | Subject ID | Peran Riset | Status Baseline |
| :---: | :--- | :---: | :---: | :--- | :---: |
| 1 | `siswa.demo@numora.space` | `student` | **`S-002`** | Subjek Eksperimen NUMORA Space | **UTUH 100%** |
| 2 | `peneliti.demo@numora.space` | `researcher` | **`P-001`** | Peneliti Utama / Evaluator (Provisioned) | **UTUH 100%** |
| 3 | `faridsyahputra53@...` | `student` | `U-77E16F4FF0862A46` | Siswa Publik (Google OAuth) | **UTUH 100%** |
| 4 | `popolkupa123@...` | `student` | `U-343606ACF22D8FE4` | Siswa Publik (Google OAuth) | **UTUH 100%** |

Tidak ada akun yang diubah, dihapus, atau diberi label ulang. Data subjek penelitian S-002 dan P-001 terjaga sepenuhnya.

---

## 6. KESIMPULAN & REKOMENDASI PERSETUJUAN

### Rangkuman Hasil Pemeriksaan
1. **Ketiga file database ada, valid, dan dapat dibuka read-only:** LULUS (PASS).
2. **Integritas database `[('ok',)]` dan checksum record 100% identik:** LULUS (PASS).
3. **Skrip Phase 0 terbukti read-only tanpa perintah mutasi pada database asli:** LULUS (PASS).
4. **Preservasi 4 akun asli, role, dan subject_id tidak tersentuh:** LULUS (PASS).
5. **Catatan Git:** Database asli `security_store.db` diabaikan Git (`!!`), namun subdirektori `backend/app/data/backups/` memerlukan tambahan satu baris di `.gitignore` agar tidak berstatus `??` (untracked).

### Rekomendasi
> [!TIP]
> **REKOMENDASI: PHASE 0 LAYAK DISETUJUI UNTUK MELANGKAH KE PHASE 1.**
> Seluruh prosedur keselamatan data telah terbukti berhasil. Sebagai langkah penutup Phase 0 sebelum mengeksekusi DDL Phase 1, pengguna cukup mengonfirmasi penambahan satu baris `backend/app/data/backups/` pada `.gitignore`.

*Tahap Phase 1 belum dimulai. Tidak ada commit, push, maupun deploy yang dijalankan.*
