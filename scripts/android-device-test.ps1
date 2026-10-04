[CmdletBinding()]
param(
  [string]$ApkPath,
  [string]$AdbPath,
  [string]$ExpectedSha256 = '45B2E3AAAE4D27338FF831ABFE009D54D00AE15861DF6DEA942C620A412FFDC9',
  [switch]$SkipInstall,
  [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'
$packageName = 'com.blindly.app'
$repoRoot = Split-Path -Parent $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($ApkPath)) {
  $ApkPath = Join-Path $repoRoot 'release\Blindly-1.0.0-preview.apk'
}

function Resolve-AdbPath {
  param([string]$ExplicitPath)

  $candidates = [System.Collections.Generic.List[string]]::new()
  if (-not [string]::IsNullOrWhiteSpace($ExplicitPath)) {
    $candidates.Add($ExplicitPath)
  }
  if (-not [string]::IsNullOrWhiteSpace($env:BLINDLY_ADB_PATH)) {
    $candidates.Add($env:BLINDLY_ADB_PATH)
  }

  $command = Get-Command adb -ErrorAction SilentlyContinue
  if ($null -ne $command) {
    $candidates.Add($command.Source)
  }

  $candidates.Add((Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'))

  $toolsRoot = Split-Path -Parent $repoRoot
  Get-ChildItem -LiteralPath $toolsRoot -Directory -Filter 'android-platform-tools-*' -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    ForEach-Object {
      $candidates.Add((Join-Path $_.FullName 'platform-tools\adb.exe'))
    }

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      return (Resolve-Path -LiteralPath $candidate).Path
    }
  }

  throw 'No se encontró adb.exe. Definí BLINDLY_ADB_PATH o pasá -AdbPath con la ruta completa.'
}

function Invoke-Adb {
  param(
    [Parameter(Mandatory)] [string[]]$Arguments,
    [switch]$AllowFailure
  )

  & $script:resolvedAdb @Arguments
  if (-not $AllowFailure -and $LASTEXITCODE -ne 0) {
    throw "ADB terminó con código ${LASTEXITCODE}: $($Arguments -join ' ')"
  }
}

if (-not (Test-Path -LiteralPath $ApkPath -PathType Leaf)) {
  throw "No se encontró el APK: $ApkPath"
}

$resolvedApk = (Resolve-Path -LiteralPath $ApkPath).Path
$actualSha256 = (Get-FileHash -LiteralPath $resolvedApk -Algorithm SHA256).Hash.ToUpperInvariant()
if ($actualSha256 -ne $ExpectedSha256.ToUpperInvariant()) {
  throw "El APK no coincide con la build aprobada. Esperado: $ExpectedSha256. Obtenido: $actualSha256."
}

$script:resolvedAdb = Resolve-AdbPath -ExplicitPath $AdbPath
Write-Host "APK verificado: $resolvedApk"
Write-Host "SHA-256: $actualSha256"
Write-Host "ADB: $script:resolvedAdb"
Invoke-Adb -Arguments @('version')

if ($ValidateOnly) {
  Write-Host 'Validación local completada. No se buscó ni modificó ningún dispositivo.'
  exit 0
}

Invoke-Adb -Arguments @('start-server')
$deviceOutput = & $script:resolvedAdb devices -l
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo consultar la lista de dispositivos ADB.'
}

$deviceRows = @(
  $deviceOutput |
    Select-Object -Skip 1 |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
)

$unauthorized = @($deviceRows | Where-Object { $_ -match '\sunauthorized(?:\s|$)' })
if ($unauthorized.Count -gt 0) {
  throw 'El teléfono todavía no autorizó esta PC. Desbloquealo y aceptá la huella RSA de depuración USB.'
}

$devices = @($deviceRows | Where-Object { $_ -match '\sdevice(?:\s|$)' })
if ($devices.Count -eq 0) {
  throw 'No hay ningún Android autorizado. Conectá uno por USB y activá Depuración USB.'
}
if ($devices.Count -gt 1) {
  throw 'Hay más de un Android autorizado. Dejá conectado solamente el dispositivo que querés probar.'
}

$serial = ($devices[0] -split '\s+')[0]
Write-Host "Dispositivo: $($devices[0])"

if (-not $SkipInstall) {
  Invoke-Adb -Arguments @('-s', $serial, 'install', '-r', $resolvedApk)
}

Invoke-Adb -Arguments @('-s', $serial, 'shell', 'monkey', '-p', $packageName, '-c', 'android.intent.category.LAUNCHER', '1')
Start-Sleep -Seconds 4

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$evidenceRoot = Join-Path $repoRoot 'release\device-tests'
$evidenceDir = Join-Path $evidenceRoot $timestamp
New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null

$remoteScreenshot = '/sdcard/blindly-verificacion.png'
Invoke-Adb -Arguments @('-s', $serial, 'shell', 'screencap', '-p', $remoteScreenshot)
Invoke-Adb -Arguments @('-s', $serial, 'pull', $remoteScreenshot, (Join-Path $evidenceDir 'inicio.png'))
Invoke-Adb -Arguments @('-s', $serial, 'shell', 'rm', $remoteScreenshot)

$properties = [ordered]@{
  Timestamp = (Get-Date).ToString('o')
  Serial = $serial
  Manufacturer = ((& $script:resolvedAdb -s $serial shell getprop ro.product.manufacturer) -join '').Trim()
  Model = ((& $script:resolvedAdb -s $serial shell getprop ro.product.model) -join '').Trim()
  Android = ((& $script:resolvedAdb -s $serial shell getprop ro.build.version.release) -join '').Trim()
  Api = ((& $script:resolvedAdb -s $serial shell getprop ro.build.version.sdk) -join '').Trim()
  Resolution = ((& $script:resolvedAdb -s $serial shell wm size) -join ' ').Trim()
  Density = ((& $script:resolvedAdb -s $serial shell wm density) -join ' ').Trim()
  ApkSha256 = $actualSha256
}

$packageInfo = & $script:resolvedAdb -s $serial shell dumpsys package $packageName |
  Select-String -Pattern 'versionName=|versionCode=' |
  ForEach-Object { $_.Line.Trim() }

$properties.GetEnumerator() | ForEach-Object { "{0}: {1}" -f $_.Key, $_.Value } |
  Set-Content -LiteralPath (Join-Path $evidenceDir 'dispositivo.txt') -Encoding utf8
$packageInfo | Add-Content -LiteralPath (Join-Path $evidenceDir 'dispositivo.txt') -Encoding utf8

Write-Host "Blindly quedó instalado y abierto. Evidencia guardada en: $evidenceDir"
Write-Host 'Continuá con la matriz de docs/prueba-fisica.md en tres teléfonos.'
