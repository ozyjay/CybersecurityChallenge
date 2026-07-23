[CmdletBinding(SupportsShouldProcess = $true)]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$requestedWhatIf = $WhatIfPreference
try {
  $WhatIfPreference = $false
  Import-Module CimCmdlets
  Import-Module NetTCPIP
} finally {
  $WhatIfPreference = $requestedWhatIf
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$listeners = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue)
if ($listeners.Count -eq 0) {
  Write-Host "No listening TCP servers were found." -ForegroundColor Yellow
  return
}

$expectedVitePath = Join-Path $projectRoot "node_modules\vite\bin\vite.js"
$processIds = @($listeners.OwningProcess | Sort-Object -Unique)
$projectServers = @(
  foreach ($processId in $processIds) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    if (
      $null -ne $process -and
      -not [string]::IsNullOrWhiteSpace($process.CommandLine) -and
      $process.CommandLine.IndexOf($expectedVitePath, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    ) {
      [PSCustomObject]@{
        Process = $process
        Ports = @($listeners | Where-Object OwningProcess -eq $processId | Select-Object -ExpandProperty LocalPort -Unique | Sort-Object)
      }
    }
  }
)

if ($projectServers.Count -eq 0) {
  Write-Host "No running Vite servers belong to this demo." -ForegroundColor Yellow
  return
}

$stoppedProcessIds = @()
$stoppedPorts = @()
foreach ($server in $projectServers) {
  $portList = $server.Ports -join ", "
  $processId = $server.Process.ProcessId
  if ($PSCmdlet.ShouldProcess("process $processId listening on port(s) $portList", "Stop this demo's Vite server")) {
    Stop-Process -Id $processId -ErrorAction Stop
    $stoppedProcessIds += $processId
    $stoppedPorts += $server.Ports
  }
}

if ($stoppedProcessIds.Count -eq 0) {
  return
}

$deadline = [DateTime]::UtcNow.AddSeconds(5)
do {
  Start-Sleep -Milliseconds 100
  $remainingListeners = @(
    Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
      Where-Object OwningProcess -in $stoppedProcessIds
  )
} while ($remainingListeners.Count -gt 0 -and [DateTime]::UtcNow -lt $deadline)

if ($remainingListeners.Count -gt 0) {
  throw "One or more demo server processes did not release their listeners."
}

$uniquePorts = @($stoppedPorts | Sort-Object -Unique)
Write-Host "Stopped this demo's Vite server(s) on port(s): $($uniquePorts -join ', ')." -ForegroundColor Green
