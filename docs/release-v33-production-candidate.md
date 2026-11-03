# Blindly v33 — hotfix y candidata previa a producción

03/11/2026 (ART). Trabajo en curso; **NO PRODUCTION READY**. Producción no autorizada; pagos públicos apagados. Gate A se conserva aprobado. V32 permanece intacta: Alpha32 completed verificado por API, SHA256 `90aeb7f1dba81aa5fa3241571ac9a366c8d86b0a332f15332b1dc08c06c362e6`. Código33 libre en Play al iniciar; EAS remoto preparado en33, autoIncrement=false.

## Cambios de v33

El layout anterior tomaba fase=terminado de blindly.inicio.v1 como permiso para entrar al Home, confundiendo tutorial y acceso. Ahora blindly.inicio.v2 conserva fase/paso del tutorial pero reinicia la elección de acceso. El invitado existente verá los tres accesos una vez; Jugar como invitado guarda su elección asociada al UUID actual. Reiniciar conserva esa elección, y un UUID nuevo tras logout vuelve a Acceso. Google, correo confirmado y legacy recuperable van al Home. La migración escribe sólo la clave de inicio nueva y conserva v1; no elimina sesiones, preferencias, historial ni Trial.

La pantalla mantiene un único Ingresar con Google / Sign in with Google / Entrar com Google; la decisión link/login sigue dentro del flujo existente. El guard de progreso del backend incluye Trial y conserva UUID cuando corresponde. Logout conserva el guard de partidas y su confirmación explícita; la navegación final vuelve a la entrada principal, que evalúa la identidad nueva.

Plus separa catalogoDisponible, compraVisible y compraAutorizada. El catálogo válido requiere default y exactamente los tres packages/productos Android previstos, con precios SDK positivos/localizados. Incluye lectura para invitados bajo su mismo UUID; consultar no autoriza Billing ni concede acceso comercial. Obtener Plus es visible con catálogo válido antes/durante/después del Trial aunque el flag global sea false. Usuario normal recibe «Blindly Plus todavía no está disponible para compras.» al pulsar, sin abrir Billing. El permiso privado habilita QA; exigirPagosReales sigue consultándose antes de cada operación y antes del paywall. Restore requiere autorización. Se conserva el paywall nativo de RevenueCat; no se crea uno paralelo.

## Estado remoto y límites

Lectura administrativa: Founder Trial=true, real_payments_enabled=false; un único usuario protegido Google corresponde al tester comercial previsto, allowlist enabled=true, no Reviewer y UUID idéntico a la referencia privada de v32. Sin hardcodear identidad en cliente/migraciones. Pruebas de licencia y track son distintos: el titular confirmó la lista dedicada guardada el02/11; falta lectura visual nueva vía Brave y verificar medio sandbox antes de comprar.

Brave / connector_openai_browser no figura en las herramientas de esta ejecución; búsqueda de plugins tampoco lo ofrece. No se usan Computer Use ni TinyFish. Se conservan sesiones/cookies. La API pública de RevenueCat responde200 y entrega los tres packages Android de default, pero la respuesta consultada no permite verificar la composición publicada ni el Draft: components_config/localizations vacíos. No equivale a demostrar Monthly/Annual/Lifetime visibles. No se dispone de clave administrativa v2 para editar/publicar; no se reutiliza la cuenta de servicio de Play para ello.

