# Blindly v31 — Payment RC

Actualización 02/11/2026 18:00 ART: API Play confirma Alpha31 completed, SHA AAB coincidente y producción sin releases. Las secciones anteriores de carga pendiente quedan como historia; la carga ya fue realizada por el titular. Gate B runtime sigue pendiente. Preparación siguiente: [v32](release-v32-production-candidate.md).

02/11/2026 (ART). Preparación autorizada después de Gate A. **AAB EAS terminado, descargado y validado; carga/distribución Alpha y Gate B pendientes.**

| Campo | Estado previsto / resultado |
| --- | --- |
| versionName | 1.0.0 |
| versionCode | 31, asignado por EAS y confirmado en el manifiesto del AAB; Play pendiente |
| Package | com.blindly.studio |
| Perfil EAS | payment-rc (AAB, store, preview, credenciales locales existentes) |
| EAS build ID | 49e15002-9412-40aa-bf22-d9413d80d28f, FINISHED; fuente 628c0814b428f215749248cbdb42e5ffafcd81f1 |
| AAB / SHA-256 | G:/Blindly/entregas/Blindly-1.0.0-payment-rc-v31.aab — 7c120b118467ced47fd434daaff886e3032bef74afd298e50baf75aecec7860d — 108122521 bytes |
| Certificado de carga | c5b6c355789f93255b188cef762db78de5a1900e286ce3b1ec9475f6c466422f, mismo que v30 |
| Track | Alpha cerrado previsto, pendiente de verificar/cargar |
| Instalación desde Play | Pendiente |
| Gate B catálogo | Pendiente |
| QA compras / license testers / allowlist | Pendiente de fase posterior al catálogo |
| Founder Trial / pagos reales | Trial activo / payments global false, sin cambios |

El perfil `payment-rc` equivale a la configuración comercial `-PlayBilling` del script local: EXPO_PUBLIC_PLUS_READY=true y clave pública goog_ correcta de Android, sin autorizar cobros en servidor. Incorpora evidencia sanitizada del catálogo en logcat; no añade una pantalla de pago/diagnóstico.

Ver [Gate B y protocolo de QA](payment-rc-gate-b.md). No se consideran evidencia runtime ni un AAB, ni GET offerings público, ni mocks, ni instalación local. No hay producción, cambios de precios/IDs/package/firma ni permisos públicos de compra.

## Fuente, pruebas y referencia del dispositivo

