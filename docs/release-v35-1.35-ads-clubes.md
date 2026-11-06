# Blindly 1.35 — anuncios de prueba y cupo de clubes

06/11/2026 (ART). **IMPLEMENTACIÓN EN VALIDACIÓN — NO PRODUCTION READY.** El titular autorizó versionCode35, versión visible1.35, commit `demo`, push a `main`, nueva build y distribución primero en Alpha; prohíbe Production, anuncios reales y cambios de pagos como consecuencia de este trabajo. Package y firma actuales se conservan.

## Estado real inicial

`main` local partió de `c10f655`, con integración AdMob17.4.0 y cupo Free ya aplicados. `git status` sólo tenía `assets/store/products/` sin seguimiento: se preserva y se excluye del trabajo/build. Los commits locales anteriores no se pierden ni se reemplazan. Play Console mostró Alpha34(1.0.0), código máximo visible34 y ningún35 cargado; producción sin release. RevenueCat conserva `default` y los tres paquetes Android correctos: monthly→`blindly_plus:monthly`, annual→`blindly_plus:annual`, lifetime→`blindly_plus_founder_lifetime`. No se modifican productos, precios, restore, SDK key o Billing.

Supabase inicial: `ads_enabled=false`, `real_payments_enabled=false`, `founder_trial_enabled=true`. El tester comercial protegido existente es Free y no había usado Trial. SamsungA32 autorizado por USB, lectura actual code34/name1.0.0; no se reinstala ni se borra. Las afirmaciones del pedido sobre ausencia de SDK correspondían a un estado anterior/remoto; se conserva la implementación local y se completa.

## Arquitectura publicitaria

`usePublicidadSala` es el único punto de integración en Crear/Unirse; no hay anuncios ni espacios reservados en layouts. Prepara en segundo plano sólo con Plus resuelto como Free, app activa, origen compatible y autorización del servidor. El SDK se importa/inicializa de forma diferida; no hay código publicitario en el motor de poker. Deep links/recovery y vuelta de background invalidan la oportunidad, sin precarga o presentación al regresar.

Tras crear sala, el host completa también su incorporación. Tras unirse por código/QR, el servidor debe haber aceptado realmente la incorporación. Ambos handlers pasan por el controlador central entre éxito servidor y navegación al lobby. Se exige `ingresoNuevo=true` y `sala.estado=esperando`. Reintentos/reconexiones devuelven falso desde el servidor; los servidores sin la marca omiten el anuncio. Nunca se carga publicidad esperando en esa transición. Si el objeto no está READY, la sala continúa inmediatamente y esa navegación no reintenta.

La sesión es la vida del runtime. Hay reserva de presentación en curso para evitar doble toque y concurrencia; **el cap se consume como impresión únicamente con OPENED**. Máximo una apertura por sesión entre ambos flujos y cuentas. Los fallos inciertos bloquean publicidad el resto de la sesión sin registrarlos como impresiones. Los errores del flujo de sala, incluso validación/QR, también descartan publicidad hasta la sesión siguiente. Logout, navegación y background no reinician el cap. No hay tracking histórico, storage de impresiones ni identificadores propios persistentes.

La precarga falla silenciosamente, tiene timeout10s y caduca a55min; la operación de sala no espera ninguna de esas etapas. `show` tiene defensa de750ms sin OPENED y límite total90s ante CLOSED perdido. Errores de carga/show, inventario, red, consentimiento o Plus incierto omiten publicidad. `destroy` y limpieza también fallan sin propagar error de publicidad al juego. Los tiempos, descarte nativo y carreras se aceptan únicamente con QA de hardware; los mocks no acreditan que el SDK pueda cerrar una presentación nativa ya visible.

## Autoridad remota y QA

