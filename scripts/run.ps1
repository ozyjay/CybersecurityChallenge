[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(1024, 65535)]
  [int]$AppPort,

  [ValidateNotNullOrEmpty()]
  [string]$AppHost = "127.0.0.1",

  [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot "powershell-tools.ps1")

Push-Location $projectRoot
try {
  $env:APP_HOST = $AppHost
  $env:APP_PORT = [string]$AppPort

  if (-not $SkipBuild) {
    Invoke-NpmCommand -Label "Build the production bundle" -Arguments @("run", "build")
  }

  Write-Host ""
  Write-Host "Starting the production build at http://${AppHost}:$AppPort" -ForegroundColor Cyan
  Write-Host "Press Ctrl+C to stop."
  Invoke-NpmCommand -Label "Serve dist" -Arguments @("run", "preview")
} finally {
  Pop-Location
}
