<p align="center">
  <img src="assets/images/blindly-logo-transparent.png" alt="Blindly" width="260" />
</p>

# Blindly

Estado comercial Android (9/10/2026): Play Console está **pagada**, con verificación de identidad pendiente. Plus todavía no procesa compras de Google. [Auditoría, mapping RevenueCat, build y pasos exactos de activación](docs/plus-comercial-android.md).

**Tu mesa de poker presencial, conectada.** Blindly acompaña partidas de Texas Hold’em con cartas físicas: organiza la sala, las ciegas, los turnos y las fichas, mientras cada jugador participa desde su celular.

Aplicación desarrollada con Expo, React Native, TypeScript y Supabase. La rama `main` reúne el trabajo de las etapas anteriores y es la referencia para instalar y continuar el proyecto.

## Qué podés hacer

- Crear una sala y compartir su código o QR para reunir de 2 a 10 jugadores.
- Configurar los asientos, el stack inicial, el modo de fichas y los niveles de ciegas.
- Usar presets de torneo o editar niveles y descansos; controlar el reloj con avisos sonoros y vibración.
- Mantener un dealer fijo mientras el botón y las ciegas rotan entre los jugadores, incluido el caso de dos participantes.
- Seguir el turno de apuesta y el estado de la mesa en tiempo real; cada jugador declara su propia acción desde el celular.
- Elegir invitado o cuenta recuperable en la bienvenida y recorrer una guía rápida de tres pasos, sin exigir registro para jugar.
- Aprender póker con ejemplos, combinaciones y una herramienta Free para seleccionar cartas y resaltar la mejor mano de cinco.
- Activar el modo principiante para consultar las reglas y los montos de tu turno, sin recomendaciones de estrategia.
- Elegir tema verde, rojo o negro e idioma español, inglés o portugués.
- Controlar música, ambiente, efectos y botonera por separado, con silencio global persistido. [Audio y reacciones](docs/audio.md). [Dirección Poker Room y tutorial interactivo](docs/direccion-poker-room.md).
- Activar música de ambiente y consultar tu puntuación e historial personal.
- Crear clubes Free con cuenta recuperable, temporadas, roles owner/admin/member, historial y ranking compartido.
- Guardar mesas habituales Plus con jugadores de referencia, fichas, ciegas, duración, tema y liga opcional.
- Consultar estadísticas avanzadas, historial completo y comparaciones privadas entre amigos con Plus.
- Ver un recap con ganadores, puntos y cambios reales de MVP y, con Plus, compartir una tarjeta vertical.
- Personalizar con Plus la identidad de tu club; los títulos y cosméticos se conservan al vencer.
- Consultar historial de clubes por páginas y activar vibraciones opcionales en momentos importantes. [Detalle](docs/personalizacion-recap.md).

Blindly acompaña la mesa: las cartas se reparten físicamente y el dealer determina los ganadores. El evaluador educativo usa cartas ingresadas manualmente y no decide repartos en una partida real. La bienvenida, el aprendizaje y la ayuda están documentados en [inicio.md](docs/inicio.md) y [aprender-poker.md](docs/aprender-poker.md).

## Dos modos de fichas

| Modo | Funcionamiento |
| --- | --- |
| **Virtuales** | La app lleva stacks, ciegas, apuestas y pozos. En su turno, cada jugador confirma el monto para igualar o ingresa el total de su subida; también puede pasar, retirarse o ir all-in. El dealer se encarga de repartir los pozos entre los jugadores habilitados. |
| **Físicas** | Las fichas y apuestas se manejan en la mesa. Cada jugador declara pasar, igualar, subir o retirarse desde su celular; solo el dealer puede corregir stacks, cerrar la mano y entregar el pozo. |

El flujo virtual contempla las rondas de apuestas, las subidas mínimas, los all-in y los pozos secundarios. Las acciones y repartos se validan en Supabase; los jugadores no pueden asignarse fichas por su cuenta.

## Puntuación y privacidad

