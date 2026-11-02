# Blindly Payment RC — Gate A

01/11/2026 (ART). **Gate A BLOQUEADO por acceso operativo a las consolas; no aprobado. No se autoriza todavía compilar v31, publicar ni habilitar pagos públicos.** Última entrega local: [v30](release-alpha-v30.md); el titular confirma v30 publicada en Play. Sus binarios no se modifican. La separación de lectura/autorización está implementada en fuente y testeada, pendiente de runtime desde Play.

## Comprobado en esta pasada

- Fuente inicial `6d7eabc` en main. Hay tres imágenes de productos sin seguimiento en assets/store/products/; se conservan sin añadirlas ni alterarlas.
- `.credentials/revenuecat-key.json` y `.credentials/revenuecat-android-public-sdk.txt` están ignorados por Git. El JSON de servicio no existe localmente: no se creó, imprimió ni subió ninguno. Su ausencia local no prueba su estado en RevenueCat.
- Clave pública Android local con prefijo goog_: GET Offerings devuelve HTTP 200, current_offering_id default y cero paquetes para esa app/clave y una identidad sintética de auditoría. La clave no se muestra ni se incorpora al código o al informe. Esto no confirma el package de su app, las credenciales Google, el entitlement ni la importación de productos.
- 01/11/2026 21:47 ART: RPC estado_lanzamiento_plus confirma founder_trial_enabled=true y real_payments_enabled=false. Se usa una sesión de lectura aislada del Reviewer y sólo se cierra esa sesión. No se modifica su cuenta, Plus ni partidas.
- TinyFish ya figura instalado, confirmado mediante el catálogo de integraciones después del aviso del titular. Sin embargo, este chat no recibe herramientas operativas de TinyFish; no hay una operación disponible para abrir una sesión de navegador. No se pide reinstalarlo ni se improvisa otro controlador. No se atribuye ningún cambio remoto a esta pasada.
- La ruta C:/Users/facun/Documents/Codex/Blindly-release indicada en el prompt de continuación no existe en este host. Se continúa en el repositorio ya activo G:/Blindly/proyecto, sin crear otra copia en C:.

Evidencia local sanitizada: `G:/Blindly/cache/gate-a-offerings.json` y `G:/Blindly/cache/gate-a-payments-state.json`. No es evidencia del Gate B ni de precios obtenidos por BillingClient.

## Contrato exacto de productos

Estos IDs fueron proporcionados por el titular como productos existentes en Play. Antes de importar, buscar cada uno en la app correcta de RevenueCat y reutilizarlo si ya existe. No duplicar, renombrar ni crear suscripciones mensuales/anuales independientes.

| Google Play / RevenueCat | Package de default | Entitlement | Naturaleza |
| --- | --- | --- | --- |
| blindly_plus:monthly | $rc_monthly | blindly_plus | Suscripción blindly_plus, base plan monthly |
| blindly_plus:annual | $rc_annual | blindly_plus | Misma suscripción, base plan annual |
| blindly_plus_founder_lifetime | $rc_lifetime | blindly_plus | Compra única no consumible; acceso vitalicio |

Founder no se convierte en consumible ni en suscripción. Para el Gate de compras se debe observar expirationDate=null y verificar restore/reinstalación con identidad recuperable, sin asumirlo por el nombre del package.

## Registro del Gate A

| # | Condición exigida | Estado / evidencia |
| --- | --- | --- |
| 1 | Service credentials aceptadas/validables | Pendiente de dashboard y Check credentials |
| 2 | App RevenueCat com.blindly.studio | Pendiente de dashboard; el prefijo goog_ no demuestra package |
| 3 | Monthly importado | No verificado; no visible en default para la clave consultada |
| 4 | Annual importado | No verificado; mismo límite |
| 5 | Founder importado no consumible | No verificado; mismo límite |
| 6 | Los tres unidos a blindly_plus | Pendiente de inspección de entitlement |
| 7 | Offering default correcto | Existe y es current, pero devuelve cero paquetes Android |
| 8 | $rc_monthly → blindly_plus:monthly | No aparece en la respuesta consultada |
| 9 | $rc_annual → blindly_plus:annual | No aparece en la respuesta consultada |
| 10 | $rc_lifetime → blindly_plus_founder_lifetime | No aparece en la respuesta consultada |
| 11 | goog_ de la nueva app correcta | Clave válida para GET; asociación a package pendiente |
| 12 | Sin referencia accidental a la app Android antigua | Config local Android com.blindly.studio; configuración remota pendiente |

