@echo off
echo.
echo ====================================
echo   Easy English AI Analyzer
echo   Quick Start Script
echo ====================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found!
    echo Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: npm install failed!
        pause
        exit /b 1
    )
)

echo.
echo ✓ All set!
echo.
echo Starting development server...
echo.
echo 🚀 Open your browser to: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
pause
