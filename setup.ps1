[CmdletBinding()]
param(
  [switch]$SkipBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "scripts\powershell-tools.ps1")

Push-Location $PSScriptRoot
try {
  Invoke-NpmCommand -Label "Install locked project dependencies" -Arguments @("ci")

  if (-not $SkipBrowser) {
    Invoke-NpmCommand -Label "Install Playwright-managed Chromium" -Arguments @("run", "install:browsers")
  }

  Write-Host ""
  Write-Host "Setup complete." -ForegroundColor Green
} finally {
  Pop-Location
}
