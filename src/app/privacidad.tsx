import { Pantalla, Tarjeta, Texto } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";

export default function Privacidad() {
  const { t } = usePreferencias();
  const secciones = [
    [
      "Datos que guarda Blindly",
      "Guardamos un identificador de cuenta, tu nombre de jugador, salas, acciones de mesa, stacks, puntuación e historial. El email es opcional y solo se guarda si protegés tu cuenta.",
    ],
    [
      "Para qué se usan",
      "Los datos permiten autenticarte, sincronizar la partida entre celulares, calcular rangos, recuperar tu historial y proteger la integridad de fichas y puntos.",
    ],
    [
      "Cámara y dispositivo",
      "La cámara solo lee códigos QR de salas. Blindly no guarda ni envía fotos. El tema, el idioma y el volumen se guardan localmente en tu dispositivo.",
    ],
    [
      "Servicios",
      "Supabase aloja la autenticación y la base de datos. RevenueCat gestiona el estado de Blindly Plus cuando está activado. Apple, Google y Expo pueden procesar datos técnicos al distribuir o ejecutar la app. Blindly no vende datos ni usa publicidad.",
    ],
    [
      "Conservación y eliminación",
      "Los datos se conservan mientras exista tu cuenta. Desde Mi cuenta podés eliminar la identidad, los puntos y el historial. Una partida activa debe finalizar antes para no romper la mesa de otros jugadores.",
    ],
    [
      "Tus opciones",
      "Podés jugar sin email, vincular uno para recuperar la cuenta o eliminar todos tus datos. La cámara es opcional porque también podés ingresar el código de sala.",
    ],
  ] as const;
  return (
    <Pantalla
      titulo={t("Política de privacidad")}
      subtitulo={t("Última actualización: 1 de octubre de 2026")}
    >
      {secciones.map(([titulo, detalle]) => (
        <Tarjeta key={titulo}>
          <Texto style={{ fontWeight: "700" }}>{t(titulo)}</Texto>
          <Texto suave>{t(detalle)}</Texto>
        </Tarjeta>
      ))}
      <Texto suave>
        {t(
          "Para consultas de privacidad, usá el canal de soporte publicado en el repositorio oficial de Blindly.",
        )}
      </Texto>
    </Pantalla>
  );
}
