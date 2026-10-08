# Ligas, temporadas y ranking

> Registro del sprint original de la release cerrada. Desde el 8 de octubre de 2026, la migración `20261008042305_clubes_free_roles.sql` elimina Plus como requisito de las funciones básicas de liga y agrega roles y cuenta recuperable. El comportamiento vigente y las pruebas de la cadena completa se describen en [clubes.md](clubes.md). Las pruebas indicadas aquí reconstruyen el estado histórico previo.

Blindly Free conserva intacto el juego presencial: cualquier usuario puede crear o unirse a una sala, jugar con fichas físicas o virtuales y completar un torneo. Blindly Plus permite que el host habitual organice esos torneos dentro de una liga privada.

## Flujo de uso

1. Un usuario con el entitlement `blindly_plus` abre **Mis ligas** y crea una liga con su primera temporada.
2. Desde la liga crea una partida asociada. La sala usa el mismo flujo, código, QR y motor de juego que cualquier partida Free.
3. Los invitados se unen normalmente y no necesitan Plus. Al comenzar, pasan a ser miembros de la liga con el nombre usado en la mesa.
4. El dealer termina el torneo y reparte el pozo final. La misma transacción que acredita `puntuacion_partidas` asocia los resultados a la temporada.
5. El ranking se deriva en Supabase a partir de esos resultados: partidas jugadas, victorias, podios, puntos y posición media.

El owner puede editar el nombre, finalizar una temporada, crear la siguiente, archivar o reactivar la liga y retirar miembros. Una temporada no se puede finalizar mientras tenga una sala asociada esperando jugadores, jugando o pausada. Una sala asociada que todavía no comenzó vuelve a comprobar Plus en el servidor al iniciarse.

## Cancelación y restauración de Plus

RevenueCat sigue siendo la autoridad comercial. La Edge Function autenticada `sincronizar-plus` consulta el entitlement `blindly_plus` con `REVENUECAT_SECRET_KEY` y guarda una verificación de corta duración en `accesos_plus`. Las RPC administrativas aceptan únicamente un acceso activo verificado durante los últimos 15 minutos.

Si el owner cancela Plus:

- no se borra la liga;
- no se borran temporadas, miembros, partidas ni puntos;
- todos los miembros conservan acceso de lectura;
- el owner no puede crear otra temporada o partida asociada ni modificar miembros;
- una partida asociada que ya empezó puede terminar sin consultar la suscripción de los invitados.

Una sala que seguía esperando jugadores antes de la cancelación no puede comenzar hasta restaurar Plus. Esto evita reservar salas antes de cancelar y utilizarlas como nuevas partidas de liga después.

Al restaurar Plus, la siguiente sincronización reactiva la administración con todos los datos anteriores.

## Modelo de datos

| Objeto | Propósito |
| --- | --- |
| `accesos_plus` | Caché privada del entitlement verificado por la Edge Function. No tiene acceso cliente. |
| `ligas` | Nombre, owner y estado activa/archivada. |
| `liga_temporadas` | Temporadas activas o finalizadas; existe como máximo una activa por liga. |
| `liga_miembros` | Miembros y nombre visible dentro de la liga. |
| `liga_partidas` | Asociación persistente entre sala y temporada, con fecha, duración y cantidad de jugadores. |
| `puntuacion_partidas.temporada_id` | Relación del resultado autoritativo con la temporada. |

`liga_partidas.sala_id` no tiene una clave foránea hacia `salas`. Esto es deliberado: el historial de liga permanece después de eliminar una sala finalizada, igual que `puntuacion_partidas`.

## Seguridad

- Todas las tablas nuevas tienen RLS activo.
- `authenticated` sólo recibe lectura de ligas, temporadas, miembros y partidas, limitada a owner o miembro activo.
- Ningún cliente recibe `INSERT`, `UPDATE` o `DELETE` sobre las tablas de liga, resultados o accesos Plus.
- Las escrituras pasan por RPC `SECURITY DEFINER` con `search_path=''`, `auth.uid()`, ownership y entitlement comprobados.
- `accion_mesa` conserva la idempotencia existente y alimenta la liga sólo después de que el motor validó el comienzo o cierre.
- El ranking reutiliza `puntos_posicion`; no existe un segundo algoritmo ni un campo de puntos editable por el cliente.

La migración incremental es `20261004221957_ligas_temporadas_ranking.sql`. No modifica las migraciones históricas. El archivo numerado `16_ligas_temporadas_ranking.sql` es una copia verificable para reconstruir un proyecto nuevo; las pruebas exigen que ambos archivos permanezcan idénticos.

La migración está aplicada y registrada en el proyecto de producción `ddvbbkwhisuezloorhfg`. Una auditoría remota del 5 de octubre de 2026 verificó las cinco tablas, las cuatro columnas incorporadas, RLS, políticas, privilegios y las RPC. Los catorce controles devolvieron `true`.

## Despliegue

La función requiere el secreto que ya usa la eliminación de cuenta:

```powershell
npx supabase secrets set REVENUECAT_SECRET_KEY=... --project-ref TU_PROJECT_REF
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
npx supabase functions deploy sincronizar-plus --project-ref TU_PROJECT_REF
```

No guardes la clave de RevenueCat en `.env`, EAS, Git ni una variable `EXPO_PUBLIC`.

## Verificación

`tests/ligas-sql.cjs` cubre:

- owner sin Plus rechazado;
- creación con Plus y acceso lifetime;
- invitado Free dentro de una liga Plus;
- asociación real de una partida y ranking derivado;
- reintento idempotente del cierre;
- privacidad de no miembros;
- bloqueo de escrituras directas y modificación de puntos;
- cancelación en modo lectura y restauración;
- bloqueo del inicio de una sala pendiente después de cancelar Plus;
- bloqueo del cierre de temporada mientras exista una sala pendiente o activa;
- finalización y creación de temporadas;
- retiro de miembros sin borrar resultados históricos.

La verificación remota crea una identidad anónima temporal, invoca `sincronizar-plus`, compara su respuesta con `mi_estado_plus` y elimina la cuenta al finalizar. También cubre la respuesta HTTP `201` que RevenueCat usa al materializar un suscriptor por primera vez.

Ejecutá `npm test`, `npm run typecheck` y `npm run build:bundles` después de cualquier cambio en esta funcionalidad.

## Alcance de este sprint

Esta migración cierra auditoría, modelo de datos, RLS, ligas, temporadas, integración con el resultado autoritativo y ranking. Mesa habitual, Head-to-Head, Recap, tarjetas para compartir e historial Free/Plus se implementan de forma incremental en `17_plus_mesas_estadisticas_recap.sql`; consultá [experiencia Plus](experiencia-plus.md).