Custom Domain y vanity devuelven entitlement_required en el proyecto real. Supabase exige Pro+; [Pro desde USD25/mes](https://supabase.com/pricing), vanity incluido en plan pago; Custom Domain adicional [USD0,0137/h, aproximadamente USD10/mes](https://supabase.com/docs/guides/platform/manage-your-usage/custom-domains). Requiere además dominio propio no acreditado por el titular y su coste de registro. Beneficio: Auth/OAuth con hostname de marca; vanity seguiría bajo supabase.co. No se contrató plan/add-on, no se inventó dominio y no se activó DNS. La URL pública sigue https://ddvbbkwhisuezloorhfg.supabase.co, el callback Google actual sigue vigente y blindly://auth-callback se conserva. Site URL conserva la homepage real ajustada en v32. El hostname técnico NO está resuelto; correo de seguridad Google pendiente de validación real.

El teléfono se conectó después: Samsung A32 autorizado, v32/name1.0.0 instalada desde Play. Está como invitado, no en la cuenta Google QA. Se observó Home directo y Acceso al abrir Mi cuenta: referencia física del defecto que corrige la migración. Se conserva el invitado para probar update v32→v33 sin reinstalar ni borrar datos. En Plus de v32 la vista capturada muestra Trial disponible, sin planes/CTA en esa vista; no se activó Trial ni Billing. Evidencia privada: G:/Blindly/privado/v32-to-v33-baseline.json y v32-plus-baseline.json. Las pruebas físicas de v33, sandbox Billing y QA R8 desde Play no se sustituyen por estos datos ni por pruebas simuladas/sideload.

## Registro solicitado

| Nº | Punto | Estado |
|---|---|---|
|1|Causa login inicial|fase terminado v1 omitía acceso; corregida separación|
|2|Migración inicio|v2, elección por UUID separada de tutorial; v1 preservada|
|3|Fresh install|regresión automatizada; física pendiente|
|4|Update v32→v33|migración/regresión automatizada; Play pendiente|
|5|Logout|nuevo UUID vuelve a Acceso; partidas conservadas; QA física pendiente|
|6|CTA Plus|visible con catálogo válido, independiente del permiso de compra|
|7|Trial|opcional72h; sin tarjeta/suscripción/cobro; compra independiente|
|8|Payment tester|habilitado remoto, UUID conservado, no Reviewer|
|9|License tester|confirmación titular02/11; relectura Brave y diálogo sandbox pendientes|
|10|RevenueCat paywall ID|pendiente de acceso administrativo/Brave|
|11|Draft|no editado/publicado; pendiente|
|12|Monthly|catálogo exacto; representación paywall y compra pendientes|
|13|Annual|catálogo exacto; representación paywall y compra pendientes|
|14|Lifetime|catálogo exacto; representación paywall y compra pendientes|
|15|Precios|product.priceString; no precios fijos ni ahorro porcentual fijo nuevo|
|16|Privacy|privacy.html de Blindly HTTP200; enlace dentro del paywall pendiente|
|17|Terms|terms.html de Blindly HTTP200; enlace dentro del paywall pendiente|
|18|ES/EN/PT|copy cliente traducido; editor RevenueCat pendiente|
|19|Dominio Supabase|hostname técnico sigue presente; no declarar resuelto|
|20|Custom Domain/vanity|bloqueados por plan pago; dominio propio no acreditado|
|21|Coste|Pro desde25USD/mes; custom +10USD/mes aprox.; sin compra|
|22|Google callbacks|sin cambios; mantener viejo al añadir futuro dominio verificado|
|23|EXPO_PUBLIC_SUPABASE_URL|sin cambios; no dominio activo nuevo|
|24|Correo Google|pendiente login real y revisión del aviso|
|25|Gate B|catálogo v31 aprobado; comercial/v33 desde Play pendiente|
|26|Monthly QA|pendiente sandbox físico|
|27|Annual QA|pendiente sandbox físico|
|28|Lifetime QA|pendiente sandbox, no consumible/expiry null|
|29|Restore|guard conservado; pendiente prueba física|
|30|Pending/cancel/restart/reinstall|pendiente prueba física|
|31|RTDN|infraestructura Gate A conservada; transacciones QA pendientes|
|32|R8|plugin/optimización/shrink/obfuscation conservados; mapping v33 pendiente build|
|33|DEX|v32 medido -76,10%; v33 y respuesta Play pendientes|
|34|Play declarations|pendiente revisión UI Brave; no se cambian por inferencia|
|35|Tests|npm test completo pasa; regresiones adicionales de layout/UI/traducciones pasan|
|36|Typecheck|pasa|
|37|Lint|pasa|
|38|CI|fuente cbf23aa success ([41701197151](https://github.com/ArgerichFacu/Blindly/actions/runs/41701197151)); regresiones/documentación 8cc4d37 success ([41707218368](https://github.com/ArgerichFacu/Blindly/actions/runs/41707218368))|
|39|Build v33|[EAS17948428-dbfd-41eb-ac8a-cdd3c557f1c0](https://expo.dev/accounts/facuargerich/projects/blindly/builds/17948428-dbfd-41eb-ac8a-cdd3c557f1c0) en cola; code33/name1.0.0, fuente cbf23aa, perfil production-candidate|
|40|SHA256|pendiente artefacto v33|
|41|Alpha|v32 completed verificado; v33 pendiente|
|42|Blockers|Brave no expuesto; paywall/Draft/declaraciones; EAS en cola y QA v33 Play/Billing pendiente; dominio/coste documentado|

## Antes de producción

Publicar y comprobar el paywall existente con los tres planes, textos reales, precios localizados, renovación correcta y enlaces propios válidos. Sin ensayo gratuito de tienda que sugiera cobro después del Founder Trial. Validar la v33 minificada instalada desde Play: acceso actualizado/invitado recordado/Google/email/logout, navegación/audio/deep links y flujos de Plus. Antes de confirmar cada compra comprobar la cuenta correcta y medio de prueba de Play; cualquier medio real detiene la operación. Registrar CustomerInfo, entitlement, sincronización server-side, RTDN y accesos_plus sandbox. Verificar también rollback de autorización sin pérdida indebida de accesos ya pagados; no aprobar por mocks. Revisar Data Safety, IARC, Ads, App access, Target audience, monetización y Needs attention; app gratuita con compras opcionales no implica funciones financieras. Detener antes de producción y antes de activar pagos públicos.

## Continuación operativa — 03/11/2026 16:57 ART

EAS todavía IN_QUEUE después de unos43minutos; no hay SHA33 ni mapping33 disponibles. No se duplica la build ni se modifica v32. Fuente de la app fija en cbf23aa; el commit posterior8cc4d37 sólo cambia documentación/tests y su CI también pasó. El teléfono está conectado/autorizado y se mantiene el invitado de v32 para la prueba de migración; no se inició sesión Google en este invitado ni Trial/Billing.

Seguimiento local en ejecución: `node G:/Blindly/cache/v33-monitor.cjs`. Consulta el estado de la build enviada y, cuando finaliza, descarga únicamente su AAB/artifact de R8, comprueba code33/commit exacto, bundletool, firma, package, permisos, ABI/16KB, SDK key Android esperada, ausencia de Test Store/credenciales, mapping idéntico al embebido y flags R8. Después mide DEX contra v31/v32 y verifica marcadores compilados de inicio.v2/CTA/permiso tester. No publica nada. Es un proceso de esta PC, no un monitor remoto permanente; su ventana de seguimiento es limitada y no autoriza ninguna aprobación automática de producción/Gate B.

Resultados previstos sólo si las comprobaciones pasan: G:/Blindly/entregas/Blindly-1.0.0-production-candidate-v33.aab y .sha256; validación en G:/Blindly/entregas/validacion-production-candidate-v33/; mapping privado en G:/Blindly/privado/v33-r8/build/outputs/mapping/release/mapping.txt. Aún NO se presentan esos archivos como entregados. Estado/logs: G:/Blindly/cache/v33-eas-state.json, v33-eas-start.log y v33-validate.py.log / v33-r8-validate.py.log. No publicar URLs firmadas de los JSON ni claves/recibos.

Brave fue confirmado habilitado por el titular y se volvió a inspeccionar la ejecución: no expone controlador Browser/Brave ni connector_openai_browser. Se buscó también el plugin y no aparece. Se preservaron sesiones/cookies y no se usó Computer Use ni TinyFish. Para continuar edición/publicación del paywall, revisión de declaraciones y carga Alpha mediante la interfaz pedida hace falta que ese controlador esté realmente disponible; no simular acciones ni afirmar que el Draft fue publicado. No se solicitan nuevas credenciales por chat.
