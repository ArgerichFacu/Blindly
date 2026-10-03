# Identidad recuperable y prueba nativa

## Identidad

Mi cuenta está en Opciones y Mi puntuación. **Crear clave de recuperación** convierte el invitado en una credencial de Supabase Auth sin cambiar su UUID. La Edge Function autenticada genera un secreto aleatorio, configura un alias interno y una contraseña confirmada mediante la API administrativa, y devuelve la clave una sola vez. En otro celular, la app separa el UUID y el secreto y usa `signInWithPassword`. La contraseña solo queda almacenada como hash en Supabase Auth. Rotar la clave invalida la anterior.

El correo sigue como segunda opción: Proteger este invitado usa `updateUser(email)` y `verifyOtp(email_change)`, mientras Recuperar usa `signInWithOtp(shouldCreateUser:false)` y `verifyOtp(email)`. Ambos mecanismos conservan la privacidad de la puntuación y no fusionan cuentas. Se bloquea el cambio de identidad si el invitado tiene partidas puntuadas o Blindly Plus activo, o si el usuario tiene una partida jugando/pausada.

Antes de probar correo en Supabase:
1. Authentication > Sign In / Providers: Email y Confirm email habilitados; Allow manual linking ya fue activado con autorización del usuario; Confirm email sigue habilitado.
2. Authentication > Emails: usar los HTML de supabase/email-templates en Change email y Magic link. El dashboard confirmó que no hay SMTP propio y bloquea la edición de plantillas hasta configurarlo. Los HTML todavía NO están aplicados. Deben incluir {{ .Token }} para ingresar códigos en la app; no se necesitan redirecciones ni deep links para este flujo.
3. Configurar SMTP propio para destinatarios fuera del equipo. No guardar la contraseña SMTP en el repo ni en variables EXPO_PUBLIC. El servicio predeterminado de Supabase tiene restricciones; confirmar entrega con un correo real antes de publicar.
4. Probar vincular un invitado con puntos, confirmar que conserva UUID y puntuación, luego recuperar en otro dispositivo. Código inválido/vencido debe conservar la sesión actual. Probar email existente y reenvío con límites de frecuencia.

## EAS

Perfiles en eas.json: development (cliente de desarrollo interno), preview (APK Android instalable y distribución interna iOS) y production. El identificador definitivo de Android e iOS es `com.blindly.app`. Expo SDK 57 compila y apunta a Android API 36.

El proyecto ya está vinculado a [`@facuargerich/blindly`](https://expo.dev/accounts/facuargerich/projects/blindly), con ID `9f3c10b7-f501-45d8-8d64-b1ffe5569667`. Los entornos `development`, `preview` y `production` contienen `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY` y `EXPO_PUBLIC_EMAIL_AUTH_READY=false`. Blindly Plus está activo con RevenueCat Test Store solamente en `development`; `preview` y `production` mantienen `EXPO_PUBLIC_PLUS_READY=false` hasta configurar las tiendas reales.

Para revisar esa configuración:

```powershell
npx eas-cli@latest project:info
npx eas-cli@latest env:list development
npx eas-cli@latest env:list preview
npx eas-cli@latest env:list production
```

Las claves públicas de RevenueCat se agregan cuando existan los proyectos de las tiendas; `REVENUECAT_SECRET_KEY` se guarda únicamente como secreto de la Edge Function de Supabase. La clave privada actual debe rotarse porque apareció en un registro de automatización; revocarla, generar el reemplazo y actualizar Supabase requiere autorización explícita. Nunca usar `service_role` en EAS ni en variables `EXPO_PUBLIC`.

Una vez enlazado y con variables configuradas:

```powershell
npx eas-cli@latest build --platform android --profile development
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

iOS físico necesita una cuenta Apple Developer. Para una descarga privada entre amigos, el perfil `preview` genera una IPA *ad hoc*: EAS solicita registrar el UDID de cada iPhone y firma la aplicación solo para esos dispositivos. TestFlight es la alternativa recomendada cuando se quiere invitar por correo o enlace sin registrar cada UDID; requiere crear Blindly en App Store Connect, pero no obliga a publicar la aplicación en App Store.

No se puede instalar un APK en iPhone. La distribución prevista queda así:

- Android público: AAB de `production` en Google Play.
- Android de prueba: APK de `preview` mediante el enlace interno de EAS.
- iPhone privado: IPA `preview` para dispositivos registrados o TestFlight para un grupo cerrado.

La publicación comercial inicial solo requiere productos de Blindly Plus en Google Play Console. App Store Connect será necesario para distribuir mediante TestFlight y para probar compras reales en iPhone. Una IPA *ad hoc* no necesita una publicación pública en App Store, pero debe mantener Plus desactivado hasta disponer de una clave real de plataforma porque Test Store no funciona en builds release.

Los previews anteriores que incluían una clave Test Store quedaron obsoletos: RevenueCat cierra deliberadamente las builds release que usan esa clave. El [APK preview aceptado por EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/5c01f942-48fa-403f-a16a-3fac1d035e58) mantiene Plus desactivado y sirve para probar el juego. El [AAB de producción](https://expo.dev/accounts/facuargerich/projects/blindly/builds/b1aca8b7-3598-4f57-8652-db7861e418e7) usa `versionCode 2` y está preparado para la pista interna de Google Play. Para probar compras simuladas se debe usar una build `development` depurable. El historial completo está en [`@facuargerich/blindly`](https://expo.dev/accounts/facuargerich/projects/blindly/builds).

## Configuración y verificación física

Splash nativo: assets/images/blindly-logo.png sobre #0A1713; requiere nueva build, no Expo Go. El logo del menú es transparente y se adapta al tema. El splash del sistema es fijo antes de cargar las preferencias; las pantallas React respetan el tema.

Música: se pausa en segundo plano, al abandonar la mesa y al pausar la partida; al regresar se reanuda manualmente. No se habilitó reproducción en segundo plano ni permisos de grabación. El refresh de autenticación nativa sigue AppState.

En dos celulares: crear/unirse, apostar, cerrar mano; bloquear/desbloquear, modo avión y recuperación de red; comprobar reconexión sin duplicar apuestas/puntos, música detenida al bloquear y retorno al estado real. Verificar splash desde arranque en frío. Las pruebas automáticas no sustituyen estas pruebas físicas.

## Estado del correo
El usuario confirmó que no tiene proveedor de correo. Por eso el envío de códigos queda deshabilitado por defecto en Mi cuenta. Después de configurar SMTP, aplicar ambas plantillas y comprobar la entrega, definir EXPO_PUBLIC_EMAIL_AUTH_READY=true en .env y en cada entorno EAS usado; reconstruir la app. Esta variable pública es un indicador de disponibilidad, no una protección de seguridad.
