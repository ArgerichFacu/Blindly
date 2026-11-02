# Blindly Payment RC — Gate A

01/11/2026 (ART). **Gate A abierto. No se autoriza todavía compilar v31, publicar ni habilitar pagos públicos.** Última entrega local: [v30](release-alpha-v30.md). No se modifican sus binarios ni la configuración de producto.

## Comprobado en esta pasada

- Fuente inicial `6d7eabc` en main. Hay tres imágenes de productos sin seguimiento en assets/store/products/; se conservan sin añadirlas ni alterarlas.
- `.credentials/revenuecat-key.json` y `.credentials/revenuecat-android-public-sdk.txt` están ignorados por Git. El JSON de servicio no existe localmente: no se creó, imprimió ni subió ninguno. Su ausencia local no prueba su estado en RevenueCat.
- Clave pública Android local con prefijo goog_: GET Offerings devuelve HTTP 200, current_offering_id default y cero paquetes para esa app/clave y una identidad sintética de auditoría. La clave no se muestra ni se incorpora al código o al informe. Esto no confirma el package de su app, las credenciales Google, el entitlement ni la importación de productos.
- 01/11/2026 21:47 ART: RPC estado_lanzamiento_plus confirma founder_trial_enabled=true y real_payments_enabled=false. Se usa una sesión de lectura aislada del Reviewer y sólo se cierra esa sesión. No se modifica su cuenta, Plus ni partidas.
- No se dispone aún de navegador conectado para inspeccionar o modificar Google Cloud, Play Console y RevenueCat. TinyFish se solicitó; su instalación/conexión sigue sin confirmar. No se atribuye ningún cambio remoto a esta pasada.

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

## Bloqueo detectado para Gate B

El código actual en src/lib/PlusContext.tsx retorna antes de prepararCompras si real_payments_enabled es false. La vía de comprar/restaurar también llama exigirPagosReales antes de configurar SDK/leer ofertas. Por tanto **compilar con -PlayBilling no basta** para probar Purchases.configure → UUID → getOfferings con pagos públicos apagados.

Este bloque sólo registra el hallazgo. Tras completar Gate A se deberá preparar una lectura/diagnóstico de SDK y ofertas separada de la autorización de compra, manteniendo las comprobaciones de identidad y los guards de compra/restauración/servidor. No se implementa ahora ni se usa real_payments_enabled=true como atajo. El Reviewer conserva su acceso permanente y no sustituye al license tester.

Las referencias locales a com.blindly.app corresponden al bundle iOS y al paquete explícito Plus Demo; no se cambian globalmente. Antes de v31 se cotejarán la app RevenueCat Android, su goog_ y el manifiesto de com.blindly.studio. Los registros históricos no son configuración de producción.

## Secuencia posterior, aún no ejecutada

1. Cerrar los doce puntos Gate A y documentar RTDN o su dependencia real de propagación.
2. Recién entonces autorizar/preparar v31 Payment RC con firma actual, siguiente versionCode, -PlayBilling, goog_ correcta y Founder intacto; real_payments_enabled sigue false.
3. Instalar desde track de Google Play. Verificar configure/UUID, default, los tres packages y precios localizados del dispositivo. GET público de auditoría, mocks o sideload no satisfacen este Gate B.
4. Antes de comprar, preparar license testers seleccionados oficialmente en Play y confirmar el método de pago de prueba. Mensual/anual: compra, renovación/cancelación/expiración; Founder: compra única, lifetime/restore/reinstalación. Completar cancelación de compra, pending, red, reinicio, cambio de cuenta/dispositivo, restore, CustomerInfo, RTDN y sincronizar-plus sin tocar cuentas/partidas reales.
5. No abrir pagos públicos para ejecutar QA; resolver primero un mecanismo acotado para testers, con aprobación y validación separadas. No se ha creado ese mecanismo en esta pasada.

[Pruebas oficiales Play](https://developer.android.com/google/play/billing/test) y [guía sandbox RevenueCat](https://www.revenuecat.com/docs/test-and-launch/sandbox/google-play-store).
