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

## Partida nativa con un teléfono y dos emuladores (9 de octubre)

APK v9 instalada como actualización en Galaxy A32, sin borrar su identidad ni preferencias, y en dos AVD independientes Android 16 x86_64. Ambos emuladores usan páginas de 16384 bytes y tienen el modo de compatibilidad desactivado. Los avisos de falta de respuesta de System UI al arrancar los AVD corresponden al sistema del emulador; se redujo su carga usando GPU del host y dos núcleos. No se confundieron con fallos de Blindly.

Torneo virtual QA de tres participantes y 15000 fichas completado mediante los controles nativos de cada jugador. Se comprobaron monto incorrecto bloqueado, igualdad exacta, pasar, retirarse, subida y all-in, preflop/flop/turn/river y reparto del dealer. El dealer permaneció fijo y SB/BB/BTN rotaron. El no dealer no recibió controles para repartir ni modificar stacks virtuales. Al avanzar el reloj, la segunda mano usó las nuevas ciegas 50/100; la primera conservó las de su inicio.

La tercera mano generó un pozo principal de 14700, un secundario de 100 y un excedente de 200 con único beneficiario. Principal y secundario se asignaron a jugadores distintos; el participante con aporte insuficiente no era elegible para los secundarios. La cuarta mano terminó el torneo con un ganador, 15000 fichas y pozo cero. Resumen real y puntuación para tres jugadores: 4/2/1. Los 26 resultados históricos previos no se borraron; esta prueba añade sus tres resultados QA.

**Fallo de recuperación encontrado antes de la partida:** proteger al invitado cambiaba la contraseña en Auth y revocaba la sesión, por lo que `refreshSession()` fallaba después de que el servidor creara la clave. La corrección v9 muestra primero la clave y abre sesión con ella conservando el UUID original. Crear la clave pasó en un AVD; después del torneo se recuperó la misma identidad en el otro AVD, con sus 4 puntos y la partida del historial. La clave y los UUID se conservan sólo en evidencia privada excluida de Git. No se alteraron la función de Auth ni sus verificaciones JWT.

**Fallo de conexión encontrado en v9:** una acción enviada sin red dejó los controles bloqueados incluso después de restaurar la conexión. Se volvió a abrir únicamente el emulador para continuar el torneo, sin atribuirle un resultado aprobado de reconexión. La corrección v10 limita la espera de confirmación a 15 segundos, aborta el transporte y conserva el identificador y monto originales para Reintentar. Una recarga lenta posterior a una acción confirmada tampoco bloquea los controles. Las regresiones verifican transporte que ignora abort, respuesta tardía, rechazo del servidor y reintento idéntico.

**Repetición nativa v10 aprobada:** ambos AVD actualizaron a código 10, nuevamente con páginas de 16384 bytes y compatibilidad desactivada. En una segunda mesa QA de dos usuarios, se abrió la igualdad de 25 fichas (total de ronda 50), se apagaron Wi-Fi/datos y se activó modo avión exclusivamente en el emulador que apostaba. Aparecieron el mensaje de conexión incierta y Reintentar habilitado. El servidor conservó pozo 75 y revisión 6 hasta volver la red. Reintentar confirmó una sola apuesta: pozo 100, revisión 7, turno del otro jugador, stacks sumando 9900 y exactamente un registro `apostar` en `operaciones_mesa`. Sin reiniciar Blindly ni perder la identidad. La mesa de reconexión queda pausada e identificada como QA, sin añadir otro resultado al ranking. Ambos emuladores se apagaron después del ensayo; sin crashes de Blindly en sus buffers.

Sin crashes de Blindly en los dos emuladores durante este torneo. El buffer del A32 contiene nueve crashes históricos entre el 2 y el 7 de octubre (RevenueCat de prueba/audio de versiones anteriores), ninguno posterior a instalar v9 el 9 de octubre. No se borraron sus registros ni datos. Se utilizó una herramienta temporal de instrumentación para leer la vista actual mientras corría el reloj; se desinstaló de los tres dispositivos al terminar el QA.

