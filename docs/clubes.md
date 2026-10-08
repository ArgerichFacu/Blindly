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
