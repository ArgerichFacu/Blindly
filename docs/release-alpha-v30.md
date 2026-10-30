# Android 1.0.0 (30) — Alpha

29/10/2026, ART. **AAB listo para carga manual en la prueba cerrada Alpha. No se subió ni publicó nada en Google Play. Pagos reales desactivados; Founder Trial conservado.**

Esta tarea sólo compila, valida y empaqueta el pulido post-v29 ya aceptado en Android físico. No cambia producto, código de aplicación, dependencias, autenticación, precios, RevenueCat ni base de datos. No hay migraciones ni keystore nuevo. El registro de [v29](founder-entrega.md) se conserva íntegro.

## Fuente y proceso

- Commit fuente exacto: `abeeb43cb926bb4d683aa1903317148b007a7278`, `main`, limpio y coincidente con `origin/main` después de fetch.
- SDK Android 36, build-tools 36.0.0, NDK 27.1.12297006; Temurin JDK `17.0.20.1+1`.
- `credentials.json` y el keystore existente se comprobaron presentes, ignorados y no versionados. Revisión de 364 archivos y patrones de secretos de alta confianza: cero hallazgos; no sustituye una garantía universal.
- Prerrequisitos ejecutados antes de compilar: `npm test`, `npm run typecheck`, `npm run lint`; los tres terminaron con código 0.

Desde `G:\Blindly\proyecto`:

```powershell
. .\scripts\entorno-local.ps1
.\scripts\build-android-local.ps1 `
  -SdkRoot $env:ANDROID_HOME `
  -JavaHome $env:JAVA_HOME `
  -VersionCode 30
