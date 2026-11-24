@echo off
title NUMORA Space Backend Server
echo ===================================================
echo   NUMORA Space — Backend FastAPI Production Server
echo   Running on http://0.0.0.0:8000 (Local & LAN Access)
echo ===================================================
cd /d "%~dp0"

if exist "backend\venv315\Scripts\python.exe" (
    echo Using Python 3.15 environment (backend\venv315)...
    backend\venv315\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
) else if exist "backend\venv314\Scripts\python.exe" (
    echo Using Python 3.14 environment (backend\venv314)...
    backend\venv314\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    echo [ERROR] Virtual environment tidak ditemukan di backend\venv315 atau backend\venv314.
    pause
)
