// El usuario ingresa fecha/hora locales; Supabase recibe un instante UTC.
export function instanteFecha(dia: string, hora: string): string | null {
  const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dia.trim()), h = /^(\d{2}):(\d{2})$/.exec(hora.trim());
  if (!d || !h) return null;
  const [, dd, mm, yyyy] = d, [, hh, min] = h;
  const fecha = new Date(Number(yyyy), Number(mm)-1, Number(dd), Number(hh), Number(min));
  if (fecha.getFullYear()!==Number(yyyy) || fecha.getMonth()!==Number(mm)-1 || fecha.getDate()!==Number(dd)
    || fecha.getHours()!==Number(hh) || fecha.getMinutes()!==Number(min)) return null;
  return fecha.toISOString();
}
