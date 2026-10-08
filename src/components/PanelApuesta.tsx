import { useState } from "react";
import { View } from "react-native";
import { Boton, Campo, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { AyudaTurno } from "./AyudaTurno";
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
  const { t, preferencias } = usePreferencias();
  const [editor, setEditor] = useState<"igualar" | "subir" | null>(null);
  const max = stack + aporte,
    min = actual + minima,
    totalIgualar = Math.min(actual, max);
  const subidaValida =
    /^\d+$/.test(monto) &&
    Number(monto) > actual &&
    Number(monto) <= max &&
    (Number(monto) >= min || Number(monto) === max);
  const igualadaValida = /^\d+$/.test(monto) && Number(monto) === totalIgualar;
  const cerrarEditor = () => {
    setEditor(null);
    cambiar("");
  };
  return (
    <View style={{ gap: 10 }}>
      {preferencias.principiante && (
        <AyudaTurno
          virtual={{
            actual,
            aporte,
            igualar: Math.min(faltan, stack),
            totalIgualar,
            puedePasar: !faltan,
            puedeSubir: puedeSubir && max > actual,
            min,
            max,
          }}
        />
      )}
      {editor && (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Campo
              etiqueta={t("Total apostado en la ronda")}
              keyboardType="number-pad"
              value={monto}
              onChangeText={cambiar}
            />
            <Boton
              titulo="×"
              accesibilidad={t("Cancelar monto")}
              secundario
              compacto
              onPress={cerrarEditor}
            />
          </View>
          {editor === "igualar" ? (
            <Texto suave>
              {t("Monto exacto para igualar: {n}", { n: totalIgualar })}
            </Texto>
          ) : (
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
          )}
          <Boton
            titulo={
              editor === "igualar"
                ? t("Confirmar igualar a {n}", { n: Number(monto) || 0 })
                : Number(monto) === max
                  ? t("Confirmar all-in")
                  : t("Subir a {n}", { n: Number(monto) || 0 })
            }
            disabled={
              ocupado ||
              (editor === "igualar" ? !igualadaValida : !subidaValida)
            }
            onPress={() => actuar(editor)}
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
          onPress={() => {
            if (!faltan) return actuar("pasar");
            cambiar(String(totalIgualar));
            setEditor("igualar");
          }}
        />
        {!editor && (
          <Boton
            titulo={t(actual === 0 ? "Apostar" : "Subir")}
            compacto
            secundario
            style={{ flex: 1 }}
            disabled={ocupado || !puedeSubir || max <= actual}
            onPress={() => {
              cambiar(String(Math.min(min, max)));
              setEditor("subir");
            }}
          />
        )}
      </View>
    </View>
  );
}
