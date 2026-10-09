import { createElement, useState } from "react";
import type { ChangeEvent, PointerEvent, KeyboardEvent, CSSProperties } from "react";
import { Platform, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Texto } from "./Controles";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";

const limitar = (n: number) => Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
export function VolumenAudio({ canal, valor, atenuado, guardar }: { canal: string; valor: number; atenuado: boolean; guardar: (n: number) => void }) {
  const { tema } = useTema(), { t } = usePreferencias();
  const [estado, setEstado] = useState({ recibido: valor, actual: limitar(valor) });
  // Sincroniza cambios externos sin remontar el slider: conserva el foco del
  // teclado y no escribe preferencias durante cada frame del arrastre.
  const actual = estado.recibido === valor ? estado.actual : limitar(valor);
  if (estado.recibido !== valor) setEstado({ recibido: valor, actual });
  const setActual = (n: number) => setEstado({ recibido: valor, actual: limitar(n) });
  const completar = (n: number) => { const v = limitar(n); setActual(v); guardar(v); };
  const etiqueta = `${t("Volumen")}: ${canal}`;
  const porcentaje = Math.round(actual * 100);
  // La implementación web del paquete nativo no tiene foco de teclado. En web
  // usamos el control range del navegador, manteniendo el slider nativo en móvil.
  const controlWeb = () => <>
    {createElement("style", null, `.blindly-audio-slider{appearance:none;width:100%;height:44px;margin:0;background:transparent;cursor:pointer;border-radius:8px}.blindly-audio-slider:focus-visible{outline:2px solid ${tema.acento};outline-offset:3px}.blindly-audio-slider::-webkit-slider-runnable-track{height:4px;border-radius:3px;background:linear-gradient(to right,${tema.acento} 0%,${tema.acento} var(--progreso),${tema.borde} var(--progreso),${tema.borde} 100%)}.blindly-audio-slider::-webkit-slider-thumb{appearance:none;width:20px;height:20px;border-radius:50%;background:${tema.acento};margin-top:-8px;box-shadow:0 2px 6px #0004}.blindly-audio-slider::-moz-range-track{height:4px;border-radius:3px;background:${tema.borde}}.blindly-audio-slider::-moz-range-progress{height:4px;background:${tema.acento}}.blindly-audio-slider::-moz-range-thumb{width:20px;height:20px;border:0;border-radius:50%;background:${tema.acento}}`)}
    {createElement("input", { type: "range", className: "blindly-audio-slider", "aria-label": etiqueta, "aria-valuetext": `${porcentaje}%`, min: 0, max: 100, step: 1, value: porcentaje, style: { "--progreso": `${porcentaje}%` } as CSSProperties,
      onChange: (e: ChangeEvent<HTMLInputElement>) => setActual(e.currentTarget.valueAsNumber / 100),
      onPointerDown: (e: PointerEvent<HTMLInputElement>) => e.currentTarget.setPointerCapture(e.pointerId),
      onPointerUp: (e: PointerEvent<HTMLInputElement>) => completar(e.currentTarget.valueAsNumber / 100),
      onKeyUp: (e: KeyboardEvent<HTMLInputElement>) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(e.key)) completar(e.currentTarget.valueAsNumber / 100); },
      onBlur: (e: ChangeEvent<HTMLInputElement>) => { if (actual !== limitar(valor)) completar(e.currentTarget.valueAsNumber / 100); },
    })}
  </>;
  return <View style={{ gap: 3, opacity: atenuado ? 0.5 : 1 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Texto suave style={{ fontSize: 11 }}>{t("Volumen")}</Texto><Texto style={{ fontSize: 13, fontWeight: "700", color: tema.acento }}>{Math.round(actual * 100)}%</Texto></View>
    {Platform.OS === "web" ? controlWeb() : <Slider accessibilityLabel={etiqueta} accessibilityValue={{ min: 0, max: 100, now: porcentaje, text: `${porcentaje}%` }} minimumValue={0} maximumValue={1} step={0.01} value={actual} minimumTrackTintColor={tema.acento} maximumTrackTintColor={tema.borde} thumbTintColor={tema.acento} onValueChange={setActual} onSlidingComplete={completar} style={{ width: "100%", height: 44 }}/>}
  </View>;
}
