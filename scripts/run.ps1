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

function Test-PrivateIPv4Address {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Address
  )

  $parsedAddress = $null
  if (-not [System.Net.IPAddress]::TryParse($Address, [ref]$parsedAddress)) {
    return $false
  }

  $bytes = $parsedAddress.GetAddressBytes()
  return (
    $bytes.Length -eq 4 -and (
      $bytes[0] -eq 10 -or
      ($bytes[0] -eq 172 -and $bytes[1] -ge 16 -and $bytes[1] -le 31) -or
      ($bytes[0] -eq 192 -and $bytes[1] -eq 168)
    )
  )
}

function Show-DemoAddresses {
  param(
    [Parameter(Mandatory = $true)]
    [string]$BindAddress,

    [Parameter(Mandatory = $true)]
    [int]$Port
  )

  Write-Host ""
  if ($BindAddress -in @("0.0.0.0", "::")) {
    Write-Host "Booth computer: http://127.0.0.1:$Port" -ForegroundColor Green
    $phoneAddresses = @(
      Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
          -not $_.SkipAsSource -and
          (Test-PrivateIPv4Address -Address $_.IPAddress)
        } |
        Sort-Object @{ Expression = { if ($_.InterfaceAlias -like "Local Area Connection*") { 0 } else { 1 } } }, IPAddress
    )

    if ($phoneAddresses.Count -eq 0) {
      Write-Warning "No private hotspot or LAN IPv4 address is active. Enable the hotspot, then restart this script."
    } else {
      Write-Host "Phone access (same hotspot or local network):" -ForegroundColor Green
      foreach ($address in $phoneAddresses) {
        Write-Host "  $($address.InterfaceAlias): http://$($address.IPAddress):$Port"
      }
    }
  } else {
    Write-Host "Demo address: http://${BindAddress}:$Port" -ForegroundColor Green
    if ($BindAddress -in @("127.0.0.1", "localhost")) {
      Write-Host "Phone access is disabled. Restart with -AppHost 0.0.0.0 after the hotspot is enabled." -ForegroundColor Yellow
    }
  }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot "powershell-tools.ps1")
$demoNodePath = Get-DemoNodeExecutable -ProjectRoot $projectRoot
$previewScriptPath = Join-Path $PSScriptRoot "run-preview.mjs"

Push-Location $projectRoot
try {
  $env:APP_HOST = $AppHost
  $env:APP_PORT = [string]$AppPort

  if (-not $SkipBuild) {
    Invoke-NpmCommand -Label "Build the production bundle" -Arguments @("run", "build")
  }

  Write-Host ""
  Write-Host "Starting the production build on ${AppHost}:$AppPort" -ForegroundColor Cyan
  Show-DemoAddresses -BindAddress $AppHost -Port $AppPort
  Write-Host "Demo-only Node runtime: $demoNodePath"
  Write-Host "Press Ctrl+C to stop."
  & $demoNodePath $previewScriptPath
  if ($LASTEXITCODE -ne 0) {
    throw "Serve dist failed with exit code $LASTEXITCODE."
  }
} finally {
  Pop-Location
}
