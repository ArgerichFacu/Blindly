# Blindly — guía para agentes

App móvil social para acompañar partidas **presenciales** de Texas Hold'em (no reparte cartas ni maneja dinero real). Expo SDK 57 · React Native 0.86 · TypeScript · Expo Router · Supabase · RevenueCat · AdMob · EAS. Modelo Free/Plus. Marca: verde bosque `#0A1713`, dorado `#E8C77A`, "blindly.".

Leé también `AGENTS.md` (docs versionadas de Expo 57) y `docs/` (historial detallado por versión).

## Reglas del titular (obligatorias)
- Explicar en **español rioplatense**, claro y sin jerga: el titular es estudiante.
- Trabajar en una **rama nueva**, nunca en `main`. Cambios chicos, mostrar el diff y correr typecheck + tests antes de dar algo por terminado.
- **Pedir confirmación explícita** antes de cualquier efecto en producción: flags o datos de Supabase, migraciones, `eas build`/`submit`, configuración de RevenueCat, AdMob, Play Console o Google Cloud. Los flags de producción sólo se leen.
- **Secretos:** no leer ni mostrar `.env`, `credentials*`, `.credentials/`, `G:/Blindly/privado/` ni claves. Si falta algo, pedir el nombre de la variable.
- Preguntar antes de instalar dependencias o cambiar versiones de Expo/SDKs.
- No reconstruir desde cero, preservar el diseño. Textos de UI en español con traducciones EN/PT en `src/lib/textos.ts` (todo `t("…")` necesita entrada). Commits en inglés.
- Blindly 2.0 (amigos, mensajes privados, ruleta "doble o nada") **no se toca** sin pedido explícito.

## Comandos
- `npm run typecheck` · `npm run lint` · `npm test` (suite propia en `tests/*.cjs`, SQL simulado con PGlite; incluye `test:publicidad` y `test:elf16kb` como posttest).
- Entorno local: `. G:\Blindly\entorno.ps1` (Java 17, Android SDK en `G:\Blindly\herramientas`). ADB: `G:/Blindly/herramientas/android-sdk/platform-tools/adb.exe` (en Git Bash usar `MSYS_NO_PATHCONV=1`).
- Builds de tienda: perfil `production-candidate` (hereda `payment-rc` → `play-testing`). **Esos perfiles usan el entorno EAS "preview"**: ahí viven las variables `EXPO_PUBLIC_*` de la build de tienda.

## Arquitectura en dos líneas
- `src/app` rutas (Expo Router), `src/lib` lógica y contextos (`PlusContext`, `sesion`, `autenticacion`, `usePublicidadSala`), `src/components` UI.
- Supabase: la fuente de verdad son `supabase/migrations/` (los `01–17.sql` son historia del prototipo). **Mergear a `main` aplica en producción las migraciones nuevas** (integración de Supabase con GitHub, verificado el 2026-11-12 con la `20261112035500`): escribirlas idempotentes y pedir el OK del titular antes del merge. Tablas privadas en el esquema `private` con RLS y RPC `security definer`. Edge Functions en `supabase/functions/`.

## Pagos (Plus)
- Comprar exige tres cosas: build con `EXPO_PUBLIC_PLUS_READY=true`, clave RevenueCat `goog_…` (las `test_` se rechazan en release) y `private.plus_lanzamiento.real_payments_enabled=true` (o la allowlist `private.plus_payment_testers`). Activo desde 2026-11-08.
- Entitlement `blindly_plus`; offering `default` con `$rc_monthly`, `$rc_annual`, `$rc_lifetime`. Precios sólo dentro del paywall de RevenueCat.
- Sincronización: la app llama a la Edge Function `sincronizar-plus` (secreto `REVENUECAT_SECRET_KEY`, API v1) que escribe `public.accesos_plus`. El servidor sólo acepta verificaciones de los últimos 15 min. No hay webhook: renovaciones/cancelaciones se ven cuando el usuario abre la app.
- Acceso Plus = Play Reviewer, Plus pagado verificado o Founder Trial (72 h, una vez). Los invitados no compran ni sincronizan.
- **QA de compras:** Google Play cobra con **la cuenta que instaló la app**, no con la que se ve arriba en Play Store. Esa cuenta debe estar en Play Console → Gestionar cuenta → Licencia para testing (lista "Blindly Billing QA"). Si no aparece "Tarjeta de prueba", reinstalar desde Play con la cuenta tester. Primera compra de prueba completa verificada el 2026-11-08 (sandbox).

## Anuncios
- Regla del titular: **extremadamente poco invasivos**. Un único interstitial opcional para Free, después de que el servidor confirma crear/unirse a una sala y antes del lobby; máximo uno por sesión; si falla, se sigue sin esperar. Nada de banners ni anuncios en pantallas principales o paywall. Cualquier Plus los quita. Ver `docs/monetizacion-publicitaria.md`.
- Flags: `private.publicidad_config.ads_enabled` (producción, **lo enciende sólo el titular**; encendido el 2026-11-12 con la v39) y `ads_qa_enabled` + `private.ads_qa_testers` (QA con IDs de prueba).
- Con el switch encendido, `estado_publicidad()` publica `ads_unit_android` (la unidad autorizada, columna de `publicidad_config`) y la app sólo muestra anuncios reales si fue compilada con esa misma unidad. Así las builds 1.36–1.38 (IDs de una cuenta de AdMob descartada) nunca muestran anuncios. Si cambia la unidad, hay que actualizar la columna **y** la variable EAS.
- IDs reales sólo por variables EAS `ADMOB_ANDROID_APP_ID` y `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`; sin ellas se usan los IDs de prueba de Google. Consentimiento Google UMP al abrir (sólo Free y con anuncios activos) y fila "Privacidad de anuncios" en Opciones. Advertising ID bloqueado; anuncios no personalizados.

## Autenticación
- Usuarios anónimos de Supabase como invitados; Google (OAuth web vía Supabase) y email/contraseña. Un invitado con progreso vincula Google a su UUID; si ese Google ya tiene cuenta, la UI ofrece "Entrar a mi cuenta existente".
- `mi_identidad_tiene_datos()` decide si un invitado "tiene algo que perder". Sólo cuenta un Plus **vigente**: contar filas inactivas de `accesos_plus` bloqueó todos los logins el 2026-11-08 (migración `20261108174000`, aplicada a mano en el SQL Editor).
- Sitio público: **https://blindly.com.ar** (GitHub Pages desde `docs/` con `docs/CNAME`; DNS en Cloudflare, dominio registrado en NIC Argentina y delegado a `lina`/`mitch.ns.cloudflare.com`). Ahí viven `privacy.html`, `terms.html`, `account-deletion.html` y `app-ads.txt` (no borrar). La URL vieja `argerichfacu.github.io/Blindly/` redirige al dominio.
- Marca OAuth (proyecto Google Cloud `blindly-511407`, en la cuenta Google personal del titular): Con `github.io` Google la rechazaba. Desde el 2026-11-09 la marca usa `blindly.com.ar` (página principal, privacidad, términos y dominio autorizado), verificado en Search Console como propiedad de dominio con un TXT en Cloudflare (no borrar ese registro). Marca verificada y publicada el 2026-11-12: el login de Google muestra "Blindly".

## Partida
- Reloj en la fila de la sala (`acumulado_ms` + `inicio_en`), cada celular corrige con la RPC `hora_servidor`. RLS de jugadores con `soy_jugador_de` (security definer) para evitar recursión.
