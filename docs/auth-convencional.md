# Auth convencional — candidato Android v24

Estado al 12/10/2026: código y pruebas locales preparados; **activación externa y QA integral pendientes**. Google sigue deshabilitado, no hay SMTP propio; los dos callbacks exactos ya se configuraron con autorización. La prueba interna publicada v22 no fue reemplazada. No presentar este candidato como release final.

## Funcionamiento e identidad

La bienvenida ofrece Google, crear/iniciar sesión con email y jugar como invitado. Mi cuenta muestra nombre, email, métodos conectados, Plus, seguridad, logout y eliminación. Las claves BLINDLY1 se conservan en Opciones avanzadas. ES/EN/PT incluidos; inputs de correo/password, estados de carga y errores traducidos, bloqueo de doble toque y controles accesibles reutilizados.

- Proteger invitado: `updateUser(email)` sobre A; verificar email; `updateUser(password)` sobre A. No se usa signUp ni se genera B. Las contraseñas no se guardan en tablas, preferencias ni logs.
- Google nuevo: `linkIdentity` con OAuth/PKCE y navegador del sistema. Conserva A. «Ya tengo una cuenta Google» usa `signInWithOAuth` después de comprobar que no se pierde un invitado con datos/Plus ni una partida activa.
- Email existente: `signInWithPassword`, UUID original de la cuenta. No se fusionan identidades. Logout elimina sólo la sesión local y crea un invitado nuevo; los datos del usuario protegido permanecen en el servidor.
- Reset: `resetPasswordForEmail`, callback PKCE y nueva contraseña. El enlace se abre en el mismo dispositivo que lo solicitó. UUID/email de destino se validan; no se acepta un callback ajeno, sin solicitud o vencido. Un callback duplicado sólo canjea el código una vez.
- Sólo se guarda metadata de una solicitud pendiente y su contexto de navegación, nunca contraseña ni tokens OAuth adicionales. Expira a las 24 h; no extiende la vigencia del código que controla Supabase. La sesión y el verifier siguen bajo el SDK oficial.
- Los hooks de identidad/clubes reaccionan al cambio de Auth. Plus conserva el UUID Supabase como appUserID y su aislamiento existente. No se cambiaron productos, RLS, reglas del poker ni ownership.

## Legacy

Una cuenta con correo exacto `UUID@recovery.blindly.invalid` conserva su login BLINDLY1 mientras no sustituya email/password. Añadir Google no rota la clave. Convertirla a email/password advierte que la clave anterior dejará de servir; conserva datos y UUID.

`confirmar-correo-interno` está desplegada, versión 1, JWT requerido. Además valida JWT con `getUser`, lee el usuario mediante Admin y sólo prepara el factor del correo interno exacto para su email nuevo ya pendiente. Usa `generateLink(email_change_current)` y `verifyOtp` en servidor. No confirma el correo nuevo, no escribe password, no acepta un UUID del cliente y no devuelve tokens. Secure email change y Confirm email permanecen activos. El jugador debe confirmar su dirección real antes de establecer contraseña.

**Conversión legacy→email todavía no demostrada de punta a punta.** Requiere SMTP que acepte el envío inicial del cambio y entrega al nuevo destinatario. Un rechazo del correo interno, un clic concurrente o un reenvío pueden requerir reiniciar la solicitud; nunca deben convertirse en un bypass de verificación.

## Configuración pendiente, paso a paso

### Supabase: retornos

Configurados y verificados el 12/10/2026 con autorización del dueño. Authentication → URL Configuration tiene exactamente:

```text
blindly://auth-callback
http://localhost:8090/auth-callback
```

No añadir comodines amplios. Para otra PC, LAN o web alojada, agregar sólo su URL exacta de callback cuando se use. Site URL actual `http://localhost:3000`: escoger el sitio público real antes de publicar; no inventar un dominio. Para Android/iOS se envía explícitamente el callback nativo. Conservar anónimo, manual linking y confirmación de correo habilitados.

