# Opus(사령관) → Codex(실행관) 디스패치 (수동 실행용 PowerShell 버전).
# 사용법: .\scripts\codex-do.ps1 <work-order.md> [report-out.md]
param(
  [Parameter(Mandatory = $true)][string]$WorkOrder,
  [string]$Out = "ops/codex/last-report.md"
)
$ErrorActionPreference = "Stop"
$repo = "C:\projects\snail_ios"

if (-not (Test-Path $WorkOrder)) { throw "work-order 파일이 없습니다: $WorkOrder" }
New-Item -ItemType Directory -Force (Split-Path $Out) | Out-Null

Write-Host ">> Codex 디스패치: $WorkOrder (model=gpt-5.5, effort=xhigh)" -ForegroundColor Cyan
Get-Content -Raw $WorkOrder |
  codex exec -C $repo -m gpt-5.5 -c model_reasoning_effort="xhigh" `
    --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -o $Out -

Write-Host "`n==== Codex 최종 보고 ($Out) ====" -ForegroundColor Cyan
Get-Content $Out
