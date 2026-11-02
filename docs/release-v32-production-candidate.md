# Blindly 1.0 — v32 production candidate

Corrección backend adicional: `20261102222856_preservar_uuid_trial_en_auth.sql` aplicada y registrada. mi_identidad_tiene_datos ahora incluye Trial activo/vencido, accesos comerciales y presencia/ownership de mesas, además de historial/clubes/plantillas. Sólo visitar Plus no cuenta como progreso. Esto evita que el Google automático cambie de UUID cuando el único dato era la prueba de72h; no cambia Trial ni el contrato RPC y no exige recompilar Android. Pruebas SQL de antes/después/expirado pasan. Mantiene comparación auth.uid, sin UUID de entrada ni metadata como autorización.

Advisors del backend:55 WARN y0 ERROR, sin hallazgos nuevos frente a la lectura previa ni permisos cliente sobre la tabla de testers. Se conservan avisos existentes de funciones SECURITY DEFINER/identidades anónimas/extensión y leaked-password protection desactivada. Esta última requiere Pro+ según [Supabase](https://supabase.com/docs/guides/auth/password-security); queda revisión de seguridad de Auth antes de producción, sin contratar planes ni alterar passwords.

Estado actual de la revisión QA: source `3f75f7725291c7603844c733919b548d577f46eb` (`demo`) en main, CI [41535872179](https://github.com/ArgerichFacu/Blindly/actions/runs/41535872179) success. Nueva build EAS `834874ed-c72b-4434-8b0e-f6addad86d02`, mismo code32 libre en Play a19:16 ART; todavía en cola al registrar. El titular confirmó Pruebas de licencia guardadas para la lista dedicada; ahora sólo su permiso privado está enabled=true, global=false, Trial=true y cero grants. Falta prueba del medio sandbox en el diálogo real. No usar el primer AAB de referencia para omitir esta revisión de Auth/logout/QA.

## Revisión posterior al catálogo de v31

La etapa catálogo pasó en v31 desde Play; ahora se prepara el mismo versionCode32 (todavía no cargado a Play, sujeto a nueva lectura antes de construir) con el permiso privado necesario para QA de compras. **El primer AAB32 es referencia técnica, no la entrega final para cargar Alpha.** El perfil production-candidate deja autoIncrement=false para conservar32 mientras siga libre en Play; EAS remoto ya está en32. No se manipula la versión de Play ni se reasigna un código ya cargado.

- `private.plus_payment_testers` + helper privado SECURITY DEFINER con auth.uid validado, sin UUID de entrada; RPC pública SECURITY INVOKER devuelve sólo permiso propio. RLS y sin permisos de tabla cliente. No concede Plus ni escribe accesos_plus. Reviewer/anónimo/baneado no pueden usarlo. La cuenta Google elegida conserva su UUID y está insertada **enabled=false** hasta verificar Pruebas de licencia; Alpha no las reemplaza. No se inició compra.
- Migración `20261102220150_payment_testers_gate_b.sql` aplicada vía CLI al proyecto correcto y registrada con migration repair después de ejecutar el SQL. Test transaccional con rol authenticated en servidor pasa y revierte su contexto. Global payments=false, Founder Trial=true, cero filas comerciales para ese tester. La migración anterior de waitlist ya se encontró aplicada y marcada DEPRECATED, sin volver a ejecutarla; conserva13 filas históricas de funnel y1 de waitlist.
- Cliente distingue permiso QA del flag global, limpia permiso al cambiar identidad/background y reconsulta la autorización antes del paywall/restore/gestión. Error/red ausente falla cerrado sin bloquear Trial. Suite SQL/cliente verifica que habilitar el flujo no otorga Plus.
- sincronizar-plus versión3 ACTIVE, verify_jwt=true conservado; sin JWT devuelve401. Ahora clasifica entorno sandbox/production desde la transacción devuelta por RevenueCat (suscripción o Lifetime por producto/fecha), no desde flags del cliente. Sin entitlement sigue inactivo; Lifetime mantiene vence_en=null. Se conserva verificación por getUser y secreto server-side. Tests ejecutan el handler con respuestas controladas; todavía falta una compra real de prueba.
- Logout del caso original: auditoría de sólo lectura encontró3 salas Reviewer `jugando`, última actividad de octubre, con miembro dentro del orden y un host. No se cerraron ni declararon vencidas por antigüedad. Se añade confirmación explícita para cuentas recuperables: **Cerrar sesión conservando la partida**. No cambia mesas/memberships/host/fichas/puntos; permite recuperar la misma cuenta después. El invitado no puede evadir su protección. Volver a la partida y Cancelar conservan la sesión.48 escenarios Auth + UI de confirmación pasan; repetir físicamente en v32.
- Site URL cambió de localhost:3000 a la homepage real https://argerichfacu.github.io/Blindly/ mediante config mínimo privado y diff revisado con un único campo declarado. Verificación posterior: Google, callback exacto, anónimo, manual linking y confirmación de correo conservados. **No cambia el hostname OAuth Supabase**. Custom domains: API devuelve entitlement_required, requiere plan Pro+ y add-on; no se contrató ni inventó dominio. El titular no sabe aún si hay dominio propio.

## Resultado técnico del primer AAB32

EAS `26bbfb5d-55fc-4957-b7fe-68cef91275bd`, FINISHED, source97c0c74, code32/name1.0.0. Archivo de referencia G:/Blindly/entregas/Blindly-1.0.0-production-candidate-v32.aab, SHA256 `246ee006d6abfba9c61aa4ba7803f83d8d14948458d70684a977ddb152704c91`. Bundletool/jarsigner pasan; certificado de carga igual a v30/v31, package y Billing correctos, permisos sin delta, cuatro ABI/16KB alignment, Android SDK key correcta, sin Test Store ni archivos de credenciales detectados.

| Medición | v31 | Primer v32 |
|---|---:|---:|
| AAB bytes |108122521|102851105|
| DEX total bytes |71833068|17170456|
| DEX archivos |7|2|
| class_defs |58447|17760|
| method_ids sumados, no únicos |428564|106708|

DEX −76,10%; AAB −4,88% (v32 incluye metadata/mapping comprimidos que v31 no tenía). r8.json efectivo: R8 8.12.14, obfuscation/optimizations/shrinking=true, ProGuardCompatibilityMode=false y optimizedResourceShrinking=true; noOptimizationPercentage18,02. Configuration sin dontoptimize/dontshrink/dontobfuscate globales. **No equivale al resultado DEX de Play.**

Mapping/configuration/usage/seeds/resources/r8.json conservados fuera de Git en G:/Blindly/privado/v32-r8. Mapping del AAB y del tar idénticos, SHA256 `9b666bbb55d90bf6a2e8dc21ef12e8f57b7c2db2ab843727949b1e8df5c18795`. La revisión final con QA privado necesita su propio SHA/mapping y repetir validación; no atribuirle estos hashes.

Los apartados siguientes documentan la preparación inicial. Cuando indiquen pendiente de acceso/catálogo/build/migración, esta actualización registra el avance sin reescribir evidencias históricas.

Actualización 18:47 ART: teléfono conectado/autorizado, v31 desde Play y firma confirmadas. Cuenta protegida administracionblindly@gmail.com con Google; SDK default devuelve los tres paquetes/precios ARS reales e igualdad de identidad. **Etapa catálogo aprobada**, no Gate B completo. Trial disponible sin activarlo; UI y rama de código v31 confirman pagos OFF. Ver [evidencia nueva](payment-rc-gate-b.md). V32 continúa en compilación; repetir su QA. Dominio propio sigue sin confirmar según el titular; no cambiar DNS/Auth por inferencia. CI671828d también success.

02/11/2026, ART. **En preparación; NO aprobada para producción.** Gate A cerrado, Founder Trial conservado y pagos públicos deshabilitados. Sin cambios de package `com.blindly.studio`, firma, entitlement `blindly_plus`, productos ni precios.

## Base y v31

Main partía de `f66d51af91af9f8ffa3e998aa1db332e05e07c3b`. Imágenes locales sin seguimiento preservadas.

API Android Publisher, 18:00 ART: Alpha `31 (1.0.0)`, code31, `completed`; SHA del bundle coincide con `7c120b118467ced47fd434daaff886e3032bef74afd298e50baf75aecec7860d`. Producción/beta sin releases; interno29. Bundles20/22/28/29/30/31: **32 libre en esa consulta**, comprobar otra vez antes de cargar. Se descartó el edit temporal de lectura sin commit. No se ampliaron permisos.

Alpha aprobada no demuestra Gate B. No hay nueva evidencia runtime de v31: catálogo, identidad SDK, precios, compras, restore ni RTDN de compra. Se conserva la evidencia histórica de [Gate B](payment-rc-gate-b.md) y [v31](release-payment-rc-v31.md).

## Aplicación

- Plus ON: `Obtener Plus` aparece antes, durante y después del Trial. El Trial sigue opcional, 72h server-side, una vez por UUID, sin tarjeta ni cobro automático. Pago conserva prioridad `REVENUECAT_PAID`. OFF no muestra compra ni restore; catálogo permanece separado según arquitectura existente.
- Precios visibles desde `product.priceString`; mensual/anual indican renovación automática, Lifetime pago único sin renovación. Paywall RevenueCat y guardas remotas existentes. No hay precios fijos ni pagos externos.
- Waitlist/interés retirados de UX y servicio cliente. Migración `20261102210000_deprecar_waitlist_plus.sql`: DEPRECATED, revoca EXECUTE cliente y conserva historia/tablas/forma de lectura. **Probada localmente, despliegue remoto pendiente**. Las altas desde v31 antigua fallarán tras aplicarla; Trial/catálogo no cambian.
- Un botón Google ES/EN/PT en Acceso e introducción. Servicio elige OAuth normal para invitado vacío seguro; linkIdentity para invitado con datos/Plus o cuenta protegida/legacy. Revalida sesión; Google ya vinculado no duplica identidad. `Vincular Google` queda en Seguridad.
- BLINDLY1 LEGACY/DEPRECATED: sólo recuperar clave existente, recomendar Google/email y conservar UUID. Sin creación nueva en UI; helpers, migraciones y usuarios históricos conservados.
- Logout: lectura actual bajo RLS; no bloquea eliminado que no es host, referencia sin sala, sala finalizada ni host sin memberships. Conserva protección de `jugando`/`pausado`, incluso antigua: edad no prueba abandono. Ofrece `Volver a la partida` con rol/código y explicación. No borra mesas/manos/resultados. **Abandono transaccional seguro y transferencia del host no implementados**; no se ofrece un botón destructivo inseguro. Caso remoto original/timestamps todavía sin reproducir.
- Eliminar mi cuenta sólo en Mi cuenta/Seguridad para identidad recuperable. Ausente en invitado/login/registro/reset/onboarding/legacy recovery. Conserva confirmación y aviso sobre cancelar suscripciones aparte.

## Branding y dominio OAuth

Configuración anterior documentada: Blindly, homepage `https://argerichfacu.github.io/Blindly/`, privacy.html/terms.html; callback `https://ddvbbkwhisuezloorhfg.supabase.co/auth/v1/callback`; retorno `blindly://auth-callback`. No se modificaron URLs, proveedor, sesiones, cookies ni secretos.

**Hostname Supabase no resuelto.** Branding no garantiza cambiar el dominio del mail de Google. Falta verificar estado actual de logo, soporte, authorized domains, audiencia, Site URL y correo real. No se acredita un dominio propio con DNS administrable; sólo GitHub Pages. No se inventó auth.blindly ni subdominio github.io. [Supabase custom domains](https://supabase.com/docs/guides/platform/custom-domains) requiere plan pago/add-on y DNS propio; no se contrató costo. MCP lista otro proyecto inactivo y CLI no tiene access token: falta acceso administrativo al proyecto correcto `ddvbbkwhisuezloorhfg`.

Con dominio acreditado: preparar DNS/verificaciones, añadir callback Google antes de activar, actualizar URLs según guía, preservar deep link y rollback al dominio original. Probar físicamente Google nuevo/existente, cancelación, app cerrada, callback, logout y mail real antes de declarar resuelto.

## R8 / DEX

Base: Expo57.0.31, RN0.86.3, Hermes, Gradle9.3.1; catálogo RN declara AGP8.12.0, comprobar resolución efectiva porque dependencias declaran otra versión. Android generado local: minify OFF, shrink OFF, defaults proguard-android.txt.

Plugin persistente `with-android-release-optimization`: release minify/shrink true, optimized resource shrinking AGP8.12/8.13, sin opt-out full mode, defaults proguard-android-optimize.txt. No modifica debug/Hermes/ABI/firma. No agrega keep global ni dontwarn global; conserva consumer rules RevenueCat/Expo/RN/Reanimated. Usa el mecanismo Expo propio del repo, sin dependencia nueva innecesaria.

Test nativo genera Android en copia temporal y verifica Gradle/propiedades reales. Perfil EAS production-candidate hereda payment-rc/preview/firma local/diagnóstico sanitizado y solicita outputs mapping/release. Descargar mapping/configuration/usage/seeds a almacenamiento privado vinculado al SHA/build; no Git. Registrar r8.json si existe; su ausencia depende de AGP/R8. [Guía oficial](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization).

Referencia v31 medida directamente del AAB: 108.122.521 bytes; 7 DEX, 71.833.068 bytes descomprimidos, 58.447 class_defs y 428.564 method_ids sumados por DEX (incluyen referencias repetidas, no métodos únicos). Sin metadata ProGuard empaquetada. **Pendiente:** build v32, comparación, mapping, versión efectiva AGP/R8, QA minificada y resultado DEX real de Play. Compilar o activar flags no cierra el warning.

## Play / Billing

Listing leído por API: funciones avanzadas Plus y Trial sin tarjeta/compra/suscripción. No afirma gratis para siempre/sin compras; no necesita corrección por esas frases. Modelo app gratuita + compras opcionales; monthly/annual suscripciones, Lifetime compra única. No tocar precios/IDs.

Lecturas Console pendientes: Financial Features, Ads, App access, Target audience, Data Safety, IARC, Privacy, Policy declarations y Needs attention. Mantener “No ofrece funciones financieras” si verdadero; IAP no implica banca/wallet/crypto/apuestas monetarias. Revisar sólo respuestas de productos digitales relevantes. Data Safety debe reflejar UUID/datos comerciales compartidos con RevenueCat/Google. No enviar declaraciones legales por inferencia.

Gate B pendiente con v32 desde Play: instalador/firma de distribución, SDK mismo UUID protegido, all.default y los tres productos/precios localizados. Cuenta administracionblindly@gmail.com, nunca Reviewer. Después verificar license tester y medio de pago de prueba. Allowlist privada tester todavía no implementada: no habilitar pagos globales para sustituirla. Compras/renovación/cancelación/expiración, Lifetime, pending/cancel, restore/reinstalación, RTDN real, sincronizar-plus y accesos_plus pendientes.

## QA y producción

Tests locales no equivalen a QA físico. Repetir en v32 minificada: launch/update v31, onboarding/invitado, Google nuevo/existente/progreso/legacy, email/reset/OAuth cancelado/app cerrada, perfil/nombre/Home, ligas/rankings, partidas/pausa, soundboard, Trial/catálogo, sandbox/restore, RPC, foreground/background, Android Back/logout. Eliminación sólo en cuenta QA descartable. Logcat sanitizado: ClassNotFoundException, NoSuchMethodError, reflection, serialization y errores SDK/Auth.

USB ausente en esta preparación. No se instaló por ADB ni se borró sesión. Controlador local mouse/teclado/Browser no expuesto; no se alteraron sesiones del navegador. Titular indicó no usar TinyFish; se continúa por CLI/API.

Activación futura: sólo tras CI, AAB, Alpha/QA/Auth/R8/DEX, Gate B/Billing, productos activos, review/declaraciones y rollback comprobados, pedir autorización explícita final para producción/pagos. Cargar Alpha NO abre pagos. Rollback comercial por operador autorizado: real_payments_enabled=false sin borrar trials ni accesos pagados; verificar acceso/sincronización con compra cerrada antes de activar al público.

**Production candidate APPROVED: NO. Producción automática: NO.** Build ID/SHA, mediciones y checks se registrarán con evidencia efectiva.

Validación local: npm test completo, TypeScript y lint código0. Pruebas adicionales después:46 escenarios Auth, estados de logout y UI protegida/guest/reset/registro/legacy; generación Android real y Plus ON/OFF simulado. Sin resultados físicos inventados. Logs fuera de Git en G:/Blindly/cache/v32-*.log. La migración se verifica con historial completo PGlite y revocación de permisos, no contra otro proyecto remoto.

Build iniciado: EAS `26bbfb5d-55fc-4957-b7fe-68cef91275bd`, code32/name1.0.0, source `97c0c747bed0c6bbef7c163dced90580edd31a5b`, perfil production-candidate, checkout limpio G:/Blindly/cache/production-candidate-v32. CI [41525792280](https://github.com/ArgerichFacu/Blindly/actions/runs/41525792280): tipos/lint/tests/compatibilidad/auditoría crítica pasan; empaquetado todavía en curso al registrar esta observación. No confundir con build terminado.

CI final del commit de código: **success**, incluido empaquetado web/Android/iOS (02/11/2026 18:13 ART). Escaneo de372 archivos versionados sin patrones de claves privadas/JSON de servicio/claves SDK reales embebidas. El resultado no reemplaza la inspección del AAB.

## Controles solicitados para el cierre

| # | Control | Estado efectivo |
|---|---|---|
|1|CTA Plus|Obtener Plus cuando pagos ON; oculto OFF|
|2|Compra inmediata|Implementada/probada con SDK simulado; real pendiente|
|3|Founder Trial|72h opt-in, sin renovación/cobro; lógica servidor intacta|
|4|Waitlist|UX retirada, historia preservada; revocación remota pendiente|
|5|Google login|Un CTA ES/EN/PT; pruebas locales pasan|
|6|Google link interno|Servicio decide y conserva UUID; Seguridad permite vínculo|
|7|BLINDLY1|Sólo recovery legacy en UI; sin nueva creación|
|8|Google branding|Configuración histórica documentada; verificación actual pendiente|
|9|Dominio OAuth mostrado|Sigue Supabase según evidencia del titular; sin prueba de cambio|
|10|Custom Auth domain|Sin dominio DNS acreditado ni add-on; no modificado|
|11|Logout|Corrección/UX implementadas; QA físico pendiente|
|12|Stale|Eliminado/fuera de orden/huérfana/finalizada/host sin miembros cubiertos; caso remoto original pendiente|
|13|Danger Zone|Sólo cuenta recuperable en Mi cuenta; tests guest/registro/reset/recovery pasan|
|14|R8|Configuración persistente y generación nativa verificadas; build/QA pendientes|
|15|Shrink|Código y recursos activados en release|
|16|Obfuscation|Defaults optimize/full mode; confirmar mapping efectivo|
|17|DEX antes/después|Base v31 medida; v32 pendiente|
|18|Mapping|Solicitado como artefacto; descarga privada pendiente|
|19|Play DEX|Sin resultado v32 todavía|
|20|Financial Features|No cambiar por IAP; lectura actual pendiente|
|21|Billing declarations|Auditoría actual pendiente|
|22|Data Safety|Lectura/reconciliación actual pendiente; no sobrescrita|
|23|Content Rating|IARC actual pendiente|
|24|Store Listing|Leída por API: sin promesa incorrecta gratis/sin compras permanentes|
|25|Gate B|Pendiente de SDK en instalación Play|
|26|Billing QA|Pendiente license tester/allowlist/método sandbox y eventos reales|
|27|Tests|Suite completa y46 casos Auth adicionales pasan local; CI pasa|
|28|Typecheck|Código0 y CI pasa|
|29|Lint|Código0 y CI pasa|
|30|CI|41525792280 success para97c0c74|
|31|EAS v32|26bbfb5d-55fc-4957-b7fe-68cef91275bd iniciado|
|32|SHA-256|Pendiente artefacto terminado|
|33|Alpha|v31 completed; v32 todavía sin cargar|
|34|Bloqueantes producción|Build/AAB/DEX/mapping, acceso administrativo correcto, dominio/branding, declaraciones, Gate B/Billing, QA físico y autorización final|
