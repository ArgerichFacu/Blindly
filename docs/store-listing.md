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

## Textos localizados para Google Play

### Español (Argentina)

- **Nombre:** Blindly
- **Descripción corta:** Tu mesa de poker presencial, conectada.
- **Descripción completa:** Blindly organiza tus partidas presenciales de Texas Hold’em. Creá una sala, invitá a tus amigos con un código o QR y mantené sincronizados los turnos, las ciegas, los stacks, los pozos y la puntuación. Cada jugador confirma sus propias acciones desde su celular y el dealer reparte el pozo al final de la mano. Podés jugar con fichas físicas o llevarlas de forma virtual. Blindly no reparte cartas, no decide ganadores y no usa dinero real.

### English (United States)

- **Name:** Blindly
- **Short description:** Your in-person poker table, connected.
- **Full description:** Blindly organizes your in-person Texas Hold’em games. Create a room, invite friends with a code or QR, and keep turns, blinds, stacks, pots, and scores in sync. Each player confirms their own actions from their phone, while the dealer awards the pot at the end of the hand. Play with physical chips or track them virtually. Blindly does not deal cards, decide winners, or use real money.

### Português (Brasil)

- **Nome:** Blindly
- **Descrição curta:** Sua mesa de poker presencial, conectada.
- **Descrição completa:** Blindly organiza suas partidas presenciais de Texas Hold’em. Crie uma sala, convide amigos com um código ou QR e mantenha turnos, blinds, stacks, potes e pontuação sincronizados. Cada jogador confirma suas próprias ações pelo celular, enquanto o dealer distribui o pote no fim da mão. Jogue com fichas físicas ou controle tudo virtualmente. Blindly não distribui cartas, não decide vencedores e não usa dinheiro real.

## Notas de la versión 1.0.0

### Español (Argentina)

Primera versión de Blindly. Creá mesas presenciales de 2 a 10 jugadores, invitá por código o QR y sincronizá ciegas, turnos, fichas y puntuación. Cada jugador confirma sus propias acciones y el dealer reparte el pozo. Incluye fichas físicas o virtuales, recuperación de cuenta, tres idiomas y temas de mesa.

### English (United States)

Blindly's first release. Create in-person tables for 2–10 players, invite friends by code or QR, and keep blinds, turns, chips, and scores in sync. Each player confirms their own actions while the dealer awards the pot. Includes physical or virtual chips, account recovery, three languages, and table themes.

### Português (Brasil)

Primeira versão do Blindly. Crie mesas presenciais para 2 a 10 jogadores, convide por código ou QR e sincronize blinds, turnos, fichas e pontuação. Cada jogador confirma suas próprias ações e o dealer distribui o pote. Inclui fichas físicas ou virtuais, recuperação de conta, três idiomas e temas de mesa.

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

El manifiesto del AAB se valida con bundletool. Blindly conserva cámara, red, vibración, pantalla activa, control de audio y Billing porque corresponden a funciones reales; bloquea `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` y `SYSTEM_ALERT_WINDOW`, que llegaban desde dependencias nativas y no se utilizan.

En Windows, `scripts/create-play-console-package.ps1` verifica el hash del AAB aprobado y genera `release/Blindly-1.0.0-play-console-package.zip` con el bundle, los recursos gráficos, los textos localizados, las páginas legales y un manifiesto SHA-256. El ZIP queda fuera de Git porque contiene el binario firmado. Para regenerarlo:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\create-play-console-package.ps1
```

## Pendientes de Play Console

1. Crear una cuenta personal de distribución completa cuando se pueda pagar la tarifa única de USD 25. Google también ofrece distribución limitada gratuita para un máximo de 20 dispositivos, pero ese plan no puede convertirse después en distribución completa y no sirve para el lanzamiento público previsto. Mientras tanto, usar el APK interno de EAS para las pruebas privadas.
2. Definir un correo público de soporte y privacidad.
3. Crear la aplicación `com.blindly.app` y completar acceso, anuncios, clasificación de contenido, público objetivo y seguridad de datos.
   En el cuestionario IARC, declarar de forma exacta la temática de poker y el uso de fichas virtuales; no seleccionar público infantil. Blindly no admite dinero, premios de valor real, anuncios de apuestas ni enlaces a casinos.
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
