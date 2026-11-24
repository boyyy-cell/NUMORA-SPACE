"""
RECONCILIATION AUDIT: SCHEMA-TO-DESIGN VERIFICATION
Inspects actual table DDL, column types, constraints, indexes, and backups.
"""
import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone

db = Path('backend/app/data/security_store.db')
conn = sqlite3.connect(f'file:{db.resolve().as_posix()}?mode=ro', uri=True)
c = conn.cursor()

# Get DDL SQL for all tables
c.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
tables_sql = c.fetchall()

# Detailed table info: columns, pk, notnull, dflt_value
detailed_tables = {}
for name, sql in tables_sql:
    cols = c.execute(f"PRAGMA table_info({name})").fetchall()
    fks = c.execute(f"PRAGMA foreign_key_list({name})").fetchall()
    idxs = c.execute(f"PRAGMA index_list({name})").fetchall()
    detailed_tables[name] = {
        "sql": sql,
        "columns": [
            {
                "cid": col[0],
                "name": col[1],
                "type": col[2],
                "notnull": bool(col[3]),
                "default": col[4],
                "pk": col[5]
            } for col in cols
        ],
        "foreign_keys": [
            {
                "id": fk[0],
                "table": fk[2],
                "from": fk[3],
                "to": fk[4],
                "on_update": fk[5],
                "on_delete": fk[6]
            } for fk in fks
        ],
        "indexes": [
            {
                "name": idx[1],
                "unique": bool(idx[2]),
                "origin": idx[3],
                "partial": bool(idx[4])
            } for idx in idxs
        ]
    }

# Reconcile backup files
backups = sorted(list(Path('backend/app/data/backups').glob('*.db')))
backup_info = []
for b in backups:
    b_conn = sqlite3.connect(f'file:{b.resolve().as_posix()}?mode=ro', uri=True)
    b_c = b_conn.cursor()
    b_tables = [r[0] for r in b_c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall()]
    b_integrity = b_c.execute('PRAGMA integrity_check').fetchone()[0]
    
    # Check users count if table exists
    users_cnt = b_c.execute("SELECT COUNT(*) FROM users").fetchone()[0] if "users" in b_tables else 0
    b_conn.close()
    
    dt = datetime.fromtimestamp(b.stat().st_mtime, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    backup_info.append({
        'name': b.name,
        'size': b.stat().st_size,
        'modified_time': dt,
        'table_count': len(b_tables),
        'tables': b_tables,
        'users_count': users_cnt,
        'integrity': b_integrity
    })

conn.close()

out = {
    'tables': detailed_tables,
    'backups': backup_info
}
print(json.dumps(out, indent=2))
