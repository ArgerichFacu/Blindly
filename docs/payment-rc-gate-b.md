# Payment RC — Gate B

04/11/2026: única v33 FINISHED y AAB validado, build17948428-dbfd-41eb-ac8a-cdd3c557f1c0/sourcecbf23aa. SHA256 `7c539d8361b0b26f5574c8f9096a3b7d67a2869a1143e17e1e953e8faf386fe9`. [Resultado técnico y42puntos](release-v33-production-candidate.md). Alpha aún32; v33 no cargada. Gate B comercial y QA físico de migración no aprobados. Founder Trial=true, global payments=false y tester protegido/UUID conservado revalidados. No se generó otra build ni se tocaron datos del teléfono.

Actualización03/11/2026: Alpha32 completed y SHA final comprobados por API. Permiso privado del tester=true, UUID conservado, global payments=false y Trial=true. Gate B comercial sigue abierto y debe completarse con [v33 desde Play](release-v33-production-candidate.md). La lista de licencia fue confirmada por el titular02/11; falta relectura Brave y observar medio sandbox. No se repiten Gate A ni catálogo ya aprobado. El registro cronológico anterior se conserva a continuación.

Licencia, 02/11/2026: el titular abrió la pantalla real Licencia para testing (/license-tester), creó/seleccionó la lista dedicada Blindly Billing QA con administracionblindly@gmail.com y confirmó guardado. RESPOND_NORMALLY se conserva; listas Alpha/interna no se seleccionan como conjunto para facturación. Es confirmación del titular, no lectura por API. Se habilitó sólo su fila privada, verificada con contexto authenticated en transacción revertida: permiso=true, flag global=false, cero accesos_plus para ese UUID. Antes de confirmar cualquier compra, comprobar en el teléfono cuenta Google correcta y medio “de prueba”; si aparece un medio real, detener.

Actualización posterior: CLI administradora ya accede a Blindly. Lectura directa confirma Founder Trial=true y real_payments_enabled=false. Allowlist privada implementada/aplicada, cuenta administracionblindly@gmail.com registrada deshabilitada; el titular no confirmó estar en Pruebas de licencia. No se iniciarán compras hasta verificarlo y observar medio sandbox. V32 se recompila con permiso de QA separado del flag global; no habilitar pagos públicos. sincronizar-plus clasifica entorno por transacción, sin conceder Plus por estar en la lista. [Revisión actual v32](release-v32-production-candidate.md).

## Evidencia nueva — v31 desde Play, 02/11/2026 18:45–18:47 ART

**Etapa catálogo aprobada. Gate B completo NO aprobado:** compras/restore/RTDN/accesos_plus y revalidación v32 siguen pendientes.

Samsung A32 autorizado: versionCode31/name1.0.0, installer com.android.vending, firma de distribución Play `470d4a3d4462979aaec1c68c29c963fa25496de5acd3174e33932f5ca1974d8f`, coincide con baseline v30. Cuenta en UI Mi cuenta: administracionblindly@gmail.com y Google conectado; no Reviewer. Login completado manualmente por el titular.

Log del PID actual, diagnóstico sanitizado de la build v31: sdkConfigurado=true, identidadCoincide=true, offering=default. La igualdad compara App User ID con el UUID Supabase en código; no se publican UUIDs/tokens.

| Paquete | Producto | Precio real SDK | Moneda |
|---|---|---|---|
|$rc_monthly|blindly_plus:monthly|$ 1.500,00|ARS|
|$rc_annual|blindly_plus:annual|$ 15.400,00|ARS|
|$rc_lifetime|blindly_plus_founder_lifetime|$ 38.400,00|ARS|

Son precios localizados observados, no modificaciones ni fixtures. La primera lectura del helper descartaba JSON porque ReactNativeJS añade comillas al final de la línea: se corrigió sólo el parser local de evidencia y se limitó logcat al PID actual; no se cambió/recompiló v31 para obtener estos resultados.

Founder Trial aparece disponible; no se activó/consumió la prueba. La pantalla muestra la rama v31 Precio previsto/waitlist, sin Ver planes ni Restaurar compras. Evidencia de pagos OFF por predicado de la build validada: en v31 consultarCatalogoPlus sólo se invoca desde !estado.real_payments_enabled; coincide con la UI. No se capturó una respuesta RPC administrativa directa en esta sesión. Sin purchase/restore/management, grants ni escrituras comerciales.

Archivos privados fuera de Git: G:/Blindly/cache/payment-rc-device-v31/evidence.json, catalogue-phase-approval.json, ui-gates.json y base-v31.apk. Evidencia visual privada en G:/Blindly/privado/blindly-v32-qa.xml y blindly-plus-v31*.xml. Los estados pendientes anteriores se conservan a continuación como historia, no invalidan esta nueva observación.

Actualización v32, 02/11/2026 18:00 ART: API Play confirma v31 completed en Alpha y SHA coincidente. Carga/distribución cerradas; runtime, license tester, compras/restore/RTDN/accesos_plus pendientes. USB ausente. Validar con v32 desde Play repitiendo Auth/Plus/R8/logout; ver [candidata v32](release-v32-production-candidate.md).

02/11/2026 (ART). Gate A aprobado en [payment-rc-gate-a.md](payment-rc-gate-a.md); no se repite. **Gate B todavía pendiente de instalación y ejecución desde Google Play.**

