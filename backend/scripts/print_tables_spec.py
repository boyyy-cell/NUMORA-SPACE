"""
Specific table reconciliation script
"""
import sqlite3
from pathlib import Path

db = Path('backend/app/data/security_store.db')
conn = sqlite3.connect(f'file:{db.resolve().as_posix()}?mode=ro', uri=True)
c = conn.cursor()

tables = [
    'schema_migrations',
    'student_module_progress',
    'student_evaluations',
    'student_runner_stats',
    'student_runner_sessions',
    'learning_activities',
    'research_subjects',
    'research_sessions',
    'research_cognitive_load_records'
]

for t in tables:
    print(f"=== {t} ===")
    sql = c.execute(f"SELECT sql FROM sqlite_master WHERE name='{t}'").fetchone()[0]
    print(sql)
    cols = c.execute(f"PRAGMA table_info({t})").fetchall()
    print("Cols:", [(col[1], col[2], f"NN={col[3]}", f"DFLT={col[4]}", f"PK={col[5]}") for col in cols])
    fks = c.execute(f"PRAGMA foreign_key_list({t})").fetchall()
    print("FKs:", [(fk[2], f"{fk[3]}->{fk[4]}", fk[5], fk[6]) for fk in fks])
    idxs = c.execute(f"PRAGMA index_list({t})").fetchall()
    print("Idxs:", [(idx[1], f"UQ={idx[2]}") for idx in idxs])
    print()

conn.close()
