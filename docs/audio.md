# Pack oficial de release — Android

La botonera conserva expo-audio, control exclusivo, haptics y preferencias existentes. El catálogo se reduce de 18 a 12 sonidos oficiales, todos Free. No se incorpora ninguna dependencia móvil ni se modifican permisos o binarios nativos.

## Catálogo y licencias

| Sonido / archivo | Duración | Fuente original | Licencia | Nivel K / pico (dB) |
| --- | ---: | --- | --- | ---: |
| Fichas · `fichas.wav` | 1.90 s | [AnikadeBeer_231312: Throwing poker chips on a wooden table SFX](https://freesound.org/people/AnikadeBeer_231312/sounds/707910/) | CC0-1.0 | -23.00 / -4.15 |
| Barajar · `barajar.wav` | 1.80 s | [Kenney: Casino Audio: card-shuffle](https://kenney.nl/assets/casino-audio) | CC0-1.0 | -23.69 / -3.00 |
| Carta al paño · `carta.wav` | 0.56 s | [Kenney: Casino Audio: card-place-1](https://kenney.nl/assets/casino-audio) | CC0-1.0 | -24.81 / -3.00 |
| Aplausos · `aplausos.wav` | 3.00 s | [Sclolex: small_applause.wav](https://freesound.org/people/Sclolex/sounds/261617/) | CC0-1.0 | -23.00 / -10.86 |
| Sorpresa · `sorpresa.wav` | 1.70 s | [deleted_user_2104797 (Adam_N): Crowd shock.wav](https://freesound.org/people/deleted_user_2104797/sounds/324898/) | CC0-1.0 | -23.00 / -10.95 |
| Bocina · `bocina.wav` | 1.60 s | [goose278: air horn close and loud.WAV](https://freesound.org/people/goose278/sounds/174819/) | CC0-1.0 | -23.00 / -15.28 |
| Grillos · `grillos.wav` | 3.00 s | [felix.blume: Cricket in the desert (close recording)](https://freesound.org/people/felix.blume/sounds/166176/) | CC0-1.0 | -23.00 / -6.92 |
| Trombón · `trombon.wav` | 4.95 s | [kirbydx: wah wah sad trombone.wav](https://freesound.org/people/kirbydx/sounds/175409/) | CC0-1.0 | -23.00 / -11.60 |
| Redoble · `bateria.wav` | 4.73 s | [bigjoedrummer: buzz roll.wav](https://freesound.org/people/bigjoedrummer/sounds/77305/) | CC0-1.0 | -23.00 / -7.18 |
| Risa · `risa.wav` | 2.65 s | [deleted_user_2104797: Crowd laugh.wav](https://freesound.org/people/deleted_user_2104797/sounds/324894/) | CC0-1.0 | -23.00 / -11.89 |
| Buzzer · `buzzer.wav` | 1.10 s | [scarfield: door_buzzzzer.aif](https://freesound.org/people/scarfield/sounds/52004/) | CC0-1.0 | -23.00 / -9.89 |
| Cuac · `pato.wav` | 1.04 s | [gibarroule: Duck Quack](https://freesound.org/people/gibarroule/sounds/365133/) | CC0-1.0 | -23.00 / -8.59 |

CC0 permite distribución comercial sin atribución obligatoria; se mantienen los autores y enlaces. Freesound se obtuvo de previews HQ MP3, no se presenta como lossless. Las cartas Kenney proceden de Casino Audio y su licencia incluida. `fuentes.json` registra hashes originales, URL, corte y atribución; `niveles.json` registra duración y SHA-256 de cada WAV. No hay assets de Discord, películas, juegos ni memes extraídos.

## Cambios respecto de v16/v17

- Fichas: grabación de varias fichas lanzadas sobre mesa de madera, sustituyendo chips-handle de Kenney. No se afirma que el material de la mesa sea paño.
- Risa: pequeña audiencia humana, sustituyendo una risa individual breve.
- Buzzer: zumbador físico de puerta grabado, sustituyendo síntesis propia. Su adecuación como reacción de error requiere escucha.
- Batería: en v22 se reemplaza el rimshot rechazado por un redoble acústico de caja que termina en rimshot (bigjoedrummer, micrófono SONY/iRiver H340). Se presenta como Redoble; no como ba-dum-tss completo.
- Bocina: corte comienza en 2,5 s, donde está el airhorn; la versión anterior recortaba principalmente el ruido previo.
- Trombón: frase a velocidad original, hasta 4,95 s; se elimina la aceleración 3,7×.
- Aplausos/grillos/sorpresa/barajar: cortes más largos; carta mantiene carácter breve. Cuac v22 usa una nueva grabación de pato real con micrófono Sennheiser/H4N Zoom, normalizada desde un nivel original muy bajo.
- Se retiran del catálogo Campana, Caja registradora, Respeto, All-in, Última ficha y Toque del dealer. Campana permanece como aviso de ronda fuera de la botonera.

## Producción

PCM WAV mono 22.050 Hz/16 bits; máximo 5 s. Trimming inicial, eliminación de DC y fades 3/25 ms. Compresión moderada 3:1, umbral 0,08, ataque 0,5 ms y release 50 ms; sin cambio de tempo, pitch ni síntesis. Normalización K ponderada con objetivo −23 LUFS y techo de pico muestral −3 dBFS. Los transitorios de cartas limitan su ganancia; se muestran mediciones reales, no un nivel ficticio idéntico.

La medición usa pyloudnorm con ventana 400 ms; para clips de menos de 400 ms usa 200 ms y es una aproximación para clips breves, no una certificación EBU estándar. La consistencia percibida, ruido y calidad deben aprobarse escuchando todos los sonidos en el teléfono. No se afirma que esa escucha haya ocurrido sólo por pasar tests.

Reproducción de assets (herramientas offline fuera de la app):

```powershell
$env:PYTHONPATH = 'G:/Blindly/herramientas/audio-python'
python scripts/master-sonidos.py <ffmpeg-7.1.exe> <carpeta-fuentes>
```

Dependencias de edición: numpy, scipy y pyloudnorm instalados en G:/Blindly/herramientas/audio-python. No se incluyen en Android. El importador anterior se retira para impedir la regeneración con aceleración histórica; generar-sonidos.cjs sólo conserva el ambiente existente.

## Uso y QA

Buscador por nombre traducido (ignora mayúsculas/tildes), Recientes (4 IDs únicos, último uso primero), Favoritos y Todos los sonidos. Preferencias persistidas; favoritos Free, orden/visibilidad Plus. Se descartan IDs retirados al cargar sin borrar preferencias de otros canales. No se implementa carga/grabación de sonidos de liga en este bloque: 3/usuario y 10/liga no se presentan como funcionales ni testeados.

Grid fijo de 2 columnas, ancho relativo al contenedor real para evitar que el redondeo del cálculo en Android envíe cada botón a una fila. Los reproductores de Todos los sonidos permanecen montados al buscar; no se crea un player en el handler. Preload downloadFirst, isLoaded y seekTo(0) existentes. No hay medición tap-audio física en milisegundos. Cooldown global 350 ms; una reacción reemplaza la anterior, sin cola. Blur, fondo, mute, canal apagado y pausa detienen/bloquean reproducción. No hay reproducción automática al volver.

Tests cubren cada asset, hashes, duración, PCM, onset, fades, picos, preferencias antiguas, recencia/deduplicación, búsqueda traducida, acceso Free/Plus, expiración, mute, exclusividad, seek pendiente, taps rápidos, foreground y sliders. Estado de hardware, escucha, publicación y artefactos: [release final](release-final.md).

La campana de cambio de ronda permanece fuera del catálogo: TRP, “220516 desk bell rings”, CC0-1.0; fuente y hash en `fuentes-avisos.json`. Ambiente original y música Lobby Time mantienen su atribución previa.

## Ajustes tras escucha del A32 — v22

El usuario rechazó Rimshot y Cuac de v21. Ambos se reemplazan; el usuario aprobó Redoble y Cuac en el A32 instalado con v22. El resto del pack no cambia. Cada botón incorpora un corazón independiente de 44 dp para añadir/quitar favoritos sin disparar audio, incluso silenciado. Corazón relleno y estado accesible seleccionado identifican favoritos. Se elimina la lista duplicada de botones grandes para favoritos; los controles de orden/visibilidad sólo aparecen en Plus. Se mantienen dos columnas y cuatro recientes.