## Candidato y cuenta de prueba

- Objetivo: v31, versionName `1.0.0`, siguiente versionCode previsto `31`, package `com.blindly.studio`, firma existente de v30.
- Build EAS con perfil `payment-rc`: hereda `play-testing`, ambiente `preview`, AAB de tienda, Play Billing habilitado y clave pública Android correcta; credenciales de firma locales existentes. No usa RevenueCat Test Store.
- Track previsto: prueba cerrada Alpha actual. La carga/versión efectiva del track debe verificarse antes de distribuir; no se altera producción ni se elimina v30 como operación separada.
- Google Play tester y futuro license tester: `administracionblindly@gmail.com`.
- Cuenta Blindly: protegida con Google usando ese mismo correo; conservar su UUID. No usar `administracionblindly+playreview@gmail.com`, que es Reviewer y no satisface este QA.
- El teléfono no estaba conectado durante la revisión inicial. No se instala por ADB ni sideload para Gate B.

## Estado pre-build

`main` en `b17e3e6` coincidía con `origin/main` tras fetch. Se registra el cierre de Gate A y la preparación en commits llamados `demo`. Las tres imágenes sin seguimiento en assets/store/products se preservan en el repositorio original; el build se prepara desde un checkout aislado y limpio del commit de main.

EAS tenía versionCode remoto `28` y una clave Android distinta de la corregida en Gate A. Se actualizó exclusivamente la clave del ambiente preview y se sincronizó versionCode remoto a `30`, para incrementar a `31` al construir. Supabase URL/key de preview coincidían con el entorno local. El certificado local coincide con v30: `c5b6c355789f93255b188cef762db78de5a1900e286ce3b1ec9475f6c466422f`.

RPC de sólo lectura del 02/11/2026 09:43 ART: `founder_trial_enabled=true`, `real_payments_enabled=false`. No se modificaron flags ni cuentas/partidas; la sesión aislada de lectura se cerró localmente.

## Evidencia runtime requerida

Todos estos puntos siguen pendientes hasta observarlos en v31 distribuida por Play:

| Control | Evidencia requerida |
| --- | --- |
| Procedencia | Instalador Google Play, package/versionCode y certificado de distribución Play cotejados; sin sustituir por firma de carga local |
| Identidad | Cuenta protegida indicada, SDK configurado con UUID Supabase y App User ID coincidente |
| Offering | `Purchases.getOfferings().all.default`, no inferirlo de GET público ni mocks |
| Mensual | `$rc_monthly` / `blindly_plus:monthly` y precio localizado real |
| Anual | `$rc_annual` / `blindly_plus:annual` y precio localizado real |
| Founder | `$rc_lifetime` / `blindly_plus_founder_lifetime` y precio localizado real |
| Seguridad | Payments global false; sin paywall comercial, purchase, restore comercial, managementURL, grants ni escrituras artificiales en accesos_plus |
| Trial | Founder Trial independiente y funcional; la lectura de CustomerInfo no otorga Plus |

El perfil RC habilita sólo un registro observable `[BlindlyPaymentRC]` en logcat. Registra igualdad de identidad como booleano, offering y los campos públicos de productos/precios/moneda devueltos por SDK. No imprime UUID, clave, recibos, CustomerInfo crudo ni errores crudos. No cambia UI ni autorización. Está desactivado fuera del perfil RC. Las fixtures de tests no cuentan como precios reales.

## QA de compras: fase posterior al catálogo

No se permite una compra hasta aprobar el catálogo desde Play y verificar license tester y método de pago de prueba. Track tester y license tester son controles diferentes; no se dan por configurados sólo por el correo elegido.

La arquitectura actual exige `real_payments_enabled=true` en servidor para abrir compra/restore/gestión. No existe todavía un permiso de tester implementado en esta preparación. Después de aprobar catálogo se inspeccionará y, si falta, se añadirá una allowlist privada administrada sólo por operador/service_role. Ser tester sólo autorizará el flujo; no concederá Plus ni escribirá accesos_plus. Payments global seguirá false.

QA pendiente: compra mensual/anual, renovación, cancelación/expiración, Founder no consumible y expirationDate null, restore, restart, logout/login, reinstalación desde Play, cambio de identidad, otro dispositivo compatible, pending/cancelación de flujo, convivencia y vencimiento Trial, CustomerInfo, sincronizar-plus/accesos_plus y RTDN de eventos reales de test. Cada punto se documentará como aprobado, fallido o no ejecutado con evidencia; la notificación de configuración de Gate A no satisface esos eventos.

No se habilitan pagos públicos automáticamente después del QA. No se implementa ni despliega la allowlist antes de aprobar esta primera fase del catálogo.

## Actualización de preparación

AAB v31 EAS terminado y validado: ver release-payment-rc-v31.md. El teléfono quedó autorizado por USB; baseline v30 de Play y certificado de distribución registrados. Track tester agregado/aceptado y cuenta protegida Google correcta observada tras reinstalación v30 expresamente pedida por el titular. Todavía no hay v31 instalada porque el AAB no fue cargado a Alpha. Todos los controles runtime de la tabla siguen pendientes; los datos de fixtures no son precios localizados del teléfono.
