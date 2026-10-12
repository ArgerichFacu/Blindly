# Cuenta exclusiva para Google Play Review

Nombre: **Google Play Reviewer**. Email aprobado: **administracionblindly+playreview@gmail.com**. Cuenta nueva de Supabase Auth, correo confirmado y contraseña estable. El SDK real comprobó login sin OTP y el permiso Plus permanente. No es una credencial de Gmail ni da acceso al buzón.

Credencial e instrucciones completas fuera de Git: G:/Blindly/privado/google-play-reviewer-email.json y Google-Play-Review-email-instructions.txt. No copiarlas a README, issues públicos o capturas compartidas. La identidad legacy descartada no se reutilizó ni eliminó.

**La v22 interna no tiene email/password. Actualizarla con el candidato validado v28 antes de enviar estas instrucciones a review.** La QA Android se registra en [auth-convencional.md](auth-convencional.md).

## Permiso Plus

Se reutiliza 20261012041133_play_review_access.sql: private.accesos_revision_play administrada sólo por operador/servicio, RLS sin políticas cliente. RPC mi_acceso_revision_play consulta auth.uid(), sin UUID externo. Tiene_plus conserva RevenueCat y admite el grant separado. No se cambiaron productos, clientes RevenueCat ni accesos_plus.

El permiso exige cuenta permanente, no bloqueada, activa y no vencida; NULL en vence_en significa sin vencimiento. No se concede por nombre, metadata o flags. PlusContext reconoce el permiso con compras apagadas, limpia estado al cambiar UUID y evita carreras. El reviewer sólo tiene permisos normales sobre sus propias mesas/clubes.

## Campos de Google Play Console

Contenido de la aplicación → Acceso a la aplicación → Todas o algunas funciones restringidas → Añadir instrucciones.

- Nombre: Google Play Reviewer.
- Usuario: administracionblindly+playreview@gmail.com.
- Contraseña: valor Password del archivo privado Google-Play-Review-email-instructions.txt.
- Otras instrucciones: texto siguiente. Login sin OTP/2FA ni acceso al correo.

## Instructions for reviewers

1. Install Blindly versionCode 28 or later and open the app.
2. On the welcome screen, tap "Create account / Sign in". If you have continued as a guest, open Profile / Options > "My account".
3. Enter the email and password supplied in App access, then tap "Sign in". Use these credentials only in Blindly; they are not Gmail credentials.
4. If prompted, tap "Continue with this account" and complete or skip the tutorial.
5. "My account" displays "PLUS ACTIVE". Plus is permanently enabled for this review identity. No purchase, email code, mailbox access or manual activation is required. Internet access is required.
6. Create rooms and clubs using normal owner/dealer permissions and inspect Plus personalization and tools. Blindly accompanies in-person poker with physical cards and multiple players; no real-money wagering or chip purchase is required.

This account has no administrative access to other users and no actual subscription to cancel. Do not create another identity: the supplied account has the review grant.

## Desactivar o eliminar

Usar únicamente el UUID de esta identidad del archivo privado:

```sql
update private.accesos_revision_play
set activo=false
where user_id='<UUID_DEL_REVIEWER_NUEVO>';
```

Esto retira Plus; la UI refresca al volver del fondo o recargar. No impide login. Para impedir acceso también, bloquear esa identidad en Supabase Auth y revocar sus sesiones. Eliminar la cuenta no invalida por sí solo los access tokens existentes: comprobar usuario/sesión vigentes en operaciones sensibles.

Para eliminarla completamente, usar "Eliminar mi cuenta" en esa identidad. Ejecuta la limpieza prevista antes de borrar Auth y la FK limpia el grant. Es irreversible; no ejecutarlo durante review ni borrar datos ajenos.

## Evidencia

Reviewer nuevo: correo verificado, password estable, login SDK y UI de emulador Android sin OTP, UUID conservado, mi_acceso_revision_play=true y tiene_plus=true. PLUS ACTIVO visible en v28, persistencia tras cierre y actualización comprobada en emulador; A32 pendiente de actualización desde Play. Suites existentes cubren aislamiento, revocación, vencimiento, bloqueo y carreras de PlusContext; no sustituyen pruebas de compras reales.

La tabla privada deniega escrituras cliente por diseño. SECURITY DEFINER de la RPC es intencional y sólo devuelve el permiso de auth.uid(). Otros avisos preexistentes no se modifican ni ocultan. [Referencia del linter](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
