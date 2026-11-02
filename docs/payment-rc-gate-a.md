# Blindly Payment RC — Gate A

02/11/2026 (ART). **Gate A APROBADO.** Credenciales válidas, catálogo Android exacto, tres paquetes en default, RTDN recibido y seis permisos Play identificados. Última entrega local: [v30](release-alpha-v30.md). No se generó v31 ni se modificaron sus binarios. Founder Trial se conserva activo y real_payments_enabled=false; sin producción ni pagos públicos. Gate B (SDK/BillingClient desde Play, precios localizados y compras de prueba) sigue pendiente. La aprobación de Gate A no constituye evidencia de Gate B ni autorización de pagos públicos.

## Historial inicial (los estados posteriores se registran al final)

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

| # | Condición exigida | Estado / evidencia actual |
| --- | --- | --- |
| 1 | Service credentials aceptadas/validables | Tres checks aprobados confirmados por titular y luego dashboard (File saved / Valid credentials) en ea61cb65; JSON nuevo guardado |
| 2 | App RevenueCat com.blindly.studio | Verificada: app0be476b725 / proyecto f4dd7888 |
| 3 | Monthly configurado desde producto Play existente | Alta manual Android prodd404d06bc4, ID blindly_plus:monthly, con catálogo Google de suscripciones/base plans legible y credentials válidas. No importación automática |
| 4 | Annual configurado desde producto Play existente | Alta manual Android prod7c50b9db19, ID blindly_plus:annual, con catálogo Google de suscripciones/base plans legible y credentials válidas. No importación automática |
| 5 | Founder configurado no consumible | Alta manual Android prod021d331dcd, ID blindly_plus_founder_lifetime, no consumible; catálogo Google legible y credentials válidas. Lifetime/restore runtime pendiente de Gate B |
| 6 | Los tres unidos a blindly_plus | Verificado en entitlement entl030c8c5084 |
| 7 | Offering default correcto | Dashboard guardado y GET HTTP 200/current default con tres paquetes Android, 02/11 00:16 ART |
| 8 | $rc_monthly → blindly_plus:monthly | GET: producto blindly_plus / plan monthly |
| 9 | $rc_annual → blindly_plus:annual | GET: producto blindly_plus / plan annual |
| 10 | $rc_lifetime → blindly_plus_founder_lifetime | GET: compra única exacta / plan null |
| 11 | goog_ de la nueva app correcta | Archivo local ignorado corregido con clave observada en app0be476b725; GET posterior con tres paquetes |
| 12 | Sin referencia accidental a la app Android antigua | Catálogo configurado bajo app0be476b725; appcd50009f1f antigua separada. Build futura aún no preparada |

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

## Continuación autenticada — 01/11/2026, 23:14 ART

Se retoma desde `b17e3e6`. Esta sesión sí expone operaciones TinyFish; reemplaza el bloqueo histórico por ausencia de herramientas. No se repiten pruebas de código ni la consulta GET previa de offerings.

### Cloud — configuración guardada según ejecución TinyFish

- Proyecto: `blindly-511407`, número `426581026626`, nombre Blindly. La consola también muestra CommerceBot como otro proyecto; no se modifica.
- APIs confirmadas habilitadas: `androidpublisher.googleapis.com`, `playdeveloperreporting.googleapis.com`, `pubsub.googleapis.com`. Android Publisher se inició en la primera ejecución y quedó confirmado en la segunda; Reporting y Pub/Sub se habilitaron en la segunda.
- No había service accounts en el proyecto. Se creó `revenuecat-play@blindly-511407.iam.gserviceaccount.com` (RevenueCat Play), habilitada.
- Roles guardados y verificados por el navegador: `roles/pubsub.editor` y `roles/monitoring.viewer`. No se concedió Owner, Editor global ni Pub/Sub Admin.
- No se crearon ni descargaron claves. No se modificaron billing ni políticas de organización.
- Evidencia de navegador: https://agent.tinyfish.ai/runs/66071650-8af8-4fb7-9489-8b61255ef6dd y https://agent.tinyfish.ai/runs/30eea0a5-2dea-4ace-9240-0a07d515dee7 . La asociación final con la app Android y las credenciales de RevenueCat sigue pendiente; el nombre del proyecto por sí solo no la prueba.

### Play — acceso todavía pendiente

La ejecución https://agent.tinyfish.ai/runs/d12c2e02-3282-4da7-85af-0869df161fc6 no llegó a mostrar acceso operativo al desarrollador `7160834356197363193`; mostró un flujo de alta y selección de cuenta. Se canceló desde este chat para impedir avanzar con un alta/consentimiento ajeno a Gate A. El mensaje técnico de cancelación dice «by user», pero la cancelación la solicitó el asistente.

