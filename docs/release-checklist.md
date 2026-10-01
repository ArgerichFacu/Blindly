# Lista de lanzamiento de Blindly

Estado auditado el 1 de octubre de 2026. Esta lista separa lo validado por código de las comprobaciones que requieren cuentas comerciales o dispositivos físicos.

## Validado automáticamente

- [x] Tipos TypeScript.
- [x] Reglas de turnos, ciegas, all-in, pozos e idempotencia.
- [x] Acciones propias de cada jugador y cierre exclusivo del dealer.
- [x] Puntuación, empates, privacidad y persistencia del historial.
- [x] Sesión anónima única y flujo preparado para vincular y recuperar por correo.
- [x] Eliminación de cuenta y datos desde la app, bloqueada durante partidas activas.
- [x] Política de privacidad accesible dentro de la app y documentación inicial de tiendas.
- [x] Nombre, fondo, iconos adaptativos y declaración de cifrado preparados para builds nativas.
- [x] Permisos mínimos de tablas y funciones auxiliares.
- [x] Índices de las claves foráneas usadas en consultas de sala.
- [x] Empaquetado web de producción en CI.
- [x] Proyecto Supabase aislado en la organización Blindly.
- [x] GitHub conectado a Supabase sobre la rama main.

## Preparado y pendiente de un servicio externo

- [ ] Configurar un proveedor SMTP y un dominio remitente.
- [ ] Aplicar las plantillas de correo y activar `EXPO_PUBLIC_EMAIL_AUTH_READY`.
- [ ] Vincular el proyecto con una cuenta Expo mediante `eas init`.
- [ ] Crear variables preview y production en EAS.
- [ ] Generar builds Android e iOS e instalarlas en dispositivos reales.
- [ ] Crear productos de suscripción en App Store Connect y Google Play Console.
- [ ] Configurar RevenueCat, sus entitlements y claves públicas.
- [ ] Activar `EXPO_PUBLIC_PLUS_READY` después de validar compra y restauración.

## Prueba física de aceptación

Usar al menos tres celulares y completar una partida en modo virtual y otra en modo físico. Verificar ingreso por QR/código, rotación de BTN/SB/BB, turnos simultáneos, reconexión tras perder Internet, bloqueo y retorno de la app, pausa de música, reparto de pozos, cierre del torneo y puntuación final.

El splash se valida desde un arranque en frío de la build nativa. Expo Go y el navegador no reproducen todo el ciclo nativo.
