# Dirección artística Poker Room

Fecha: 2026-10-09. Repositorio Blindly-release, rama main. Alcance: diseño visual, tutorial inicial y reacciones; sin cambios de reglas, SQL, autenticación, compras ni navegación.

## Resultado de los 20 puntos solicitados

1. **Dirección:** salón de poker presencial de noche, con paño, materiales y luz cálida discreta. Las decoraciones SVG no interceptan toques ni entran en el árbol accesible.
2. **Tokens:** `SALON` en `src/lib/visual.ts`: carbón #0D1011, marfil #F3E8D3, champagne #DCC298, luz #F2E4C7, sombra metal #A58757, bordó #5A1E22, texto bordó #F4CBC7, superficie #151B1A. Tema verde: panel #182320, paño #14382D, borde #294036. Se conservan los temas Plus existentes.
3. **Acentos:** carbón en el fondo; marfil en textos y cartas; champagne en acciones, bordes y MVP. Bordó únicamente en el badge All-in de la lista de jugadores y reacciones All-in/Última ficha. Siempre hay nombre de estado, no solo color.
4. **Home:** fondo profundo, hero de paño con cartas/fichas decorativas tenues, Crear partida champagne con gradiente y relieve, Unirme secundario. La estructura y datos reales se conservan; sin nuevas secciones de relleno.
5. **Ligas:** escudo de club, placa de temporada, miembros separados y MVP destacado en `ResumenClub`; superficies compartidas en Home/Ligas y sheets. No se inventaron rankings de producción.
6. **Perfil:** encabezado de tarjeta de jugador con icono de cartas, línea divisoria, avatar y datos existentes. Se mantiene la corrección de descendentes y de la marca Blindly.
7. **Onboarding:** cuatro pasos: cartas físicas, mini mesa, práctica y continuidad/MVP. Progreso accesible, retroceso, omisión y repetición desde Guía rápida. La duración de 30–45 s es una intención de diseño, no una prueba cronometrada con usuarios.
8. **Práctica:** Call/Igualar 200 local; stack 10.000→9.800 y pozo 1.500→1.700. Fichas animadas, feedback leve opcional y siguiente habilitado después de probar. Sin RPC/partidas reales. Fold/Subir indican la acción guiada. Ranking final explícitamente de ejemplo.
9. **Reacciones:** nombre público Reacciones de mesa, SVG consistente, dos columnas, presión/reproducción visibles, haptic leve opcional y packs separados. Se conserva la arquitectura y control de reproducción.
10. **Packs:** Poker Room: Aplausos, Fichas, Campana, Respeto, Carta al paño, Barajar, All-in, Última ficha. Party: Grillos, Bocina, Trombón, Caja registradora. Free conserva sus cuatro sonidos; ocho extras Plus. Orden y favoritos dentro de cada pack.
11. **Normalización:** DC/fundidos/compresión suave + RMS activo de 20 ms; −19,58 dBFS Poker Room y −21,41 Party. Picos por debajo de −6 dBFS. Medición reproducible, no LUFS certificado ni aceptación auditiva humana. [Detalle](audio.md).
12. **Ambiente:** 20 s de room tone con actividad tenue de fichas/papel, loop con extremos suavizados. Sin tragamonedas ni voces grabadas.
13. **Sliders:** cuatro canales, 0–100 continuo, mute conserva valores y preferencias persistidas. Verificado también con teclado web y recarga.
14. **Assets:** cuatro WAV nuevos (carta/barajar/allin/bust), nueve WAV revisados (incluye ambiente/campana), reporte niveles.json e iconos SVG nuevos. Música/logo existentes conservados. Síntesis original reproducible y licencia documentada.
15. **Dependencias:** ninguna nueva. Se reutilizan React Native, Expo Audio/Haptics y react-native-svg.
16. **16 KB:** no cambian binarios ni librerías nativas. Esta pasada no demuestra ejecución ARM64/16 KB; sigue pendiente la validación física del bloque anterior. Exportar JavaScript no sustituye esa prueba ni compilar/instalar un APK actualizado.
17. **Tests:** suite completa incluida práctica, persistencia nueva/anterior, ES/EN/PT, reglas/permisos de mesa, ligas, auth, compras, deep links, Back, reacciones/mute, límites, niveles y sliders. Los mocks no sustituyen dispositivos reales ni una partida de producción.
18. **Typecheck:** `npm run typecheck` sin errores.
19. **Lint:** `npm run lint` sin errores.
20. **CI:** push a main con commit demo y comprobación del workflow Verificar Blindly antes de entregar. El enlace y resultado de la ejecución final se informan en la entrega.

## Jerarquía y accesibilidad

Fondo (sin sombra), superficies suaves/configuración (`RELIEVE.bajo`), cards (`panel`), hero (`protagonista`) y sheets (`modal`, sombra hacia arriba). Gradientes discretos y luz de fondo limitada; fibras/cartas solo en paño, sin blur ni imágenes grandes. La tipografía de controles sigue siendo del sistema.

Tutorial usa reducción de movimiento del SO, controles accesibles, zonas táctiles de al menos 44 px y anuncios de pozo/cambio de estado. Vibración opcional y audio sin autoplay. Finalización anterior `blindly.inicio.v1` conserva su estado: no vuelve a abrir el tutorial tras actualizar. Repetir la guía no altera esa persistencia ni la identidad.

## Revisión manual y límites

Revisado en navegador integrado a 360×800 y 320×640: Home, Perfil sin recorte de “Jugador”, Ligas vacías, Config, reacciones y cuatro pasos del tutorial. Igualada habilita siguiente y conserva fichas; salida devuelve a Config; mute deshabilita música/ambiente/reacciones; recarga mantiene volumen 31 y mute, luego restaurados a 30 y desmuteado. La cuenta de QA no tiene una liga activa: MVP/temporadas/sheet con datos se verifican mediante sus pruebas y revisión de componentes, no se presenta como una nueva prueba de producción.

Capturas locales: `C:/Users/facun/Downloads/Blindly-poker-room/` (home, cartas, igualada, perfil, reacciones). No se suben datos privados de la cuenta ni capturas al repositorio.

Esta pasada queda en el código fuente. Los APK/AAB v14 ya entregados no incorporan estos cambios: un build posterior debe incluir este commit. No se activa Plus ni se publica en tiendas en este bloque.
