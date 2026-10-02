# Ficha de publicación

## Identidad

- Nombre: **Blindly**
- Posicionamiento: herramienta auxiliar para partidas presenciales de cartas
- Descripción corta: **Tu mesa de poker presencial, conectada.**
- Repositorio: https://github.com/ArgerichFacu/Blindly
- Política de privacidad: https://argerichfacu.github.io/Blindly/privacy.html
- Eliminación de cuenta: https://argerichfacu.github.io/Blindly/account-deletion.html
- Términos: https://argerichfacu.github.io/Blindly/terms.html
- Tipo en Google Play: aplicación
- Categoría sugerida: entretenimiento

## Descripción breve

Blindly sincroniza ciegas, turnos, fichas y puntuación para partidas presenciales de Texas Hold’em. Cada jugador participa desde su celular y el dealer entrega el pozo.

## Notas para revisión

Blindly no reparte cartas, no determina manos ganadoras y no procesa dinero real, apuestas ni premios. Las cartas y la decisión del ganador permanecen en la mesa física. La cámara es opcional y solo escanea el QR de la sala; el código también puede ingresarse manualmente.

La app crea una identidad de invitado para sincronizar datos. El usuario puede convertirla en una identidad recuperable con una clave privada sin registrar datos de contacto. La eliminación está disponible en Opciones > Mi cuenta. El email es opcional y su recuperación debe habilitarse únicamente después de configurar SMTP.

## Declaración orientativa de datos

- **Información personal:** nombre elegido e identificador de usuario, necesarios para la cuenta y la funcionalidad de la sala. El email es opcional y se usa únicamente para autenticación y recuperación cuando se habilite SMTP.
- **Actividad de la aplicación:** contenido de sala, acciones, puntuación e historial, necesarios para sincronizar la partida y mostrar resultados.
- **Información financiera:** historial de compras, recopilado por RevenueCat para ofrecer, validar, analizar y restaurar Blindly Plus. No se recopilan números de tarjeta.
- **Cámara:** acceso efímero para escanear un QR; las imágenes no se recopilan ni se comparten.
- **Publicidad, ubicación y seguimiento:** no se usan.
- **Seguridad:** los datos se cifran en tránsito. La eliminación se inicia desde **Opciones > Mi cuenta** o desde el enlace público indicado arriba.

Estas respuestas deben revisarse en Play Console contra el AAB exacto. La declaración debe incluir también cualquier dato que recopilen versiones activas anteriores y cualquier integración futura de RevenueCat.

## Recursos preparados para Google Play

- Ícono: [`assets/store/play-icon.png`](../assets/store/play-icon.png), PNG de 512 × 512, 32 bits con alfa y menos de 1 MB.
- Gráfico de funciones: [`assets/store/play-feature-graphic.png`](../assets/store/play-feature-graphic.png), PNG de 1024 × 500, 24 bits sin alfa.
- Texto alternativo sugerido para el gráfico: **Mesa verde de poker con cuatro celulares sincronizados alrededor de las cartas y las fichas.**
- Capturas: todavía deben obtenerse del APK aceptado. Google Play exige al menos dos; usar PNG de 24 bits o JPEG, entre 320 y 3840 px, sin mostrar datos reales ni funciones inexistentes.

## Pendientes de Play Console

1. Crear una cuenta personal de distribución completa cuando se pueda pagar la tarifa única de USD 25. Google también ofrece distribución limitada gratuita para un máximo de 20 dispositivos, pero ese plan no puede convertirse después en distribución completa y no sirve para el lanzamiento público previsto. Mientras tanto, usar el APK interno de EAS para las pruebas privadas.
2. Definir un correo público de soporte y privacidad.
3. Crear la aplicación `com.blindly.app` y completar acceso, anuncios, clasificación de contenido, público objetivo y seguridad de datos.
4. Cargar el ícono, el gráfico de funciones, al menos dos capturas reales y los textos localizados.
5. Cargar el AAB de producción en una pista interna antes de avanzar a pruebas cerradas o producción.
6. Ingresar la URL pública de eliminación de cuenta y comprobar que el formulario reconoce que Blindly crea cuentas.
7. Crear y vincular los productos de Blindly Plus descritos en [`blindly-plus.md`](blindly-plus.md).

Antes de enviar, revisar estas respuestas contra la build exacta y completar los formularios de Google Play.

## Referencias vigentes

- [Recursos gráficos de la ficha de Google Play](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Distribución completa o limitada de Android](https://support.google.com/android-developer-console/answer/16640817)
- [Formulario de seguridad de datos](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Eliminación de cuentas](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Declaración de datos de RevenueCat](https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety)
