# Blindly 1.39 (versionCode 39) — primera versión con anuncios reales

Rama `release/1.39`. Perfil EAS `production-candidate` (entorno EAS "preview").

## Qué incluye
- **IDs de AdMob de la cuenta `administracionblindly`** (variables EAS): App ID `ca-app-pub-1093561603360160~1719264904` y bloque intersticial `ca-app-pub-1093561603360160/5619640600`. Las builds 1.36–1.38 llevan los de una cuenta creada por error y **nunca deben mostrar anuncios**.
- **Unidad autorizada por el servidor** (migración `20261112035500`): `estado_publicidad()` deja de publicar `ads_enabled` y publica `ads_unit_android` (sólo con el switch encendido). La app muestra anuncios reales únicamente si fue compilada con esa misma unidad. Encender `private.publicidad_config.ads_enabled` sigue siendo el único switch y lo decide el titular.
- Sin cambios de diseño ni de placement: un intersticial opcional para Free al crear/unirse a una sala, máximo uno por sesión; Plus sin anuncios.

## Notas para Google Play (es-419)
```
• Las cuentas gratuitas pueden ver un anuncio breve al entrar a una sala (como máximo uno por sesión). Blindly Plus no tiene anuncios.
• Correcciones y mejoras de estabilidad.
```

## Checklist
1. PR en verde y mergeado a `main`.
2. Aplicar la migración `20261112035500` en producción (SQL Editor, con autorización). No cambia nada visible mientras `ads_enabled=false`.
3. Build desde un checkout limpio de `main` con versionCode 39. Validar el AAB: versionName 1.39, App ID `…~1719264904` en el manifiesto, unidad `…/5619640600` en el bundle JS, 16 KB.
4. Prueba cerrada + QA en el A32: anuncio de prueba (ruta QA), consentimiento, sala sin anuncio para Plus.
5. Play Console: declaración "Contiene anuncios" y Seguridad de los datos revisadas antes de producción.
6. Producción y `ads_enabled=true`: sólo con autorización del titular.

## Build (12/11)
- PR #5 mergeado (`9117e2e`). La migración `20261112035500` la aplicó sola la integración de Supabase con GitHub al mergear; verificado en producción: `ads_enabled=false`, `ads_unit_android` = bloque de `administracionblindly`, y `estado_publicidad()` ya no publica `ads_enabled`.
- Build EAS `85468bf5-0722-4968-bf2d-2254856177e6`, perfil `production-candidate`, desde un clon limpio de `main` (commit sólo de build con `autoIncrement`).
- AAB `Blindly-1.39-production-candidate-v39.aab`, SHA-256 `dc034e9e6308951bd0d6a812052cec05e3d147fe30f106100c0001dc9d9815dd`.
- Validado: `versionCode 39`, `versionName 1.39`, `targetSdk 36`, App ID `ca-app-pub-1093561603360160~1719264904` en el manifiesto, sin permiso `AD_ID`, unidad `ca-app-pub-1093561603360160/5619640600` en el bundle JS (las demás son los `TestIds` del SDK), 58 bibliotecas con alineación de 16 KB correcta.

## QA en el A32 (12/11)
- Ruta QA habilitada con autorización del titular: `ads_qa_enabled=true` y `administracionblindly` en `private.ads_qa_testers` por 48 h (apagar al terminar).
- v39 enviada a la prueba cerrada (reinició la revisión de la v38 en producción) y aprobada el mismo día. Instalada desde Play: `versionCode 39`.
- UMP corre al abrir y resuelve sin formulario (`gdprApplies=0`, Argentina). Crear sala → "Anuncio de prueba" de Google (`sdk_init → load → ready → opened → closed`) → sala de espera `C4465`. Segunda sala `KN6DE` en la misma sesión: sin anuncio ni nueva carga (cupo de uno por sesión). Mismo resultado antes con la v38.
- Los anuncios reales no se probaron en el dispositivo: sólo existen con `ads_enabled=true`.
