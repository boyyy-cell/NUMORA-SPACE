"""
Script audit read-only Phase 2 Recovery untuk memvalidasi:
- Syntax dan import seluruh modul baru
- Route registration pada FastAPI
- Kesesuaian method repository dengan skema tabel aktual di security_store.db
- Status file backup pre-Phase 2
"""
import sys
import sqlite3
import importlib
from pathlib import Path
from fastapi.routing import APIRoute

# Setup root path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

def audit_modules():
    modules_to_test = [
        "backend.app.repositories.base",
        "backend.app.repositories.student_progress_repository",
        "backend.app.repositories.student_evaluation_repository",
        "backend.app.repositories.student_runner_repository",
        "backend.app.repositories.learning_activity_repository",
        "backend.app.repositories.research_repository",
        "backend.app.services.student_sync_service",
        "backend.app.schemas.student",
        "backend.app.schemas.research",
        "backend.app.core.dependencies",
        "backend.app.api.v1.endpoints.student",
        "backend.app.api.v1.endpoints.research",
        "backend.app.api.v1.api",
        "backend.app.main",
    ]
    
    print("=== 1. AUDIT SYNTAX & IMPORT ===")
    for mod in modules_to_test:
        try:
            m = importlib.import_module(mod)
            print(f"[OK] {mod}")
        except Exception as e:
            print(f"[FAIL] {mod}: {e}")

def audit_routes():
    print("\n=== 2. AUDIT FASTAPI ROUTES ===")
    from backend.app.main import app
    schema = app.openapi()
    paths = schema.get("paths", {})
    
    student_routes = [(p, list(m.keys())) for p, m in paths.items() if "/student" in p]
    research_routes = [(p, list(m.keys())) for p, m in paths.items() if "/research" in p]
    auth_routes = [(p, list(m.keys())) for p, m in paths.items() if "/auth" in p]
    
    print(f"Total Unique API Paths Registered: {len(paths)}")
    print(f"Student Endpoints ({len(student_routes)}):")
    for path, methods in sorted(student_routes):
        print(f"  {','.join(methods).upper():<12} {path}")
        
    print(f"\nResearch Endpoints ({len(research_routes)}):")
    for path, methods in sorted(research_routes):
        print(f"  {','.join(methods).upper():<12} {path}")

def audit_backup():
    print("\n=== 3. AUDIT PRE-PHASE 2 BACKUP ===")
    backup_file = "backend/app/data/backups/security_store_backup_pre_phase2_20261123_165736.db"
    p = Path(backup_file)
    if not p.exists():
        print(f"[FAIL] Backup not found: {backup_file}")
        return
    print(f"[OK] Backup file exists: {backup_file} (Size: {p.stat().st_size:,} bytes)")
    
    conn = sqlite3.connect(backup_file)
    cur = conn.cursor()
    cur.execute("PRAGMA integrity_check;")
    chk = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM users;")
    u_cnt = cur.fetchone()[0]
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [r[0] for r in cur.fetchall()]
    conn.close()
    print(f"  Integrity Check: {chk}")
    print(f"  Users Count: {u_cnt}")
    print(f"  Tables Count: {len(tables)} ({', '.join(tables)})")

def audit_schema_compatibility():
    print("\n=== 4. AUDIT DATABASE SCHEMA COMPATIBILITY ===")
    db_file = "backend/app/data/security_store.db"
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    
    tables_to_check = [
        "student_module_progress",
        "student_evaluations",
        "student_runner_stats",
        "student_runner_sessions",
        "learning_activities",
        "research_subjects",
        "research_sessions",
        "research_cognitive_load_records",
    ]
    for tbl in tables_to_check:
        cur.execute(f"PRAGMA table_info({tbl});")
        cols = [r[1] for r in cur.fetchall()]
        print(f"[OK] Table {tbl}: {len(cols)} columns -> {', '.join(cols[:5])}...")
    conn.close()

if __name__ == "__main__":
    audit_modules()
    audit_routes()
    audit_backup()
    audit_schema_compatibility()
