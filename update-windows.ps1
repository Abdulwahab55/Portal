#Requires -Version 5.1

[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()]
  [string]$Branch = "main",

  [ValidateRange(1, 65535)]
  [int]$Port = 3000,

  [string]$HealthUrl = "",

  [string]$ServiceName = "",

  [string]$BackupRoot = "",

  [string]$RuntimeRoot = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDirectory ".."))
$projectParent = Split-Path -Parent $projectRoot

if ([string]::IsNullOrWhiteSpace($BackupRoot)) {
  $BackupRoot = Join-Path $projectParent "bousla-backups"
}
if ([string]::IsNullOrWhiteSpace($RuntimeRoot)) {
  $RuntimeRoot = Join-Path $projectParent "bousla-runtime"
}
if ([string]::IsNullOrWhiteSpace($HealthUrl)) {
  $HealthUrl = "http://127.0.0.1:$Port/login"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDirectory = Join-Path $BackupRoot $timestamp
$transcriptPath = Join-Path $RuntimeRoot "update-$timestamp.log"
$stdoutPath = Join-Path $RuntimeRoot "server-$timestamp.out.log"
$stderrPath = Join-Path $RuntimeRoot "server-$timestamp.err.log"
$pidFile = Join-Path $RuntimeRoot "bousla-server.pid"
$lockPath = Join-Path $RuntimeRoot "update.lock"
$lockStream = $null
$transcriptStarted = $false
$serverWasRunning = $false
$serverStarted = $false
$previousCommit = ""
$updatedCommit = ""
$exitCode = 0

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Message) -ForegroundColor Cyan
}

function Require-Command {
  param([string]$Name)
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $command) {
    throw "Required command '$Name' was not found in PATH."
  }
  return $command
}

function Invoke-Native {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )
  & $FilePath @Arguments
  $nativeExitCode = $LASTEXITCODE
  if ($nativeExitCode -ne 0) {
    throw "Command failed with exit code ${nativeExitCode}: $FilePath $($Arguments -join ' ')"
  }
}

function Invoke-NativeCapture {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )
  $commandOutput = & $FilePath @Arguments 2>&1
  $nativeExitCode = $LASTEXITCODE
  if ($nativeExitCode -ne 0) {
    throw "Command failed with exit code ${nativeExitCode}: $FilePath $($Arguments -join ' ')`n$($commandOutput -join [Environment]::NewLine)"
  }
  return ($commandOutput -join [Environment]::NewLine).Trim()
}

function Get-EnvironmentValue {
  param(
    [string]$FilePath,
    [string]$Key
  )
  if (-not (Test-Path -LiteralPath $FilePath -PathType Leaf)) {
    return $null
  }
  foreach ($line in Get-Content -LiteralPath $FilePath) {
    if ($line -match ("^\s*" + [Regex]::Escape($Key) + "\s*=\s*(.*)\s*$")) {
      $value = $Matches[1].Trim()
      if ($value.Length -ge 2) {
        $first = $value.Substring(0, 1)
        $last = $value.Substring($value.Length - 1, 1)
        if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
          $value = $value.Substring(1, $value.Length - 2)
        }
      }
      return [Environment]::ExpandEnvironmentVariables($value)
    }
  }
  return $null
}

function Resolve-DataDirectory {
  $environmentPath = Join-Path $projectRoot ".env.local"
  $configuredPath = Get-EnvironmentValue -FilePath $environmentPath -Key "LOCAL_DATA_DIR"
  if ([string]::IsNullOrWhiteSpace($configuredPath)) {
    $configuredPath = ".\data"
  }
  if ([System.IO.Path]::IsPathRooted($configuredPath)) {
    return [System.IO.Path]::GetFullPath($configuredPath)
  }
  return [System.IO.Path]::GetFullPath((Join-Path $projectRoot $configuredPath))
}

function Test-PathInside {
  param(
    [string]$Candidate,
    [string]$Parent
  )
  $pathSeparators = [char[]]@(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
  )
  $candidatePath = [System.IO.Path]::GetFullPath($Candidate).TrimEnd($pathSeparators)
  $parentPath = [System.IO.Path]::GetFullPath($Parent).TrimEnd($pathSeparators)
  if ($candidatePath.Equals($parentPath, [StringComparison]::OrdinalIgnoreCase)) {
    return $true
  }
  return $candidatePath.StartsWith(
    $parentPath + [System.IO.Path]::DirectorySeparatorChar,
    [StringComparison]::OrdinalIgnoreCase
  )
}

