[CmdletBinding()]
param(
  [string]$AabPath,
  [string]$OutputPath,
  [string]$ExpectedSha256 = 'A496C7E80823A7B895ECD3EBA2162F6463ECEB75EFBE3DC9A74C342FAFB8E6C6'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($AabPath)) {
  $AabPath = Join-Path $repoRoot 'release\Blindly-1.0.0-playstore.aab'
}
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $repoRoot 'release\Blindly-1.0.0-play-console-package.zip'
}

if (-not (Test-Path -LiteralPath $AabPath -PathType Leaf)) {
  throw "No se encontró el AAB: $AabPath"
}

$resolvedAab = (Resolve-Path -LiteralPath $AabPath).Path
$actualAabSha256 = (Get-FileHash -LiteralPath $resolvedAab -Algorithm SHA256).Hash.ToUpperInvariant()
if ($actualAabSha256 -ne $ExpectedSha256.ToUpperInvariant()) {
  throw "El AAB no coincide con la build aprobada. Esperado: $ExpectedSha256. Obtenido: $actualAabSha256."
}

$files = @(
  [pscustomobject]@{ Source = $resolvedAab; Destination = 'bundle/Blindly-1.0.0-playstore.aab' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'assets\store\play-icon.png'); Destination = 'graficos/play-icon-512x512.png' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'assets\store\play-feature-graphic.png'); Destination = 'graficos/play-feature-graphic-1024x500.png' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'assets\store\README.md'); Destination = 'graficos/README.md' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\store-listing.md'); Destination = 'metadatos/store-listing.md' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\release-checklist.md'); Destination = 'metadatos/release-checklist.md' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\final-readiness.md'); Destination = 'metadatos/final-readiness.md' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\play-closed-test.md'); Destination = 'metadatos/play-closed-test.md' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\security-review.md'); Destination = 'metadatos/security-review.md' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\privacy.html'); Destination = 'legal/privacy.html' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\account-deletion.html'); Destination = 'legal/account-deletion.html' },
  [pscustomobject]@{ Source = (Join-Path $repoRoot 'docs\terms.html'); Destination = 'legal/terms.html' }
)

foreach ($file in $files) {
  if (-not (Test-Path -LiteralPath $file.Source -PathType Leaf)) {
    throw "Falta un archivo del paquete: $($file.Source)"
  }
}

$resolvedOutputParent = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $resolvedOutputParent -PathType Container)) {
  New-Item -ItemType Directory -Path $resolvedOutputParent -Force | Out-Null
}
if (Test-Path -LiteralPath $OutputPath -PathType Leaf) {
  [System.IO.File]::Delete($OutputPath)
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($OutputPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  $checksums = [System.Collections.Generic.List[string]]::new()

  foreach ($file in $files) {
    $entry = $archive.CreateEntry($file.Destination, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $sourceStream = [System.IO.File]::OpenRead($file.Source)
    try {
      $sourceStream.CopyTo($entryStream)
    }
    finally {
      $sourceStream.Dispose()
      $entryStream.Dispose()
    }

    $hash = (Get-FileHash -LiteralPath $file.Source -Algorithm SHA256).Hash.ToUpperInvariant()
    $length = (Get-Item -LiteralPath $file.Source).Length
    $checksums.Add("$hash  $length  $($file.Destination)")
  }

  $instructions = @"
Blindly 1.0.0 - paquete para Google Play Console
================================================

Bundle aprobado:
  bundle/Blindly-1.0.0-playstore.aab
  package: com.blindly.app
  versionName: 1.0.0
  versionCode: 6
  SHA-256: $actualAabSha256

Antes de enviar a revision:
1. Activar las paginas legales y verificar sus URLs publicas.
2. Definir el correo publico de soporte y privacidad.
3. Obtener al menos dos capturas del APK final en un Android real.
4. Cargar primero el AAB en una pista interna y revisar el informe previo al lanzamiento.
5. Ejecutar la prueba cerrada exigida: 12 testers inscritos durante 14 dias continuos.
6. Solicitar acceso a produccion y completar los formularios de Play Console.
7. Mantener Blindly Plus desactivado hasta crear los productos comerciales.

Los textos localizados y las respuestas preparadas estan en metadatos/.
Los hashes y tamaños de todos los archivos estan en SHA256SUMS.txt.
"@

  $instructionEntry = $archive.CreateEntry('SUBIR-A-PLAY-CONSOLE.txt')
  $instructionWriter = [System.IO.StreamWriter]::new($instructionEntry.Open(), [System.Text.UTF8Encoding]::new($false))
  try {
    $instructionWriter.Write($instructions)
  }
  finally {
    $instructionWriter.Dispose()
  }

  $checksumEntry = $archive.CreateEntry('SHA256SUMS.txt')
  $checksumWriter = [System.IO.StreamWriter]::new($checksumEntry.Open(), [System.Text.UTF8Encoding]::new($false))
  try {
    $checksumWriter.WriteLine(($checksums -join "`n"))
  }
  finally {
    $checksumWriter.Dispose()
  }
}
finally {
  $archive.Dispose()
}

$packageHash = (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash.ToUpperInvariant()
$packageSize = (Get-Item -LiteralPath $OutputPath).Length
Write-Host "Paquete creado: $OutputPath"
Write-Host "Tamaño: $packageSize bytes"
Write-Host "SHA-256: $packageHash"
