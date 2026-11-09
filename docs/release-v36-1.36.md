# Blindly 1.36 (versionCode 36) — reemplazada por 1.37

Rama `feature/pagos-y-anuncios` (PR #1). Perfil EAS `production-candidate` (entorno EAS "preview").

## Qué incluye
- **Login:** un invitado con progreso puede "Entrar a mi cuenta existente" (Google o email) tras un aviso. El bloqueo de login del 08/11 ya estaba corregido en el servidor (migración `20261108174000`).
- **Plus:** la app no sincroniza Plus para invitados (no compran ni restauran).
- **Anuncios (apagados):** IDs reales por variables EAS (`ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`), ruta de producción con `ads_enabled`, consentimiento Google UMP al abrir y fila "Privacidad de anuncios". Política de privacidad actualizada.

## Notas para Google Play (es-419)
```
• Si jugaste como invitado, ahora podés entrar a tu cuenta existente sin trabarte.
• Mejoras en la verificación de Blindly Plus.
• Nueva opción "Privacidad de anuncios" donde la ley lo requiere.
• Correcciones y mejoras de estabilidad.
```

## Checklist
1. CI del PR en verde y PR mergeado a `main`.
2. `eas build:version:set` → versionCode 36 (el perfil no autoincrementa).
3. Build desde un checkout limpio de `main` (sin `assets/store/products/`), con las credenciales locales de firma.
4. Validar AAB: versionCode 36, versionName 1.36, App ID de AdMob real en el manifiesto, 16 KB.
5. Subir a prueba interna/cerrada y probar en el A32 instalado desde Play: login invitado→cuenta existente, compra de prueba, sin anuncios con `ads_enabled=false`.
6. Producción: sólo con autorización del titular.
7. Encender `ads_enabled`: sólo por decisión del titular, con la v36 publicada, perfil de pagos de AdMob completo y app aprobada en AdMob.

## QA en el A32 (09/11) y 1.37
- v36 instalada desde la prueba cerrada: sesión conservada al actualizar, logout correcto, invitado crea sala `2NBCC` y entra directo al lobby **sin anuncio ni actividad del SDK**.
- **Hallazgo:** en Android la vuelta de Google entra por `/auth-callback`; con Google ya vinculado mostraba el error con "Volver a mi cuenta" y no ofrecía "Entrar a mi cuenta existente".
- **1.37 (versionCode 37):** `/auth-callback` ante `AUTH_GOOGLE_OCUPADO` vuelve a Mi cuenta con `accion=google-ocupado`, que muestra el aviso y el botón. Mismas notas de Play que la v36.

## 1.38 (versionCode 38)
- QA de la v37 en el A32: el aviso con "Entrar a mi cuenta existente" aparece siempre (también cuando Android cierra la app por memoria mientras está abierto Google), pero al tocarlo **no entraba**.
- **Causa:** `expo-web-browser` abre la pestaña de Google mediante una actividad intermedia con su propia tarea de Android; esa tarea sobrevivía al volver a la app y el segundo inicio de sesión reabría la pestaña vieja (Supabase sólo recibía otra vez el intento de vincular → 422).
- **Arreglo:** `openAuthSessionAsync` con `useProxyActivity: false` y `showInRecents: false` (pestaña con `NO_HISTORY`, se cierra al volver).
- Verificado en el A32 con un APK de prueba firmado con la clave de subida (instalado por USB, luego reemplazado por la versión de Play): invitado `QA37` con sala → Google → aviso → "Entrar a mi cuenta existente" → sesión iniciada en `administracionblindly` (Google conectado).
