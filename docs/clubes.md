# Clubes Free y roles

La próxima versión transforma las ligas en clubes permanentes Free. Crear un club, abrir/cerrar temporadas, asociar partidas y administrar miembros ya no requiere Plus. El juego casual mantiene las cuentas invitadas. Una cuenta protegida con clave de recuperación funciona sin SMTP y conserva su UUID.

## Experiencia y permisos

El club muestra nombre, descripción, miembros, rol propio, temporadas y ranking. El owner puede editar nombre, archivar/reactivar y asignar o quitar administradores. Owner y admins pueden editar descripción, crear/cerrar temporadas, asociar partidas y retirar miembros normales. Un admin no puede retirar otro admin ni al owner. Un member consulta el club sin administrar. Retirar miembros conserva sus resultados históricos.

Crear o administrar requiere una cuenta no anónima verificada por el servidor. La pantalla Cuenta conserva el destino `liga-nueva` o el club concreto al generar/recuperar una clave; exige continuar después de mostrar la clave. Las cuentas legacy anónimas conservan sus datos y pueden proteger su identidad sin cambiar de UUID para consultar el club. No se crea membresía permanente automáticamente al iniciar una partida.

## Migración y seguridad

`supabase/migrations/20261008042305_clubes_free_roles.sql` agrega `ligas.descripcion` y `liga_miembros.rol`, sin borrar tablas ni resultados. El rol owner se deriva de `ligas.owner_id`; no se duplica en un atributo editable. Los helpers privados verifican `auth.users.is_anonymous`, `auth.uid()` y membresía activa. Ningún rol se toma del teléfono o del nombre del jugador.

Las RPC `actualizar_club`, `cambiar_rol_liga` y `quitar_miembro` validan permisos y bloquean la fila del club durante cambios administrativos. `detalle_liga` conserva la lógica original del ranking y agrega descripción y roles. Los helpers y la función histórica privada no son ejecutables por `authenticated` o `anon`. Las tablas conservan RLS y lectura limitada; no se concede escritura directa a clientes.

Aplicada en `ddvbbkwhisuezloorhfg` el 8 de octubre de 2026. Antes/después: 0 clubes, 0 miembros y **26 resultados conservados**. Se comprobaron columnas, registro de migración, denegación de ejecución `anon` para cambio de rol y denegación de helpers privados a `authenticated`.

