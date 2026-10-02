# Blindly Plus

Blindly seguirá siendo utilizable sin pagar. La creación y unión a salas, los turnos, las fichas físicas y virtuales y el reparto del pozo forman parte del producto principal.

## Alcance propuesto

Plus incorpora métricas avanzadas, temas premium y la edición de niveles de ciegas y descansos. Mientras `EXPO_PUBLIC_PLUS_READY=false`, estas funciones permanecen abiertas para facilitar el desarrollo y las pruebas; al activar productos reales, RevenueCat controla su acceso. Ninguna de estas funciones impide que un jugador gratuito participe de una mesa, use los modos estándar o administre el pozo.

## Arquitectura de compras implementada

La integración usa RevenueCat sobre las compras nativas de Apple y Google. El entitlement estable es `blindly_plus`. El UUID de Supabase se usa como identificador de cliente para conservar la compra al proteger y recuperar la cuenta. La app ya incluye configuración del SDK, paywall, restauración, administración de suscripción y actualización en vivo del estado del cliente.

Variables públicas previstas:

```dotenv
EXPO_PUBLIC_PLUS_READY=false
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
```

Las claves públicas de plataforma pueden formar parte de la app. Nunca deben incluirse secretos de App Store Connect, Google Play, Stripe, RevenueCat ni `service_role`.

La Edge Function `eliminar-cuenta` también puede borrar el perfil de cliente de RevenueCat. Para activarlo, guardá la clave secreta de API v1 en Supabase como `REVENUECAT_SECRET_KEY`; nunca uses ese secreto como variable `EXPO_PUBLIC`. La eliminación del perfil no cancela la suscripción de la tienda, por lo que la interfaz dirige al usuario a administrarla antes.

## Activación

1. Crear la aplicación y el entitlement `blindly_plus` en RevenueCat.
2. Crear los productos correspondientes en App Store Connect y Google Play Console.
3. Cargar las claves públicas de plataforma en los entornos EAS y `REVENUECAT_SECRET_KEY` en Supabase.
4. Generar una development build; Expo Go no procesa compras reales.
5. Probar compra, renovación, cancelación, reembolso, restauración, eliminación de cuenta y cambio de dispositivo.
6. Activar `EXPO_PUBLIC_PLUS_READY=true` solo después de completar esas pruebas.

El código de compra está completo y mantiene los cobros desactivados hasta que existan productos reales y una build nativa verificada. Si un invitado tiene Plus activo, la app bloquea el cambio hacia otra cuenta para no separar la compra de su identidad actual; primero debe proteger ese mismo invitado.

## Estado de pruebas internas

El proyecto `Blindly` ya existe en RevenueCat. Su Test Store tiene el entitlement `blindly_plus`, una oferta `default` con paquetes mensual, anual y vitalicio, y un paywall `Blindly Plus` vinculado a esa oferta. Los entornos EAS `development` y `preview` usan la clave pública de Test Store y `EXPO_PUBLIC_PLUS_READY=true`; `production` permanece con Plus desactivado y sin claves de tienda.

El Test Store no procesa dinero real. Sirve para validar el paywall, la compra simulada, la restauración, el cambio de dispositivo y el bloqueo de funciones premium antes de crear productos en App Store Connect y Google Play Console. El paywall debe estar publicado en RevenueCat para aparecer en la app interna.

La clave privada V1 de RevenueCat se usa solo como secreto `REVENUECAT_SECRET_KEY` de Supabase para que `eliminar-cuenta` quite también el perfil de cliente. Nunca se copia al repositorio, a EAS ni a una variable `EXPO_PUBLIC`.
