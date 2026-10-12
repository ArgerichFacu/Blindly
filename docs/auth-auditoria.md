# Auditoría previa a auth convencional — 2026-10-12

## Estado comprobado antes de modificar código

sesion.ts crea un invitado con signInAnonymously y persiste sesión mediante supabase.ts/AsyncStorage. La protección principal invoca crear-recuperacion: Admin actualiza ese mismo UUID con email interno UUID@recovery.blindly.invalid y contraseña aleatoria. La clave BLINDLY1 contiene UUID y secreto; recuperación usa signInWithPassword. Existe email OTP, pero la interfaz lo oculta tras EXPO_PUBLIC_EMAIL_AUTH_READY. No existe login normal, logout ni reset en UI.

Cuenta muestra UUID y clave como protagonistas. Introduccion ofrece invitado y crear/recuperar clave; tutorial está separado en inicio.ts y no crea usuarios. SesionNativa mantiene refresh según AppState. PlusContext escucha auth y borra entitlement al cambiar UUID; RevenueCat appUserID es siempre Supabase UUID. El grant de revisión recientemente agregado está separado de compras y se conserva como mecanismo revocable; la cuenta antigua no se utilizará para la nueva review.

Revisión de useIdentidad/useClubes: cargan por foco, no todos los hooks escuchan cambios de auth. Para actualizar UI se debe invalidar carga/estado al cambiar sesión, sin cambiar reglas de juego. Preferencias visuales/audio son actualmente locales al dispositivo; última liga sí usa clave con UUID. No convertir preferencias locales en una nueva base de usuarios/cloud durante esta tarea.

## Dependencias del UUID (FK comprobadas contra Supabase real)

- public.salas.host_id: ownership de salas.
- public.jugadores.user_id: participante/acciones/stack propios.
- public.puntuacion_partidas.user_id: puntos, historial y rango.
- public.ligas.owner_id y liga_miembros.user_id: clubes, membresías y roles.
- Temporadas/rankings/partidas de liga dependen indirectamente de esas filas.
- public.mesas_habituales.owner_id: plantillas personales.
- public.accesos_plus.user_id: espejo RevenueCat; private.accesos_revision_play.user_id: permiso de revisión.
- private.dispositivos_push/entregas_push.user_id: dispositivos y notificaciones.
- Auth identities/sessions/MFA/oauth: también referencias al usuario.

Las RPC/RLS comparan auth.uid(), ownership y membresía; private.cuenta_recuperable exige usuario no anónimo. Nombre/metadata no otorgan permisos. Cambiar A por B no mueve ninguno de estos datos. No se implementa merge ni migración destructiva.

## Eliminación

eliminar-cuenta valida JWT con getUser, bloquea jugador/host en partida activa, elimina subscriber RevenueCat si está configurado y luego auth.admin.deleteUser. La limpieza y FK/triggers existentes abarcan identidad; no depende de que el proveedor sea email, Google o clave. Aviso de que borrar la identidad no cancela suscripción se conserva.

## Configuración real

/auth/v1/settings: email=true, google=false, mailer_autoconfirm=false, disable_signup=false. Confirmación de email activa. SMTP/manual linking/redirects deben verificarse en dashboard; el correo de contacto proporcionado no configura automáticamente SMTP. No hay OAuth credentials que puedan inventarse.

## Decisiones

- Crear/proteger cuenta: updateUser sobre UUID actual; no signUp sobre invitado.
- Verificar email antes de agregar password, según documentación Supabase.
- Google: flujo oficial OAuth PKCE/linkIdentity para proteger el actual; signInWithOAuth sólo para ingresar a cuenta existente con guardas de pérdida de progreso. Navegador de sistema Expo WebBrowser; no SDK ni secretos Google en cliente.
- Login normal: signInWithPassword; logout conserva datos servidor y bloquea invitado con progreso/partida activa.
- Recuperación password: Supabase recovery, PKCE, ruta dedicada; password no se guarda en tablas ni AsyncStorage.
- Legacy continúa como opciones avanzadas. Google puede vincularse al mismo UUID. Sustituir el email interno/password invalida la clave anterior; debe advertirse y comprobarse la verificación segura (incluida secure email change) antes de hacerlo, nunca silenciosamente.
- Google/SMTP no se declaran funcionando hasta QA real con configuración válida. Pruebas simuladas y pruebas reales se registran separadas.

Fuentes: https://supabase.com/docs/guides/auth/auth-anonymous ; https://supabase.com/docs/reference/javascript/auth-linkidentity ; https://supabase.com/docs/guides/auth/sessions/pkce-flow ; https://supabase.com/docs/guides/auth/passwords ; Expo 57 https://docs.expo.dev/versions/v57.0.0/sdk/webbrowser/ .

## Configuración verificada después de la auditoría

Dashboard: manual linking/anónimo/Confirm email/Secure email change activos; Google desactivado, SMTP propio desactivado, sin Redirect URLs, Site URL localhost:3000. OTP 8 dígitos/3600 s. No se alteraron estas protecciones. Nuevo estado y QA: auth-convencional.md.

El dueño autorizó añadir sólo blindly://auth-callback y http://localhost:8090/auth-callback. Ambos guardados y verificados en dashboard; evidencia G:/Blindly/evidencias/auth-redirects-configurados.png. Site URL sigue sin cambios; SMTP/Google pendientes.
