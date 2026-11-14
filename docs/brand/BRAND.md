# Blindly — manual de marca

Versión 1 · 14/11/2026 · Dirección **Marcador**, elegida por el titular el 13/11/2026.
Fuentes de la decisión: `rebranding/01-estrategia.md` y `rebranding/02-brief.md` (rama `rebranding`).
Archivos: `assets/brand/` (SVG, PNG, `tokens.json`, `palos.svg`, `contraste.md`) y `scripts/brand/`.

> Esta carpeta se publica en blindly.com.ar. No poner acá datos internos ni secretos.

## 1. Qué es Blindly
El reloj y la caja de la partida de poker con amigos. Las cartas y las fichas las ponen ustedes.
- **Para quién:** grupos que juegan en persona; sobre todo el que organiza.
- **Promesa:** todos ven el mismo reloj, las mismas ciegas y los mismos stacks.
- **Por qué confiar:** no maneja plata, no es un juego de apuestas y la tienda muestra la app real.
- **Personalidad:** el amigo que organiza. Ordenado, directo, con humor seco.

## 2. Idea visual: Marcador
Blindly se ve como un instrumento de la mesa: el reloj de torneo de una sala y un marcador de cancha. Números grandes, grilla, colores planos. El color se usa para estados (en turno, último minuto, error), no para decorar.

**Prohibido** (es lo que hacía que la app pareciera una estafa):
- degradés, brillos, biseles, sombras de relieve y texturas en tarjetas o botones;
- dorado o "metal" de cualquier tipo;
- etiquetas chiquitas en mayúsculas con espaciado ("POKER ENTRE AMIGOS");
- slogans vacíos;
- emoji o caracteres de texto como íconos (♠ 🥇 ✓ ‹);
- el mismo radio y peso en todo.

## 3. Logo
| Pieza | Archivo | Uso |
|---|---|---|
| Wordmark | `blindly-wordmark.svg` / `-tinta.svg` | Splash, tienda, encabezados grandes |
| Símbolo `b:` | `blindly-simbolo.svg` / `-tinta.svg` | Ícono, avatar, favicon, marca chica |
| Ícono Play 512 | `blindly-icono-512.svg` → `.png` | Ficha de Google Play |
| Adaptive (foreground, background, monocromo) | `blindly-adaptive-*.svg` → `.png` 1024 | Ícono Android |
| Splash | `blindly-splash.svg` → `.png` 1200 | `expo-splash-screen`, fondo `#0E1512` |

**Construcción:** letras dibujadas a mano, sin fuente. Trazo 12, altura x 48, ascendente 36, radio exterior 20 e interior 8. Los dos puntos son los del reloj (12:45): reemplazan al punto del logo viejo y se pintan con el acento verde.
- **Tamaño mínimo:** símbolo 24 px; wordmark 96 px de ancho. El símbolo se probó a 48 px.
- **Aire alrededor:** como mínimo el ancho de un trazo (12/48 de la altura x) por lado.
- **Colores permitidos:** marfil + verde sobre `#0E1512`; tinta `#0E1512` sobre claro; blanco liso (monocromo).
- **No:** rotar, deformar, cambiar el color de los dos puntos por otro que no sea el acento, agregar sombras o brillos, poner el pique adentro de la "b" (era el logo anterior).
- **Adaptive:** contenido dentro del círculo seguro de 66 dp de 108 (semidiagonal 32,1 dp, verificada por `generar-marca.cjs`).

## 4. Color
Tokens semánticos en `assets/brand/tokens.json`. La app debe leerlos de un único archivo; ningún color fuera de ahí.

| Token | Para qué |
|---|---|
| `fondo` | Fondo de pantalla |
| `superficie` | Paneles, filas, hojas |
| `superficieElevada` | Lo que está encima: menús, hojas modales |
| `borde` | Divisores (no necesita contraste) |
| `bordeControl` | Borde de campos y botones secundarios (≥ 3:1) |
| `texto` / `textoSecundario` | Texto principal / de apoyo (≥ 4,5:1) |
| `acento` | Estado activo, en turno, progreso (≥ 3:1) |
| `acentoMesa` | Lo mismo pero sobre la mesa |
| `accionPrimaria` / `textoAccion` | Botón principal: claro y plano, texto oscuro |
| `mesa` | El paño de la mesa en la sala |
| `exito` / `error` | Siempre con texto o ícono, nunca sólo color |

