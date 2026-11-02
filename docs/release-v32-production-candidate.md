# Blindly 1.0 — v32 production candidate

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
