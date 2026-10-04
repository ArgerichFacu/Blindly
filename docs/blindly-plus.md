# Blindly Plus

Blindly seguirá siendo utilizable sin pagar. La creación y unión a salas, los turnos, las fichas físicas y virtuales y el reparto del pozo forman parte del producto principal.

El paywall `Blindly Plus` tiene un nuevo diseño guardado como borrador en RevenueCat con textos en español, inglés y portugués. Debe publicarse únicamente tras la confirmación final del propietario. El perfil `development` usa Test Store; las APK `preview` son builds release y mantienen Plus desactivado. Todavía falta validar compra y restauración con una build de desarrollo en hardware real antes de crear los productos comerciales de Google Play.

## Precios de lanzamiento

| Plan | Precio | Presentación |
| --- | ---: | --- |
| Mensual | USD 0,99 | Para probar Plus o jugar ocasionalmente. |
| Anual | USD 9,99 | Plan recomendado y destacado visualmente. |
| Blindly Plus — Founder Edition | USD 24,99 | Acceso vitalicio con precio especial de lanzamiento. |

El precio regular previsto para el acceso vitalicio es USD 39,99 en una etapa futura. Mientras Founder Edition esté disponible, el paywall muestra USD 24,99 y no presenta USD 39,99 como una compra activa.

## Alcance implementado

Plus incorpora ligas privadas, temporadas y ranking compartido, además de métricas avanzadas, temas premium y la edición de niveles de ciegas y descansos. La creación y administración de ligas requiere Plus en el owner; los miembros invitados participan gratis. Ninguna de estas funciones impide que un jugador gratuito participe de una mesa, use los modos estándar o administre el pozo.

Las ligas se protegen también en servidor. `sincronizar-plus` valida el entitlement en RevenueCat y actualiza `accesos_plus`; las RPC administrativas sólo aceptan verificaciones vigentes. La cancelación conserva ligas y resultados en modo lectura. Consultá [ligas, temporadas y ranking](ligas.md).

## Arquitectura de compras implementada

La integración usa RevenueCat sobre las compras nativas de Apple y Google. El entitlement estable es `blindly_plus`. El UUID de Supabase se usa como identificador de cliente para conservar la compra al proteger y recuperar la cuenta. La app ya incluye configuración del SDK, paywall, restauración, administración de suscripción y actualización en vivo del estado del cliente.

Variables públicas previstas:

```dotenv
EXPO_PUBLIC_PLUS_READY=false
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
```

Las claves públicas de plataforma pueden formar parte de la app. Nunca deben incluirse secretos de App Store Connect, Google Play, Stripe, RevenueCat ni `service_role`.

Las Edge Functions `eliminar-cuenta` y `sincronizar-plus` usan la clave secreta de API v1 guardada en Supabase como `REVENUECAT_SECRET_KEY`; nunca uses ese secreto como variable `EXPO_PUBLIC`. La primera borra el perfil al eliminar la cuenta y la segunda verifica el entitlement antes de administrar una liga. La eliminación del perfil no cancela la suscripción de la tienda, por lo que la interfaz dirige al usuario a administrarla antes.

## Activación

1. Crear la aplicación y el entitlement `blindly_plus` en RevenueCat.
2. Crear en Google Play Console la suscripción `blindly_plus` con los planes base `monthly` y `annual`, y el producto único no consumible `blindly_plus_founder_lifetime`. Los identificadores no pueden cambiarse ni reutilizarse después de crearlos.
3. Cargar las claves públicas de plataforma en los entornos EAS y `REVENUECAT_SECRET_KEY` en Supabase.
4. Importar los productos en RevenueCat, asociarlos al entitlement `blindly_plus` y a los paquetes mensual, anual y vitalicio de la oferta `default`.
5. Generar una development build; Expo Go no procesa compras reales.
6. Probar compra, renovación, cancelación, reembolso, restauración, eliminación de cuenta y cambio de dispositivo.
7. Activar `EXPO_PUBLIC_PLUS_READY=true` solo después de completar esas pruebas.

El código de compra está completo y mantiene los cobros desactivados hasta que existan productos reales y una build nativa verificada. Si un invitado tiene Plus activo, la app bloquea el cambio hacia otra cuenta para no separar la compra de su identidad actual; primero debe proteger ese mismo invitado.

## Estado de pruebas internas

El proyecto `Blindly` ya existe en RevenueCat. Su Test Store tiene el entitlement `blindly_plus` y la oferta `default` vinculada al paywall `Blindly Plus`. Los paquetes activos usan `blindly_plus_monthly_launch` por USD 0,99, `blindly_plus_annual_launch` por USD 9,99 y `blindly_plus_founder_lifetime` por USD 24,99. El anual aparece como recomendado y Founder Edition se presenta como precio especial de lanzamiento. Solo el entorno EAS `development` usa la clave pública de Test Store con `EXPO_PUBLIC_PLUS_READY=true`. `preview` y `production` mantienen `EXPO_PUBLIC_PLUS_READY=false` y no contienen claves de RevenueCat hasta disponer de productos reales de plataforma.

Los productos de Test Store anteriores (`monthly`, `yearly` y `lifetime`) permanecen sin ofrecer para conservar el historial de pruebas. RevenueCat no permite modificar el precio ni la duración de un producto ya creado; por eso los precios finales usan identificadores nuevos.

El Test Store no procesa dinero real. Sirve para validar el paywall, la compra simulada, la restauración, el cambio de dispositivo y el bloqueo de funciones premium antes de crear productos en Google Play Console. RevenueCat solo admite su clave `test_` en builds depurables; una build release muestra un error y se cierra deliberadamente. Por eso estas pruebas se hacen con `development`, mientras las copias privadas release de Android o iPhone mantienen Plus desactivado hasta usar una clave real de plataforma.

La clave privada V1 de RevenueCat se usa solo como secreto `REVENUECAT_SECRET_KEY` de Supabase para que `eliminar-cuenta` quite también el perfil de cliente. Nunca se copia al repositorio, a EAS ni a una variable `EXPO_PUBLIC`.

## Configuración nativa Android

El plugin local `plugins/with-revenuecat-android.js` garantiza el permiso `com.android.vending.BILLING` y cambia `MainActivity` a `singleTop`. RevenueCat recomienda `standard` o `singleTop` para que una verificación bancaria en otra aplicación no cancele la compra al volver. `tests/native-config.cjs` inspecciona el manifiesto generado por Expo y bloquea CI si cualquiera de esas condiciones se pierde.

Referencias: [instalación de RevenueCat para React Native](https://www.revenuecat.com/docs/getting-started/installation/reactnative) y [suscripciones de Google Play](https://support.google.com/googleplay/android-developer/answer/140504).
