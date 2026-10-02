# Lista de lanzamiento de Blindly

Estado auditado el 2 de octubre de 2026. Esta lista separa lo validado por código de las comprobaciones que requieren cuentas comerciales o dispositivos físicos.

## Validado automáticamente

- [x] Tipos TypeScript.
- [x] Reglas de turnos, ciegas, all-in, pozos e idempotencia.
- [x] Acciones propias de cada jugador y cierre exclusivo del dealer.
- [x] Ajuste de stacks físicos protegido en Supabase y disponible solo para el dealer.
- [x] Puntuación, empates, privacidad y persistencia del historial.
- [x] Sesión anónima única y flujo preparado para vincular y recuperar por correo.
- [x] Recuperación operativa sin correo mediante una clave privada rotatoria y una Edge Function autenticada.
- [x] Eliminación de cuenta y datos desde la app, bloqueada durante partidas activas.
- [x] Política de privacidad accesible dentro de la app y documentación inicial de tiendas.
- [x] Nombre, fondo, iconos adaptativos y declaración de cifrado preparados para builds nativas.
- [x] Permisos mínimos de tablas y funciones auxiliares.
- [x] Índices de las claves foráneas usadas en consultas de sala.
- [x] Empaquetado JavaScript de web, Android e iOS en CI.
- [x] SDK de Blindly Plus, paywall, restauración y administración de suscripción integrados y desactivados por variable pública.
- [x] Borrado opcional del perfil de RevenueCat desde la eliminación autenticada de cuenta.
- [x] Perfiles EAS de development, preview y production preparados.
- [x] Proyecto `@facuargerich/blindly` vinculado y variables públicas creadas en los tres entornos EAS.
- [x] APK Android preview generado por EAS con firma remota y RevenueCat Test Store activo.
- [x] RevenueCat Test Store configurado con entitlement `blindly_plus`, tres productos, oferta predeterminada y paywall publicado en español, inglés y portugués.
- [x] Enlaces del paywall conectados a la política de privacidad y los términos públicos de Blindly.
- [x] Ícono y gráfico de funciones de Google Play generados y validados en sus dimensiones y formatos requeridos.
- [x] Permiso de Google Play Billing y `launchMode=singleTop` garantizados por config plugin y prueba de manifiesto.
- [x] Proyecto Supabase aislado en la organización Blindly.
- [x] GitHub conectado a Supabase sobre la rama main.

## Preparado y pendiente de un servicio externo

- [ ] Configurar un proveedor SMTP y un dominio remitente.
- [ ] Aplicar las plantillas de correo y activar `EXPO_PUBLIC_EMAIL_AUTH_READY`.
- [ ] Instalar el APK Android en dispositivos reales y completar la prueba física.
- [ ] Capturar al menos dos pantallas reales del APK aceptado para la ficha de Google Play.
- [ ] Definir un correo público de soporte y privacidad.
- [ ] Crear `com.blindly.app` en Play Console y completar acceso, clasificación, público objetivo y seguridad de datos.
- [ ] Generar la IPA privada cuando haya credenciales de Apple Developer y estén registrados los iPhone de prueba, o preparar el grupo cerrado de TestFlight.
- [ ] Crear los productos comerciales de Blindly Plus en Google Play Console y vincularlos con RevenueCat.
- [ ] Si Plus se prueba con compras reales en iPhone, crear también los productos equivalentes en App Store Connect; la distribución privada sin compras reales puede usar Test Store.
- [ ] Validar compra y restauración con RevenueCat Test Store en un dispositivo físico.
- [x] Guardar `REVENUECAT_SECRET_KEY` en la Edge Function y validar la eliminación autenticada del perfil de cliente.
- [ ] Revocar la clave privada actual de RevenueCat, generar un reemplazo y actualizar el secreto de Supabase después de recibir autorización explícita.
- [ ] Activar `EXPO_PUBLIC_PLUS_READY` en `production` después de validar compra y restauración con productos reales.

## Prueba física de aceptación

Usar al menos tres celulares y completar una partida en modo virtual y otra en modo físico. Verificar ingreso por QR/código, fichas visuales DR/BTN/SB/BB, rotación de BTN/SB/BB, indicador de turno, acciones propias de cada jugador, rechazo de acciones fuera de turno, edición de stacks exclusiva del dealer, reconexión tras perder Internet, bloqueo y retorno de la app, pausa de música, reparto de pozos, cierre del torneo y puntuación final.

El splash se valida desde un arranque en frío de la build nativa. Expo Go y el navegador no reproducen todo el ciclo nativo.