Al finalizar un torneo se asignan puntos una sola vez. Se parte de la escala `25, 18, 15, 12, 10, 8, 6, 4, 2, 1` y se eliminan los valores más altos según la cantidad inicial de participantes:

| Jugadores | Puntos por posición, de primero a último |
| --- | --- |
| 10 | 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 |
| 6 | 10, 8, 6, 4, 2, 1 |
| 3 | 4, 2, 1 |
| 2 | 2, 1 |

Las eliminaciones simultáneas se ordenan por el stack previo; si persiste el empate, comparten posición y promedian los puntos de los puestos ocupados. El historial se conserva aunque se elimine la sala.

Con una cuenta protegida, cada jugador consulta sus propios puntos e historial. Free recibe sus 10 resultados más recientes; el historial anterior permanece guardado y aparece completo al activar Plus. Las comparaciones entre amigos solo agregan resultados de partidas compartidas y nunca revelan el historial ajeno. Los demás participantes solo ven la posición global al compartir una sala. El acceso se controla mediante políticas y funciones de la base de datos.

## Empezar en otra PC

Necesitás Git, Node.js 22.13 o superior compatible con Expo SDK 57, npm y acceso al proyecto Supabase.

```powershell
git clone --branch main https://github.com/ArgerichFacu/Blindly.git
cd Blindly
npm ci
Copy-Item .env.example .env
```

En macOS o Linux, reemplazá el último comando por `cp .env.example .env`. Completá el archivo con la URL y la clave pública del proyecto:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=TU_CLAVE_PUBLICA
EXPO_PUBLIC_EMAIL_AUTH_READY=false
```

Las variables `EXPO_PUBLIC_*` forman parte del cliente. Usá exclusivamente una clave pública de Supabase, nunca `service_role`, contraseñas ni secretos. El archivo `.env` está excluido de Git; podés transferirlo de forma privada entre tus equipos.

Para comprobar y abrir la app:

```powershell
npm run typecheck
npm test
npx expo start --web --lan --port 8090
```

Abrí `http://localhost:8090` en la PC. Desde un celular en la misma red, usá `http://IP-DE-LA-PC:8090`; podés consultar la IPv4 con `ipconfig`. Permití Node.js en el firewall de redes privadas si Windows lo solicita. El escáner QR web puede necesitar HTTPS fuera de localhost; en ese caso ingresá el código de sala.

La PC sirve la aplicación, mientras Supabase mantiene las sesiones, los datos y la sincronización. Se necesita conexión a Internet. Cambiar de PC no requiere migrar la base de datos ni volver a ejecutar las migraciones del proyecto existente.

Guía completa: [host local](docs/host-local.md).

### Actualizar una copia existente

