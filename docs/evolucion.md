# Evolución incremental de Blindly

El objetivo maestro exige preservar la release cerrada y avanzar por estos bloques. Este registro diferencia código probado de aceptación nativa y servicios externos; una tarea pendiente no se considera completa por tener un test parcial.

## Release de base cerrada

Código funcional: `a147e78`. Cierre de documentación, scripts y seguridad de herramientas: `f953239` (`demo`), subido a `main`. [GitHub Actions del cierre](https://github.com/ArgerichFacu/Blindly/actions/runs/37720144910) terminó correctamente.

APK preview `versionCode 5`, AAB production `versionCode 6` y build iOS de simulador 1 fueron validados y copiados a `G:\OneDrive\Documentos\ChatGPT\Blindly\release`. Los IDs, enlaces y hashes están en [final-readiness.md](final-readiness.md) y `release/LEEME.txt`. El ZIP final de cierre tiene SHA-256 `5F4FE49EC04932712FF27CB3201F6835E3C095A0D22561D457D59951CC38BC40`; se verificaron sus 12 archivos contra `SHA256SUMS.txt` y todas las copias de OneDrive coinciden con el origen.

Se mantienen como pendientes externos la aceptación Android física, Play Console y publicación comercial, SMTP, páginas legales/correo público de soporte, productos comerciales de Plus y firma para iPhone físico. El paywall de RevenueCat sigue en borrador.

## Próxima versión en desarrollo

Después del cierre se aplicaron los parches recomendados dentro de Expo SDK 57. Expo Doctor online pasó 21/21 y CI volvió a exigir la comprobación online. Los binarios ya cerrados no se reemplazan con estos cambios; la próxima release requerirá compilaciones nuevas.

| Meta | Alcance | Estado |
| --- | --- | --- |
| 1 | Android Back y protección de mesa activa | Implementada y probada automáticamente/web; aceptación nativa pendiente. [Detalle](android-back.md). |
| 2 | Onboarding con cuenta o invitado, elección persistida | Implementado con recuperación por clave, pruebas de persistencia/cuenta y validación web. Google/Apple pendientes de configuración externa. [Detalle](inicio.md). |
| 3 | Tutorial corto de tres pasos y ayuda contextual | Tres pasos, omisión y repetición implementados y probados; ayuda contextual se amplía en metas 4/6. [Detalle](inicio.md). |
| 4 | Aprender póker con ejemplos e interacción | Pendiente |
| 5 | Selector de cartas y evaluación de las diez combinaciones, Free | Pendiente |
| 6 | Modo principiante: reglas de acciones, sin estrategia | Pendiente |
| 7 | Música, ambiente, efectos, botonera y mute persistidos | Pendiente |
| 8 | Ambiente sutil de casino | Pendiente |
| 9 | Botonera Free/Plus, favoritos y orden, sin uploads | Pendiente |
| 10 | Identidad persistente por UUID y compatibilidad legacy | Pendiente de evolución; recuperación por clave ya existe |
| 11 | Liga como club permanente | Pendiente de evolución; ligas básicas ya existen |
| 12 | Login solo para funciones sociales persistentes | Pendiente |
| 13 | Invitaciones con código/link/QR y contexto tras login | Pendiente |
| 14 | Owner, admin y member protegidos en backend | Pendiente de evolución |
| 15 | Temporadas con historia y campeón | Pendiente de evolución; temporadas básicas ya existen |
| 16 | Ranking competitivo con top 3 y movimientos reales | Pendiente de evolución |
| 17 | MVP derivado exclusivamente del puesto 1, Free | Pendiente |
| 18 | Race for MVP con diferencias reales | Pendiente |
| 19 | Títulos automáticos Free con reglas reproducibles | Pendiente |
| 20 | Un título personalizado Plus por miembro de liga | Pendiente |
| 21 | Próxima fecha y asistencia | Pendiente |
| 22 | Rivalidades y némesis derivadas de datos | Pendiente |
| 23 | Feed pequeño de eventos reales de liga | Pendiente |
| 24 | Notificaciones relevantes con datos reales | Pendiente |
| 25 | Modo pique opcional y texto neutral alternativo | Pendiente |
| 26 | Anti-spam y preferencias por tipo de notificación | Pendiente |
| 27 | Deep links a la sección relevante | Pendiente |
| 28 | Recap evolucionado con métricas disponibles | Pendiente de evolución; recap básico ya existe |
| 29 | Identidad visual Plus de liga | Pendiente |
| 30 | Capa central de permisos Plus basada en RevenueCat | Pendiente de evolución; PlusContext y validación servidor ya existen |
| 31 | Conservar datos al expirar Plus y restaurar acceso | Pendiente de ampliar; datos actuales ya se conservan |
| 32 | Migraciones no destructivas, RPC, RLS, índices y permisos | Requisito de cada bloque de backend |
| 33 | Estética premium y feedback contextual | Requisito transversal |
| 34 | Haptics en momentos relevantes | Pendiente |
| 35 | Controles de audio independientes y persistidos | Compartido con meta 7 |
| 36 | Español, inglés y portugués | Requisito de cada bloque; navegación, bienvenida y tutorial cubiertos |
| 37 | Accesibilidad y movimiento reducido | Requisito de cada bloque |
| 38 | Rendimiento y consultas/subscripciones acotadas | Requisito de cada bloque |
| 39 | QA de identidades, permisos, roles, compras, offline y dispositivos | Requisito de cada bloque y de la nueva release |
| 40 | Icono adaptativo con mayor margen y monocromo | Pendiente |

Free conserva juego casual, aprendizaje, ligas funcionales, temporada activa, ranking, MVP y herramientas sociales básicas. Plus aporta personalización, identidad, profundidad y experiencia; no bloquea el juego esencial. El registro se actualizará con evidencia a medida que se implementa cada bloque.
