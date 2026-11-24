"""
PHASE 1 — ADDITIVE & IDEMPOTENT DATABASE SCHEMA MIGRATION
NUMORA Space Persistent Storage Implementation
"""
import sys
import sqlite3
import hashlib
import time
from datetime import datetime, timezone
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "app" / "data" / "security_store.db"
BACKUP_DIR = BASE_DIR / "app" / "data" / "backups"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

PHASE0_BACKUP_PATH = BACKUP_DIR / "security_store_backup_20261123_092957.db"
timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
PRE_PHASE1_BACKUP_PATH = BACKUP_DIR / f"security_store_backup_pre_phase1_{timestamp_str}.db"

print("====================================================================")
print("--- PHASE 1: ADDITIVE DATABASE SCHEMA MIGRATION ---")
print("====================================================================\n")

# -----------------------------------------------------------------------------
# STEP 1: VERIFIKASI PRA-MIGRASI & BACKUP TAMBAHAN
# -----------------------------------------------------------------------------
print("▶ LANGKAH 1: Verifikasi Pra-Migrasi & Pembuatan Backup Pre-Phase 1...")

# 1.1 Pastikan backup Phase 0 masih tersedia dan utuh
if not PHASE0_BACKUP_PATH.exists():
    print(f"❌ FATAL: Backup Phase 0 tidak ditemukan di {PHASE0_BACKUP_PATH}")
    sys.exit(1)

p0_conn = sqlite3.connect(f"file:{PHASE0_BACKUP_PATH.resolve().as_posix()}?mode=ro", uri=True)
p0_check = p0_conn.execute("PRAGMA integrity_check").fetchall()
p0_conn.close()
if p0_check != [("ok",)]:
    print(f"❌ FATAL: Backup Phase 0 rusak: {p0_check}")
    sys.exit(1)
print(f"   ✓ Backup Phase 0 Terverifikasi Intak: {PHASE0_BACKUP_PATH.name} (integrity: ok)")

# 1.2 Pastikan integrity check database asli saat ini ok
orig_conn = sqlite3.connect(f"file:{DB_PATH.resolve().as_posix()}?mode=ro", uri=True)
orig_check = orig_conn.execute("PRAGMA integrity_check").fetchall()
orig_tables = [r[0] for r in orig_conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()]
orig_users_count = orig_conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
orig_conn.close()

if orig_check != [("ok",)]:
    print(f"❌ FATAL: Database asli saat ini tidak sehat: {orig_check}")
    sys.exit(1)
print(f"   ✓ Database Asli Terverifikasi Sehat (integrity: ok, users: {orig_users_count})")

# 1.3 Buat backup tambahan tepat sebelum migrasi
src_conn = sqlite3.connect(str(DB_PATH))
dst_conn = sqlite3.connect(str(PRE_PHASE1_BACKUP_PATH))
try:
    with dst_conn:
        src_conn.backup(dst_conn, pages=100)
    print(f"   ✓ Backup Pre-Phase 1 Berhasil Dibuat: {PRE_PHASE1_BACKUP_PATH.name}")
finally:
    dst_conn.close()
    src_conn.close()

# 1.4 Verifikasi backup pre-phase 1
pre_conn = sqlite3.connect(f"file:{PRE_PHASE1_BACKUP_PATH.resolve().as_posix()}?mode=ro", uri=True)
pre_check = pre_conn.execute("PRAGMA integrity_check").fetchall()
pre_conn.close()
if pre_check != [("ok",)]:
    print(f"❌ FATAL: Backup Pre-Phase 1 gagal diverifikasi: {pre_check}")
    sys.exit(1)
print(f"   ✓ Backup Pre-Phase 1 Terverifikasi Integritasnya (ok)\n")

# -----------------------------------------------------------------------------
# STEP 2: EKSEKUSI MIGRASI SKEMA ADDITIVE & IDEMPOTENT
# -----------------------------------------------------------------------------
print("▶ LANGKAH 2: Menjalankan Migrasi Skema Database...")

SCHEMA_VERSION = 1
MIGRATION_NAME = "v1_persistent_storage_foundation"

