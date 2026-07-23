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

function Get-DemoNodeExecutable {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot
  )

  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($null -eq $nodeCommand) {
    throw "node.exe is unavailable. Run scripts\setup.ps1 before starting the demo."
  }

  $sourcePath = $nodeCommand.Source
  $runtimeDirectory = Join-Path $ProjectRoot ".demo-runtime"
  $destinationPath = Join-Path $runtimeDirectory "node.exe"
  $sourceFile = Get-Item -LiteralPath $sourcePath
  $copyRequired = -not (Test-Path -LiteralPath $destinationPath)

  if (-not $copyRequired) {
    $destinationFile = Get-Item -LiteralPath $destinationPath
    $copyRequired = (
      $destinationFile.Length -ne $sourceFile.Length -or
      $destinationFile.VersionInfo.FileVersion -ne $sourceFile.VersionInfo.FileVersion
    )
  }

  if ($copyRequired) {
    New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
  }

  return (Resolve-Path -LiteralPath $destinationPath).Path
}
