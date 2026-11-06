# Monetización de Blindly: publicidad discreta y clubes

Regla vigente aprobada el 5 de noviembre de 2026. Sustituye cualquier propuesta anterior de banners, anuncios nativos o anuncios repetidos. **Si el usuario empieza a notar demasiado los anuncios, la implementación está mal.**

## Placement único

Un interstitial opcional para Free, precargado mientras el usuario está en Crear sala o Unirse. Sólo después de confirmar explícitamente y de que el servidor complete la creación/incorporación; antes de navegar al lobby. El host también debe haber completado su incorporación. No se espera una carga de publicidad desde esas operaciones. Sin inventario, conexión, consentimiento suficiente o anuncio listo, o ante cualquier error, se continúa directamente.

No hay banners, espacio reservado, cambios de layout ni componentes publicitarios en Inicio, Clubes, Historial, Perfil, Opciones, Estadísticas o Paywall. No se incorporan otros placements. Nunca se dispara publicidad al abrir/cerrar la app, volver atrás, abrir un deep link de recuperación, reconectar, regresar del background, después de un error, en el lobby visible ni durante la partida, manos, turnos, apuestas, reloj, showdown o reparto de pozo.

La respuesta de `unirse_mesa` incorpora `ingresoNuevo`: sólo una incorporación nueva a una sala `esperando` es elegible. Reintentos y reconexiones lo devuelven falso. Una respuesta de un servidor anterior que no incluya la marca se omite. La UI sólo llama al controlador después del éxito del servidor; no hay llamadas desde `useSala`, `/sala` ni los callbacks de auth.

## Frecuencia y sesión

**Máximo un intento de presentación por sesión de aplicación**, compartido entre crear/unirse y entre cuentas. Se reserva antes de invocar `show`, evitando doble toque y concurrencia. Un fallo de presentación consume ese intento; no se reintenta para incrementar impresiones.

Sesión = vida del runtime de la aplicación. Background/foreground, navegación, logout y cambio de cuenta no reinician el cupo. Terminar y volver a iniciar la app crea una nueva sesión. Sólo se conserva un booleano en memoria, sin timestamps de usuario, identificadores publicitarios, AsyncStorage ni tracking entre sesiones. Cambiar a background invalida la transición pendiente; no se precarga ni se presenta nada al regresar. Salir del formulario invalida esa oportunidad. Ante errores del flujo de sala, incluyendo validación o QR inválido, se renuncia a mostrar publicidad durante el resto de la sesión, aunque después se complete otra operación correctamente.

## Plus

Founder Trial, mensual, anual, Founder Lifetime y Play Reviewer eliminan la publicidad. El cliente exige estado Free conocido, sin carga/error y con la misma identidad. El servidor comprueba `private.tiene_plus`, la autoridad vigente que reúne Trial, RevenueCat verificado y Reviewer. Un estado incierto omite publicidad. La activación de Plus o cambio de identidad invalida la precarga. No se importa/inicializa AdMob ni se solicita inventario para usuarios Plus.

## Estado inicial y privacidad

`PUBLICIDAD.ads_enabled=false` en el cliente y `private.publicidad_config.ads_enabled=false` en servidor. Ambos deben permitir anuncios; cambiar únicamente el servidor no puede activar esta candidata. La tabla es privada, con RLS y sin acceso de lectura/escritura de clientes. `estado_publicidad()` devuelve sólo el switch y la elegibilidad propia. No cambia los flags de pagos ni Founder Trial.

SDK `react-native-google-mobile-ads` fijado en 17.4.0, compatible con RN0.86; únicamente App IDs de ejemplo de Google y `TestIds.INTERSTITIAL`, también en release. No hay IDs reales ni mediación. Inicialización/importación diferida, medición de app retrasada, requests no personalizados sin keywords, ubicación, contenido o datos de clubes/jugadores. Android bloquea `com.google.android.gms.permission.AD_ID`. No se solicita ATT ni se intenta acceder al IDFA. Web no carga SDK ni anuncios.

