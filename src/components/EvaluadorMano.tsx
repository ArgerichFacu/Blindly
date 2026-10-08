import { useState } from "react";
import { Pressable, View } from "react-native";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import {
  evaluarHoldem,
  idCarta,
  PALOS,
  valorCarta,
  type Carta,
} from "../lib/poker";
import { Boton, Etiqueta, Tarjeta, Texto } from "./Controles";
import { CartaPoker } from "./CartaPoker";
const ejemplo: Carta[] = [
  { valor: 14, palo: "♠" },
  { valor: 13, palo: "♠" },
  { valor: 12, palo: "♠" },
  { valor: 11, palo: "♠" },
  { valor: 10, palo: "♠" },
  { valor: 4, palo: "♥" },
  { valor: 2, palo: "♦" },
];
export function EvaluadorMano() {
  const [anchoGrupo, setAnchoGrupo] = useState(0);
  const anchoCarta = Math.min(
    58,
    Math.max(44, Math.floor((anchoGrupo - 32) / 5)),
  );
  const { t } = usePreferencias(),
    { tema } = useTema();
  const [cartas, setCartas] = useState<(Carta | null)[]>(Array(7).fill(null));
  const [editando, setEditando] = useState<number | null>(0);
  const [valor, setValor] = useState(14);
  const propias = cartas.slice(0, 2).filter((c): c is Carta => !!c),
    mesa = cartas.slice(2).filter((c): c is Carta => !!c);
  const resultado = propias.length === 2 ? evaluarHoldem(propias, mesa) : null;
  const elegidas = new Set(resultado?.cartas.map(idCarta));
  const nombrePalo = (palo: Carta["palo"]) =>
    t(
      palo === "♠"
        ? "picas"
        : palo === "♥"
          ? "corazones"
          : palo === "♦"
            ? "diamantes"
            : "tréboles",
    );
  function elegir(palo: Carta["palo"]) {
    if (
      editando === null ||
      cartas.some(
        (c, i) => i !== editando && c?.valor === valor && c.palo === palo,
      )
    )
      return;
    const nuevas = cartas.map((c, i) => (i === editando ? { valor, palo } : c));
    setCartas(nuevas);
    setEditando(
      nuevas.findIndex((c) => !c) < 0 ? null : nuevas.findIndex((c) => !c),
    );
  }
  function grupo(desde: number, cantidad: number, titulo: string) {
    return (
      <View style={{ gap: 10 }}>
        <Texto style={{ fontWeight: "700" }}>{titulo}</Texto>
        <View
          onLayout={(e) => setAnchoGrupo(e.nativeEvent.layout.width)}
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
        >
          {Array.from({ length: cantidad }, (_, n) => {
            const i = desde + n,
              carta = cartas[i];
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={
                  carta
                    ? t("Editar {valor} de {palo}", {
                        valor: valorCarta(carta.valor),
                        palo: nombrePalo(carta.palo),
                      }) +
                      (resultado?.completa && elegidas.has(idCarta(carta))
                        ? ". " + t("Parte de tu mejor mano.")
                        : "")
                    : t("Elegir carta {n} de {zona}", {
                        n: n + 1,
                        zona: titulo,
                      })
                }
                accessibilityState={{ selected: editando === i }}
                onPress={() => {
                  setEditando(i);
                  if (carta) setValor(carta.valor);
                }}
                style={{
                  width: anchoCarta,
                  height: anchoCarta * 1.5,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    editando === i ||
                    (carta &&
                      resultado?.completa &&
                      elegidas.has(idCarta(carta)))
                      ? tema.acento
                      : tema.borde,
                  backgroundColor:
                    carta && resultado?.completa && elegidas.has(idCarta(carta))
                      ? tema.acento
                      : tema.fondo,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 3,
                }}
              >
                {carta ? (
                  <View
                    pointerEvents="none"
                    style={{
                      width: "100%",
                      height: "100%",
                      flexDirection: "row",
                      paddingTop: 3,
                    }}
                  >
                    <CartaPoker
                      compacta={anchoCarta < 55}
                      valor={valorCarta(carta.valor)}
                      palo={carta.palo}
                      resaltada={!!resultado && elegidas.has(idCarta(carta))}
                    />
                  </View>
                ) : (
                  <Texto suave style={{ fontSize: 26 }}>
                    +
                  </Texto>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }
  return (
    <>
      <Tarjeta>
        <Etiqueta activa>{t("PROBÁ TU MANO · FREE")}</Etiqueta>
        <Texto suave>
          {t(
            "Elegí dos cartas propias y hasta cinco de la mesa. Tocá una carta para cambiarla.",
          )}
        </Texto>
        {grupo(0, 2, t("Tus cartas"))}
        {grupo(2, 5, t("Cartas de la mesa"))}
        <View
          accessibilityLiveRegion="polite"
          style={{ gap: 6, paddingVertical: 10 }}
        >
          <Texto
            style={{
              fontSize: 24,
              lineHeight: 30,
              fontWeight: "700",
              color: tema.acento,
            }}
          >
            {resultado ? t(resultado.nombre) : t("Elegí tus dos cartas")}
          </Texto>
          <Texto suave>
            {t(
              resultado?.completa
                ? "Las cinco cartas doradas forman tu mejor mano; los kickers también cuentan."
                : "Resultado provisional. Necesitás al menos tres cartas de la mesa para formar una mano de cinco.",
            )}
          </Texto>
        </View>
      </Tarjeta>
      {editando !== null && (
        <Tarjeta>
          <Texto style={{ fontWeight: "700" }}>{t("Elegí valor y palo")}</Texto>
          <Texto suave>{t("Las cartas ya usadas no se pueden repetir.")}</Texto>
          <Texto suave>
            {t("Editando carta {n} de {zona}", {
              n: editando < 2 ? editando + 1 : editando - 1,
              zona: t(editando < 2 ? "Tus cartas" : "Cartas de la mesa"),
            })}
          </Texto>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: 13 }, (_, n) => 14 - n).map((v) => (
              <Pressable
                key={v}
                accessibilityRole="button"
                accessibilityLabel={t("Valor {valor}", {
                  valor: valorCarta(v),
                })}
                accessibilityState={{ selected: valor === v }}
                onPress={() => setValor(v)}
                style={{
                  width: 44,
                  minHeight: 44,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: valor === v ? tema.acento : tema.borde,
                  backgroundColor: valor === v ? tema.acento : tema.fondo,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Texto
                  style={{
                    fontWeight: "700",
                    color: valor === v ? tema.acentoTexto : tema.textoFuerte,
                  }}
                >
                  {valorCarta(v)}
                </Texto>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PALOS.map((palo) => (
              <Boton
                key={palo}
                titulo={palo}
                accesibilidad={t("Seleccionar {palo}", {
                  palo: nombrePalo(palo),
                })}
                style={{ flex: 1 }}
                secundario
                disabled={cartas.some(
                  (c, i) =>
                    i !== editando && c?.valor === valor && c.palo === palo,
                )}
                onPress={() => elegir(palo)}
              />
            ))}
          </View>
          {!!cartas[editando] && (
            <Boton
              titulo={t("Quitar esta carta")}
              secundario
              onPress={() =>
                setCartas(cartas.map((c, i) => (i === editando ? null : c)))
              }
            />
          )}
          <Boton
            titulo={t("Cerrar selector")}
            secundario
            onPress={() => setEditando(null)}
          />
        </Tarjeta>
      )}
      <Boton
        titulo={t("Ver ejemplo de escalera real")}
        secundario
        onPress={() => {
          setCartas(ejemplo.map((c) => ({ ...c })));
          setEditando(null);
        }}
      />
      <Boton
        titulo={t("Limpiar cartas")}
        secundario
        onPress={() => {
          setCartas(Array(7).fill(null));
          setEditando(0);
          setValor(14);
        }}
      />
      <Texto suave>
        {t(
          "Herramienta de aprendizaje: no predice cartas ni decide el ganador de una partida real.",
        )}
      </Texto>
    </>
  );
}
