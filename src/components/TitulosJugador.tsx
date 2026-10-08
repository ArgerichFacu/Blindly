import { View } from "react-native";
import { Etiqueta } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { titulosAutomaticos } from "../lib/titulos";
import type { FilaRanking } from "../lib/ligas";

export function TitulosJugador({ fila, esMvp }: { fila: FilaRanking; esMvp: boolean }) {
  const { t } = usePreferencias();
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
    {!!fila.titulo_personalizado && <Etiqueta>{fila.titulo_personalizado}</Etiqueta>}
    {titulosAutomaticos(fila, esMvp).map(id => <Etiqueta key={id} activa={id === "mvp"}>
      {t(id === "mvp" ? "MVP" : id === "tiburon" ? "TIBURÓN" : "REY DEL PODIO")}
    </Etiqueta>)}
  </View>;
}