Se consulta el estado de red sin pedir IP/MAC; offline o desconocido omite publicidad. La precarga tiene un límite de10s que no retiene la sala; el objeto se descarta a los55min. Si la presentación no abre ni devuelve error en750ms se destruye y continúa, sin mostrar un anuncio tardío sobre el lobby. Una presentación abierta continúa al cerrarse o fallar. Estos tiempos y el comportamiento nativo requieren QA real: las pruebas con SDK falso no acreditan funcionamiento físico.

UMP se consulta antes de inicializar AdMob. Si no permite solicitar anuncios se omiten. **No se abre automáticamente un formulario de consentimiento en una transición de sala.** El flujo de consentimiento y de opciones de privacidad de producción queda pendiente; no se considera resuelto por usar anuncios no personalizados.

Antes de distribuir una versión con este SDK o activar publicidad: revisar Data Safety y la declaración de anuncios de Play, Advertising ID/permisos y tráfico efectivo del SDK; configurar/revisar UMP y las opciones de privacidad requeridas; actualizar la política pública e interna según el tratamiento real; crear App IDs/unidades reales cuando se autorice; probar en hardware anuncios de prueba, cierre/error/sin inventario/offline, carreras de foreground/navegación y comienzo de partida por otro host durante una transición de unión. No activar unidades reales sin cerrar estos puntos. La política pública actual y la declaración vigente sin anuncios no se modifican silenciosamente mientras esta fase sigue apagada.

## Cupo de clubes

Free puede crear **un club propio en total**. Plus vigente puede crear ilimitados. Cuentan también los clubes archivados: archivar no permite eludir el cupo. Ser miembro/admin de clubes ajenos no lo consume. Unirse y participar sigue siendo Free y mantiene las validaciones de identidad e invitación existentes.

Se conserva todo club legacy, incluyendo cuentas Free con más de uno. Esas cuentas pueden seguir usando/administrando lo existente y no pueden crear más hasta tener Plus. Al vencer Plus se conservan todos sus clubes; sólo se bloquea una creación adicional. No se borran clubes ni resultados.

`crear_liga` verifica cuenta y Plus en servidor y bloquea la fila de la identidad antes de contar e insertar, serializando creaciones del mismo owner en las RPC de PostgREST. Sin escritura directa sobre `ligas`, no se puede sortear desde un cliente alternativo. El error `LIMITE_CLUBES_FREE` se traduce ES/EN/PT y ofrece ir a Plus en la nueva UI.

## Validación y distribución

`npm run test:publicidad` cubre la sesión, doble toque, precarga tardía, errores/timeouts/consentimiento/offline, Plus y los dos handlers de sala; además reconstruye la cadena SQL y prueba cupos, legacy, roles ajenos, archivados, expiración y permisos. Se ejecuta también como `posttest` de la suite general. No reemplaza QA en hardware ni la revisión de tienda.

Este trabajo no reconstruye ni reemplaza el AAB v34 de Alpha y no autoriza un rollout Production. Los cambios de UI/SDK requieren otra build autorizada; el backend puede aplicar el cupo de forma compatible sin borrar datos. Estado de despliegue y comprobaciones se registran en el informe de release existente.

Fuentes: [Expo57](https://docs.expo.dev/versions/v57.0.0/), [Expo Network57](https://docs.expo.dev/versions/v57.0.0/sdk/network/), [instalación del SDK en Expo](https://docs.page/invertase/react-native-google-mobile-ads/installation/expo), [interstitial y precarga](https://docs.page/invertase/react-native-google-mobile-ads/ad-formats/interstitial), [consentimiento previo](https://docs.page/invertase/react-native-google-mobile-ads/consent-basics), [Google AdMob interstitial](https://developers.google.com/admob/android/interstitial).
