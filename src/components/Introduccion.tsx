import { useRouter } from "expo-router";
import { View } from "react-native";
import { useInicio } from "../lib/InicioContext";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "./Controles";
import { LogoBlindly } from "./LogoBlindly";
import { CartaPoker } from "./CartaPoker";

export function PasosTutorial({
  paso,
  ocupado = false,
  error = false,
  avanzar,
  retroceder,
  terminar,
}: {
  paso: 0 | 1 | 2;
  ocupado?: boolean;
  error?: boolean;
  avanzar: () => void;
  retroceder: () => void;
  terminar: () => void;
}) {
  const { t } = usePreferencias(),
    { tema } = useTema();
  return (
    <>
      <View
        accessible
        accessibilityLabel={t("Paso {n} de 3", { n: paso + 1 })}
        style={{ gap: 10 }}
      >
        <Texto suave>{t("Paso {n} de 3", { n: paso + 1 })}</Texto>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[0, 1, 2].map((n) => (
            <View
              key={n}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 4,
                backgroundColor: n <= paso ? tema.acento : tema.borde,
              }}
            />
          ))}
        </View>
      </View>
      <Tarjeta>
        <Etiqueta>
          {t(
            paso === 0
              ? "EN LA MISMA MESA"
              : paso === 1
                ? "CADA UNO JUEGA SU TURNO"
                : "LA HISTORIA DE TU GRUPO",
          )}
        </Etiqueta>
        <Texto style={{ fontSize: 30, lineHeight: 36, fontWeight: "700" }}>
          {t(
            paso === 0
              ? "Jugamos con cartas de verdad."
              : paso === 1
                ? "Tu mesa bajo control."
                : "Convertí tus noches en una liga.",
          )}
        </Texto>
        {paso === 0 ? (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 12,
                paddingVertical: 18,
              }}
            >
              <CartaPoker valor="A" palo="♠" />
              <CartaPoker valor="K" palo="♥" />
            </View>
            <Texto>
              {t(
                "Blindly lleva el resto: ciegas, stacks y turnos. Las cartas se reparten en la mesa.",
              )}
            </Texto>
          </>
        ) : paso === 1 ? (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                paddingVertical: 14,
              }}
            >
              {["SB", "BB", "BTN", "DR"].map((rol) => (
                <View
                  key={rol}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: tema.acento,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Texto style={{ fontWeight: "800" }}>{rol}</Texto>
                </View>
              ))}
            </View>
            <Texto>
              {t(
                "Con fichas virtuales, cada jugador pasa, iguala, sube o se retira desde su celular. El dealer indica al ganador y reparte el pozo.",
              )}
            </Texto>
          </>
        ) : (
          <>
            <View style={{ paddingVertical: 14, gap: 8 }}>
              <Texto
                style={{ fontSize: 38, lineHeight: 44, color: tema.acento }}
              >
                ♜
              </Texto>
              <Texto style={{ fontWeight: "700" }}>
                {t("Temporadas · Ranking · Historia")}
              </Texto>
            </View>
            <Texto>
              {t(
                "Juntá a tu grupo, sumen partidas y sigan su progreso. Para una partida casual podés seguir como invitado.",
              )}
            </Texto>
          </>
        )}
      </Tarjeta>
      {error && (
        <Texto>{t("No se pudo guardar tu progreso. Probá otra vez.")}</Texto>
      )}
      <Boton
        titulo={t(
          ocupado ? "Guardando…" : paso === 2 ? "Empezar" : "Siguiente",
        )}
        disabled={ocupado}
        onPress={avanzar}
      />
      {paso > 0 && (
        <Boton
          titulo={t("Paso anterior")}
          secundario
          disabled={ocupado}
          onPress={retroceder}
        />
      )}
      {paso < 2 && (
        <Boton
          titulo={t("Omitir tutorial")}
          secundario
          disabled={ocupado}
          onPress={terminar}
        />
      )}
    </>
  );
}

export function Introduccion() {
  const inicio = useInicio(),
    { t } = usePreferencias(),
    router = useRouter();
  return (
    <Pantalla titulo="blindly." volver={false}>
      {!inicio.datos ? (
        <Tarjeta>
          <Texto>
            {t(
              inicio.error
                ? "No se pudo cargar tu inicio. Probá de nuevo."
                : "Cargando…",
            )}
          </Texto>
          {inicio.error && (
            <Boton
              titulo={t("Reintentar")}
              onPress={() => void inicio.cargar()}
            />
          )}
        </Tarjeta>
      ) : inicio.datos.fase === "tutorial" ? (
        <PasosTutorial
          paso={inicio.datos.paso}
          ocupado={inicio.ocupado}
          error={inicio.error}
          avanzar={() => void inicio.avanzar()}
          retroceder={() => void inicio.retroceder()}
          terminar={() => void inicio.terminar()}
        />
      ) : (
        <>
          <LogoBlindly ancho={200} />
          <Etiqueta>{t("POKER ENTRE AMIGOS")}</Etiqueta>
          <Texto
            style={{
              fontSize: 36,
              lineHeight: 42,
              fontWeight: "700",
              letterSpacing: -1,
            }}
          >
            {t("Tu mesa.\nTu liga.\nTus rivalidades.")}
          </Texto>
          <Texto suave>
            {t(
              "Jugá ahora como invitado o protegé tu identidad para llevar tu historia a otro celular.",
            )}
          </Texto>
          {inicio.error && (
            <Texto>
              {t("No se pudo guardar tu progreso. Probá otra vez.")}
            </Texto>
          )}
          <Boton
            titulo={t("Continuar como invitado")}
            disabled={inicio.ocupado}
            onPress={() => void inicio.elegir("invitado")}
          />
          <Boton
            titulo={t("Crear o recuperar cuenta")}
            secundario
            disabled={inicio.ocupado}
            onPress={() =>
              router.push({ pathname: "/cuenta", params: { inicio: "1" } })
            }
          />
          <Texto suave>
            {t(
              "Podés proteger tu cuenta más adelante desde Opciones → Mi cuenta.",
            )}
          </Texto>
        </>
      )}
    </Pantalla>
  );
}
