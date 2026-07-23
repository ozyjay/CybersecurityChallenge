[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("Enable", "Disable", "Status")]
  [string]$Action,

  [Parameter(Mandatory = $true)]
  [ValidateRange(1024, 65535)]
  [int]$AppPort,

  [Parameter(DontShow = $true)]
  [string]$ResultPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$hotspotAddress = "192.168.137.1"
$hotspotSubnet = "192.168.137.0/24"
$ruleName = "Cybersecurity Challenge Demo - Hotspot TCP $AppPort"
$projectRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot "powershell-tools.ps1")
$nodePath = Join-Path $projectRoot ".demo-runtime\node.exe"
if ($Action -eq "Enable") {
  $nodePath = Get-DemoNodeExecutable -ProjectRoot $projectRoot
}

function Test-IsAdministrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-ManagedRule {
  return @(Get-NetFirewallRule -ErrorAction Stop | Where-Object DisplayName -EQ $ruleName)
}

function Get-ManagedRuleDetails {
  $rules = @(Get-ManagedRule)
  $details = @()

  foreach ($rule in $rules) {
    $portFilter = $rule | Get-NetFirewallPortFilter
    $addressFilter = $rule | Get-NetFirewallAddressFilter
    $applicationFilter = $rule | Get-NetFirewallApplicationFilter
    $details += [PSCustomObject]@{
      DisplayName = $rule.DisplayName
      Enabled = $rule.Enabled
      Action = $rule.Action
      Profile = $rule.Profile
      EdgeTraversalPolicy = $rule.EdgeTraversalPolicy
      Protocol = $portFilter.Protocol
      LocalPort = $portFilter.LocalPort
      LocalAddress = $addressFilter.LocalAddress -join ", "
      RemoteAddress = $addressFilter.RemoteAddress -join ", "
      Program = $applicationFilter.Program
    }
  }

  return $details
}

function Show-RuleResult {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Result
  )

  if ($Result.Message) {
    $colour = if ($Result.Success) { "Yellow" } else { "Red" }
    Write-Host $Result.Message -ForegroundColor $colour
  }

  if (@($Result.Rules).Count -gt 0) {
    $Result.Rules | Format-List
  }
}

if (-not (Test-IsAdministrator)) {
  $temporaryResultPath = Join-Path `
    ([IO.Path]::GetTempPath()) `
    "cybersecurity-challenge-firewall-$([guid]::NewGuid().ToString('N')).clixml"
  $scriptPath = $MyInvocation.MyCommand.Path
  $elevatedArguments = @(
    "-NoLogo"
    "-NoProfile"
    "-ExecutionPolicy"
    "Bypass"
    "-File"
    "`"$scriptPath`""
    "-Action"
    $Action
    "-AppPort"
    $AppPort
    "-ResultPath"
    "`"$temporaryResultPath`""
  )

  try {
    Write-Host "Requesting Administrator approval for the demo firewall query or change..." -ForegroundColor Yellow
    $elevatedProcess = Start-Process `
      -FilePath "powershell.exe" `
      -Verb RunAs `
      -ArgumentList $elevatedArguments `
      -Wait `
      -PassThru

    if (-not (Test-Path -LiteralPath $temporaryResultPath)) {
      throw "The Administrator process returned no firewall result."
    }

    $result = Import-Clixml -LiteralPath $temporaryResultPath
    Show-RuleResult -Result $result
    if (-not $result.Success) {
      throw $result.Message
    }
    if ($elevatedProcess.ExitCode -ne 0) {
      throw "The Administrator firewall command failed with exit code $($elevatedProcess.ExitCode)."
    }
  } finally {
    if (Test-Path -LiteralPath $temporaryResultPath) {
      Remove-Item -LiteralPath $temporaryResultPath -Force
    }
  }

  return
}

try {
  $existingRules = @(Get-ManagedRule)
  if ($existingRules.Count -gt 1) {
    throw "More than one managed rule exists for TCP port $AppPort. Review the duplicate rules manually before continuing."
  }

  if ($Action -eq "Enable") {
    if ($existingRules.Count -eq 0) {
      if ($PSCmdlet.ShouldProcess($ruleName, "Create and enable the hotspot-only firewall rule")) {
        New-NetFirewallRule `
          -DisplayName $ruleName `
          -Description "Allows phones on the local Windows Mobile Hotspot to reach the defensive Open Day demo only." `
          -Direction Inbound `
          -Action Allow `
          -Protocol TCP `
          -LocalPort $AppPort `
          -LocalAddress $hotspotAddress `
          -RemoteAddress $hotspotSubnet `
          -Program $nodePath `
          -EdgeTraversalPolicy Allow `
          -Profile Any | Out-Null
      }
    } elseif ($PSCmdlet.ShouldProcess($ruleName, "Enable the existing hotspot-only firewall rule")) {
      $existingRules |
        Get-NetFirewallApplicationFilter |
        Set-NetFirewallApplicationFilter -Program $nodePath
      $existingRules | Set-NetFirewallRule -Enabled True -EdgeTraversalPolicy Allow
    }
  } elseif ($Action -eq "Disable" -and $existingRules.Count -gt 0) {
    if ($PSCmdlet.ShouldProcess($ruleName, "Disable the hotspot-only firewall rule")) {
      $existingRules | Disable-NetFirewallRule
    }
  }

  $details = @(Get-ManagedRuleDetails)
  $message = if ($details.Count -eq 0) {
    "No managed hotspot firewall rule exists for TCP port $AppPort."
  } else {
    $null
  }
  $result = [PSCustomObject]@{
    Success = $true
    Message = $message
    Rules = $details
  }
} catch {
  $result = [PSCustomObject]@{
    Success = $false
    Message = $_.Exception.Message
    Rules = @()
  }
}

if ($ResultPath) {
  $result | Export-Clixml -LiteralPath $ResultPath -Force
  if (-not $result.Success) {
    exit 1
  }
  return
}

Show-RuleResult -Result $result
if (-not $result.Success) {
  throw $result.Message
}
