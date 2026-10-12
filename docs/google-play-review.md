# Identidad exclusiva para Google Play Review

Cuenta: **Google Play Reviewer**. Se crea mediante la autenticación anónima y Edge Function crear-recuperacion existentes, protegiendo el mismo UUID con email interno y contraseña aleatoria. No cambia sesion.ts, cuenta.tsx ni el flujo de autenticación general. La credencial estable está fuera del repositorio, en G:/Blindly/privado/google-play-reviewer.json y Google-Play-Review-instrucciones.txt. Nunca copiarla a Git, al README ni a un issue público.

## Permiso Plus

Migration 20261012041133_play_review_access.sql: private.accesos_revision_play, administrada exclusivamente por operador/servicio, RLS sin políticas de acceso para clientes. RPC mi_acceso_revision_play no admite UUID ajeno: consulta auth.uid(). El helper tiene_plus conserva el comportamiento de RevenueCat y admite además este permiso independiente. No toca accesos_plus ni productos/clientes RevenueCat. El grant exige cuenta no anónima, no bloqueada, activa y no vencida. NULL en vence_en significa sin vencimiento.

PlusContext reconoce ese permiso aun con compras desactivadas; el SDK de compras no se inicia en ese caso. Clear de estado al cambiar UUID, control de carreras asíncronas, consulta al volver del fondo y respuesta cerrada ante errores. El frontend no puede concederlo mediante metadata, nombres o flags. La cuenta puede usar sus propias funciones/clubes, sin permisos administrativos sobre otros usuarios.

**Requiere build v23 o posterior. La v22 del canal interno no reconoce el permiso en la interfaz.** El AAB nuevo debe reemplazar esa versión antes de mandar la app a review.

Cuenta y club privado creados exclusivamente para revisión. Club: Google Play Review; temporada Review season. No se insertaron partidas, puntuaciones ni compras ficticias.

## Campos de Play Console

Contenido de la aplicación > Acceso a la aplicación > Todas o algunas funciones restringidas > Añadir instrucciones.

- Nombre: Google Play Review.
- Usuario: Google Play Reviewer (etiqueta, no email).
- Contraseña: **clave completa BLINDLY1:UUID:secreto**, desde el archivo privado.
- Otras instrucciones: texto inglés siguiente; marcar que no exige OTP/2FA si el formulario pregunta.

This app uses a permanent recovery key instead of a conventional username/password login.
1. Install Blindly versionCode 23 or later and open the app.
2. On the welcome screen, choose "Create or recover account" (Spanish: "Crear o recuperar cuenta"). If you are on the main menu, go to Profile > Protect my account ("Perfil" > "Proteger mi cuenta").
3. On "My account" ("Mi cuenta"), tap "I already have a key" ("Ya tengo una clave").
4. Paste the ENTIRE recovery key provided in the password field of these review instructions into "Recovery key" ("Clave de recuperación") in the app.
5. Tap "Recover my account" ("Recuperar mi cuenta"), then "Continue with this account" ("Continuar con esta cuenta") if shown. Complete or skip the short tutorial.
6. Blindly Plus is enabled automatically for this review identity. No purchase, email, OTP, phone number or manual approval is required. Internet access is required.
7. Open Leagues ("Ligas") > "Google Play Review" to inspect the private review club and "Review season". The account can create its own rooms and use Plus personalization and tools; it has no access to other users' private clubs.
The username "Google Play Reviewer" is an identifying label, not an email address. Do not create a new recovery key: this would replace the supplied credential.

## Desactivar o eliminar más adelante

En el SQL Editor de Supabase, usar el UUID de la identidad que figura en el archivo privado:

```sql
update private.accesos_revision_play set activo=false where user_id='<UUID_DE_REVIEW>';
```

La revocación afecta las RPC inmediatamente; el cliente actualiza el estado al refrescar o volver del fondo. Esto retira Plus, pero no impide iniciar sesión con la clave.

Para impedir también login, bloquear/banear únicamente esa identidad en Supabase Auth (o auth.admin.updateUserById con ban_duration) y revocar sus sesiones. Un access token existente no se invalida sólo por eliminar la cuenta; comprobar sesiones y respetar su vencimiento. Para eliminación completa, usar el flujo existente "Eliminar mi cuenta" dentro de esa identidad: ejecuta la limpieza prevista antes de borrar Auth. Esto es irreversible y puede borrar el club de revisión; no ejecutarlo durante review. La FK del grant elimina su fila al borrar el usuario.

## Verificación

Login real sin OTP y continuidad UUID comprobados; RPC real mi_acceso_revision_play=true y mi_estado_plus.activo=true. Privilegios clientes INSERT=false; otro UUID=false. Revocación, expiración y ban probados dentro de transacción con rollback. Tests de provider: grants, cambio de UUID, carrera asíncrona y ausencia de SDK cuando compras están apagadas. Fixture SQL usa banned_until de Auth y prueba grant/revocación/expiración/ban/anónimo/cascade.

Advisors: la tabla privada sin políticas deniega acceso cliente por diseño. La advertencia de SECURITY DEFINER en la RPC es esperada: debe leer una tabla privada y sólo devuelve el permiso de auth.uid(), sin parámetros. Otros avisos preexistentes (pg_net, contraseña filtrada, políticas anónimas para juego, otras RPC) no se modifican en este trabajo; no se declara que el proyecto carezca de todos los avisos. [Referencia de SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