No hay resultado final ni evidencia de permisos Play guardados, productos inspeccionados o alta completada. Se reabre la preparación del perfil Default para selección/login manual de la cuenta que tiene acceso al desarrollador existente; no se crea otro desarrollador. No se incluyen enlaces temporales de login en el repositorio.

### Estado al detenerse por acceso

- Gate A sigue abierto: credenciales RevenueCat, app/key correcta, productos, entitlement, packages y RTDN pendientes. No se vuelve a afirmar una validación nueva de `default`; la evidencia previa sigue siendo cero paquetes Android.
- No se modificó código, flags de servidor, Founder Trial, pagos, versiones, tracks ni producción. No se generó v31 ni se ejecutaron compras. Trial ON / Payments OFF conserva la evidencia previa; no se repitió su auditoría RPC.
- Se conservan los assets ajenos sin seguimiento. Sólo se actualiza este documento para registrar cambios remotos y el bloqueo real.
### Reintento tras «save» del titular

La ejecución https://agent.tinyfish.ai/runs/92f1edbe-e104-4fb0-9351-aa82b7c904a4 abrió el desarrollador existente sin índice `/u/1/` y observó la cuenta `mfacundo.argerich@gmail.com`. Play redirigió a `https://play.google.com/console/signup`, mostrando elección de tipo de cuenta. Se detuvo inmediatamente sin avanzar el alta ni modificar permisos/productos. Esto prueba un bloqueo de acceso de esa sesión, no que el desarrollador o Blindly no existan. Falta seleccionar/autenticar en TinyFish la cuenta Google que efectivamente abre el dashboard del desarrollador `7160834356197363193`; no se exige que sea el mismo correo utilizado en Cloud. No hay cambios nuevos en Cloud, RevenueCat, flags, versiones o código.
## Continuación tras cambio de cuenta guardado

### Acceso Play recuperado y configuración guardada

- La ejecución https://agent.tinyfish.ai/runs/aecde404-4848-448d-a731-b13619a7818e abrió el desarrollador existente con `administracionblindly@gmail.com`, app Blindly `com.blindly.studio`, ID de consola `4973954735614463132`. No hubo registro nuevo ni aceptación de términos.
- La ejecución https://agent.tinyfish.ai/runs/f5ec566f-43cf-4613-9470-f7f0fa48f810 añadió la service account `revenuecat-play@blindly-511407.iam.gserviceaccount.com`; estado Activo, sin caducidad. Reportó alcance por app limitado a Blindly y sin permisos de cuenta.
- La revisión puntual https://agent.tinyfish.ai/runs/cd79a622-0687-40a0-b2d1-b704f57a282c confirmó marcados: Ver información de la aplicación (solo lectura), Ver datos financieros, Gestionar pedidos y suscripciones, Gestionar presencia en Play Store y Ver información sobre la calidad de la aplicación (solo lectura); este último deshabilitado en UI.
- **Discrepancia pendiente:** el contador muestra seis permisos, pero el resultado sólo identificó cinco etiquetas marcadas. No se da por demostrado que el sexto sea una dependencia. Antes de cerrar Gate A debe resolverse. La revisión informó Admin, producción, canales de pruebas, edición de borradores, enlaces profundos y políticas sin marcar; no hizo correcciones.

### Productos Play inspeccionados, sin modificarlos

Evidencia: https://agent.tinyfish.ai/runs/f3a1a8ab-db38-4658-b573-d85651ec694a .

- `blindly_plus` tiene base plan `monthly` activo, renovación automática mensual, y `annual` activo, renovación automática anual. No son dos suscripciones independientes.
- `blindly_plus_founder_lifetime` activo como compra única; opción `founder-lifetime`, tipo Comprar, retrocompatible, 174 países/regiones. Esto no prueba todavía el tipo non-consumable en RevenueCat ni expirationDate=null en runtime.
- No se crearon, activaron o renombraron productos; no se modificaron precios ni tracks.

### RevenueCat requiere login en Default

La ejecución https://agent.tinyfish.ai/runs/e11cdcaa-ac69-4cde-b08e-e7114c8c06c2 llegó a `https://app.revenuecat.com/login` sin sesión autenticada. No pudo inspeccionar el proyecto/app, credenciales, productos, entitlement ni offering, y no modificó RevenueCat. Esto no demuestra ausencia de service credentials en su dashboard: sólo ausencia de acceso autenticado del navegador. Se reabre la preparación de Default para login manual de RevenueCat conforme a la autorización previa del titular; no se registra el enlace temporal ni se solicitan contraseñas en chat.

