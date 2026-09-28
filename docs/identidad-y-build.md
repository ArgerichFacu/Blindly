# Identidad recuperable y prueba nativa

## Identidad

Mi cuenta está en Opciones y Mi puntuación. Proteger este invitado usa updateUser(email) y verifyOtp(email_change): conserva el UUID, sin migrar puntos ni modificar RLS. Recuperar usa signInWithOtp(shouldCreateUser:false) y verifyOtp(email). No fusiona cuentas. Se bloquea la recuperación si el invitado tiene partidas puntuadas o el usuario tiene una partida jugando/pausada. El invitado sigue disponible sin email.

Antes de probar correo en Supabase:
1. Authentication > Sign In / Providers: Email y Confirm email habilitados; Allow manual linking ya fue activado con autorización del usuario; Confirm email sigue habilitado.
2. Authentication > Emails: usar los HTML de supabase/email-templates en Change email y Magic link. El dashboard confirmó que no hay SMTP propio y bloquea la edición de plantillas hasta configurarlo. Los HTML todavía NO están aplicados. Deben incluir {{ .Token }} para ingresar códigos en la app; no se necesitan redirecciones ni deep links para este flujo.
3. Configurar SMTP propio para destinatarios fuera del equipo. No guardar la contraseña SMTP en el repo ni en variables EXPO_PUBLIC. El servicio predeterminado de Supabase tiene restricciones; confirmar entrega con un correo real antes de publicar.
4. Probar vincular un invitado con puntos, confirmar que conserva UUID y puntuación, luego recuperar en otro dispositivo. Código inválido/vencido debe conservar la sesión actual. Probar email existente y reenvío con límites de frecuencia.

## EAS

Perfiles en eas.json: preview (APK Android instalable, distribución interna iOS) y production. Identificadores propuestos com.blindly.app; confirmar que sean los definitivos antes de publicar.

Primera configuración con tu cuenta Expo:

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --visibility plaintext
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_KEY --visibility plaintext
```

Introducir los valores públicos existentes de .env en las preguntas del CLI. Nunca usar service_role. .env está ignorado por Git y no se debe asumir que se sube a EAS. Crear también las dos variables en production cuando corresponda. No se agregó un projectId ficticio: eas init enlaza el proyecto real.

Una vez enlazado y con variables configuradas:

```powershell
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

iOS físico necesita cuenta Apple Developer y registrar el dispositivo/provisionamiento cuando EAS lo solicite. No se ejecutó ninguna compilación remota ni publicación.

## Configuración y verificación física

Splash nativo: assets/images/blindly-logo.png sobre #0A1713; requiere nueva build, no Expo Go. El logo del menú es transparente y se adapta al tema. El splash del sistema es fijo antes de cargar las preferencias; las pantallas React respetan el tema.

Música: se pausa en segundo plano, al abandonar la mesa y al pausar la partida; al regresar se reanuda manualmente. No se habilitó reproducción en segundo plano ni permisos de grabación. El refresh de autenticación nativa sigue AppState.

En dos celulares: crear/unirse, apostar, cerrar mano; bloquear/desbloquear, modo avión y recuperación de red; comprobar reconexión sin duplicar apuestas/puntos, música detenida al bloquear y retorno al estado real. Verificar splash desde arranque en frío. Las pruebas automáticas no sustituyen estas pruebas físicas.

## Estado del correo
El usuario confirmó que no tiene proveedor de correo. Por eso el envío de códigos queda deshabilitado por defecto en Mi cuenta. Después de configurar SMTP, aplicar ambas plantillas y comprobar la entrega, definir EXPO_PUBLIC_EMAIL_AUTH_READY=true en .env y en cada entorno EAS usado; reconstruir la app. Esta variable pública es un indicador de disponibilidad, no una protección de seguridad.
