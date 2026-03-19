@echo off
setlocal
echo ======================================================
echo   Antigravity Auto-Accept Launcher (Debug Mode)
echo ======================================================
echo.
echo [1] Closing existing Chrome processes...
taskkill /F /IM chrome.exe /T >nul 2>&1

echo [2] Launching Chrome with Remote Debugging (Port 9000)...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9000 --user-data-dir="%LOCALAPPDATA%\Google\Chrome\User Data\AntigravityDebug" --no-first-run --no-default-browser-check

echo.
echo ✔ Chrome has been launched in Debug Mode.
echo ✔ Port 9000 is now active for Auto-Accept.
echo.
echo [Action Required]
echo 1. Go back to the 'Antigravity Auto Accept Control Panel'.
echo 2. Click the 'Refresh' button.
echo 3. Verify 'CDP CONNECTED' changes to 'YES'.
echo.
pause