`private.publicidad_config.ads_enabled=false` permanece globalmente. La nueva migración `20261106063046_ads_qa_v35.sql` agrega `ads_qa_enabled=false` y `private.ads_qa_testers` con UUID, enabled y caducidad. Ambas tablas tienen RLS y clientes sin SELECT/INSERT/UPDATE/DELETE. El RPC autenticado `estado_publicidad` devuelve únicamente flags propios y elegibilidad Free; valida usuario vigente y fuente Plus existente. No utiliza metadata editable, email/UUID hardcodeado en la app ni conceder Plus.

v35 sólo permite anuncios TEST cuando el switch privado QA y la fila protegida/vigente correspondiente autorizan al usuario. El flag público por sí solo no permite inventario en esta fase. Personas Free fuera de allowlist y cualquier Plus/Trial/Reviewer omiten todas las solicitudes. Migraciones QA y `20261106065317_ads_qa_escenarios.sql` aplicadas/registradas: ambos switches false y0filas QA; permiso propio leído por RPC con `ads_qa_enabled=false`, escenario null. Se conservan6clubes/45resultados y pagos públicos=false. El grant al tester se realiza sólo durante QA físico y se revoca al finalizar. Escenarios privados normal/no_load/show_error/show_timeout permiten ensayos de fallo sintético, diferenciados de un error real del SDK y sin fabricar impresiones.

SDK mantenido: `react-native-google-mobile-ads`17.4.0, Google Mobile Ads Android25.5.0 (backend classic), Expo Network57.0.3, RN0.86.3/Expo57. Sólo App IDs oficiales de ejemplo Android `ca-app-pub-3940256099942544~3347511713`, iOS `ca-app-pub-3940256099942544~1458002511`; interstitial Android `ca-app-pub-3940256099942544/1033173712`, iOS `ca-app-pub-3940256099942544/4411468910`, mediante `TestIds.INTERSTITIAL`. No hay IDs reales, mediación ni inventario monetizable. No se mandan nombres, correos, clubes, códigos o resultados al SDK. Requests no personalizados, sin keywords, ubicación ni content URLs; medición de app retrasada.

## Clubes, legacy y concurrencia

`crear_liga` es la autoridad. Free puede crear un club propio, incluyendo archivados en el conteo. Admin/member ajeno no consume cupo; unirse/participar sigue Free. Trial/Reviewer y entitlement comercial verificado permiten ilimitados. Expirar Plus no borra nada: conserva clubes/administración básica y bloquea creaciones adicionales. Se preservan clubes Free legacy con más de uno.

El conteo/entitlement/insert se serializa mediante bloqueo de la fila `auth.users` del owner en la transacción RPC. El cliente no tiene escritura directa en tablas. Se conserva mensaje comercial traducido y CTA `Ver Blindly Plus`; Plus agrega `Clubes propios ilimitados`, distinguiendo propiedad de membresía.

**Concurrencia real remota aprobada06/11 a03:41ART:** identidad protegida descartable; dos requests paralelos por PostgREST: uno creado y uno `LIMITE_CLUBES_FREE`; reintento bloqueado, exactamente un club, sin club fantasma. La identidad/club descartables se eliminaron al terminar. Evidencia privada `G:/Blindly/privado/v35-concurrencia-clubes.json`; script opt-in `scripts/probar-cupo-clubes-servidor.mjs`. Esta comprobación no altera al tester comercial, sus clubes ni su Trial. Tests SQL locales cubren además20clubes ajenos con roles admin/member, legacy, archivados y pérdida de Plus.

## Privacidad, Data Safety y consentimiento

Se actualizan `PRIVACY.md`, `docs/privacy.html` y pantalla interna ES/EN/PT. Describen AdMob, placement, cap, Plus sin ads y estado público OFF/test QA. Se retira la afirmación general de ausencia de publicidad. La política diferencia no enviar datos de juego de los datos técnicos que Google puede tratar; no afirma ausencia global de tracking.