Gate A sigue abierto. La evidencia previa de `default` con cero paquetes Android no se repitió ni se sustituyó por la mera existencia de productos en Play. Cloud conserva las tres APIs y la service account; todavía no se creó/descargó una clave JSON. No se cambió código, Founder Trial, real_payments_enabled, producción, versiones o v31. Sólo se actualiza este documento; se conservan los assets ajenos.
## RevenueCat y default — 02/11/2026, 00:16 ART

### App y catálogo correctos

Proyecto `f4dd7888`, app `app0be476b725` (Blindly Play Store v2), package `com.blindly.studio`. La app antigua `appcd50009f1f` usa `com.blindly.app`; no se usa para esta configuración.

La primera ejecución autenticada, https://agent.tinyfish.ai/runs/372bdc18-ff94-4269-9175-19f313bef879 , encontró solamente productos Test Store y guardó asociaciones de esos productos en default. Esos cambios no satisfacían Gate A. También informó modo de compatibilidad «SDK v6+ and backwards compatible» sin evidencia antes/después suficiente para afirmar si lo cambió; queda registrado como incertidumbre.

La continuación dirigida al catálogo Android https://agent.tinyfish.ai/runs/182a10f9-be8f-4daf-8d5c-ef4e6c28ac2b creó manualmente, tras verificar su ausencia en esa app:

| Producto Android | ID RevenueCat | Tipo |
| --- | --- | --- |
| blindly_plus:monthly | prodd404d06bc4 | Suscripción blindly_plus / base plan monthly |
| blindly_plus:annual | prod7c50b9db19 | Suscripción blindly_plus / base plan annual |
| blindly_plus_founder_lifetime | prod021d331dcd | No consumible |

No se importaron automáticamente de Play: falta JSON de servicio. Se añadieron las asociaciones Android a `$rc_monthly`, `$rc_annual`, `$rc_lifetime` de `default` (`ofrng2c5553db79`), conservando las asociaciones Test Store.

La ejecución https://agent.tinyfish.ai/runs/c76bc5e0-fbec-4500-92ea-d5fe756d4060 confirmó los tres productos Android adjuntos a `blindly_plus` (`entl030c8c5084`) y conservó los seis productos Test Store. Hubo toast de guardado. Un paso intermedio mencionó desadjuntar productos Play y el informe final confirmó los tres correctos adjuntos; no se afirma que no hubo operaciones intermedias.

### Clave local corregida y respuesta de default

La ejecución https://agent.tinyfish.ai/runs/2a5af800-2496-4a05-8490-a54bf6f43c96 observó la clave pública de la app correcta. Su resultado incluyó la clave pública pese a la instrucción de no devolverla; no se copia aquí ni al código. No es una clave privada de servicio. Su explicación sobre base64/hashing y su afirmación de mappings vacíos no son evidencia fiable: contradicen la configuración guardada y la lectura posterior.

La comparación local confirmó que la clave observada no coincidía con `.credentials/revenuecat-android-public-sdk.txt`. Se corrigió únicamente ese archivo ignorado, sin modificar código/build. La consulta de las 00:11 ART con la clave anterior seguía devolviendo cero paquetes. Tras corregirla, a las **00:16:02 ART**, GET offerings devolvió HTTP 200, current `default` y:

- `$rc_monthly` → platform_product_identifier `blindly_plus`, plan `monthly`.
- `$rc_annual` → platform_product_identifier `blindly_plus`, plan `annual`.
- `$rc_lifetime` → `blindly_plus_founder_lifetime`, plan null.

Evidencia sanitizada actualizada en `G:/Blindly/cache/gate-a-offerings.json`. **Quedó resuelto el bloqueo de cero paquetes Android para la clave local correcta.** No es validación BillingClient, precios localizados ni Gate B.

### Credenciales y límite real del controlador

La app correcta muestra el cargador de Service Account Credentials JSON sin archivo cargado. No se ejecutó Check credentials ni se obtuvieron checks aprobados/fallidos. No se atribuye esto a propagación. No se generó/descargó/subió ninguna clave privada. Se volvió a verificar que `.credentials/revenuecat-key.json` está ignorado y no existe.

TinyFish confirmó que el navegador remoto no puede escribir en `G:/Blindly/proyecto/.credentials/revenuecat-key.json` ni trasladar el archivo entre su sandbox y ese path local. Por esa restricción del documento no se generó una clave que quedaría en otro entorno. La afirmación del resultado de que generar una clave necesariamente invalidaría otras no se adopta: no se observó tal efecto.

Falta resolver la entrega segura del JSON desde Cloud a la app RevenueCat correcta, guardar y validar credenciales. RTDN sigue sin evidencia de topic, prueba y Last received: una mención genérica del primer informe no demuestra su configuración. No se modificó el seguimiento de compras por notificaciones ni la identificación.

