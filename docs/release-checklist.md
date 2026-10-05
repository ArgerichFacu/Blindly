# Lista de lanzamiento de Blindly

Estado auditado el 4 de octubre de 2026. Esta lista separa lo validado por código de las comprobaciones que requieren cuentas comerciales o dispositivos físicos.

La matriz consolidada de evidencia y dependencias externas está en [`final-readiness.md`](final-readiness.md).

## Validado automáticamente

- [x] Tipos TypeScript.
- [x] Reglas de turnos, ciegas, all-in, pozos e idempotencia.
- [x] Acciones propias de cada jugador y cierre exclusivo del dealer.
- [x] Ingreso del total apostado para igualar o subir, validado también en Supabase.
- [x] Stack propio destacado y stacks de toda la mesa con fichas más legibles.
- [x] Ajuste de stacks físicos protegido en Supabase y disponible solo para el dealer.
- [x] Puntuación, empates, privacidad y persistencia del historial.
- [x] Sesión anónima única y flujo preparado para vincular y recuperar por correo.
- [x] Recuperación operativa sin correo mediante una clave privada rotatoria y una Edge Function autenticada.
- [x] Eliminación de cuenta y datos desde la app, bloqueada durante partidas activas.
- [x] Política de privacidad accesible dentro de la app y documentación inicial de tiendas.
- [x] Páginas públicas sin rastreadores preparadas para privacidad, términos y eliminación de cuenta.
- [x] Nombre, fondo, iconos adaptativos y declaración de cifrado preparados para builds nativas.
- [x] Permisos mínimos de tablas y funciones auxiliares.
- [x] Índices de las claves foráneas usadas en consultas de sala.
- [x] Empaquetado JavaScript de web, Android e iOS en CI.
- [x] CI verifica compatibilidad exacta con Expo 57, Expo Doctor, TypeScript y ESLint; además bloquea vulnerabilidades críticas de dependencias.
- [x] Auditoría de dependencias revisada sin vulnerabilidades críticas; los avisos transitivos sin corrección compatible y el criterio de actualización están documentados en `docs/security-review.md`.
- [x] SDK de Blindly Plus, paywall, restauración y administración de suscripción integrados y desactivados por variable pública.
- [x] Borrado opcional del perfil de RevenueCat desde la eliminación autenticada de cuenta.
- [x] Perfiles EAS de development, preview, ios-simulator y production preparados.
- [x] Proyecto `@facuargerich/blindly` vinculado y variables públicas creadas en los tres entornos EAS.
- [x] APK Android preview final regenerado con firma remota, Plus desactivado y permisos mínimos desde el commit `07aff0d` ([build EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/adce6a93-dbe1-4ef9-a5db-c86eb084cb3b)); falta instalarlo en hardware real.
- [x] AAB de producción final generado desde el mismo commit, con `versionCode 5` y firma remota ([build EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/cef204be-b7bc-4da5-b81d-9da2d4317d61)).
- [x] Build nativa iOS de simulador generada por Xcode y EAS desde el commit `7654263` ([build EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/53230fdc-cf5c-4463-b12f-a3e3f7e212c6)); el paquete `.app` fue validado localmente.
- [x] APK `development` generado para probar compras simuladas de RevenueCat Test Store ([build EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/2d4f84b6-4ea7-41d0-9b2e-aee09d2e6e4b)).
- [x] RevenueCat Test Store configurado con entitlement `blindly_plus` y la oferta predeterminada: mensual USD 0,99, anual USD 9,99 recomendado y Founder Edition vitalicia USD 24,99 como precio especial de lanzamiento.
- [x] Enlaces del paywall configurados con las URLs previstas para privacidad y términos; serán navegables cuando se active GitHub Pages.
- [x] Ícono y gráfico de funciones de Google Play generados y validados en sus dimensiones y formatos requeridos.
- [x] Permiso de Google Play Billing y `launchMode=singleTop` garantizados por config plugin y prueba de manifiesto.
- [x] AAB validado con bundletool 1.18.3 y manifiesto compilado inspeccionado: SDK 36, build no depurable, Billing presente y permisos heredados de almacenamiento y superposición ausentes.
- [x] `targetSdkVersion 36` verificado en el AAB, compatible con el requisito de Android 16/API 36 vigente para nuevas entregas de Google Play desde el 31 de agosto de 2026.
- [x] Proyecto Supabase aislado en la organización Blindly.
- [x] Proyecto Supabase saludable, ocho migraciones presentes, Edge Functions con JWT y asesores revisados; las advertencias intencionales y sus límites están documentados en `docs/security-review.md`.
- [x] `sincronizar-plus` validada de extremo a extremo con una identidad temporal, RevenueCat, `mi_estado_plus` y eliminación posterior de la cuenta.
- [x] GitHub conectado a Supabase sobre la rama main.
- [x] Test Store aislado en EAS `development`; las claves de RevenueCat fueron retiradas de `preview` y nunca estuvieron en `production`.

## Preparado y pendiente de un servicio externo

