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
      "Supabase aloja autenticación y datos. RevenueCat verifica Blindly Plus. Apple, Google y Expo procesan información técnica para prestar sus servicios. Blindly no vende datos personales.",
    ],
    [
      "Publicidad opcional",
      "Free puede mostrar como máximo un anuncio interstitial de Google AdMob por sesión, sólo después de crear o unirse correctamente a una sala y antes del lobby. Plus, incluido Founder Trial, no muestra anuncios. En esta versión la publicidad pública está apagada: sólo testers autorizados pueden recibir anuncios de prueba.",
    ],
    [
      "Datos del servicio publicitario",
      "Al solicitar anuncios, Google puede procesar IP, interacciones, diagnósticos, identificadores técnicos y señales de consentimiento. La IP puede indicar ubicación aproximada. No enviamos nombres, email, clubes, códigos de sala ni resultados a AdMob. Esta fase bloquea Advertising ID en Android y solicita anuncios de prueba no personalizados; otros datos técnicos pueden seguir siendo tratados.",
    ],
    [
      "Consentimiento publicitario",
      "Si Google requiere consentimiento y no está disponible, se omite el anuncio. Con anuncios apagados y sin autorización de prueba no se pide consentimiento publicitario. Las opciones de consentimiento y revocación deben completarse antes de activar anuncios reales. Esta fase no ofrece un panel de preferencias publicitarias.",
    ],
    [
      "Conservación y eliminación",
      "Los datos se conservan mientras exista tu cuenta. Desde Mi cuenta podés eliminar la identidad, los puntos y el historial. Una partida activa debe finalizar antes para no romper la mesa de otros jugadores.",
    ],
    [
      "Clubes y notificaciones",
      "Los clubes guardan miembros, roles, títulos, temporadas, resultados, fechas y tus preferencias de avisos. Si activás notificaciones y das permiso, guardamos el token de este dispositivo para enviar avisos mediante Expo y Google o Apple. Podés desactivarlos por club o en el sistema. Los tokens y eventos de MVP asociados se eliminan al borrar tu cuenta.",
    ],
    [
      "Tus opciones",
      "Podés jugar sin email, vincular uno para recuperar la cuenta o eliminar todos tus datos. La cámara es opcional porque también podés ingresar el código de sala.",
    ],
  ] as const;
  return (
    <Pantalla
      titulo={t("Política de privacidad")}
      subtitulo={t("Última actualización: 6 de noviembre de 2026")}
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
