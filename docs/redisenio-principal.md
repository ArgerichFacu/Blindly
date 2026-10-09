# Rediseño principal e invitaciones de ligas

Bloque del 9 de octubre de 2026. Repositorio de trabajo: `C:\Users\facun\Documents\Codex\Blindly-release`, rama `main`. La base anterior es `f1bb62e`. No activa Plus ni publica la aplicación.

## Informe de entrega

1. **Arquitectura anterior:** Stack de Expo Router, menú vertical con accesos grandes, listados de ligas y opciones como pantallas independientes. La mesa tenía sus propias protecciones de salida.
2. **Arquitectura nueva:** el Stack mantiene las pantallas secundarias y contiene el grupo `(principal)` con Tabs: Inicio, Ligas, Perfil y Config. Las rutas públicas `/`, `/ligas` y `/opciones` conservan sus direcciones. Se agrega `/perfil`. `backBehavior="initialRoute"` vuelve primero a Inicio; las pantallas de mesa conservan sus handlers. La barra ocupa espacio en el layout, respeta el inset inferior y se oculta ante el teclado. No se fuerza el desmontaje de cada tab.
3. **Pantallas modificadas:** Inicio, Ligas, Perfil, Config, detalle de liga y confirmación de invitación. La introducción existente permanece antes del shell cuando el onboarding no terminó.
4. **Archivos modificados:** los tres menús anteriores se trasladan a `src/app/(principal)/`; se modifican `_layout.tsx`, `liga.tsx`, `liga-unirse.tsx`, `Controles.tsx`, `LogoBlindly.tsx`, `InvitacionClub.tsx`, `invitaciones.ts`, `textos.ts`, package.json y lockfile. Se agregan los componentes y auxiliares indicados abajo y pruebas. No se toca la lógica de las apuestas ni las migraciones.
5. **Componentes creados:** `Icono` (una familia SVG consistente), `FilaOpcion` (fila táctil compacta), `ResumenClub` (datos reales de temporada), `EntradaSuave` (220 ms, respeta reducir movimiento). `useClubes` centraliza cargas y selección; `seleccionLiga` define la regla determinista.
6. **Reutilización:** Pantalla, Boton, Texto, Tarjeta, Introduccion, TitulosJugador, clasificacion, hooks de identidad/Plus/preferencias, RPC de ligas y puntuación, actualización Realtime, scanner QR, rutas educativas, audio y paywall existentes. No se recrearon las 40 metas.
7. **Home:** wordmark `blindly.` con espacio para el punto, Crear partida como CTA dorado, Unirme como fila secundaria, contexto de liga real y aprendizaje compacto. Sin liga muestra una propuesta útil para crear/unirse; errores y cargas no se convierten en resultados inventados. Se elige la última liga activa abierta desde un resumen, o la activa con la partida más reciente. La preferencia se guarda por UUID. Realtime actualiza la liga seleccionada al recibir cambios o reconectar.
8. **Plus:** pill pequeño arriba a la derecha que abre `/plus`; desaparece con entitlement activo. Perfil muestra el estado premium. No se cambia RevenueCat, sus productos ni las flags de habilitación comercial.
9. **Ligas:** acciones compactas Crear/Unirme y cards de grupos con temporada, miembros, MVP único, posición/puntos propios y próxima fecha cuando existen. El detalle mantiene identidad personalizada, ranking, próxima fecha, rivalidades, miembros, feed e historial; Invitar se ubica arriba. Los permisos administrativos se conservan.
10. **Perfil:** avatar con inicial del nombre real de membresía cuando está disponible, puntos, partidas y rango privados, títulos por liga, estado premium y tres resultados recientes. Mantiene accesos compactos a puntuación completa, mesas y cuenta. Un invitado recibe la explicación y acceso para proteger su cuenta; un fallo de red se puede reintentar. No hay campos personales de avatar/banner en el modelo actual: no se fabrican imágenes, premios ni estadísticas. Empates no generan un MVP ficticio.
11. **Config:** filas agrupadas en Cuenta, Experiencia, Aprender y Blindly. Idioma/tema expanden selectores; modo principiante y haptics conservan sus preferencias. Audio, notificaciones por liga, privacidad y términos usan los flujos existentes. Los temas Plus conservan su control de acceso.
12. **Invitación:** el owner/admin de una liga activa abre un sheet. Puede compartir, copiar o mostrar QR. No exige Plus. Obtener sin renovar reutiliza el token vigente; renovar invalida el anterior con confirmación. Se informa su vencimiento. Una sola invitación lógica para las tres acciones.
13. **Deep link:** `blindly://liga-unirse?codigo=<TOKEN>` usa el esquema/ruta ya existentes. El parser acepta código manual, ese enlace, QR y variantes web/Expo de la ruta conocida; nunca navega a una URL arbitraria pegada. Se consulta una vista previa sin aceptar el ingreso. La persona confirma su nombre y visibilidad. Si ya es miembro, se abre la liga directamente. Invitaciones vencidas, revocadas, archivadas o inválidas muestran errores localizados.
14. **Auth:** un token válido se guarda inmediatamente en `blindly.invitacion-liga.v1`, antes de salir hacia Cuenta. El flujo existente transporta `volver=liga-unirse` y `codigo`. Si la app vuelve sin parámetro, recupera el pending invite y consulta su contexto. La confirmación permanece explícita. Cancelar/aceptar borra sólo el token correspondiente; un error conserva la invitación para reintentar. El doble toque no duplica el ingreso. La unión exitosa usa el haptic existente y su preferencia.
15. **Supabase:** se reutilizan `obtener_invitacion_liga`, `consultar_invitacion_liga`, `aceptar_invitacion_liga`, `mis_ligas`, detalle y puntuación. No se modificó producción para este bloque.
16. **Migraciones:** ninguna nueva. La infraestructura de invitaciones ya está registrada en `20261008043539_invitaciones_club.sql` y depende de los roles Free existentes.
17. **RLS:** la tabla de invitaciones tiene RLS y no admite acceso directo de anon/authenticated. RPC con search_path vacío, cuenta recuperable y permisos servidor. Sólo administradores crean/renuevan; el token no concede administración ni acceso directo al ranking. Aceptar inserta `member`, conserva unicidad `(liga_id,user_id)` y no reactiva expulsados. Se revalida código/vencimiento bajo bloqueo del club. Las pruebas SQL existentes cubren estos controles.
18. **Tests:** suite completa aprobada, incluidos turnos, pozos, privacidad, Realtime, auth, Plus, traducciones y RLS. Nuevos casos: selección de liga, Home Free/Plus/contexto/empty state, deep link canónico y sheet share/copy/QR con la misma URL. Se amplían handlers de invitación: restauración sin parámetro después de auth, vista previa sin consentimiento, usuario ya miembro e invitación inválida. El sheet se prueba con dobles de módulos nativos; no sustituye una prueba de cámara o Share en teléfonos.
19. **Typecheck:** `npm run typecheck` aprobado.
20. **Lint:** `npm run lint` aprobado. La animación usa estado estable compatible con las reglas del React Compiler.
21. **CI:** el workflow `Verificar Blindly` verifica Expo 57, auditoría crítica, tipos, lint, tests y bundles. Consultar la ejecución del commit `demo` de este bloque en GitHub Actions; el resultado se informa con la entrega final.
22. **Límites externos:** se detallan a continuación. Las validaciones históricas permanecen en `release-metas40.md` y `qa-metas40.md`; este informe no declara que una APK anterior contenga el rediseño.

