import { forwardRef } from "react";
import { View, type ViewProps } from "react-native";
import { LogoBlindly } from "./LogoBlindly";
import { Texto } from "./Controles";
import type { Recap } from "../lib/recap";
import { duracionLegible } from "../lib/recap";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";

const medalla = (puesto: number) => puesto === 1 ? "🥇" : puesto === 2 ? "🥈" : puesto === 3 ? "🥉" : `${puesto}°`;

export const TarjetaRecap = forwardRef<View, ViewProps & { recap: Recap }>(
  function TarjetaRecap({ recap, style, ...props }, ref) {
    const { t } = usePreferencias();
    const { tema } = useTema();
    const duracion = duracionLegible(recap.duracion_ms);
    return (
      <View
        ref={ref}
        collapsable={false}
        {...props}
        style={[{
          width: "100%",
          aspectRatio: 9 / 16,
          backgroundColor: tema.fondo,
          borderColor: tema.acento,
          borderWidth: 2,
          borderRadius: 28,
          padding: 26,
          justifyContent: "space-between",
          overflow: "hidden",
        }, style]}
      >
        <View style={{ position: "absolute", width: 260, height: 260, borderRadius: 130, right: -100, top: -90, backgroundColor: tema.acento + "18" }} />
        <View style={{ gap: 20 }}>
          <LogoBlindly ancho={150} />
          <View>
            <Texto suave style={{ letterSpacing: 2, fontWeight: "700" }}>{t("NOCHE DE POKER")}</Texto>
            <Texto style={{ fontSize: 30, lineHeight: 36, fontWeight: "900" }}>{t("Resultado final")}</Texto>
          </View>
          <View style={{ gap: 12 }}>
            {recap.resultados.slice(0, 3).map((resultado) => (
              <View key={`${resultado.puesto}-${resultado.nombre}`} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Texto style={{ fontSize: 25, width: 42 }}>{medalla(resultado.puesto)}</Texto>
                <Texto style={{ fontSize: 22, fontWeight: resultado.puesto === 1 ? "900" : "700", color: resultado.puesto === 1 ? tema.acento : tema.textoFuerte }}>{resultado.nombre}</Texto>
              </View>
            ))}
          </View>
          <Texto suave style={{ fontSize: 16 }}>
            {t("{n} jugadores", { n: recap.jugadores })}{duracion ? ` • ${duracion}` : ""}
          </Texto>
          {!!recap.liga && (
            <View style={{ padding: 14, borderRadius: 16, backgroundColor: tema.fondoTarjeta }}>
              <Texto style={{ fontWeight: "800" }}>{recap.liga.nombre}</Texto>
              <Texto suave>{recap.liga.temporada}</Texto>
            </View>
          )}
        </View>
        <Texto suave style={{ textAlign: "center", letterSpacing: 1.5 }}>{t("JUGADO CON BLINDLY")}</Texto>
      </View>
    );
  },
);
