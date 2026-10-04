# Lista de lanzamiento de Blindly

Estado auditado el 2 de octubre de 2026. Esta lista separa lo validado por código de las comprobaciones que requieren cuentas comerciales o dispositivos físicos.

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
- [x] SDK de Blindly Plus, paywall, restauración y administración de suscripción integrados y desactivados por variable pública.
- [x] Borrado opcional del perfil de RevenueCat desde la eliminación autenticada de cuenta.
- [x] Perfiles EAS de development, preview y production preparados.
- [x] Proyecto `@facuargerich/blindly` vinculado y variables públicas creadas en los tres entornos EAS.
- [x] APK Android preview final regenerado con firma remota y Plus desactivado desde el commit `efb0192` ([build EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/50c1a63c-fc71-43f5-b17d-abb6e1bf02a4)); falta instalarlo en hardware real.
- [x] AAB de producción final generado desde el mismo commit, con `versionCode 4` y firma remota ([build EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/afbc3463-d90c-432e-a660-23ac614458aa)).
- [x] APK `development` generado para probar compras simuladas de RevenueCat Test Store ([build EAS](https://expo.dev/accounts/facuargerich/projects/blindly/builds/2d4f84b6-4ea7-41d0-9b2e-aee09d2e6e4b)).
- [x] RevenueCat Test Store configurado con entitlement `blindly_plus`, tres productos, oferta predeterminada y paywall publicado en español, inglés y portugués.
- [x] Enlaces del paywall configurados con las URLs previstas para privacidad y términos; serán navegables cuando se active GitHub Pages.
- [x] Ícono y gráfico de funciones de Google Play generados y validados en sus dimensiones y formatos requeridos.
- [x] Permiso de Google Play Billing y `launchMode=singleTop` garantizados por config plugin y prueba de manifiesto.
- [x] Proyecto Supabase aislado en la organización Blindly.
- [x] GitHub conectado a Supabase sobre la rama main.

## Preparado y pendiente de un servicio externo

- [ ] Activar GitHub Pages desde `main` y `/docs`, y comprobar que privacidad, términos y eliminación de cuenta respondan públicamente. La configuración está lista y solo falta autorizar la publicación.
- [ ] Crear una cuenta de distribución completa en Google Play cuando esté disponible la tarifa única de USD 25. No se eligió la distribución limitada gratuita porque admite como máximo 20 dispositivos y Google no permite convertir ese plan en distribución completa.
- [ ] Configurar un proveedor SMTP y un dominio remitente.
- [ ] Aplicar las plantillas de correo y activar `EXPO_PUBLIC_EMAIL_AUTH_READY`.
- [ ] Instalar el APK Android en dispositivos reales y completar la prueba física.
- [ ] Capturar al menos dos pantallas reales del APK aceptado para la ficha de Google Play.
- [ ] Definir un correo público de soporte y privacidad.
- [ ] Crear `com.blindly.app` en Play Console y completar acceso, clasificación, público objetivo y seguridad de datos.
- [ ] Generar la IPA privada cuando haya credenciales de Apple Developer y estén registrados los iPhone de prueba, o preparar el grupo cerrado de TestFlight.
- [ ] Crear los productos comerciales de Blindly Plus en Google Play Console y vincularlos con RevenueCat.
- [ ] Si Plus se prueba con compras reales en iPhone, crear también los productos equivalentes en App Store Connect; una IPA release privada mantiene Plus desactivado y Test Store se usa solo en `development`.
- [ ] Validar compra y restauración con RevenueCat Test Store en una build `development` depurable sobre un dispositivo físico.
- [x] Guardar `REVENUECAT_SECRET_KEY` en la Edge Function y validar la eliminación autenticada del perfil de cliente.
- [ ] Revocar la clave privada actual de RevenueCat, generar un reemplazo y actualizar el secreto de Supabase después de recibir autorización explícita.
- [ ] Activar `EXPO_PUBLIC_PLUS_READY` en `production` después de validar compra y restauración con productos reales.

## Artefactos Android 1.0.0

- APK de prueba: [descarga directa](https://expo.dev/artifacts/eas/aLs3Sth11h66H3Ddz78F5OyXDiDFnTBuDdb4-zb1xL0.apk), `versionCode 3`, SHA-256 `45B2E3AAAE4D27338FF831ABFE009D54D00AE15861DF6DEA942C620A412FFDC9`.
- AAB para Google Play: [descarga directa](https://expo.dev/artifacts/eas/s5nAxvg6Yd-Qciiuc9ZKMRmE-oITNIqVgP-Hlcnl41U.aab), `versionCode 4`, SHA-256 `F0B90F6B995BB7FBCB62A97C2991FC1EE19FD4776939BB263FB96C2E639874A5`.
- APK de desarrollo para Test Store: [descarga directa](https://expo.dev/artifacts/eas/cO1utrQC2gAeLE63VkH1TfjxUIe-O-5DDPS4nsYguUM.apk), SHA-256 `9C3CD74DBC14724A173FBF14D4944589B1E6B814A33758D103AC0737CC6EAA8E`.
- El APK preview y el AAB se generaron con Blindly Plus desactivado, por lo que no contienen una clave Test Store utilizable en una build release. La APK de desarrollo sí usa Test Store y no debe distribuirse como versión final.

## Prueba física de aceptación

Usar al menos tres celulares y completar una partida en modo virtual y otra en modo físico. Verificar ingreso por QR/código, fichas visuales DR/BTN/SB/BB, rotación de BTN/SB/BB, indicador de turno, acciones propias de cada jugador, rechazo de acciones fuera de turno, edición de stacks exclusiva del dealer, reconexión tras perder Internet, bloqueo y retorno de la app, pausa de música, reparto de pozos, cierre del torneo y puntuación final.

El splash se valida desde un arranque en frío de la build nativa. Expo Go y el navegador no reproducen todo el ciclo nativo.
