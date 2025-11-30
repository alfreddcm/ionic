@echo off
echo ========================================
echo Expense Recorder - Quick Setup
echo ========================================
echo.

echo Installing dependencies...
call npm install

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create database: expense_recorder
echo 2. Import: expense_tracker.sql
echo 3. Configure: backend\.env
echo 4. Run: npm start
echo.
echo See POST-INSTALL.md for details
echo ========================================

pause
