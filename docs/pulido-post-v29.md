# Correcciones posteriores a v29

29/10/2026. Sin cambios en reglas, productos, precios, cobros ni configuración de proveedores. No se generan AAB ni se publica una versión en Play.

## Causas y correcciones

| Punto | Causa observada en el código | Corrección |
| --- | --- | --- |
| Nombre | v29 no incorpora el editor que ya existe en main. Cuenta tenía su propio fallback de nombres y no enlazaba al editor. | Se conserva display_name como única etiqueta personalizada, con full_name/legacy de respaldo. Cuenta usa el mismo lector y abre el mismo Perfil en una ruta del stack, sin abandonar la mesa ni duplicar el editor. Invitado conserva el acceso desde la pestaña Perfil. |
| Fondo | La ilustración Poker Room ya está en main, pendiente de binario posterior a v29. | Se conserva, sin añadir imágenes ni dependencias. Revisada en ES/EN/PT, tres temas y tamaños de teléfono/tablet. |
| Logout | Crear el nuevo invitado era parte del resultado de logout: si fallaba la red después de signOut, se presentaba como fallo del cierre. Cuenta retenía campos/modo del usuario anterior. Plus podía ejecutar un SIGNED_IN encolado después de SIGNED_OUT. | Acceso admite una sesión nula válida, limpia sus datos y permite reintentar/jugar como invitado. Se limpia la pila de navegación al cerrar. Se descartan tareas Plus de otro UUID y se reinician las pestañas por identidad. Clubes y mesa invalidan respuestas anteriores, incluida una acción tardía. Se conserva el guard de partida activa y de invitado sin proteger. |
| Atrás | Mesa abría /opciones, perteneciente al navegador de pestañas con backBehavior initialRoute. La pila de la mesa no era el historial de esa pestaña. | OpcionesApp se comparte entre pestaña y /configuracion, que sí se apila sobre el llamador. Atrás visual y Android usan el mismo useVolver existente; no hay parámetro ni código de regreso específico a una sala. Mi perfil desde Cuenta usa el mismo patrón. |
| Fuentes grandes | Controles sin reglas consistentes de wrapping; barra inferior fija; asientos absolutos estrechos; acciones de apuesta distribuidas siempre en tres columnas; editor de stack sin scroll. | Texto conserva escalado nativo, padding de fuente y lineHeight adecuado. Botones/campos sin altura fija, headers adaptables, barra de pestañas crece con fontScale. Mesa usa tarjetas en flujo con fuente grande/pantalla estrecha/montos largos; asientos normales más anchos y montos sin partir. Apuestas pasan a dos columnas y el pie tiene scroll acotado al 60%, evitando ocupar toda la pantalla al abrir el editor. Modal de stack también desplazable. Sólo glifos decorativos e inicial/fichas de rol tienen un multiplicador acotado; cuerpo, nombres, formularios y botones no se limitan globalmente. |
| Temas | Se mostraban defaults antes de AsyncStorage; capacidadesPlus desactiva personalización durante cargando y provocaba un fallback breve en cada refresco. Stack y ventana usaban verdes fijos, distintos de las paletas. | Hidratación explícita de tema/preferencias antes de mostrar contenido. Splash espera hidratación e imagen; ventana nativa, navegación y stack comparten el fondo actual y StatusBar claro. Apariencia guardada se conserva durante comprobaciones/estado desconocido; un Free confirmado sí aplica fallback sin borrar selección. Esto no autoriza funciones Plus. Todos los temas son oscuros: interfaz nativa y splash neutro oscuro, sin variante light transitoria. |

## Archivos de implementación

- app.json, package.json, package-lock.json.
- src/app/_layout.tsx, src/app/cuenta.tsx, src/app/configuracion.tsx, src/app/mi-perfil.tsx.
- src/app/(principal)/_layout.tsx, opciones.tsx, perfil.tsx.
- src/components/Controles.tsx, OpcionesApp.tsx, Mesa.tsx, MesaAsientos.tsx, PanelApuesta.tsx.
- src/lib/autenticacion.ts, PlusContext.tsx, TemaContext.tsx, Preferencias.tsx, useClubes.ts, useSala.ts.

