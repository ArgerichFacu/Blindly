# Auth convencional — candidato Android v28

Estado al 12/10/2026: **email/password, reset y Google comprobados contra Supabase real mediante SDK oficial**. SMTP Gmail, Google OAuth y marca están guardados; callbacks exactos configurados. Login email/password, errores, persistencia, logout y Plus comprobados en emulador Android. Retornos Google/email en Android físico y conservación de progreso real durante conversión todavía pendientes. **v28 publicada y disponible para testers internos a las 14:27 ART**, reemplazando v22 en ese canal. No presentar el candidato como release final.

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

**Conversión legacy→email demostrada con SDK real y una identidad descartable:** crear clave, recuperar, solicitar email, confirmar factor interno, verificar correo real, establecer password e iniciar sesión conservando UUID. Se repitió el helper inmediatamente antes del OTP, como hace la app, y pasó. La identidad QA se eliminó después. El correo al factor interno .invalid puede rebotar al remitente; la confirmación se entregó al correo real. La interfaz Android y los reenvíos/clics concurrentes todavía necesitan aceptación; nunca deben convertirse en un bypass de verificación.

## Configuración externa y pendientes

### Supabase: retornos

Configurados y verificados el 12/10/2026 con autorización del dueño. Authentication → URL Configuration tiene exactamente:

```text
blindly://auth-callback
http://localhost:8090/auth-callback
```

No añadir comodines amplios. Para otra PC, LAN o web alojada, agregar sólo su URL exacta de callback cuando se use. Site URL actual `http://localhost:3000`: escoger el sitio público real antes de publicar; no inventar un dominio. Para Android/iOS se envía explícitamente el callback nativo. Conservar anónimo, manual linking y confirmación de correo habilitados.

### Correo

Authentication → Emails → SMTP Settings: guardado por el dueño, host smtp.gmail.com, puerto 587, remitente Blindly, usuario/remitente administracionblindly@gmail.com; intervalo mínimo 60 s conservado. La contraseña de aplicación se introdujo directamente en Supabase. No está en Git ni EXPO_PUBLIC.

Plantillas trilingües guardadas desde supabase/email-templates: Change email address incluye `{{ .ConfirmationURL }}` y `{{ .Token }}`; Reset password incluye `{{ .ConfirmationURL }}` y la instrucción de abrirlo en el dispositivo solicitante. Entrega y verificación reales demostradas en aliases controlados del buzón. OTP: 8 dígitos, 3600 s. Confirm email y Secure email change permanecen activos.

Gmail se usa para QA; Supabase advierte posible impacto en entrega por proveedor personal. Antes de lanzamiento se requiere validar volumen, spam y entrega a usuarios externos, y elegir proveedor adecuado al volumen. La prueba actual no demuestra capacidad de envío de producción. No añadir reviewers al equipo de Supabase.

### Google Cloud / Supabase

Proyecto Google Cloud Blindly, blindly-511407, configurado por el dueño sin activar facturación. Cliente **Web application** Blindly Supabase, origin `http://localhost:8090`, redirect `https://ddvbbkwhisuezloorhfg.supabase.co/auth/v1/callback`. Client ID y Secret copiados directamente a Supabase por el dueño. Google habilitado; Skip nonce checks y Allow users without an email desactivados.

El SDK real y navegador comprobaron invitado→Google con mismo UUID, login Google existente a ese UUID y rechazo de Google ocupado con `identity_already_exists`, conservando el invitado. Consentimiento autorizado personalmente por el dueño. Las tres identidades QA se eliminaron y Auth confirma cero cuentas QA Google restantes.

