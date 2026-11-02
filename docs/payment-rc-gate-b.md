# Payment RC — Gate B

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
