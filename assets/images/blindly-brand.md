# Identidad de Blindly

Asset: assets/images/blindly-logo.png
Created using the built-in image_gen tool. Selected third generation, solid forest-green background; the two exploratory transparent variants were discarded. Source PNG is preserved unchanged. LogoBlindly frames the centered lockup for in-app use; the native splash uses the same asset.

Final generation prompt:
Graphic design asset. Extremely crisp flat 2D vector-style logo on a perfectly uniform solid dark forest green background hex #0A1713. Centered small gold lowercase letter b symbol with a sharply cut out spade in its bowl. Below it, the exact word 'blindly.' in lowercase bold geometric sans serif. Ink color is uniform champagne gold #E8C77A. The background is a solid flat color and every logo shape is a solid flat color, like a two-color screenprint or SVG. Sharp edges. NO glow whatsoever. NO illumination. NO gradients. NO texture. NO photographic effects. NO metallic materials. NO blur. Simple two-color graphic brand mark suitable for a poker mobile app splash screen. Compact centered lockup, medium sized emblem and readable wide wordmark. Square composition.

Native splash configuration requires a new app build. Expo Go does not reproduce the standalone native splash faithfully. The web/React loading view and home menu use the asset immediately.

Theme fix: blindly-logo-transparent.png was generated with the built-in image tool from the original. Prompt: Remove the dark green background completely; preserve the gold b/spade and blindly. wordmark; transparent surrounding areas and holes, no glow or shadow. LogoBlindly now has no fixed background. Native launch still uses the original image on its fixed green background.

## Launcher nativo

`blindly-app-icon.png` usa únicamente la `b` con pique dorada sobre el fondo verde de Blindly, en un lienzo RGB de 1024 × 1024. Se generó con el built-in `image_gen` a partir del logo original y luego se ajustó de forma determinista al tamaño nativo. Prompt final: crear un ícono cuadrado premium derivado del logo, conservar la `b` con pique dorada, eliminar el wordmark, centrar el símbolo con margen seguro y mantener el fondo verde oscuro `#0A1713`, sin texto, insignias, precio, marco ni watermark.

`blindly-icon-foreground.png` es el foreground adaptativo RGBA. Prompt final: aislar únicamente la `b` dorada con el pique calado, eliminar el wordmark y todo el fondo, centrarla con margen seguro para máscaras Android y conservar transparencia real, sin sombra exterior, borde ni watermark.

`blindly-icon-monochrome.png` deriva de la silueta alfa del foreground y reemplaza el símbolo monocromático de Expo que todavía quedaba en la plantilla. Android 13+ puede teñirlo cuando el usuario activa íconos temáticos.

### Variante adaptativa v2 (meta 40)

Se conserva el asset original y se agregan `blindly-icon-foreground-v2.png` y `blindly-icon-monochrome-v2.png`, referenciados en app.json. Generados con `image_gen` a partir del foreground existente, pidiendo conservar forma y pique calado y disminuir el símbolo dentro de un lienzo cuadrado transparente. La versión monocromática conserva la silueta y usa blanco. Se redujeron los outputs a 1024 × 1024 con Lanczos; no se recortó el símbolo.

Alfa significativo (>16/255): foreground `(346, 282, 715, 754)` y monocromo `(347, 283, 714, 752)`. El centro queda a menos de 32 px del centro del lienzo. `scripts/verificar-iconos.py` valida que el símbolo visible permanezca dentro del círculo central de 72/108 dp y genera las vistas circular/squircle/rounded revisadas visualmente. El icono completo de iOS y el logo/splash no cambian. Su recepción en launchers Android reales requiere nueva build y aceptación física.
