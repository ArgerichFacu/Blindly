# Activación comercial Android — 9 de octubre de 2026

**Preparación técnica realizada; activación comercial NO confirmada.** No se publicó producción, no se hicieron compras y no se cobraron importes. La cuenta de Play Console está creada y pagada. El pago ya no es un bloqueo.

## Estado observado y bloqueos

| Área | Estado y evidencia |
| --- | --- |
| Cuenta Play Console | HECHO / PAGADA. Cuenta personal Blindly Studio. |
| Identidad | **BLOQUEADA POR VERIFICACIÓN DE IDENTIDAD DE GOOGLE PLAY**. Play muestra «Google está verificando tu identidad». |
| Teléfono de contacto | **BLOQUEADA POR VERIFICACIÓN DE IDENTIDAD DE GOOGLE PLAY**. Google exige aprobación previa de los documentos. |
| App Play | **BLOQUEADA POR VERIFICACIÓN DE IDENTIDAD DE GOOGLE PLAY**. En la lista vacía de aplicaciones, «Crear aplicación» está deshabilitado y aparece «Completa las verificaciones de la cuenta para crear aplicaciones nuevas». |
| Productos y track | **BLOQUEADA POR VERIFICACIÓN DE IDENTIDAD DE GOOGLE PLAY**: requieren la app que todavía no puede crearse. No existen productos Google importados ni un track Blindly. |
| App RevenueCat Android | HECHO. Se creó `Blindly (Play Store)`, package `com.blindly.app`, REST ID `appcd50009f1f`. No había otra configuración Android. |
| Credenciales Google | PENDIENTE de preparación manual y permisos; no se cargó JSON ni se concedió acceso. La validación final necesita la app Play. Crear un proyecto Cloud puede hacerse antes de la aprobación. |
| Offering | HECHO en Test Store: `default` (`ofrng2c5553db79`), actual predeterminado, tres packages. PREPARADO el mapping Google; todavía NO operativo. |
| Entitlement | Existe únicamente `blindly_plus` (`entl030c8c5084`). Se conservan seis productos Test Store asociados, incluidos tres legacy que no se ofrecen. Ninguno es un producto Google. |
| Paywall | Hay una versión publicada anterior de dos planes y **cambios en borrador** de tres planes. No confundir borrador con ausencia de una versión publicada. No se publicó el borrador en esta ejecución. |
| Compra / restore Play | PENDIENTE DE TEST REAL. Las pruebas de código no validan transacciones de Google. |
| EAS | HECHO: clave pública SDK Android de esa app en `preview`; `production` conservado. Contador remoto Android alineado a15 (antes7) para que autoIncrement produzca16. |

