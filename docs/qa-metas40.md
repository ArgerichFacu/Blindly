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

## Android físico: tres teléfonos

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