Esto cubre tres clientes Android, no tres teléfonos físicos. Siguen pendientes ARM64/16 KB, fichas físicas entre dispositivos, accesibilidad completa, compras reales y push configurado.

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

## Cierre de pruebas disponibles en A32 y emulador (9 de octubre, APK v10)

La última sesión usó el Galaxy A32 Android 13 ARM64/4 KB y un AVD Android 16 x86_64. El anfitrión del AVD y el dealer del A32 fueron usuarios distintos. No se borró la identidad del teléfono ni se modificó Auth.

- **Fichas físicas:** configuración de 400 fichas de 25, reparto de 200 por jugador y stack inicial 5000. Cada participante registró su propia acción. Apostar/subir, igualar y pasar completaron preflop, flop, turn y river; retirarse cerró otra mano. Sólo el A32 dealer mostró y pudo guardar «Actualizar stack físico» y «Cerrar mano y rotar ciegas». El AVD anfitrión recibió ambos stacks actualizados, 4500 y 5500, sin controles para editarlos. Dos cierres llevaron a mano 3, conservaron el dealer y rotaron SB/BB/BTN. El servidor confirmó 10000 fichas y pozo cero. Se probó el registro y sincronización del modo físico; no se observó un reparto de fichas tangibles.
- **Accesibilidad disponible:** con letra al 200%, se inspeccionaron menú desplazable y formulario de ingreso sin cortes que impidieran usarlos. TalkBack de Samsung activo mostró foco nativo y permitió completar el ingreso a la sala con doble toque. Se rechazó su permiso opcional de llamadas. Esto no certifica todas las pantallas ni confirma verbalmente la lectura de cada etiqueta.
- **Haptics:** el teléfono tenía apagada la vibración táctil del sistema y su intensidad en cero. Con ambas habilitadas temporalmente, un all-in confirmado produjo un evento TOUCH de `com.blindly.app`, finalizado, de 53 ms, con un paso de 45 ms. El usuario no estaba atento: la sensación física no quedó confirmada. Al apagar la preferencia de Blindly y reiniciar, permaneció apagada y otro all-in no generó un evento nuevo, aun con el sistema habilitado. Se restauró la preferencia de Blindly encendida y los dos ajustes del sistema en cero.
- **Limpieza:** letra original 1.1, TalkBack desactivado, servicios de accesibilidad como antes; herramienta `com.blindly.qadump` desinstalada del teléfono y AVD, y emulador apagado. No se reinstaló desde cero ni se eliminó el historial. Las salas de esta sesión quedaron pausadas; sus registros de puntuación tienen puesto, puntos y finalización nulos y no aportan un resultado terminado al ranking.

**Límite de aceptación:** terminar estas pruebas no cierra ARM64 con páginas de 16 KB ni los 45 avisos estáticos RELRO. El A32 tiene páginas de 4 KB; la prueba x86_64 de 16 KB no sustituye esa arquitectura. Compras y push reales dependen de servicios todavía desactivados. Una vez resuelto ese pendiente nativo, el orden acordado es rediseño completo del layout, nueva validación, activación de Blindly Plus y publicación.

## iOS

Bundles aprobados no son una IPA. En un Mac/simulador revisar layouts, navegación, logo y API nativa; en iPhone físico se necesita firma válida, haptics/audio/background/reconexión, cámara y APNs. No se distribuye APK a iPhone. Firma Apple y recepción física siguen pendientes.

## Evidencia

Registrar fecha, dispositivo/OS, versionCode, hash, resultado y pasos exactos de cada fallo. Guardar capturas sin claves ni datos personales de jugadores reales. `scripts/android-device-test.ps1 -ApkPath ... -ExpectedSha256 ...` acepta el nuevo artefacto con su hash explícito. No reutilizar los valores predeterminados de la release base.
