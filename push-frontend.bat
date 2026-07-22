@echo off
echo ========================================
echo  Push Frontend Changes
echo ========================================
echo Repository: https://github.com/DebuggingDork/PawSomeFrontend.git
echo.

cd /d "%~dp0"

echo Current git status:
git status
echo.

set /p message="Enter commit message: "
if "%message%"=="" (
    echo Error: Commit message cannot be empty
    pause
    exit /b 1
)

echo.
echo Adding all changes...
git add .

echo Committing with message: "%message%"
git commit -m "%message%"

echo.
echo Pushing to origin...
git push origin main

echo.
echo ✅ Frontend changes pushed successfully!
pause
