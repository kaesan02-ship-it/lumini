# MCP Setup Script
$mcpServers = @{
    "context7" = @{
        "command" = "npx"
        "args" = @("-y", "@context7/mcp-server")
    }
    "sequential-thinking" = @{
        "command" = "npx"
        "args" = @("-y", "@modelcontextprotocol/server-sequential-thinking")
    }
    "supabase" = @{
        "command" = "npx"
        "args" = @("-y", "@modelcontextprotocol/server-supabase")
    }
    "vercel" = @{
        "command" = "npx"
        "args" = @("-y", "@modelcontextprotocol/server-vercel")
    }
}

$configPaths = New-Object System.Collections.Generic.List[string]
$configPaths.Add("$env:APPDATA\Claude\claude_desktop_config.json")
$configPaths.Add("$env:APPDATA\Antigravity\User\globalStorage\saoudrizwan.claude-dev\settings\mcp_settings.json")

$globalStoragePath = "$env:APPDATA\Antigravity\User\globalStorage"
if (Test-Path $globalStoragePath) {
    Get-ChildItem -Path $globalStoragePath -Directory | Where-Object { $_.Name -like "*claude-dev*" -or $_.Name -like "*cline*" } | ForEach-Object {
        $p = [System.IO.Path]::Combine($_.FullName, "settings", "mcp_settings.json")
        if (-not $configPaths.Contains($p)) { $configPaths.Add($p) }
    }
}

foreach ($path in $configPaths) {
    Write-Host "Processing: $path"
    $dir = Split-Path $path
    if (-not (Test-Path $dir)) { 
        New-Item -ItemType Directory -Path $dir -Force | Out-Null 
    }

    $config = @{ "mcpServers" = @{} }
    if (Test-Path $path) {
        try {
            $raw = Get-Content $path -Raw
            if ($raw) {
                $content = $raw | ConvertFrom-Json
                if ($content.mcpServers) {
                    $config.mcpServers = $content.mcpServers
                }
            }
        } catch {
            Write-Host "Failed to parse $path, starting fresh."
        }
    }

    foreach ($key in $mcpServers.Keys) {
        if (-not $config.mcpServers.$key) {
            $config.mcpServers.Add($key, $mcpServers[$key])
            Write-Host "Added $key"
        }
    }

    $json = $config | ConvertTo-Json -Depth 10
    $json | Set-Content -Path $path
}

Write-Host "Done"
