# Navegación Atrás

## Comportamiento

Las pantallas secundarias consumen Atrás de Android solo mientras están enfocadas. Vuelven al destino anterior del stack; si no existe historial, reemplazan la pantalla por el menú. El menú conserva el comportamiento de salida del sistema. El editor de niveles usa el mismo comportamiento para Cancelar y para volver después de guardar.

El layout declara `anchor: "index"` para que los accesos directos tengan un menú al cual volver. Las pantallas conservan la navegación normal de Expo Router.

Una mesa jugando o pausada pide confirmación antes de retirar su pantalla del stack, sea con Atrás, el botón visual o un gesto nativo. Durante la carga inicial también se protege la pantalla, hasta conocer el estado real. Cancelar conserva la mesa; confirmar repite la acción original. Salir de la pantalla no ejecuta Fold, no elimina al participante ni pausa la partida. El usuario puede volver con el código. Abrir Opciones o Combinaciones encima de la mesa sigue funcionando sin confirmación; al volver a ellas reaparece la mesa.

Los modales de reparto y edición de stacks mantienen su `onRequestClose`: Atrás cierra el modal y no sale de la mesa. Las alertas repetidas se agrupan en una sola confirmación.

## Implementación

- `src/lib/useVolver.ts`: listener Android por foco, historial y retorno al menú.
- `src/lib/useSalidaMesa.ts`: confirmación de retirada del stack usando el hook de navegación incluido en Expo Router 57 (`expo-router/react-navigation`). La API de nivel superior con `repeat()` pertenece al SDK 58 y no se utiliza aquí.
- `src/components/Controles.tsx`: navegación común del botón visual y Android.
- `src/components/Mesa.tsx`: protección de mesa activa y carga inicial.
- `src/app/editor.tsx`: cancelación y guardado consistentes.
- `src/app/_layout.tsx`: ancla del menú para accesos directos.

No hay migraciones ni cambios de permisos o datos de partida.

## Evidencia y límites

`tests/navegacion.cjs` ejecuta los hooks con dobles de Router, foco, BackHandler, Alert y prevención de retirada. Cubre historial normal, acceso sin historial, raíz, limpieza al desenfocar, cancelación, confirmación, alertas repetidas, descarte y web/iOS. Comprueba lógica y callbacks; no sustituye el stack nativo en un dispositivo.

También pasaron `npm test`, `npm run typecheck`, `npm run lint`, Expo Doctor online (21/21), auditoría crítica y exportación web/Android/iOS. En el navegador se recorrió Menú → Opciones → Combinaciones → Volver y acceso directo a Editor → Cancelar → Menú sin errores de consola.

ADB no detectó dispositivos autorizados. La prueba Android física todavía está pendiente. Estos cambios se incorporarán a la próxima build; los APK/AAB de la release cerrada desde `a147e78` conservan su contenido original.

## Aceptación en dispositivo

1. Menú → Opciones → Combinaciones. Atrás vuelve a Opciones; otro Atrás vuelve al menú. Solo desde el menú se permite salir de la app.
2. Abrir directamente una pantalla secundaria y comprobar que Atrás llega al menú.
3. Crear o unirse a una sala de espera. Atrás vuelve normalmente.
4. En una mesa jugando y otra pausada, pulsar Atrás: cancelar conserva la mesa; confirmar vuelve y permite reingresar con el código.
5. Repetir pulsaciones rápidas: debe verse una sola confirmación.
6. Abrir Opciones desde la mesa y volver: reaparece la mesa sin una alerta innecesaria.
7. Abrir reparto o edición de stacks: Atrás cierra el modal; la mesa permanece abierta.
8. Probar los gestos de navegación Android y el swipe de iOS. Confirmar que no se abandona una partida accidentalmente.

Referencias: [Expo Router 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/), [ancla del stack](https://docs.expo.dev/router/advanced/router-settings/) y [BackHandler](https://reactnative.dev/docs/backhandler).
