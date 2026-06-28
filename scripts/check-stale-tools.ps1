#!/usr/bin/env pwsh
# Check all tool registries for stale entries (last_verified > 6 months ago)
# Exit 0 = all fresh, Exit 1 = stale entries found

param(
    [string]$RepoPath = (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)),
    [int]$StaleMonths = 6
)

$staleDate = (Get-Date).AddMonths(-$StaleMonths)
$staleCount = 0
$freshCount = 0
$unverifiedCount = 0

$yamlFiles = @(
    "tools\free-tools.yaml",
    "tools\apis.yaml",
    "tools\cli-tools.yaml"
)

Write-Host "=== Tool Staleness Check ===" -ForegroundColor Cyan
Write-Host "Stale threshold: $StaleMonths months (before $($staleDate.ToString('yyyy-MM-dd')))"
Write-Host ""

foreach ($file in $yamlFiles) {
    $path = Join-Path $RepoPath $file
    if (!(Test-Path $path)) { continue }

    $content = Get-Content $path -Raw
    $toolName = ""
    $lastVerified = ""

    # Simple parse: look for - name: and last_verified: pairs
    $lines = $content -split "`n"
    $currentTool = ""
    $currentDate = ""

    foreach ($line in $lines) {
        if ($line -match '^\s*-\s*name:\s*"?(.+?)"?\s*$') {
            # New tool entry
            if ($currentTool) {
                if ($currentDate) {
                    $parsed = [datetime]::Parse($currentDate)
                    if ($parsed -lt $staleDate) {
                        $months = [math]::Floor(((Get-Date) - $parsed).TotalDays / 30)
                        Write-Host "  [STALE] $currentTool - last verified $currentDate ($months months ago)" -ForegroundColor Yellow
                        $script:staleCount++
                    } else {
                        $script:freshCount++
                    }
                } else {
                    Write-Host "  [UNVERIFIED] $currentTool - no last_verified field" -ForegroundColor DarkYellow
                    $script:unverifiedCount++
                }
            }
            $currentTool = $matches[1]
            $currentDate = ""
        }
        if ($line -match 'last_verified:\s*"?(\d{4}-\d{2}-\d{2})"?') {
            $currentDate = $matches[1]
        }
    }

    # Last tool in file
    if ($currentTool) {
        if ($currentDate) {
            $parsed = [datetime]::Parse($currentDate)
            if ($parsed -lt $staleDate) {
                $months = [math]::Floor(((Get-Date) - $parsed).TotalDays / 30)
                Write-Host "  [STALE] $currentTool - last verified $currentDate ($months months ago)" -ForegroundColor Yellow
                $script:staleCount++
            } else {
                $script:freshCount++
            }
        } else {
            Write-Host "  [UNVERIFIED] $currentTool - no last_verified field" -ForegroundColor DarkYellow
            $script:unverifiedCount++
        }
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Fresh:     $freshCount" -ForegroundColor Green
Write-Host "Stale:     $staleCount" -ForegroundColor Yellow
Write-Host "Unverified: $unverifiedCount" -ForegroundColor DarkYellow

if ($staleCount -gt 0 -or $unverifiedCount -gt 0) {
    exit 1
} else {
    Write-Host "All tools verified and fresh!" -ForegroundColor Green
    exit 0
}