No migraciones ni campos nuevos en Supabase; no se modifica el UUID ni se cambia el sistema de acceso. Native APK de QA únicamente x86_64, firmada con certificado de depuración para el emulador y sin compras: no instalar en A32 ni subirla a Play.

## Pruebas

Nuevas: tests/tema-hidratacion.cjs, tests/accesibilidad-layout.cjs y tests/sala-identidad.cjs.

Ampliadas: auth-convencional.cjs (38 casos, incluido logout completado con invitado posterior offline), inicio-cuenta.cjs (limpieza de campos, acceso sin sesión, reintento y carrera INITIAL_SESSION/Google), founder-plus.cjs (eventos encolados de distinto UUID), splash.cjs (hidratación y fondos coherentes), texto-ui.cjs (escalado, wrapping y alturas) y principiante.cjs (entorno de dimensiones). Navegación y permisos/reglas anteriores siguen en la batería completa.

Se ejecutan npm test, npm run typecheck, npm run lint y empaquetado web/Android/iOS. El workflow Verificar Blindly repite los controles en el commit demo; [ejecuciones de main](https://github.com/ArgerichFacu/Blindly/actions/workflows/verify.yml).

La primera ejecución de CI detectó nueve parches recomendados nuevos de Expo 57. Se aplicó expo install --fix, manteniendo React Native 0.86.3, Supabase JS 2.116.0 y Purchases 10.11.0. Expo queda en 57.0.31 y Router en 57.0.29, con lockfile actualizado, sin excluir checks. [Router 57.0.29](https://github.com/expo/expo/blob/sdk-57/packages/expo-router/CHANGELOG.md) también corrige retención de estado de otro ID en navegación y pestañas entrantes en blanco. Se repiten Doctor/compatibilidad, pruebas y bundles tras esos parches; el fallo inicial de CI no se presenta como fallo de los tests de aplicación.

QA contra Supabase real con cliente aislado: logout a invitado nuevo sin heredar Founder, re-login con mismo UUID y nombre; Reviewer email/password conserva PLAY_REVIEW. El Reviewer tiene una partida activa y su guard rechaza logout como corresponde; no se altera esa partida ni se revocan sus otras sesiones. Sólo se elimina la identidad descartable propia. Google OAuth no se vuelve a consentir en este bloque; se conservan sus pruebas de flujo y la evidencia anterior.

El prompt no incluía el texto/código exacto del error original de logout: se identificaron y cubrieron las condiciones anteriores, sin atribuir a una única causa un incidente sin ese registro. El rechazo por partida activa no se elimina como si fuera un fallo técnico.

## Evidencia Android y límites

Emulador Android SDK 36, con app compilada: inicio→Config→Atrás y mesa de QA en estado jugando→Opciones→Atrás físico, visual y gesto. Las tres formas regresan a la misma mesa sin pasar por Inicio. Formularios y botones largos observados con font_scale 1,0 / 1,5 / 2,0; fixtures de layout adicionales cubren 3,0. No se confunde el recorte natural del viewport desplazable con un texto truncado dentro de su control.

Capturas y logs en G:/Blindly/entregas/qa-pulido y pulido-tests-final.log / pulido-bundles.log. Los primeros intentos con cliente de desarrollo requirieron limpiar caché y cerrar su menú. La evidencia final usa también una APK de QA sin depender del servidor. En una mesa con reloj corriendo, uiautomator puede no obtener idle: para esos casos se verifican capturas de pantalla y no se reutiliza un XML antiguo como prueba del estado actual.

Pendiente antes de la AAB publicable: repetir Google/browser callback, logout/re-login y accesibilidad con el A32 físico autorizado por USB, y revisar visualmente arranques fríos en cada tema en el dispositivo final. En esta sesión el A32 figura unauthorized; no se instala ni se borra nada en él. La prueba ARM64/16 KB e iOS físico de etapas anteriores siguen fuera de esta aceptación. La revisión visual humana de tamaños extremos y transiciones no se sustituye por tests unitarios.

No hay nueva AAB. Este bloque entrega correcciones y QA; no implica producción publicada ni certificación de todas las combinaciones de dispositivo/idioma.
