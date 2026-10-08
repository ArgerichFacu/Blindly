# Revisión de seguridad de Supabase

Revisión remota realizada el 5 de octubre de 2026 sobre el proyecto `ddvbbkwhisuezloorhfg`. La base contiene las nueve migraciones versionadas de Blindly y las Edge Functions `crear-recuperacion`, `eliminar-cuenta` y `sincronizar-plus`.

El asesor de seguridad informa cero errores. Sus advertencias se revisaron individualmente: corresponden principalmente a fachadas `SECURITY DEFINER` que la aplicación necesita invocar, al uso deliberado de identidades anónimas con rol `authenticated` y a la protección de contraseñas filtradas. La política nueva de `mesas_habituales` también aparece como acceso anónimo porque los invitados de Blindly usan el rol `authenticated`; restringe cada fila con `owner_id = auth.uid()`. El asesor de rendimiento mantiene como observación la inicialización de `auth.uid()` en esa política, sin alterar su aislamiento.

## Tablas internas sin escritura cliente

`operaciones_mesa`, `puntuacion_partidas`, `accesos_plus` y `mesas_habituales` tienen RLS activo y no permiten escrituras directas de `anon` ni `authenticated`. `accesos_plus` tampoco permite lectura cliente: solo la Edge Function autenticada puede actualizar el entitlement mediante `service_role`. Las plantillas conceden lectura únicamente al owner y sus mutaciones pasan por RPC con verificación de Plus.

Las tablas `ligas`, `liga_temporadas`, `liga_miembros` y `liga_partidas` conceden únicamente lectura a `authenticated`, limitada por políticas que verifican que `auth.uid()` sea owner o miembro activo. Todas las escrituras pasan por RPC acotadas. Agregar políticas permisivas para silenciar avisos ampliaría innecesariamente la superficie de acceso.

## Fachadas `SECURITY DEFINER`

Las quince RPC ejecutables por `authenticated` son:

- Mesa y puntuación: `accion_mesa`, `unirse_mesa`, `mi_puntuacion` y `rangos_mesa`.
- Ligas y suscripción: `mi_estado_plus`, `crear_liga`, `actualizar_liga`, `crear_temporada`, `finalizar_temporada`, `quitar_miembro`, `mis_ligas`, `mis_temporadas_propias`, `ranking_liga`, `detalle_liga` y `crear_sala(jsonb, uuid)`.
- Experiencia Plus: `mis_mesas_habituales`, `guardar_mesa_habitual`, `eliminar_mesa_habitual`, `crear_sala_desde_mesa`, `mi_head_to_head` y `recap_partida`.

Todas usan `search_path=''`, exigen sesión y aplican comprobaciones de ownership, pertenencia, estado o entitlement según la operación. Las funciones internas de mesa y los helpers de Plus no son ejecutables por roles cliente. `anon` no puede ejecutar las fachadas.

La auditoría remota comprobó catorce invariantes: tablas y migración presentes, RLS activo, caché Plus privada, ausencia de escrituras directas, acceso de `service_role`, bloqueo de `anon`, ejecución autenticada de la fachada, bloqueo del wrapper interno, Plus obligatorio al iniciar una sala de liga, temporada activa, bloqueo de cierre con salas pendientes, ranking derivado de `puntuacion_partidas` y cuatro políticas de lectura. Todos devolvieron `true`.

La migración 17 agregó una segunda auditoría de 20 condiciones. Confirmó `mesas_habituales`, RLS y lectura exclusiva del owner; negó `INSERT`, `UPDATE` y `DELETE` directos a `authenticated`; bloqueó el helper privado y la acción original; comprobó las ocho RPC públicas, el límite Free de 10 partidas y el registro de la migración. Una identidad anónima temporal leyó sus mesas y puntuación, recibió `PLUS_REQUERIDO` al intentar guardar una plantilla o abrir head-to-head, no pudo leer un recap ajeno y se eliminó al terminar.

## Identidades anónimas

Blindly crea una identidad invitada mediante Supabase Auth para que cada jugador entre sin registro. Supabase asigna a esos invitados el rol Postgres `authenticated`; por eso el asesor marca las políticas de `salas`, `jugadores`, `ligas`, `liga_temporadas`, `liga_miembros` y `liga_partidas`. Las políticas no confían solo en el rol: comparan `auth.uid()` con el owner o usuario y verifican pertenencia a la sala o liga.

La identidad puede volverse recuperable sin cambiar su UUID. Una prueba remota creó una identidad temporal, invocó `sincronizar-plus`, leyó `mi_estado_plus` y eliminó la cuenta. RevenueCat devuelve HTTP `201` al materializar un suscriptor nuevo; la función acepta ese estado y después procesa normalmente las respuestas `200`.

## Contraseñas filtradas

La protección de contraseñas filtradas permanece desactivada porque Blindly no ofrece alta ni acceso mediante una contraseña elegida por el usuario. El correo usa códigos OTP y la clave privada de recuperación se genera aleatoriamente en el servidor. Si se incorpora login convencional con contraseña, esta protección debe activarse antes de habilitarlo.