Conservá primero cualquier cambio local pendiente. Después:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
npm ci
```

## Identidad y recuperación

Podés entrar como invitado sin registrar un correo. Desde **Mi cuenta** podés generar una clave privada para recuperar el mismo UUID, puntos, historial y compras en otro dispositivo. La clave se muestra una sola vez y puede rotarse; Blindly solo conserva su hash seguro dentro de Supabase Auth.

La recuperación por clave ya funciona sin un proveedor externo. La interfaz también incluye vinculación por código de correo para conservar el UUID y la puntuación cuando se configure SMTP. Los cambios de identidad no fusionan cuentas y tienen controles para evitar reemplazar un invitado con partidas puntuadas, compras o una partida activa. Desde **Mi cuenta** también se puede eliminar la identidad, la puntuación y el historial; una Edge Function autenticada impide hacerlo mientras exista una partida activa.

**La recuperación por correo todavía está deshabilitada por defecto**, pero ya no bloquea la identidad recuperable porque la clave privada cubre ese caso. Falta configurar un proveedor SMTP, aplicar las plantillas y verificar el envío. Solo después debe habilitarse `EXPO_PUBLIC_EMAIL_AUTH_READY=true`.

Detalles: [identidad recuperable y build nativa](docs/identidad-y-build.md). La [política de privacidad](PRIVACY.md), los [términos de uso](TERMS.md) y las [instrucciones de eliminación](ACCOUNT_DELETION.md) están versionados en el repositorio. Sus páginas web están preparadas en `docs/` y quedarán públicas cuando se active GitHub Pages desde `main` y `/docs`.

## Supabase

Los scripts numerados de `supabase/` contienen la evolución del esquema y sus funciones. Para un proyecto nuevo, revisalos y aplicalos en orden del `01` al `17`, configurando autenticación anónima y Realtime según el esquema. No son un comando de reinicio ni deben ejecutarse de nuevo indiscriminadamente sobre una base con datos. En el proyecto conectado, la fuente de verdad para cambios ya aplicados es `supabase/migrations/`.

| Scripts | Área |
| --- | --- |
| `01`–`06` | Salas, jugadores, estado, fichas y políticas de acceso |
| `07_diagrama.sql` | Flujo de mesa y administración de la partida |
| `08_turnos.sql` | Turnos, apuestas y validaciones |
| `09_puntuacion.sql` | Resultados, puntuación y consultas privadas |
| `10_acciones_jugador.sql` | Acciones propias en mesas físicas y autoridad final del dealer |
| `11_seguridad_rendimiento.sql` | Permisos mínimos, política consolidada e índices de acceso |
| `12_helper_privado.sql` | Helper de RLS fuera de la API pública |
| `13_stack_solo_dealer.sql` | Ajuste de stacks físicos autorizado exclusivamente al dealer |
| `14_salas_privadas.sql` | Lectura de salas limitada al host y a sus participantes |
| `15_monto_igualar.sql` | Confirmación y validación del monto exacto al igualar |
| `16_ligas_temporadas_ranking.sql` | Ligas Plus, temporadas, asociación segura de resultados, ranking y verificación server-side del entitlement |
| `17_plus_mesas_estadisticas_recap.sql` | Mesas habituales, historial Free/Plus, estadísticas privadas, head-to-head y recap autoritativo |

Las veintidós migraciones están aplicadas y registradas en el proyecto remoto `ddvbbkwhisuezloorhfg`. Las incrementales convierten las ligas básicas en clubes Free con roles seguros, invitaciones explícitas, temporada/ranking/rivalidades, fechas y feed. Las últimas agregan preferencias privadas, eventos de MVP y el servidor de avisos con cron, cupo y recibos. La activación nativa FCM/APNs y sus pruebas físicas siguen pendientes; ver [notificaciones](docs/notificaciones.md). Los archivos numerados 16/17 documentan estados históricos; para reconstruir el estado actual se usa la cadena completa de `supabase/migrations`. La migración 17 se auditó además con una identidad Free temporal para comprobar lectura propia, límites Plus, privacidad del recap y eliminación posterior de la cuenta de prueba.

La seguridad depende de las políticas RLS y las funciones de Supabase, no de ocultar controles en la interfaz. Las operaciones incluyen validación de usuario, estado y revisión de sala, y controles contra acciones duplicadas. La [revisión de seguridad remota](docs/security-review.md) documenta los permisos efectivos y los avisos intencionales del asesor de Supabase.

Los HTML en `supabase/email-templates/` son plantillas preparadas; requieren configuración en el servicio de correo. No incluyen credenciales.

## Blindly Plus

La app ya integra el SDK y el paywall nativo de RevenueCat, restauración de compras, acceso a la administración de la suscripción y validación del entitlement `blindly_plus`. Los clubes básicos, temporadas y ranking son Free en la próxima versión. Plus habilita personalización de la botonera, mesas habituales, historial completo, métricas avanzadas, head-to-head privado, tarjetas de recap, temas premium y estructuras de ciegas personalizadas. Usa el UUID de Supabase como identificador estable y mantiene el juego esencial gratis.

La administración de clubes no confía en el estado del teléfono: Supabase verifica cuenta, pertenencia y rol. Cancelar Plus conserva el acceso a las funciones básicas del club. Las funciones comerciales restantes siguen usando `sincronizar-plus` y una verificación vigente de RevenueCat. Arquitectura y pruebas: [clubes](docs/clubes.md) y [ligas, temporadas y ranking](docs/ligas.md).

Los precios de lanzamiento previstos son USD 0,99 mensual, USD 9,99 anual —el plan recomendado— y USD 24,99 por la Founder Edition vitalicia. El precio regular futuro del acceso vitalicio será USD 39,99.

RevenueCat Test Store está activo solamente en `development`, donde la build es depurable y no procesa cobros reales. El APK regular `preview` y `production` mantienen Plus desactivado; `preview` contiene ahora la clave pública Google para el perfil `play-testing`: RevenueCat cierra intencionalmente una build release que use una clave Test Store. Detalles: [preparación de Blindly Plus](docs/blindly-plus.md).

## Android e iOS

`app.json` configura el nombre, los identificadores, permisos e imágenes. El splash nativo usa `assets/images/blindly-logo.png` sobre fondo verde fijo. El menú y las pantallas React usan el logo transparente para adaptarse al tema.

`eas.json` incluye perfiles `development`, `preview`, `play-testing`, `ios-simulator` y `production`, además de la configuración de envío a tiendas. El código está vinculado al proyecto EAS [`@facuargerich/blindly`](https://expo.dev/accounts/facuargerich/projects/blindly), y los tres entornos ya contienen la URL y la clave pública de Supabase. Plus usa Test Store solo en development; preview y production permanecen desactivados hasta disponer de productos reales. Android se publicará en Google Play; los iPhone de amigos pueden recibir una IPA privada o una invitación cerrada de TestFlight sin publicar Blindly en App Store. Seguí los pasos de [preparación nativa](docs/identidad-y-build.md) y la [prueba física de aceptación](docs/prueba-fisica.md).

Los siguientes artefactos son de la release base `a147e78`. No incluyen el desarrollo posterior de las 40 metas; consultar [la entrega actual](docs/release-metas40.md) y su estado de compilación.

La entrega de las 40 metas ya compiló: APK/AAB locales universales `Blindly-metas40-v7` con firma original y simulador iOS `acaf0ba7`. Los archivos están en la carpeta local `release` y su copia OneDrive; hashes, límites de 16 KB y aceptación pendiente están en el informe actual. Para esta entrega se usa `LEEME-metas40.txt`; la tabla siguiente es histórica.

- [APK preview instalable](https://expo.dev/artifacts/eas/ZWvYWkflL1iX6jr9uxLDnwxrTxvjoB3cnHese3Q9DFc.apk), build EAS [`3cd26009-81ce-4a67-8778-87a28d0d121e`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/3cd26009-81ce-4a67-8778-87a28d0d121e), `versionCode 5`, SHA-256 `F62B57844824B5C85AF4E8C8976FF69C1A52C7DD1FD5008C371CE0EB31B12928`.
- [AAB de producción para Play Store](https://expo.dev/artifacts/eas/CZ76WUrBEQxZXI9k8-C09DHOIVVo2_uotMfpw9nXZ40.aab), build EAS [`da6f7279-a681-4c09-86f9-7b879bdded73`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/da6f7279-a681-4c09-86f9-7b879bdded73), `versionCode 6`, SHA-256 `A496C7E80823A7B895ECD3EBA2162F6463ECEB75EFBE3DC9A74C342FAFB8E6C6`.

El APK base verificó su firma v2 y el AAB base pasó `bundletool validate` y `jarsigner`. Ambos contienen `com.blindly.app` 1.0.0, SDK objetivo 36 y el alcance funcional anterior de Ligas, Temporadas, Ranking y Blindly Plus. Se conservan como referencia; requieren prueba física y no representan el código actual de `main`.

La release base también compiló en iOS desde el commit `a147e78`: [paquete para simulador](https://expo.dev/artifacts/eas/g2xejQ1cr9udaplB7q_qkhkjpC45ugSIL-xQHg_4bk8.tar.gz), build 1, SHA-256 `03022B72932A77409975C43EF9E7C8C82DA6F259C3A6E4D0E19BFFE089B24A31`. El archivo contiene `Blindly.app`; se verificaron `com.blindly.app`, versión 1.0.0, cifrado exento y los esquemas de enlace. Se instala en el simulador de macOS; una IPA para iPhone requiere firma de Apple Developer.

La ficha y las declaraciones iniciales para las tiendas están en [docs/store-listing.md](docs/store-listing.md).

Con esa configuración lista:

```powershell
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

