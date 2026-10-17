@echo off
title SmartEdu System - Dung Toan Bo He Thong
color 0c

echo =======================================================================
echo          SMARTEDU SYSTEM - DUNG TOAN BO HE THONG
echo =======================================================================
echo.
echo [*] Dang tien hanh dung cac tien trinh SmartEdu...

:: Tat cac tien trinh dang chay tren cac cong 5173, 5000, 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [*] Da dung thanh cong cac dich vu: Node.js (5000), Vite (5173), Python Face AI (8000)!
echo.
pause
