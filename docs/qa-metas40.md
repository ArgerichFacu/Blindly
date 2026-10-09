# Aceptación de la versión de las 40 metas

La matriz automática pasó; **no reemplaza** estas pruebas con la nueva APK. Los APK/AAB anteriores de octubre 7 no contienen las metas. Verificar commit, versionCode, firma y SHA-256 del artefacto instalado. No reportar una prueba como aprobada sin ejecutarla.

## Matriz automática ejecutada

- Invitado casual y cuenta protegida; persistencia, recuperación por clave, UUID estable y nombres duplicados.
- Android Back enfocado y protección de partida activa; contexto de invitación/cuenta.
- Mesa: sólo el propio turno, igualdad/subida con montos reales, all-in, pozos, stacks sólo dealer, operaciones idempotentes y conservación de fichas.
- Club Free: crear/invitar/aceptar explícitamente, owner/admin/member, revocación y RLS/RPC de datos ajenos.
- Temporada nueva/cerrada, ranking estable, MVP, diferencias reales, títulos automáticos, rivalidades con muestra mínima y fechas/RSVP propios.
- Club Plus: payloads de identidad válidos/inválidos, títulos, vencimiento/validación caducada/restauración, lectura conservada y edición denegada. UI de doble toque y rechazo del servidor.
- Capacidades personales: carga/error/offline no conceden acceso; tema guardado no se elimina. RevenueCat serializa consultas de cuentas distintas y verifica vencimiento.
- Recap: participantes autorizados, empates, UUID y MVP del cierre histórico; no inventa estadísticas.
- Push: autenticación privada, eventos reales, consentimiento, cupo social combinado, tokens de cuenta, cancelación/expulsión, deduplicación, recibos y red incierta. Borrar cuenta elimina token y snapshot MVP.
- Deep links: sólo UUID/secciones permitidas; URL ajena ignorada.
- Historial: 45 partidas de igual fecha, 20/20/5 con cursor estable. Feed hasta 20; un canal enfocado con seis filtros y limpieza.
- Haptics: opcional, sin vibración web/background, deduplicación, fallo del motor tolerado.
- Audio: cuatro controles, mute, background/foco, exclusión y operaciones tardías; configuración premium conservada al expirar.
- Evaluador: diez combinaciones, duplicados, kickers, as bajo, parciales y 200 manos reproducibles.
- ES/EN/PT: 830 textos, 64 errores. Configuración nativa, recursos, páginas legales, tipos y lint verificados.
- Iconos: PNG 1024 RGBA, alfa, margen y círculo/squircle/rounded revisados.
- Bundles web/Android/iOS y CI de GitHub.
- APK/AAB locales v7 completos y firmados, integridad/manifiestos/certificado original comprobados; simulador iOS de las 40 metas compilado e inspeccionado. Hashes y limitaciones en [release-metas40.md](release-metas40.md).
- Revisión web real con Metro reiniciado: menú, preferencia de vibraciones y evaluador Free a 390 px; escalera real con exactamente cinco cartas marcadas. No reemplaza pruebas nativas.
- Android 16 KB: ZIP y PT_LOAD aprobados; criterio estricto de final RELRO pendiente en 45 bibliotecas. No declarar esa aceptación completa con sólo bundletool.
- Prueba nativa real en emulador acelerado Android 16 x86_64: páginas de 16384 bytes y compatibilidad desactivada; APK v7 instalado, onboarding, combinaciones/opciones por enlace, background/resume y segundo arranque frío sin crashes. Se verificó actividad/proceso y captura. ARM64/16 KB y funciones de partida siguen pendientes; ver el informe de release.

## Android físico: tres teléfonos

### Primera sesión en Galaxy A32 (8 de octubre)

Galaxy A32, Android 13, ARM64 y páginas de 4096 bytes. APK v7 con el SHA-256 del informe de release instalado como actualización (`install -r`), sin desinstalar ni borrar datos. Arranque frío correcto (5737 ms), menú visible conservando la elección previa de onboarding, opciones por enlace y Back físico de regreso al menú. Guía de combinaciones y evaluador visibles en la interfaz nativa. Registro de crashes del proceso vacío.