Proyecto RevenueCat: `f4dd7888`. [Configuración Android](https://app.revenuecat.com/projects/f4dd7888/apps/appcd50009f1f).

## IDs permanentes y mapping preparado

Se reutilizan los IDs ya definidos en `blindly-plus.md`; no se duplicó ningún offering, package, entitlement ni producto Test Store.

| Plan | Precio base USD | Google Play preparado, aún NO creado | RevenueCat Google preparado | Package existente | Test Store actualmente asociado |
| --- | ---: | --- | --- | --- | --- |
| Mensual | 0,99 | Suscripción `blindly_plus`, base plan `monthly`, renovación mensual automática | `blindly_plus:monthly` | `$rc_monthly` | `blindly_plus_monthly_launch` |
| Anual recomendado | 9,99 | Misma suscripción `blindly_plus`, base plan `annual`, renovación anual automática | `blindly_plus:annual` | `$rc_annual` | `blindly_plus_annual_launch` |
| Founder Edition | 24,99 | Compra única `blindly_plus_founder_lifetime` | `blindly_plus_founder_lifetime`, **non-consumable** | `$rc_lifetime` | `blindly_plus_founder_lifetime` |

Google utiliza la misma suscripción con dos planes base; RevenueCat distingue sus IDs con `:`. Founder debe importarse como no consumible para que el SDK no la consuma. [Configuración oficial de productos Android](https://www.revenuecat.com/docs/getting-started/entitlements/android-products).

No se crea el lifetime regular de USD39,99. Para retirar Founder posteriormente, dejar de ofrecer su package y desactivar su venta en Play; conservar producto, historial y asociación a `blindly_plus`. La validación del cliente admite retirarlo sin bloquear mensual/anual. El entitlement sin vencimiento sigue activo; un reembolso/revocación sí puede retirarlo.

## Paywall auditado

Se conserva `wf129e2551f5834fa2`, offering `default`, estética verde/dorada, anual destacado con «RECOMENDADO» y Founder de lanzamiento. El borrador contiene ES/EN/PT. Los textos de precios usan `{{ product.price }}` y el anual `{{ product.price_per_month }}` en los tres idiomas; los USD de la vista previa vienen de Test Store. No se escribió un precio local fijo en la app.

Se corrigió un bug real del borrador: privacidad y términos apuntaban a RevenueCat. Ahora ES/EN/PT abren los documentos públicos de Blindly en [privacidad](https://github.com/ArgerichFacu/Blindly/blob/main/PRIVACY.md) y [términos](https://github.com/ArgerichFacu/Blindly/blob/main/TERMS.md), ambos HTTP200. Las URLs GitHub Pages previstas todavía responden HTTP404; no afirmar que Pages está activado. Los documentos públicos actuales están en español; las etiquetas del paywall sí están traducidas.

**Publicar el borrador únicamente cuando los tres productos Google, sus packages y `blindly_plus` estén asociados y recuperables por el SDK.** Comprobar precios regionales de la tienda, selección anual, condiciones de renovación, compra única y enlaces en la build instalada desde Play. La versión anterior publicada no representa el nuevo borrador Founder.

## Identidad, restore y permisos

El invitado sigue jugando gratis. Comprar/restaurar exige la identidad recuperable existente: clave privada de recuperación, correo confirmado o identidad social vinculada al mismo UUID. El error ofrece «Proteger mi cuenta» y devuelve a Plus al finalizar; nunca cobra automáticamente después de protegerla.

`asegurarSesion` → identidad recuperable → `prepararCompras(UUID)` → RevenueCat configurado/login con ese UUID → paywall/restore → CustomerInfo → `sincronizar-plus` autenticada. No se crea una identidad comercial alternativa. Antes de recuperar en otro dispositivo, usar la clave o iniciar sesión con la **misma cuenta**, después restaurar con la misma cuenta Google de compra. Guardar la clave fuera de la app antes de reinstalar; no hace falta SMTP para ese método.

La app observa cambios de CustomerInfo y vuelve a consultar al regresar a primer plano. Un cambio de UUID mientras se cargan ofertas impide abrir el pago de la cuenta anterior. Servidor y RPC conservan el entitlement como autoridad; no se agregó un flag premium manual. Loading/error no concede capacidades inciertas. Expirar bloquea edición premium y conserva datos; las pruebas SQL existentes verifican lectura/conservación y restore.

Founder activa `blindly_plus` con `expirationDate=null`; se conserva ese acceso. Sin `managementURL` no se muestra administración de suscripción: se ofrece actualizar estado. Comprar no sustituye restaurar: restore no requiere que Founder siga en venta. Las reinstalaciones y transferencias reales siguen pendientes de prueba.

Project Settings → General mostró **Transfer to new App User ID**, sin comportamiento sandbox distinto y sandbox permitido a Anybody. Se preservó esa política existente. Restaurar con un UUID recuperable diferente y la misma cuenta de tienda puede transferir Plus, pero **no transfiere puntos ni historial de Supabase**. El recorrido recomendado recupera primero el UUID original. Añadir a QA el caso de cuenta equivocada y revisar la política antes de vender; no afirmar que el guard local evita toda transferencia. [Restore y política de transferencia de RevenueCat](https://www.revenuecat.com/docs/getting-started/restoring-purchases).

## Credenciales: intervención exacta

Seguir la [guía vigente de RevenueCat](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials). No enviar claves por chat ni guardarlas en Git.

1. Google Cloud → selector de proyecto: elegir/crear uno exclusivo para Blindly.
2. APIs y servicios → Biblioteca: habilitar Google Play Android Developer API, Google Play Developer Reporting API y Pub/Sub.
3. IAM y administración → Cuentas de servicio → Crear: `revenuecat-service-account`. Roles Pub/Sub Editor y Monitoring Viewer; no Owner/Admin genérico.
4. Cuenta de servicio → Claves → Agregar clave → Crear nueva clave → JSON. Guardar en `.credentials/revenuecat-key.json`, carpeta ignorada.
5. Con app Play disponible: Usuarios y permisos → Invitar usuario → email `client_email` del JSON → añadir Blindly.
6. Permisos requeridos por la guía: ver información/reportes; ver datos financieros/pedidos; administrar pedidos/suscripciones; administrar presencia en tienda. Revisar el alcance antes de concederlos.
7. RevenueCat → Apps → **Blindly (Play Store)** → Service account credentials: subir ese JSON → Save changes → Check credentials. Esperar validación; puede tardar hasta36h.
8. Conectar Google developer notifications y verificar recepción.

No se ejecutaron concesiones de acceso ni cargas de secretos. La nota previa de `identidad-y-build.md` sobre rotar la clave V1 sigue pendiente de comprobación/intervención: RevenueCat → API keys → crear reemplazo V1; actualizar **solo** el secreto `REVENUECAT_SECRET_KEY` en Supabase; verificar `sincronizar-plus` y `eliminar-cuenta`; revocar la anterior. Nunca exportar ese secreto a EAS. No se afirma que ya esté rotada.

## Orden exacto cuando Google apruebe

1. Play Console → configuración de cuenta → verificar teléfono de contacto y completar tareas pendientes; no volver a pagar ni crear otra cuenta.
2. Lista de aplicaciones → Crear aplicación → Blindly, aplicación gratuita con productos internos. Revisar personalmente las declaraciones legales que Google solicite. Conservar `com.blindly.app` al subir el bundle.
3. Pruebas → Prueba interna → Crear versión: subir el AAB v15 de preparación como primer bundle, habilitar Play App Signing y comprobar el certificado de subida. No enviarlo a producción.
4. Completar perfil de pagos/comerciante si Google lo exige para vender productos; esa operación necesita intervención del titular. No se dio por creado ni se introdujeron datos financieros.
5. Monetizar → Productos → Suscripciones → Crear `blindly_plus`. Añadir/activar `monthly` (mensual, USD0,99) y `annual` (anual, USD9,99), ambos auto-renovables, sin promociones inventadas. Elegir disponibilidad/regiones y respetar precios localizados.
6. Productos de compra única → Crear/activar `blindly_plus_founder_lifetime`, USD24,99. En RevenueCat importarlo como non-consumable/lifetime.
7. Completar las credenciales anteriores. RevenueCat → Product catalog → Products → importar los tres productos desde **Blindly (Play Store)**; asociar cada uno a `blindly_plus`.
8. Offerings → `default` → editar sus tres packages: añadir el producto **Google** equivalente a cada uno, conservando el mapping Test Store. No crear otra oferta ni renombrar IDs. Verificar ausencia de productos huérfanos y `getOfferings().current` con tres planes.
9. Comprobar la **clave pública SDK `goog_…`** de esa app Android, ya configurada en EAS → environment **preview**, variable `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`; nunca `test_`, `appl_` ni secret key. Mantener producción desactivada. La clave pública puede incluirse en una build, pero no valida transacciones sin las credenciales Google privadas del servidor.
10. Publicar los cambios del paywall sólo tras comprobar coherencia y recuperación de productos. Construir un AAB nuevo de pruebas con esa clave y Plus habilitado (ver comandos); usar versionCode superior a15.
11. Play → Pruebas → Prueba interna → Testers: añadir cuentas, guardar y compartir enlace opt-in. Configuración → Pruebas de licencia: añadir las **mismas cuentas Google** como license testers. No guardar emails de testers en el repositorio público.
12. Lanzar la versión de prueba interna; cada tester se inscribe e instala **desde Play**. Seleccionar exclusivamente instrumentos oficiales de prueba, nunca tarjeta real. Registrar los20 casos de abajo. Producción requiere otra aprobación explícita.

## Builds y clave pública

`play-testing` extiende production, usa environment preview, distribución store y AAB. Activa la integración únicamente en esa build; no modifica production. Con clave ausente, secreta, de otra plataforma o Test Store en release, el guard impide configurar SDK/compras. `development` conserva Test Store depurable; `preview` APK regular continúa desactivado aunque ahora dispone de la clave pública Google. El contador remoto EAS se subió de7 a15 para evitar que la próxima build remota quede por debajo del AAB local; `autoIncrement` generará16. No se lanzó una build EAS ni un submit.

```powershell
# Con productos/credenciales Google listos y la clave pública ya en EAS preview:
npx eas-cli build --platform android --profile play-testing
# Alternativa local: definir la clave pública en el entorno del proceso,
# sin pasar credenciales privadas por argumentos y con versionCode >15:
.\scripts\build-android-local.ps1 -SdkRoot 'TU_ANDROID_SDK' -JavaHome 'TU_JDK17' -VersionCode 16 -PlayBilling
```

El script local **por defecto desactiva Plus**; `-PlayBilling` exige una clave pública Android válida por prefijo. No cambia la firma original ni añade dependencias nativas. SDK RevenueCat/Purchases UI10.11.0 y Expo57 se conservan. La prueba ARM64/16KB y partida completa16KB siguen pendientes; este bloque no las declara completadas ni repite la prueba x86_64 previa.

## QA comercial pendiente (20 casos)

| Casos | Verificación requerida en Play |
| --- | --- |
| 1–5 | Free abre paywall; mensual/anual/Founder presentes; precios regionales correctos, anual recomendado. |
| 6–11 | Cancelación no rompe Free; compra de cada plan activa `blindly_plus` en RevenueCat; UI desbloquea sin reinicio. |
| 12–15 | Restaurar; reiniciar; recuperar misma cuenta/cambiar dispositivo; error de red sin acceso indebido. |
| 16–20 | Pendiente no desbloquea; compra cancelada; expiración/cancelación al final del período; Free funcional; datos premium conservados. |

Registrar UUID/plan, resultado, entitlement, actualización UI, restore y fecha con alias; sin tokens ni recibos completos. Revisar errores de productos no disponibles, offering vacío, store mismatch e IDs inválidos. Founder se prueba como compra única, restore permanente y revocación de prueba. La validación no termina con `adb install`.

Un internal tester tiene acceso al track; un **license tester** usa instrumentos de pago de prueba. El primero, por sí solo, puede recibir cargos reales. Closed testers cubren requisitos de publicación, no sustituyen licencia de pruebas. [Testing de Billing de Google](https://developer.android.com/google/play/billing/test).

Producción es independiente: cuentas personales nuevas necesitan prueba cerrada con al menos12 testers inscritos durante14días y solicitar acceso; revisar la exigencia concreta de esta cuenta después de verificarla. Además, ficha, clasificación, Data Safety, acceso de revisión y políticas. [Requisitos actuales de Google](https://support.google.com/googleplay/android-developer/answer/14151465).

## Validación de código y artefactos

Las pruebas de código cubren invitado, UUID recuperado, cancelación/error, red, offerings, cambio de identidad durante la carga, restore, Founder sin vencimiento y expiración. La suite SQL verifica datos conservados y permisos. Esto **no** simula una compra aprobada por Google ni acredita el Nivel2.

Build local terminada: versión1.0.0, `versionCode15`, package `com.blindly.app`, target36/min24, cuatro ABIs. Incluye el código actual y el diseño Poker Room, con Plus desactivado. APK verificada con apksigner; AAB validado con bundletool y jarsigner (`jar verified`); ambos usan certificado SHA256 `C5B6C355789F93255B188CEF762DB78DE5A1900E286CE3B1EC9475F6C466422F`. Zipalign `-P16` pasó para APK; esto no sustituye prueba runtime ARM64/16KB. Jarsigner informa certificado autofirmado y advertencias de orden de entradas ZIP, sin fallo de verificación; la aceptación de Play se comprueba al subirlo.

Entrega fuera de OneDrive:

- `C:\Users\facun\Downloads\Blindly-plus-preparacion-v15.aab`, SHA256 `3CB8EEBD0EF17B751B013C538E3F395D48A4AEA11F1FA8C21C04B434DC85652A`.
- `C:\Users\facun\Downloads\Blindly-plus-preparacion-v15.apk`, SHA256 `52F60EE7AD79D10FE3EE0344CC0D9B3ED07A318E2D4DCFB284240F6040E8402A`.

La APK de preparación puede probar Free; el AAB de preparación sirve para el primer upload. **Ninguno confirma compras**: después de conectar productos/clave hace falta generar otra build y ejecutar QA desde el track.

## Criterio de cierre

Nivel1: preparación local probada, RevenueCat auditado, app Android creada, mapping/documentación preparados; dependencias manuales de credenciales y Google señaladas. Nivel2 **NO completado**: falta cadena real Play → RevenueCat → compra de prueba → `blindly_plus` → desbloqueo. No publicar producción ni avanzar a iOS en este bloque.
