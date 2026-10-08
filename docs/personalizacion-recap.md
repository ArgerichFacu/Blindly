# Personalización y recap de la próxima versión

Metas 11 y 28–31: implementación de código, no publicación comercial ni aceptación física.

## Identidad del club

Free conserva clubes completos, descripción y emblema predeterminado. Plus del **owner**, verificado por RevenueCat en el servidor, habilita a owner/admin a elegir cuatro colores accesibles, cuatro emblemas y tres fondos. El nombre propio y el nombre de temporada existentes permanecen libres. Los presets JSON tienen `version: 1`, admiten exactamente cuatro campos y no aceptan URLs, HTML, uploads ni claves arbitrarias. La estructura permite sumar futuros presets mediante una nueva versión validada.

`guardar_identidad_club` exige cuenta protegida, pertenencia/rol administrativo, club activo y Plus vigente del owner. Los permisos no dependen del Plus del admin. El bloqueo visual sólo orienta al usuario: las RPC vuelven a autorizar cada cambio. No se concedió escritura directa a las tablas.

La identidad, títulos, favoritos y configuraciones se conservan al expirar Plus. La identidad y títulos guardados siguen visibles; su edición se bloquea. El tema personal guardado se conserva, muestra temporalmente el tema Free y reaparece al restaurar Plus. Una carga incompleta o error de verificación no concede capacidades. El proveedor vuelve a consultar al regresar a primer plano; las consultas de UUID diferentes se serializan y las respuestas antiguas se descartan. No se añadió un sistema comercial paralelo a `blindly_plus`.

## Recap

El resumen usa resultados finalizados: todos los ganadores en caso de empate, puesto y puntos personales, participantes, duración registrada y club/temporada. El cambio MVP utiliza el evento guardado al cerrar **esa partida**, por lo que no cambia retroactivamente cuando cambia el líder actual. Se muestra sólo a participantes con cuenta protegida y membresía vigente; el recap casual sigue disponible para sus participantes invitados.

No se muestran métricas sin fuente fiable: mayor pozo, cantidad de all-ins o remontadas requieren un registro persistente adicional antes de poder incorporarse. Tampoco se infiere un cambio histórico de ranking usando el ranking actual. No se inventan premios ni resultados.

La tarjeta premium permite compartir imagen nativa 9:16; el navegador comparte texto. El doble toque está bloqueado y esperar la verificación Plus no inicia una captura. El resumen Free continúa visible. Los UUID distinguen resultados incluso cuando se repiten nombres.

## Capacidades y seguridad

`capacidadesPlus.ts` centraliza capacidades personales; `permisosClub.ts` consume las capacidades sociales del servidor. `private.capacidad_club` centraliza la autorización de identidad/títulos. RevenueCat es la fuente comercial, con vencimiento y frescura de verificación del servidor. Los auxiliares privados no son ejecutables por clientes; ninguna clave secreta se agrega a la app.

Migración `20261008172421_identidad_recap_capacidades.sql`: aplicada sin borrar resultados. Pruebas SQL de roles, payloads inválidos, expiración, verificación caducada, restauración y privacidad; pruebas UI de vista previa, doble toque, rechazo de servidor y conservación; pruebas de identidad concurrente en RevenueCat y empate/MVP histórico aprobadas.

## Rendimiento y experiencia

Migración `20261008172425_historial_club_acotado.sql`: el detalle agrega **hasta 20 partidas** en SQL. Las páginas anteriores usan cursor `(finalizada_en, sala_id)` estable, índice por temporada y máximo 20 filas visibles. La pantalla reemplaza la página en vez de acumular tarjetas indefinidamente y permite volver al inicio. Ninguna partida histórica se elimina. Prueba reproducible: 45 resultados de igual fecha, páginas 20/20/5 sin repetidos ni faltantes. Feed limitado a 20 y suscripción enfocada existentes se conservan. La migración `20261008173230_realtime_identidad_club.sql` agrega ligas a la publicación; el mismo canal usa un sexto filtro UPDATE por id para reflejar cambios de identidad/nombre sin crear otra suscripción.

`hapticos.ts` agrega feedback breve y opcional después de confirmación: all-in, creación de club, título, fecha y cambio de MVP/cierre observado mientras el club está abierto. No vibra por cada toque ni al cargar un club por primera vez. Desactivar en Opciones persiste la elección. Web y segundo plano no vibran; un motor no disponible no interrumpe el juego. La deduplicación en memoria se limita a 128 eventos. Android usa el motor de haptics y iOS su feedback nativo; su intensidad real necesita aceptación física.

Los presets tienen nombres y selección textual, botones de al menos 44 px y etiquetas accesibles; ningún resultado depende sólo del color. Estas vistas son estáticas y los deep links desplazan sin animación. Textos nuevos traducidos a español, inglés y portugués; nombres/títulos propios no se traducen.

## Icono adaptativo

Foreground y monocromo `v2` generados a partir del símbolo existente, con más margen transparente; PNG RGBA 1024 × 1024. El logo/splash original se conserva. `scripts/verificar-iconos.py` valida dimensiones, transparencia, centrado y permanencia del símbolo visible dentro de la máscara circular de 72/108 dp; genera `release/qa-iconos.png` con círculo, squircle y rectángulo redondeado, revisados visualmente. App.json referencia ambos assets nuevos. Requiere una nueva compilación nativa.

## Lo que todavía requiere pruebas externas

Android físico: partida completa con tres dispositivos, permisos reales, haptics, máscaras del launcher, audio/background/reconexión, recuperación y compras/restauración reales. Push necesita Firebase/FCM; iPhone físico necesita firma Apple y APNs. Las pruebas automáticas y exportaciones de bundles no certifican esos comportamientos físicos. Plus y push permanecen sin activación comercial mientras falten esas configuraciones.
