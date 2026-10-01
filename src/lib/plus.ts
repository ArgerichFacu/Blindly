export const PLUS_ENTITLEMENT = "blindly_plus";
export const PLUS_HABILITADO =
  process.env.EXPO_PUBLIC_PLUS_READY === "true";

export const BENEFICIOS_PLUS = [
  {
    simbolo: "◈",
    titulo: "Estadísticas avanzadas",
    detalle: "Analizá resultados, evolución y rendimiento de tus partidas.",
  },
  {
    simbolo: "◆",
    titulo: "Temas y ambientaciones premium",
    detalle: "Personalizá la mesa, los sonidos y la experiencia del torneo.",
  },
  {
    simbolo: "♜",
    titulo: "Presets ilimitados",
    detalle: "Guardá estructuras de ciegas y configuraciones para volver a usarlas.",
  },
  {
    simbolo: "♛",
    titulo: "Herramientas avanzadas para el host",
    detalle: "Administrá torneos frecuentes con más control y menos preparación.",
  },
] as const;
