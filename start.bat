@echo off
title Health & Life Tracker Launcher
echo ========================================================
echo         HEALTH ^& LIFE TRACKER - FULL STACK APP
echo ========================================================
echo.
echo Starting Backend API Server (Port 5001)...
start "Health Tracker Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo Waiting for Backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Frontend UI Dev Server (Port 3000)...
start "Health Tracker Frontend" cmd /k "cd /d "%~dp0frontend" && node ./node_modules/vite/bin/vite.js"

echo.
echo ========================================================
echo Application is starting!
echo - Web Application: http://localhost:3000
echo - Backend API:      http://localhost:5001
echo ========================================================
echo.
pause