Commit `628c081` (`demo`) subido a main. CI [Verificar Blindly, run 41447964592](https://github.com/ArgerichFacu/Blindly/actions/runs/41447964592): success. `npm test`, `npm run typecheck` y `npm run lint`: código 0. Escaneo de 369 archivos versionados: sin claves privadas, JSON de servicio ni claves reales RevenueCat/TinyFish embebidas. Alcance limitado a patrones de alta confianza; no es garantía universal.

Checkout de compilación: `G:/Blindly/cache/payment-rc-v31`, detached del mismo commit de main, `git status --short` vacío antes del upload. Se copiaron sólo las credenciales de firma existentes necesarias e ignoradas; no se copió el JSON de servicio RevenueCat. El gestor de worktrees de Codex no admitió el repo por estar fuera de sus raíces registradas, por lo que se creó con Git. Las tres imágenes sin seguimiento permanecen intactas en el checkout original.

Dispositivo de referencia autorizado por USB: Samsung SM-A325M, Android API 33. Lectura previa a actualizar: package com.blindly.studio, versionCode30/versionName1.0.0, installer `com.android.vending`. Firma de distribución Play: `470d4a3d4462979aaec1c68c29c963fa25496de5acd3174e33932f5ca1974d8f`. Difiere de la firma de carga local y debe compararse con la instalación de v31 desde Play. No se instaló APK ni se borraron datos.

EAS no tiene Google Service Account de submissions configurada para com.blindly.studio. Se inspeccionó el menú sin crear/subir credenciales ni usar la cuenta RevenueCat para releases. La vía de subida debe resolverse después de validar el AAB; no se afirma carga ni distribución automática.
## Artefacto terminado y validado

[EAS build](https://expo.dev/accounts/facuargerich/projects/blindly/builds/49e15002-9412-40aa-bf22-d9413d80d28f), FINISHED. AAB descargado en la ruta de la tabla y checksum en el archivo `.sha256` contiguo. Bundletool validate aprobado, jarsigner `jar verified` y mismo certificado de carga v30. Jarsigner conserva advertencias de certificado autofirmado/PKIX, timestamp y diferencias JarFile/JarInputStream del tipo ya documentado para v30; no se modificó la firma ni se reempaquetó el AAB.

Manifiesto: package com.blindly.studio, versionCode31, versionName1.0.0, debuggable false, Billing presente y permisos iguales a v30. Cuatro ABIs (armeabi-v7a, arm64-v8a, x86, x86_64); BundleConfig PAGE_ALIGNMENT_16K. No se presenta como QA físico ARM64/16KB. Tabla de strings Hermes: clave Android exacta, cero claves Test Store, cero claves Android reales adicionales; el prefijo interno `goog_` no se cuenta como una clave real. Diagnósticos RC presentes, PLUS_HABILITADO compilado true (SDK/lectura), autorización de cobro sigue dependiendo del servidor. Sin credentials.json/keystore/JSON de servicio empaquetados ni material privado detectado por los controles descritos. Esta revisión no garantiza ausencia de cualquier clase imaginable de secreto.

Evidencia en `G:/Blindly/entregas/validacion-payment-rc-v31/validation.json`, manifest.xml, bundle-config.json, bundletool.log, jarsigner.log, certificate.log y commercial-flags-bytecode.txt. El bytecode de diagnóstico conservado fuera del repo está redactado; no se imprimen claves públicas completas ni fragmentos de ellas en los registros nuevos.

## Preparación del tester y reinstalación solicitada

El titular agregó administracionblindly@gmail.com a la lista de Alpha y confirmó aceptación del enlace. Se observó esa cuenta seleccionada en Play y acceso anticipado a la ficha de Blindly v30. Esto no verifica todavía license tester.

La app tenía abierta la identidad Google Play Reviewer. Un intento normal de cerrar sesión fue bloqueado por «Para continuar, terminá o abandoná tu partida activa». No se terminó/abandonó ninguna partida ni se borró la cuenta del servidor. El titular indicó que era un error pendiente y autorizó expresamente desinstalar/reinstalar. Se desinstaló la app y se reinstaló mediante el botón Instalar de Google Play, sin adb install ni sideload. La instalación recuperada sigue siendo v30 de com.android.vending; no se cuenta como Gate B ni como la prueba de reinstalación posterior a compra. Tras login Google, el UI mostró administracionblindly@gmail.com y Google conectado, sin la identidad Reviewer. Se preservará ese UUID al actualizar v31; aún no hay evidencia SDK de identidad desde v31.

## Carga manual requerida

No se configuró una nueva credencial de submissions ni se amplió la service account RevenueCat para publicar releases. El titular debe cargar el AAB validado en una nueva release de la prueba cerrada Alpha existente, manteniendo testers/listas e historial v30. No producción. Nombre sugerido: Blindly 1.0.0 — Payment RC v31. Notas listas en `G:/Blindly/entregas/Blindly-v31-notas-alpha.txt`.

Última respuesta del titular sobre la carga: «Todavía no la cargué». Por tanto no se afirma upload, revisión, rollout de testing ni disponibilidad v31 en Play. Cuando esté disponible, actualizar desde Play y observar la cadena SDK → identidad Supabase → default → tres productos/precios localizados. El AAB validado y el GET de Gate A no satisfacen esa cadena.

La allowlist de compra, los license testers y todo QA de compras quedan pendientes de aprobar primero Gate B catálogo. No se implementó ni desplegó un bypass de autorización, no se otorgó Plus y real_payments_enabled permanece false sin cambios.
