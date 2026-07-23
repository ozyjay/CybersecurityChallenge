function Invoke-NpmCommand {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$Label,

    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $npmExecutable = if ($env:OS -eq "Windows_NT") { "npm.cmd" } else { "npm" }
  if (-not (Get-Command $npmExecutable -ErrorAction SilentlyContinue)) {
    throw "npm is unavailable. Install the supported Node.js release before continuing."
  }

  Write-Host ""
  Write-Host "==> $Label" -ForegroundColor Cyan
  & $npmExecutable @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE."
  }
}