def run_migration(db_path: Path):
    """
    Menjalankan migrasi skema secara atomik dalam transaksi.
    Mengembalikan dict hasil status eksekusi.
    """
    conn = sqlite3.connect(str(db_path), timeout=15.0)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA busy_timeout = 15000;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    cursor = conn.cursor()

    try:
        cursor.execute("BEGIN IMMEDIATE")
        
        # 1. Tabel Versioning Migrasi
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at INTEGER NOT NULL
            )
        """)
        
        # Periksa apakah versi ini sudah pernah diterapkan
        cursor.execute("SELECT version, name FROM schema_migrations WHERE version = ?", (SCHEMA_VERSION,))
        existing = cursor.fetchone()
        if existing:
            conn.commit()
            return {"status": "ALREADY_APPLIED", "version": existing[0], "name": existing[1]}
            
        # 2. Tabel student_module_progress
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_module_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL,
                module_id TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('not_started', 'in_progress', 'completed')),
                slider_explored INTEGER NOT NULL DEFAULT 0,
                time_spent_seconds INTEGER NOT NULL DEFAULT 0,
                completed_at INTEGER,
                updated_at INTEGER NOT NULL,
                UNIQUE(user_email, module_id),
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_mod_progress_email ON student_module_progress(user_email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_mod_progress_status ON student_module_progress(status)")

        # 3. Tabel student_evaluations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_evaluations (
                evaluation_id TEXT PRIMARY KEY,
                idempotency_key TEXT NOT NULL,
                user_email TEXT NOT NULL,
                attempt_number INTEGER NOT NULL DEFAULT 1,
                score REAL NOT NULL CHECK(score >= 0.0 AND score <= 100.0),
                accuracy REAL NOT NULL CHECK(accuracy >= 0.0 AND accuracy <= 1.0),
                total_questions INTEGER NOT NULL DEFAULT 10,
                correct_count INTEGER NOT NULL CHECK(correct_count >= 0 AND correct_count <= 10),
                wrong_count INTEGER NOT NULL CHECK(wrong_count >= 0 AND wrong_count <= 10),
                category_breakdown TEXT NOT NULL,
                detailed_answers TEXT NOT NULL,
                completed_at INTEGER NOT NULL,
                CONSTRAINT uq_eval_idempotency UNIQUE(user_email, idempotency_key),
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_eval_user_time ON student_evaluations(user_email, completed_at DESC)")

        # 4. Tabel student_runner_stats
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_runner_stats (
                user_email TEXT PRIMARY KEY,
                high_score_beginner INTEGER NOT NULL DEFAULT 0,
                high_score_intermediate INTEGER NOT NULL DEFAULT 0,
                high_score_advanced INTEGER NOT NULL DEFAULT 0,
                high_score_expert INTEGER NOT NULL DEFAULT 0,
                total_games INTEGER NOT NULL DEFAULT 0,
                total_coins INTEGER NOT NULL DEFAULT 0,
                total_distance INTEGER NOT NULL DEFAULT 0,
                total_math_answered INTEGER NOT NULL DEFAULT 0,
                total_math_correct INTEGER NOT NULL DEFAULT 0,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
            )
        """)

        # 5. Tabel student_runner_sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_runner_sessions (
                session_id TEXT PRIMARY KEY,
                idempotency_key TEXT NOT NULL,
                user_email TEXT NOT NULL,
                level TEXT NOT NULL CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')),
                score INTEGER NOT NULL,
                coins INTEGER NOT NULL,
                distance INTEGER NOT NULL,
                answered INTEGER NOT NULL,
                correct INTEGER NOT NULL,
                accuracy REAL NOT NULL,
                mistakes_count INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                CONSTRAINT uq_runner_sess_idempotency UNIQUE(user_email, idempotency_key),
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_runner_sess_email ON student_runner_sessions(user_email, created_at DESC)")

        # 6. Tabel learning_activities
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learning_activities (
                activity_id TEXT PRIMARY KEY,
                user_email TEXT NOT NULL,
                activity_type TEXT NOT NULL,
                module_or_feature_id TEXT NOT NULL,
                metadata_json TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_activities_user_type ON learning_activities(user_email, activity_type, created_at DESC)")

        # 7. Tabel research_subjects
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS research_subjects (
                subject_id TEXT PRIMARY KEY,
                group_name TEXT NOT NULL,
                role_description TEXT NOT NULL,
                grade TEXT NOT NULL DEFAULT 'SMP Kelas VII',
                active_module TEXT NOT NULL,
                pretest_status TEXT NOT NULL DEFAULT 'Scheduled',
                pretest_score REAL,
                posttest_status TEXT NOT NULL DEFAULT 'Scheduled',
                posttest_score REAL,
                cognitive_load_status TEXT NOT NULL DEFAULT 'NOT CONFIGURED (Belum Diukur)',
                total_sessions_logged INTEGER NOT NULL DEFAULT 0,
                protocol_category TEXT NOT NULL DEFAULT 'PROTOCOL_TEMPLATE',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        """)

        # 8. Tabel research_sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS research_sessions (
                session_id TEXT PRIMARY KEY,
                subject_id TEXT NOT NULL,
                session_date TEXT NOT NULL,
                module_id TEXT NOT NULL,
                concept_studied TEXT NOT NULL,
                duration_minutes REAL NOT NULL,
                hints_used INTEGER NOT NULL DEFAULT 0,
                misconceptions_detected TEXT NOT NULL DEFAULT '[]',
                researcher_notes TEXT,
                verified_by_researcher INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (subject_id) REFERENCES research_subjects(subject_id) ON DELETE RESTRICT
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_res_sess_subject ON research_sessions(subject_id, session_date)")

        # 9. Tabel research_cognitive_load_records
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS research_cognitive_load_records (
                record_id TEXT PRIMARY KEY,
                subject_id TEXT NOT NULL,
                session_id TEXT,
                framework_name TEXT NOT NULL DEFAULT 'Leppink et al. Multidimensional Cognitive Load Scale',
                intrinsic_load REAL,
                extraneous_load REAL,
                germane_load REAL,
                instrument_status TEXT NOT NULL,
                measured_at INTEGER NOT NULL,
                FOREIGN KEY (subject_id) REFERENCES research_subjects(subject_id) ON DELETE RESTRICT,
                FOREIGN KEY (session_id) REFERENCES research_sessions(session_id) ON DELETE SET NULL
            )
        """)

        # 10. Seed Resmi Subjek Penelitian S-001 dan S-002 (Idempotent)
        now_ts = int(time.time())
        cursor.execute("""
            INSERT OR IGNORE INTO research_subjects (
                subject_id, group_name, role_description, grade, active_module,
                pretest_status, pretest_score, posttest_status, posttest_score,
                cognitive_load_status, total_sessions_logged, protocol_category,
                created_at, updated_at
            ) VALUES 
            (
                'S-001',
                'Control (Tatap Muka Langsung bersama Peneliti)',
                'Siswa SMP Kelas VII belajar konsep aljabar secara tatap muka konvensional terarah bersama peneliti.',
                'SMP Kelas VII',
                'Modul 02: Understanding Coefficients',
                'Scheduled', NULL, 'Scheduled', NULL,
                'NOT CONFIGURED (Belum Diukur)',
                0, 'PROTOCOL_TEMPLATE', ?, ?
            ),
            (
                'S-002',
                'Experimental (Pembelajaran Berbantuan NUMORA Space)',
                'Siswa SMP Kelas VII belajar konsep aljabar secara mandiri terpandu melalui platform NUMORA Space & NORA AI.',
                'SMP Kelas VII',
                'Modul 02: Understanding Coefficients',
                'Scheduled', NULL, 'Scheduled', NULL,
                'NOT CONFIGURED (Belum Diukur)',
                0, 'PROTOCOL_TEMPLATE', ?, ?
            )
        """, (now_ts, now_ts, now_ts, now_ts))

        # 11. Catat Versi Migrasi
        cursor.execute("""
            INSERT INTO schema_migrations (version, name, applied_at)
            VALUES (?, ?, ?)
        """, (SCHEMA_VERSION, MIGRATION_NAME, now_ts))

        conn.commit()
        return {"status": "SUCCESS", "version": SCHEMA_VERSION, "name": MIGRATION_NAME}

    except Exception as exc:
        conn.rollback()
        raise exc
    finally:
        conn.close()

# Jalankan migrasi pertama
res1 = run_migration(DB_PATH)
print(f"   ✓ Eksekusi Migrasi Pertama: {res1}")

# -----------------------------------------------------------------------------
# STEP 3: UJI IDEMPOTENSI (MIGRASI KEDUA)
# -----------------------------------------------------------------------------
print("\n▶ LANGKAH 3: Pengujian Idempotensi Migrasi (Eksekusi Ulang)...")
res2 = run_migration(DB_PATH)
print(f"   ✓ Eksekusi Migrasi Kedua: {res2}")
if res2["status"] != "ALREADY_APPLIED":
    print(f"❌ GAGAL: Eksekusi ulang tidak mendeteksi status ALREADY_APPLIED: {res2}")
    sys.exit(1)
print(f"   ✓ Idempotensi Terbukti: Tidak ada duplikasi skema atau error saat dijalankan ulang.")

# -----------------------------------------------------------------------------
# STEP 4: AUDIT INTEGRITAS & PENGECEKAN SELURUH TABEL BARU
# -----------------------------------------------------------------------------
print("\n▶ LANGKAH 4: Audit Integritas & Keberadaan Seluruh Tabel...")

verify_conn = sqlite3.connect(f"file:{DB_PATH.resolve().as_posix()}?mode=ro", uri=True)
verify_cursor = verify_conn.cursor()

# 4.1 Integrity check
v_check = verify_cursor.execute("PRAGMA integrity_check").fetchall()
if v_check != [("ok",)]:
    print(f"❌ GAGAL: PRAGMA integrity_check pasca-migrasi tidak ok: {v_check}")
    sys.exit(1)
print(f"   ✓ PRAGMA integrity_check Pasca-Migrasi: {v_check} (OK)")

# 4.2 Daftar semua tabel
verify_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
all_tables = [r[0] for r in verify_cursor.fetchall()]
print(f"   ✓ Total Tabel Terdaftar ({len(all_tables)} tabel):")
for t in all_tables:
    cnt = verify_cursor.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    print(f"     - {t:<35} : {cnt} baris")

expected_new_tables = [
    "schema_migrations",
    "student_module_progress",
    "student_evaluations",
    "student_runner_stats",
    "student_runner_sessions",
    "learning_activities",
    "research_subjects",
    "research_sessions",
    "research_cognitive_load_records"
]

for ent in expected_new_tables:
    if ent not in all_tables:
        print(f"❌ GAGAL: Tabel baru '{ent}' tidak ditemukan di database!")
        sys.exit(1)
print(f"   ✓ Seluruh 8 Tabel Baru + schema_migrations Berhasil Dibuat 100%.")

# 4.3 Preservasi Tabel & Akun Lama
verify_cursor.execute("SELECT email, role, subject_id, is_provisioned_researcher FROM users ORDER BY email")
users_after = verify_cursor.fetchall()
if len(users_after) != 4:
    print(f"❌ GAGAL: Jumlah akun berubah! Ditemukan: {len(users_after)}, Diharapkan: 4")
    sys.exit(1)

print(f"\n   ✓ Verifikasi Preservasi 4 Akun Utama:")
for u in users_after:
    print(f"     - Email: {u[0]} | Role: {u[1]} | Subject ID: {u[2]} | Provisioned Researcher: {bool(u[3])}")

# 4.4 Verifikasi Seed Subjek Penelitian
verify_cursor.execute("SELECT subject_id, group_name, active_module FROM research_subjects ORDER BY subject_id")
subjects_rows = verify_cursor.fetchall()
print(f"\n   ✓ Verifikasi Subjek Penelitian Resmi:")
for s in subjects_rows:
    print(f"     - Subject ID: {s[0]} | Group: {s[1]} | Active Module: {s[2]}")

verify_conn.close()

# -----------------------------------------------------------------------------
# STEP 5: PENGUJIAN CONSTRAINT & FOREIGN KEY RUNTIME
# -----------------------------------------------------------------------------
print("\n▶ LANGKAH 5: Pengujian Penegakan Foreign Key & Unique Constraint...")

test_conn = sqlite3.connect(str(DB_PATH), timeout=15.0, isolation_level=None)
test_conn.execute("PRAGMA foreign_keys = ON;")
test_cursor = test_conn.cursor()

# 5.1 Uji Foreign Key Violation pada student_module_progress
try:
    test_cursor.execute("""
        INSERT INTO student_module_progress (user_email, module_id, status, updated_at)
        VALUES ('email.tidak.ada@domain.invalid', 'MOD-01', 'completed', ?)
    """, (int(time.time()),))
    print("❌ GAGAL: Foreign key constraint tidak melempar error saat user_email tidak ada!")
    sys.exit(1)
except sqlite3.IntegrityError:
    print("   ✓ Foreign Key Constraint Berfungsi: Menolak user_email yang tidak terdaftar di users.")

# 5.2 Uji Unique Idempotency Key pada student_evaluations
test_email = "siswa.demo@numora.space"
test_idem_key = "idem-test-uuid-001"
now_sec = int(time.time())

try:
    test_cursor.execute("BEGIN IMMEDIATE")
    test_cursor.execute("""
        INSERT INTO student_evaluations (
            evaluation_id, idempotency_key, user_email, attempt_number,
            score, accuracy, total_questions, correct_count, wrong_count,
            category_breakdown, detailed_answers, completed_at
        ) VALUES (
            'eval-test-001', ?, ?, 1, 100.0, 1.0, 10, 10, 0, '{}', '[]', ?
        )
    """, (test_idem_key, test_email, now_sec))
    
    # Percobaan kedua dengan idempotency_key yang sama harus ditolak
    test_cursor.execute("""
        INSERT INTO student_evaluations (
            evaluation_id, idempotency_key, user_email, attempt_number,
            score, accuracy, total_questions, correct_count, wrong_count,
            category_breakdown, detailed_answers, completed_at
        ) VALUES (
            'eval-test-002', ?, ?, 2, 80.0, 0.8, 10, 8, 2, '{}', '[]', ?
        )
    """, (test_idem_key, test_email, now_sec))
    print("❌ GAGAL: Unique idempotency key tidak melempar IntegrityError pada duplikasi!")
    sys.exit(1)
except sqlite3.IntegrityError:
    test_conn.rollback()
    print("   ✓ Unique Constraint Idempotency Berfungsi: Menolak idempotency_key ganda per pengguna.")
finally:
    test_conn.close()

print("\n====================================================================")
print("🎉 PHASE 1 SELESAI: MIGRASI SKEMA DATABASE 100% SUKSES, IDEMPOTEN & TERVERIFIKASI.")
print("====================================================================")
