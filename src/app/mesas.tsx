import { capacidadesPlus } from "../lib/capacidadesPlus";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { View } from "react-native";
import { Acceso, Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { usePlus } from "../lib/PlusContext";
import { misMesasHabituales, type MesaHabitual } from "../lib/mesasHabituales";

function stackDe(mesa: MesaHabitual) {
  const fichas = mesa.configuracion.fichas;
  return fichas?.tipo === "virtuales" ? fichas.stack : null;
}

export default function Mesas() {
  const router = useRouter();
  const { t, mensajeError, preferencias } = usePreferencias();
  const { tema } = useTema();
  const plus = usePlus();
  const [mesas, setMesas] = useState<MesaHabitual[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(useCallback(() => {
    let viva = true;
    setCargando(true);
    setError(null);
    void misMesasHabituales().then((datos) => {
      if (viva) setMesas(datos);
    }).catch((e) => {
      if (viva) setError(e);
    }).finally(() => {
      if (viva) setCargando(false);
    });
    return () => { viva = false; };
  }, []));

  return (
    <Pantalla titulo={t("Mis mesas")} subtitulo={t("Tu partida de siempre, lista en pocos toques.")}>
      <Tarjeta style={{ borderColor: tema.acento }}>
        <Etiqueta activa>{t("BLINDLY PLUS")}</Etiqueta>
        <Texto style={{ fontSize: 22, fontWeight: "800" }}>{t("Guardá la mesa de tu grupo")}</Texto>
        <Texto suave>{t("Reutilizá jugadores habituales, fichas, ciegas, duración, tema y liga sin configurar todo otra vez.")}</Texto>
      </Tarjeta>
      {!!error && <Tarjeta><Texto>{mensajeError(error)}</Texto></Tarjeta>}
      {cargando && <Texto>{t("Cargando…")}</Texto>}
      {!cargando && !error && mesas.length === 0 && (
        <Texto suave>{t("Todavía no guardaste una mesa habitual.")}</Texto>
      )}
      {mesas.map((mesa) => {
        const modo = mesa.configuracion.modo;
        const stack = stackDe(mesa);
        const minutos = modo?.niveles.find((n) => !n.esBreak)?.minutos;
        return (
          <Tarjeta key={mesa.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Texto style={{ fontSize: 20, fontWeight: "800" }}>{mesa.nombre}</Texto>
                <Texto suave>{t("{n} jugadores habituales", { n: mesa.jugadores.length })}</Texto>
              </View>
              {!mesa.plus_activo && <Etiqueta>{t("SOLO LECTURA")}</Etiqueta>}
            </View>
            <Texto suave>
              {stack ? `${stack.toLocaleString(preferencias.idioma)} ${t("de stack")}` : t("Fichas físicas")}
              {minutos ? ` · ${minutos} ${t("min por nivel")}` : ""}
            </Texto>
            {!!mesa.liga && <Texto suave>{t("Liga")}: {mesa.liga.nombre} · {mesa.liga.temporada}</Texto>}
            {mesa.jugadores.length > 0 && <Texto suave>{mesa.jugadores.join(" · ")}</Texto>}
            <Boton
              titulo={t("Crear partida")}
              disabled={!mesa.plus_activo}
              onPress={() => router.push({ pathname: "/crear-sala", params: { mesa: mesa.id, mesaNombre: mesa.nombre } })}
            />
            <Boton
              titulo={t("Editar mesa")}
              secundario
              disabled={!mesa.plus_activo}
              onPress={() => router.push(`/mesa-habitual?id=${encodeURIComponent(mesa.id)}` as Href)}
            />
          </Tarjeta>
        );
      })}
      {!capacidadesPlus(plus).premium ? (
        <Boton titulo={t("Recuperar Blindly Plus")} onPress={() => router.push("/plus")} />
      ) : (
        <Acceso
          titulo={t("Nueva mesa habitual")}
          detalle={t("Guardá una plantilla para tu próxima partida.")}
          simbolo="+"
          onPress={() => router.push("/mesa-habitual" as Href)}
        />
      )}
    </Pantalla>
  );
}