| Tema | fondo | superficie | texto | acento | mesa |
|---|---|---|---|---|---|
| Verde (gratis, por defecto) | `#0E1512` | `#17211C` | `#F2F0E8` | `#5BD08A` | `#1D4A3A` |
| Rojo (Plus) | `#170E10` | `#22151A` | `#F5EFEA` | `#F4A6BD` | `#55202F` |
| Negro (Plus) | `#0C0D0E` | `#16181A` | `#F1F1EE` | `#9AD0FF` | `#25323A` |
| Violeta realeza (Plus) | `#140C1F` | `#1E1430` | `#F3EEF9` | `#A98BE0` | `#6B3FA0` |

- Violeta realeza usa `#6B3FA0` sólo en superficies grandes (la mesa); sobre ella el acento pasa a `#D4C2F2`.
- **Fichas** (iguales en todos los temas, siempre con el valor escrito): blanca `#F4F3EF`, roja `#BF3A31`, verde `#2E9E6A`, azul `#3464C9`, negra `#23262B`, amarilla `#F2C230`.
- **Contraste:** 78 combinaciones verificadas con `node scripts/brand/contraste.cjs`, 0 fallas. Tabla completa en `assets/brand/contraste.md`.

## 5. Tipografía
| Rol | Familia | Pesos | Licencia |
|---|---|---|---|
| Números y títulos | Barlow Condensed | 600, 700 | SIL Open Font License 1.1 |
| Texto | Barlow | 400, 500, 600 | SIL Open Font License 1.1 |

Cifras tabulares siempre (que los números no "bailen" al cambiar). Formato local (`4.975` en es-AR, `4,975` en en).

| Uso | Tamaño |
|---|---|
| Timer | 112 (mínimo 96) |
| Stack del jugador | 28 |
| Número destacado (ciegas, pozo) | 22 |
| Título de pantalla | 24 |
| Subtítulo | 18 |
| Cuerpo | 16 |
| Secundario | 14 |
| Mínimo absoluto | 12 |

Sin mayúsculas decorativas ni `letterSpacing` en etiquetas.

## 6. Forma, espacio y toque
- **Radios:** 4 (chips), 8 (controles), 12 (paneles), píldora sólo para estados ("En turno").
- **Espacios:** 4, 8, 12, 16, 24, 32, 48.
- **Zona táctil mínima:** 48 dp. Los botones de sólo ícono llevan `accessibilityLabel` y `accessibilityRole`.
- **Jerarquía:** el borde y el relleno marcan qué es un objeto aparte; no todo es una tarjeta.

## 7. Íconos y palos
- Un solo set: grilla de 24, trazo 2, extremos redondeados. Base: **Lucide** (licencia ISC), copiando sólo los trazos usados a `src/components/Icono.tsx`, sin dependencia nueva.
- Palos de cartas: dibujo propio y relleno (`assets/brand/palos.svg`). Pique y trébol en `texto`; corazón y diamante en `error` (rojo naipe). Siempre acompañados de la letra o el valor si importan.

## 8. Tono
Como habla el amigo que organiza: voseo, frases cortas, el botón dice lo que hace. Humor seco sólo en estados vacíos.

| Antes | Después (ES) | EN | PT |
|---|---|---|---|
| POKER ENTRE AMIGOS / La mesa está lista. Faltan ustedes. | Armá la partida o sumate a una | Start a game or join one | Crie uma partida ou entre em uma |
| Sin rango | Todavía sin puntos | No points yet | Ainda sem pontos |
| Unirme (dos botones en Home) | Unirme con código o QR · Unirme a un club | Join with code or QR · Join a club | Entrar com código ou QR · Entrar em um clube |
| TU NOCHE DE POKER | Tus partidas | Your games | Suas partidas |

No usar: "épico", "experiencia premium", "la mejor app", números inventados de usuarios o ratings.

## 9. Licencias
| Recurso | Licencia | Fuente |
|---|---|---|
| Logo, símbolo, palos, ícono, splash | Propios de Blindly (dibujados en `scripts/brand/generar-marca.cjs` y `assets/brand/palos.svg`) | Este repositorio |
| Barlow / Barlow Condensed | SIL Open Font License 1.1 (uso comercial permitido) | Google Fonts, autor Jeremy Tribby |
| Íconos Lucide | ISC (uso comercial permitido, conservar el aviso) | lucide.dev |

## 10. Cómo regenerar
```bash
node scripts/brand/generar-marca.cjs   # SVG
node scripts/brand/exportar-png.cjs    # PNG con Chrome headless
node scripts/brand/contraste.cjs       # WCAG de los tokens
```
