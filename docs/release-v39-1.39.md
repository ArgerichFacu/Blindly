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
