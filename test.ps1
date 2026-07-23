[CmdletBinding()]
param(
  [ValidateRange(1024, 65535)]
  [int]$E2EPort = 4174,

  [ValidateScript({ $_ -ge 0 })]
  [double]$BurnInMinutes = 0
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "scripts\powershell-tools.ps1")

Push-Location $PSScriptRoot
try {
  $env:E2E_PORT = [string]$E2EPort

  Invoke-NpmCommand -Label "Validate scenario safety" -Arguments @("run", "validate:scenarios")
  Invoke-NpmCommand -Label "Run unit and component tests" -Arguments @("test")
  Invoke-NpmCommand -Label "Build the production bundle" -Arguments @("run", "build")
  Invoke-NpmCommand -Label "Run production-browser journeys" -Arguments @("run", "test:e2e")

  if ($BurnInMinutes -gt 0) {
    $env:BURN_IN_MINUTES = $BurnInMinutes.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    Invoke-NpmCommand -Label "Run the timed production burn-in" -Arguments @("run", "test:burn-in")
  }

  Write-Host ""
  Write-Host "All requested checks passed." -ForegroundColor Green
} finally {
  Pop-Location
}
