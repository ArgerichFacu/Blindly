# Audio, ambiente y botonera

Implementación de metas 7, 8, 9 y 35 de la próxima versión. Los APK/AAB de la release anterior no contienen este bloque: se necesita un nuevo build antes de probarlo en celulares.

## Uso

Opciones → Sonidos y ambiente permite silenciar todo y activar/desactivar por separado música, efectos de ronda, ambiente y botonera. Cada canal conserva su volumen (0–100 %, pasos de 10 %), aunque se silencie. Las preferencias se guardan localmente en `preferenciasBlindly`; no viajan a Supabase. Las preferencias anteriores de campana, música, idioma y modo principiante se preservan, incluso si se toca un control antes de terminar la carga inicial.

La música Lobby Time y el ambiente se inician con un botón. El ambiente está apagado por defecto y combina fichas, cartas y ruido de salón suave. En la mesa, la configuración de música de la sala sigue siendo respetada. La campana señala cambios de nivel; no se repite al cargar una pantalla. La botonera aparece en su propia sección durante una partida, con reacciones locales: suenan en el celular de quien toca el botón, sin mensajes de Realtime ni eco en los otros teléfonos.

Free incluye aplausos, fichas, grillos y campana. Plus agrega bocina, trombón, caja registradora y respeto, además de favoritos, selección de sonidos y orden. Los favoritos aparecen primero; dentro de cada grupo se respeta el orden elegido. El acceso depende exclusivamente de `PlusContext.activo`, el entitlement de RevenueCat existente. Tener compras deshabilitadas no desbloquea estos extras. Al vencer Plus, vuelve la selección Free, pero los ajustes premium se conservan para una futura restauración. No hay carga de MP3 ni grabaciones del micrófono.

## Ciclo de vida y recursos

`useControlAudio` pausa todos los reproductores al desenfocar, desmontar, silenciar o pasar a segundo plano. Al volver no reanuda automáticamente. Invalida los `seekTo` pendientes para que no aparezcan sonidos después de salir. La botonera mantiene una reacción a la vez y limita los toques a uno cada 350 ms; no acumula una cola. Pausar/finalizar la partida también impide reproducción. Expo libera los reproductores creados con `useAudioPlayer` al desmontar.

Se conserva Expo SDK 57 y `expo-audio` 57.0.5. Sesión con `shouldPlayInBackground: false`; no se habilitan servicios de reproducción en fondo ni permisos de grabación. La configuración nativa se mantiene intacta. Referencia: [documentación versionada](https://docs.expo.dev/versions/v57.0.0/sdk/audio/).

Los ocho WAV nuevos son síntesis original reproducible con `node scripts/generar-sonidos.cjs`, sin muestras externas. Total aproximado: 1,37 MB. Volúmenes y picos acotados, fundidos en extremos del loop. La atribución CC BY 4.0 de Lobby Time continúa en Créditos y `assets/sounds/LICENSE.md`; los WAV se rigen por LICENSE del repositorio.

## Verificación

- `tests/audio.cjs`: compatibilidad de preferencias, normalización, mute, expiración sin borrar datos, reproducción exclusiva, cancelación de operaciones pendientes, AppState/foco y estructura/picos/bordes de los ocho WAV.
- `tests/audio-ui.cjs`: UI real compilada con dobles de SDK, cuatro sonidos Free/ocho Plus, compras deshabilitadas sin desbloqueo, favoritos, visibilidad, orden y expiración.
- `tests/principiante.cjs`: persistencia conjunta de idioma, ayuda y audio, incluyendo cambios previos a la hidratación.
- Suite completa, TypeScript, lint, traducciones ES/EN/PT y exportación de bundles Android/iOS/web.

Aceptación física pendiente: reproducir música + ambiente, mover cada volumen, probar mute y fondo/bloqueo de pantalla/cambio de vista durante un sonido, llamada/interrupción de audio, desconectar auriculares y verificar que no se reanuda solo. Evaluar percepción y volumen del ambiente en una mesa real. Para Plus, verificar compras/restauración/expiración con configuración comercial y dispositivos reales; los dobles no sustituyen esa prueba.

Validación web del bloque (2026-10-08): reproducción manual del ambiente, mute detiene el loop y desactiva música/reacciones, persistencia después de recargar, desmutear no reinicia sonidos, reacción Free reproducible y sin overflow horizontal a 360 px. Captura local de QA: `release/sonidos-movil.jpg` (ignorada por Git).
