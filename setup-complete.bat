@echo off
setlocal enabledelayedexpansion

REM Campus Study Buddy - Complete Development Setup Script (Windows)
REM This script sets up the entire development environment from scratch

echo.
echo ================================
echo Campus Study Buddy - Complete Development Setup
echo ================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:v=%
if %NODE_VERSION% lss 20 (
    echo [ERROR] Node.js 20+ is required. Current version: 
    node --version
    pause
    exit /b 1
)
echo [SUCCESS] Node.js version: 
node --version

REM Check npm version
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
echo [SUCCESS] npm version: 
npm --version

REM Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo [SUCCESS] Git version: 
git --version

echo.
echo ================================
echo Installing Dependencies
echo ================================

echo [INFO] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo [SUCCESS] All dependencies installed successfully

echo.
echo ================================
echo Setting Up Environment Files
echo ================================

REM Create .env file
if not exist ".env" (
    echo [INFO] Creating .env file...
    copy env.example .env >nul
    echo [SUCCESS] .env file created
) else (
    echo [WARNING] .env file already exists, skipping...
)

REM Create backend/.env file
if not exist "backend\.env" (
    echo [INFO] Creating backend/.env file...
    copy backend\env.example backend\.env >nul
    echo [SUCCESS] backend/.env file created
) else (
    echo [WARNING] backend/.env file already exists, skipping...
)

REM Create frontend/.env.local file
if not exist "frontend\.env.local" (
    echo [INFO] Creating frontend/.env.local file...
    (
        echo # Firebase Configuration
        echo VITE_FIREBASE_API_KEY=your_firebase_api_key_here
        echo VITE_FIREBASE_AUTH_DOMAIN=sd2025law.firebaseapp.com
        echo VITE_FIREBASE_PROJECT_ID=sd2025law
        echo VITE_FIREBASE_STORAGE_BUCKET=sd2025law.appspot.com
        echo VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
        echo VITE_FIREBASE_APP_ID=your_firebase_app_id_here
        echo VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
    ) > frontend\.env.local
    echo [SUCCESS] frontend/.env.local file created
) else (
    echo [WARNING] frontend/.env.local file already exists, skipping...
)

echo.
echo ================================
echo Firebase Setup Instructions
echo ================================

echo Please complete the following Firebase setup:
echo.
echo 1. Go to https://console.firebase.google.com/
echo 2. Select your project (sd2025law) or create a new one
echo 3. Enable the following services:
echo    - Authentication (Email/Password and Google)
echo    - Firestore Database
echo    - Storage
echo    - Cloud Messaging
echo.
echo 4. Get your Firebase configuration:
echo    - Go to Project Settings → General
echo    - Scroll to 'Your apps' section
echo    - Copy the config values to frontend/.env.local
echo.
echo 5. Download service account key:
echo    - Go to Project Settings → Service Accounts
echo    - Click 'Generate New Private Key'
echo    - Save as backend/service-account.json
echo.
echo 6. Get OpenWeatherMap API key:
echo    - Go to https://openweathermap.org/api
echo    - Sign up for free account
echo    - Get API key and add to backend/.env
echo.
pause

echo.
echo ================================
echo Running Tests
echo ================================

echo [INFO] Running unit tests...
call npm run test:unit
if %errorlevel% neq 0 (
    echo [WARNING] Some unit tests failed, but continuing...
) else (
    echo [SUCCESS] Unit tests passed
)

echo [INFO] Running linting...
call npm run lint
if %errorlevel% neq 0 (
    echo [WARNING] Linting issues found, but continuing...
) else (
    echo [SUCCESS] Linting passed
)

echo.
echo ================================
echo Database Seeding
echo ================================

set /p SEED_DB="Do you want to seed the database with test data? (y/n): "
if /i "%SEED_DB%"=="y" (
    echo [INFO] Seeding database with test data...
    cd backend
    call npm run seed:db
    if %errorlevel% neq 0 (
        echo [WARNING] Database seeding failed, but continuing...
    ) else (
        echo [SUCCESS] Database seeded successfully
    )
    cd ..
) else (
    echo [WARNING] Skipping database seeding
)

echo.
echo ================================
echo Setup Complete!
echo ================================

echo.
echo 🎉 Campus Study Buddy development environment is ready!
echo.
echo Next steps:
echo 1. Update your environment files with actual API keys
echo 2. Add your Firebase service account key to backend/service-account.json
echo 3. Run 'npm run dev' to start the development servers
echo.
echo Useful commands:
echo - npm run dev          # Start both frontend and backend
echo - npm run test         # Run all tests
echo - npm run test:watch   # Run tests in watch mode
echo - npm run lint         # Run linting
echo - npm run seed:db      # Seed database with test data
echo - npm run health:check # Check server health
echo.
echo URLs:
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8080
echo - Health Check: http://localhost:8080/health
echo - API Docs: http://localhost:8080/docs (when generated)
echo.
echo Documentation:
echo - Development Setup: ./DEVELOPMENT_SETUP.md
echo - Sprint 2 Docs: ./SPRINT2_DOCUMENTATION.md
echo - Database Schema: ./db/schema.md
echo.
echo Happy coding! 🚀
echo.

set /p START_DEV="Do you want to start the development servers now? (y/n): "
if /i "%START_DEV%"=="y" (
    echo [INFO] Starting development servers...
    echo [INFO] Frontend will be available at: http://localhost:5173
    echo [INFO] Backend will be available at: http://localhost:8080
    echo [INFO] Health check: http://localhost:8080/health
    echo.
    echo [INFO] Press Ctrl+C to stop the servers
    echo.
    call npm run dev
) else (
    echo [INFO] You can start the servers later with: npm run dev
)

pause
