"""Audita bibliotecas ELF de 64 bits en APK/AAB sin extraer archivos.

Complementar con zipalign, bundletool y ejecución nativa: esto verifica
PT_LOAD y GNU_RELRO, no constituye aceptación en un dispositivo de 16 KB.
Referencia: https://developer.android.com/guide/practices/page-sizes
"""
import argparse
import hashlib
import json
import struct
import zipfile
from pathlib import Path


def comprobar(datos):
    if datos[:4] != b"\x7fELF" or datos[4:6] != bytes((2, 1)):
        raise ValueError("Se esperaba ELF64 little-endian")
    header = struct.unpack_from("<16sHHIQQQIHHHHHH", datos)
    offset, stride, count = header[5], header[9], header[10]
    if stride < 56 or offset + stride * count > len(datos):
        raise ValueError("Tabla de segmentos ELF inválida")
    loads, relro, segments = [], [], []
    for indice in range(count):
        segmento = struct.unpack_from("<IIQQQQQQ", datos, offset + indice * stride)
        segments.append(segmento)
        tipo, _, _, virtual, _, _, memoria, alineacion = segmento
        if tipo == 1:
            loads.append(alineacion)
        elif tipo == 0x6474E552:
            relro.append((virtual + memoria) % 16384)
    overlaps = []
    for segment in segments:
        if segment[0] != 0x6474E552:
            continue
        end = segment[3] + segment[6]
        rounded_end = (end + 16383) // 16384 * 16384
        overlaps.extend(
            s[3] for s in segments if s[0] == 1 and s[1] & 2
            and max(s[3], end) < min(s[3] + s[6], rounded_end)
        )
    return {
        "pt_load_alignments": loads,
        "pt_load_ok": bool(loads) and all(x >= 16384 for x in loads),
        "relro_end_remainders": relro,
        "writable_loads_overlapping_rounded_relro": overlaps,
        "compatible": bool(loads) and all(x >= 16384 for x in loads)
        and all(x == 0 for x in relro),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("artifact", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    results = {}
    with zipfile.ZipFile(args.artifact) as archivo:
        error = archivo.testzip()
        if error:
            raise ValueError(f"CRC inválido: {error}")
        for nombre in archivo.namelist():
            if nombre.endswith(".so") and any(
                f"/{abi}/" in nombre for abi in ("arm64-v8a", "x86_64")
            ):
                results[nombre] = comprobar(archivo.read(nombre))
    if not results:
        raise ValueError("No se encontraron bibliotecas nativas de 64 bits")
    with args.artifact.open("rb") as source:
        checksum = hashlib.file_digest(source, "sha256").hexdigest()
    report = {
        "artifact": args.artifact.name,
        "sha256": checksum,
        "libraries": results,
        "compatible": all(x["compatible"] for x in results.values()),
    }
    if args.output:
        args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    fallos = [nombre for nombre, data in results.items() if not data["compatible"]]
    load_errors = sum(not x["pt_load_ok"] for x in results.values())
    print(f"{args.artifact.name}: {len(results)} bibliotecas, {load_errors} fallos PT_LOAD, "
          f"{len(fallos)} no cumplen todas las comprobaciones documentadas")
    for nombre in fallos:
        print(nombre, results[nombre])
    raise SystemExit(1 if fallos else 0)


if __name__ == "__main__":
    main()
