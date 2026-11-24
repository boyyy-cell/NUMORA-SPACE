import sqlite3
import os
import time

db_path = "backend/app/data/security_store.db"
backup_dir = "backend/app/data/backups"
os.makedirs(backup_dir, exist_ok=True)
timestamp = time.strftime("%Y%m%d_%H%M%S")
backup_path = os.path.join(backup_dir, f"security_store_backup_pre_phase2_{timestamp}.db")

src = sqlite3.connect(db_path)
dst = sqlite3.connect(backup_path)
src.backup(dst)
dst.close()
src.close()

verify = sqlite3.connect(backup_path)
cur = verify.cursor()
cur.execute("PRAGMA integrity_check;")
res = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM users;")
users_count = cur.fetchone()[0]
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = [row[0] for row in cur.fetchall()]
verify.close()

print(f"BACKUP_CREATED: {backup_path}")
print(f"INTEGRITY: {res}")
print(f"USERS_COUNT: {users_count}")
print(f"TABLES_COUNT: {len(tables)}")