Gate A sigue abierto por credenciales, RTDN y sexto permiso Play sin identificar. No se cambia Founder Trial ni real_payments_enabled; se conserva la evidencia previa ON/OFF sin repetir auditoría RPC. No hay producción, compras públicas, v31 ni cambios de código. El titular propone revisar tareas oficiales de TinyFish para obtener USD 5 ante saldo bajo; se investiga sin comprar saldo ni aceptar condiciones por suposición.
## Desvío autorizado: tareas de crédito TinyFish — 02/11/2026, 00:32 ART

El titular pidió completar las tareas oficiales de inicio para sumar saldo. Sesión inicial (USD 1) y MCP (USD 2) ya figuraban completados. La ejecución `4e8ab361-a396-4c29-a7cc-8e80541aedd8` no acreditó fondos y consumió saldo; su intento de playground no satisfizo una primera llamada API. La continuación `19f6387a-ad86-4241-b5f2-39074095f197` encontró una API key existente y terminó sin ejecutar la llamada. Su saldo final estructurado fue USD 1,84, frente a USD 1,368 antes y costo de 33 pasos (USD 0,528): diferencia compatible con USD 1 de bono durante esa ejecución. El informe narrativo interno no reconoció ese crédito y no se usa como saldo final.

Se ejecutó luego una llamada real gratuita a Search API siguiendo la documentación oficial, usando la clave existente y mostrando sólo HTTP status; resultado HTTP 200. `get_wallet` inmediatamente posterior confirmó **USD 2,84**. El incremento de USD 1 tras la llamada está confirmado. En conjunto se recuperaron los USD 2 pendientes del bono de USD 5; los otros USD 3 eran previos. No hubo compra de fondos, tarjeta ni auto-reload.

El controlador devolvió una API key secreta en su resultado pese a la instrucción de no exponerla. No se copia al repositorio ni a este documento, ni se solicita al titular por chat. Se usó sólo como header hacia la API oficial de TinyFish; no se creó otra ni se rotó la existente. Se recomienda su rotación por la exposición en la salida de la herramienta; no se da por hecha. Gate A conserva el estado anterior: tres paquetes Android verificados; credenciales JSON/validación, RTDN y sexto permiso Play pendientes. No hay cambios de código, pagos, versiones o producción en este desvío.
## Continuación Gate A tras tareas de saldo — 02/11/2026

La revisión dirigida https://agent.tinyfish.ai/runs/1a1c9dd3-b51b-41b0-a694-c18fada4d9c7 observó cuatro permisos marcados en el modal por app (información, datos financieros, pedidos/suscripciones, presencia). Contador seis persistente; no pudo inspeccionar por completo permisos de cuenta ni explicar la diferencia. Sus hipótesis sobre herencia/Admin no son evidencia: Admin, producción y canales de pruebas fueron observados sin marcar. No hubo cambios. Se mantiene pendiente el alcance completo y no se repite otro intento idéntico con el mismo controlador.

La intervención requerida para el JSON deriva de la regla de este documento: «Guardar sólo en `.credentials/revenuecat-key.json`». TinyFish no puede escribir en ese path local; tampoco hay un puente de archivo seguro confirmado. No se generó una clave remota ni se relajó esa regla.

Próximo paso concreto del titular en navegador local: en Cloud `blindly-511407`, abrir la service account existente `revenuecat-play@blindly-511407.iam.gserviceaccount.com`, pestaña Keys, crear una clave JSON y guardarla sólo como `G:/Blindly/proyecto/.credentials/revenuecat-key.json` (ignorada por Git). Subir ese archivo únicamente en la app RevenueCat `app0be476b725` / `com.blindly.studio`, Service Account Credentials JSON, y guardar. Nunca pegar su contenido en chat. Si aparece consentimiento sensible o restricción de organización, detenerse sin elevar permisos ni crear otra cuenta. Después el asistente puede retomar checks de credenciales y RTDN desde TinyFish; no necesita recibir el contenido privado.

RTDN sigue dependiente de validar credenciales conforme a la secuencia documentada; no se conecta un topic por suposición. El GET con tres paquetes no se repitió en esta continuación. No hay cambios en código, Founder Trial, real_payments_enabled, producción, pagos públicos ni v31.
## JSON local recibido y discrepancia con dashboard — 02/11/2026

