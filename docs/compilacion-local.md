# Android local sin consumir cupo EAS

El 8 de octubre EAS rechazó una nueva build Android porque el cupo gratuito del mes estaba agotado; indicó renovación el 1 de noviembre. No se contrató un plan. La reserva de `versionCode` avanzó de 6 a 7 aunque no se creó una build. No confundir el JSON del intento con un APK terminado.

La compilación local usa Expo SDK 57, Gradle de su plantilla, Android SDK 36 y la **misma firma existente** descargada de EAS. Java y herramientas Android son locales, no requieren pagar a EAS. Publicar en Google Play o firmar para iPhone mantiene sus requisitos externos.

## Preparación

1. Instalar JDK 17 y herramientas oficiales de Android. Desde el 11 de octubre esta PC usa Temurin en `G:\Blindly\herramientas\java17\jdk-17.0.20.1+1` y SDK en `G:\Blindly\herramientas\android-sdk`. El repositorio actual está en `G:\Blindly\proyecto`. El primer intento con Java 25 falló al configurar CMake en dependencias nativas; no se cambió código de la app para ocultar ese fallo.
2. Instalar platform-tools, plataforma android-36, build-tools 36.0.0, NDK 27.1.12297006 y CMake 3.22.1. Con command-line tools 23, `sdkmanager` deriva al nuevo Android CLI; su compatibilidad acepta rutas con `/`, como `platforms/android-36`, no el formato antiguo con `;`.
3. Recuperar la firma con `npx eas-cli credentials -p android`, elegir preview y **credentials.json → Download credentials from EAS to credentials.json**. No crear otra firma ni mostrar las contraseñas. `credentials.json` y `credentials/` están excluidos de Git.
4. Confirmar el próximo versionCode antes de publicar. La compilación local no actualiza automáticamente la versión remota de EAS. No reutilizar un código ya cargado en Play.

## Comando

```powershell
. .\scripts\entorno-local.ps1
.\scripts\build-android-local.ps1 `
  -SdkRoot $env:ANDROID_HOME `
  -JavaHome $env:JAVA_HOME `
  -VersionCode 16
```

El ejemplo usa 16 como siguiente código después de la preparación comercial v15; comprobar siempre EAS y Play antes de compilar. Los párrafos sobre v7 más abajo documentan la compilación histórica. `entorno-local.ps1` configura SDK, Java, emuladores, cachés Gradle/npm y temporales dentro de la carpeta raíz de trabajo (en esta PC `G:\Blindly`). No cambia las flags comerciales ni carga claves de compra. También se puede abrir `G:\Blindly\abrir-blindly.cmd`. Después de trasladar un proyecto, descartar los directorios generados de CMake `.cxx` antes de recompilar: contienen rutas absolutas de la ubicación anterior.

El script comprueba el SDK, firma y exclusión de credenciales; genera Android sin eliminar el directorio existente, conserva package.json, inserta firma leyendo el archivo privado local e invoca `assembleRelease` y `bundleRelease` con dos workers. La APK y AAB quedan en `release/Blindly-metas40-v7.apk` y `.aab` **sólo si Gradle finaliza correctamente**. Exportar JavaScript no genera estos binarios.

Usa cuatro arquitecturas por defecto. `-Architectures arm64-v8a` genera una variante restringida a teléfonos ARM64 y debe identificarse como tal; no equivale a la APK universal. No cambiar dependencias ni arquitectura para ocultar errores de compilación.

Las flags comerciales, email y push se mantienen en false porque faltan tiendas, SMTP y FCM. Para una release con servicios activos debe prepararse otra configuración, comprobar credenciales y ejecutar aceptación física; no activar indiscriminadamente las flags en este script.

## Validación y límites

Comprobar firma con apksigner, AAB con bundletool/jarsigner, manifiesto (paquete, versionCode, SDK y permisos), coincidencia con el certificado anterior y SHA-256. Registrar commit fuente y hashes en el informe de la release antes de distribuir. Copiar a OneDrive únicamente binarios validados con nombres distintos de la release anterior.

La compilación v7 terminó correctamente con JDK 17. Ver [release-metas40.md](release-metas40.md) para hashes, firma, simulador iOS y la comprobación pendiente de RELRO/16 KB. El script `verificar-elf-16kb.py` audita APK/AAB; no sustituye `zipalign` ni ejecución nativa. Para empaquetar este AAB usar `create-play-console-package.ps1` con su hash, `-VersionCode 7`, un nombre ZIP distinto y `-ReadinessPath docs/release-metas40.md`. Los valores predeterminados conservan la release base v6.

No hay un Android conectado en la comprobación del 8 de octubre. La generación del APK no permite afirmar que splash, haptics, reconexión o compras funcionan en teléfonos reales. Ejecutar [qa-metas40.md](qa-metas40.md). Windows no permite compilar iOS con Xcode; un bundle JS iOS no es una IPA.

Referencias oficiales: [release local Expo](https://docs.expo.dev/guides/local-app-production/), [compilación local](https://docs.expo.dev/guides/local-app-development/).
