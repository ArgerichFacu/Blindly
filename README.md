<p align="center">
  <img src="assets/images/blindly-logo-transparent.png" alt="Blindly" width="260" />
</p>

# Blindly

**Tu mesa de poker presencial, conectada.** Blindly acompaña partidas de Texas Hold’em con cartas físicas: organiza la sala, las ciegas, los turnos y las fichas, mientras cada jugador participa desde su celular.

Aplicación desarrollada con Expo, React Native, TypeScript y Supabase. La rama `main` reúne el trabajo de las etapas anteriores y es la referencia para instalar y continuar el proyecto.

## Qué podés hacer

- Crear una sala y compartir su código o QR para reunir de 2 a 10 jugadores.
- Configurar los asientos, el stack inicial, el modo de fichas y los niveles de ciegas.
- Usar presets de torneo o editar niveles y descansos; controlar el reloj con avisos sonoros y vibración.
- Mantener un dealer fijo mientras el botón y las ciegas rotan entre los jugadores, incluido el caso de dos participantes.
- Seguir el turno de apuesta y el estado de la mesa en tiempo real; cada jugador declara su propia acción desde el celular.
- Consultar las combinaciones de poker con ejemplos de cartas y criterios de desempate.
- Elegir tema verde, rojo o negro e idioma español, inglés o portugués.
- Activar música de ambiente y consultar tu puntuación e historial personal.
- Crear ligas Plus con temporadas, miembros invitados Free, historial de torneos y ranking compartido.
- Guardar mesas habituales Plus con jugadores de referencia, fichas, ciegas, duración, tema y liga opcional.
- Consultar estadísticas avanzadas, historial completo y comparaciones privadas entre amigos con Plus.
- Ver un recap al terminar cada torneo y, con Plus, compartir una tarjeta vertical del resultado.

Blindly acompaña la mesa: las cartas se reparten físicamente y el dealer determina los ganadores. La app no evalúa automáticamente las manos.

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

Cada jugador consulta sus propios puntos e historial. Free recibe sus 10 resultados más recientes; el historial anterior permanece guardado y aparece completo al activar Plus. Las comparaciones entre amigos solo agregan resultados de partidas compartidas y nunca revelan el historial ajeno. Los demás participantes solo ven la posición global al compartir una sala. El acceso se controla mediante políticas y funciones de la base de datos.

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

La seguridad depende de las políticas RLS y las funciones de Supabase, no de ocultar controles en la interfaz. Las operaciones incluyen validación de usuario, estado y revisión de sala, y controles contra acciones duplicadas. La [revisión de seguridad remota](docs/security-review.md) documenta los permisos efectivos y los avisos intencionales del asesor de Supabase.

Los HTML en `supabase/email-templates/` son plantillas preparadas; requieren configuración en el servicio de correo. No incluyen credenciales.

## Blindly Plus

La app ya integra el SDK y el paywall nativo de RevenueCat, restauración de compras, acceso a la administración de la suscripción y validación del entitlement `blindly_plus`. Plus permite que un host cree ligas privadas, temporadas y partidas asociadas con ranking; los invitados Free participan normalmente. También habilita mesas habituales, historial completo, métricas avanzadas, head-to-head privado, tarjetas de recap, temas premium y estructuras de ciegas personalizadas. Usa el UUID de Supabase como identificador estable y mantiene el juego esencial gratis.

La administración de ligas no confía en el estado del teléfono. La Edge Function `sincronizar-plus` consulta RevenueCat con un secreto de servidor y las RPC de Supabase exigen una verificación vigente. Si el owner cancela, la liga queda en modo lectura y conserva todos sus datos. Arquitectura y pruebas: [ligas, temporadas y ranking](docs/ligas.md).

Los precios de lanzamiento previstos son USD 0,99 mensual, USD 9,99 anual —el plan recomendado— y USD 24,99 por la Founder Edition vitalicia. El precio regular futuro del acceso vitalicio será USD 39,99.

