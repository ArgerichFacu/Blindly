import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pantalla,
  Boton,
  Texto,
  Tarjeta,
  Acceso,
  Seccion,
} from "../components/Controles";
import { useSala } from "../lib/useSala";
import { useAccionMesa } from "../lib/useAccionMesa";
import { usePreferencias } from "../lib/Preferencias";
import { PRESETS, type Nivel } from "../lib/niveles";
import { cargarPersonalizado } from "../lib/almacenamiento";
import { usePlus } from "../lib/PlusContext";
import {
  adaptarNiveles,
  recomendarModo,
  repartirFisicas,
  validarNiveles,
  type Modo,
} from "../lib/mesa";
export default function ModoJuego() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>(),
    router = useRouter(),
    { t, mensajeError } = usePreferencias(),
    plus = usePlus();
  const mesa = useSala(codigo),
    { sala, jugadores } = mesa,
    accion = useAccionMesa(sala, mesa.aplicar);
  const [elegido, setElegido] = useState<Modo["id"] | null>(null),
    [personalizado, setPersonalizado] = useState<Nivel[] | null>(null),
    [error, setError] = useState("");
  useFocusEffect(
    useCallback(() => {
      void cargarPersonalizado().then(setPersonalizado);
    }, []),
  );
  const seleccion = elegido ?? sala?.configuracion.modo?.id ?? null;
  let recomendado: Modo["id"] = "regular";
  const fichas = sala?.configuracion.fichas;
  if (fichas?.tipo === "fisicas") {
    try {
      recomendado = recomendarModo(
        repartirFisicas(fichas.denominaciones, jugadores.length).unidades,
      );
    } catch {}
  }
  const base =
    seleccion === "personalizado"
      ? (personalizado ?? sala?.configuracion.modo?.niveles)
      : PRESETS.find((p) => p.id === seleccion)?.niveles;
  let niveles = base;
  try {
    if (base)
      niveles = adaptarNiveles(base, seleccion ?? "", fichas, jugadores.length);
  } catch {}
  function guardar() {
    if (seleccion === "personalizado" && plus.disponible && !plus.activo) {
      router.push("/plus");
      return;
    }
    if (!seleccion || !niveles || !validarNiveles(niveles)) {
      setError(t("Niveles inválidos"));
      return;
    }
    accion.ejecutar(
      "configurar",
      { seccion: "modo", valor: { id: seleccion, niveles } },
      () => router.back(),
    );
  }
  return (
    <Pantalla titulo={t("Modo de juego")}>
      <Texto>
        {t("Recomendado: {modo}", {
          modo: t(
            recomendado === "deep"
              ? "Deep stack"
              : recomendado === "turbo"
                ? "Turbo"
                : "Regular",
          ),
        })}
      </Texto>
      <Texto suave>
        {t(
          fichas?.tipo === "fisicas"
            ? "Recomendación por cantidad de piezas por jugador: menos de 30, Turbo; de 30 a 59, Regular; desde 60, Deep stack. Podés elegir otro."
            : "En virtual, Regular ofrece un ritmo equilibrado; podés elegir otro modo.",
        )}
      </Texto>
      {(["turbo", "regular", "deep", "personalizado"] as const).map((id) => (
        <Acceso
          key={id}
          titulo={
            id === "personalizado"
              ? `${t("Personalizado")} · Plus`
              : id === "deep"
                ? t("Deep stack")
                : id === "turbo"
                  ? t("Turbo")
                  : t("Regular")
          }
          detalle={t(
            id === "turbo"
              ? "Más acción, ciegas más rápidas."
              : id === "regular"
                ? "El equilibrio para una noche entre amigos."
                : id === "deep"
                  ? "Más fichas y tiempo para pensar."
                  : "Elegí tus propios niveles y descansos.",
          )}
          simbolo={
            id === "turbo"
              ? "↗"
              : id === "regular"
                ? "♠"
                : id === "deep"
                  ? "◷"
                  : "≡"
          }
          activo={seleccion === id}
          onPress={() =>
            id === "personalizado" && plus.disponible && !plus.activo
              ? router.push("/plus")
              : setElegido(id)
          }
        />
      ))}
      {seleccion === "personalizado" && (
        <Boton
          titulo={t("Editar niveles")}
          secundario
          onPress={() => router.push("/editor")}
        />
      )}
      {niveles && (
        <Seccion titulo={t("Ver niveles")}>
          <Tarjeta>
            {niveles.map((n, i) => (
              <Texto key={i}>
                {n.esBreak
                  ? t("Descanso")
                  : t("Nivel {n}", {
                      n: niveles.slice(0, i + 1).filter((x) => !x.esBreak)
                        .length,
                    })}
                : {n.esBreak ? "" : `${n.smallBlind}/${n.bigBlind} · `}
                {n.minutos} min
              </Texto>
            ))}
          </Tarjeta>
        </Seccion>
      )}
      {!!(error || accion.error || mesa.error) && (
        <Texto>{error || accion.error || mensajeError(mesa.error)}</Texto>
      )}
      {accion.incierto && (
        <Boton titulo={t("Reintentar")} onPress={accion.reintentar} />
      )}
      <Boton
        titulo={t("Guardar")}
        disabled={
          !seleccion ||
          !niveles ||
          accion.ocupado ||
          sala?.host_id !== mesa.usuario ||
          sala?.estado !== "esperando"
        }
        onPress={guardar}
      />
    </Pantalla>
  );
}
