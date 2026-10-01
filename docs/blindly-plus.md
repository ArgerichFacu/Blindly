# Blindly Plus

Blindly seguirá siendo utilizable sin pagar. La creación y unión a salas, los turnos, las fichas físicas y virtuales y el reparto del pozo forman parte del producto principal.

## Alcance propuesto

Plus puede incorporar estadísticas avanzadas, temas y ambientaciones premium, presets ilimitados y herramientas adicionales para hosts frecuentes. Ninguna de estas funciones debe impedir que un jugador gratuito participe de una mesa.

## Arquitectura de compras

La integración prevista usa RevenueCat sobre las compras nativas de Apple y Google. El entitlement estable es `blindly_plus`. El UUID de Supabase debe usarse como identificador de cliente para conservar la compra al recuperar la cuenta.

Variables públicas previstas:

```dotenv
EXPO_PUBLIC_PLUS_READY=false
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
EXPO_PUBLIC_REVENUECAT_WEB_KEY=
```

Las claves públicas de plataforma pueden formar parte de la app. Nunca deben incluirse secretos de App Store Connect, Google Play, Stripe, RevenueCat ni `service_role`.

## Activación

1. Crear la aplicación y el entitlement `blindly_plus` en RevenueCat.
2. Crear los productos correspondientes en App Store Connect y Google Play Console.
3. Instalar `react-native-purchases` y `react-native-purchases-ui` mediante Expo.
4. Configurar el SDK con la clave específica de cada plataforma y el UUID autenticado de Supabase.
5. Implementar compra, restauración y actualización del estado de cliente.
6. Generar una development build; Expo Go no procesa compras reales.
7. Probar compra, renovación, cancelación, reembolso, restauración y cambio de dispositivo.
8. Activar `EXPO_PUBLIC_PLUS_READY=true` solo después de completar esas pruebas.

La pantalla actual presenta el producto y mantiene los cobros desactivados hasta que existan productos reales y una build nativa verificada.
