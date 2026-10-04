# Estado final de preparación de Blindly 1.0.0

Auditoría actualizada el 4 de octubre de 2026. Este documento separa la evidencia técnica comprobada de las acciones que requieren una cuenta externa, dinero, dispositivos físicos o autorización del propietario.

## Resultado por área

| Área | Estado | Evidencia comprobada | Pendiente externo |
| --- | --- | --- | --- |
| Juego y mesa | Implementado | Las pruebas cubren dealer fijo, BTN/SB/BB rotativos, turnos propios, pasar, igualar, subir, retirarse, all-in, pozos principales y secundarios, reparto exclusivo del dealer, stacks protegidos, puntuación e idempotencia. | Completar una partida de aceptación en al menos tres Android reales. |
| Identidad | Implementada | Invitado persistente, clave privada recuperable, rotación de clave, protección de UUID/puntos/historial/compras y eliminación autenticada de cuenta. | Configurar SMTP y probar el flujo opcional de correo en dos dispositivos. |
| Supabase | Operativo | Proyecto `ddvbbkwhisuezloorhfg` en estado `ACTIVE_HEALTHY`, Postgres 17.6, siete migraciones remotas y Edge Functions `crear-recuperacion` y `eliminar-cuenta` activas con `verify_jwt=true`. | Ninguno para el flujo por clave. SMTP solo afecta la recuperación opcional por correo. |
| Seguridad de base | Revisada | Sin avisos de rendimiento. Los avisos de RLS, acceso anónimo y cuatro RPC `SECURITY DEFINER` son intencionales y están limitados por autenticación, pertenencia a sala, UUID y permisos documentados en `security-review.md`. | Rotar la clave privada de RevenueCat que apareció anteriormente en un registro, después de autorización explícita. |
| Android | Compilado | APK preview `versionCode 4` y AAB production `versionCode 5` terminados en EAS. El AAB fue validado con bundletool 1.18.3: paquete `com.blindly.app`, API 36, no depurable, Billing presente y permisos innecesarios ausentes. | Instalar y ejecutar la matriz de prueba física; obtener capturas reales. |
| iOS | Compilación validada | Build de simulador iOS 1.0.0 terminada en EAS y paquete `.app` descargado. | Membresía Apple Developer, certificados, perfiles y dispositivos registrados para producir una IPA o usar TestFlight. |
| Blindly Plus | Integrado y aislado | SDK, entitlement, paywall, restauración, administración y borrado de perfil integrados. Test Store existe solo en `development`; `preview` y `production` mantienen Plus desactivado y no contienen una clave Test Store. | Probar compra/restauración en Android real, crear productos de Google Play, configurar la clave de producción y reconstruir. |
| Documentación y legales | Preparados | README, política de privacidad, términos, eliminación de cuenta, textos de tienda, gráficos, guía física, revisión de seguridad y paquete de Play Console versionados. | Autorizar y activar GitHub Pages; definir correo público de soporte y privacidad. |
| Google Play | Paquete preparado | AAB firmado, ficha localizada, icono, gráfico, documentos legales y hashes incluidos en el ZIP. `targetSdkVersion 36` cumple el requisito vigente. | Pagar/crear la cuenta, cargar el bundle, completar formularios, ejecutar prueba cerrada con 12 testers durante 14 días y solicitar producción. |
| GitHub y CI | Sincronizado | El commit de base auditado `68f3286` pasó el workflow [`Verificar Blindly`](https://github.com/ArgerichFacu/Blindly/actions/runs/37217605011), que incluye Expo Doctor, dependencias, TypeScript, ESLint, pruebas y bundles web/Android/iOS. Este informe añade documentación y vuelve a ejecutar el mismo control. | Ninguno para el código actual. |

## Artefactos aprobados

| Uso | Build EAS | Versión | SHA-256 |
| --- | --- | --- | --- |
| Android instalable | [`adce6a93-dbe1-4ef9-a5db-c86eb084cb3b`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/adce6a93-dbe1-4ef9-a5db-c86eb084cb3b) | 1.0.0 (`versionCode 4`) | `65216DAD2837E7E2882D5B94B68815495BDCCB86085FCB1A7AD664B87227F85E` |
| Google Play AAB | [`cef204be-b7bc-4da5-b81d-9da2d4317d61`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/cef204be-b7bc-4da5-b81d-9da2d4317d61) | 1.0.0 (`versionCode 5`) | `89F753CCFF4A47AC9B2501B220EE4649152FFBD2BC1944522FF7D0ACD581124C` |
| Paquete Play Console | Local y OneDrive | 1.0.0 | Verificado al generar; el hash vigente se registra en `release/LEEME.txt`. |
| Simulador iOS | [`53230fdc-cf5c-4463-b12f-a3e3f7e212c6`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/53230fdc-cf5c-4463-b12f-a3e3f7e212c6) | 1.0.0 (`build 1`) | `5673FD59EE3BA234BB5D7B82DF3FACDC01449E79E39E90816FE3E91B94ACEC87` |

Los binarios Android se generaron desde `07aff0db39e14643060e102ec9cfb07a116450f8`. Los commits posteriores solo actualizan documentación y scripts de entrega, sin cambiar el código incluido en esos binarios.

## Orden restante de publicación

1. Activar GitHub Pages desde `main` y `/docs`; verificar privacidad, términos y eliminación.
2. Conectar tres Android y completar `prueba-fisica.md`, incluidos arranque en frío, temas, reconexión, música, recuperación y una partida completa.
3. Guardar al menos dos capturas aprobadas y definir el correo público de soporte.
4. Crear la cuenta completa de Play Console, crear `com.blindly.app` y cargar el AAB primero en prueba interna.
5. Completar los formularios de contenido, acceso, público, seguridad de datos y eliminación de cuenta.
6. Mantener al menos 12 testers inscritos continuamente en una prueba cerrada durante 14 días y solicitar acceso a producción.
7. Crear los productos comerciales de Plus, configurar RevenueCat producción, reconstruir y validar compra/restauración antes de activar Plus.
8. Para iPhone físico, contratar Apple Developer y elegir entre IPA *ad hoc* con UDID o TestFlight cerrado.

No debe generarse otro AAB salvo que cambie el código o una configuración incluida en la aplicación. Play Console rechazará reutilizar un `versionCode`; la siguiente build de producción deberá incrementarlo automáticamente.
