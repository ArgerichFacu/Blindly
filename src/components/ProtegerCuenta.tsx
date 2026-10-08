import { useRouter } from "expo-router";
import { Boton } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
export function necesitaCuenta(error: unknown) {
  return String(
    typeof error === "object" && error && "message" in error
      ? error.message
      : error,
  ).includes("CUENTA_REQUERIDA");
}
export function ProtegerCuenta({
  error,
  volver,
  liga,
  seccion,
  temporada,
}: {
  error: unknown;
  volver: "ligas" | "liga" | "puntuacion" | "head-to-head";
  liga?: string;
  seccion?: string;
  temporada?: string;
}) {
  const router = useRouter(),
    { t } = usePreferencias();
  if (!necesitaCuenta(error)) return null;
  return (
    <Boton
      titulo={t("Proteger mi cuenta")}
      onPress={() =>
        router.push({
          pathname: "/cuenta",
          params: { volver, ...(liga ? { liga } : {}), ...(seccion ? { seccion } : {}), ...(temporada ? { temporada } : {}) },
        })
      }
    />
  );
}
