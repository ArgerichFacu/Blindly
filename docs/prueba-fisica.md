# Prueba física de aceptación

Usá el [APK preview final de Blindly 1.0.0](https://expo.dev/artifacts/eas/gMvdiijTDFWPn-ieGNCcx6L72TUeZMKDvx7cOffhK-c.apk). Su SHA-256 es `65216DAD2837E7E2882D5B94B68815495BDCCB86085FCB1A7AD664B87227F85E`; verificá ese valor si descargaste más de una build. Este APK mantiene Plus desactivado y permite probar el juego completo sin cobros. Para una prueba completa hacen falta al menos tres celulares Android conectados a Internet.

En Windows, `scripts/android-device-test.ps1` valida que el APK sea exactamente la build aprobada, detecta un teléfono autorizado, instala y abre Blindly, y guarda una captura junto con los datos del dispositivo en `release/device-tests/`. Conectá un solo teléfono, activá **Opciones de desarrollador > Depuración USB**, aceptá la huella RSA y ejecutá:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\android-device-test.ps1
```

Podés indicar otra herramienta o archivo con `-AdbPath` y `-ApkPath`. `-ValidateOnly` comprueba el hash y ADB sin acceder a ningún dispositivo; `-SkipInstall` vuelve a abrir una instalación existente.

## 1. Instalación y arranque

1. Instalá el mismo APK en todos los celulares.
2. Cerrá Blindly por completo y abrila desde el ícono.
3. Confirmá que el splash muestre el logo sobre `#0A1713`, sin un fondo blanco intermedio.
4. Cambiá el tema a rojo y negro: el logo del menú debe adaptarse y no conservar un recuadro verde.

## 2. Identidad recuperable

1. En el primer celular, entrá como invitado y generá una clave desde **Mi cuenta**.
2. Guardá la clave fuera de la app y cerrá sesión.
3. Recuperá la cuenta con esa clave en otro celular.
4. Verificá que el UUID, los puntos y el historial sean los mismos.
5. Rotá la clave y comprobá que la anterior deje de funcionar.

## 3. Mesa y reconexión

1. Creá una sala, uní los otros celulares por código o QR y elegí fichas virtuales.
2. Confirmá dealer fijo, rotación de BTN/SB/BB e indicador visible del turno.
3. Desde cada celular ejecutá pasar, igualar, subir, retirarse y all-in cuando corresponda.
4. Comprobá que un jugador no pueda actuar fuera de turno ni modificar stacks; verificá que esa corrección solo aparezca y funcione en el celular del dealer.
5. Activá modo avión en el jugador de turno durante al menos diez segundos y volvé a conectarlo.
6. Confirmá que la app indique la desconexión, recupere el estado real y no duplique apuestas.
7. Repetí bloqueando y desbloqueando el teléfono.
8. Cerrá la mano desde el dealer, repartí todos los pozos y verificá la conservación total de fichas.
9. Repetí una mano con fichas físicas: cada jugador declara su acción y el dealer supervisa los stacks, cierra la mano y entrega el pozo.

## 4. Audio

1. Reproducí **Lobby Time** y enviá la app a segundo plano.
2. Confirmá que la música se detenga al bloquear, cambiar de aplicación, pausar la partida o abandonar la mesa.
3. Volvé a Blindly y confirmá que la música no se reinicie sola; la reanudación debe ser manual.
4. Avanzá un nivel de ciegas y verificá campana y vibración si están habilitadas.

## 5. Puntuación

1. Finalizá un torneo de tres o más jugadores.
2. Confirmá la escala de puntos correspondiente y que un segundo cierre no duplique el resultado.
3. Cada usuario debe ver únicamente su historial. Al compartir otra sala, los jugadores solo deben ver su rango dentro de esa mesa.

## 6. Blindly Plus con Test Store

Esta sección requiere la [build `development` depurable](https://expo.dev/artifacts/eas/cO1utrQC2gAeLE63VkH1TfjxUIe-O-5DDPS4nsYguUM.apk), SHA-256 `9C3CD74DBC14724A173FBF14D4944589B1E6B814A33758D103AC0737CC6EAA8E`. No uses una APK `preview`: RevenueCat bloquea las claves Test Store en cualquier build release. El APK preview mantiene Plus desactivado y sirve para validar todo el juego sin compras.

1. Abrí **Blindly Plus** y mostrá el paywall publicado.
2. Confirmá que el paywall muestre mensual a USD 0,99, anual a USD 9,99 como recomendado y Founder Edition vitalicia a USD 24,99 como precio especial de lanzamiento.
3. Realizá una compra simulada de cada plan en pruebas separadas y verificá que los tres concedan el mismo entitlement `blindly_plus`.
4. Verificá métricas avanzadas, temas rojo/negro y estructuras personalizadas.
5. Reinstalá la app o usá otro dispositivo, recuperá la misma identidad y ejecutá **Restaurar compras**.
6. Verificá que otra identidad sin entitlement no herede Plus.
7. Administrá o cancelá la compra simulada y comprobá que la app actualice el acceso.

## Criterio de aceptación

La versión preview se acepta cuando todas las pruebas anteriores terminan sin bloqueos, duplicaciones, pérdida de identidad ni diferencias de estado entre celulares. Registrá modelo, versión de Android y resultado de cada dispositivo para poder reproducir cualquier falla.