Google Cloud, la service account, sus roles, los permisos Play y RTDN requieren además evidencia antes del cierre. No se marca ningún casillero remoto sólo por una guía, un nombre de archivo o la confirmación de que un producto existe en Play.

## Cloud y credenciales: ejecución pendiente

En el proyecto Cloud correcto, comprobar/reutilizar primero la service account y habilitar las tres APIs indicadas por el titular: androidpublisher.googleapis.com, playdeveloperreporting.googleapis.com y pubsub.googleapis.com. Roles previstos: roles/pubsub.editor y roles/monitoring.viewer, sin Owner, Editor global ni Pub/Sub Admin. Si aparece un error que requiera ampliar Pub/Sub, registrar error, estado y fuente y pedir intervención; no elevar automáticamente. [Guía oficial RevenueCat](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials).

Antes de crear una clave, volver a verificar la exclusión de Git. Guardar sólo en `.credentials/revenuecat-key.json`; nunca en EXPO_PUBLIC_*, logs ni documentación. Subirla únicamente a la app RevenueCat com.blindly.studio. Registrar project ID, service account y resultado, nunca private_key, private_key_id ni tokens. Confirmar que RevenueCat la conserva y que pasa validación antes de decidir su almacenamiento/eliminación local conforme a la restricción del titular. No revocar la clave en Cloud al retirar una copia local.

Check credentials debe registrar hora, checks aprobados/fallidos y el error sanitizado. No consta todavía una validación fallida: no hay base para atribuir el estado actual a propagación. Si se identifica propagación, conservar la configuración y observar la ventana indicada por el titular; no recrear service accounts/productos como primer recurso.

## Alcance real de los permisos Play

