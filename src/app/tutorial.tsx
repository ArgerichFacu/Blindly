import { useState } from "react";
import { Pantalla } from "../components/Controles";
import { PasosTutorial } from "../components/Introduccion";
import { usePreferencias } from "../lib/Preferencias";
import { useVolver } from "../lib/useVolver";
export default function Tutorial() {
  const [paso, setPaso] = useState<0 | 1 | 2 | 3>(0);
  const { t } = usePreferencias(),
    volver = useVolver();
  return (
    <Pantalla titulo={t("Guía rápida")} onVolver={volver}>
      <PasosTutorial
        paso={paso}
        avanzar={() => (paso === 3 ? volver() : setPaso((paso + 1) as 1 | 2 | 3))}
        retroceder={() => setPaso((paso - 1) as 0 | 1 | 2)}
        terminar={volver}
      />
    </Pantalla>
  );
}