El titular creó `G:/Blindly/proyecto/.credentials/revenuecat-key.json`. Se inspeccionaron sólo metadatos sanitizados: JSON válido, type service_account, project_id blindly-511407, client_email revenuecat-play@blindly-511407.iam.gserviceaccount.com, presencia/forma PEM esperada y campos requeridos presentes. `git check-ignore` confirmó exclusión. No se imprimió private_key, private_key_id, client_id ni tokens. Esta revisión de estructura no valida criptografía ni permisos remotos. Ya no aplica la afirmación histórica de que el archivo local no existe.

El titular aportó captura del bloque rojo «Service account credentials need attention / We were unable to validate your credentials», con View details y Check again. La captura no muestra URL ni checks individuales; confirma un fallo general mostrado en su pantalla, no su causa.

La ejecución https://agent.tinyfish.ai/runs/e410e616-d443-4a12-9394-3e97f0ec6458 abrió app0be476b725/com.blindly.studio pero reportó cargador vacío y aviso de subir/guardar credenciales, sin View details ni Check again. No pudo ejecutar la revisión ni aportar checks concretos. Se registra discrepancia entre la captura del titular y esa lectura, sin invalidar la captura ni diagnosticar propagación/permisos por suposición. Hace falta el detalle mostrado por View details y confirmar URL/app del panel donde aparece el error. No se generó/reemplazó/revocó clave, no se amplió ningún rol y no se modificó catálogo, flags, producción o v31.
## Error de validación aislado — 02/11/2026, 08:38 ART

La captura Credentials Validation Details del titular muestra:

- Fallo: Can validate Google Play subscription purchases. Tip: otorgar acceso a app más View financial data, orders, and cancellation survey response y Manage orders and subscriptions en Play.
- Aprobado: Can read the Google Play in-app product catalog.
- Aprobado: Can read the Google Play subscription catalog and base plans.

Con autorización de Gate A se ejecutó una consulta local de diagnóstico, sin compra real: clave privada leída sólo en memoria desde el JSON ignorado, JWT RS256 y OAuth scope androidpublisher, token transitorio no impreso/guardado. OAuth respondió HTTP 200. GET purchases.subscriptionsv2 con package com.blindly.studio y token de compra explícitamente sintético/inválido respondió HTTP 401, reason permissionDenied, mensaje «The current user has insufficient permissions to perform the requested operation». No se consultó una compra/usuario real ni se ejecutó purchase, acknowledge, cancel, refund o defer. La respuesta sólo diagnostica acceso efectivo rechazado; no prueba que un permiso global sea imprescindible ni descarta propagación.

Evidencia sanitizada: G:/Blindly/cache/gate-a-service-access.json; script sin secretos embebidos: G:/Blindly/cache/gate-a-service-access.cjs. No se imprimieron claves, IDs privados, JWT ni access tokens.

Inspección dirigida https://agent.tinyfish.ai/runs/ffcf12af-7b31-488c-840f-5914b9be5621 :

| Alcance | Permiso | Estado observado |
| --- | --- | --- |
| Cuenta | Ver datos financieros, pedidos y respuestas a encuestas de cancelación | Desmarcado |
| Cuenta | Gestionar pedidos y suscripciones | Desmarcado |
| Blindly por app | Ver datos financieros | Marcado/guardado |
| Blindly por app | Gestionar pedidos y suscripciones | Marcado/guardado |

No se modificó ningún permiso. La hipótesis del informe TinyFish sobre necesitar un rol IAM «Google Play Developer API client» no se adopta: no aporta evidencia y el probe ya pidió explícitamente el scope androidpublisher con OAuth 200.

La guía oficial RevenueCat pide los cuatro permisos bajo Account permissions: https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials . La ampliación de financieros/pedidos a nivel cuenta afecta todas las apps; se prepara como cambio concreto de dos permisos para confirmación del titular por su alcance sensible. No se da por necesaria ni suficiente antes de probarla. La documentación también admite propagación hasta 36 horas; no se diagnostica como causa confirmada ni se recrean claves/cuentas/productos por suposición. No se modifican descripciones de productos para forzar propagación sin necesidad demostrada.

Se conserva Founder Trial activo, real_payments_enabled false, sin producción/pagos públicos/v31. Gate A sigue abierto, RTDN pendiente de la secuencia de validación y sexto permiso todavía sin resolver.
## Dos permisos de cuenta autorizados y guardados — 02/11/2026, 08:43 ART

El titular respondió «si, autorizo» a la ampliación explícita de financieros/pedidos para todas las apps. La ejecución https://agent.tinyfish.ai/runs/70c3bf37-5eba-49a2-8d11-307c390b876e activó exactamente estos dos permisos de cuenta para revenuecat-play@blindly-511407.iam.gserviceaccount.com:

- Ver datos financieros, pedidos y respuestas a encuestas de cancelación.
- Gestionar pedidos y suscripciones.

