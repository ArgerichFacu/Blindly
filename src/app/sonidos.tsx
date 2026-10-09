import { VolumenAudio } from "../components/VolumenAudio";
import { useTema } from "../lib/TemaContext";
import { capacidadesPlus } from "../lib/capacidadesPlus";
import { Switch, View } from "react-native";
import { useRouter } from "expo-router";
import { Pantalla, Tarjeta, Texto, Boton } from "../components/Controles";
import { AudioMesa } from "../components/AudioMesa";
import { Botonera } from "../components/Botonera";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
import { SONIDOS, type SonidoId } from "../lib/botonera";
export default function Sonidos() {
  const { t, preferencias: p, cambiar } = usePreferencias(),
    plus = usePlus(),
    router = useRouter(), { tema } = useTema();
  function alternarLista(
    clave: "botoneraVisibles" | "botoneraFavoritos",
    id: SonidoId,
  ) {
    if (!capacidadesPlus(plus).premium) {
      router.push("/plus");
      return;
    }
    cambiar({
      [clave]: p[clave].includes(id)
        ? p[clave].filter((s) => s !== id)
        : [...p[clave], id],
    });
  }
  function subir(id: SonidoId) {
    if (!capacidadesPlus(plus).premium) {
      router.push("/plus");
      return;
    }
    const orden = [...p.botoneraOrden],
      i = orden.indexOf(id);
    if (i > 0) {
      [orden[i - 1], orden[i]] = [orden[i], orden[i - 1]];
      cambiar({ botoneraOrden: orden });
    }
  }
  return (
    <Pantalla titulo={t("Sonidos y ambiente")} subtitulo={t("Elegí el clima de tu mesa.")}>
      <Tarjeta>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Texto style={{ flex: 1 }}>{t("Silenciar todo")}</Texto>
          <Switch
            accessibilityLabel={t("Silenciar todo")}
            value={p.silencio}
            onValueChange={(silencio) => cambiar({ silencio })}
          />
        </View>
        <Texto suave>
          {t(
            "Los ajustes se guardan en este dispositivo. Al volver del fondo, los sonidos esperan a que los reproduzcas.",
          )}
        </Texto>
      </Tarjeta>
      <Tarjeta style={{ gap: 0 }}>{(
        [
          {
            nombre: "Música",
            volumen: "volumenMusica",
            activo: p.musica,
            accion: () => cambiar({ musica: !p.musica }),
          },
          {
            nombre: "Efectos de ronda",
            volumen: "volumenRonda",
            activo: p.sonido,
            accion: () => cambiar({ sonido: !p.sonido }),
          },
          {
            nombre: "Ambiente de casino",
            volumen: "volumenAmbiente",
            activo: p.ambiente === "casino",
            accion: () =>
              cambiar({
                ambiente: p.ambiente === "casino" ? "ninguno" : "casino",
              }),
          },
          {
            nombre: "Botonera",
            volumen: "volumenBotonera",
            activo: p.botonera,
            accion: () => cambiar({ botonera: !p.botonera }),
          },
        ] as const
      ).map((categoria) => (
        <View key={categoria.volumen} style={{ paddingVertical: 14, gap: 8, borderBottomWidth: 1, borderColor: tema.borde }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Texto style={{ flex: 1 }}>{t(categoria.nombre)}</Texto>
            <Switch
              accessibilityLabel={t(categoria.nombre)}
              value={categoria.activo}
              onValueChange={categoria.accion}
            />
          </View>
          <VolumenAudio key={categoria.volumen} canal={t(categoria.nombre)} valor={p[categoria.volumen]} atenuado={p.silencio || !categoria.activo} guardar={valor => cambiar({ [categoria.volumen]: valor })} />
        </View>
      ))}</Tarjeta>
      <Tarjeta>
        <Texto>{t("Escuchar una muestra")}</Texto>
        <Texto suave>
          {t(
            "El ambiente combina sonidos suaves de fichas y cartas. Se inicia solo cuando lo elegís.",
          )}
        </Texto>
        <AudioMesa indice={0} corriendo musica />
        <Botonera />
      </Tarjeta>
      <Tarjeta>
        <Texto>{t("Personalizar botonera · Plus")}</Texto>
        <Texto suave>
          {t(
            "Elegí tus sonidos, marcá favoritos y cambiá el orden. Tus ajustes se conservan si vence Plus.",
          )}
        </Texto>
        {capacidadesPlus(plus).premium ? (
          p.botoneraOrden.map((id, i) => {
            const sonido = SONIDOS.find((s) => s.id === id)!;
            return (
              <View key={id} style={{ gap: 8, paddingVertical: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <Texto style={{ flex: 1 }}>
                    {sonido.simbolo} {t(sonido.nombre)}
                  </Texto>
                  <Switch
                    accessibilityLabel={`${t("Mostrar sonido")}: ${t(sonido.nombre)}`}
                    value={p.botoneraVisibles.includes(id)}
                    onValueChange={() => alternarLista("botoneraVisibles", id)}
                  />
                </View>
                <Boton
                  titulo={t(
                    p.botoneraFavoritos.includes(id)
                      ? "Quitar de favoritos"
                      : "Añadir a favoritos",
                  )}
                  secundario
                  onPress={() => alternarLista("botoneraFavoritos", id)}
                />
                <Boton
                  titulo={t("Mover hacia arriba")}
                  secundario
                  disabled={i === 0}
                  onPress={() => subir(id)}
                />
              </View>
            );
          })
        ) : (
          <Boton
            titulo={t("Conocer Blindly Plus")}
            secundario
            onPress={() => router.push("/plus")}
          />
        )}
      </Tarjeta>
    </Pantalla>
  );
}
