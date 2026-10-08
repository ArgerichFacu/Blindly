# Estado final de preparación de Blindly 1.0.0

Auditoría actualizada el 7 de octubre de 2026. Este documento separa la evidencia técnica comprobada de las acciones que requieren una cuenta externa, dinero, dispositivos físicos o autorización del propietario.

## Resultado por área

| Área | Estado | Evidencia comprobada | Pendiente externo |
| --- | --- | --- | --- |
| Juego y mesa | Implementado | Las pruebas cubren dealer fijo, BTN/SB/BB rotativos, turnos propios, pasar, igualar, subir, retirarse, all-in, pozos principales y secundarios, reparto exclusivo del dealer, stacks protegidos, puntuación e idempotencia. | Completar una partida de aceptación en al menos tres Android reales. |
| Identidad | Implementada | Invitado persistente, clave privada recuperable, rotación de clave, protección de UUID/puntos/historial/compras y eliminación autenticada de cuenta. | Configurar SMTP y probar el flujo opcional de correo en dos dispositivos. |
| Supabase | Operativo | Proyecto `ddvbbkwhisuezloorhfg` con nueve migraciones remotas y Edge Functions `crear-recuperacion`, `eliminar-cuenta` y `sincronizar-plus`. Las pruebas reales de Auth, RevenueCat, caché servidor, RPC, experiencia Free/Plus y limpieza temporal terminaron correctamente. | SMTP solo afecta la recuperación opcional por correo. |
| Seguridad de base | Revisada | La auditoría de la migración 17 comprobó 20 condiciones de tablas, RLS, privilegios, RPC públicas, helpers privados, historial Free y registro de migración con el resultado esperado. El asesor anterior muestra cero errores; los avisos intencionales están documentados en `security-review.md`. | Rotar la clave privada de RevenueCat que apareció anteriormente en un registro, después de autorización explícita. |
| Android | Artefactos nativos validados | APK preview `versionCode 5` y AAB production `versionCode 6` generados desde `a147e78`. Se comprobaron `com.blindly.app`, versión 1.0.0, SDK 36, integridad, firma, Billing y permisos mínimos. | Instalar el APK y completar la matriz física; cargar el AAB cuando exista la cuenta de Play Console. |
| iOS | Compilación validada | Build de simulador iOS 1.0.0 regenerada desde `a147e78`, descargada e inspeccionada: contiene `Blindly.app`, bundle `com.blindly.app`, build 1 y configuración de cifrado correcta. | Membresía Apple Developer, certificados, perfiles y dispositivos registrados para producir una IPA o usar TestFlight. |
| Blindly Plus | Integrado y protegido | SDK, entitlement, paywall, restauración, administración, borrado de perfil, Ligas, Temporadas y Ranking integrados. `sincronizar-plus` valida RevenueCat desde Supabase y las RPC no confían en el teléfono. Test Store existe solo en `development`; `preview` y `production` mantienen Plus desactivado. | Publicar el nuevo borrador del paywall tras la confirmación del propietario, probar compra/restauración en Android real, crear productos de Google Play, configurar las claves públicas de producción y reconstruir. |
| Documentación y legales | Preparados | README, política de privacidad, términos, eliminación de cuenta, textos de tienda, gráficos, guía física, revisión de seguridad y paquete de Play Console versionados. | Autorizar y activar GitHub Pages; definir correo público de soporte y privacidad. |
| Google Play | Paquete preparado | AAB firmado, ficha localizada, icono, gráfico, documentos legales y hashes incluidos en el ZIP. `targetSdkVersion 36` cumple el requisito vigente. | Pagar/crear la cuenta, cargar el bundle, completar formularios, ejecutar prueba cerrada con 12 testers durante 14 días y solicitar producción. |
| GitHub y CI | Sincronizado | El commit funcional `a147e78` pasó el workflow [`Verificar Blindly`](https://github.com/ArgerichFacu/Blindly/actions/runs/37351110894). El cierre exige la matriz incluida en el SDK bloqueado, auditoría crítica, TypeScript, ESLint, pruebas y bundles web/Android/iOS; el informe de nuevos parches online permanece visible. El remoto conserva únicamente `main`. | Los seis parches nuevos recomendados por Expo se revisarán en el siguiente bloque; no están incorporados a estos binarios. |

## Artefactos aprobados

| Uso | Build EAS | Versión | SHA-256 |
| --- | --- | --- | --- |
| Android instalable | [`3cd26009-81ce-4a67-8778-87a28d0d121e`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/3cd26009-81ce-4a67-8778-87a28d0d121e) | 1.0.0 (`versionCode 5`) | `F62B57844824B5C85AF4E8C8976FF69C1A52C7DD1FD5008C371CE0EB31B12928` |
| Google Play AAB | [`da6f7279-a681-4c09-86f9-7b879bdded73`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/da6f7279-a681-4c09-86f9-7b879bdded73) | 1.0.0 (`versionCode 6`) | `A496C7E80823A7B895ECD3EBA2162F6463ECEB75EFBE3DC9A74C342FAFB8E6C6` |
| Paquete Play Console | Local y OneDrive | 1.0.0 | Verificado al generar; el hash vigente se registra en `release/LEEME.txt`. |
| Simulador iOS | [`b624dd9e-ffd0-4254-bf65-522f8cd316e1`](https://expo.dev/accounts/facuargerich/projects/blindly/builds/b624dd9e-ffd0-4254-bf65-522f8cd316e1) | 1.0.0 (`build 1`) | `03022B72932A77409975C43EF9E7C8C82DA6F259C3A6E4D0E19BFFE089B24A31` |

Los binarios Android se generaron desde `a147e78b154a7068f18b0bc838dcc93d0d3af21d` y contienen el alcance funcional validado de esta release. El APK pasó `apksigner` con firma v2; el AAB pasó `bundletool validate` y `jarsigner`, y su manifiesto confirmó `com.blindly.app`, `versionCode 6`, `targetSdkVersion 36`, Billing y ausencia de permisos de almacenamiento o superposición.

El certificado de carga del APK y del AAB coincide: SHA-256 `C5B6C355789F93255B188CEF762DB78DE5A1900E286CE3B1EC9475F6C466422F`, RSA 2048, válido hasta el 16 de febrero de 2054. `jarsigner` normal verificó el AAB con código 0. Su modo estricto informa código 4 por certificado autofirmado y cadena no reconocida; Java 25 también avisa diferencias entre sus lectores JarFile/JarInputStream. Estos avisos se registran y no sustituyen la futura revisión de Play Console.

La actualización de `shell-quote` a 1.12.0 corrige una vulnerabilidad en herramientas de desarrollo después de generar los binarios. No cambia el código de producción de esta release. Detalles y límites de la auditoría en [security-review.md](security-review.md).

## Orden restante de publicación

1. Activar GitHub Pages desde `main` y `/docs`; verificar privacidad, términos y eliminación.
2. Conectar tres Android y completar `prueba-fisica.md`, incluidos arranque en frío, temas, reconexión, música, recuperación y una partida completa.
3. Guardar al menos dos capturas aprobadas y definir el correo público de soporte.
4. Crear la cuenta completa de Play Console, crear `com.blindly.app` y cargar el AAB primero en prueba interna.
5. Completar los formularios de contenido, acceso, público, seguridad de datos y eliminación de cuenta.
6. Ejecutar [`play-closed-test.md`](play-closed-test.md), mantener al menos 12 testers inscritos continuamente durante 14 días y solicitar acceso a producción.
7. Crear los productos comerciales de Plus, configurar RevenueCat producción, reconstruir y validar compra/restauración antes de activar Plus.
8. Para iPhone físico, contratar Apple Developer y elegir entre IPA *ad hoc* con UDID o TestFlight cerrado.

No debe generarse otro AAB salvo que cambie el código o una configuración incluida en la aplicación. Play Console rechazará reutilizar un `versionCode`; la siguiente build de producción deberá incrementarlo automáticamente.