## Evidencia visual y empaquetado

Se recorrieron los cuatro tabs en navegador, Unirme y su regreso al Inicio, ES/EN/PT y viewports de 320×640, 360×800 y 430×932. Sin desbordamiento horizontal en la medición del viewport de 320 px. Wordmark y acciones legibles; barra independiente del scroll. Captura de Inicio ES 430×932 guardada en la carpeta de entrega `release/redisenio/inicio-430-es.png` en OneDrive.

`npm run build:bundles` exportó web, Android e iOS correctamente. Esto compila JavaScript/Hermes; **no genera APK, AAB ni IPA nuevos**. La última APK v11 es anterior al rediseño. Para instalar esta interfaz hace falta una nueva compilación nativa con el procedimiento de `compilacion-local.md` y un nombre de artefacto distinto.

La única dependencia agregada es `expo-clipboard ~57.0.2`, instalada mediante Expo 57 para copiar enlaces. Su paquete contiene implementación Kotlin/Swift, sin archivos `.so`, C++ ni CMake: no añade una biblioteca ELF que cambie las alineaciones de 16 KB. Aun así, requiere recompilar y probar copiar en Android/iOS; no se afirma una nueva validación ARM64.

## Pendientes que no bloquean este bloque

- Prueba del **nuevo layout** en Android nativo: Back de tabs, safe areas, teclado real, scanner QR entre teléfonos, Share/Clipboard y tamaños/densidades. La comprobación web y los handlers automáticos no equivalen a hardware.
- iOS Simulator del nuevo layout: esta PC usa Windows y no tiene Xcode. El bundle iOS pasó; la build histórica de simulador contiene código anterior.
- 16 KB ARM64: Samsung no abrió la consola; no se ejecutó ni subió v11 al A56. Permanecen los 30 avisos RELRO estrictos de dependencias precompiladas en v11. La prueba básica x86_64 de v7 es histórica y no se repitió en este bloque.
- El prompt citaba partida completa y multidispositivo pendientes: posteriormente existen pruebas documentadas A32/emuladores de fichas físicas/virtuales, pozos y reconexión. No se elimina esa evidencia ni se la atribuye a este rediseño. Una partida con varios celulares físicos y la comprobación ARM64 siguen como aceptación externa.
- Recuperación por correo con SMTP, FCM, compras/restauración comerciales y publicación siguen pendientes; no se activan en este bloque.
- Para un link HTTPS futuro: dominio bajo control, Android intent filters `autoVerify` + `/.well-known/assetlinks.json` con certificado real, iOS Associated Domains + `apple-app-site-association`, y una ruta web mínima de invitación/fallback. No se construyó una web nueva. El custom scheme requiere tener Blindly instalada; no es deferred deep linking para quien todavía no tiene la app.
- La vista previa de invitación actual devuelve nombre/descripción/membresía; no expone el ranking privado ni inventa cantidades de miembros o temporada antes de unirse.
- No existe plataforma de analytics en el repositorio: no se agregó una para eventos de invitación.

