# Release de las 40 metas

Registro actualizado el 9 de octubre de 2026. Este informe corresponde al desarrollo posterior a la release base `a147e78`; los APK/AAB anteriores no incluyen estas metas.

## Implementación y pruebas

Código de producto: `6eef30f301b908fd09991a22b9d3c316e2e0c71f`. [CI aprobada](https://github.com/ArgerichFacu/Blindly/actions/runs/37819683897). Las 40 metas tienen implementación documentada en [evolucion.md](evolucion.md); sus límites y pruebas de aceptación están en [qa-metas40.md](qa-metas40.md).

Tipos, lint, pruebas de juego, identidades, permisos, roles, SQL/RLS, traducciones y bundles web/Android/iOS aprobados. Supabase tiene 26 migraciones aplicadas y conserva los 26 registros de puntuación anteriores. La eliminación de cuenta también limpia tokens, preferencias y copias personales en eventos de MVP.

## Android

### Actualización de recuperación y conexión v10

Código de producto `47419e756b69da4b30f2e3ce082a28c0afd2dfdc`. Incluye la corrección v9 de protección por clave: mostrar la clave antes de abrir la nueva sesión, sin depender de un refresh token revocado. La recuperación real conservó UUID, puntos e historial entre dos emuladores después de completar un torneo con un Galaxy A32 como dealer fijo.

La desconexión durante una apuesta reveló una espera sin límite. La acción ahora vence a los 15 segundos, aborta su transporte y conserva el identificador original para reintentar sin duplicar la operación; una recarga lenta posterior tampoco mantiene el bloqueo. Suite completa, tipos y lint aprobados, con regresiones de respuesta tardía, transporte que ignora abort y reintento idéntico. [Resultados nativos y límites](qa-metas40.md).

Compilación local correcta en 5 minutos 25 segundos, 990 tareas (83 ejecutadas), cuatro arquitecturas y firma original comprobada. AAB validado con bundletool y jarsigner; APK alineado para páginas de 16 KB. La auditoría ELF conserva los 45 avisos estrictos RELRO y cero fallos PT_LOAD de las 56 bibliotecas.

| Archivo actual | Versión | SHA-256 |
| --- | --- | --- |
| `Blindly-metas40-v10.apk` | 1.0.0, código 10 | `EFFC52731CED8CB5CBB6A87E45823BFFFE8FBF155565B1561475637D47842513` |
| `Blindly-metas40-v10.aab` | 1.0.0, código 10 | `61E8FEAD6D1E3E37EF90584ED829E663C65A2EDB7FF9A5E1797EBDB159B8B387` |

El torneo QA añadió tres resultados identificados como prueba; los 26 anteriores se conservan (29 en total). Plus, correo y push permanecen desactivados hasta configurar sus servicios. La compilación iOS más abajo es anterior a las correcciones v8–v10 y no es una IPA para iPhone físico.

### Actualización de audio v8

Código de producto `d0e9951f22d30f6d0acc6386e8d87fba61c19581`. La prueba física de v7 detectó que Expo Android reanudaba la música al volver del launcher, aunque la interfaz prometía reproducción manual. El control pausa también al volver a primer plano; la prueba automática reproduce la reanudación nativa y comprueba que un evento `active` repetido no corte una reproducción manual.

Compilación local correcta: 5 minutos 59 segundos, 990 tareas (83 ejecutadas), las mismas cuatro arquitecturas y firma original. Tipos, lint y pruebas de audio aprobados.

| Archivo nuevo | Versión | SHA-256 |
| --- | --- | --- |
| `Blindly-metas40-v8.apk` | 1.0.0, código 8 | `9F346A65CF198808A48806B47FD8F8FD1B281EA8BC8001BA128138E8A9D6AD1C` |
| `Blindly-metas40-v8.aab` | 1.0.0, código 8 | `E198100E47261E73DD30641E004CACA11E2A3C8B0B20F11C49739BACB93102F8` |

APK con firma v2 y certificado original comprobados; AAB validado con bundletool y jarsigner. ZIP alineado para 16 KB. La revisión ELF de v8 mantiene 56 bibliotecas, cero fallos PT_LOAD y 45 avisos del criterio estricto RELRO. El ensayo de ejecución 16 KB descrito más abajo corresponde a **v7**. La build iOS de este informe también corresponde al código anterior; no contiene esta corrección posterior.

Prueba física v8 aprobada para este alcance en Galaxy A32 / Android 13: actualización sin borrar datos, identidad de invitado y preferencias conservadas, arranque frío de 2288 ms y audio manual. Música pausada al salir y aún pausada al regresar; botón «Reproducir música» y nuevo toque funcional. Navegar fuera de sonidos detiene la reproducción; sin crashes registrados del proceso. [Evidencia y límites](qa-metas40.md). No equivale a una partida de tres teléfonos ni a recuperar la cuenta en otro dispositivo.

### Entrega inicial v7

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

Se instaló la imagen oficial Android 36 `google_apis_ps16k/x86_64` y se creó el AVD `Blindly36_16kb_metas40`. Los dos intentos iniciales sin aceleración no iniciaron Android. Después de habilitar virtualización en la PC, `emulator -accel-check` confirmó WHPX disponible y el AVD arrancó con aceleración.

**Prueba de arranque 16 KB x86_64 aprobada el 8 de octubre:** Android 16, `getconf PAGE_SIZE=16384`, APK v7 con hash comprobado e instalación correcta. Se desactivó el modo de compatibilidad exclusivamente en el emulador con `bionic.linker.16kb.app_compat.enabled=false` y `pm.16kb.app_compat.disabled=true`, siguiendo la guía Android. Arranque frío de 3389 ms, onboarding visible, enlaces a combinaciones/opciones, retorno desde segundo plano y segundo arranque frío por enlace (1936 ms). Proceso activo, actividad en primer plano y registro de crashes vacío. Se inspeccionaron los textos de las vistas nativas y una captura de opciones.

Este resultado verifica el arranque y esas vistas en x86_64; no demuestra todas las funcionalidades ni la arquitectura ARM64 en 16 KB. El aviso estático RELRO permanece registrado sin rebajar su criterio. Pendientes: partida completa, cámara, audio/haptics reales, compras/push configurados y aceptación ARM64. No se recompiló ni alteró el APK para estas pruebas.

## iOS

Build de simulador **finalizada y descargada**: [`acaf0ba7-247b-4278-be6c-e85d0b5771ec`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/acaf0ba7-247b-4278-be6c-e85d0b5771ec), código `6eef30f`, versión 1.0.0, build 1. [Archivo de simulador](https://expo.dev/artifacts/eas/q7RcL2AUn2KVj9By5oDdhX5krPx9aT1TujVCZa2Wngw.tar.gz), SHA-256 `DED12B0712A6D3B351D95A55EAA7B9A932E0819A75304A54DFC0F91A6980F61B`. Contenido inspeccionado: `Blindly.app`, ejecutable, identificador `com.blindly.app`, plataforma `iPhoneSimulator`, mínimo iOS 16.4 y cifrado no exento desactivado. El mismo número no significa que sea el mismo archivo anterior: identificar siempre por ID y hash.

No es una IPA instalable en iPhone. La distribución física requiere una firma Apple válida y sus requisitos externos.

## Lo que impide declarar publicación completa

- Completar aceptación con tres Android físicos: partida completa, reconexión, haptics, recap, iconos y accesibilidad. La primera sesión en Galaxy A32 con Android 13 y páginas de 4 KB está registrada en [qa-metas40.md](qa-metas40.md); incluye arranque, Back, vistas nativas y música audible, y encontró el fallo de reanudación corregido en v8.
- Completar aceptación de funcionalidades y ARM64 en 16 KB, incluyendo el aviso RELRO. Arranque y vistas básicas x86_64 ya comprobados sin compatibilidad.
- Configurar FCM/APNs y verificar recepción real de notificaciones. El backend está desplegado, pero `EXPO_PUBLIC_PUSH_READY=false` evita ofrecer un servicio no configurado.
- Productos y claves comerciales de las tiendas, compras/restauración físicas y paywall publicado. `EXPO_PUBLIC_PLUS_READY=false` protege la build de validación; no usa la clave Test Store que provocaba el cierre anterior.
- SMTP y prueba de correo opcional. Se mantiene `EXPO_PUBLIC_EMAIL_AUTH_READY=false`; la identidad recuperable mediante clave propia sigue disponible.
- Cuenta Google Play, documentos legales publicados, contacto de soporte y aceptación de tienda. El paquete técnico no equivale a una app publicada.
- Firma Apple y prueba en iPhone.

No asignar 100% a la release por haber completado únicamente el código. Mantener los artefactos base separados de esta entrega y registrar cualquier fallo sin claves ni datos personales.
