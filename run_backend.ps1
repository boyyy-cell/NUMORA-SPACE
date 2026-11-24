# NUMORA Space — Run Backend Server PowerShell Script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  NUMORA Space — Backend FastAPI Server" -ForegroundColor Cyan
Write-Host "  Host: http://0.0.0.0:8000 (Local & LAN Access)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

if (Test-Path "$ScriptDir\backend\venv315\Scripts\python.exe") {
    Write-Host "Menggunakan lingkungan backend\venv315 (Python 3.15)..." -ForegroundColor Green
    & "$ScriptDir\backend\venv315\Scripts\python.exe" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
} elseif (Test-Path "$ScriptDir\backend\venv314\Scripts\python.exe") {
    Write-Host "Menggunakan lingkungan backend\venv314 (Python 3.14)..." -ForegroundColor Green
    & "$ScriptDir\backend\venv314\Scripts\python.exe" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
} else {
    Write-Host "[ERROR] Virtual environment tidak ditemukan di backend\venv315 atau backend\venv314." -ForegroundColor Red
}
