# Reacciones de mesa: Poker Room / Party

Pasada del 2026-10-11. Se mejora la botonera existente sin cambiar la arquitectura: expo-audio, preferencias locales, controlador exclusivo y capacidades de Plus. Las reacciones suenan en el dispositivo que las dispara; no alteran apuestas ni envían eventos a otros jugadores. No se habilitan compras ni carga de audios personalizados.

## Inventario y acceso

Se encontraron 12 reacciones sintéticas: Aplausos, Fichas, Grillos, Campana, Bocina, Trombón, Caja registradora, Respeto, Carta al paño, Barajar, All-in y Última ficha. Se reemplazaron once por muestras CC0: todas salvo Caja registradora. Se incorporaron seis: Cuac, Ba dum tss, Toque del dealer, Sorpresa, Risa y Buzzer. Total: 18 reacciones.

Free mantiene sus cuatro sonidos anteriores y suma Barajar. Plus permite el catálogo completo, favoritos, orden y visibilidad, sin modificar RevenueCat ni el entitlement blindly_plus. Un orden guardado incorpora los nuevos IDs al final; una selección visible guardada se respeta. Quien ya personalizó Plus puede mostrar los nuevos sonidos desde Config → Sonidos y ambiente. Al expirar Plus los ajustes se conservan y reaparecen los cinco Free.

## Poker Room

