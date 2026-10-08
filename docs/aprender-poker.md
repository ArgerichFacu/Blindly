# Aprender póker, evaluador y modo principiante

## Experiencia Free

`/instrucciones` conserva su ruta y ahora muestra **Aprender póker**. Incluye cartas físicas y explicaciones breves desplegables de rondas, acciones, ciegas/botón, all-in, pozos secundarios y uso de Blindly con fichas físicas o virtuales. Puede abrir la guía rápida y activar el modo principiante. No aconseja estrategia.

`/combinaciones` ofrece **Probar mis cartas** y **Explorar manos**. Conserva la galería anterior con sus diez combinaciones y desempates. Alternar vistas conserva las cartas elegidas. El selector permite dos cartas propias y cero a cinco comunitarias; las cartas usadas se deshabilitan para evitar duplicados. Permite editar, quitar, limpiar o cargar el ejemplo de escalera real del objetivo maestro.

El resultado se recalcula sin red ni cuenta. Con cinco a siete cartas se resaltan exactamente las cinco que componen la mejor mano, incluidos los kickers, con borde/fondo dorado y etiqueta accesible. Antes de completar cinco se presenta un resultado **provisional**, sin inventar cartas ni declarar un ganador. No modifica partidas, apuestas o repartos; el dealer mantiene el control del pozo real.

## Lógica

`src/lib/poker.ts` valida cantidad, valores, palos y duplicados. Para cinco a siete cartas evalúa todos los grupos de cinco (máximo 21) y compara categoría y valores de desempate. Reconoce carta alta, pareja, doble pareja, trío, escalera, color, full house, poker, escalera de color y escalera real.

El as puede ser alto o bajo en A–2–3–4–5. Los palos no deciden empates. El orden de palos solo hace reproducible la selección visual cuando hay más de un grupo equivalente. Hold'em permite usar cero, una o dos cartas propias. La función no muta la entrada. `compararManos` rechaza comparaciones con resultados incompletos.

Referencias de reglas consultadas: [clasificación y desempates de PokerStars](https://www.pokerstars.com/poker/games/rules/hand-rankings/) y [reglas de Texas Hold'em](https://www.pokerstars.com/poker/games/texas-holdem/). Las explicaciones están redactadas para Blindly; no se incorporó una biblioteca externa de evaluación.

## Ayuda contextual

**Modo principiante** está apagado por defecto y se guarda en las preferencias existentes. Los registros antiguos sin ese campo mantienen el comportamiento anterior. Opciones y Aprender póker permiten cambiarlo.

Cuando está activo aparece «? Ayuda de este turno» durante el turno propio. `PanelApuesta` pasa a `AyudaTurno` los mismos montos y permiso de subida que usa para sus controles: apuesta actual, aporte, diferencia pendiente, igualada total, mínimo, máximo y posibilidad de subir. La ayuda diferencia check legal, call completo/corto, raise completo/corto y subida bloqueada. No calcula permisos nuevos ni concede acciones; las validaciones del servidor siguen siendo la autoridad.

Para fichas físicas, explica las acciones y pide verificar los importes en la mesa, dado que ese modo no registra apuestas virtuales. La ayuda es un modal desplazable, sin animaciones obligatorias, que se cierra con su botón o Atrás sin abandonar la mesa.

## Evidencia y límites

- `tests/poker.cjs`: diez categorías, jerarquía, kickers, as bajo, dos tríos, tres parejas, seis cartas de un palo, color/escalera separados, board compartido, cero/una/dos cartas propias, parciales, entradas inválidas, duplicados y 200 manos reproducibles con propiedades de selección/orden/inmutabilidad.
- `tests/principiante.cjs`: modo apagado, correspondencia entre ayuda y panel, call corto, raise corto/bloqueado, cierre del modal y carga/persistencia compatible de preferencias.
- Suite previa de mesa/SQL/turnos/identidad permanece obligatoria. No se modificaron RPC ni permisos de Supabase.
- Web: selección manual, bloqueo de duplicados, ejemplo real con cinco destacadas, alternancia con galería y layout de 360 px sin desbordamiento horizontal. Traducciones ES/EN/PT verificadas automáticamente.
- Pendiente: aceptación Android/iOS física con lector de pantalla, fuente grande y turno multijugador real. El empaquetado de bundles no es un build nativo firmado ni una prueba en dispositivo.

Los APK/AAB de la release cerrada siguen siendo los originales; estas funciones pertenecen a la próxima versión y requieren una compilación nueva para distribuirse.