- [ ] Activar GitHub Pages desde `main` y `/docs`, y comprobar que privacidad, términos y eliminación de cuenta respondan públicamente. La configuración está lista y solo falta autorizar la publicación.
- [ ] Crear una cuenta de distribución completa en Google Play cuando esté disponible la tarifa única de USD 25. No se eligió la distribución limitada gratuita porque admite como máximo 20 dispositivos y Google no permite convertir ese plan en distribución completa.
- [ ] Configurar un proveedor SMTP y un dominio remitente.
- [ ] Aplicar las plantillas de correo y activar `EXPO_PUBLIC_EMAIL_AUTH_READY`.
- [ ] Instalar el APK Android en dispositivos reales y completar la prueba física.
- [ ] Capturar al menos dos pantallas reales del APK aceptado para la ficha de Google Play.
- [ ] Definir un correo público de soporte y privacidad.
- [ ] Crear `com.blindly.app` en Play Console y completar acceso, clasificación, público objetivo y seguridad de datos.
- [ ] Cargar el AAB en prueba interna, revisar el informe previo al lanzamiento y después ejecutar [`play-closed-test.md`](play-closed-test.md) con al menos 12 testers inscritos de forma continua durante 14 días, requisito de las cuentas personales creadas después del 13 de noviembre de 2023.
- [ ] Solicitar acceso a producción en Play Console cuando la prueba cerrada cumpla el plazo y conservar un registro de los dispositivos, recorridos probados, comentarios y correcciones.
- [ ] Contratar o vincular una membresía Apple Developer, crear las credenciales de distribución en EAS y registrar los UDID de los iPhone; el intento `preview` no interactivo confirmó que todavía no existe un certificado ni perfil *ad hoc*. Después, generar la IPA privada o preparar el grupo cerrado de TestFlight.
- [ ] Crear los productos comerciales de Blindly Plus en Google Play Console con los precios de lanzamiento documentados y vincularlos con RevenueCat.
- [ ] Si Plus se prueba con compras reales en iPhone, crear también los productos equivalentes en App Store Connect; una IPA release privada mantiene Plus desactivado y Test Store se usa solo en `development`.
- [ ] Validar compra y restauración con RevenueCat Test Store en una build `development` depurable sobre un dispositivo físico.
- [x] Guardar `REVENUECAT_SECRET_KEY` en la Edge Function y validar la eliminación autenticada del perfil de cliente.
- [ ] Revocar la clave privada actual de RevenueCat, generar un reemplazo y actualizar el secreto de Supabase después de recibir autorización explícita.
- [ ] Activar `EXPO_PUBLIC_PLUS_READY` en `production` después de validar compra y restauración con productos reales.

## Artefactos Android 1.0.0

Estos artefactos se generaron antes de Ligas, Temporadas y Ranking. Se conservan como referencia técnica y no deben cargarse como la versión final actual; la siguiente build necesita un `versionCode` nuevo.

- APK de prueba: [descarga directa](https://expo.dev/artifacts/eas/gMvdiijTDFWPn-ieGNCcx6L72TUeZMKDvx7cOffhK-c.apk), `versionCode 4`, SHA-256 `65216DAD2837E7E2882D5B94B68815495BDCCB86085FCB1A7AD664B87227F85E`.
- AAB para Google Play: [descarga directa](https://expo.dev/artifacts/eas/mOaH1SBjZr8oFJZ2v6l11InH-A_rpgTT5f0uRpQfffs.aab), `versionCode 5`, SHA-256 `89F753CCFF4A47AC9B2501B220EE4649152FFBD2BC1944522FF7D0ACD581124C`.
- APK de desarrollo para Test Store: [descarga directa](https://expo.dev/artifacts/eas/cO1utrQC2gAeLE63VkH1TfjxUIe-O-5DDPS4nsYguUM.apk), SHA-256 `9C3CD74DBC14724A173FBF14D4944589B1E6B814A33758D103AC0737CC6EAA8E`.
- El APK preview y el AAB se generaron con Blindly Plus desactivado, por lo que no contienen una clave Test Store utilizable en una build release. La APK de desarrollo sí usa Test Store y no debe distribuirse como versión final.

## Artefacto iOS 1.0.0

- Simulador de macOS: [descarga directa](https://expo.dev/artifacts/eas/98EZjNOLQrVTD12iljHmRZZqBO1KGpDOkZKIEFKBqOg.tar.gz), build 1, SHA-256 `5673FD59EE3BA234BB5D7B82DF3FACDC01449E79E39E90816FE3E91B94ACEC87`.
- El archivo contiene `Blindly.app` y valida la compilación nativa iOS. No puede instalarse en un iPhone físico; la IPA requiere la firma externa indicada arriba.

## Prueba física de aceptación

Usar al menos tres celulares y completar una partida en modo virtual y otra en modo físico. Verificar ingreso por QR/código, fichas visuales DR/BTN/SB/BB, rotación de BTN/SB/BB, indicador de turno, acciones propias de cada jugador, rechazo de acciones fuera de turno, edición de stacks exclusiva del dealer, reconexión tras perder Internet, bloqueo y retorno de la app, pausa de música, reparto de pozos, cierre del torneo y puntuación final.

El splash se valida desde un arranque en frío de la build nativa. Expo Go y el navegador no reproducen todo el ciclo nativo.