| Reacción | Acceso | Duración | Fuente y licencia |
| --- | --- | --- | --- |
| Fichas | Free + Plus | 0.57 s | [Kenney: Casino Audio: chips-handle-1](https://kenney.nl/assets/casino-audio) · CC0-1.0 |
| Barajar | Free + Plus | 1.20 s | [Kenney: Casino Audio: card-shuffle](https://kenney.nl/assets/casino-audio) · CC0-1.0 |
| Carta al paño | Plus | 0.56 s | [Kenney: Casino Audio: card-place-1](https://kenney.nl/assets/casino-audio) · CC0-1.0 |
| Aplausos | Free + Plus | 1.15 s | [Sclolex: small_applause.wav](https://freesound.org/people/Sclolex/sounds/261617/) · CC0-1.0 |
| Campana | Free + Plus | 1.10 s | [TRP: 220516 desk bell rings](https://freesound.org/people/TRP/sounds/717564/) · CC0-1.0 |
| Sorpresa | Plus | 1.00 s | [deleted_user_2104797 (Adam_N): Crowd shock.wav](https://freesound.org/people/deleted_user_2104797/sounds/324898/) · CC0-1.0 |
| Toque del dealer | Plus | 0.35 s | [Kenney: Impact Sounds: impactWood_light_000](https://kenney.nl/assets/impact-sounds) · CC0-1.0 |
| All-in | Plus | 0.35 s | [Kenney: Casino Audio: chips-collide-1](https://kenney.nl/assets/casino-audio) · CC0-1.0 |
| Respeto | Plus | 0.40 s | [Kenney: Impact Sounds, dos golpes de madera](https://kenney.nl/assets/impact-sounds) · CC0-1.0 |
| Última ficha | Plus | 0.35 s | [Kenney: Casino Audio: chip-lay-1](https://kenney.nl/assets/casino-audio) · CC0-1.0 |

## Party

| Reacción | Acceso | Duración | Fuente y licencia |
| --- | --- | --- | --- |
| Grillos | Free + Plus | 1.10 s | [felix.blume: Cricket in the desert (close recording)](https://freesound.org/people/felix.blume/sounds/166176/) · CC0-1.0 |
| Bocina | Plus | 0.75 s | [goose278: air horn close and loud.WAV](https://freesound.org/people/goose278/sounds/174819/) · CC0-1.0 |
| Trombón | Plus | 1.35 s | [kirbydx: wah wah sad trombone.wav](https://freesound.org/people/kirbydx/sounds/175409/) · CC0-1.0 |
| Ba dum tss | Plus | 1.40 s | [DJczyszy: Ba Dum Tss! (classic edition)](https://freesound.org/people/DJczyszy/sounds/431811/) · CC0-1.0 |
| Risa | Plus | 0.83 s | [amoyssiadis: short female laugh chuckle giggle](https://freesound.org/people/amoyssiadis/sounds/397673/) · CC0-1.0 |
| Cuac | Plus | 0.39 s | [OwennewO: Duck Quack](https://freesound.org/people/OwennewO/sounds/719111/) · CC0-1.0 |
| Buzzer | Plus | 0.40 s | Síntesis original de Blindly · MIT del repositorio |
| Caja registradora | Plus | 0.85 s | Síntesis original de Blindly · MIT del repositorio |

## Producción, normalización y licencias

Las muestras de Freesound proceden de las vistas previas HQ MP3 publicadas por los autores; no se presentan como fuentes lossless. Kenney se importó desde los OGG de sus paquetes oficiales Casino Audio 1.1 e Impact Sounds 1.0. Todas las páginas individuales y ambas licencias Kenney indican CC0, compatible con redistribución comercial. Se incluyen las licencias Kenney en assets/sounds/LICENCIA-Kenney-*.txt. No se usaron archivos de Discord, videojuegos ni memes de origen desconocido.

assets/sounds/fuentes.json registra autor, título, URL, licencia, archivo original usado, SHA-256 y parámetros de edición de cada grabación. Las dos reacciones originales (Caja registradora y Buzzer) se generan en scripts/generar-sonidos.cjs y se distribuyen bajo LICENSE (MIT). El ambiente sintético y la atribución de la música Lobby Time permanecen intactos.

Edición: inicio silencioso eliminado, corte de reacción, filtrado 65–9500 Hz, eliminación de DC y fundidos de 3 ms/25 ms. Trombón conserva la frase acelerándola sin cambiar tono (atempo 2 × 1,85); Ba dum tss usa atempo 1,35 y una cola corta. Se aplica compresión suave de transitorios y normalización por RMS de ventanas activas de 20 ms, gate relativo −30 dB: Poker Room −19,58 dBFS; Party −21,41 dBFS para mantener la bocina controlada. Es una aproximación al nivel percibido, no una certificación LUFS. Los tests recalculan niveles y picos desde los PCM; niveles.json conserva las mediciones.

Formato final: WAV PCM mono, 22.050 Hz, 16 bits. Las 18 reacciones pesan aproximadamente 0,62 MB; incluyendo el ambiente de 20 s, los 19 WAV suman 1,50 MB decimales. Picos de reacciones inferiores a −6 dBFS. Todas tienen señal audible en los primeros 50 ms, duración 0,35–1,40 s y extremos fundidos.

Reproducción de assets (herramientas de edición fuera de la app):

```powershell
node scripts/generar-sonidos.cjs
node scripts/importar-sonidos-naturales.cjs <ffmpeg-7.1.exe> <carpeta-de-fuentes>
```

El generador conserva grabaciones CC0 y el ambiente existente. El importador exige que los hashes de las fuentes coincidan; FFmpeg es una herramienta offline, no una dependencia móvil. Las fuentes originales se guardan fuera de Git y sólo se versionan WAV finales y procedencia.

## Interacción y ciclo de vida

Botones horizontales, SVG del sistema visual, nombre legible y label accesible (incluye Plus cuando corresponde). Dos columnas en móvil o con texto grande; tres si el área útil alcanza 390 px y fontScale ≤ 1,2. Poker Room y Party se pueden plegar. Se conserva el orden y favoritos dentro de cada pack.

Al presionar: escala 0,97; un toque aceptado dispara pulso champagne de 200 ms, audio y haptic discreto opcional en el mismo handler. Se respeta la preferencia hapticos: Android Keyboard Tap / iOS Light; web, fondo y dispositivos sin motor no fallan. La animación usa React Native Animated y se cancela al desmontar.

Los players locales se preparan al montar con useAudioPlayer (downloadFirst, actualización de estado 100 ms), no al tocar. Las categorías plegadas conservan sus players; al salir se liberan mediante el hook existente. Los botones esperan isLoaded. No se promete una latencia física medida: seekTo(0) sigue protegido frente a navegación y cambios de estado.

Una sola reacción a la vez; el nuevo toque reemplaza la anterior. Cooldown global de 350 ms, sin cola. Volumen cero, silencio global, canal apagado, partida pausada/finalizada o audio no cargado bloquean el handler. La música, efectos y ambiente mantienen canales separados y sliders 0–100. El controlador pausa en blur/unmount/background y bloquea reanudación automática al volver.

## Verificación y límites

- tests/audio.cjs: compatibilidad de preferencias, Free/Plus/expiración, volumen, exclusividad, seek pendiente, foco y AppState; formato PCM, cada asset, duración, comienzo audible, fundidos, picos y nivel activo.
- tests/audio-ui.cjs: permisos, favoritos/orden/visibilidad, cinco Free y 18 con Plus, cada reacción, haptic/pulso del mismo toque, ráfagas, estados disabled y layout responsive; plegar conserva los players.
- tests/hapticos.cjs y tests/volumen-audio-ui.cjs: configuración, motor ausente, sliders, teclado, sincronización y mute.
- npm test, npm run typecheck y npm run lint aprobados. React Compiler transforma Botonera en aproximadamente 0,5 s.
- Web 360×760: cinco Free, SVG y texto sin cortes; tocar Fichas/Grillos sin errores de consola; mute bloquea Fichas; slider Reacciones 50→51→50; plegar/abrir Poker Room funciona. Se restauran los valores originales. Captura local en G:/Blindly/evidencias/botonera/web-360.png.
- Android x86_64: assembleDebug aprobado; instalación separada com.blindly.app.audioqa aprobada en AVD Android 16, conservando com.blindly.app y sus datos. Metro inicialmente quedó sin responder; se recuperó limpiando caché. La ejecución de reacciones en Android no se da por aprobada: la reconexión por ADB fue rechazada por la revisión automática, sin motivo específico. No hay dispositivo físico conectado.
- iOS: no hay Mac/simulador/iPhone disponible en este entorno Windows. La exportación de bundles se comprueba adicionalmente en CI.

No se agregan dependencias de la app, código nativo, permisos, librerías .so ni servicios. Esta pasada no cambia la alineación de páginas de 16 KB; tampoco certifica el pendiente anterior ARM64/16 KB en hardware real. La exportación iOS no equivale a prueba en iPhone. La escucha subjetiva y vibración en celular real requieren el nuevo build.