La guía RevenueCat enumera los cuatro permisos solicitados bajo Account permissions. Google distingue equivalentes por app: **View app information and download bulk reports** y **View financial data, orders, and cancellation survey responses** son de cuenta; sus equivalentes por app son View app information y View financial data. Asignar esos permisos de cuenta da acceso a todas las apps de la cuenta, aunque se haya añadido sólo Blindly en App permissions. No se declarará aislamiento por app en ese caso. [Definiciones oficiales Google Play](https://support.google.com/googleplay/android-developer/answer/9844686?hl=en).

Pendiente: inspeccionar qué alcance admite la consola para Manage orders and subscriptions y Manage store presence, usar el mínimo que permita completar la validación de RevenueCat y registrar cada permiso efectivamente guardado. No se concede Admin ni permiso de publicación. No se afirma que los equivalentes por app satisfagan todos los checks antes de ejecutarlos.

## RTDN pendiente

Tras validar credenciales, conectar la app correcta de RevenueCat a Google y usar el topic propuesto por RevenueCat. Copiar su nombre completo a Monetization setup de Blindly en Play, incluir suscripciones, compras anuladas y todas las compras únicas. Enviar una notificación de prueba y verificar Last received en RevenueCat; registrar topic, alcance y horas. Si falta el publicador Google, su permiso es Pub/Sub Publisher limitado al topic para google-play-developer-notifications@system.gserviceaccount.com. No sustituir este flujo por webhooks Google propios ni ampliar políticas de organización automáticamente. [RTDN oficial RevenueCat](https://www.revenuecat.com/docs/platform-resources/server-notifications/google-server-notifications).

No cambiar por suposición Track new purchases from server-to-server notifications ni el método de identificación: debe preservarse la relación con UUID Supabase y comprobar el efecto sobre CustomerInfo.

## Separación de catálogo y autorización implementada

La continuación del titular autoriza expresamente completar esta separación, sin generar v31 ni aprobar Gate A. En src/lib/plus.ts se añade consultarCatalogoPlus: requiere identidad recuperable, reutiliza la inicialización serializada con el UUID Supabase, lee Purchases.getOfferings().all.default y vuelve a cotejar el App User ID. No llama purchase, restore, paywall, management ni sincronizar-plus.

En src/lib/PlusContext.tsx, una build con PLUS_DISPONIBLE=true y pagos remotos false puede consultar ese catálogo para una cuenta protegida. Se expone sólo internamente mediante usePlus().catalogo y errorCatalogo; refrescar() completa la lectura. Las cuentas invitadas, Plus Demo, el Reviewer y las builds sin SDK válido conservan el camino sin SDK de esta fase. No se cambia la UI comercial ni se añade una pantalla de pago/diagnóstico.

El catálogo se borra al cambiar UUID, salir de sesión o pasar a segundo plano. Sus respuestas tardías se descartan por generación/identidad. Una falla de red/catálogo queda aislada en errorCatalogo y no revoca Trial ni su caché validada; la consulta no mantiene cargando las acciones gratuitas de Trial. CustomerInfo de esta lectura no concede Plus ni escribe accesos_plus.

Comprar, restaurar comercialmente, abrir el paywall y administrar siguen sujetos al doble gate: build/config válida y exigirPagosReales en servidor. No se cambian las flags de build actuales, el backend Trial, su duración, el package, la firma ni las credenciales del cliente. Consultar precios puede usar internamente la conexión del SDK a Play; esto no ejecuta el flujo visual de cobro.

tests/plus-comercial.cjs usa el módulo real con SDK/RPC simulados y comprueba: default aunque current sea otro; UUID; tres productos y priceString conservados; pagos OFF con cero paywall/restore/management/sincronización; CustomerInfo con entitlement que no concede acceso; catálogo vacío que no aprueba Gate A; errores de catálogo sin quitar Trial; cambio de UUID durante getOfferings; build desactivada; Reviewer; caminos ON de compra/restore/management sólo simulados; revocación del servidor antes de una acción. Las pruebas previas de Founder, configuración RevenueCat e identidad concurrente siguen pasando.

Validación local: npm test completo, npm run typecheck, npm run lint y los tests Plus/Founder/RevenueCat aprobados. Logs en G:/Blindly/cache/payment-rc-separacion-*.log. No hay prueba nueva de SDK real/Google Play runtime, precios reales del dispositivo ni compras. Las fixtures no validan el mapeo remoto.

01/11/2026 22:12 ART: RPC de sólo lectura vuelve a confirmar founder_trial_enabled=true y real_payments_enabled=false después de los cambios de código. No se activaron flags de servidor para probar.

Las referencias locales a com.blindly.app corresponden al bundle iOS y al paquete explícito Plus Demo; no se cambian globalmente. Antes de v31 se cotejarán la app RevenueCat Android, su goog_ y el manifiesto de com.blindly.studio. Los registros históricos no son configuración de producción.

## Secuencia posterior, aún no ejecutada

1. Cerrar los doce puntos Gate A y documentar RTDN o su dependencia real de propagación.
2. Recién entonces autorizar/preparar v31 Payment RC con firma actual, siguiente versionCode, -PlayBilling, goog_ correcta y Founder intacto; real_payments_enabled sigue false.
3. Instalar desde track de Google Play. Verificar configure/UUID, default, los tres packages y precios localizados del dispositivo. GET público de auditoría, mocks o sideload no satisfacen este Gate B.
4. Antes de comprar, preparar license testers seleccionados oficialmente en Play y confirmar el método de pago de prueba. Mensual/anual: compra, renovación/cancelación/expiración; Founder: compra única, lifetime/restore/reinstalación. Completar cancelación de compra, pending, red, reinicio, cambio de cuenta/dispositivo, restore, CustomerInfo, RTDN y sincronizar-plus sin tocar cuentas/partidas reales.
5. No abrir pagos públicos para ejecutar QA; resolver primero un mecanismo acotado para testers, con aprobación y validación separadas. No se ha creado ese mecanismo en esta pasada.

## Cierre de este bloque

- **HECHO:** separación de catálogo/autorización en fuente; pruebas de regresión y documentación. Nada nuevo en Cloud, Play o RevenueCat.
- **VERIFICADO:** TinyFish instalado; sin operaciones expuestas a este chat. Suite/tipos/lint locales en verde; Trial ON / Payments OFF. Se conserva la evidencia previa GET HTTP 200/default vacío, sin repetir la consulta remota ni declararla una comprobación nueva.
- **PENDIENTE:** todos los checks remotos señalados en la tabla, especialmente app/key correctas, credenciales aceptadas y los tres productos en default. No se diagnostica propagación ni permisos faltantes sin poder inspeccionar esas consolas. Gate B runtime no ejecutado; v31 no generada.
- **MANUAL/EXTERNO:** falta que la sesión exponga las herramientas del TinyFish ya instalado. No falta una nueva autorización para instalarlo. Una vez operativo, sólo solicitar al titular login/MFA/consentimiento o confirmaciones sensibles requeridas por la consola.
- **SECRETOS:** no se creó, mostró, subió ni versionó una credencial nueva. No se tocó la clave pública local ni se la copió al código. Se conservan las imágenes de productos ajenas a este bloque sin versionarlas.

[Pruebas oficiales Play](https://developer.android.com/google/play/billing/test) y [guía sandbox RevenueCat](https://www.revenuecat.com/docs/test-and-launch/sandbox/google-play-store).
