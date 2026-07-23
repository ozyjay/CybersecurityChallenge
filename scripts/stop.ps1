[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(1024, 65535)]
  [int]$AppPort
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$listeners = @(Get-NetTCPConnection -LocalPort $AppPort -State Listen -ErrorAction SilentlyContinue)
if ($listeners.Count -eq 0) {
  Write-Host "No server is listening on port $AppPort." -ForegroundColor Yellow
  exit 0
}

$expectedVitePath = Join-Path $projectRoot "node_modules\vite\bin\vite.js"
$processIds = @($listeners.OwningProcess | Sort-Object -Unique)
$verifiedProcesses = foreach ($processId in $processIds) {
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
  if (
    $null -eq $process -or
    [string]::IsNullOrWhiteSpace($process.CommandLine) -or
    $process.CommandLine.IndexOf($expectedVitePath, [System.StringComparison]::OrdinalIgnoreCase) -lt 0
  ) {
    throw "Port $AppPort is owned by process $processId, which is not this project's Vite server. Nothing was stopped."
  }
  $process
}

$stoppedProcessCount = 0
foreach ($process in $verifiedProcesses) {
  if ($PSCmdlet.ShouldProcess("process $($process.ProcessId) on port $AppPort", "Stop this project's Vite server")) {
    Stop-Process -Id $process.ProcessId -ErrorAction Stop
    $stoppedProcessCount += 1
  }
}

if ($stoppedProcessCount -eq 0) {
  exit 0
}

$deadline = [DateTime]::UtcNow.AddSeconds(5)
do {
  Start-Sleep -Milliseconds 100
  $remainingListeners = @(Get-NetTCPConnection -LocalPort $AppPort -State Listen -ErrorAction SilentlyContinue)
} while ($remainingListeners.Count -gt 0 -and [DateTime]::UtcNow -lt $deadline)

if ($remainingListeners.Count -gt 0) {
  throw "The project server was stopped, but port $AppPort is still occupied."
}

Write-Host "Stopped the project server on port $AppPort." -ForegroundColor Green