Audiencia verificada: Usuarios externos, estado **Prueba**, cero usuarios de prueba configurados. Antes de completar marca, Publicar app estaba deshabilitado; no se publicó OAuth en producción. Google documenta una excepción para openid/email/profile: esos accesos no requieren estar en la lista de testers ni vencen a los siete días, incluso en Prueba. Por eso Prueba por sí sola no demuestra un bloqueo del login básico. [Fuente oficial](https://support.google.com/cloud/answer/15549945). El acceso de una persona externa sigue sin probarse aquí.

Marca guardada con autorización del dueño: sitio https://argerichfacu.github.io/Blindly/, privacidad /privacy.html, términos /terms.html y dominio argerichfacu.github.io; dominio Supabase conservado. Google sólo ofreció el correo del dueño como asistencia; administración permanece como contacto del desarrollador. No se ampliaron scopes ni se activó facturación. Revisar publicación/verificación de marca si Google lo exige. También quedan cancelación, invitado con progreso, legacy→Google y retornos dentro de Android con app abierta/cerrada.

Este flujo no usa SDK nativo de Google: no requiere un cliente Android ni SHA de Google para el navegador OAuth. Paquete Android sigue `com.blindly.studio`; iOS `com.blindly.app`, scheme `blindly`. Una futura implementación nativa de Google tendría requisitos propios y no está incluida.

## QA verificable

Comandos: `npm run test:auth`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build:bundles`. QA real opt-in: scripts/probar-auth-servidor.mjs, probar-auth-email.mjs (--legacy/--reset) y probar-auth-google.mjs. Sólo crean/limpian sus identidades descartables, sin service_role local. Email requiere TTY y buzón controlado; Google reserva localhost:8090, guarda sesiones/verifier en memoria y tiene limpieza automática a los 15 minutos. No ejecutarlo junto a Expo en ese puerto. Códigos OAuth son de vida corta: una espera prolongada exige iniciar una solicitud nueva.

| Caso solicitado | Evidencia / estado |
|---|---|
| Invitado nuevo | Real: creado y eliminado en Supabase; RPC propia sin datos. |
| Invitado→email | Real: entrega SMTP, OTP, password y login; mismo UUID. UI simulada pasa. |
| Invitado→Google | Real SDK/navegador: linkIdentity, misma identidad permanente. A32 v28: el dueño completó Google y volvió a Mi cuenta; Google conectado y cuenta permanente confirmados en UI y Supabase. No se registró el UUID previo del teléfono: la igualdad antes/después sólo está demostrada en QA SDK. |
| UUID antes/después | Real conservado en email, legacy→email, Google y reset; FK/RPC auditadas. |
| Persistencia al cerrar/abrir | Real SDK y emulador v25 x86_64: force-stop/abrir conserva reviewer y Plus sin reingresar password. A32 v28: force-stop/abrir y Config→Mi cuenta conserva el correo de administración y Google conectado sin repetir login. |
| Logout | Real SDK y UI del emulador v25: vuelve a invitado sin eliminar reviewer. |
| Login posterior | Real signInWithPassword y UI Android del reviewer; UUID original. |
| Password incorrecta | Real SDK y emulador v27: error traducido, sesión conservada y mensaje visible automáticamente sin desplazamiento manual. |
| Email existente | Real: email_exists, invitado conservado y reviewer intacto. |
| Reset | Real SDK: enlace PKCE → password nueva válida/anterior rechazada, mismo UUID. A32 v28: solicitud desde la APK, correo abierto por el dueño en ese celular y regreso al formulario Nueva contraseña. Cancelar vuelve a Mi cuenta con el mismo email y Google conectado. No se cambió la contraseña durante la prueba física. |
| Google existente | Real: vuelve a A; no fusiona invitado C. |
| Google ocupado | Real: identity_already_exists; no reemplaza invitado. |
| Cambio de cuenta | Guardas reales ejecutadas con Auth/consultas simulados. |
| Legacy con key | Real: crear/proteger y recuperar identidad QA; suites también pasan. |
| Legacy→email | Real: helper, OTP, password y login conservan UUID. Android/reenvíos pendientes. |
| Legacy→Google | Conservación por linkIdentity auditada; QA real pendiente. |
| Puntos | Suite SQL existente pasa; conversión con puntos reales pendiente. |
| Historial | Suite SQL existente pasa; conversión real pendiente. |
| Clubes | Suite SQL existente y navegación pasan; conversión real pendiente. |
| Roles/ownership | Guardas/FK auditadas, regresiones SQL pasan; conversión real pendiente. |
| Plus por UUID | Reviewer real: login normal, grant/RPC true y PLUS ACTIVO visible en emulador v25–v28. v28 conserva sesión tras actualización y abre Mi cuenta desde arriba. Regresiones RevenueCat pasan; SDK comercial apagado. |
| Eliminación | Real: Edge eliminó identidades QA anónimas, email, legacy→email y Google; otras modalidades físicas pendientes. |
| Red | Fallos y restauración de pendiente simulados; pérdida de red física pendiente. |
| Doble toque | Servicio/UI/callback simulados: una operación. |
| ES/EN/PT | 977 textos / 82 errores validados. |
| TypeScript | Pasó. |
| Tests | Suite completa previa pasó; servicio ahora 37 casos, UI y Edge pasan. |
| Android/iOS bundles | Exportación pasó; no equivale a build/QA iOS físico. |

Pruebas negativas reales: helper rechazó invitado sin emitir credenciales; reset tardío devolvió flow_state_expired (traducido como enlace vencido); una autorización Google tardía produjo bad_oauth_state. Solicitudes nuevas pasaron. No reutilizar enlaces consumidos. Las pruebas SDK/backend no sustituyen la aceptación del navegador del sistema, AsyncStorage y deep links dentro de Android.

## Google Play Reviewer

Email autorizado: **administracionblindly+playreview@gmail.com**. Nombre: Google Play Reviewer. Identidad nueva creada/verificada; login real email/password sin OTP y grant Plus permanente comprobados. Credencial e instrucciones inglesas fuera de Git: G:/Blindly/privado/google-play-reviewer-email.json y Google-Play-Review-email-instructions.txt. No compartir password de Gmail. La identidad legacy descartada no se reutilizó ni eliminó.

Se reutiliza el permiso privado existente private.accesos_revision_play, administrado por operador y sin escrituras cliente; no se modificaron productos ni clientes RevenueCat. mi_acceso_revision_play() real devolvió true desde el login del reviewer y tiene_plus true. Para revocar, desactivar sólo ese grant; para impedir acceso también bloquear/revocar sesiones o eliminar esa identidad por el flujo existente. Ningún UUID o secreto del reviewer se versiona. **Usar el candidato v28: la v22 publicada todavía no tiene email/password.** Ver google-play-review.md.

Fuentes: [Supabase anónimo](https://supabase.com/docs/guides/auth/auth-anonymous), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [Admin generateLink](https://supabase.com/docs/reference/javascript/auth-admin-generatelink), [Expo WebBrowser 57](https://docs.expo.dev/versions/v57.0.0/sdk/webbrowser/).

## Artefactos de este candidato

Compilación local Android completada desde c70b13a, paquete com.blindly.studio, versión 1.0.0/28, ARMv7 + ARM64 + x86 + x86_64, target SDK 36, firma existente conservada. EAS remoto sincronizado y verificado en versionCode 28.

- APK: G:/Blindly/entregas/Blindly-1.0.0-auth-v28.apk. SHA256 832465260B52816ADF7A988C79BF1DFC5651A950F34A27170C83292CDD45FA49.
- AAB: G:/Blindly/entregas/Blindly-1.0.0-auth-v28.aab. SHA256 8E859C6585DAE821C2ECD12A571E0ECAD857AB1368016E59A340FA45616A5B1F.
- apksigner y bundletool validate pasan; zipalign -P 16 pasa. Auditoría del AAB: 58 bibliotecas de 64 bits, cero fallos PT_LOAD; 30 finales RELRO no cumplen la comprobación estricta adicional, sin solapamientos escribibles. Esto no demuestra ejecución física ARM64 en 16 KB; sigue pendiente y no se declara compatibilidad completa.
- El dueño cargó el AAB v28; Play lo aceptó y se publicó en prueba interna el 12/10/2026 a las 14:27 ART, con estado «Disponible para testers internos». Único aviso: falta archivo de desofuscación. Evidencia auth-play-v28-publicada.png. No contiene una clave SMTP ni secretos OAuth. La actualización/aceptación del A32 se registra aparte.

Instalación A32: rechazó la actualización local con INSTALL_FAILED_UPDATE_INCOMPATIBLE porque v22 estaba firmada por Google Play, distinta del certificado local. El dueño actualizó desde Play y ADB confirmó versión 1.0.0/28 instalada; la pantalla de acceso arranca. No se desinstaló ni borró almacenamiento. Google regresó a Mi cuenta, UI y Auth confirman el proveedor conectado; force-stop/abrir conservó el acceso. Recuperación por correo solicitada desde la APK: el dueño abrió el correo en el A32 y el enlace volvió al formulario Nueva contraseña; Cancelar conservó Mi cuenta/Google. Evidencias auth-v28-a32-google.png, auth-v28-a32-google-persist-cuenta.xml, auth-v28-a32-email-formulario.png y auth-v28-a32-email-cancelar.xml. Google con app cerrada, cancelación de OAuth, cambio de password desde UI y pérdida de red siguen pendientes. Las variantes ARM anteriores no arrancaban en el emulador x86 por SoLoader; v28 incluye x86 y arranca. Esto no es aceptación ARM64/16 KB y no se atribuye a un fallo de Auth.

Implementación vigente: c70b13a (demo), [CI exitoso](https://github.com/ArgerichFacu/Blindly/actions/runs/38281722034) y [Pages exitoso](https://github.com/ArgerichFacu/Blindly/actions/runs/38281721366). Evidencia local: G:/Blindly/evidencias/auth-google-qa-real.png, auth-google-marca-guardada.png, auth-v28-emulador-plus.png y auth-v28-elf-aab.json. Las credenciales nunca se incluyen en capturas de documentación pública.

QA nativa v25: variante x86_64 instalada en emulador Android 36/16 KB; login email/password del reviewer, Plus visible, persistencia tras force-stop y logout pasaron. Evidencia auth-v25-emulador-plus.png, persist.xml y logout.xml fuera de Git. No demuestra ARM64/16 KB ni deep links Google/email en el A32.

CI de 6282326 falló antes de tests por seis parches nuevos recomendados de Expo 57. Se aplicaron expo 57.0.28, @expo/ui 57.0.23, dev-client 57.0.20, router 57.0.26, sharing 57.0.23 y splash-screen 57.0.10. Expo install --check y Doctor 21/21 pasan; TypeScript, lint, suite completa y bundles también. v28 incluye estos parches y el desplazamiento automático al cambiar modo o aparecer mensajes. En v27 se comprobó el error de password visible; v28 conserva la sesión del reviewer tras actualización y abre Mi cuenta con PLUS ACTIVO visible desde arriba.