Guardó, confirmó el diálogo ordinario y reabrió Account permissions con ambos marcados. Preservó permisos por app; no añadió Admin/publicación ni otros permisos de cuenta. El alcance financiero/pedidos ya no está aislado a Blindly. La mención de correo de administrador en el informe difiere de inspecciones previas; no se usa como evidencia de cambio de identidad, ya que el target fue el desarrollador/service account explícitos.

Se preservó el probe anterior en G:/Blindly/cache/gate-a-service-access-before-account-permissions.json y se repitió una vez tras el guardado. A 08:43:31 ART: OAuth200, compras subscriptionsv2 con token sintético 401 permissionDenied, mensaje de permisos insuficientes. Evidencia nueva en gate-a-service-access.json. El cambio está guardado pero su efecto aún no está validado; no se concluye éxito ni propagación como causa confirmada.

La revalidación RevenueCat https://agent.tinyfish.ai/runs/4f28e9ef-ebfc-41d1-8001-69d74f0bd70d volvió a reportar app0be476b725/com.blindly.studio sin JSON/Check credentials, aun tras refresh. No pudo ejecutar Check credentials. Esta lectura contradice las capturas del titular que muestran fallo con catálogos aprobados; se mantiene discrepancia de panel/estado. No se elimina ni reemplaza el archivo. Se necesita la URL completa del panel que muestra los checks para resolver el destino/estado efectivo antes de otra ejecución idéntica. La lectura también reportó RTDN sin conexión, sin topic visible; no se inició OAuth ni configuración RTDN.

Gate A sigue abierto. Mantiene default con tres paquetes en la última evidencia, Founder Trial ON y real_payments_enabled OFF sin nuevos RPC. No se modificaron código, versiones, builds, producción ni pagos públicos; v31 no generada.
## Credenciales válidas y conexión RTDN — 02/11/2026, 08:59 ART

El titular confirmó JSON nuevo guardado y respondió explícitamente «Sí, los tres aprobados». No se repitieron probes de compra ni cargas de JSON tras esa confirmación. La ejecución https://agent.tinyfish.ai/runs/ea61cb65-5989-4175-ad27-dd228535364a finalmente observó app0be476b725/com.blindly.studio con File saved / Valid credentials y tres checks aprobados. La discrepancia histórica de cargador vacío queda superada por esta observación; los 401 anteriores no se presentan como estado actual después del JSON nuevo.

La misma ejecución conectó Google Developer Notifications desde RevenueCat y reportó topic `projects/blindly-511407/topics/Play-Store-Notifications`. Track new purchases from server-to-server notifications estaba desmarcado y se conservó; la opción de detección App User ID no estaba presente en esa vista y no se cambió.

La ejecución https://agent.tinyfish.ai/runs/a96ef8f2-73cf-4367-aa65-2e43344cf555 reportó guardar ese topic en Play con «Suscripciones, compras anuladas y todos los productos únicos». Sin embargo, no ejecutó una prueba demostrable de Play: hizo clic en «Send a test?» de RevenueCat y dejó Last received sin notificaciones. Su informe se contradice al confundir `rc-0be476b725` con un topic. No se acepta esa conclusión ni se cambia el topic por ella. El guardado de Play queda reportado, sin reconfirmación independiente en la ejecución siguiente.

### Pub/Sub comprobado directamente, sólo lectura

Para resolver la contradicción se usó el JSON local sólo en memoria para OAuth cloud-platform hacia APIs oficiales Google. Resultado HTTP 200:

- Único topic listado: `projects/blindly-511407/topics/Play-Store-Notifications`.
- Suscripción: `projects/blindly-511407/subscriptions/RevenueCat-Subscriber-app0be476b725`.
- Topic de esa suscripción: exactamente el anterior.
- Host del push endpoint: `api.revenuecat.com` (se omite su URL completa y cualquier secreto).
- No hay más páginas de topics/subscriptions.

Evidencia sanitizada: `G:/Blindly/cache/gate-a-pubsub-state.json`. La lectura de IAM del topic devolvió 403 PERMISSION_DENIED, «User not authorized to perform this action». Ese error corresponde a getIamPolicy, no al publicador Google; no demuestra ausencia del Publisher. No se amplió ningún rol, no se concedió Pub/Sub Admin ni se modificaron políticas.

### Prueba Play aún no ejecutada

La ejecución dirigida https://agent.tinyfish.ai/runs/1c98e75d-086d-4435-8731-87f7752b6fdd no encontró/clicó Enviar notificación de prueba. La ruta heredada `/edit/playserver/monetize` redirigió al panel; el enlace observado en UI para configuración es `/monetization-setup`. No hubo toast de éxito/error de envío ni timestamp Last received. No se atribuye la ausencia de recepción a tránsito/propagación sin evidencia de envío real.

