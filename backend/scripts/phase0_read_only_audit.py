"""
READ-ONLY FINAL AUDIT OF PHASE 0 ARTIFACTS
Does not modify any file or database.
"""
import hashlib
import sqlite3
from pathlib import Path

files = [
    Path('backend/app/data/security_store.db'),
    Path('backend/app/data/backups/security_store_backup_20261123_092957.db'),
    Path('backend/app/data/backups/security_store_drill_restore_20261123_092957.db')
]

results = []

for f in files:
    exists = f.exists()
    size = f.stat().st_size if exists else 0
    info = {
        "file": str(f).replace('\\', '/'),
        "exists": exists,
        "size": size,
        "integrity": None,
        "tables": {},
        "fingerprints": {}
    }
    if exists:
        # Open in strict read-only mode using URI
        uri = f"file:{f.resolve().as_posix()}?mode=ro"
        conn = sqlite3.connect(uri, uri=True)
        cursor = conn.cursor()
        
        # Integrity check
        integrity = cursor.execute("PRAGMA integrity_check").fetchall()
        info["integrity"] = integrity
        
        # Table list
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        tables = [r[0] for r in cursor.fetchall()]
        
        # Row counts & cryptographic fingerprints without exposing sensitive data
        for t in tables:
            count = cursor.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
            info["tables"][t] = count
            
            # Deterministic SHA-256 fingerprint of row contents
            cursor.execute(f"SELECT * FROM {t} ORDER BY rowid")
            rows = cursor.fetchall()
            h = hashlib.sha256()
            for r in rows:
                h.update(repr(r).encode('utf-8'))
            info["fingerprints"][t] = h.hexdigest()
            
        conn.close()
    results.append(info)

for r in results:
    print(f"File: {r['file']}")
    print(f"  Exists: {r['exists']} | Size: {r['size']} bytes")
    print(f"  Integrity: {r['integrity']}")
    print(f"  Table Counts: {r['tables']}")
    print(f"  Table SHA-256 Fingerprints:")
    for t, fp in r["fingerprints"].items():
        print(f"    - {t}: {fp}")
    print()

# Verification check
f0 = results[0]
f1 = results[1]
f2 = results[2]

all_exist = all(r["exists"] for r in results)
all_intact = all(r["integrity"] == [('ok',)] for r in results)
counts_match = (f0["tables"] == f1["tables"] == f2["tables"])
fingerprints_match = (f0["fingerprints"] == f1["fingerprints"] == f2["fingerprints"])

print(f"Summary Verification:")
print(f"  All 3 files exist: {all_exist}")
print(f"  All 3 PRAGMA integrity_check OK: {all_intact}")
print(f"  All table counts match: {counts_match}")
print(f"  All cryptographic fingerprints match 100%: {fingerprints_match}")
