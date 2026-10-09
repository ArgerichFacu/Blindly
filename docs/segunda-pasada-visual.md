# Segunda pasada visual de Blindly

Fecha: 2026-10-09. Alcance: dirección visual y UX fina; sin cambios en reglas,
permisos, pagos, autenticación, navegación ni Supabase.

## 1. Dirección visual

Fondos profundos con iluminación diagonal suave, superficies oscuras con peso,
paño casi imperceptible y acentos champagne. La ambientación sigue el tema de la
app. Se conservaron el logo transparente, las ilustraciones y la tipografía.
No se agregó un archivo de imagen ni un servicio externo.

La referencia disponible para esta pasada fue la descripción del usuario; no se
recibió un bitmap del mockup previo para medir correspondencia literal.

## 2. Sistema reutilizable

`Superficie` define tres variantes: `hero`, `panel` y `suave`. `Acabado` dibuja
materiales de panel, paño, champagne y fondo con SVG. `RELIEVE` concentra tres
elevaciones. `Tarjeta`, `Boton`, `Campo`, `Acceso`, `Seccion` y `Pantalla` usan el
sistema compartido. `FilaOpcion` reúne filas compactas con iconos y controles.
`VolumenAudio` concentra el gesto, el porcentaje y la accesibilidad del slider.

## 3. Volumen, sombras y capas

Sombras de 3/10, 8/22 y 14/32 px según jerarquía, sin iluminación pulsante.
Bordes translúcidos y reflejos de 1 px separan las superficies del fondo.
El paño se reserva para bloques protagonistas y snapshots sociales; los controles
secundarios tienen menos peso. Las decoraciones no capturan toques y están
ocultas a lectores de pantalla. No se usa blur nativo ni imágenes pesadas.

## 4. Home

El mensaje, la creación de partida y el acceso con código forman un hero con
relieve, textura y elipses inspiradas en una mesa. El CTA tiene acabado champagne,
borde inferior y respuesta a la presión. Plus conserva su posición superior.
Liga y aprendizaje usan otras elevaciones. La selección, recencia, estados vacíos
y rutas conservan su comportamiento anterior.

## 5. Ligas, temporadas y ranking

Snapshots con material de paño y bloque MVP contenido, estado vacío con hero,
MVP/campeón destacado con inicial y medallón, podio con posiciones tipográficas
y tarjetas secundarias. Las barras Race for MVP siguen mostrando los puntos reales.
El resto del detalle de liga hereda las tarjetas, encabezados, campos y secciones.
No se alteran empates, estadísticas, roles, temporadas ni permisos de invitación.

## 6. Perfil

Avatar e identidad dentro de una superficie protagonista, anillo champagne y
estadísticas agrupadas en celdas oscuras. Títulos, estado Plus y recuperación
siguen usando los datos y controles existentes. El estado invitado conserva su
explicación y acceso para proteger la cuenta.

## 7. Config, navegación e invitaciones

Configuración agrupa filas compactas dentro de paneles suaves. Bottom navigation
tiene más cuerpo, borde superior, sombra y cápsula en el tab seleccionado.
Los headers mantienen regreso y reducen el tamaño de títulos largos.
La invitación tiene panel elevado, borde champagne y QR con superficie blanca;
copiar, compartir, confirmación de solicitudes y cierre no cambian.

## 8. Sonidos y ambiente

Se eliminaron los botones ±10%. Música, efectos de ronda, ambiente y botonera
comparten un panel con cuatro sliders de 0–100 y precisión de 1%.
Porcentaje durante el gesto; persistencia al terminar. Un canal apagado se atenúa
y permite ajustar su volumen sin activarlo. Se preservan silenciamiento, favoritos,
orden, reproducción, ciclo de vida y límites Free/Plus.

Android/iOS usan `@react-native-community/slider` 5.2.0, compatible con Expo SDK 57.
Web usa `input type=range` con el mismo acabado: la implementación web del paquete
nativo no ofrecía foco de teclado. Se mantienen foco, teclas, valores anunciados,
captura del puntero y sincronización de preferencias externas sin remontar.
Se agregó la nueva frase de ambiente en español, inglés y portugués.

## 9. Pulido y validación

Mayor trabajo específico en Home, Perfil, Config, Sonidos, snapshots de club,
ranking e invitaciones. Los componentes globales extienden el estilo al resto.

- `npm test`: suite completa aprobada, incluidas reglas, SQL local, identidad,
  navegación, Free/Plus, clasificación y sliders nativos/web.
- `npm run typecheck` y `npm run lint`: aprobados.
- `npx expo install --check`: dependencias compatibles.
- `npm run build:bundles`: exportación web, Android e iOS aprobada.
- Revisión web móvil: Home, Ligas vacío y protección, Perfil invitado, Config,
  Sonidos, creación de sala y combinaciones; tamaños 360×800 y 320×640.
- Teclado del slider: 30→31→30%, foco conservado y persistencia al regresar.
- Capturas entregadas en `release/segunda-pasada/` del directorio de entrega.

Esta revisión web no reemplaza una prueba física de las nuevas sombras/slider,
Android Back, safe areas iOS o rendimiento en hardware. La sesión web disponible
era invitada: el detalle de una liga privada y su invitación real requieren una
cuenta protegida. Sus reglas y flujos están cubiertos por pruebas automáticas.
La prueba ARM64 con páginas de 16 KB sigue pendiente de un dispositivo compatible.

## 10. Tercera pasada, si hiciera falta

Ajustar densidad, escalas de texto grandes, contraste y coste de sombras después
de probar esta versión en celulares físicos. Revisar una liga real con muchos
miembros, nombres largos, varios títulos y fechas. Comparar con un bitmap del
mockup si se aporta. No se inició ninguna nueva feature ni se habilitó Plus.
