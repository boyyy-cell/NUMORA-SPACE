"""
NUMORA Space Backend — Vercel Serverless Function (api/index.py)
Exposes the FastAPI application as 'app' for Vercel Python runtime.
"""
import sys
import types
from pathlib import Path

# Resolve directory paths (parent of api/ is backend/)
api_dir = Path(__file__).resolve().parent
backend_dir = api_dir.parent
parent_dir = backend_dir.parent

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

# Alias backend module for environments where root directory is set to 'backend'
try:
    import app as app_pkg
    if "backend" not in sys.modules:
        backend_pkg = types.ModuleType("backend")
        backend_pkg.__path__ = [str(backend_dir)]
        sys.modules["backend"] = backend_pkg
    sys.modules["backend.app"] = app_pkg
except ImportError:
    pass

from backend.app.main import app