## Referencias de implementación

Se consultaron antes de editar las [docs exactas Expo 57](https://docs.expo.dev/versions/v57.0.0/), [UI Router 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/ui/), [JavaScript Tabs](https://docs.expo.dev/router/advanced/tabs/) y [Clipboard 57](https://docs.expo.dev/versions/v57.0.0/sdk/clipboard/). No se introdujeron dependencias directas de React Navigation.

Fin del bloque: no continuar con nuevas funciones, activación de Plus ni publicación automáticamente.

## APK del rediseño — v12

Se compiló desde `543d233` con Expo 57 y las cuatro arquitecturas. Gradle finalizó correctamente en 6 min 20 s. APK y AAB: versión 1.0.0, versionCode 12, package com.blindly.app, target 36. La firma v2 coincide con el certificado original C5B6C355789F93255B188CEF762DB78DE5A1900E286CE3B1EC9475F6C466422F; ZIP alineado a 16 KB. AAB validado con bundletool y jarsigner.

- APK SHA-256: 1CF3CDFB860E5EA4B2A5B0BB6462949DD86F93BD0F9B7E9D865122BC6870E18B.
- AAB SHA-256: 98AF498A4EEEC23DDBE5811A7F111DF64A773A86941A502BD3DBD690AE2C055F.
- Entrega: `G:\OneDrive\Documentos\ChatGPT\Blindly\release\Blindly-redisenio-v12.apk` y `.aab`.

Incluye navegación principal, nuevo layout, invitaciones y expo-clipboard. Plus, email SMTP y push siguen sin activarse. Auditoría ELF: 56 bibliotecas, cero fallos PT_LOAD y los mismos 30 avisos RELRO estrictos de v11. No se declara validación ARM64/16 KB ni pruebas físicas del nuevo diseño por el hecho de compilarlo. Se puede actualizar una instalación con la firma original sin desinstalarla.
