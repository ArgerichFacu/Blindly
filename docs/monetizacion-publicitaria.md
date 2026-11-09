# Monetización de Blindly: publicidad discreta y clubes

Regla vigente aprobada el 5 de noviembre de 2026. Sustituye cualquier propuesta anterior de banners, anuncios nativos o anuncios repetidos. **Si el usuario empieza a notar demasiado los anuncios, la implementación está mal.**

## Placement único

Un interstitial opcional para Free, precargado mientras el usuario está en Crear sala o Unirse. Sólo después de confirmar explícitamente y de que el servidor complete la creación/incorporación; antes de navegar al lobby. El host también debe haber completado su incorporación. No se espera una carga de publicidad desde esas operaciones. Sin inventario, conexión, consentimiento suficiente o anuncio listo, o ante cualquier error, se continúa directamente.

No hay banners, espacio reservado, cambios de layout ni componentes publicitarios en Inicio, Clubes, Historial, Perfil, Opciones, Estadísticas o Paywall. No se incorporan otros placements. Nunca se dispara publicidad al abrir/cerrar la app, volver atrás, abrir un deep link de recuperación, reconectar, regresar del background, después de un error, en el lobby visible ni durante la partida, manos, turnos, apuestas, reloj, showdown o reparto de pozo.

La respuesta de `unirse_mesa` incorpora `ingresoNuevo`: sólo una incorporación nueva a una sala `esperando` es elegible. Reintentos y reconexiones lo devuelven falso. Una respuesta de un servidor anterior que no incluya la marca se omite. La UI sólo llama al controlador después del éxito del servidor; no hay llamadas desde `useSala`, `/sala` ni los callbacks de auth.

## Frecuencia y sesión

**Máximo una apertura por sesión de aplicación**, compartida entre crear/unirse y entre cuentas. Una reserva de presentación evita doble toque/concurrencia; sólo OPENED consume el cap como impresión. Los fallos inciertos bloquean la publicidad restante sin contarse como una impresión. Nunca se reintenta durante la misma navegación.

Sesión = vida del runtime de la aplicación. Background/foreground, navegación, logout y cambio de cuenta no reinician el cupo. Terminar y volver a iniciar la app crea una nueva sesión. Sólo se conserva un booleano en memoria, sin timestamps de usuario, identificadores publicitarios, AsyncStorage ni tracking entre sesiones. Cambiar a background invalida la transición pendiente; no se precarga ni se presenta nada al regresar. Salir del formulario invalida esa oportunidad. Ante errores del flujo de sala, incluyendo validación o QR inválido, se renuncia a mostrar publicidad durante el resto de la sesión, aunque después se complete otra operación correctamente.

## Plus

Founder Trial, mensual, anual, Founder Lifetime y Play Reviewer eliminan la publicidad. El cliente exige estado Free conocido, sin carga/error y con la misma identidad. El servidor comprueba `private.tiene_plus`, la autoridad vigente que reúne Trial, RevenueCat verificado y Reviewer. Un estado incierto omite publicidad. La activación de Plus o cambio de identidad invalida la precarga. No se importa/inicializa AdMob ni se solicita inventario para usuarios Plus.

## Estado inicial y privacidad

`private.publicidad_config.ads_enabled=false` permanece en el servidor. v35 sólo admite test ads autorizados por `ads_qa_enabled` y una allowlist privada de cuentas protegidas con vencimiento; el flag público por sí solo no habilita esta fase. Tablas privadas con RLS y sin acceso cliente; `estado_publicidad()` devuelve flags/elegibilidad/escenario propios. No hay emails/UUIDs hardcodeados ni override de Plus. Los escenarios privados no_load/show_error/show_timeout permiten probar fallos sintéticos sin cambiar el switch público. No cambian pagos ni Founder Trial.

SDK `react-native-google-mobile-ads` fijado en 17.4.0, compatible con RN0.86; únicamente App IDs de ejemplo de Google y `TestIds.INTERSTITIAL`, también en release. No hay IDs reales ni mediación. Inicialización/importación diferida, medición de app retrasada, requests no personalizados sin keywords, ubicación, contenido o datos de clubes/jugadores. Android bloquea `com.google.android.gms.permission.AD_ID`. No se solicita ATT ni se intenta acceder al IDFA. Web no carga SDK ni anuncios.

Se consulta el estado de red sin pedir IP/MAC; offline o desconocido omite publicidad. La precarga tiene un límite de10s que no retiene la sala; el objeto se descarta a los55min. Sin OPENED en750ms continúa; hay un límite total90s ante CLOSED perdido. El descarte de objetos no garantiza cerrar una actividad nativa ya visible: esta carrera requiere QA de hardware. Las pruebas con SDK falso no acreditan funcionamiento físico. El diagnóstico opt-in sólo registra eventos del SDK, sin identidad ni datos de partida.

UMP se consulta antes de inicializar AdMob. Si no permite solicitar anuncios se omiten. **No se abre automáticamente un formulario de consentimiento en una transición de sala.** El flujo de consentimiento y de opciones de privacidad de producción queda pendiente; no se considera resuelto por usar anuncios no personalizados.

Antes de distribuir una versión con este SDK o activar publicidad: revisar Data Safety y la declaración de anuncios de Play, Advertising ID/permisos y tráfico efectivo del SDK; configurar/revisar UMP y las opciones de privacidad requeridas; actualizar la política pública e interna según el tratamiento real; crear App IDs/unidades reales cuando se autorice; probar en hardware anuncios de prueba, cierre/error/sin inventario/offline, carreras de foreground/navegación y comienzo de partida por otro host durante una transición de unión. No activar unidades reales sin cerrar estos puntos. La política pública actual y la declaración vigente sin anuncios no se modifican silenciosamente mientras esta fase sigue apagada.

