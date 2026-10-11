# Cargar con dot sourcing: . .\scripts\entorno-local.ps1
[CmdletBinding()]
param([string]$WorkspaceRoot = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath($WorkspaceRoot)
$sdk = Join-Path $workspace 'herramientas\android-sdk'
$java = Join-Path $workspace 'herramientas\java17\jdk-17.0.20.1+1'
if (-not (Test-Path -LiteralPath (Join-Path $sdk 'platforms\android-36\android.jar'))) { throw "Falta Android SDK 36 en $sdk" }
if (-not (Test-Path -LiteralPath (Join-Path $java 'bin\java.exe'))) { throw "Falta Java 17 en $java" }
$env:JAVA_HOME = $java
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:ANDROID_AVD_HOME = Join-Path $workspace 'pruebas\avd'
$env:GRADLE_USER_HOME = Join-Path $workspace 'cache\gradle'
$env:npm_config_cache = Join-Path $workspace 'cache\npm'
$env:TEMP = Join-Path $workspace 'cache\temp'
$env:TMP = $env:TEMP
foreach ($folder in @($env:GRADLE_USER_HOME, $env:npm_config_cache, $env:TEMP, $env:ANDROID_AVD_HOME)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}
$env:Path = "$java\bin;$sdk\platform-tools;$sdk\emulator;$sdk\cmdline-tools\latest\bin;$env:Path"
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
