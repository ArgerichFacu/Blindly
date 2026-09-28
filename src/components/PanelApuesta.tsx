import { useState } from "react";
import { View } from "react-native";
import { Boton, Campo, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
export function PanelApuesta({
  faltan,
  stack,
  aporte,
  actual,
  minima,
  puedeSubir,
  ocupado,
  monto,
  cambiar,
  actuar,
}: {
  faltan: number;
  stack: number;
  aporte: number;
  actual: number;
  minima: number;
  puedeSubir: boolean;
  ocupado: boolean;
  monto: string;
  cambiar: (s: string) => void;
  actuar: (tipo: string) => void;
}) {
  const { t } = usePreferencias();
  const [subiendo, setSubiendo] = useState(false);
  const max = stack + aporte,
    min = actual + minima;
  const valido =
    /^\d+$/.test(monto) &&
    Number(monto) > actual &&
    Number(monto) <= max &&
    (Number(monto) >= min || Number(monto) === max);
  return (
    <View style={{ gap: 10 }}>
      {subiendo && (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Campo
              etiqueta={t("Subir a (total de la ronda)")}
              keyboardType="number-pad"
              value={monto}
              onChangeText={cambiar}
            />
            <Boton
              titulo="×"
              accesibilidad={t("Cancelar subida")}
              secundario
              compacto
              onPress={() => setSubiendo(false)}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              ...new Set([Math.min(min, max), Math.min(min * 2, max), max]),
            ].map((n) => (
              <Boton
                key={n}
                titulo={n === max ? "All-in" : n.toLocaleString()}
                compacto
                secundario
                style={{ flex: 1 }}
                disabled={ocupado}
                onPress={() => cambiar(String(n))}
              />
            ))}
          </View>
          <Boton
            titulo={
              Number(monto) === max
                ? t("Confirmar all-in")
                : t("Subir a {n}", { n: Number(monto) || 0 })
            }
            disabled={ocupado || !valido}
            onPress={() => actuar(Number(monto) === max ? "allin" : "subir")}
          />
        </>
      )}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Boton
          titulo={t("Retirarse")}
          compacto
          secundario
          style={{ flex: 1 }}
          disabled={ocupado}
          onPress={() => actuar("retirarse")}
        />
        <Boton
          titulo={
            faltan
              ? t("Igualar {n}", { n: Math.min(faltan, stack) })
              : t("Pasar")
          }
          compacto
          style={{ flex: 1.25 }}
          disabled={ocupado}
          onPress={() => actuar(faltan ? "igualar" : "pasar")}
        />
        {!subiendo && (
          <Boton
            titulo={t(actual === 0 ? "Apostar" : "Subir")}
            compacto
            secundario
            style={{ flex: 1 }}
            disabled={ocupado || !puedeSubir || max <= actual}
            onPress={() => {
              cambiar(String(Math.min(min, max)));
              setSubiendo(true);
            }}
          />
        )}
      </View>
    </View>
  );
}
