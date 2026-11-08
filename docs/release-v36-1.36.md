# Blindly 1.36 (versionCode 36)

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
