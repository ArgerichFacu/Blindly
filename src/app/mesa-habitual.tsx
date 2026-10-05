import { useCallback, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Boton, Campo, Etiqueta, Pantalla, Seccion, Tarjeta, Texto } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { cargarPersonalizado } from "../lib/almacenamiento";
import { NIVELES_REGULAR, PRESETS, type Nivel } from "../lib/niveles";
import { TEMAS, type TemaId } from "../lib/temas";
import { entero, validarNiveles, type Configuracion, type Modo } from "../lib/mesa";
import { misTemporadasPropias, type TemporadaPropia } from "../lib/ligas";
import { eliminarMesaHabitual, guardarMesaHabitual, misMesasHabituales } from "../lib/mesasHabituales";

const FICHAS_FISICAS = [
  { valor: 25, cantidad: 160 },
  { valor: 100, cantidad: 160 },
  { valor: 500, cantidad: 80 },
  { valor: 1000, cantidad: 40 },
];

export default function EditarMesaHabitual() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { t, mensajeError } = usePreferencias();
  const { tema } = useTema();
  const [nombre, setNombre] = useState("");
  const [jugadores, setJugadores] = useState<string[]>([]);
  const [nuevoJugador, setNuevoJugador] = useState("");
  const [tipo, setTipo] = useState<"virtuales" | "fisicas">("virtuales");
  const [stack, setStack] = useState("5000");
  const [modo, setModo] = useState<Modo["id"]>("regular");
  const [niveles, setNiveles] = useState<Nivel[]>(NIVELES_REGULAR);
  const [minutos, setMinutos] = useState("15");
  const [temaId, setTemaId] = useState<TemaId>(tema.id);
  const [temporadaId, setTemporadaId] = useState<string | null>(null);
  const [temporadas, setTemporadas] = useState<TemporadaPropia[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  useFocusEffect(useCallback(() => {
    let viva = true;
    void Promise.all([misMesasHabituales(), misTemporadasPropias(), cargarPersonalizado()])
      .then(([mesas, propias, personalizado]) => {
        if (!viva) return;
        setTemporadas(propias);
        const mesa = id ? mesas.find((m) => m.id === id) : null;
        if (!mesa) return;
        setNombre(mesa.nombre);
        setJugadores(mesa.jugadores);
        setTemaId(mesa.tema_id);
        setTemporadaId(mesa.temporada_id);
        const fichas = mesa.configuracion.fichas;
        if (fichas?.tipo === "virtuales") setStack(String(fichas.stack));
        if (fichas) setTipo(fichas.tipo);
        const configurado = mesa.configuracion.modo;
        if (configurado) {
          setModo(configurado.id);
          setNiveles(configurado.niveles);
          const primero = configurado.niveles.find((n) => !n.esBreak);
          if (primero) setMinutos(String(primero.minutos));
        } else if (personalizado) setNiveles(personalizado);
      })
      .catch((e) => { if (viva) setError(mensajeError(e)); });
    return () => { viva = false; };
  }, [id, mensajeError]));

  const nivelesFinales = useMemo(() => niveles.map((nivel) =>
    nivel.esBreak ? nivel : { ...nivel, minutos: Number(minutos.replace(",", ".")) }
  ), [niveles, minutos]);

  function elegirModo(valor: Modo["id"]) {
    setModo(valor);
    const preset = PRESETS.find((p) => p.id === valor);
    if (preset) {
      setNiveles(preset.niveles);
      const primero = preset.niveles.find((n) => !n.esBreak);
      if (primero) setMinutos(String(primero.minutos));
    } else {
      void cargarPersonalizado().then((guardado) => {
        if (guardado) setNiveles(guardado);
      });
    }
  }

  function agregarJugador() {
    const limpio = nuevoJugador.trim();
    if (!limpio || jugadores.length >= 10 || jugadores.some((j) => j.toLocaleLowerCase() === limpio.toLocaleLowerCase())) return;
    setJugadores([...jugadores, limpio]);
    setNuevoJugador("");
  }

  async function guardar() {
    setError("");
    try {
      if (nombre.trim().length < 2 || !validarNiveles(nivelesFinales)) throw new Error("DATOS_INVALIDOS");
      const configuracion: Configuracion = {
        fichas: tipo === "virtuales"
          ? { tipo, stack: entero(stack, 1) }
          : { tipo, denominaciones: FICHAS_FISICAS },
        modo: { id: modo, niveles: nivelesFinales },
        musica: true,
      };
      setOcupado(true);
      await guardarMesaHabitual({ id, nombre, jugadores, configuracion, tema: temaId, temporadaId });
      router.back();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    if (!id) return;
    setOcupado(true);
    try {
      await eliminarMesaHabitual(id);
      router.back();
    } catch (e) {
      setError(mensajeError(e));
      setOcupado(false);
    }
  }

  return (
    <Pantalla titulo={t(id ? "Editar mesa habitual" : "Nueva mesa habitual")} subtitulo={t("Una plantilla privada para el host.")}>
      <Campo etiqueta={t("Nombre de la mesa")} value={nombre} onChangeText={setNombre} maxLength={50} />
      <Seccion titulo={t("Jugadores habituales")} inicial>
        <Texto suave>{t("Son una lista de referencia. Cada persona igualmente entra con el código o QR.")}</Texto>
        {jugadores.map((jugador) => (
          <Tarjeta key={jugador} style={{ flexDirection: "row", alignItems: "center" }}>
            <Texto style={{ flex: 1 }}>{jugador}</Texto>
            <Boton titulo={t("Quitar")} compacto secundario onPress={() => setJugadores(jugadores.filter((j) => j !== jugador))} />
          </Tarjeta>
        ))}
        {jugadores.length < 10 && (
          <View style={{ gap: 8 }}>
            <Campo etiqueta={t("Nombre del jugador")} value={nuevoJugador} onChangeText={setNuevoJugador} maxLength={30} />
            <Boton titulo={t("Agregar jugador")} secundario onPress={agregarJugador} disabled={!nuevoJugador.trim()} />
          </View>
        )}
      </Seccion>
      <Seccion titulo={t("Fichas")} inicial>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Boton titulo={t("Virtuales")} compacto secundario={tipo !== "virtuales"} style={{ flex: 1 }} onPress={() => setTipo("virtuales")} />
          <Boton titulo={t("Físicas")} compacto secundario={tipo !== "fisicas"} style={{ flex: 1 }} onPress={() => setTipo("fisicas")} />
        </View>
        {tipo === "virtuales" ? (
          <Campo etiqueta={t("Stack inicial por jugador")} value={stack} onChangeText={setStack} keyboardType="number-pad" />
        ) : (
          <Texto suave>{t("Se usará el reparto físico estándar; podés ajustarlo en la sala antes de iniciar.")}</Texto>
        )}
      </Seccion>
      <Seccion titulo={t("Estructura y duración")} inicial>
        {(["turbo", "regular", "deep", "personalizado"] as const).map((valor) => (
          <Boton key={valor} titulo={t(valor === "deep" ? "Deep stack" : valor === "personalizado" ? "Personalizado" : valor === "turbo" ? "Turbo" : "Regular")} secundario={modo !== valor} onPress={() => elegirModo(valor)} />
        ))}
        <Campo etiqueta={t("Minutos por nivel")} value={minutos} onChangeText={setMinutos} keyboardType="decimal-pad" />
        <Texto suave>{t("Los descansos conservan la duración del preset elegido.")}</Texto>
      </Seccion>
      <Seccion titulo={t("Tema")} inicial>
        {TEMAS.map((paleta) => (
          <Boton key={paleta.id} titulo={t(paleta.nombre)} secundario={temaId !== paleta.id} onPress={() => setTemaId(paleta.id)} />
        ))}
      </Seccion>
      <Seccion titulo={t("Liga opcional")} inicial>
        <Boton titulo={t("Sin liga")} secundario={temporadaId !== null} onPress={() => setTemporadaId(null)} />
        {temporadas.map((temporada) => (
          <Boton key={temporada.temporada_id} titulo={`${temporada.liga_nombre} · ${temporada.temporada_nombre}`} secundario={temporadaId !== temporada.temporada_id} onPress={() => setTemporadaId(temporada.temporada_id)} />
        ))}
      </Seccion>
      {!!error && <Texto>{error}</Texto>}
      <Boton titulo={t(ocupado ? "Guardando…" : "Guardar mesa")} disabled={ocupado || nombre.trim().length < 2} onPress={() => void guardar()} />
      {!!id && <Boton titulo={t("Eliminar mesa")} secundario disabled={ocupado} onPress={() => Alert.alert(t("Eliminar mesa"), t("La plantilla se eliminará. Las partidas anteriores no cambian."), [{ text: t("Cancelar"), style: "cancel" }, { text: t("Eliminar"), style: "destructive", onPress: () => void eliminar() }])} />}
      <Etiqueta>{t("Solo vos podés ver y administrar esta plantilla.")}</Etiqueta>
    </Pantalla>
  );
}