## Revisión al cambiar el backend

Después de cualquier migración o cambio en Auth:

1. Ejecutar los asesores de seguridad y rendimiento.
2. Revisar cada nueva RPC `SECURITY DEFINER`, su `search_path`, los privilegios y sus validaciones de `auth.uid()`.
3. Confirmar que las tablas internas no obtengan escritura cliente y que `accesos_plus` siga siendo privado.
4. Ejecutar `npm test`, especialmente `tests/seguridad-sql.cjs`, `tests/ligas-sql.cjs` y `tests/migrations.cjs`.
5. Repetir la prueba remota de Auth, `sincronizar-plus`, `mi_estado_plus` y limpieza de cuenta.

Referencias: [seguridad de la API de datos](https://supabase.com/docs/guides/api/securing-your-api), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) y [aviso sobre identidades anónimas](https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins).

## Dependencias JavaScript

La revisión del 7 de octubre de 2026 detectó el nuevo aviso crítico de `shell-quote` 1.10.0. Se actualizó únicamente esa dependencia transitiva a 1.12.0 dentro del rango admitido por `react-devtools-core`; la auditoría posterior tiene cero críticas, 24 altas y 13 moderadas. React Native carga `react-devtools-core` dentro de `__DEV__`, por lo que esta corrección de herramientas no modifica los APK/AAB release generados desde `a147e78`.

La matriz incluida en Expo 57.0.26 coincide con los paquetes bloqueados de la release. `expo install --check` y Expo Doctor con `EXPO_OFFLINE=1` verificaron esa matriz (21/21). El informe online recomienda seis parches posteriores: Expo 57.0.27, @expo/ui 57.0.22, expo-asset 57.0.19, expo-constants 57.0.21, expo-linking 57.0.12 y expo-router 57.0.25. CI conserva ese informe online como informativo y exige la matriz fija, auditoría crítica, tipos, lint, pruebas y bundles. Las recomendaciones nuevas deben revisarse al iniciar el siguiente bloque y requieren nuevos binarios si se aplican; este cierre conserva la relación entre los builds y su commit original.

Después del cierre `f953239` se aplicaron los parches recomendados para la siguiente versión. La verificación online pasó 21/21 y CI volvió a exigir tanto `expo install --check` como Expo Doctor online. La auditoría completa posterior informa cero críticas, 22 altas y 13 moderadas. Los binarios de base conservan el commit `a147e78`; estos parches y la nueva navegación necesitan una nueva build.

`npm audit fix --force` propone versiones incompatibles, incluida una regresión a Expo 44, por lo que no debe ejecutarse. La matriz obligatoria permanece en Expo SDK 57 y se valida con Expo Doctor, compatibilidad de paquetes, TypeScript, ESLint, pruebas y exportación de bundles en CI.

Referencias: [aviso de `shell-quote`](https://github.com/advisories/GHSA-pqg4-j6r4-53mv), [aviso de `decode-uri-component`](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), [aviso de `braces`](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) y [aviso de `node-forge`](https://github.com/advisories/GHSA-86w9-cpqp-85rv).

## Revisión de la evolución social (8 de octubre)

25 migraciones registradas, cadena completa probada con PGlite y aplicada sin eliminar los 26 resultados existentes. Identity/recap/history usan RPC explícitas, cuenta y pertenencia verificadas; auxiliares privados sin EXECUTE cliente. Identidad Plus validada por presets versionados, nunca por URLs o bandera premium enviada por cliente. Historial indexado y paginado. Cambios MVP persistidos bajo bloqueo del club y cierre idempotente; worker push con secreto privado generado en la base, revalidación previa al envío y reserva atómica.

Los asesores todavía informan reglas sobre RLS sin políticas en tablas privadas inaccesibles, ejecución de RPC SECURITY DEFINER por authenticated, políticas que permiten invitados en funciones casuales y protección de contraseñas filtradas apagada. Se revisaron los accesos relevantes con pruebas de roles/RPC; estos avisos no equivalen a una auditoría completamente limpia. Las funciones públicas privilegiadas son la API deliberada y verifican identidad/pertenencia en el cuerpo.

`pg_net` es una extensión gestionada no relocatable que aparece en `public`. Sus objetos `net` pertenecen a `supabase_admin`; revocar desde postgres produjo advertencias y no retiró todos sus privilegios SQL. La verificación efectiva de Data API respondió PGRST106: sólo `public` y `graphql_public` están expuestos. **No exponer `net`, `cron` ni `private`**. `cron` quedó sin USAGE para clientes. El dispatch privado sale sólo del job de postgres y no publica el secreto. [Asesor de extensiones](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public). Detalles en [notificaciones.md](notificaciones.md).

No se habilitaron protección de contraseñas de planes pagos, compras comerciales, envío push ni se cambió el plan de Supabase. El historial de migraciones y los resultados de producción permanecen intactos.
