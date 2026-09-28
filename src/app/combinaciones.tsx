import { useState } from "react";
import { View, Pressable } from "react-native";
import { Pantalla, Texto, Tarjeta, Etiqueta } from "../components/Controles";
import { CartaPoker, type Palo } from "../components/CartaPoker";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
type Mano = {
  nombre: string;
  descripcion: string;
  cartas: [string, Palo][];
  destacadas: number[];
  desempate: string;
};
const manos: Mano[] = [
  {
    nombre: "Escalera real",
    descripcion: "Del 10 al as, todas del mismo palo.",
    cartas: [
      ["10", "♠"],
      ["J", "♠"],
      ["Q", "♠"],
      ["K", "♠"],
      ["A", "♠"],
    ],
    destacadas: [0, 1, 2, 3, 4],
    desempate:
      "Es la mano más alta. Si ambos tienen escalera real, se divide el pozo.",
  },
  {
    nombre: "Escalera de color",
    descripcion: "Cinco cartas seguidas del mismo palo.",
    cartas: [
      ["5", "♥"],
      ["6", "♥"],
      ["7", "♥"],
      ["8", "♥"],
      ["9", "♥"],
    ],
    destacadas: [0, 1, 2, 3, 4],
    desempate: "Gana la escalera que termina en la carta más alta.",
  },
  {
    nombre: "Poker",
    descripcion: "Cuatro cartas del mismo valor.",
    cartas: [
      ["A", "♠"],
      ["A", "♥"],
      ["A", "♦"],
      ["A", "♣"],
      ["K", "♠"],
    ],
    destacadas: [0, 1, 2, 3],
    desempate:
      "Gana el grupo de cuatro más alto. Si es igual, decide la quinta carta.",
  },
  {
    nombre: "Full house",
    descripcion: "Un trío y una pareja.",
    cartas: [
      ["K", "♠"],
      ["K", "♥"],
      ["K", "♦"],
      ["9", "♣"],
      ["9", "♥"],
    ],
    destacadas: [0, 1, 2, 3, 4],
    desempate:
      "Se compara primero el trío. Si es igual, gana la pareja más alta.",
  },
  {
    nombre: "Color",
    descripcion: "Cinco cartas del mismo palo, sin escalera.",
    cartas: [
      ["A", "♦"],
      ["J", "♦"],
      ["8", "♦"],
      ["5", "♦"],
      ["2", "♦"],
    ],
    destacadas: [0, 1, 2, 3, 4],
    desempate:
      "Compará las cartas de mayor a menor. La primera diferencia decide.",
  },
  {
    nombre: "Escalera",
    descripcion: "Cinco cartas seguidas, de distintos palos.",
    cartas: [
      ["5", "♠"],
      ["6", "♥"],
      ["7", "♦"],
      ["8", "♣"],
      ["9", "♠"],
    ],
    destacadas: [0, 1, 2, 3, 4],
    desempate:
      "Gana la carta más alta de la escalera. En A–2–3–4–5, el as vale bajo.",
  },
  {
    nombre: "Trío",
    descripcion: "Tres cartas del mismo valor.",
    cartas: [
      ["Q", "♠"],
      ["Q", "♥"],
      ["Q", "♦"],
      ["8", "♣"],
      ["3", "♠"],
    ],
    destacadas: [0, 1, 2],
    desempate:
      "Gana el trío más alto. Si es igual, se comparan las otras dos cartas de mayor a menor.",
  },
  {
    nombre: "Doble pareja",
    descripcion: "Dos parejas de valores diferentes.",
    cartas: [
      ["J", "♠"],
      ["J", "♥"],
      ["7", "♦"],
      ["7", "♣"],
      ["2", "♠"],
    ],
    destacadas: [0, 1, 2, 3],
    desempate:
      "Compará la pareja más alta, después la otra pareja y, por último, la quinta carta.",
  },
  {
    nombre: "Pareja",
    descripcion: "Dos cartas del mismo valor.",
    cartas: [
      ["10", "♠"],
      ["10", "♥"],
      ["8", "♦"],
      ["5", "♣"],
      ["2", "♠"],
    ],
    destacadas: [0, 1],
    desempate:
      "Gana la pareja más alta. Si es igual, se comparan las otras tres cartas de mayor a menor.",
  },
  {
    nombre: "Carta alta",
    descripcion: "Sin combinación, cuenta la carta más alta.",
    cartas: [
      ["A", "♠"],
      ["J", "♥"],
      ["8", "♦"],
      ["5", "♣"],
      ["2", "♠"],
    ],
    destacadas: [0],
    desempate:
      "Compará las cinco cartas de mayor a menor. La primera diferencia decide.",
  },
];
export default function Combinaciones() {
  const { t } = usePreferencias(),
    { tema } = useTema();
  const [abierta, setAbierta] = useState<string | null>(null);
  return (
    <Pantalla
      titulo={t("Combinaciones de poker")}
      subtitulo={t("Tu guía para leer la mesa.")}
    >
      <View style={{ gap: 10, marginBottom: 6 }}>
        <Etiqueta activa>{t("DE MAYOR A MENOR")}</Etiqueta>
        <Texto suave>
          {t(
            "Diez manos, un vistazo. Tocá una combinación para ver cómo se desempata.",
          )}
        </Texto>
      </View>
      {manos.map((mano, i) => {
        const expandida = abierta === mano.nombre;
        return (
          <View
            key={mano.nombre}
            style={{
              padding: 17,
              gap: 14,
              backgroundColor: tema.fondoTarjeta,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: expandida ? tema.acento : tema.borde,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                t(mano.nombre) + ". " + t("Cómo se desempata")
              }
              accessibilityState={{ expanded: expandida }}
              onPress={() => setAbierta(expandida ? null : mano.nombre)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                minHeight: 44,
              }}
            >
              <View
                style={{
                  height: 37,
                  width: 37,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: i === 0 ? tema.acento : tema.fondo,
                }}
              >
                <Texto
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: i === 0 ? tema.acentoTexto : tema.acento,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Texto>
              </View>
              <View style={{ flex: 1 }}>
                <Texto
                  style={{ fontSize: 17, fontWeight: "700", lineHeight: 23 }}
                >
                  {t(mano.nombre)}
                </Texto>
                {i === 0 && (
                  <Texto suave style={{ fontSize: 10, letterSpacing: 1 }}>
                    {t("LA MANO MÁS ALTA")}
                  </Texto>
                )}
              </View>
              <Texto suave style={{ fontSize: 19 }}>
                {expandida ? "−" : "+"}
              </Texto>
            </Pressable>
            <View style={{ flexDirection: "row", gap: 7, paddingTop: 3 }}>
              {mano.cartas.map(([valor, palo], idx) => (
                <CartaPoker
                  key={idx}
                  valor={valor}
                  palo={palo}
                  resaltada={mano.destacadas.includes(idx)}
                />
              ))}
            </View>
            <Texto suave style={{ fontSize: 13, lineHeight: 20 }}>
              {t(mano.descripcion)}
            </Texto>
            {expandida && (
              <View
                style={{
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderColor: tema.borde,
                  gap: 5,
                }}
              >
                <Texto
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: tema.acento,
                  }}
                >
                  {t("Cómo se desempata")}
                </Texto>
                <Texto style={{ fontSize: 13 }}>{t(mano.desempate)}</Texto>
              </View>
            )}
          </View>
        );
      })}
      <Tarjeta>
        <Texto style={{ fontWeight: "700" }}>{t("Acordate de esto")}</Texto>
        <Texto suave>
          {t(
            "En Texas Hold’em usás la mejor combinación de cinco cartas entre tus dos cartas y las cinco de la mesa.",
          )}
        </Texto>
        <Texto suave>
          {t(
            "Los palos no tienen jerarquía. Si la combinación y los cinco valores son iguales, se divide el pozo.",
          )}
        </Texto>
        <Texto suave style={{ fontSize: 12 }}>
          {t(
            "Resaltamos el grupo principal; las otras cartas también pueden desempatar.",
          )}
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}
