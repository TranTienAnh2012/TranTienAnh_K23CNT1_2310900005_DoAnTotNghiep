@echo off
title SmartEdu System - Khoi Dong Toan Bo He Thong
color 0b

echo =======================================================================
echo          SMARTEDU SYSTEM - HE THONG QUAN LY DAO TAO VA FACE AI
echo                     DO AN TOT NGHIEP - K23CNT1
echo =======================================================================
echo.
echo [*] Dang chuan bi khoi dong cac dich vu...
echo [*] MySQL XAMPP dang chay tren cong 3309: SAN SANG!
echo.

:: 1. Khoi dong Face AI Microservice (Python FastAPI - Port 8000)
echo [1/3] Khoi dong Face AI Microservice (Port 8000)...
start "SmartEdu - Face AI (Port 8000)" cmd /k "title SmartEdu - Face AI (Port 8000) && color 0a && cd /d %~dp0Face_ai && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Cho 2 giay de Face AI khoi tao
ping 127.0.0.1 -n 3 >nul

:: 2. Khoi dong Backend Node.js (Express Server - Port 5000)
echo [2/3] Khoi dong Backend Node.js Express (Port 5000)...
start "SmartEdu - Backend Node.js (Port 5000)" cmd /k "title SmartEdu - Backend Node.js (Port 5000) && color 0e && cd /d %~dp0Backend_nodejs && npm run dev"

:: Cho 2 giay de Backend ket noi MySQL
ping 127.0.0.1 -n 3 >nul

:: 3. Khoi dong Frontend React (Vite - Port 5173)
echo [3/3] Khoi dong Frontend React Vite (Port 5173)...
start "SmartEdu - Frontend React (Port 5173)" cmd /k "title SmartEdu - Frontend React (Port 5173) && color 0b && cd /d %~dp0Frontend_react && npm run dev"

:: Cho 3 giay de server Frontend san sang roi tu dong mo trinh duyet
ping 127.0.0.1 -n 4 >nul

echo.
echo =======================================================================
echo   DA KHOI DONG THANH CONG TOAN BO HE THONG:
echo   - 1. Face AI Service:   http://localhost:8000
echo   - 2. Backend API:       http://localhost:5000/api
echo   - 3. Frontend Web App:  http://localhost:5173
echo =======================================================================
echo.
echo [*] Dang tu dong mo trinh duyet vao SmartEdu...
start http://localhost:5173

echo.
echo [!] De tat toan bo he thong, ban co the chay file stop_all.bat
echo     hoac dong truc tiep 3 cua so cmd vua mo.
echo.
pause
