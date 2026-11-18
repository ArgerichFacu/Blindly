# Ficha de Google Play — gráficos reproducibles

Todo lo que se sube a Play Console (ícono, feature graphic y capturas en ES/EN/PT) se genera desde código, con la identidad de `docs/brand/BRAND.md`. Si cambia la app, se vuelven a sacar las capturas y se corre el script.

## Cómo regenerar
1. Capturas reales del teléfono (1080×2400) en `store/raw/<idioma>/<id>.png`, con los ids de `store/capturas.json` (`reloj`, `qr`, `stacks`, `fichas`, `niveles`, `manos`, `temas`). Ejemplo con ADB:
   ```bash
   adb exec-out screencap -p > store/raw/es/reloj.png
   ```
   La barra de estado del teléfono se recorta sola (`recorte.arriba` en `capturas.json`).
2. `node store/generar.cjs` (o `--idioma es` para uno solo). Necesita Chrome o Edge (variable `CHROME_PATH` si no está en la ruta habitual). No usa dependencias nuevas.
3. Resultado en `store/salida/`: el script verifica tamaño y formato de cada archivo y avisa si falta una captura.

## Qué hay que subir a mano en Play Console
Play Console → Presencia en Google Play Store → Ficha de Play Store principal (y cada traducción):

| Archivo | Campo de Play | Requisito (verificado el 17/11/2026) |
|---|---|---|
| `salida/icono-512.png` | Ícono de la app | PNG 32 bits con alfa, 512×512, ≤ 1 MB |
| `salida/<idioma>/feature-1024x500.png` | Gráfico de funciones | JPEG o PNG 24 bits sin alfa, 1024×500 |
| `salida/<idioma>/01…07-*.png` | Capturas de pantalla del teléfono | JPEG o PNG 24 bits, lado mayor ≤ 2× el menor; para recomendaciones, al menos 4 de 1080 px o más en 9:16 |

Fuente: [Play Console Help · Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151).

## Reglas de contenido (Play + marca)
- Las capturas muestran la app real; nada de funciones que no existen.
- Títulos cortos con un beneficio concreto, ≤ 20 % de la imagen. Sin "mejor", "#1", "gratis", "nuevo", ratings inventados ni llamados a descargar.
- Sin logos ni marcas de terceros, sin insignias de tiendas.
- Feature graphic sin imágenes de dispositivos y con lo importante en el centro.
