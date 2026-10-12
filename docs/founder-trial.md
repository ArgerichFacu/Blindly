# Blindly Plus · lanzamiento Founder Trial

Implementación del 12 de octubre de 2026. Proyecto real: `G:\Blindly\proyecto`, rama `main`. Se partió de `d57e21d`, con árbol limpio y las pruebas de Auth aprobadas. Auth, OAuth, callbacks, claves legacy, UUID y productos RevenueCat no se modificaron.

## Estado de lanzamiento

**Trial ON / Payments OFF.** Founder Trial es una prueba gratuita de 72 horas; Founder Lifetime es el futuro producto pago de acceso vitalicio. No son la misma promoción. El bloque de implementación no activó pagos ni publicó una versión. En la entrega posterior se compiló y validó **v29**, publicada en la prueba interna el 12 de octubre a las 19:41 ART. La v28 conserva el bloque Auth anterior. [Validación de la entrega Android](founder-entrega.md).

La prueba empieza únicamente al confirmar **PROBAR PLUS GRATIS · 3 DÍAS → Empezar prueba**. Instalar, iniciar sesión, consultar estado o abrir Plus no la inicia. Ahora no cancela sin consumirla. El servidor fija `started_at=now()` y `expires_at=started_at+interval '72 hours'`. La PK del UUID y `ON CONFLICT DO NOTHING` hacen que reintentos y activaciones concurrentes devuelvan el mismo plazo. El vencimiento es exclusivo: en `expires_at` ya no hay acceso. Una prueba vencida nunca reinicia.

## Migración, tablas y permisos

`supabase/migrations/20261012220833_founder_trial_lanzamiento.sql` aplicada en el proyecto Blindly. La versión local coincide con la registrada por Supabase MCP; el archivo se creó inicialmente con CLI y se ajustó al timestamp confirmado por el servidor.