function Stop-ProcessTree {
  param([int]$ProcessId)
  if ($ProcessId -le 0 -or $ProcessId -eq $PID) {
    throw "Refusing to stop invalid process ID $ProcessId."
  }
  $existingProcess = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
  if ($null -eq $existingProcess) {
    return
  }
  & taskkill.exe /PID $ProcessId /T /F | Out-Host
  $taskKillExitCode = $LASTEXITCODE
  if ($taskKillExitCode -ne 0 -and $null -ne (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)) {
    throw "Could not stop process tree $ProcessId. Run PowerShell as Administrator and try again."
  }
}

function Get-PortListeners {
  return @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Stop-BouslaServer {
  if (-not [string]::IsNullOrWhiteSpace($ServiceName)) {
    $service = Get-Service -Name $ServiceName -ErrorAction Stop
    if ($service.Status -ne "Stopped") {
      $script:serverWasRunning = $true
      Stop-Service -Name $ServiceName -Force -ErrorAction Stop
      $service.WaitForStatus("Stopped", [TimeSpan]::FromSeconds(30))
    }
  } else {
    if (Test-Path -LiteralPath $pidFile -PathType Leaf) {
      try {
        $pidRecord = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
        $storedPid = [int]$pidRecord.processId
        $storedProjectRoot = [string]$pidRecord.projectRoot
        $storedStartTime = [DateTime]::Parse([string]$pidRecord.startedAt).ToUniversalTime()
        $storedProcess = Get-Process -Id $storedPid -ErrorAction SilentlyContinue
        if ($null -ne $storedProcess) {
          $startTimeMatches = [Math]::Abs(($storedProcess.StartTime.ToUniversalTime() - $storedStartTime).TotalSeconds) -lt 5
          $projectMatches = $storedProjectRoot.Equals($projectRoot, [StringComparison]::OrdinalIgnoreCase)
          if ($startTimeMatches -and $projectMatches) {
            $script:serverWasRunning = $true
            Stop-ProcessTree -ProcessId $storedPid
          }
        }
      } catch {
        Write-Host "Ignoring a stale or invalid server PID file: $pidFile" -ForegroundColor Yellow
      }
      Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    }

    $listenerPids = @(Get-PortListeners | Select-Object -ExpandProperty OwningProcess -Unique)
    foreach ($listenerPidValue in $listenerPids) {
      $listenerPid = [int]$listenerPidValue
      $processDetails = Get-CimInstance Win32_Process -Filter ("ProcessId = {0}" -f $listenerPid) -ErrorAction Stop
      $commandLine = [string]$processDetails.CommandLine
      $isNode = ([string]$processDetails.Name) -match "^node(?:\.exe)?$"
      $belongsToProject = $commandLine.IndexOf($projectRoot, [StringComparison]::OrdinalIgnoreCase) -ge 0
      if (-not $isNode -or -not $belongsToProject) {
        throw "Port $Port is owned by process $listenerPid and does not belong to this Bousla checkout. Stop it manually or choose another port."
      }
      $script:serverWasRunning = $true
      Stop-ProcessTree -ProcessId $listenerPid
    }
  }

  Start-Sleep -Seconds 2
  $remainingListeners = Get-PortListeners
  if ($remainingListeners.Count -gt 0) {
    throw "Port $Port is still in use after stopping Bousla. Check for a Windows service or scheduled task that automatically restarts it."
  }
}

function Backup-LocalState {
  param([string]$DataDirectory)
  New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null

  $environmentPath = Join-Path $projectRoot ".env.local"
  if (Test-Path -LiteralPath $environmentPath -PathType Leaf) {
    Copy-Item -LiteralPath $environmentPath -Destination (Join-Path $backupDirectory ".env.local") -Force
  }
  if (Test-Path -LiteralPath $DataDirectory -PathType Container) {
    Copy-Item -LiteralPath $DataDirectory -Destination (Join-Path $backupDirectory "data") -Recurse -Force
  }
  $legacyDirectory = Join-Path $projectRoot ".wrangler"
  if (Test-Path -LiteralPath $legacyDirectory -PathType Container) {
    Copy-Item -LiteralPath $legacyDirectory -Destination (Join-Path $backupDirectory ".wrangler") -Recurse -Force
  }

  $manifest = [ordered]@{
    createdAt = (Get-Date).ToString("o")
    projectRoot = $projectRoot
    sourceCommit = $previousCommit
    dataDirectory = $DataDirectory
    environmentCopied = (Test-Path -LiteralPath (Join-Path $backupDirectory ".env.local"))
    dataCopied = (Test-Path -LiteralPath (Join-Path $backupDirectory "data"))
    legacyWranglerCopied = (Test-Path -LiteralPath (Join-Path $backupDirectory ".wrangler"))
  }
  $manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backupDirectory "backup-manifest.json") -Encoding UTF8
}