### Correo

Authentication → Emails → SMTP Settings. Obtener de un proveedor SMTP: host, puerto, usuario, contraseña y remitente permitido. Guardar la contraseña exclusivamente en Supabase, nunca en chat, Git ni EXPO_PUBLIC. El buzón `administracionblindly@gmail.com` por sí solo no configura envío.

Después, Emails → Templates → Change email address: incluir tanto `{{ .ConfirmationURL }}` como `{{ .Token }}` para enlace y código. Reset password debe incluir `{{ .ConfirmationURL }}`. Confirmar entrega real, carpeta spam, expiración y destinatarios ajenos al equipo. Configuración actual OTP: 8 dígitos, 3600 s. No desactivar Confirm email ni Secure email change.

El SMTP predeterminado sólo entrega a miembros del equipo y no sirve para el lanzamiento. No añadir reviewers como miembros de Supabase para sortear esa restricción.

### Google Cloud / Supabase

1. Crear/seleccionar proyecto de Google Cloud y configurar Google Auth Platform (branding, audiencia y consentimiento). El dueño completa credenciales y términos personalmente.
2. Crear cliente OAuth tipo **Web application** para este flujo de navegador. Redirect autorizado: `https://ddvbbkwhisuezloorhfg.supabase.co/auth/v1/callback`. Para probar web, origin `http://localhost:8090`; otros orígenes sólo cuando existan.
3. Copiar Client ID y Client Secret a Supabase → Authentication → Sign In / Providers → Google. Habilitar proveedor. El secreto se introduce directamente allí; no va en app ni repositorio.
4. Si la audiencia sigue en Testing, añadir los correos de pruebas autorizados; resolver los requisitos de Google antes de distribuir a todos los usuarios.
5. Probar link de invitado con datos, Google existente, Google ocupado, cancelar y retorno con app cerrada/abierta.

Este flujo no usa SDK nativo de Google: no requiere un cliente Android ni SHA de Google para el navegador OAuth. Paquete Android sigue `com.blindly.studio`; iOS `com.blindly.app`, scheme `blindly`. Una futura implementación nativa de Google tendría requisitos propios y no está incluida.

## QA verificable