La [declaración oficial de Google para SDK25.5.0](https://developers.google.com/admob/android/privacy/play-data-disclosure) informa IP, interacciones, diagnósticos e identificadores técnicos. IP puede revelar ubicación aproximada; tratamiento para publicidad, medición y fraude. Bloquear AD_ID no elimina IP ni todos los identificadores. No se decide Data Safety sólo por usar test IDs. **Formulario Play pendiente de auditar/actualizar con el artefacto final y comportamiento observado**; documentar recogida/compartición, finalidad, obligatoriedad y estados existentes sin borrar la declaración de compras.

La configuración elimina `com.google.android.gms.permission.AD_ID` mediante manifest merger, opción soportada por Google; falta verificar el manifiesto del AAB final. No se solicita IDFA/ATT en esta fase. UMP consulta `canRequestAds` antes de inicializar: si falla o requiere un consentimiento ausente, omite el anuncio. No se fuerza un formulario en una transición ni se pide consentimiento a usuarios con ads OFF/sin QA. No se sustituye consentimiento por NPA. Flujo y opciones de revocación EEA/UK/CH, regiones aplicables y configuración de CMP deben completarse antes de activar monetización real; no están declarados cerrados por esta fase de test.

Contains ads, Advertising ID, Data Safety, Privacy URL, App content, Content Rating, target audience y Needs attention se revisarán con Console después de cargar el AAB35. No se altera ninguna declaración a ciegas ni se reintenta el cuestionario IARC que el titular pidió dejar, salvo una instrucción posterior específica. Sin Production.

## Versión, CI, artefacto y distribución

Objetivo Android `versionName=1.35`, `versionCode=35`. El package npm privado usa semver1.35.0; no altera el nombre visible solicitado. Se actualizan únicamente los patches Expo57 recomendados que explicaban el fallo CI previo. No se desactivan checks ni se cambia de SDK mayor/RN/Billing. R8/full mode, ofuscación, shrinking y resource shrinking permanecen; no se agregan keep globales.

Validación local aprobada: `npm test` completo y nuevos tests Ads/cupo/QA, TypeScript, `npm run lint`, traducciones/legales, bundles web/Android/iOS; Expo compatibility y doctor21/21. `npm audit --omit=dev --audit-level=critical` pasa con0críticas; conserva7avisos de dependencias de producción(4moderadas/3altas), sin forzar cambios de SDK mayor para ocultarlos. Advisors remotos conservan56avisos de las categorías previas, sin errores nuevos; la comprobación de permisos privados y RPC está cubierta por SQL. El diagnóstico opt-in de candidata registra sólo eventos fijos `[BlindlyAdsQA]`, sin UUID/email/tokens ni datos de juego; permite contar load/OPENED/CLOSED y distinguir fallos simulados sin enviar telemetría externa propia.

Commit fuente `demo`, push/main y CI: pendientes. Después de CI verde y EAS: validar AAB/firma/código/nombre/ABI/16KB/DEX/R8/Billing/AdMob/test IDs/ausencia de secretos; descargar mapping sólo a carpeta privada; SHA256. Subir a Alpha, revisar declaraciones reales e instalar desde Google Play para aceptación. No sideload como prueba final. El Samsung ya estaba en34 desde Play y el titular fue autorizado a desconectarlo durante CI/build; se solicitará conexión cuando35 esté disponible.

|Control|Estado|
|---|---|
|Build EAS35 / fuente / hash|Pendiente|
|Alpha35 / revisión Play|Pendiente|
|QA Ads crear/unirse/fail-open/cap/background/nueva sesión|Pendiente físico|
|QA Plus/Founder cero requests/show|Pendiente físico|
|QA clubes Free/Plus/expiración y conservación|Pendiente físico; SQL y concurrencia remota aprobados|
|Data Safety / Contains ads / AD_ID / demás declaraciones|Pendiente artefacto final y Console|
|UMP para inventario real / unidades reales|Fuera de activación de esta fase; bloquea ads reales|
|Ads reales / pagos públicos / Production|OFF / sin cambios / NO|

**No pasar al Production Gate hasta cerrar artefacto, CI, declaraciones y QA físico.** `ads_enabled` debe terminar FALSE incluso si el QA pasa; test ads sólo QA, sin adoptar unidades reales.
