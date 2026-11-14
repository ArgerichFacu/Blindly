# Rebranding · Fase 0 — Inventario (13/11/2026)

Relevamiento sobre `main` (`15c261e`, versión 1.39). No se cambió nada.

## Temas y colores
- **Temas:** `src/lib/temas.ts` define 3 paletas (`verde`, `rojo`, `negro`) con 9 campos: `fondo`, `fondoTarjeta`, `acento`, `acentoTexto`, `textoSuave`, `textoFuerte`, `error`, `borde`, `pano`. `rojo` y `negro` son Plus. `src/lib/TemaContext.tsx` aplica el tema y vuelve al verde si un Free confirmado tenía uno Plus (sin borrar la selección guardada).
- **Segunda fuente de color:** `src/lib/visual.ts` (`SALON`: carbón, marfil, champagne, oro luz/sombra, bordó; y `RELIEVE`: 4 sombras). No depende del tema: el dorado y sus brillos son iguales en los tres.
- **Colores sueltos:** 43 literales en 14 archivos fuera de `temas.ts` (30 hex distintos). Los principales: `visual.ts` (12), `MesaAsientos.tsx` (9: colores fijos de fichas y dealer), `CartaPoker.tsx` (7: papel y tinta de las cartas), `identidadClub.ts` (4).
- **La mesa:** `#283740` es el `pano` del tema negro (el brief lo cita como `#293740`). `MesaAsientos.tsx` pinta fichas y botones con colores fijos (`#111827`, `#FBBF24`, `#2563EB`, `#94A3B8`…) que no salen del tema.
- **Degradés y brillo:** `src/components/Superficie.tsx` (`Acabado`) dibuja con SVG un degradé + luz radial + trama en cada tarjeta y en cada botón (`material="oro"`). Es el origen del look repetido.
- **Radios:** 26 valores distintos de `borderRadius` (de 1 a 130), sin escala.
- **Etiquetas espaciadas:** `letterSpacing` en 24 lugares; las mayúsculas están escritas en el texto, no por estilo.

## Componentes
- **Reutilizables** (`src/components/Controles.tsx`): `Texto`, `Boton`, `Campo`, `Tarjeta`, `Etiqueta`, `Acceso`, `Seccion`, `Pasos`, `Pantalla`. Además `Superficie`/`Acabado`, `FilaOpcion`, `EntradaSuave`, `Icono`, `CartaPoker`, `LogoBlindly`.
- **Pantallas:** 29 rutas en `src/app` + 5 pestañas en `src/app/(principal)`. Casi todas usan `Controles`; `Superficie` sólo aparece en Home, Perfil y el layout de pestañas.
- **Con más estilo propio (inline):** `combinaciones.tsx` y `liga.tsx` (21 c/u), `puntuacion.tsx` (14), Home (13). `editor.tsx` usa `Pressable` directo (5).
- La mesa (`Mesa.tsx`, `MesaAsientos.tsx`, `PanelApuesta.tsx`, `Botonera.tsx`) es un sistema aparte, el más grande.

## Íconos, fuentes y assets
- **Íconos:** un set propio en `src/components/Icono.tsx` (28 trazos SVG, grosor 1,65). No hay librería de íconos.
- **Glifos usados como ícono:** 104 caracteres en 13 archivos: palos de texto ♠♥♦♣ (89), medallas 🥇🥈🥉, y ♛ ♜ ♾ ◈ ◆ ↗ ‹ ✓. Se ven distinto en cada teléfono.
- **Fuentes:** ninguna cargada (`expo-font` instalado sin uso; no hay `fontFamily`). Todo es la fuente del sistema.
- **Assets** (`app.json`): `icon` `blindly-app-icon.png`; adaptive `foreground-v2` + `monochrome-v2` sobre `#0A1713`; splash `blindly-logo.png` sobre `#0D1011`.
- **Origen:** logo, ícono y `assets/store/play-feature-graphic.png` fueron generados con IA (`assets/images/blindly-brand.md`). El feature graphic es una foto falsa de una mesa con cartas mal dibujadas.
- **Tienda:** `assets/store/` sólo tiene ícono y feature graphic; no hay capturas diseñadas ni script.
