"""QA de iconos adaptativos: PNG, alfa, márgenes y máscaras Android.

No modifica assets. Ejecutar con Python + Pillow; crea sólo una lámina de QA.
"""
from PIL import Image, ImageDraw
from pathlib import Path
import math
ROOT = Path(__file__).resolve().parents[1]
names = ["blindly-icon-foreground-v2.png", "blindly-icon-monochrome-v2.png"]
icons = []
for name in names:
    im = Image.open(ROOT / "assets/images" / name)
    assert im.mode == "RGBA" and im.size == (1024, 1024)
    alpha = im.getchannel("A")
    visible = alpha.point(lambda x: 255 if x > 16 else 0)
    box = visible.getbbox()
    x0, y0, x1, y1 = box
    assert .30 < (x1-x0)/1024 < .46 and .40 < (y1-y0)/1024 < .55, (name, box)
    assert abs((x0+x1)/2-512) < 32 and abs((y0+y1)/2-512) < 32
    # Android foreground 108dp; el viewport normal del launcher mide 72dp.
    # La máscara circular es la más restrictiva de las tres usadas aquí.
    assert all(math.hypot(x-512,y-512) < 1024/3 for y in range(y0,y1) for x in range(x0,x1) if visible.getpixel((x,y))), name
    print(name, "RGBA; box", box, "safe circle/squircle/rounded")
    icons.append(im)
sheet = Image.new("RGB", (900, 620), "#17221E")
draw = ImageDraw.Draw(sheet)
for row, im in enumerate(icons):
    for col, shape in enumerate(["Circle", "Squircle", "Rounded"]):
        # Representa el recorte central de 72/108, después aplica la máscara.
        part = im.crop((171,171,853,853)).resize((230,230), Image.Resampling.LANCZOS)
        mask = Image.new("L", (230,230), 0)
        d = ImageDraw.Draw(mask)
        if shape == "Circle": d.ellipse((0,0,229,229), fill=255)
        else: d.rounded_rectangle((0,0,229,229), radius=65 if shape == "Squircle" else 42, fill=255)
        bg = Image.new("RGBA", (230,230), "#0A1713")
        bg.alpha_composite(part)
        x,y = col*300+35,row*300+25
        sheet.paste(bg.convert("RGB"), (x,y), mask)
        draw.text((x,y+245), shape + (" / themed" if row else " / gold"), fill="white")
out = ROOT / "release" / "qa-iconos.png"
out.parent.mkdir(exist_ok=True)
sheet.save(out)
print(out)