`20261012221902_founder_guard_lecturas.sql` conserva el guard y evita registrar la métrica opcional en transacciones de solo lectura. Las RPC `STABLE` siguen funcionando sin cambiar su volatilidad ni distribuir instrumentación entre pantallas. [PostgREST: transacciones de solo lectura](https://postgrest.org/en/stable/references/transactions.html).

| Tabla privada | Finalidad |
| --- | --- |
| `plus_lanzamiento` | Una fila: `founder_trial_enabled`, `real_payments_enabled`, fecha de modificación. |
| `plus_founder_trials` | UUID, inicio, vencimiento y creación. Restricción SQL de 72 horas. |
| `plus_founder_funnel` | Una fila por UUID: primeras/últimas visitas, contador acotado, elegibilidad observada, primer uso validado, interés/plan y waitlist. |

RLS habilitado y ningún acceso directo para `PUBLIC`, `anon` o `authenticated`. Las dos tablas por usuario tienen FK a `auth.users` con borrado en cascada. Las funciones son `SECURITY DEFINER`, con `search_path=''` y referencias calificadas. Cada RPC usa exclusivamente `auth.uid()` y valida existencia/no suspensión de la identidad. Un invitado autenticado de Supabase usa el rol `authenticated`; una clave pública sin sesión no alcanza.

| RPC pública | Argumentos | Resultado |
| --- | --- | --- |
| `estado_lanzamiento_plus` | Ninguno | Dos banderas públicas, sin métricas ni filas privadas. |
| `estado_founder_trial` | Ninguno | Estado propio, hora servidor, fechas, fuente, contacto disponible e interés. No crea registros. |
| `iniciar_prueba_founder` | Ninguno | Activa una vez si Trial está ON; devuelve el estado propio existente en reintentos. |
| `registrar_vista_plus` | Ninguno | Visita agregada propia, no bloqueante en UI. No inicia trial. |
| `registrar_interes_plus` | `p_plan`: monthly/annual/lifetime | Upsert de preferencia, primera fecha de interés y estado propio. |
| `registrar_waitlist_plus` | Ninguno | Upsert una vez por UUID, con `contactable` calculado en servidor. |

## Fuentes de acceso y barrera de pagos

`private.tiene_plus(uuid)` conserva el acceso de revisión y las compras verificadas, y agrega la prueba vigente. Los guards existentes en funciones premium siguen validando en servidor. No se cambiaron sus permisos ni se repartieron validaciones nuevas entre pantallas.

En el cliente se distinguen `FREE`, `FOUNDER_TRIAL`, `PLAY_REVIEW`, `REVENUECAT_PAID`, `PLUS_DEMO`. Demo es exclusivo de su paquete de pruebas; en el servidor la prioridad es reviewer, compra legítima, trial, Free. La prueba no escribe en `accesos_plus`, no fabrica entitlements, receipts ni grants de revisión. Esas fuentes permanecen independientes.

`PlusContext` conserva `activo`, `disponible`, `gestionable`, compra, restauración y actualización. Agrega fuente, UUID observado, estado del trial, fecha/plazo restante, elegibilidad, disponibilidad remota, banderas y acciones de interés/waitlist. Un cambio de identidad descarta el acceso anterior y rechaza respuestas tardías.

Para una compra futura se exigen **build comercial habilitado + clave válida + autorización remota fresca**. La bandera remota se vuelve a consultar antes de configurar/usar el SDK y antes de abrir paywall, restaurar o administrar. En la fase actual no se configura RevenueCat desde el provider, no se consulta oferta ni se abre Billing, paywall, restauración o enlace de gestión. Los módulos, productos, validación de identidad recuperable y sincronización comercial permanecen para la siguiente fase.

## Interfaz y cuentas

La pantalla conserva componentes y colores Poker Room. Antes del trial muestra beneficios, 72 horas y ausencia de tarjeta, compra o suscripción. Durante la prueba muestra días/horas, sin segundos, y acceso a explorar funciones. Al vencer vuelve a Próximamente, agradece la prueba y aclara que los datos se conservan.

Los precios de lanzamiento son **informativos**, sin botón de compra: USD 0,99 mensual, USD 9,99 anual recomendado y USD 24,99 Founder Lifetime. Quiero Plus permite elegir entre los tres y guardar interés; anual aparece seleccionado inicialmente. La interfaz nueva y sus errores tienen español, inglés y portugués. Cuando se habilite venta real, se conserva el paywall comercial con precios localizados de la tienda.

La waitlist no exige registro. `contactable` es verdadero solamente para una identidad no anónima con correo real confirmado; los dominios `.invalid`, incluido el alias legacy, no cuentan. No se copia el correo en el embudo. Un invitado recibe “Guardamos tu interés”, sin prometerle email; puede proteger la cuenta después mediante el flujo existente. Una cuenta contactable recibe la confirmación de novedades futuras. **No se envía ninguna campaña ni email de marketing desde este bloque.** El listado debe volver a verificar contacto antes de un envío futuro.

Invitados, email verificado, Google y legacy pueden usar el trial. Al proteger la misma identidad se conserva la misma fila y plazo. Si un invitado pierde su sesión al reinstalar y crea otro UUID, es una nueva identidad: no hay forma de reconocerlo sin registro, huellas de dispositivo u otros datos que deliberadamente no se recopilan. No se promete protección contra esa repetición. Usar recuperación/email/Google conserva la identidad entre dispositivos.

## Vencimiento, conexión y conservación

El servidor decide siempre. La UI usa diferencias entre dos fechas del servidor y un reloj monotónico, descontando conservadoramente el tiempo de solicitud. Cambiar la hora del teléfono no extiende el plazo. Se refresca al abrir Plus, cada minuto en primer plano, al volver a la app y ante cambios de sesión. Un timer local corta el acceso al vencimiento o al agotar la caché aunque no se reinicie la app.

No se inicia una prueba sin conexión. Solo una prueba previamente comprobada puede usar caché **en memoria durante menos de dos minutos**, siempre limitada por el vencimiento. Al pasar a segundo plano se descarta; al volver se exige servidor, evitando prolongar una prueba por suspensión del reloj. Sin comprobación vigente, el cliente vuelve a Free. Los permisos de operaciones online nunca usan esta caché.

Vencer o deshabilitar Trial no borra mesas, historial, estadísticas, clubes, títulos, cosméticos, preferencias, favoritos ni sonidos. Se aplican los límites Free y los guards existentes; lo guardado permanece disponible según las reglas previas. No cambian los límites de 3 sonidos personales y 10 de liga. Solo eliminar la cuenta borra trial/embudo mediante FK cascade.

## Métricas y consultas administrativas

Ejecutar estas consultas únicamente como operador en SQL Editor o con `service_role`. No hay RPC de métricas globales para jugadores. No hay SDK analítico nuevo ni eventos individuales; vistas repetidas a menos de un minuto no incrementan el contador.

```sql
-- Embudo y conversiones de la cohorte que vio Plus siendo elegible.
with cohort as (
 select f.*, t.started_at, t.expires_at
 from private.plus_founder_funnel f
 left join private.plus_founder_trials t using(user_id)
)
select
 count(*) filter(where first_plus_view_at is not null) as visitas_unicas,
 coalesce(sum(plus_view_count),0) as visitas_agregadas,
 count(*) filter(where ever_eligible_view) as visitantes_elegibles,
 (select count(*) from private.plus_founder_trials) as trials_iniciados,
 count(*) filter(where ever_eligible_view and started_at is not null) as trials_cohorte,
 round(100.0 * count(*) filter(where ever_eligible_view and started_at is not null)
       / nullif(count(*) filter(where ever_eligible_view),0),2) as conversion_view_trial_pct,
 (select count(*) from private.plus_founder_trials where expires_at<=now()) as trials_vencidos,
 count(*) filter(where first_interest_at is not null) as interesados_unicos,
 count(*) filter(where expires_at<=now() and first_interest_at>=expires_at) as vencidos_con_interes_posterior,
 round(100.0 * count(*) filter(where expires_at<=now() and first_interest_at>=expires_at)
       / nullif(count(*) filter(where expires_at<=now()),0),2) as conversion_expired_interest_pct,
 count(*) filter(where interest_plan='monthly') as mensual,
 count(*) filter(where interest_plan='annual') as anual,
 count(*) filter(where interest_plan='lifetime') as lifetime,
 count(*) filter(where waitlist) as lista_espera,
 count(*) filter(where first_plus_feature_used_at is not null) as uso_plus_validado
from cohort;

-- Lista contactable: consultar UUID; no exportar ni copiar correos por defecto.
select user_id, interest_plan, waitlisted_at
from private.plus_founder_funnel
where waitlist and private.contactable_plus(user_id);

-- Estado y plazos de campaña, sin datos personales.
select founder_trial_enabled,real_payments_enabled,updated_at
from private.plus_lanzamiento;
select count(*) as activas from private.plus_founder_trials
where started_at<=now() and expires_at>now();
```

La primera fecha de interés se conserva; la preferencia es la última elección. `conversion_expired_interest_pct` cuenta el primer interés ocurrido después de vencer. Un interés previo no se convierte artificialmente en uno posterior. `uso_plus_validado` registra el primer guard premium exitoso durante trial en una transacción que admite escritura; no cuenta consultas de solo lectura ni usos exclusivamente locales como escuchar audio y no es una medición de todas las acciones Plus. Datos eliminados con la cuenta dejan de formar parte de las métricas; no se retienen identidades borradas.

## Transición futura — no ejecutada

Primero completar productos, claves de plataforma, precios de tienda, build comercial y pruebas de compras/restauraciones con una identidad protegida. Solo entonces un operador autorizado cambia ambas banderas juntas:

```sql
-- FUTURO: no ejecutar durante Founder Trial.
begin;
update private.plus_lanzamiento
set founder_trial_enabled=false,real_payments_enabled=true,updated_at=now()
where singleton;
commit;
```

Trial OFF impide nuevas pruebas y deshabilita el acceso derivado de trials existentes; **no cambia sus timestamps ni elimina filas**. Si se reactiva, solo recuperan acceso las que aún no vencieron. Reviewer y compras legítimas no dependen de esa bandera. Para apagar ambos mecanismos sin borrar datos: modificar ambas a false. La interfaz y operaciones comerciales necesitan además las barreras locales; el flag remoto nunca basta por sí solo.

## Verificación y riesgos

- `npm test`: suite completa existente aprobada, incluidas Auth, clubes, SQL/RLS, permisos, compras, reviewer y Demo. Los mocks Auth de pruebas SQL agregan las columnas reales de email necesarias; no se quitaron aserciones.
- `npm run test:founder`: SQL con todas las migraciones, helper/context y UI. 72 horas, PK/idempotencia concurrente, vencimiento exacto, prohibición de reinicio, conservación de mesas, RLS, borrado cascade, tipos de identidad, tres fases, métricas, doble toque, UUID tardío, reloj adulterado y caché offline.
- `npm run typecheck` y `npm run lint`: aprobados.
- `node scripts/probar-founder-servidor.mjs --ejecutar`: SDK Supabase real con invitado descartable; 72 horas exactas, tres activaciones concurrentes con mismo inicio, refresh de identidad, protección legacy conservando UUID/plazo, lectura premium `STABLE`, guard de mesa guardada, interés anual, waitlist sin contacto, rechazo de parámetros inválidos, sin acceso a tablas privadas y sin sesión. Elimina exclusivamente la cuenta que acaba de crear; no imprime tokens ni credenciales.
- Verificación visual web real: pantalla previa, confirmación y cancelar, beneficio y precios informativos; captura en `G:\Blindly\entregas\qa-founder\confirmacion.png`. Activación real cubierta por el script aislado, sin consumir trial de la identidad del navegador.
- Security Advisor: tablas privadas sin políticas son deliberadas (RLS + grants revocados + RPC propia); las seis RPC definer autenticadas se auditaron por `auth.uid`, search_path y grants. No se ocultaron avisos previos de anonymous Auth, extensión pública o protección de contraseñas. [Criterio oficial de RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- La prueba temporal se simula en PGlite para no esperar 72 horas. Tipos email/Google/legacy y expiración se cubren en SQL; no se repitió vinculación de Google ni envío de correo real, ya validados en el bloque Auth anterior.
- Entrega posterior v29: compilación firmada, UI Android en emulador, confirmación/cancelación, activación real y persistencia al reiniciar aprobadas. Disponible en prueba interna; actualización desde Play en A32 y aceptación ARM64/16 KB siguen pendientes. Ver `founder-entrega.md`.

## Informe de cierre — 30 puntos

1. Baseline: main limpio `d57e21d`; Auth verde.
2. Migraciones: `20261012220833` y `20261012221902`, aplicadas y versionadas.
3. Tablas: tres privadas, sin PII adicional.
4. RPC: seis, autenticadas y limitadas a identidad propia.
5. Flags: Trial ON, Payments OFF.
6. Activación: dos pasos, opt-in, sin automática.
7. Duración: 72 horas exactas del servidor.
8. Una vez: PK UUID + reintentos idempotentes, sin reinicio al vencer.
9. Fuente: independiente de reviewer/Demo/compra.
10. Backend: `private.tiene_plus` central, guards existentes.
11. Context: nuevos campos/acciones, mantiene API anterior.
12. `accesos_plus`: exclusivo comercial; la prueba no escribe allí.
13. RevenueCat: fase 1 sin configuración ni operaciones de compra.
14. UI antes: beneficios + gratuidad + confirmación.
15. UI activa: tiempo restante + explorar.
16. UI vencida: Free/Próximamente + conservación + precios previstos.
17. Waitlist: upsert UUID y contacto server-side.
18. Plan: mensual, anual recomendado, lifetime; upsert.
19. Invitado: permitido, sin obligación de signup ni promesa de email.
20. Email/Google/legacy: misma identidad conserva prueba; legacy no es contacto real.
21. Métricas: visitas únicas, trials, vencidos, interés, plan, waitlist, uso validado.
22. Queries: arriba; solo operador/service_role.
23. Datos: se conservan al vencer; cascada al eliminar cuenta.
24. Offline: no activación; caché monotónica en memoria menor a 2 minutos.
25. Futuro: Trial OFF/Payments ON, más build/clave/QA comercial, sin activar ahora.
26. Tests: completos y nuevos aprobados, SDK real aislado aprobado.
27. TypeScript: aprobado.
28. ESLint: aprobado.
29. CI: el workflow `Verificar Blindly` ejecuta los nuevos tests en main; el resultado del push se informa al entregar.
30. Riesgos: instalación de v29 desde Play en A32 y aceptación ARM64/16 KB pendientes; invitado con nuevo UUID puede repetir; no campaña automática; medición de uso solo servidor.
