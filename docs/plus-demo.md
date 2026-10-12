# Blindly Plus Demo (Android)

Variante de prueba instalada como **Blindly Plus Demo**, paquete
`com.blindly.app.plusdemo`. Se instala junto a Blindly: tiene sus propios datos
y sesión, y no reemplaza la cuenta ni la instalación habitual.

Permite explorar los 18 sonidos de mesa, temas y personalización de Plus.
La pantalla Plus identifica la demostración y no ofrece compras ni suscripciones.
Los textos están disponibles en español, inglés y portugués.

## Límite de la demostración

El desbloqueo es local y sólo funciona en Android con el paquete de demostración
y `extra.plusDemo` verdadero. La variante no inicializa RevenueCat ni sincroniza
un acceso comercial. Comprar y restaurar están bloqueados también en el proveedor.
No crea entitlements, registros `accesos_plus` ni permisos en Supabase.

Las funciones premium online conservan la comprobación de Plus en el servidor;
esta APK no equivale a una suscripción verificada. No debe publicarse en Play Store.

## Compilar

Desde el repositorio, con las herramientas locales y la firma existente:

```powershell
. .\scripts\entorno-local.ps1
.\scripts\build-android-local.ps1 `
  -SdkRoot 'G:/Blindly/herramientas/android-sdk' `
  -JavaHome 'G:/Blindly/herramientas/java17/jdk-17.0.20.1+1' `
  -VersionCode 17 `
  -Architectures 'armeabi-v7a,arm64-v8a' `
  -PlusDemo
```

Genera únicamente `release/Blindly-plus-demo-v17.apk`. El perfil EAS `plus-demo`
también permite generar una APK de distribución interna para Android.
La configuración rechaza combinar Demo con compras habilitadas o con los perfiles
`production` y `play-testing`. Para una compilación normal se omite `-PlusDemo`;
el script restablece la variante normal y sus enlaces de apertura.

## Verificación

`npm test`, `npm run typecheck` y `npm run lint` verifican la aplicación.
`tests/plus-demo.cjs` comprueba la configuración separada, el bloqueo en otras
plataformas y en el paquete habitual, los 18 sonidos y la ausencia de llamadas
a compras, autenticación o sincronización durante la demostración.
Las pruebas comerciales existentes siguen comprobando el comportamiento normal.

La APK se revisa por firma, paquete, versión, configuración de Expo incluida,
alineación y presencia de todos los sonidos. Estas comprobaciones no sustituyen
una prueba de reproducción y uso en un teléfono físico.