Paso concreto restante en navegador del titular: abrir Monetizar con Play → Configuración de monetización de Blindly, verificar topic completo y cobertura, guardar si hace falta y pulsar Enviar notificación de prueba de Google Play. Comunicar resultado sanitizado; luego verificar Last received en RevenueCat. Esto es una limitación de navegación del controlador, no falta de autorización ni login confirmado como fallido. No se repite la misma navegación pagada. Saldo TinyFish informado al terminar: USD 0,31; no se compra recarga ni se activa auto-reload.

Gate A no aprobado: falta prueba real RTDN recibida y resolver/registrar el detalle completo del contador de permisos, manteniendo los dos permisos globales autorizados. No se modifica código, Founder Trial, real_payments_enabled, versiones, producción ni pagos públicos. No se genera v31. No se cambian Track new purchases ni el método de identidad.
## Prueba RTDN ejecutada por el titular: envío fallido — 02/11/2026

Nueva captura de Play muestra notificaciones activadas, topic exacto `projects/blindly-511407/topics/Play-Store-Notifications` y error «No se ha podido enviar la notificación de prueba». El texto pide comprobar formato, configuración Cloud y permisos. Esto confirma configuración visible y un intento real fallido de envío desde Play; reemplaza la ausencia previa de evidencia de intento. No aporta código que pruebe por sí solo cuál permiso falta.

El topic ya fue confirmado existente por API. Siguiente comprobación concreta: IAM de ese topic debe conceder `roles/pubsub.publisher` a `serviceAccount:google-play-developer-notifications@system.gserviceaccount.com`, según guía oficial RevenueCat/Google. La service account local no puede leer getIamPolicy (403 ya registrado), por lo que no se afirma ausencia de binding ni se intenta ampliar su rol para inspeccionarlo. Se indica al titular verificar/agregar ese único binding en el topic desde su sesión propietaria; no usar IAM global, Pub/Sub Admin, otro topic ni nueva clave. Retestar en Play y luego Last received en RevenueCat. Gate A sigue abierto; ningún cambio de flags/código/versión/pagos.
## Prueba RTDN enviada correctamente desde Play — 02/11/2026

Tras la indicación de conceder al publicador Google el rol Publicador de Pub/Sub sobre el topic, el titular aportó captura de Play → Configuración de monetización con:

- Notificaciones en tiempo real activadas.
- Topic `projects/blindly-511407/topics/Play-Store-Notifications`.
- Selección «Suscripciones, compras anuladas y todos los productos únicos».
- Toast visible «Notificación de prueba enviada».

Esta evidencia reemplaza el fallo de envío anterior y confirma envío exitoso desde Play. La captura del selector de roles anterior muestra la opción Publicador de Pub/Sub, pero no es por sí sola una lectura de la política IAM guardada: no se inventa esa verificación independiente. Sigue pendiente observar Last received en RevenueCat app0be476b725 con hora reciente, para confirmar recepción extremo a extremo. No se marca Gate A aprobado sólo por el envío. No hay compras ni cambios en flags, código, versiones o producción.
## RTDN recibido en RevenueCat — 02/11/2026, 09:32 ART

El titular aportó captura de RevenueCat con «Valid credentials», «Connected to Google» y «Last received 2026-11-02, 12:32 p.m. UTC», equivalente a **02/11/2026 09:32 ART (UTC−03:00)**. Acompañó el topic completo `projects/blindly-511407/topics/Play-Store-Notifications`, coincidente con el configurado en Play y con la consulta API Pub/Sub previa. El campo de topic de la captura está visualmente truncado; el texto completo del titular y la evidencia API resuelven su identificación.

La recepción, sumada al toast de envío de Play, confirma la prueba RTDN extremo a extremo. No queda pendiente validar recepción ni se vuelve a diagnosticar propagación de credenciales. No se hizo una compra ni se modificó el seguimiento de compras nuevas o identidad.

### Estado técnico actualizado