function Start-BouslaServer {
  if (-not [string]::IsNullOrWhiteSpace($ServiceName)) {
    Start-Service -Name $ServiceName -ErrorAction Stop
    $service = Get-Service -Name $ServiceName -ErrorAction Stop
    $service.WaitForStatus("Running", [TimeSpan]::FromSeconds(30))
    return $null
  }

  $npmCommand = Require-Command -Name "npm.cmd"
  $serverProcess = Start-Process `
    -FilePath $npmCommand.Source `
    -ArgumentList @("run", "start", "--", "-p", [string]$Port) `
    -WorkingDirectory $projectRoot `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -WindowStyle Hidden `
    -PassThru
  $pidRecord = [ordered]@{
    processId = $serverProcess.Id
    projectRoot = $projectRoot
    startedAt = $serverProcess.StartTime.ToUniversalTime().ToString("o")
  }
  $pidRecord | ConvertTo-Json | Set-Content -LiteralPath $pidFile -Encoding UTF8
  return $serverProcess
}

function Wait-ForHealth {
  param([System.Diagnostics.Process]$ServerProcess)
  $deadline = [DateTime]::UtcNow.AddSeconds(90)
  $lastMessage = "No response received."

  while ([DateTime]::UtcNow -lt $deadline) {
    if ($null -ne $ServerProcess) {
      $ServerProcess.Refresh()
      if ($ServerProcess.HasExited) {
        throw "The Bousla server exited before becoming healthy. Review $stderrPath."
      }
    }
    try {
      $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 5
      if ([int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 400) {
        return
      }
      $lastMessage = "HTTP $($response.StatusCode)"
    } catch {
      $lastMessage = $_.Exception.Message
    }
    Start-Sleep -Seconds 2
  }
  throw "Bousla did not become healthy at $HealthUrl within 90 seconds. Last result: $lastMessage"
}

if (Test-PathInside -Candidate $RuntimeRoot -Parent $projectRoot) {
  throw "RuntimeRoot must be outside the Git checkout: $projectRoot"
}
if (Test-PathInside -Candidate $BackupRoot -Parent $projectRoot) {
  throw "BackupRoot must be outside the Git checkout: $projectRoot"
}

New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null
New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null

try {
  $lockStream = [System.IO.File]::Open(
    $lockPath,
    [System.IO.FileMode]::OpenOrCreate,
    [System.IO.FileAccess]::ReadWrite,
    [System.IO.FileShare]::None
  )
} catch {
  throw "Another Bousla update appears to be running. If it is not, close the process holding $lockPath and retry."
}

try {
  Start-Transcript -Path $transcriptPath -Append | Out-Null
  $transcriptStarted = $true

  Write-Step "Checking prerequisites and repository state"
  Require-Command -Name "git.exe" | Out-Null
  Require-Command -Name "node.exe" | Out-Null
  Require-Command -Name "npm.cmd" | Out-Null
  Require-Command -Name "taskkill.exe" | Out-Null
  Require-Command -Name "Get-NetTCPConnection" | Out-Null

  Set-Location -LiteralPath $projectRoot
  $nodeVersionText = Invoke-NativeCapture -FilePath "node.exe" -Arguments @("-p", "process.versions.node")
  $nodeVersion = [Version]$nodeVersionText
  if ($nodeVersion -lt [Version]"22.13.0") {
    throw "Bousla requires Node.js 22.13.0 or newer. Installed version: $nodeVersionText"
  }

  $repositoryChanges = Invoke-NativeCapture -FilePath "git.exe" -Arguments @("status", "--porcelain", "--untracked-files=normal")
  if (-not [string]::IsNullOrWhiteSpace($repositoryChanges)) {
    throw "The Git working tree is not clean. Commit, discard, or move these changes before updating:`n$repositoryChanges"
  }
  $previousCommit = Invoke-NativeCapture -FilePath "git.exe" -Arguments @("rev-parse", "HEAD")

  Write-Step "Stopping Bousla on port $Port"
  Stop-BouslaServer

  $dataDirectory = Resolve-DataDirectory
  if (Test-PathInside -Candidate $backupDirectory -Parent $dataDirectory) {
    throw "The backup destination cannot be inside the application data directory: $dataDirectory"
  }
  if (Test-PathInside -Candidate $RuntimeRoot -Parent $dataDirectory) {
    throw "RuntimeRoot cannot be inside the application data directory: $dataDirectory"
  }
  Write-Step "Backing up local state to $backupDirectory"
  Backup-LocalState -DataDirectory $dataDirectory

  Write-Step "Fast-forwarding the repository to origin/$Branch"
  Invoke-Native -FilePath "git.exe" -Arguments @("fetch", "--prune", "origin")
  Invoke-Native -FilePath "git.exe" -Arguments @("switch", $Branch)
  & git.exe merge-base --is-ancestor HEAD "origin/$Branch"
  if ($LASTEXITCODE -ne 0) {
    throw "The local $Branch branch contains commits that are not in origin/$Branch. The updater will not rewrite or overwrite them."
  }
  Invoke-Native -FilePath "git.exe" -Arguments @("pull", "--ff-only", "origin", $Branch)
  $updatedCommit = Invoke-NativeCapture -FilePath "git.exe" -Arguments @("rev-parse", "HEAD")

  Write-Step "Installing locked dependencies and updating the local schema"
  Invoke-Native -FilePath "npm.cmd" -Arguments @("ci")
  Invoke-Native -FilePath "node.exe" -Arguments @("scripts/setup-local.mjs")

  Write-Step "Running ESLint"
  Invoke-Native -FilePath "npm.cmd" -Arguments @("run", "lint")

  Write-Step "Building the production application and running all tests"
  Invoke-Native -FilePath "npm.cmd" -Arguments @("test")

  $nextEnvironmentStatus = Invoke-NativeCapture -FilePath "git.exe" -Arguments @("status", "--porcelain", "--", "next-env.d.ts")
  if (-not [string]::IsNullOrWhiteSpace($nextEnvironmentStatus)) {
    Invoke-Native -FilePath "git.exe" -Arguments @("restore", "--worktree", "--", "next-env.d.ts")
  }
  $postBuildChanges = Invoke-NativeCapture -FilePath "git.exe" -Arguments @("status", "--porcelain", "--untracked-files=normal")
  if (-not [string]::IsNullOrWhiteSpace($postBuildChanges)) {
    throw "Verification left unexpected repository changes:`n$postBuildChanges"
  }

  Write-Step "Starting Bousla"
  $startedProcess = Start-BouslaServer
  Wait-ForHealth -ServerProcess $startedProcess
  $serverStarted = $true

  Write-Step "Update completed successfully"
  Write-Host "Previous commit : $previousCommit"
  Write-Host "Updated commit  : $updatedCommit"
  Write-Host "Backup          : $backupDirectory"
  Write-Host "Health URL      : $HealthUrl"
  Write-Host "Update log      : $transcriptPath"
  if ([string]::IsNullOrWhiteSpace($ServiceName)) {
    Write-Host "Server stdout   : $stdoutPath"
    Write-Host "Server stderr   : $stderrPath"
  }
} catch {
  $exitCode = 1
  Write-Host ""
  Write-Host "Bousla update failed: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Backup location: $backupDirectory" -ForegroundColor Yellow
  Write-Host "Update log: $transcriptPath" -ForegroundColor Yellow

  if ($serverWasRunning -and -not $serverStarted -and (Test-Path -LiteralPath (Join-Path $projectRoot ".next\BUILD_ID"))) {
    Write-Host "Attempting to restore service availability with the existing build..." -ForegroundColor Yellow
    try {
      $recoveryProcess = Start-BouslaServer
      Wait-ForHealth -ServerProcess $recoveryProcess
      $serverStarted = $true
      Write-Host "Bousla is responding again, but the update did not complete." -ForegroundColor Yellow
    } catch {
      Write-Host "Automatic server recovery failed: $($_.Exception.Message)" -ForegroundColor Red
    }
  }
} finally {
  if ($transcriptStarted) {
    Stop-Transcript | Out-Null
  }
  if ($null -ne $lockStream) {
    $lockStream.Dispose()
  }
  Set-Location -LiteralPath $projectRoot
}

exit $exitCode