La prueba física en iOS requiere los permisos y el aprovisionamiento correspondientes de Apple. El splash nativo se valida con una build real; el navegador y Expo Go no sustituyen esa prueba.

## Estructura del proyecto

```text
src/app/           Rutas y pantallas de Expo Router
src/components/    Mesa, apuestas, cartas, audio, logos y sesión nativa
src/lib/           Sesiones, acceso a datos, lógica, preferencias y traducciones
assets/            Imágenes, sonidos y créditos de recursos
supabase/          Esquema SQL, Edge Functions, seguridad y plantillas de correo
tests/             Pruebas de lógica, SQL y sesiones
docs/              Guías de instalación y preparación nativa
app.json           Configuración Expo y plugins nativos
eas.json           Perfiles de compilación
```

## Comandos y verificación

| Comando | Uso |
| --- | --- |
| `npm start` | Iniciar el servidor de desarrollo Expo |
| `npm run web` | Abrir la versión web |
| `npm run android` | Iniciar Expo para Android |
| `npm run ios` | Iniciar Expo para iOS |
| `npm run typecheck` | Verificar tipos de TypeScript |
| `npm run build:web` | Generar el paquete web de producción |
| `npm run build:bundles` | Verificar los paquetes JavaScript de web, Android e iOS |
| `npm test` | Ejecutar las pruebas automatizadas |

