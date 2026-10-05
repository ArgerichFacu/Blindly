# Experiencia Plus: mesas, estadísticas y recap

La migración `20261005170548_plus_mesas_estadisticas_recap.sql` completa las fases 8 a 13 del plan freemium. Reutiliza `salas`, `puntuacion_partidas`, `liga_temporadas` y la verificación server-side del entitlement `blindly_plus`.

Está aplicada y registrada en el proyecto remoto `ddvbbkwhisuezloorhfg`. La auditoría del 5 de octubre de 2026 verificó tabla, RLS, política de owner, privilegios, RPC públicas, helpers privados y el límite Free; una prueba real con una identidad temporal confirmó los bloqueos Plus y la privacidad del recap.

## Mesas habituales

`mesas_habituales` guarda una plantilla privada del owner: nombre, jugadores de referencia, configuración completa de fichas y niveles, tema y temporada opcional. Una plantilla no crea jugadores falsos ni una segunda clase de partida. `crear_sala_desde_mesa` copia sus ajustes a una sala normal; cada persona entra después con el código o QR y el host puede quitar nombres ausentes de la lista de referencia antes de iniciar.

Las lecturas están limitadas al owner mediante RLS. No existen permisos directos de inserción, actualización o borrado para el cliente. `guardar_mesa_habitual`, `eliminar_mesa_habitual` y `crear_sala_desde_mesa` verifican sesión, ownership y Plus vigente. Si Plus se cancela, las plantillas permanecen visibles en modo lectura y no se pueden usar para iniciar otra partida. Al restaurar Plus reaparecen operativas sin recuperar ni duplicar datos.

## Historial y estadísticas

`mi_puntuacion` sigue siendo la única consulta del historial personal:

- Free recibe como máximo sus 10 partidas recientes.
- Plus recibe el historial completo ya almacenado, incluida la etapa anterior a la compra.
- Las estadísticas Plus se derivan en PostgreSQL: partidas, victorias, podios, win rate, posición promedio, mejor y peor posición, mejor racha de victorias, evolución acumulada y rendimiento mensual.

No se elimina ni recorta ninguna fila de `puntuacion_partidas`. El límite Free se aplica dentro de la RPC y no depende de ocultar controles React Native.

`mi_head_to_head` exige Plus en servidor. Solo compara al usuario autenticado contra identidades que aparecen en las mismas partidas finalizadas. Devuelve totales agregados de esos cruces y nunca el historial individual del rival.

## Recap y tarjeta compartible

`recap_partida` exige que `auth.uid()` tenga un resultado finalizado en la sala solicitada. Devuelve posiciones, nombres conservados al iniciar, puntos, duración y liga/temporada cuando existe. No devuelve UUID de otros jugadores, código de sala, stacks, apuestas ni datos de cuenta.

El recap está disponible para todos los participantes. La tarjeta compartible es Plus, usa una vista vertical 9:16 y se captura a 1080×1920 con `react-native-view-shot`; `expo-sharing` abre el share sheet nativo. En web se comparte un resumen de texto porque los navegadores no comparten archivos locales mediante la misma API.

## Validación

`tests/plus-experiencia-sql.cjs` prueba:

- rechazo de operaciones sin Plus;
- creación de plantilla y sala normal precargada;
- bloqueo de escrituras directas y aislamiento por owner;
- conservación durante cancelación y recuperación al restaurar;
- 10 resultados para Free y todos los resultados para Plus;
- estadísticas derivadas, head-to-head y privacidad del recap.

La migración también envuelve `accion_mesa` para conservar nombre y duración en partidas futuras, incluidas las que no pertenecen a una liga. Los puntos, puestos y ganadores continúan produciéndose únicamente en el cierre autoritativo existente.