El advisor mantiene avisos sobre [RPC SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [tablas privadas sin políticas cliente](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) y políticas legacy que permiten lectura anónima. Estos avisos se revisan junto con las pruebas de propiedad/roles; no equivalen a una auditoría sin observaciones. La [protección contra contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) sigue desactivada en la configuración previa.

## Pruebas y pendientes

`tests/clubes-sql.cjs` reconstruye todas las migraciones y prueba Free sin RevenueCat, guest casual, rechazo de administración anónima, escalada de privilegios, promoción/revocación, límites de admin, privacidad, cierre con salas pendientes, conservación de historia y escrituras directas denegadas. `tests/inicio-cuenta.cjs` ejecuta los handlers reales de generación/recuperación y regreso al club. Pasaron la suite completa, TypeScript, lint, traducciones ES/EN/PT y exportación web/Android/iOS.

Las migraciones siguientes eliminan la incorporación automática de jugadores e incorporan el requisito de cuenta para acceso social persistente. La entrada permanente es explícita mediante invitación. La aceptación entre celulares sigue pendiente.

Los APK/AAB/iOS de la release anterior no contienen este cambio; se requiere una nueva compilación después de cerrar los bloques de evolución.

## Invitaciones explícitas (meta 13)

Owner/admin generan un código de 20 caracteres hexadecimales, enlace y QR desde el club. El código vence a los 30 días. Mostrarlo de nuevo conserva el código vigente; renovar lo invalida inmediatamente y no afecta a miembros actuales. Clubes archivados rechazan invitaciones.

`liga-unirse` recibe código o enlace, también mediante cámara. Expo Linking genera enlaces `blindly://liga-unirse?codigo=...` en builds y enlaces del origen actual en web; Expo Go usa su URL de desarrollo. No hay dominio de Universal/App Links configurado: un QR nativo requiere la app instalada y un enlace web requiere un host accesible. Un localhost compartido no funciona fuera de esa PC. API utilizada: [Expo Linking SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/linking/).

La cuenta invitada conserva localmente el código pendiente antes de abrir Cuenta. Generar o recuperar la clave mantiene el destino y vuelve a la invitación; si la app se reinicia, abrir **Unirme a un club** recupera el código pendiente. No se ingresa automáticamente: primero se consulta el nombre/descripción del club y luego se confirma con nombre y aviso de visibilidad. Cancelar o completar borra el pendiente; un rechazo lo conserva para reintentar. Nunca se navega a una URL pegada: se extrae el código de la ruta admitida.

Supabase exige cuenta protegida para consulta y aceptación. La vista previa no revela miembros o resultados. La PK `(liga_id,user_id)` impide duplicados; reintentar no cambia nombre/rol. Miembros retirados no pueden recuperar acceso con un código conocido. Tampoco los reincorpora iniciar una partida. La renovación y aceptación bloquean primero el club para evitar aceptar un código que acaba de renovarse. La tabla de códigos tiene RLS y ningún permiso cliente, incluso de lectura; sólo RPC acotadas.

`20261008043539_invitaciones_club.sql` se aplicó y registró en Supabase el 8 de octubre. Auditoría remota: RLS activo, lectura directa denegada, `anon` sin ejecución de aceptación, incorporación automática eliminada y **26 resultados conservados**. Pasaron pruebas SQL de Free/roles/invitación/expiración/renovación/archivo/retiro, parser/persistencia, handlers UI con doble toque y contexto en Cuenta. Se verificó en navegador la protección requerida, preservación de código al ir/volver de Cuenta y cancelación. Lectura con cámara y apertura del deep link en celulares físicos quedan para QA nativa.

## Rendimiento de temporada (metas 32/38)

`20261008043933_rendimiento_clubes.sql` agrega índices a las FK `salas.temporada_id` y `mesas_habituales.temporada_id`, y cambia la política de lectura de mesas habituales a `owner_id = (select auth.uid())`. Mantiene el mismo permiso, evaluando la identidad una vez por consulta. La cadena SQL completa prueba índices y política; Supabase confirmó ambos índices, la expresión y los 26 resultados conservados.

Después de aplicar, el advisor de rendimiento dejó de informar [FK sin índice](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys) y [recalcular auth por fila](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan). Sólo quedan cinco avisos informativos de índices sin uso observado en tablas con poco o ningún tráfico; no se eliminan índices requeridos por consultas o relaciones por ese motivo.

## Cuenta para historial y clubes (meta 12)

La migración `20261008044846_acceso_persistente.sql` exige cuenta protegida en las RPC de clubes, temporadas propias, ranking, detalle de liga, puntuación/historial personal y comparación privada. Las políticas de lectura de liga también verifican la cuenta mediante el helper privado: una identidad anónima legacy conserva sus filas, pero debe proteger el mismo UUID para volver a consultarlas. Los resultados anónimos legacy se excluyen de rangos globales y de liga hasta proteger la identidad; no se borran ni reasignan.

La recuperación usa `mi_identidad_tiene_datos()`, que devuelve sólo un booleano sobre datos propios, sin aceptar otro UUID ni revelar historial. Así puede impedir abandonar un invitado con resultados, clubes o mesas guardadas aun cuando esas lecturas requieren cuenta. Fallos de red o respuestas malformadas bloquean el cambio de cuenta; sigue comprobando mesas activas, Plus y que la sesión no cambió durante la consulta.

Unirse a una sala **casual** continúa funcionando con invitado. Unirse a una sala de liga en espera requiere cuenta y membresía confirmada. El inicio vuelve a comprobar a todos los jugadores para impedir iniciar después de retirar un miembro. Las partidas ya iniciadas mantienen reconexión legacy y sus acciones; no se cambia el motor de apuestas o reparto. Las pantallas ofrecen proteger la cuenta o aceptar la invitación, preservando código/nombre de sala y destino. Al enfocar listas/historial se limpia el resultado previo para no mostrar datos de una identidad anterior.

Supabase confirmó registro de migración, control de cuenta en historial, membresía en ingreso a liga, helper histórico de ingreso no ejecutable por clientes y los **26 resultados conservados**. Las pruebas SQL incluyen lectura RLS denegada al guest, recuperación del club/historial con el mismo UUID, rangos ocultos antes y visibles después, invitado casual, ingreso rechazado, revocación antes del inicio y rollback sin cobrar ciegas. Pasaron la suite completa, typecheck, lint, traducciones y bundles. En web se verificó que clubes/historial muestran protección de cuenta y que la explicación Free de puntuación sigue disponible.

Los binarios antiguos pueden mostrar el error de protección de cuenta sin el nuevo botón contextual. Para probar este flujo completo se necesita la próxima compilación. La validación entre celulares sigue pendiente. Títulos y estadísticas sociales nuevas usarán este mismo requisito cuando se implementen en sus metas.

## Temporadas, ranking y MVP (metas 15–18)

La temporada muestra inicio/fin y estado. Cerrar conserva los resultados y permite comenzar otra con ranking vacío. El campeón histórico se deriva del puesto 1 de la temporada finalizada; no se guarda un ganador manual. Una temporada sin resultados no inventa campeón. Las partidas activas/en espera impiden el cierre.

El top 3 destaca puntos, partidas y victorias. El desempate conserva puntos, victorias, podios (descendentes), posición media y nombre (ascendentes), y agrega UUID ascendente como último criterio estable. `row_number()` garantiza un solo puesto 1 incluso con nombres y métricas iguales. MVP es exclusivamente ese puesto en una temporada activa, disponible Free. Una temporada finalizada muestra campeón y deja de mostrar MVP/Race.

Los movimientos comparan el ranking actual con el calculado excluyendo todos los resultados de la última partida finalizada registrada en `liga_partidas`. No se compara contra un único jugador ni contra datos inventados. Quien no tenía clasificación previa no muestra movimiento; registros legacy sin partida asociada tampoco generan comparaciones ficticias. Race for MVP muestra los tres primeros, sus puntos reales y la distancia al líder. Las barras usan proporciones, manejan cero sin división inválida y tienen valores accesibles.

`20261008152128_ranking_desempate_uuid.sql` se aplicó en Supabase: 26 resultados conservados, desempate único verificado, helper de comparación sin ejecución cliente y dos tablas añadidas a Realtime. RLS continúa exigiendo miembro con cuenta protegida. La pantalla mantiene una suscripción al club/temporada mientras está enfocada, refresca al reconectar o volver a primer plano y la retira al salir. También permite actualizar manualmente. Documentación: [Postgres Changes y RLS](https://supabase.com/docs/guides/realtime/authorization#interaction-with-postgres-changes).

Las pruebas SQL cubren dos torneos completos, subida/bajada, ingreso sin posición previa, empate total, cierre, conservación y nueva temporada vacía. Las pruebas de lógica/UI cubren MVP, campeón, vacíos, datos inválidos, barras y movimientos. `tests/liga-realtime.cjs` ejecuta el hook con dobles de transporte para comprobar filtros, reconexión y limpieza; no sustituye una prueba WebSocket entre celulares físicos. El advisor conserva los avisos de seguridad documentados arriba y cinco índices sin uso observado; no introdujo nuevas categorías de avisos.

## Títulos automáticos Free (meta 19)

El ranking y su top 3 muestran títulos calculados sobre resultados de la temporada seleccionada. Las reglas también se explican en la pantalla:

- **MVP:** exclusivamente el puesto 1 único de una temporada activa.
- **TIBURÓN:** al menos cinco partidas finalizadas y victorias en el 50% o más.
- **REY DEL PODIO:** al menos cinco partidas finalizadas y top 3 en el 80% o más.

Pueden coexistir. Se recalculan, sin escritura manual ni premios persistidos; al dejar de cumplir un umbral desaparece ese mérito. Una temporada nueva no hereda los títulos de la anterior. Las finalizadas conservan Tiburón/Podio según sus resultados y muestran campeón sin un MVP activo. Una muestra menor de cinco no obtiene los dos títulos estadísticos. Métricas inválidas o inconsistentes no generan méritos.

`src/lib/titulos.ts` contiene reglas reproducibles sin RevenueCat. No se infieren cartas, dinero perdido o asistencia no registrada. Las etiquetas/reglas se traducen a ES/EN/PT. `tests/titulos.cjs` cubre mínimos, umbrales exactos, pérdida, coexistencia y métricas inválidas; no requiere modificar datos productivos.

## Títulos personalizados Plus (meta 20; base para 30/31)

`liga_miembros.titulo_personalizado` guarda máximo un título por `(liga_id,user_id)`. Owner o admin de un club activo pueden asignarlo, editarlo o quitarlo mediante `asignar_titulo_liga`. Se normalizan espacios/controles, se eliminan caracteres invisibles de dirección y se rechazan longitud fuera de 2–24, enlaces comunes y etiquetas. Se renderiza como texto y nunca se traduce. Puede coexistir con MVP y los méritos Free. El título pertenece al miembro del club; en otro club puede tener uno distinto. Se ve también al consultar rankings históricos del mismo club, como identidad actual y no como snapshot del apodo anterior.

La capacidad premium del **club depende del owner**, no de que cada participante compre ni del Plus local de un admin. `private.liga_tiene_plus` consulta la misma verificación `blindly_plus` que ya sincroniza RevenueCat con `accesos_plus`; no hay una segunda fuente comercial. `private.puede_editar_titulos` centraliza rol/estado/entitlement. `permisosClub` consume capacidades recibidas del servidor y falla cerrado sin datos. La RPC vuelve a verificar en cada escritura, por lo que permisos cacheados en UI no conceden acceso.

La verificación existente exige vigencia y sincronización en los últimos 15 minutos. El owner puede necesitar refrescar su compra para editar; un admin no puede verificar compras de otro usuario. Cancelar, vencer o fallar la verificación deja el título guardado y visible en modo lectura. No se borra al perder Plus; una sincronización válida lo habilita nuevamente. Borrar deliberadamente el título requiere permiso vigente. Club archivado y admin revocado quedan bloqueados. Abrir/refrescar el club consulta capacidades actuales; cambios de miembros/títulos disparan el mismo canal Realtime. Sin conexión se muestra error/reintento y no se habilita una escritura offline.

`20261008153145_titulos_personalizados_club.sql` aplicada: 26 resultados conservados, clientes sin DML directo, `anon` sin edición, helpers privados y tabla de miembros publicada con sus políticas RLS existentes. El advisor de seguridad agrega el aviso esperado de la nueva RPC [SECURITY DEFINER ejecutable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), cuyo cuerpo exige cuenta, rol y entitlement; conserva los avisos anteriores. Rendimiento mantiene cinco INFO de índices sin uso observado.

Pruebas SQL: Free denegado, admin autorizado por Plus del owner, miembro/ajeno/anónimo denegados, revocación, archivo, normalización, límites/enlaces, título distinto por club, cancelación, cache vencida, fecha de expiración, conservación y restauración. UI: edición, lectura al expirar, guardado con doble toque protegido por ref y rechazo del servidor sin pérdida del título. No se activaron compras comerciales ni se emitieron cargos. La meta 30/31 completa incluye las futuras funciones premium además de esta primera capacidad.

## Próxima fecha y asistencia Free (meta 21)

El club tiene una única próxima fecha programada, con hora, lugar opcional (100 caracteres) y nota opcional (280). Owner/admin de club activo programan/cancelan; cualquier miembro con cuenta puede responder **Voy / No puedo / Pendiente**. Fecha/hora se ingresan en `DD/MM/AAAA` y `HH:MM` locales del dispositivo, se guardan como UTC y cada usuario las ve en su propia zona horaria, indicada explícitamente. Se rechazan fechas inválidas, pasadas o a más de un año.

Los conteos incluyen sólo miembros activos; sin respuesta se cuenta pendiente. La propia respuesta aparece escrita además del botón destacado. RSVP usa `auth.uid()` y nunca admite otro UUID como argumento. Repetir cambia la misma fila, sin duplicar confirmados. Dos admins no pueden sobrescribir silenciosamente: programar compara el ID anterior y exige refrescar si cambió. La programación/RSVP/cancelación bloquean primero el club para evitar confirmar una fecha reemplazada durante una carrera.

Reprogramar conserva la fecha y sus respuestas anteriores, marcándola cancelada, y crea otra que comienza con todos pendientes. Así la confirmación vieja no se atribuye a otra noche. Cancelar conserva datos. Una fecha pasada no se anuncia como próxima ni permite RSVP; al programar la siguiente se marca finalizada sin borrar historia. No hay calendario complejo, asociación automática a un torneo ni notificaciones todavía; esas funciones corresponden a metas posteriores.

`20261008153853_proximas_fechas_club.sql` agrega `liga_fechas`/`liga_asistencias`, FK compuestas, unicidad de próxima fecha, índices, RLS de miembros y RPC con DML directo denegado. Miembros autorizados pueden leer respuestas del club; invitados, ajenos y retirados no. Realtime refresca fecha y conteos en el canal existente; las lecturas conservan el requisito de cuenta. Supabase confirmó ambos eventos publicados, escritura directa/anónima denegada y **26 resultados conservados**.

SQL prueba Free, owner/admin/member, RSVP repetido, cambio de respuesta, revocación, invitado, límites, concurrencia mediante ID obsoleto, reprogramación, cancelación, conservación y fecha pasada. `tests/fechas-club.cjs` comprueba UTC/local, bisiestos y fechas imposibles. UI prueba permisos, estado escrito accesible, doble toque, error/reintento, advertencia de reprogramación y archivo. Suite, traducciones ES/EN/PT, TypeScript, lint y bundles se verifican para este bloque. La prueba entre celulares sigue pendiente y los binarios de la release anterior no incluyen estos cambios.

El advisor mantiene avisos de [RPC con SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) y heurísticas de acceso anónimo que se contrastan con el helper de cuenta y las pruebas RLS. Rendimiento informa ocho [índices sin uso observado](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), esperable sin clubes productivos; no informa nuevas FK sin índice. No es una auditoría sin observaciones.

## Rivalidades Free (meta 22)

La comparación es personal, para el UUID autenticado y la temporada seleccionada. Requiere al menos tres torneos finalizados compartidos con un miembro activo que también tenga cuenta protegida. Compara **posición final del torneo**, no manos ganadas, eliminaciones ni dinero. Posición menor gana el encuentro; puesto igual cuenta empate. No depende del nombre y no mezcla temporadas.

La némesis requiere un balance desfavorable (más encuentros perdidos que ganados). Entre todos los candidatos elegibles se elige por derrotas descendentes, torneos compartidos descendentes y UUID ascendente. Con balance igual/favorable no se inventa una némesis. La elección se hace antes de limitar a cinco rivales visibles, por lo que un rival elegible fuera de esos cinco sigue apareciendo como némesis con sus cifras reales. Las últimas cuatro comparaciones se ordenan por fecha final descendente y sala UUID ascendente; ese texto sólo aparece si existen cuatro torneos.

`20261008160416_rivalidades_temporada.sql` agrega un helper privado de sólo lectura y extiende el detalle autorizado del club. No crea tabla de rivalidades ni un segundo sistema de puntuación, y no cambia la regla MVP. El helper exige cuenta, permiso de liga y resultados propios; no acepta el UUID de otro usuario. RLS y escrituras de resultados permanecen como estaban. Reusa índices de temporada, usuario y PK de sala/usuario. La respuesta limita el listado a cinco, sin consultas por cada rival ni otra suscripción Realtime.

Pruebas SQL: Free, muestras insuficientes, nombres iguales/UUID distinto, empates, reversión de balance, cuatro recientes, resultados abiertos ignorados, temporada histórica separada, miembro retirado, invitado legacy y ajeno, helper privado y némesis fuera del límite visual. UI: vacío, balance neutral, némesis con números y título, regla explicada y texto reciente sólo con datos suficientes. Se verificaron suite, TypeScript, lint, traducciones y bundles. Supabase conserva **26 resultados**, confirma helper no ejecutable por cliente y consulta restringida a `auth.uid()`. Advisors mantienen las categorías y cantidades previas; la aceptación entre celulares sigue pendiente.

## Actividad del club (meta 23)

Feed Free con máximo **20 entradas**, derivado de tres hechos disponibles: torneo terminado (código/cantidad de jugadores), cierre de temporada (nombre/día real) y programación de la próxima fecha vigente (instante de creación y fecha prevista). Los dos primeros se restringen a la temporada seleccionada; la próxima fecha pertenece al club. No se incluyen torneos abiertos, fechas canceladas o fechas pasadas como anuncios próximos.

Es una proyección actual de datos autorizados, no un log persistente de transiciones: cancelar/reprogramar reemplaza el anuncio de próxima fecha. No anuncia MVP histórico, manos ganadas, pérdidas monetarias ni ganador único si puede haber empate. El campeón y el MVP actual siguen en su clasificación. Se ordena de más reciente a más antiguo, con ID estable para empates. El cierre sólo conoce el día: se muestra sin hora; para ordenar tiene prioridad de fin del día UTC, sin afirmar un instante histórico. No se crea una fila por cada consulta ni una suscripción adicional.

`20261008161022_feed_club.sql` agrega un helper privado de lectura, exige cuenta y permiso de liga, verifica pertenencia de la temporada y extiende `detalle_liga`. El feed consulta como máximo 20 torneos antes de combinar los otros eventos y aplica un límite final de 20; no implica paginación del historial original, que se revisará en performance. La UI mantiene el feed dentro del club y traduce labels/estados a ES/EN/PT.

Pruebas SQL: Free, club vacío, más de 20 eventos, orden/IDs estables, torneos pendientes excluidos, cierre con precisión de día, anuncio de fecha, cancelación, nueva temporada y privacidad de ajenos/anónimos/helpers. UI cubre los tres tipos, cantidades y ausencia de hora ficticia en el cierre. Pasaron suite, TypeScript, lint, traducciones y bundles. Supabase conserva 26 resultados; helper sin ejecución cliente y límite verificados. Advisors conservan los avisos documentados, incluyendo [SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) e [índices sin uso observado](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

Antes de enviar push de cambio MVP, se necesita registrar esa transición una sola vez al cerrar el torneo, con entrega/preferencias/anti-spam. Ese trabajo pertenece al bloque 24–27; el feed actual no envía notificaciones ni requiere nuevas cuentas pagas. Aceptación física y nueva compilación siguen pendientes.
