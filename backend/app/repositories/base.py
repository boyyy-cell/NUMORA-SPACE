"""
NUMORA Space — Database Repository Base & Multi-Dialect Connection Provider
Thread-safe connection provider supporting SQLite (local development) and
managed PostgreSQL (Neon cloud production) with connection pooling,
unified dict-like row access, and transparent placeholder translation.
"""
import os
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Optional, Any
from backend.app.core.database import (
    db_manager,
    ConnectionProxy,
    get_default_sqlite_path,
    is_postgres_configured,
)


def get_default_db_path() -> str:
    return get_default_sqlite_path()


class BaseRepository:
    def __init__(self, db_path: Optional[str] = None):
        self._db_path = db_path
        self._lock = threading.Lock()

    @property
    def db_path(self) -> str:
        path = self._db_path or get_default_db_path()
        if path != ":memory:" and not is_postgres_configured():
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def is_postgres(self) -> bool:
        return self._db_path is None and is_postgres_configured()

    @contextmanager
    def get_connection(self) -> Iterator[ConnectionProxy]:
        """
        Membuka koneksi database terkelola (PostgreSQL Neon jika DATABASE_URL ada,
        atau SQLite lokal dengan timeout 15 detik, foreign keys = ON, dan WAL).
        """
        with db_manager.get_connection(self._db_path) as conn:
            yield conn

    @contextmanager
    def transaction(self) -> Iterator[ConnectionProxy]:
        """
        Menjalankan transaksi atomik (BEGIN IMMEDIATE di SQLite / COMMIT-ROLLBACK di PostgreSQL).
        Secara otomatis melakukan COMMIT jika sukses, atau ROLLBACK jika terjadi exception.
        """
        with db_manager.transaction(self._db_path) as conn:
            yield conn

