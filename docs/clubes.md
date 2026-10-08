# Clubes Free y roles

La próxima versión transforma las ligas en clubes permanentes Free. Crear un club, abrir/cerrar temporadas, asociar partidas y administrar miembros ya no requiere Plus. El juego casual mantiene las cuentas invitadas. Una cuenta protegida con clave de recuperación funciona sin SMTP y conserva su UUID.

## Experiencia y permisos

El club muestra nombre, descripción, miembros, rol propio, temporadas y ranking. El owner puede editar nombre, archivar/reactivar y asignar o quitar administradores. Owner y admins pueden editar descripción, crear/cerrar temporadas, asociar partidas y retirar miembros normales. Un admin no puede retirar otro admin ni al owner. Un member consulta el club sin administrar. Retirar miembros conserva sus resultados históricos.

Crear o administrar requiere una cuenta no anónima verificada por el servidor. La pantalla Cuenta conserva el destino `liga-nueva` o el club concreto al generar/recuperar una clave; exige continuar después de mostrar la clave. Las cuentas legacy anónimas mantienen lectura de sus clubes y pueden proteger su identidad sin cambiar de UUID. No se crea membresía permanente automáticamente para nuevos invitados anónimos al iniciar una partida.

## Migración y seguridad

`supabase/migrations/20261008042305_clubes_free_roles.sql` agrega `ligas.descripcion` y `liga_miembros.rol`, sin borrar tablas ni resultados. El rol owner se deriva de `ligas.owner_id`; no se duplica en un atributo editable. Los helpers privados verifican `auth.users.is_anonymous`, `auth.uid()` y membresía activa. Ningún rol se toma del teléfono o del nombre del jugador.

Las RPC `actualizar_club`, `cambiar_rol_liga` y `quitar_miembro` validan permisos y bloquean la fila del club durante cambios administrativos. `detalle_liga` conserva la lógica original del ranking y agrega descripción y roles. Los helpers y la función histórica privada no son ejecutables por `authenticated` o `anon`. Las tablas conservan RLS y lectura limitada; no se concede escritura directa a clientes.

Aplicada en `ddvbbkwhisuezloorhfg` el 8 de octubre de 2026. Antes/después: 0 clubes, 0 miembros y **26 resultados conservados**. Se comprobaron columnas, registro de migración, denegación de ejecución `anon` para cambio de rol y denegación de helpers privados a `authenticated`.

El advisor mantiene avisos sobre [RPC SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [tablas privadas sin políticas cliente](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) y políticas legacy que permiten lectura anónima. Estos avisos se revisan junto con las pruebas de propiedad/roles; no equivalen a una auditoría sin observaciones. La [protección contra contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) sigue desactivada en la configuración previa.

## Pruebas y pendientes

`tests/clubes-sql.cjs` reconstruye todas las migraciones y prueba Free sin RevenueCat, guest casual, rechazo de administración anónima, escalada de privilegios, promoción/revocación, límites de admin, privacidad, cierre con salas pendientes, conservación de historia y escrituras directas denegadas. `tests/inicio-cuenta.cjs` ejecuta los handlers reales de generación/recuperación y regreso al club. Pasaron la suite completa, TypeScript, lint, traducciones ES/EN/PT y exportación web/Android/iOS.

Pendientes del siguiente bloque: invitación explícita por código/link/QR, contexto tras recuperar desde esa invitación y endurecer la entrada social persistente sin romper membresías legacy. La incorporación automática de jugadores con cuenta protegida al iniciar una partida se mantiene por compatibilidad hasta implementar ese bloque. La aceptación entre celulares sigue pendiente.

Los APK/AAB/iOS de la release anterior no contienen este cambio; se requiere una nueva compilación después de cerrar los bloques de evolución.