```

Sin `-PlayBilling`, sin `-PlusDemo`, sin restricción de ABI. El script conserva package.json, ejecuta prebuild, firma con las credenciales existentes y genera `assembleRelease` + `bundleRelease`. Gradle: **BUILD SUCCESSFUL, 6m 49s; 1027 tareas, 133 ejecutadas y 894 reutilizadas**. Sólo los archivos nativos generados e ignorados reciben versionCode 30; la fuente funcional permanece en el commit indicado.

## Entrega

| Artefacto | Ruta | Tamaño exacto | SHA-256 |
| --- | --- | ---: | --- |
| AAB para Play | `G:\Blindly\entregas\Blindly-1.0.0-alpha-v30.aab` | 108164635 bytes (103,15 MiB) | `713f72825d7f45dab7e5a578d8643718977d892dbb416af1d7392f14cc4be680` |
| APK universal, sólo QA | `G:\Blindly\entregas\Blindly-1.0.0-alpha-v30.apk` | 157895985 bytes (150,58 MiB) | `d8601af843954fde65610f5ee4fde1094ca9ef4a265b5d5ef805a62a6d35ae7f` |

Archivo adicional: `G:\Blindly\entregas\Blindly-1.0.0-alpha-v30.sha256`. Los archivos finales se compararon por SHA-256 con los originales validados en release/. No se sustituyó el APK instalado desde Play ni se tocó el teléfono en este bloque.

## Manifiesto y firma

| Comprobación del AAB compilado | Resultado |
| --- | --- |
| package | `com.blindly.studio` |
| versionName / versionCode | `1.0.0` / `30` |
| minSdk / targetSdk / compileSdk | `24` / `36` / `36` |
| debuggable | `false` (valor predeterminado; no se declara true) |
| ABI | `armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`; 29 bibliotecas por ABI |
| Scheme | `blindly` conservado; sin scheme Plus Demo |
| Firma AAB / APK | Certificado de carga existente, sin rotación |
| Certificado SHA-256 | `c5b6c355789f93255b188cef762db78de5a1900e286ce3b1ec9475f6c466422f` |

El certificado se extrajo tanto de v30 como del AAB v29. Coincide exactamente. El AAB histórico v29 también coincide con su hash registrado: `97da7b0ec4874cb67d845ca4bcebc7ab2f11be1464d01297ca57a4126f7a67c2`. La firma de distribución de Google Play puede diferir: no instalar el APK local sobre la versión de Play ni borrar datos para hacerlo.

Permisos del manifiesto compilado: **idénticos a v29**. Incluyen cámara/QR, Internet y red, audio, vibración, notificaciones/FCM/arranque/wake lock y permisos de badges de los launchers; `com.android.vending.BILLING` permanece por las dependencias existentes. Su presencia no activa compras. No se añaden micrófono, almacenamiento externo ni ventanas superpuestas. El listado completo está en `validation.json` y `manifest.xml` de la carpeta de validación.

## Validaciones y configuración comercial

| Control | Resultado |
| --- | --- |
| npm test | Aprobado, código 0; incluye Auth, Founder, permisos, pagos cerrados, layout y temas |
| npm run typecheck | Aprobado, código 0 |
| npm run lint | Aprobado, código 0 |
| Gradle release | BUILD SUCCESSFUL; APK y AAB |
| bundletool 1.18.3 validate | Aprobado, código 0 |
| jarsigner JDK 17 | `jar verified.`, código 0; avisos idénticos a v29, detallados abajo |
| apksigner del APK | Aprobado, esquema v2 y mismo certificado |
| zipalign del APK | `-c -P 16 4`, aprobado, código 0 |
| BundleConfig | `PAGE_ALIGNMENT_16K` |
| Bibliotecas APK frente a AAB | Iguales por ruta/ABI y SHA-256 |
| Auditoría ELF de 64 bits | 58 bibliotecas, cero fallos PT_LOAD; 30 observaciones RELRO ya existentes en v29 |
| Secretos en artefacto | Sin credentials.json ni keystore empaquetados |
| Flags comerciales en Hermes | `PLUS_HABILITADO=false`, `PLUS_DISPONIBLE=false` |
| Test Store | Cero claves; comprobación sobre la tabla de strings decodificada de Hermes |
| Servidor | RPC `estado_lanzamiento_plus`: `founder_trial_enabled=true`, `real_payments_enabled=false` |

La RPC se leyó con una sesión aislada del Reviewer, sin cambiar su identidad, Plus ni partidas. Sólo se cerró esa sesión local del verificador. La lectura administrativa por MCP no estaba permitida; no se intentaron cambios en el servidor.

Una búsqueda inicial en bytes concatenados de Hermes detectó nombres internos del SDK (`test_store`, `test_store_operation_session_` y el prefijo `test_`). La revisión de strings reales del bytecode los distingue de una clave: no hay clave Test Store. El módulo de compras también conserva ambas flags compiladas en false. No se modifica la configuración comercial para conseguir este resultado.

## Advertencias no bloqueantes y límites

- Expo prebuild advierte que no añade schemes automáticamente con `singleTop`. Se preserva esa configuración ya validada y se confirma `blindly` en el manifiesto final; no se cambia a singleTask.
- Avisos de APIs de dependencias deprecadas y compatibilidad futura con Gradle 10; no impiden la compilación actual.
- Jarsigner avisa de certificado autofirmado/cadena PKIX no confiable, ausencia de timestamp, atributos POSIX y diferencias de lectura JarFile/JarInputStream por orden del manifiesto. **El bloque completo de avisos coincide exactamente con v29**, que fue aceptada en Play. Ambas verificaciones terminan en `jar verified.` con código 0. No se reempaqueta ni se cambia la firma para ocultar esos avisos.
- `verificar-elf-16kb.py` devuelve **1 en su auditoría estricta** por las mismas 30 observaciones RELRO de v29. No se presenta como una auditoría estricta completamente aprobada: hay cero fallos PT_LOAD, idéntico conjunto de bibliotecas observadas y ninguna regresión nueva. Los checks ZIP/BundleConfig pasan; la ejecución física ARM64/16 KB continúa fuera de esta certificación estática.
- R8/ProGuard sigue desactivado. La falta de archivo de desofuscación de Play no se considera un fallo de esta entrega.

## Evidencia local

`G:\Blindly\entregas\validacion-alpha-v30\`: `validation.json`, `manifest.xml`, `bundle-config.json`, `bundletool.log`, `jarsigner.log`, referencia de jarsigner v29, certificados públicos, `commercial-flags-bytecode.txt`, auditoría `aab-elf.json`/`.log`, apksigner, zipalign y logs de tests/tipos/lint/Gradle. No contiene credenciales privadas. Binarios, claves y logs no se incorporan a Git.

**Acción del titular:** seleccionar el AAB v30 en el borrador de la prueba cerrada Alpha y enviarlo manualmente cuando corresponda. Esta tarea no creó una release remota, no publicó Play ni activó pagos.