## Cupo de clubes

Free puede crear **un club propio en total**. Plus vigente puede crear ilimitados. Cuentan también los clubes archivados: archivar no permite eludir el cupo. Ser miembro/admin de clubes ajenos no lo consume. Unirse y participar sigue siendo Free y mantiene las validaciones de identidad e invitación existentes.

Se conserva todo club legacy, incluyendo cuentas Free con más de uno. Esas cuentas pueden seguir usando/administrando lo existente y no pueden crear más hasta tener Plus. Al vencer Plus se conservan todos sus clubes; sólo se bloquea una creación adicional. No se borran clubes ni resultados.

`crear_liga` verifica cuenta y Plus en servidor y bloquea la fila de la identidad antes de contar e insertar, serializando creaciones del mismo owner en las RPC de PostgREST. Sin escritura directa sobre `ligas`, no se puede sortear desde un cliente alternativo. El error `LIMITE_CLUBES_FREE` se traduce ES/EN/PT y ofrece ir a Plus en la nueva UI.

## Validación y distribución

`npm run test:publicidad` cubre la sesión, doble toque, precarga tardía, errores/timeouts/consentimiento/offline, Plus y los dos handlers de sala; además reconstruye la cadena SQL y prueba cupos, legacy, roles ajenos, archivados, expiración y permisos. Se ejecuta también como `posttest` de la suite general. No reemplaza QA en hardware ni la revisión de tienda.

El titular autorizó posteriormente una nueva v35, versión visible1.35, CI y distribución Alpha; no Production ni ads reales. Su estado, artefacto, auditoría y QA se registran en [release v35](release-v35-1.35-ads-clubes.md). v34 permanece como antecedente y no se reutiliza su artefacto.

Fuentes: [Expo57](https://docs.expo.dev/versions/v57.0.0/), [Expo Network57](https://docs.expo.dev/versions/v57.0.0/sdk/network/), [instalación del SDK en Expo](https://docs.page/invertase/react-native-google-mobile-ads/installation/expo), [interstitial y precarga](https://docs.page/invertase/react-native-google-mobile-ads/ad-formats/interstitial), [consentimiento previo](https://docs.page/invertase/react-native-google-mobile-ads/consent-basics), [Google AdMob interstitial](https://developers.google.com/admob/android/interstitial).

## Preparación para anuncios reales — 08/11/2026

Código listo en `feature/pagos-y-anuncios`; **no activa nada por sí solo**.

- **IDs por configuración.** `ADMOB_ANDROID_APP_ID` (app.config.ts) y `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID` (`src/lib/publicidadUnidad.ts`) se cargan como variables EAS. Sin ellas la build usa los IDs de ejemplo de Google y nunca pide anuncios reales. La configuración falla si hay unidad real sin App ID, App ID de prueba o IDs de cuentas distintas. En desarrollo (`__DEV__`) nunca se usa la unidad real.
- **Dos rutas.** `modoPublicidad()`: QA (`ads_qa_enabled` + allowlist) siempre con `TestIds`; producción sólo con `ads_enabled=true`, Free verificado (`elegible_free`) y unidad real válida. El placement, el cupo de uno por sesión y el fail-open no cambian.
- **Consentimiento UMP al abrir.** `ConsentimientoAnuncios` (en `_layout`) llama a `AdsConsent.gatherConsent()` una vez por runtime, sólo para Free verificado y sólo si el servidor habilita publicidad. Google muestra el formulario únicamente donde la ley lo exige; en el resto resuelve sin UI. Plus nunca carga el SDK.
- **Opciones de privacidad.** Si UMP informa `privacyOptionsRequirementStatus=REQUIRED`, Opciones muestra «Privacidad de anuncios» (`showPrivacyOptionsForm`).
- **Política de privacidad** actualizada (PRIVACY.md, pantalla y docs/privacy.html; la página pública se publica al mergear a `main`).

Activación (orden): unidades reales y mensaje UMP en AdMob → variables EAS → build y publicación → `app-ads.txt` y declaraciones de Play revisadas → recién entonces `ads_enabled=true`, por decisión del titular.

### AdMob configurado — 08/11/2026
- App "Blindly" (Android, vinculada a Play `com.blindly.studio`): App ID `ca-app-pub-4933045860945005~8101071933`.
- Bloque intersticial "Blindly - Sala (interstitial)": `ca-app-pub-4933045860945005/3858574598`. Sin video (sólo texto/imagen/rich media) y limitación de frecuencia de 1 impresión por usuario cada 60 minutos, como respaldo del cupo de la app.
- `app-ads.txt` publicado en `https://argerichfacu.github.io/app-ads.txt` (repo `ArgerichFacu/argerichfacu.github.io`); AdMob debe rastrearlo.
- Privacidad y mensajes: mensaje RGPD publicado (Consentir / No consentir / Gestionar opciones; 8 idiomas; política `https://argerichfacu.github.io/Blindly/privacy.html`) y mensaje de estados de EE. UU. publicado (inglés y español latino).
- Pendiente del titular: perfil de pagos de AdMob, variables EAS y build. `ads_enabled` sigue en `false`.

### Cambio de cuenta de AdMob — 09/11/2026
La cuenta `fargerich48` se había creado por error. Todo AdMob pasa a **administracionblindly** (editor `pub-1093561603360160`): app `ca-app-pub-1093561603360160~1719264904` y bloque intersticial `ca-app-pub-1093561603360160/5619640600` (sin video, 1 impresión cada 60 min). En la cuenta vieja se borraron los detalles de la tienda para liberar el paquete. Variables EAS y `app-ads.txt` actualizados. **Las builds ≤ v38 tienen los IDs viejos**: antes de encender `ads_enabled` hace falta una build nueva.