El usuario confirmó que «Lobby Time» se escucha bien. Android registró reproducción activa en primer plano y pausa al ir al launcher. **Fallo encontrado en v7:** al regresar, Expo reanudaba automáticamente la música; el botón volvía a «Detener música», contra la promesa de reproducción manual. Se agregó una pausa explícita al retorno y una prueba de regresión que reproduce la reanudación nativa anterior al evento AppState.

**Corrección comprobada con v8:** instalación como actualización, código 8 y hash `9F346A65CF198808A48806B47FD8F8FD1B281EA8BC8001BA128138E8A9D6AD1C`. Arranque frío 2288 ms. Preferencias de los cinco interruptores conservadas; mismo UUID de invitado comparado desde la interfaz de cuenta, sin publicarlo. Música iniciada manualmente con estado nativo `started`; al salir, `paused`; al volver, permanece `paused` y muestra «Reproducir música». Un nuevo toque vuelve a `started`. Cambiar a cuenta detiene la reproducción. Proceso activo y registro de crashes vacío. La evidencia privada queda en `release/a32-v8-*`, excluida de Git.

Esta sesión no comprueba recuperación entre dispositivos, una partida completa, reconexión de red, haptics, compras, notificaciones ni ARM64 con páginas de 16 KB. No se cambiaron las preferencias de sonido del usuario.

1. Instalar APK con la misma firma sin borrar datos de una versión anterior. Arranque frío, logo, nuevo icono y máscaras del launcher, Back físico/gesto.
2. Invitado juega sin cuenta. Aprendizaje, tutorial omitido/repetido, evaluador en pantalla pequeña, escala de letra grande y TalkBack. Desactivar haptics y audio; verificar persistencia al reiniciar.
3. Proteger cuenta por clave y recuperar mismo UUID en segundo teléfono; verificar historial. Nunca compartir la clave en evidencias.
4. Jugar un torneo virtual completo con tres usuarios: dealer fijo, SB/BB/BTN/DR, turno propio, montos, all-in/pozos laterales y reparto sólo dealer. Un no dealer no corrige stacks ajenos. Cambiar red/modo avión y comprobar reintento sin duplicados. Repetir con fichas físicas.
5. Crear club Free, invitación/código/QR, aceptación tras recuperación, cancelación, invitación renovada y miembro retirado. Probar owner/admin/member. Temporada nueva sin puntos y cerrada con campeón histórico.
6. Ranking/MVP/títulos/rivalidades/fecha/feed se actualizan en otro teléfono. Nombres duplicados, empate y primera partida sin movimientos inventados. Reprogramar fecha pide RSVP nuevo.
7. Con RevenueCat comercial preparado: comprar/restaurar con cuenta protegida; Free mantiene juego/ranking/MVP. Personalizar identidad/título/sonidos/tema; expirar Plus sin perderlos; restaurar y revisar acceso. Probar carga lenta, sin red y cambio de cuenta. Sin productos/configuración esto sigue **pendiente**, no se simula una compra real.
8. Compartir recap vertical con ganador(es), puntos y nuevo MVP de esa partida. Revisar nombres largos, letras grandes y contenido exportado sin cortes.
9. Con FCM configurado y nueva build habilitada: opt-in explícito, permiso denegado/permitido/revocado, notificaciones por tipo/cupo/pique, app abierta/cerrada y enlaces a ranking/fecha/rivalidades. Cancelar fecha/expulsar usuario antes del dispatch. Recibir un ticket no prueba recepción en pantalla.
10. Eliminar una cuenta inactiva: historial/UUID/tokens/preferencias/snapshot MVP propios desaparecen. No eliminar identidad durante mesa activa.

## iOS

Bundles aprobados no son una IPA. En un Mac/simulador revisar layouts, navegación, logo y API nativa; en iPhone físico se necesita firma válida, haptics/audio/background/reconexión, cámara y APNs. No se distribuye APK a iPhone. Firma Apple y recepción física siguen pendientes.

## Evidencia

Registrar fecha, dispositivo/OS, versionCode, hash, resultado y pasos exactos de cada fallo. Guardar capturas sin claves ni datos personales de jugadores reales. `scripts/android-device-test.ps1 -ApkPath ... -ExpectedSha256 ...` acepta el nuevo artefacto con su hash explícito. No reutilizar los valores predeterminados de la release base.
