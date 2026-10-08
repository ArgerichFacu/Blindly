# Identidad por UUID y compatibilidad con invitados

Meta 10 de la próxima versión. No cambia el esquema, los UUID existentes ni la política de juego casual. No se fusionan perfiles por nombre.

## Modelo

Supabase Auth asigna UUID incluso a una sesión anónima. Invitado significa que esa identidad todavía no tiene un método para recuperarla en otro dispositivo; no significa que use el rol Postgres `anon`. La cuenta protegida conserva el mismo UUID al vincular una clave, un correo confirmado o una identidad social. Los nombres de mesa y liga son etiquetas modificables, nunca claves de propiedad.

`src/lib/identidad.ts` distingue invitado, cuenta recuperable y protección pendiente. La clave interna debe corresponder exactamente al UUID actual; un correo pendiente de confirmación no se anuncia como recuperación disponible. El campo editable `user_metadata` no concede acceso. Este descriptor sirve para interfaz: los permisos siguen en las RPC/RLS existentes y la Edge Function valida el usuario con Auth.

Mi cuenta muestra el UUID propio para reconocer la identidad. El secreto de recuperación se mantiene separado: únicamente se muestra al generarlo y el campo para recuperarlo no capitaliza ni expone su contenido. Google/Apple siguen sin configuración; reconocer una identidad social no implica habilitar botones de login que no funcionan. Correo sigue bloqueado hasta disponer de SMTP y confirmar entrega.

## Compatibilidad y protección

Las filas antiguas sin `user_id` siguen siendo representables en `Jugador` y visibles en la mesa. `esMiJugador` solo reconoce una coincidencia explícita de UUID: un nombre duplicado, UUID vacío o `null` no acredita propiedad. La UI no permite apropiarse automáticamente de jugadores legacy. Cualquier asociación futura debe tener un mecanismo explícito y protegido en el servidor.

Antes de cambiar desde un invitado a otra cuenta se consultan sus ligas y mesas guardadas, además de puntos, partidas activas y Plus. Si tiene datos persistentes, la app exige proteger la identidad actual antes de abandonarla. Esto también cubre mesas conservadas tras vencer Plus. Una consulta fallida o una respuesta social inválida bloquea el cambio; no se interpreta como ausencia de datos. La sesión se revalida al terminar esas consultas.

Al generar una clave, la respuesta y la sesión refrescada deben conservar el UUID original. Si la sesión cambió durante la operación no se muestra una clave asociada a otra identidad. Las claves, contraseñas y tokens no se escriben en logs ni en nuevas tablas locales.

## Validación

- `tests/identidad.cjs`: invitado, protección por clave/correo/social, correo pendiente, metadata editable, continuidad del UUID, nombres duplicados y filas legacy.
- `tests/sesion.cjs`: sesión única, recuperación sin crear cuentas extra, conservación al vincular, bloqueo por ligas/mesas/puntos/partida/Plus, error de consulta y UUID distinto al generar clave.
- `tests/inicio-cuenta.cjs`: handlers reales de Cuenta, UUID visible, campo privado sin capitalización y clave visible hasta confirmar que se guardó.
- Suite SQL existente con consultas reales en PGlite para ligas, puntuación, mesas guardadas, RLS e idempotencia; TypeScript, lint, traducciones y bundles Android/iOS/web.

No se ejecuta una migración en producción en este bloque. La meta 12 todavía requiere ampliar los controles de acceso social en UI y backend con compatibilidad para invitados legacy. Las ligas siguen con sus reglas anteriores hasta completar ese bloque; no se afirma que ya sean clubes Free. Pruebas físicas de recuperación entre dos dispositivos y SMTP/compras reales siguen pendientes.

Referencias revisadas: [usuarios Auth](https://supabase.com/docs/guides/auth/users), [sesiones anónimas](https://supabase.com/docs/guides/auth/auth-anonymous), [changelog](https://supabase.com/changelog). Se consultó el changelog actual: no se encontró cambio de Auth aplicable a este bloque; no se usan los endpoints de logs o adapters de servidor deprecados.
