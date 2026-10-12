[CmdletBinding()]
param(
  [Parameter(Mandatory)] [string]$SdkRoot,
  [Parameter(Mandatory)] [string]$JavaHome,
  [Parameter(Mandatory)] [ValidateRange(1,2147483647)] [int]$VersionCode,
  [switch]$PlayBilling,
  [switch]$PlusDemo,
  [ValidateSet('arm64-v8a','armeabi-v7a,arm64-v8a','armeabi-v7a,arm64-v8a,x86,x86_64')]
  [string]$Architectures = 'armeabi-v7a,arm64-v8a,x86,x86_64'
)
$ErrorActionPreference = 'Stop'
if ($PlusDemo -and $PlayBilling) { throw 'Plus Demo y PlayBilling son modos separados.' }
$repo = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repo
if (-not (Test-Path -LiteralPath "$SdkRoot/platforms/android-36/android.jar")) { throw 'Falta Android SDK platform 36.' }
if (-not (Test-Path -LiteralPath "$JavaHome/bin/java.exe")) { throw 'JavaHome no contiene Java.' }
$credentialsPath = Join-Path $repo 'credentials.json'
if (-not (Test-Path -LiteralPath $credentialsPath)) { throw 'Descargá la firma existente con eas credentials -p android > credentials.json > Download. No crees otra firma.' }
$credentials = Get-Content -Raw -LiteralPath $credentialsPath | ConvertFrom-Json
$keyPath = Join-Path $repo $credentials.android.keystore.keystorePath
if (-not (Test-Path -LiteralPath $keyPath)) { throw 'Falta el keystore indicado en credentials.json.' }
& git check-ignore --quiet -- $credentialsPath
if ($LASTEXITCODE -ne 0) { throw 'credentials.json debe estar excluido de Git.' }
& git check-ignore --quiet -- $keyPath
if ($LASTEXITCODE -ne 0) { throw 'El keystore debe estar excluido de Git.' }

$env:JAVA_HOME = (Resolve-Path -LiteralPath $JavaHome).Path
$env:ANDROID_HOME = (Resolve-Path -LiteralPath $SdkRoot).Path
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:EXPO_PUBLIC_PLUS_READY = 'false'
$env:BLINDLY_BUILD_VARIANT = if ($PlusDemo) { 'plus-demo' } else { '' }
if ($PlayBilling) {
  if ($env:EXPO_PUBLIC_REVENUECAT_ANDROID_KEY -notmatch '^goog_.+') { throw 'PlayBilling requiere la clave pública Android goog_ en el entorno. No uses Test Store ni una clave secreta.' }
  $env:EXPO_PUBLIC_PLUS_READY = 'true'
}
$env:EXPO_PUBLIC_PUSH_READY = 'false'
$env:EXPO_PUBLIC_EMAIL_AUTH_READY = 'false'
$env:NODE_ENV = 'production'
# Prebuild puede cambiar scripts de npm. Se preserva exactamente package.json.
$packagePath = Join-Path $repo 'package.json'
$packageBefore = [IO.File]::ReadAllText($packagePath)
try {
  & npx expo prebuild --platform android --no-install --no-clean
  if ($LASTEXITCODE -ne 0) { throw 'Expo prebuild falló.' }
} finally { [IO.File]::WriteAllText($packagePath,$packageBefore) }

# SingleTop se conserva; Expo no reescribe sus schemes automáticamente.
# Normalizar primero permite volver de Demo a la aplicación habitual.
$manifestPath = Join-Path $repo 'android/app/src/main/AndroidManifest.xml'
$manifest = [IO.File]::ReadAllText($manifestPath).Replace('android:scheme="blindly-plus-demo"', 'android:scheme="blindly"').Replace('android:scheme="exp+blindly-plus-demo"', 'android:scheme="exp+blindly"')
if ($PlusDemo) {
  $manifest = $manifest.Replace('android:scheme="blindly"', 'android:scheme="blindly-plus-demo"').Replace('android:scheme="exp+blindly"', 'android:scheme="exp+blindly-plus-demo"')
}
[IO.File]::WriteAllText($manifestPath, $manifest)

$gradlePath = Join-Path $repo 'android/app/build.gradle'
$gradle = [IO.File]::ReadAllText($gradlePath)
$gradle = $gradle -replace 'versionCode \d+', "versionCode $VersionCode"
$signing = @'
    signingConfigs {
        release {
            def signing = new groovy.json.JsonSlurper().parse(new File(rootDir.parentFile, 'credentials.json')).android.keystore
            storeFile new File(rootDir.parentFile, signing.keystorePath)
            storePassword signing.keystorePassword
            keyAlias signing.keyAlias
            keyPassword signing.keyPassword
        }
'@
if ($gradle -notmatch 'def signing = new groovy.json.JsonSlurper') {
  $gradle = $gradle.Replace('    signingConfigs {',$signing)
}
# Reemplaza sólo la firma de release; debug conserva su keystore de desarrollo.
$gradle = $gradle.Replace("signingConfig signingConfigs.debug`n            def enableShrinkResources", "signingConfig signingConfigs.release`n            def enableShrinkResources")
$gradle = $gradle.Replace("signingConfig signingConfigs.debug`r`n            def enableShrinkResources", "signingConfig signingConfigs.release`r`n            def enableShrinkResources")
if ($gradle -notmatch 'signingConfig signingConfigs.release') { throw 'La plantilla de firma cambió: revisar antes de compilar.' }
[IO.File]::WriteAllText($gradlePath,$gradle)

Push-Location (Join-Path $repo 'android')
try {
  [string[]]$tasks = if ($PlusDemo) { @('app:assembleRelease') } else { @('app:assembleRelease', 'app:bundleRelease') }
  & .\gradlew.bat @tasks --no-daemon --max-workers=2 "-PreactNativeArchitectures=$Architectures"
  if ($LASTEXITCODE -ne 0) { throw 'Gradle falló. No se publica un artefacto incompleto.' }
} finally { Pop-Location }
$output = Join-Path $repo 'release'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$nombre = if ($PlusDemo) { "Blindly-plus-demo-v$VersionCode" } else { "Blindly-metas40-v$VersionCode" }
Copy-Item -LiteralPath (Join-Path $repo 'android/app/build/outputs/apk/release/app-release.apk') -Destination (Join-Path $output "$nombre.apk")
Get-FileHash -LiteralPath (Join-Path $output "$nombre.apk") -Algorithm SHA256
if (-not $PlusDemo) {
  Copy-Item -LiteralPath (Join-Path $repo 'android/app/build/outputs/bundle/release/app-release.aab') -Destination (Join-Path $output "$nombre.aab")
  Get-FileHash -LiteralPath (Join-Path $output "$nombre.aab") -Algorithm SHA256
}
