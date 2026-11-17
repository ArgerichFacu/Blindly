# Rebranding "Marcador" — Fase 5: validación

Fecha: 17/11/2026 · Rama `rebranding` · Dispositivo: Samsung A32 (1080×2400) con el APK de prueba `production-candidate` (build EAS 347aa3d6) + versión web local para el segundo jugador.

> Qué se probó en el teléfono y qué no: los últimos commits (`ea38c34`, `e093df7`, `e4ef9f1` y el de esta fase) se hicieron **después** de ese APK y no se pudieron ver en el teléfono porque EAS se quedó sin builds gratis de Android hasta el 1/12. Pasan typecheck, lint y todas las pruebas, pero falta verlos en un build real (ver "Pendiente").

## 1. Revisión de marca (brand-review)

Autoridad: `docs/brand/BRAND.md` y `rebranding/02-brief.md` (dirección "A, Marcador", aprobada por el titular).

| Control | Resultado | Evidencia |
|---|---|---|
| Logo (wordmark `blindly:` y símbolo `b:`) | ✓ | Home, bienvenida, splash, ícono y piezas de tienda usan los assets de `assets/brand/`. El dos puntos verde es fijo en los 4 temas (variación permitida: el logo no cambia con el tema). |
| Color por roles (tokens) | ✓ | Cero colores sueltos fuera de `src/lib/temas.ts` (test `tokens-marca`). Los 4 temas se vieron en el teléfono. |
| Tipografía Barlow / Barlow Condensed | ✓ | Títulos y números en condensada, texto en Barlow; números tabulares en el reloj y en los stacks. |
| Forma: radios 4/8/12/píldora y superficies planas | ✓ tras corrección | Quedaban radios de 16–28 y bordes con brillo en perfil, invitación al club, tutorial, resumen y filas de opciones → corregido en `10aae6e`. |
| Botones: un primario claro por pantalla | ✓ tras corrección | Turno en la mesa: cuatro botones primarios iguales → "Igualar" primario y el resto secundarios (`7ea27ba`). |
| Copy en tono de marca, sin mayúsculas forzadas | ✓ tras corrección | "PREFLOP" → "Preflop" traducido; "póker" → "poker"; "cartas doradas" → "cartas marcadas". |
| Anti-patrones del brief (tarjetas con degradé y brillo, etiquetas chiquitas en mayúscula, botones dorados, emojis de palos) | ✓ | No quedan en las pantallas revisadas. Los palos son SVG (`Palo`). |
| Tienda: capturas reales, sin afirmaciones falsas | ✓ | 7 capturas por idioma desde la app real; los temas Plus dicen "con Plus". Sin "mejor", "#1", "gratis" ni llamados a descargar. |
| Licencias | ✓ | Barlow (SIL OFL, `assets/fonts/OFL.txt`); íconos propios; música CC BY 4.0 con créditos en la app. |
| ES / EN / PT | ✓ tras corrección | En inglés, ordenar asientos decía "Raise" (clave "Subir" duplicada) → claves propias (`e4ef9f1`). |

**Resultado: aprobada con notas.** No quedan fallas conocidas contra la marca, pero los últimos arreglos todavía no se vieron en un build. **Aceptación final: pendiente del titular.**

## 2. Accesibilidad (WCAG 2.1 AA)

| Criterio | Estado |
|---|---|
| 1.4.3 / 1.4.11 Contraste | `node scripts/brand/contraste.cjs`: **100 combinaciones, 0 fallas** (temas, fichas, naipes, marcadores DR/BTN/SB/BB y colores de club). Tabla completa en `assets/brand/contraste.md`. Mínimos usados: texto 7,27:1 para error / verde; texto secundario ≥ 6,52:1; bordes de control ≥ 3,55:1. |
| 1.4.4 Texto a 200 % | Escala nativa sin límite global (test `accesibilidad-layout`); sólo se limita en el reloj gigante y en las insignias de rol. |
| Tamaño mínimo de texto | 12 px en toda la app (antes había 9–11). |
| 2.5.5 / Material: zona táctil | 48 dp en controles (`TACTIL_MINIMO`); los que quedaban en 40–44 se subieron. |
| 4.1.2 Nombre, rol y estado | Botones de sólo ícono con `accessibilityLabel`; temas como `radio` con `checked` y, mientras se verifica Plus, con `disabled`; filas de la tabla de niveles leídas como una oración. |
| 2.3.3 Movimiento | El destello del cambio de nivel y de las cifras respeta "reducir movimiento". |

## 3. Crítica de diseño por pantalla

| Pantalla | Hallazgo | Estado |
|---|---|---|
| Mesa: panel de turno | Cuatro botones primarios iguales, sin jerarquía | Corregido y visto en el teléfono |
| Mesa: calle | "PREFLOP" en mayúsculas y sin traducir | Corregido y visto en ES/EN/PT |
| Mesa: hoja "Actualizar stack" | Quedaba pegada arriba y sin título | Corregido (falta verlo en un build) |
| Mesa: reparto por jugador | "1000" sin separador y "Reserva: 0" repetido | Corregido (falta verlo en un build) |
| Valor de fichas | La ficha de 1000 no entraba ("1000") | Corregido: "1K", visto en el teléfono |
| Ordenar asientos | "Raise" en inglés; "Dealer elegido" igual a los demás botones | Corregido (falta verlo en un build) |
| Perfil | Tres cajitas de estadísticas desparejas (2 + 1) | Una fila tipo tablero con separadores (falta verlo en un build) |
| Ligas | "+ Crear liga" con un "+" tipeado | Ícono compartido (falta verlo en un build) |
| Config | Ícono sólo en la primera fila de cada grupo; interruptores con colores de Android | Filas sin ícono e interruptores con la marca (falta verlo en un build) |
| Config: temas | Con la app recién abierta, un usuario Plus ve los temas bloqueados unos segundos y, si toca uno, se abre el paywall | Corregido: mientras se verifica Plus, los temas quedan atenuados y no responden (falta verlo en un build) |
| Combinaciones | "Las cinco cartas doradas…" (resto del diseño anterior) | Corregido |
| Home (PT) | El título corta en dos líneas con "uma" sola abajo | Aceptado: React Native no equilibra líneas; no afecta el uso |
| Sala de espera, Modo, Créditos, Paywall | Sin hallazgos materiales | — |

## 4. Matriz 4 temas × 3 idiomas (en el teléfono)

| | ES | EN | PT |
|---|---|---|---|
| Verde | Home, mesa, sala, fichas, modo, combinaciones, config, perfil, ligas | Home, mesa, sala, fichas, modo, combinaciones, config | Home, mesa, sala, fichas, modo, combinaciones, config |
| Violeta | Config | Config | Config |
| Rojo | Home, mesa | — | — |
| Negro | Config, ligas, perfil | — | — |

Los colores son los mismos tokens en los tres idiomas y el contraste está verificado por script para los 4 temas, así que las celdas vacías no tienen riesgo de color. Sí podrían esconder un texto largo que no entra: lo cubren las capturas en EN/PT con el tema verde.

## 5. Pendiente

1. Armar un APK con los últimos commits (EAS gratis vuelve el 1/12, o con un plan pago) y mirar los arreglos marcados "falta verlo en un build".
2. Aceptación final de la marca y de las piezas de tienda por el titular.
