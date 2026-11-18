// Formato de números propio, sin depender de Intl (Hermes en Android no siempre trae los datos
// de todos los idiomas, y "es" de CLDR no agrupa números de 4 cifras: daría 4975 en vez de 4.975).
// es/pt: 4.975 y 1,5 · en: 4,975 y 1.5
export type IdiomaNumero = "es" | "en" | "pt";

export function formatoNumero(n: number, idioma: IdiomaNumero = "es", maxDecimales = 0): string {
  if (!Number.isFinite(n)) return "—";
  const miles = idioma === "en" ? "," : ".";
  const coma = idioma === "en" ? "." : ",";
  const signo = n < 0 ? "-" : "";
  const factor = 10 ** maxDecimales;
  const redondeado = Math.round(Math.abs(n) * factor) / factor;
  const [entero, decimales = ""] = redondeado.toFixed(maxDecimales).split(".");
  const agrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, miles);
  const resto = decimales.replace(/0+$/, "");
  return signo + agrupado + (resto ? coma + resto : "");
}

// Versión corta para fichas: 25 · 500 · 1K · 2,5K · 10K
export function formatoFicha(n: number, idioma: IdiomaNumero = "es"): string {
  if (n >= 1000) return `${formatoNumero(n / 1000, idioma, 1)}K`;
  return formatoNumero(n, idioma);
}
