# Entrega Android Founder Trial — v29

12/10/2026, 19:41 ART. **Disponible para testers internos** en Google Play, versión `1.0.0 (29) · Founder Trial`. No se publicó producción ni se habilitaron pagos. Se mantienen los testers existentes.

## Artefactos

Fuente: commit `7a5c5848dc18bfcea87c994a84560636fd4c5030`, `main`, CI aprobado. La compilación terminó correctamente con el script local, JDK 17 y Android SDK 36. No se consumió EAS Build ni se cambió la firma.

| Archivo en G:\Blindly\entregas | SHA-256 |
| --- | --- |
| `Blindly-1.0.0-founder-v29.aab` | `97da7b0ec4874cb67d845ca4bcebc7ab2f11be1464d01297ca57a4126f7a67c2` |
| `Blindly-1.0.0-founder-v29.apk` | `f355a6cf7fbfce3488b96525a248f48cf96248995f593f23bc211253a35957f6` |

Paquete `com.blindly.studio`, versionName `1.0.0`, versionCode `29`, minSdk 24, targetSdk 36, cuatro arquitecturas. Scheme `blindly` conservado. Certificado de carga idéntico a v28: SHA-256 `c5b6c355789f93255b188cef762db78de5a1900e286ce3b1ec9475f6c466422f`.

## Validación

- `bundletool validate`: aprobado. Manifiesto y versión comprobados dentro del AAB final.
- `jarsigner`: `jar verified`; certificado de carga autofirmado, igual al existente. `apksigner verify` aprobado; `zipalign -c -P 16 4` aprobado para APK.
- Auditoría AAB: 58 bibliotecas de 64 bits, cero fallos PT_LOAD. 30 mantienen observaciones de alineación RELRO de la auditoría estricta; esto no certifica aceptación física ARM64/16 KB, que continúa pendiente.
- APK release instalada en `Blindly_QA_A`. Arranque frío y deep link a Plus aprobados, sin el error de API Key de RevenueCat.
- UI nativa: oferta gratuita de 72 horas, primera pulsación abre confirmación, Ahora no cancela, Empezar prueba activa Founder Trial real. Sin paywall ni compras.
- Cierre del proceso y reapertura: Founder Trial seguía activo. El teléfono A32 no se reinstaló ni se borró; conserva su sesión de v28 hasta actualizar desde Play.
- La identidad descartable del emulador se eliminó desde la app al terminar; Supabase confirmó cero filas de trials, cero filas comerciales y flags Trial=true / Payments=false. Emulador cerrado.
- Google Play aceptó el AAB y no perdió dispositivos admitidos. Única advertencia: falta de archivo de desofuscación; no bloqueó el lanzamiento interno.

Evidencia y logs locales: `G:\Blindly\entregas\qa-founder\`, incluidos `v29-activa.png`, `v29-persistida.xml`, `v29-limpieza-final.xml`, `v29-manifest.xml`, `v29-bundletool.log`, `v29-jarsigner.log`, `v29-aab-elf.json` y `v29-play-publicada.png`. No se versionan credenciales ni binarios.

## Instalar la actualización

En el Android ya inscrito como tester, buscar Blindly en Google Play y actualizar. La propagación puede tardar; no desinstalar para forzarla, porque un invitado podría perder su identidad. La actualización mantiene el paquete y la firma de Play. La APK local usa la firma de carga, que puede diferir de la firma de distribución de Google Play; no sustituir la instalación de Play con esa APK ni borrar los datos para hacerlo.

Antes de producción siguen vigentes los pendientes de `auth-entrega.md` y la aceptación ARM64/16 KB. Este lanzamiento permite probar Founder Trial y conserva los pagos apagados.
