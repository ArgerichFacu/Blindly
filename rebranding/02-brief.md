# Rebranding · Fase 2 — Brief de producción (en curso, 13/11/2026)

**Dirección elegida por el titular: A · Marcador.** Lo de abajo es propuesta de trabajo; todavía no hay assets dibujados ni contraste verificado.

## Qué expresa
Instrumento de la mesa: reloj de torneo y marcador. Plano, legible de lejos, sin dorado ni brillo.

## Símbolo y wordmark (propuesta)
- **Símbolo:** `b:` — una "b" geométrica (asta + ojo cuadrado de esquinas redondeadas) seguida de los dos puntos del reloj. La "b" en marfil `#F2F0E8`, los dos puntos en verde `#5BD08A`, sobre `#0E1512`.
- **Wordmark:** `blindly:` dibujado a medida (letras construidas con trazo uniforme, sin depender de una fuente). Los dos puntos reemplazan al punto final del logo viejo y sirven de conector: "blindly: nivel 4".
- **Micro-animación:** los dos puntos parpadean una vez en el splash.
- Entregar en SVG: símbolo, wordmark, ícono 512, adaptive (foreground + fondo liso), monocromo y splash. Zona segura del adaptive: 66/108 dp.
- **Render a PNG:** no hay Pillow ni cairosvg; usar Chrome headless (`C:\Program Files\Google\Chrome\Application\chrome.exe --headless --screenshot`).

## Tokens (valores iniciales, falta verificar WCAG)
Tokens: `fondo`, `superficie`, `superficieElevada`, `borde`, `bordeControl`, `texto`, `textoSecundario`, `acento`, `accionPrimaria`, `textoAccion`, `mesa`, `exito`, `error`.

| Tema | fondo | superficie | elevada | borde | bordeControl | texto | secundario | acento | mesa |
|---|---|---|---|---|---|---|---|---|---|
| Verde | `#0E1512` | `#17211C` | `#1F2B25` | `#2A3A32` | `#5F7368` | `#F2F0E8` | `#9DAAA2` | `#5BD08A` | `#1E5A45` |
| Rojo (Plus) | `#170E10` | `#22151A` | `#2D1C22` | `#452A33` | `#8A5E6B` | `#F5EFEA` | `#BFA5AC` | `#F4A6BD` | `#5A2233` |
| Negro (Plus) | `#0C0D0E` | `#16181A` | `#1F2225` | `#2E3236` | `#6B7278` | `#F1F1EE` | `#A1A6AB` | `#9AD0FF` | `#25323A` |
| Violeta realeza (Plus) | `#140C1F` | `#1E1430` | `#2A1B42` | `#3A2757` | `#8A63C7` | `#F3EEF9` | `#B9A9D1` | `#A98BE0` | `#6B3FA0` |

- `accionPrimaria` = el color de `texto` del tema, con `textoAccion` = `fondo` (botón claro y plano).
- `exito` `#5BD08A` y `error` `#FF7A6B` en todos; nunca depender sólo del color.
- Colores de ficha fijos en todos los temas: blanca `#F4F3EF`, roja `#D6453D`, verde `#2E9E6A`, azul `#3B6FD9`, negra `#23262B`, amarilla `#F2C230`.
- Verificar: texto y secundario ≥ 4,5:1 sobre fondo/superficie/elevada/mesa; `bordeControl` y `acento` ≥ 3:1 sobre fondo y superficie.

## Tipografía
Barlow Condensed (600/700) para números y títulos; Barlow (400/500/600) para texto. SIL Open Font License 1.1. Cifras tabulares. Escala: timer 96–128, stack 28, número 22, título 24, subtítulo 18, cuerpo 16, secundario 14, mínimo 12. **Agregar los archivos de fuente requiere el OK del titular** (regla de dependencias).

## Íconos
Grilla de 24, trazo 2, extremos redondeados; base Lucide (licencia ISC) copiada a `Icono.tsx`, sin dependencia nueva. El set actual mezcla trazos propios con algunos de Feather (MIT). Palos de cartas en SVG propio, rellenos. Reemplazar los 104 caracteres usados como ícono.

## Tono de copy
Voseo, directo, sin slogans ni mayúsculas decorativas. El botón dice lo que hace. Ejemplos: "POKER ENTRE AMIGOS" se elimina; "Sin rango" → "Todavía sin puntos"; el humor sólo en estados vacíos.

## Pendiente de esta fase
1. Dibujar símbolo, wordmark, ícono, adaptive, monocromo y splash (SVG + PNG en `assets/brand/`).
2. Script de contraste y ajuste de tokens.
3. `docs/brand/BRAND.md` con licencias (ojo: `docs/` es público en blindly.com.ar).
4. Página de revisión y **parar antes de implementar**.
