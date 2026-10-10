# Audio, ambiente y reacciones

Pasada Poker Room (2026-10-09). Se conserva la arquitectura existente: `expo-audio`, preferencias locales y entitlement de RevenueCat. Las reacciones suenan únicamente en el celular que las reproduce; no envían mensajes ni modifican la partida.

## Controles y permisos

Config → Sonidos y ambiente tiene silencio global y cuatro canales independientes: música, efectos de ronda, ambiente y reacciones. Los sliders son continuos de 0 a 100; web permite también teclado. Silenciar no borra volúmenes ni selecciones. Los valores se guardan en `preferenciasBlindly` y se conservan tras reabrir.

La música Lobby Time y el ambiente arrancan mediante un botón. El ambiente está apagado por defecto. Se respeta la música elegida para la sala y se mantiene la campana de cambio de nivel, sin repetirla al cargar.

| Pack | Sonidos Free | Sonidos Plus adicionales |
| --- | --- | --- |
| Poker Room | Aplausos, Fichas, Campana | Respeto, Carta al paño, Barajar, All-in, Última ficha |
| Party | Grillos | Bocina, Trombón, Caja registradora |

Los cuatro sonidos Free originales mantienen acceso. Los nuevos son Plus; no se habilitan compras ni cambia el entitlement `blindly_plus`. Plus conserva favoritos, visibilidad y orden. Se respeta el orden/favoritos **dentro de cada pack**. Un orden guardado incorpora los nuevos IDs al final, pero una selección visible guardada no se altera. Al vencer Plus se mantienen los ajustes para restauración y vuelve la selección Free.

## Diseño sonoro

13 WAV originales, PCM mono de 22.050 Hz/16 bits: 12 reacciones de 0,45–1,25 s y un ambiente de 20 s. `node scripts/generar-sonidos.cjs` los reproduce determinísticamente. Los modelos combinan resonancias de fichas, ruido de papel, golpes amortiguados, campana y aplausos sintéticos. No contienen grabaciones humanas ni muestras externas. La música y su atribución CC BY 4.0 permanecen intactas; los WAV se rigen por LICENSE del repositorio.

Se elimina la componente DC, se aplican fundidos cortos y compresión suave de transitorios. La normalización usa RMS de ventanas activas de 20 ms con gate relativo −30 dB: Poker Room −19,58 dBFS; Party −21,41 dBFS para suavizar los sonidos tonales. Picos reales de reacciones entre −17,8 y −9,99 dBFS, por debajo del límite −6 dBFS. Esto es una aproximación técnica al nivel percibido, **no una medición LUFS**. `assets/sounds/niveles.json` registra resultados; los tests recalculan los niveles desde los PCM.

El ambiente mezcla room tone tenue con movimientos espaciados de fichas y cartas. No tiene tragamonedas, voz inteligible ni música. Sus extremos descienden suavemente a cero para que el loop no produzca clics; es deliberadamente más silencioso que las reacciones.

## Interacción y ciclo de vida

Grid de dos columnas, iconografía SVG de una misma familia, escala al presionar y borde champagne durante reproducción. All-in y Última ficha usan un pequeño fondo bordó. Vibración breve opcional: Android Keyboard Tap / iOS Light; en web o segundo plano no vibra.

`useControlAudio` pausa al desenfocar, desmontar, silenciar o pasar al fondo. No reanuda automáticamente al regresar. Invalida `seekTo` pendientes y mantiene una reacción a la vez, con límite de un toque cada 350 ms. Partida pausada/finalizada, volumen cero y audio no cargado bloquean reproducción. Los reproductores se liberan al desmontar.

## Verificación

- `tests/audio.cjs`: preferencias anteriores, mute, expiración, exclusividad, operaciones pendientes, foco/AppState, PCM, duración, picos, fundidos y niveles activos de los 13 WAV.
- `tests/audio-ui.cjs`: cuatro Free/doce Plus, favoritos, orden, visibilidad, expiración, presión, estado de carga y bloqueo por mute/pausa.
- `tests/hapticos.cjs`: opt-in, web, fondo, deduplicación de eventos y motor ausente; toque leve para reacciones/tutorial.
- `tests/volumen-audio-ui.cjs`: gesto, teclado, accesibilidad, cambios externos y volumen apagado.
- Web 320×640: grid y categorías visibles, reacción Fichas sin errores de consola; música 30→31, mute bloquea reproducción, recarga conserva ambos valores y restauración a 30/sin mute.

La aceptación auditiva subjetiva en parlantes/auriculares de un celular y esta nueva vibración leve requieren prueba física de este build. Las pruebas anteriores de música y mesa no certifican estos WAV nuevos. No se añadieron dependencias ni servicios de reproducción en segundo plano.
