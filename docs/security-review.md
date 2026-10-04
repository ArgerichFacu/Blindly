# Revisión de seguridad de Supabase

Revisión remota realizada el 3 de octubre de 2026 sobre el proyecto `ddvbbkwhisuezloorhfg`. El proyecto estaba `ACTIVE_HEALTHY`, en Postgres 17, con las siete migraciones de Blindly y las Edge Functions `eliminar-cuenta` v4 y `crear-recuperacion` v2 activas con `verify_jwt=true`.

El asesor de rendimiento no informó hallazgos. El asesor de seguridad mantiene avisos que se revisaron individualmente y son coherentes con el modelo de acceso de Blindly. Estos avisos no deben ignorarse si cambia la autenticación, el esquema o alguna función.

## Tablas internas sin políticas

`operaciones_mesa` y `puntuacion_partidas` tienen RLS activo y no tienen políticas. Es intencional: `anon` y `authenticated` no reciben privilegios directos sobre estas tablas. Los clientes acceden únicamente mediante RPC delimitadas; `service_role` se usa en las Edge Functions autenticadas para eliminación de cuenta. Agregar una política permisiva para silenciar el aviso ampliaría innecesariamente la superficie de acceso.

## RPC `SECURITY DEFINER`

Las únicas RPC `SECURITY DEFINER` ejecutables por `authenticated` son:

- `accion_mesa`: exige sesión, pertenencia, turno, revisión de sala e idempotencia. Delega en versiones internas sin permiso de ejecución para roles cliente. Las operaciones reservadas comprueban además el dealer.
- `mi_puntuacion`: exige sesión y devuelve puntos e historial solamente para `auth.uid()`.
- `rangos_mesa`: exige sesión y pertenencia a la sala; devuelve únicamente el rango de sus participantes.
- `unirse_mesa`: exige sesión, código válido, nombre acotado, sala en espera y límite de diez jugadores.

Las cuatro tienen `search_path=''`; `anon` no puede ejecutarlas. Las funciones históricas `accion_mesa_v1`, `accion_mesa_v2`, `accion_mesa_con_puntuacion` y `accion_mesa_con_stack_dealer` tampoco son ejecutables directamente por `anon`, `authenticated` ni `service_role`. Conservar una fachada autenticada es necesario porque las tablas internas no se exponen al cliente.

## Identidades anónimas

Blindly crea una identidad invitada mediante Supabase Auth para que cada jugador entre sin registro. Supabase asigna a esos invitados el rol Postgres `authenticated`, por lo que el asesor marca las políticas de `salas` y `jugadores`. Esto es esperado: las políticas no confían solo en el rol, sino que comparan `auth.uid()` con `host_id` o `user_id`, o verifican pertenencia a la sala. La identidad puede volverse recuperable sin cambiar ese UUID.

## Contraseñas filtradas

La protección de contraseñas filtradas permanece desactivada porque Blindly no ofrece alta ni acceso mediante una contraseña elegida por el usuario. El correo usa códigos OTP y la clave privada de recuperación se genera aleatoriamente en el servidor. Si se incorpora login convencional con contraseña, esta protección debe activarse antes de habilitarlo.

## Revisión al cambiar el backend

Después de cualquier migración o cambio en Auth:

1. Ejecutar los asesores de seguridad y rendimiento.
2. Confirmar que solo las cuatro fachadas anteriores sean ejecutables por `authenticated`.
3. Confirmar que toda función `SECURITY DEFINER` use `search_path=''` y valide `auth.uid()` y el alcance de los datos.
4. Ejecutar `npm test`, especialmente `tests/seguridad-sql.cjs` y `tests/migrations.cjs`.
5. Probar con dos usuarios reales que una identidad no pueda leer ni modificar una sala ajena.

Referencias: [seguridad de la API de datos](https://supabase.com/docs/guides/api/securing-your-api), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) y [aviso sobre identidades anónimas](https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins).

## Dependencias JavaScript

La revisión del 3 de octubre de 2026 produjo cero vulnerabilidades críticas. `npm audit --omit=dev` informó 21 altas y 11 moderadas, pero los avisos altos se concentran en Expo CLI, Metro, prebuild y herramientas transitivas de React Native. No forman rutas de entrada del juego dentro del APK; `npm audit` también replica esos avisos sobre paquetes directos que dependen del mismo árbol.

No existe una actualización automática compatible: `npm audit fix --force` propone Expo 44, React Native 0.72 y Expo Router 58, lo que rompería la matriz obligatoria de Expo SDK 57. Los paquetes `braces`, `node-forge` y `http-cache-semantics` todavía no tenían una versión corregida publicada al momento de la revisión.

`expo-router` 57 incluye `query-string` 7 y `decode-uri-component` 0.2.2. Su aviso moderado permite provocar consumo excesivo de CPU con una URL malformada; no informa lectura, modificación ni ejecución de código. La versión corregida de `decode-uri-component` es ESM y no puede forzarse dentro de `query-string` 7, que la carga con CommonJS. Se conserva la combinación soportada por Expo 57 y se debe actualizar cuando Expo publique una corrección compatible o al migrar el SDK.

CI ejecuta `npm audit --audit-level=critical`, además de Expo Doctor, compatibilidad de paquetes, tipos, lint, pruebas y exportación de bundles. No se debe usar `npm audit fix --force`; cualquier actualización necesita pasar la matriz completa y una nueva build nativa.

Referencias: [aviso de `decode-uri-component`](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), [aviso de `braces`](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) y [aviso de `node-forge`](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