- Credenciales: tres checks aprobados, confirmados por titular y dashboard.
- App/key Android: app0be476b725/com.blindly.studio y archivo público local corregido, ignorado.
- Catálogo/entitlement/default: tres productos Android exactos, Founder no consumible, entitlement blindly_plus; GET default con tres packages correcto. Los productos se dieron de alta manualmente en RevenueCat, sin duplicar productos Play ni convertir base plans en suscripciones separadas. No se afirma importación automática.
- RTDN: topic y suscripción push a RevenueCat comprobados; cobertura Play completa; envío exitoso y recepción 09:32 ART confirmados.
- Las doce condiciones técnicas de la tabla tienen evidencia del estado exigido; los renglones de catálogo mantienen precisión sobre alta manual. No hay runtime BillingClient, precios localizados ni compras Gate B.
- **Pendiente documental/alcance antes de aprobación final:** Play había mostrado seis permisos por app; las lecturas del controlador no identificaron consistentemente todas las etiquetas. Se conocen los cuatro solicitados y se observó lectura de calidad, pero no el sexto completo; no se inventa una dependencia. Los dos permisos de cuenta financieros/pedidos fueron autorizados y guardados, con alcance global declarado. Se requiere captura completa del modal de permisos de Blindly o evidencia equivalente para registrar todos los permisos efectivamente guardados según la regla de este documento. No se concede Admin/publicación ni se modifica nada para resolver el contador.

Gate A permanece abierto sólo por ese cierre de alcance; RTDN y credenciales ya están aprobados. Founder Trial sigue activo y real_payments_enabled false según la evidencia previa, sin repetir RPC. No se genera v31, no se cambia código ni se publica producción/pagos públicos.
## Cierre final: Gate A APROBADO — 02/11/2026

Las cuatro capturas completas de permisos aportadas por el titular identifican las seis casillas marcadas de Blindly:

| # | Permiso observado | Estado visual |
| --- | --- | --- |
| 1 | Ver información de la aplicación (solo lectura) | Marcado, editable |
| 2 | Ver información sobre la calidad de la aplicación (solo lectura) | Marcado, deshabilitado |
| 3 | Ver datos financieros | Marcado, deshabilitado |
| 4 | Gestionar pedidos y suscripciones | Marcado, deshabilitado |
| 5 | Gestionar presencia en Play Store | Marcado, editable |
| 6 | Gestionar declaraciones de políticas | Marcado, deshabilitado |

El banner indica «Algunos permisos se conceden automáticamente por tener permisos a nivel de cuenta». Se registra el estado visual y no se atribuye sin prueba cada dependencia concreta. El sexto permiso faltante era **Gestionar declaraciones de políticas**, no un permiso de publicación.

Las mismas capturas muestran desmarcados: Administrador (todos los permisos), Editar y eliminar borradores de aplicaciones, Lanzar a producción/excluir dispositivos/usar firma Play, Lanzar aplicaciones en canales de pruebas, Gestionar canales de pruebas y editar listas de testers, Responder a reseñas y Gestionar enlaces profundos. No se modificó ninguna casilla para este cierre.

Se conserva explícitamente el alcance global previamente autorizado de los dos permisos de cuenta financieros/pedidos. No se declara aislamiento total por app. Los permisos de la service account Cloud siguen limitados a Pub/Sub Editor y Monitoring Viewer según la configuración guardada; no se concedieron Owner/Editor global/Pub/Sub Admin. La política Publisher del publicador Google no fue leída por la service account local, pero envío Play y recepción RevenueCat quedaron demostrados; no se afirma una lectura IAM que no ocurrió.

### Resultado y límites

**Gate A aprobado:** las doce condiciones, el alcance de permisos y la prueba RTDN exigidos están resueltos. El alta manual de los productos RevenueCat conserva los IDs exactos de los productos Play existentes, sin renombrarlos/duplicarlos en Play; queda diferenciada de una importación automática. La aprobación acredita configuración y conectividad de esta fase, no una compra real.

- Founder Trial permanece activo; real_payments_enabled=false se conserva sin cambios y sin repetir auditoría RPC.
- Sin producción ni pagos públicos. No hubo cambios de código ni nuevos binarios/versiones. **v31 no generada.**
- Gate B pendiente: preparar posteriormente una Payment RC autorizada, instalar desde Play, verificar SDK con UUID recuperable, tres packages/precios localizados, compras/restores de testers y eventos de ciclo de vida. No se ejecuta en este cierre.
- Track new purchases from server-to-server notifications sigue desactivado; no se cambió identificación ni se alteraron cuentas/partidas.
- La copia local de credenciales permanece ignorada; no se elimina ni revoca sin una decisión específica. No se incorporan secretos al documento ni al repositorio.
- Assets/store/products ajenos a este trabajo se conservan sin seguimiento. Único archivo versionado modificado en este cierre: docs/payment-rc-gate-a.md. No se crea commit automáticamente.

Evidencias visuales sanitizadas conservadas fuera del repositorio en G:/Blindly/cache/gate-a-permissions-1.png a gate-a-permissions-4.png, gate-a-rtdn-play-sent.png y gate-a-rtdn-received.png. Las capturas de permisos contienen configuración visible, no claves privadas.