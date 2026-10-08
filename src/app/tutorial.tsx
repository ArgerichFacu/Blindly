import { useState } from "react";
import { Pantalla } from "../components/Controles";
import { PasosTutorial } from "../components/Introduccion";
import { usePreferencias } from "../lib/Preferencias";
import { useVolver } from "../lib/useVolver";
export default function Tutorial() {
  const [paso, setPaso] = useState<0 | 1 | 2>(0);
  const { t } = usePreferencias(),
    volver = useVolver();
  return (
    <Pantalla titulo={t("Guía rápida")} onVolver={volver}>
      <PasosTutorial
        paso={paso}
        avanzar={() => (paso === 2 ? volver() : setPaso((paso + 1) as 1 | 2))}
        retroceder={() => setPaso((paso - 1) as 0 | 1)}
        terminar={volver}
      />
    </Pantalla>
  );
}
