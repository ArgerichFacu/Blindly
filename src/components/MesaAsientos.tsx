import { Text, View, StyleSheet } from "react-native";
import { Texto } from "./Controles";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
import { rolesMesa } from "../lib/mesa";
import type { Jugador } from "../lib/jugadores";

const fichasRol: Record<string, { fondo: string; texto: string }> = {
  DR: { fondo: "#111827", texto: "#FFFFFF" },
  BTN: { fondo: "#FBBF24", texto: "#422006" },
  SB: { fondo: "#94A3B8", texto: "#0F172A" },
  BB: { fondo: "#2563EB", texto: "#FFFFFF" },
};

function FichasRol({ roles }: { roles: string }) {
  const lista = roles.split(" / ").filter(Boolean);
  if (!lista.length) return null;
  return (
    <View pointerEvents="none" style={styles.roles}>
      {lista.map((rol) => {
        const color = fichasRol[rol] ?? fichasRol.DR;
        return (
          <View
            key={rol}
            style={[
              styles.fichaRol,
              { backgroundColor: color.fondo, borderColor: color.texto },
            ]}
          >
            <View
              style={[
                styles.marcaFicha,
                styles.marcaArriba,
                { backgroundColor: color.texto },
              ]}
            />
            <View
              style={[
                styles.marcaFicha,
                styles.marcaDerecha,
                { backgroundColor: color.texto },
              ]}
            />
            <View
              style={[
                styles.marcaFicha,
                styles.marcaAbajo,
                { backgroundColor: color.texto },
              ]}
            />
            <View
              style={[
                styles.marcaFicha,
                styles.marcaIzquierda,
                { backgroundColor: color.texto },
              ]}
            />
            <View style={[styles.fichaInterior, { borderColor: color.texto }]} />
            <Text style={[styles.textoRol, { color: color.texto }]}>{rol}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function MesaAsientos({
  jugadores,
  orden,
  dealer,
  boton = dealer,
  turno,
  posiciones,
  pozo,
  calle,
}: {
  jugadores: Jugador[];
  orden: string[];
  dealer: string | null;
  boton?: string | null;
  turno?: string | null;
  posiciones?: { sb_id: string | null; bb_id: string | null };
  pozo?: number;
  calle?: string;
}) {
  const { tema } = useTema(),
    { t } = usePreferencias(),
    roles = rolesMesa(jugadores, orden, dealer, boton, posiciones);
  const larga = orden.length > 6,
    alto = larga ? Math.ceil(orden.length / 2) * 76 + 12 : 292;
  return (
    <View style={[styles.marco, { height: alto }]}>
      <View
        style={[
          styles.pano,
          {
            height: alto - 70,
            backgroundColor: tema.pano,
            borderColor: tema.borde,
          },
        ]}
      >
        <View style={[styles.linea, { borderColor: tema.textoSuave + "30" }]} />
        <Texto
          suave
          style={{ fontSize: 9, letterSpacing: 2, fontWeight: "700" }}
        >
          {pozo === undefined ? "B L I N D L Y" : t("POZO TOTAL")}
        </Texto>
        {pozo !== undefined && (
          <Texto
            style={{
              fontSize: 30,
              lineHeight: 37,
              fontWeight: "700",
              color: tema.acento,
              fontVariant: ["tabular-nums"],
            }}
          >
            {pozo.toLocaleString()}
          </Texto>
        )}
        <Texto suave style={{ fontSize: 10, letterSpacing: 1 }}>
          {calle ? t(calle).toUpperCase() : "♠  ♥  ♣  ♦"}
        </Texto>
      </View>
      {orden.map((id, i) => {
        const j = jugadores.find((j) => j.id === id);
        const angulo = Math.PI / 2 + (i * 2 * Math.PI) / orden.length;
        const izquierda = i < Math.ceil(orden.length / 2);
        const idx = izquierda ? i : orden.length - 1 - i;
        const x = larga ? (izquierda ? 0 : 216) : 108 + 104 * Math.cos(angulo),
          y = larga ? 6 + idx * 76 : 112 + 108 * Math.sin(angulo);
        const activo = id === turno;
        return (
          <View
            key={id}
            accessibilityLabel={`${t("Asiento {n}", { n: i + 1 })}, ${j?.nombre ?? ""}, ${roles[id] ?? ""}${activo ? ", " + t("En turno") : ""}`}
            style={[
              styles.asiento,
              {
                left: x,
                top: y,
                backgroundColor: activo ? tema.acento : tema.fondoTarjeta,
                borderColor: activo ? tema.acento : tema.borde,
                opacity: j?.eliminado_en || j?.retirado ? 0.55 : 1,
              },
            ]}
          >
            <FichasRol roles={roles[id] ?? ""} />
            <Texto
              numberOfLines={1}
              style={{
                fontSize: 11,
                lineHeight: 16,
                fontWeight: "700",
                color: activo ? tema.acentoTexto : tema.textoFuerte,
              }}
            >
              {activo ? "▶ " : ""}
              {j?.nombre ?? i + 1}
            </Texto>
            {pozo !== undefined && (
              <Texto
                style={{
                  fontSize: 12,
                  lineHeight: 17,
                  fontWeight: "700",
                  color: activo ? tema.acentoTexto : tema.textoFuerte,
                }}
              >
                {j?.fichas.toLocaleString()}
              </Texto>
            )}
            <Texto
              numberOfLines={1}
              style={{
                fontSize: 8,
                lineHeight: 13,
                letterSpacing: 0.1,
                color: activo ? tema.acentoTexto : tema.textoSuave,
              }}
            >
              {roles[id] || t("Asiento {n}", { n: i + 1 })}
            </Texto>
          </View>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  marco: { width: 300, alignSelf: "center" },
  pano: {
    position: "absolute",
    left: 32,
    top: 35,
    width: 236,
    borderRadius: 120,
    borderWidth: 7,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  linea: { position: "absolute", inset: 10, borderRadius: 110, borderWidth: 1 },
  roles: {
    position: "absolute",
    top: -14,
    flexDirection: "row",
    gap: 2,
    zIndex: 2,
  },
  fichaRol: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  fichaInterior: {
    position: "absolute",
    inset: 2,
    borderRadius: 9,
    borderWidth: 1,
    opacity: 0.55,
  },
  marcaFicha: { position: "absolute", width: 4, height: 2, borderRadius: 1 },
  marcaArriba: { top: 0, transform: [{ rotate: "90deg" }] },
  marcaDerecha: { right: 0 },
  marcaAbajo: { bottom: 0, transform: [{ rotate: "90deg" }] },
  marcaIzquierda: { left: 0 },
  textoRol: { fontSize: 7, lineHeight: 9, fontWeight: "900" },
  asiento: {
    position: "absolute",
    width: 84,
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 7,
    alignItems: "center",
  },
});
