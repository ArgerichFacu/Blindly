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

Blindly acompaña la mesa: las cartas se reparten físicamente y el dealer determina los ganadores. La app no evalúa automáticamente las manos.

## Dos modos de fichas

| Modo | Funcionamiento |
| --- | --- |
| **Virtuales** | La app lleva stacks, ciegas, apuestas y pozos. Los jugadores pueden pasar, igualar, subir, retirarse o ir all-in según su turno. El dealer se encarga de repartir los pozos entre los jugadores habilitados. |
| **Físicas** | Las fichas y apuestas se manejan en la mesa. Cada jugador declara pasar, igualar, subir o retirarse desde su celular; el dealer únicamente cierra la mano y entrega el pozo. |

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

Cada jugador consulta sus propios puntos e historial. Los demás participantes solo ven su posición en el ranking al compartir una sala. El acceso se controla mediante políticas y funciones de la base de datos.

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

Podés entrar como invitado sin registrar un correo. La sesión anónima se conserva en el dispositivo, pero borrar sus datos o cambiar de equipo puede hacer que pierdas el acceso a esa identidad.

La interfaz **Mi cuenta** y el flujo de vinculación por código de correo están implementados para conservar el UUID y la puntuación. La recuperación no fusiona cuentas y tiene controles para evitar reemplazar un invitado con partidas puntuadas o cambiar de identidad durante una partida activa. Desde **Mi cuenta** también se puede eliminar la identidad, la puntuación y el historial; una Edge Function autenticada impide hacerlo mientras exista una partida activa.

**La recuperación por correo todavía está deshabilitada por defecto.** Falta configurar un proveedor SMTP, aplicar las plantillas y verificar el envío y la recuperación en dispositivos reales. Solo después debe habilitarse `EXPO_PUBLIC_EMAIL_AUTH_READY=true`. Hasta completar esa preparación, no debe considerarse un mecanismo operativo de respaldo.

Detalles: [identidad recuperable y build nativa](docs/identidad-y-build.md). La [política de privacidad](PRIVACY.md) y las [instrucciones de eliminación](ACCOUNT_DELETION.md) también están disponibles dentro de la app.

## Supabase

Los scripts numerados de `supabase/` contienen la evolución del esquema y sus funciones. Para un proyecto nuevo, revisalos y aplicalos en orden del `01` al `12`, configurando autenticación anónima y Realtime según el esquema. No son un comando de reinicio ni deben ejecutarse de nuevo indiscriminadamente sobre una base con datos.

| Scripts | Área |
| --- | --- |
| `01`–`06` | Salas, jugadores, estado, fichas y políticas de acceso |
| `07_diagrama.sql` | Flujo de mesa y administración de la partida |
| `08_turnos.sql` | Turnos, apuestas y validaciones |
| `09_puntuacion.sql` | Resultados, puntuación y consultas privadas |
| `10_acciones_jugador.sql` | Acciones propias en mesas físicas y autoridad final del dealer |
| `11_seguridad_rendimiento.sql` | Permisos mínimos, política consolidada e índices de acceso |
| `12_helper_privado.sql` | Helper de RLS fuera de la API pública |

La seguridad depende de las políticas RLS y las funciones de Supabase, no de ocultar controles en la interfaz. Las operaciones incluyen validación de usuario, estado y revisión de sala, y controles contra acciones duplicadas.

Los HTML en `supabase/email-templates/` son plantillas preparadas; requieren configuración en el servicio de correo. No incluyen credenciales.

## Blindly Plus

La app ya integra el SDK y el paywall nativo de RevenueCat, restauración de compras, acceso a la administración de la suscripción y validación del entitlement `blindly_plus`. Plus habilita métricas avanzadas, temas premium y estructuras de ciegas personalizadas. Usa el UUID de Supabase como identificador estable y mantiene el juego esencial gratis. Las compras continúan desactivadas hasta crear los productos comerciales y validarlas en una development build.

No actives `EXPO_PUBLIC_PLUS_READY` hasta configurar productos reales, restauración de compras y pruebas de tienda. Detalles: [preparación de Blindly Plus](docs/blindly-plus.md).

## Android e iOS

`app.json` configura el nombre, los identificadores, permisos e imágenes. El splash nativo usa `assets/images/blindly-logo.png` sobre fondo verde fijo. El menú y las pantallas React usan el logo transparente para adaptarse al tema.

`eas.json` incluye perfiles `development`, `preview` y `production`, además de la configuración de envío a tiendas. El código está vinculado al proyecto EAS [`@facuargerich/blindly`](https://expo.dev/accounts/facuargerich/projects/blindly), y los tres entornos ya contienen la URL y la clave pública de Supabase. Los interruptores de correo y Plus permanecen desactivados hasta verificar sus servicios. Seguí los pasos de [preparación nativa](docs/identidad-y-build.md).

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

Las pruebas SQL usan PGlite y recorren distintos estados históricos de las migraciones. Cubren turnos, permisos, conservación de fichas, pozos, puntuación, privacidad y operaciones repetidas. Las pruebas de sesión usan dobles de Supabase: no envían correos ni sustituyen una prueba de autenticación real.

## Pendientes antes de publicar

- Configurar SMTP, aplicar las plantillas y probar la vinculación y recuperación de una identidad con puntos.
- Generar builds EAS nativas e instalarlas en dispositivos físicos.
- Validar el splash en arranque en frío, la pausa de música al pasar a segundo plano y la reconexión después de bloquear el teléfono o perder la red.
- Completar una partida con varios celulares y verificar apuestas, reparto de pozos y cierre del torneo.
- Configurar los productos de Blindly Plus en las tiendas y RevenueCat, y probar compra, restauración y eliminación en builds nativas.

La configuración nativa y las pruebas automatizadas están preparadas; estas verificaciones físicas siguen pendientes.

## Créditos

La música de ambiente es **Lobby Time**, de Kevin MacLeod, bajo licencia CC BY 4.0. La atribución y los enlaces están en [assets/sounds/LICENSE.md](assets/sounds/LICENSE.md) y en la pantalla Créditos. La documentación de identidad visual está en [blindly-brand.md](assets/images/blindly-brand.md).
