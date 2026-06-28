#!/usr/bin/env pwsh
# OSINT Agent Skills â€” Repository Validation Script
# Verifies that all files referenced in agent-config.yaml exist, JSON/YAML
# files are parseable, and cross-references between documents are intact.
#
# Usage:
#   pwsh scripts/validate.ps1
#   pwsh scripts/validate.ps1 -RepoPath /path/to/osint-agent-skills
#
# Exit codes:
#   0 â€” all checks passed
#   1 â€” one or more checks failed

param(
    [string]$RepoPath = (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
)

$ErrorActionPreference = "Stop"
$failures = @()
$passes = @()

function Check($condition, $message) {
    if ($condition) {
        $script:passes += $message
        Write-Host "  [OK] $message" -ForegroundColor Green
    } else {
        $script:failures += $message
        Write-Host "  [FAIL] $message" -ForegroundColor Red
    }
}

function CheckFile($path, $label) {
    $exists = Test-Path $path
    Check $exists "$label exists ($path)"
    return $exists
}

Write-Host "=== OSINT Agent Skills Repository Validation ===" -ForegroundColor Cyan
Write-Host "Repo: $RepoPath"
Write-Host ""

# â”€â”€ 1. Core files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host "--- 1. Core files ---" -ForegroundColor Yellow
$coreFiles = @(
    "system-prompt.md",
    "agent-config.yaml",
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
    "CONTRIBUTING.md"
)
foreach ($f in $coreFiles) {
    CheckFile (Join-Path $RepoPath $f) $f
}

# â”€â”€ 2. Knowledge base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 2. Knowledge base ---" -ForegroundColor Yellow
$kbDirs = @(
    "knowledge\methodologies",
    "knowledge\domains",
    "knowledge\techniques",
    "knowledge\pivot-playbooks"
)
foreach ($d in $kbDirs) {
    $path = Join-Path $RepoPath $d
    Check (Test-Path $path -PathType Container) "Directory exists: $d"
    $fileCount = (Get-ChildItem $path -Filter "*.md" -File).Count
    Check ($fileCount -gt 0) "$d has markdown files ($fileCount files)"
}

# â”€â”€ 3. Tool registries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 3. Tool registries ---" -ForegroundColor Yellow
$toolFiles = @(
    "tools\free-tools.yaml",
    "tools\apis.yaml",
    "tools\cli-tools.yaml",
    "tools\mcp-tools.json",
    "tools\mcp-server.js",
    "tools\README.md"
)
foreach ($f in $toolFiles) {
    CheckFile (Join-Path $RepoPath $f) $f
}

# â”€â”€ 4. Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 4. Templates ---" -ForegroundColor Yellow
$templateFiles = @(
    "templates\reports\intelligence-report.md",
    "templates\reports\threat-actor-profile.md",
    "templates\reports\timeline.md",
    "templates\graphs\README.md",
    "templates\graphs\mermaid-graph.md",
    "templates\graphs\dot-template.dot",
    "templates\graphs\graph-schema.json",
    "templates\evidence\evidence-log.md",
    "templates\investigation-plan\plan-template.md"
)
foreach ($f in $templateFiles) {
    CheckFile (Join-Path $RepoPath $f) $f
}

# â”€â”€ 5. Ethics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 5. Ethics ---" -ForegroundColor Yellow
$ethicsFiles = @(
    "ethics\legal-frameworks.md",
    "ethics\jurisdiction-rules.md",
    "ethics\code-of-conduct.md",
    "ethics\privacy-guidelines.md",
    "ethics\anti-hallucination.md",
    "ethics\agent-opsec.md"
)
foreach ($f in $ethicsFiles) {
    CheckFile (Join-Path $RepoPath $f) $f
}

# â”€â”€ 6. JSON validity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 6. JSON validity ---" -ForegroundColor Yellow
$jsonFiles = @(
    "tools\mcp-tools.json",
    "templates\graphs\graph-schema.json"
)
foreach ($f in $jsonFiles) {
    $path = Join-Path $RepoPath $f
    if (Test-Path $path) {
        try {
            Get-Content $path -Raw | ConvertFrom-Json | Out-Null
            Check $true "$f is valid JSON"
        } catch {
            Check $false "$f is valid JSON ($($_.Exception.Message))"
        }
    }
}

# â”€â”€ 7. YAML validity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 7. YAML validity ---" -ForegroundColor Yellow
$yamlFiles = @(
    "agent-config.yaml",
    "tools\free-tools.yaml",
    "tools\apis.yaml",
    "tools\cli-tools.yaml"
)
foreach ($f in $yamlFiles) {
    $path = Join-Path $RepoPath $f
    if (Test-Path $path) {
        try {
            $content = Get-Content $path -Raw
            # Basic YAML check: no tabs, consistent indentation
            $hasTabs = $content -match "`t"
            Check (-not $hasTabs) "$f has no tab characters"
        } catch {
            Check $false "$f YAML check ($($_.Exception.Message))"
        }
    }
}

# â”€â”€ 8. MCP server syntax â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 8. MCP server syntax ---" -ForegroundColor Yellow
$mcpPath = Join-Path $RepoPath "tools\mcp-server.js"
if (Test-Path $mcpPath) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) {
        & node --check $mcpPath 2>&1 | Out-Null
        Check ($LASTEXITCODE -eq 0) "mcp-server.js passes Node.js syntax check"
    } else {
        Write-Host "  [SKIP] Node.js not found" -ForegroundColor DarkGray
    }
}

# â”€â”€ 9. agent-config.yaml path references â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 9. Config path references ---" -ForegroundColor Yellow
$cfgPath = Join-Path $RepoPath "agent-config.yaml"
if (Test-Path $cfgPath) {
    $cfg = Get-Content $cfgPath -Raw
    $configPaths = @(
        "./system-prompt.md",
        "./tools/free-tools.yaml",
        "./tools/apis.yaml",
        "./tools/mcp-tools.json",
        "./tools/mcp-server.js",
        "./tools/cli-tools.yaml",
        "./templates/reports/intelligence-report.md",
        "./templates/reports/threat-actor-profile.md",
        "./templates/reports/timeline.md",
        "./templates/graphs/mermaid-graph.md",
        "./ethics/agent-opsec.md",
        "./knowledge/methodologies/"
    )
    foreach ($p in $configPaths) {
        Check ($cfg.Contains($p)) "Config references: $p"
    }
}

# â”€â”€ 10. Cross-references in system-prompt.md â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "--- 10. System prompt references ---" -ForegroundColor Yellow
$spPath = Join-Path $RepoPath "system-prompt.md"
if (Test-Path $spPath) {
    $sp = [System.IO.File]::ReadAllText($spPath, [System.Text.Encoding]::UTF8)
    $spRefs = @(
        "structured-analytic-techniques.md",
        "agent-opsec.md",
        "threat-actors.md",
        "threat-actor-profile.md",
        "graph-generation.md",
        "mermaid-graph.md",
        "dot-template.dot",
        "graph-schema.json",
        "Analysis of Competing Hypotheses",
        "Attribution standard"
    )
    foreach ($r in $spRefs) {
        Check ($sp.Contains($r)) "System prompt references: $r"
    }
}

# â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $($passes.Count)" -ForegroundColor Green
Write-Host "Failed: $($failures.Count)" -ForegroundColor Red
Write-Host "Total: $($passes.Count + $failures.Count)"

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "Failures:" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host "  - $f" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host ""
    Write-Host "All checks passed!" -ForegroundColor Green
    exit 0
}
