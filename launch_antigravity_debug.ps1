# Antigravity Auto-Accept Launcher (PowerShell)
# This script launches Chrome with remote debugging on port 9000

$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$DebugPort = 9000
$UserDataDir = "$env:LOCALAPPDATA\Google\Chrome\User Data\AntigravityDebug"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Antigravity Auto-Accept Launcher (Debug Mode)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kill existing Chrome processes
Write-Host "[1] Closing existing Chrome processes..." -ForegroundColor Yellow
Stop-Process -Name chrome -ErrorAction SilentlyContinue

# 2. Start Chrome
Write-Host "[2] Launching Chrome with Remote Debugging (Port $DebugPort)..." -ForegroundColor Yellow
$Args = @(
    "--remote-debugging-port=$DebugPort",
    "--user-data-dir=$UserDataDir",
    "--no-first-run",
    "--no-default-browser-check"
)

Start-Process -FilePath $ChromePath -ArgumentList $Args

Write-Host ""
Write-Host "✔ Chrome has been launched in Debug Mode." -ForegroundColor Green
Write-Host "✔ Port $DebugPort is now active for Auto-Accept." -ForegroundColor Green
Write-Host ""
Write-Host "[Action Required]" -ForegroundColor White
Write-Host "1. Go back to the 'Antigravity Auto Accept Control Panel'." -ForegroundColor White
Write-Host "2. Click the 'Refresh' button." -ForegroundColor White
Write-Host "3. Verify 'CDP CONNECTED' changes to 'YES'." -ForegroundColor White
Write-Host ""
