@echo off
echo Starting Social Media App...
echo.

echo Installing client dependencies...
cd client
call npm install
echo.

echo Starting frontend server...
start cmd /k "cd /d %cd% && npm run dev"

cd ..
echo.
echo Starting backend server...
cd server
start cmd /k "cd /d %cd% && npm run dev"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
pause
