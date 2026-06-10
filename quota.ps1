# Antigravity AI Quota Dashboard Connector

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Antigravity AI Quota Dashboard Connector" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$address = $env:ANTIGRAVITY_LS_ADDRESS

if (-not $address) {
    Write-Host "[Info] Port search in progress..." -ForegroundColor Yellow
    $proc = Get-Process language_server -ErrorAction SilentlyContinue
    if ($proc) {
        $procPid = $proc.Id
        $conn = Get-NetTCPConnection -State Listen | Where-Object { $_.OwningProcess -eq $procPid } | Select-Object -First 1
        if ($conn) {
            $address = "localhost:$($conn.LocalPort)"
            Write-Host "[Success] Found active agent port: $address" -ForegroundColor Green
        }
    }
}

if ($address) {
    $dashboardUrl = "http://$address/"
    Write-Host "[Redirect] Connecting to: $dashboardUrl" -ForegroundColor Cyan
    Write-Host "[Tip] Check your live AI token usage & quota status on the dashboard." -ForegroundColor White
    Start-Process $dashboardUrl
} else {
    Write-Host "[Error] language_server process is not running." -ForegroundColor Red
    Write-Host "[Help] Please start Antigravity IDE or run launch script first:" -ForegroundColor Yellow
    Write-Host "  Command: .\launch_antigravity_debug.ps1" -ForegroundColor Yellow
}
Write-Host ""