Las pruebas SQL usan PGlite y recorren distintos estados históricos de las migraciones. Cubren turnos, permisos, conservación de fichas, pozos, puntuación, ligas, temporadas, mesas habituales, invitados Free, cancelación/restauración de Plus, historial Free/Plus, estadísticas, head-to-head, recap, RLS, privacidad y operaciones repetidas. Las pruebas de sesión usan dobles de Supabase: no envían correos ni sustituyen una prueba de autenticación real.

## Experiencia principal

La navegación principal reúne Inicio, Ligas, Perfil y Config. Inicio prioriza crear/unirse a una partida y muestra el contexto real de la liga. Las invitaciones Free usan un mismo código para compartir enlace y QR, conservando el contexto durante la recuperación de cuenta. El [informe del rediseño](docs/redisenio-principal.md) detalla arquitectura, pruebas y validaciones nativas pendientes.

## Pendientes antes de publicar

La release base fue cerrada en `f953239`. `main` incluye la implementación de las 40 metas y sus pruebas; el avance está en [evolución incremental](docs/evolucion.md) y los binarios nuevos en [release-metas40.md](docs/release-metas40.md). Los enlaces EAS anteriores conservan el código de `a147e78`.

- Configurar SMTP, aplicar las plantillas y probar la vinculación y recuperación de una identidad con puntos.
- Instalar el APK correspondiente a las 40 metas una vez aprobado y completar la [matriz de aceptación](docs/qa-metas40.md).
- Validar el splash en arranque en frío, la pausa de música al pasar a segundo plano y la reconexión después de bloquear el teléfono o perder la red.
- Completar una partida con varios celulares y verificar apuestas, reparto de pozos y cierre del torneo.
- Probar compra, restauración y eliminación con RevenueCat Test Store en una build `development`; después crear los productos comerciales en las tiendas.

La configuración nativa y las pruebas automatizadas están preparadas; estas verificaciones físicas siguen pendientes. La [entrega actual](docs/release-metas40.md) reúne la evidencia y los bloqueos externos. El [estado de la release base](docs/final-readiness.md) conserva su auditoría histórica.

## Créditos

La música de ambiente es **Lobby Time**, de Kevin MacLeod, bajo licencia CC BY 4.0. La atribución y los enlaces están en [assets/sounds/LICENSE.md](assets/sounds/LICENSE.md) y en la pantalla Créditos. La documentación de identidad visual está en [blindly-brand.md](assets/images/blindly-brand.md).
