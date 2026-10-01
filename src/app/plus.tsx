import { View } from "react-native";
import { Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { BENEFICIOS_PLUS, PLUS_HABILITADO } from "../lib/plus";

export default function Plus() {
  const { t } = usePreferencias();
  const { tema } = useTema();
  return (
    <Pantalla
      titulo={t("Blindly Plus")}
      subtitulo={t("Una experiencia más completa para quienes organizan y juegan seguido.")}
    >
      <Tarjeta
        style={{
          borderColor: tema.acento,
          backgroundColor: tema.fondoTarjeta,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: 70,
            right: -52,
            top: -58,
            backgroundColor: tema.acento + "18",
          }}
        />
        <Etiqueta activa>{t("PLUS")}</Etiqueta>
        <Texto
          style={{
            fontSize: 30,
            lineHeight: 36,
            fontWeight: "800",
            letterSpacing: -0.8,
          }}
        >
          {t("Tu mesa, a tu manera.")}
        </Texto>
        <Texto suave style={{ fontSize: 14, lineHeight: 22 }}>
          {t(
            "Blindly Plus ampliará la personalización y el análisis sin quitar funciones esenciales de la versión gratuita.",
          )}
        </Texto>
      </Tarjeta>

      {BENEFICIOS_PLUS.map((beneficio) => (
        <Tarjeta key={beneficio.titulo} style={{ flexDirection: "row", gap: 14 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: tema.acento + "18",
            }}
          >
            <Texto style={{ color: tema.acento, fontSize: 21 }}>
              {beneficio.simbolo}
            </Texto>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Texto style={{ fontSize: 16, fontWeight: "700" }}>
              {t(beneficio.titulo)}
            </Texto>
            <Texto suave style={{ fontSize: 13, lineHeight: 19 }}>
              {t(beneficio.detalle)}
            </Texto>
          </View>
        </Tarjeta>
      ))}

      <Tarjeta>
        <Texto style={{ fontWeight: "700" }}>
          {t("El poker entre amigos sigue siendo gratis")}
        </Texto>
        <Texto suave>
          {t(
            "Crear y unirse a salas, gestionar turnos, usar fichas físicas o virtuales y repartir el pozo seguirán disponibles para todos.",
          )}
        </Texto>
      </Tarjeta>

      <Boton
        titulo={t(
          PLUS_HABILITADO ? "Ver planes de Blindly Plus" : "Blindly Plus está en preparación",
        )}
        disabled={!PLUS_HABILITADO}
        onPress={() => {}}
      />
      {!PLUS_HABILITADO && (
        <Texto suave style={{ textAlign: "center", fontSize: 12 }}>
          {t("Todavía no hay compras ni suscripciones activas.")}
        </Texto>
      )}
    </Pantalla>
  );
}
