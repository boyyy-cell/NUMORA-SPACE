"""
NUMORA Space Backend — Vercel Serverless Function Entrypoint
Exposes the FastAPI application as 'app' for Vercel Python runtime.
Ensures seamless import paths regardless of whether Root Directory is 'backend' or repository root.
"""
import sys
import types
from pathlib import Path

# Resolve directory paths
backend_dir = Path(__file__).resolve().parent
parent_dir = backend_dir.parent

# Add both directories to sys.path
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

# Import the FastAPI ASGI application instance
from backend.app.main import app
