# Release de las 40 metas

Registro del 8 de octubre de 2026. Este informe corresponde al desarrollo posterior a la release base `a147e78`; los APK/AAB anteriores no incluyen estas metas.

## Implementación y pruebas

Código de producto: `6eef30f301b908fd09991a22b9d3c316e2e0c71f`. [CI aprobada](https://github.com/ArgerichFacu/Blindly/actions/runs/37819683897). Las 40 metas tienen implementación documentada en [evolucion.md](evolucion.md); sus límites y pruebas de aceptación están en [qa-metas40.md](qa-metas40.md).

Tipos, lint, pruebas de juego, identidades, permisos, roles, SQL/RLS, traducciones y bundles web/Android/iOS aprobados. Supabase tiene 26 migraciones aplicadas y conserva los 26 registros de puntuación anteriores. La eliminación de cuenta también limpia tokens, preferencias y copias personales en eventos de MVP.

## Android

La build remota Android fue rechazada por cupo mensual gratuito agotado; no se creó un binario remoto ni se contrató un plan. EAS reservó `versionCode 7`. Se compilaron localmente APK y AAB universales con ese código y la misma firma existente. [Procedimiento reproducible](compilacion-local.md).

Java 25 falló en la configuración nativa de CMake. El nuevo intento usa Temurin JDK 17 verificado contra el checksum oficial, SDK 36, NDK 27.1 y Gradle de Expo SDK 57. No se alteraron dependencias de producto para ocultar el error.

**Compilación finalizada:** 990 tareas, 23 minutos 22 segundos, cuatro arquitecturas (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`). Archivos completos para validación; aceptación física pendiente.

| Archivo | Versión | SHA-256 |
| --- | --- | --- |
| `Blindly-metas40-v7.apk` | 1.0.0, código 7 | `E31A96080C6EA854B411292E1D0CDD38D82A8A19E25FC9A40814D297153F1FFD` |
| `Blindly-metas40-v7.aab` | 1.0.0, código 7 | `8C8C2EAADFB2CF6B9DF06FBF1C66A789267875B9ACF2C4166CCAA18517C2D1A8` |

APK: firma v2 válida. AAB: `bundletool validate` y `jarsigner` aprobados; certificado autofirmado esperado para la firma de carga. Ambos certificados coinciden con la release anterior: SHA-256 `C5B6C355789F93255B188CEF762DB78DE5A1900E286CE3B1EC9475F6C466422F`. Manifiestos: `com.blindly.app`, min SDK 24, target/compile SDK 36, Billing y esquemas `blindly`/`exp+blindly`; sin permisos de almacenamiento ni superposición.

Los tres binarios, `Blindly-metas40-v7-play-console-package.zip` y `LEEME-metas40.txt` están en `release/` del repositorio local y en `G:\OneDrive\Documentos\ChatGPT\Blindly\release`. Se verificó que cada copia tiene el mismo SHA-256. El ZIP pasó CRC, verificación de todos sus hashes internos, código 7 e informe correspondiente a `6eef30f`; su hash externo está en el LEEME. No se incluye la firma privada ni credenciales. Los binarios permanecen excluidos de Git.

### Páginas de 16 KB

`zipalign -c -P 16 4` aprobado; el AAB solicita `PAGE_ALIGNMENT_16K`. Las 56 bibliotecas ELF64 del APK/AAB tienen todos los segmentos PT_LOAD alineados al menos a 16 KB.

La comprobación estricta adicional de [la guía Android](https://developer.android.com/guide/practices/page-sizes) encuentra 45 bibliotecas cuyo final GNU_RELRO no es múltiplo de 16 KB. No se detectaron PT_LOAD escribibles que se solapen con el redondeo de esos rangos. Esto no demuestra un fallo en ejecución ni permite dar por aprobada la compatibilidad completa: registrar el aviso y probar con sistema de 16 KB antes de producción. `scripts/verificar-elf-16kb.py` conserva el informe y devuelve código 1 mientras no se cumplan todos los criterios documentados. No se ocultó el resultado ni se modificaron binarios para silenciarlo.

Se instaló la imagen oficial Android 36 `google_apis_ps16k/x86_64` y se creó el AVD `Blindly36_16kb_metas40`. El intento sin aceleración con SwiftShader quedó offline; el segundo con un núcleo y renderizado alternativo salió con código 1 antes de iniciar Android. Se detuvieron los procesos de prueba. No se instaló ni ejecutó Blindly en ese emulador. La ausencia de virtualización/hipervisor impide registrar una prueba nativa válida en esta PC; conservar el AVD para una futura máquina preparada.

## iOS

Build de simulador **finalizada y descargada**: [`acaf0ba7-247b-4278-be6c-e85d0b5771ec`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/acaf0ba7-247b-4278-be6c-e85d0b5771ec), código `6eef30f`, versión 1.0.0, build 1. [Archivo de simulador](https://expo.dev/artifacts/eas/q7RcL2AUn2KVj9By5oDdhX5krPx9aT1TujVCZa2Wngw.tar.gz), SHA-256 `DED12B0712A6D3B351D95A55EAA7B9A932E0819A75304A54DFC0F91A6980F61B`. Contenido inspeccionado: `Blindly.app`, ejecutable, identificador `com.blindly.app`, plataforma `iPhoneSimulator`, mínimo iOS 16.4 y cifrado no exento desactivado. El mismo número no significa que sea el mismo archivo anterior: identificar siempre por ID y hash.

No es una IPA instalable en iPhone. La distribución física requiere una firma Apple válida y sus requisitos externos.

## Lo que impide declarar publicación completa

- Aceptación con tres Android físicos: partida completa, reconexión, audio en segundo plano, haptics, navegación, recap, iconos y accesibilidad. No hay teléfono conectado; la PC tampoco tiene virtualización habilitada para una prueba acelerada en emulador.
- Prueba en sistema Android de páginas de 16 KB, incluyendo el aviso RELRO registrado arriba.
- Configurar FCM/APNs y verificar recepción real de notificaciones. El backend está desplegado, pero `EXPO_PUBLIC_PUSH_READY=false` evita ofrecer un servicio no configurado.
- Productos y claves comerciales de las tiendas, compras/restauración físicas y paywall publicado. `EXPO_PUBLIC_PLUS_READY=false` protege la build de validación; no usa la clave Test Store que provocaba el cierre anterior.
- SMTP y prueba de correo opcional. Se mantiene `EXPO_PUBLIC_EMAIL_AUTH_READY=false`; la identidad recuperable mediante clave propia sigue disponible.
- Cuenta Google Play, documentos legales publicados, contacto de soporte y aceptación de tienda. El paquete técnico no equivale a una app publicada.
- Firma Apple y prueba en iPhone.

No asignar 100% a la release por haber completado únicamente el código. Mantener los artefactos base separados de esta entrega y registrar cualquier fallo sin claves ni datos personales.
