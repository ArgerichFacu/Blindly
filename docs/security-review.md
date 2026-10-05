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

La revisión del 5 de octubre de 2026 produjo cero vulnerabilidades críticas. `npm audit --audit-level=critical` informó 23 altas y 13 moderadas en dependencias transitivas de Expo CLI, Metro, prebuild y React Native, pero ninguna crítica y ninguna corrección compatible automática.

`npm audit fix --force` propone versiones incompatibles, incluida una regresión a Expo 44, por lo que no debe ejecutarse. La matriz obligatoria permanece en Expo SDK 57 y se valida con Expo Doctor, compatibilidad de paquetes, TypeScript, ESLint, pruebas y exportación de bundles en CI.

Referencias: [aviso de `decode-uri-component`](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), [aviso de `braces`](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) y [aviso de `node-forge`](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