Comandos: `npm run test:auth`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build:bundles`. Prueba real opt-in: `node scripts/probar-auth-servidor.mjs --ejecutar`; crea y elimina únicamente su invitado descartable.

| Caso solicitado | Evidencia / estado |
|---|---|
| Invitado nuevo | Real: creado y eliminado en Supabase; RPC propia sin datos. |
| Invitado→email | Servicio/UI simulados pasan; entrega/confirmación real pendiente. |
| Invitado→Google | Servicio simulado pasa; proveedor real deshabilitado. |
| UUID antes/después | A conservado en mocks; FK/RPC auditadas. Conversión real pendiente. |
| Persistencia al cerrar/abrir | Storage del SDK conservado; prueba física con email pendiente. |
| Logout | Simulado: no borra servidor; crea invitado nuevo. |
| Login posterior | signInWithPassword simulado; prueba real pendiente. |
| Password incorrecta | Simulado: error traducido y sesión conservada. |
| Email existente | Simulado: rechaza y restaura solicitud pendiente. |
| Reset | PKCE/email destino/guardar password simulados; correo real pendiente. |
| Google existente | Login explícito simulado, sin merge. |
| Google ocupado | Simulado: no reemplaza A. |
| Cambio de cuenta | Guardas reales ejecutadas con Auth/consultas simulados. |
| Legacy con key | Suite sesion y handler de recuperación pasan. |
| Legacy→email | Cliente y función Admin simulados pasan; SMTP/QA real pendiente. |
| Legacy→Google | Conservación por linkIdentity auditada; QA real pendiente. |
| Puntos | Suite SQL existente pasa; conversión con puntos reales pendiente. |
| Historial | Suite SQL existente pasa; conversión real pendiente. |
| Clubes | Suite SQL existente y navegación pasan; conversión real pendiente. |
| Roles/ownership | Guardas/FK auditadas, regresiones SQL pasan; conversión real pendiente. |
| Plus por UUID | Regresiones compras-identidad/play-review pasan; nuevo reviewer pendiente. |
| Eliminación | Real: Edge eliminó sólo la identidad QA nueva; otras modalidades físicas pendientes. |
| Red | Fallos y restauración de pendiente simulados; pérdida de red física pendiente. |
| Doble toque | Servicio/UI/callback simulados: una operación. |
| ES/EN/PT | 977 textos / 82 errores validados. |
| TypeScript | Pasó. |
| Tests | Suite completa y 36 casos de servicio, UI y seguridad Edge pasaron. |
| Android/iOS bundles | Exportación pasó; no equivale a build/QA iOS físico. |

Prueba real adicional: la función nueva rechazó al invitado sin cambiar UUID ni emitir credenciales. Google real devolvió `validation_failed`, traducido ahora como configuración pendiente. No se envió correo, no se tocó una cuenta real y no se creó todavía el reviewer nuevo.

## Google Play Reviewer

Email autorizado: **administracionblindly+playreview@gmail.com**. Nombre previsto: Google Play Reviewer. Cuenta, contraseña y grant Plus nuevo **pendientes** hasta validar el flujo normal. No compartir la contraseña del buzón Gmail. La clave antigua y su identidad no se reutilizan ni se borraron.

Después de crear/verificar la nueva identidad, comprobar login estable email/password y conceder el permiso privado existente `private.accesos_revision_play` a ese UUID. No exigir compra/OTP en cada login y no alterar RevenueCat. Confirmar `mi_acceso_revision_play()` y Plus desde esa misma sesión antes de proporcionar instrucciones finales y credencial a Play Console. Para revocar: desactivar su grant; si se elimina la identidad después, la FK limpia el grant. Ningún UUID o secreto del reviewer debe versionarse en documentación pública.

Fuentes: [Supabase anónimo](https://supabase.com/docs/guides/auth/auth-anonymous), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [Admin generateLink](https://supabase.com/docs/reference/javascript/auth-admin-generatelink), [Expo WebBrowser 57](https://docs.expo.dev/versions/v57.0.0/sdk/webbrowser/).

## Artefactos de este candidato

Compilación local Android completada, paquete com.blindly.studio, versión 1.0.0/24, ARMv7 + ARM64, target SDK 36, firma existente conservada.

- APK: G:/Blindly/entregas/Blindly-1.0.0-auth-v24.apk. SHA256 E3D5F1C7A24BDF0D344193144D203C68B7FFB5EDE7C0F2A19A71B57C4C485768.
- AAB: G:/Blindly/entregas/Blindly-1.0.0-auth-v24.aab. SHA256 EA1DAD3C236C10F752FED6BCC9834A548344C6D01E04F2E169272C35CC9DB96B.
- apksigner y bundletool validate pasan; zipalign -P 16 pasa. Las 29 bibliotecas ARM64 cumplen PT_LOAD de 16 KB; la auditoría más estricta señala 15 finales RELRO no alineados, sin solapamientos de segmentos escribibles. Esto no demuestra ejecución física en 16 KB; sigue pendiente y no se declara compatibilidad completa.
- No se subieron a Google Play ni se instaló esta nueva autenticación sobre la identidad del A32. No contienen una clave SMTP ni secretos OAuth. EAS remoto sigue con su contador previo: sincronizarlo antes de publicar o generar una release posterior.

Preparación SMTP: formulario Gmail completo salvo password, host smtp.gmail.com/587, remitente y usuario del buzón de administración, intervalo conservado 60 s. Guardado delegado al dueño; no se afirma envío operativo. Supabase advierte posible impacto en entrega por proveedor personal. Gmail se prepara para QA; la entrega de producción requiere validación y un proveedor adecuado al volumen. Ninguna credencial SMTP se guarda en archivos o logs.