RevenueCat Test Store está activo solamente en `development`, donde la build es depurable y no procesa cobros reales. Los entornos `preview` y `production` no contienen claves de RevenueCat y mantienen Plus desactivado hasta configurar productos comerciales: RevenueCat cierra intencionalmente una build release que use una clave Test Store. Detalles: [preparación de Blindly Plus](docs/blindly-plus.md).

## Android e iOS

`app.json` configura el nombre, los identificadores, permisos e imágenes. El splash nativo usa `assets/images/blindly-logo.png` sobre fondo verde fijo. El menú y las pantallas React usan el logo transparente para adaptarse al tema.

`eas.json` incluye perfiles `development`, `preview`, `ios-simulator` y `production`, además de la configuración de envío a tiendas. El código está vinculado al proyecto EAS [`@facuargerich/blindly`](https://expo.dev/accounts/facuargerich/projects/blindly), y los tres entornos ya contienen la URL y la clave pública de Supabase. Plus usa Test Store solo en development; preview y production permanecen desactivados hasta disponer de productos reales. Android se publicará en Google Play; los iPhone de amigos pueden recibir una IPA privada o una invitación cerrada de TestFlight sin publicar Blindly en App Store. Seguí los pasos de [preparación nativa](docs/identidad-y-build.md) y la [prueba física de aceptación](docs/prueba-fisica.md).

Ya existen dos artefactos Android firmados por EAS para la versión 1.0.0:

- [APK preview instalable](https://expo.dev/artifacts/eas/gMvdiijTDFWPn-ieGNCcx6L72TUeZMKDvx7cOffhK-c.apk), `versionCode 4`, SHA-256 `65216DAD2837E7E2882D5B94B68815495BDCCB86085FCB1A7AD664B87227F85E`.
- [AAB de producción para Play Store](https://expo.dev/artifacts/eas/mOaH1SBjZr8oFJZ2v6l11InH-A_rpgTT5f0uRpQfffs.aab), `versionCode 5`, SHA-256 `89F753CCFF4A47AC9B2501B220EE4649152FFBD2BC1944522FF7D0ACD581124C`.

Estos binarios son una base nativa anterior a Ligas. Sirven para las pruebas ya documentadas, pero no incluyen la entrega de Ligas, Temporadas y Ranking y no deben cargarse como versión final en Play Store. La próxima compilación nativa deberá generarse desde el commit final del producto y usar un `versionCode` nuevo.

La compilación nativa iOS también fue validada con el [paquete para simulador](https://expo.dev/artifacts/eas/98EZjNOLQrVTD12iljHmRZZqBO1KGpDOkZKIEFKBqOg.tar.gz), build 1, SHA-256 `5673FD59EE3BA234BB5D7B82DF3FACDC01449E79E39E90816FE3E91B94ACEC87`. Este paquete se instala en el simulador de macOS; una IPA para iPhone requiere firma de Apple Developer.

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

## Pendientes antes de publicar

- Configurar SMTP, aplicar las plantillas y probar la vinculación y recuperación de una identidad con puntos.
- Instalar el APK EAS ya generado en dispositivos físicos y completar la matriz de aceptación.
- Validar el splash en arranque en frío, la pausa de música al pasar a segundo plano y la reconexión después de bloquear el teléfono o perder la red.
- Completar una partida con varios celulares y verificar apuestas, reparto de pozos y cierre del torneo.
- Probar compra, restauración y eliminación con RevenueCat Test Store en una build `development`; después crear los productos comerciales en las tiendas.

La configuración nativa y las pruebas automatizadas están preparadas; estas verificaciones físicas siguen pendientes. El [estado final de preparación](docs/final-readiness.md) reúne la evidencia comprobada, los artefactos aprobados y el orden exacto de las acciones externas restantes.

## Créditos

La música de ambiente es **Lobby Time**, de Kevin MacLeod, bajo licencia CC BY 4.0. La atribución y los enlaces están en [assets/sounds/LICENSE.md](assets/sounds/LICENSE.md) y en la pantalla Créditos. La documentación de identidad visual está en [blindly-brand.md](assets/images/blindly-brand.md).
