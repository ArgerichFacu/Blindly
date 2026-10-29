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
- src/lib/textos.ts: aviso de partida activa válido también al cerrar sesión, en ES/EN/PT.

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

La primera tanda quedó limitada al emulador porque el A32 figuraba unauthorized. La continuación física del 29/10 se documenta debajo. La prueba ARM64/16 KB e iOS físico de etapas anteriores siguen fuera de esta aceptación. La revisión visual humana de tamaños extremos y transiciones no se sustituye por tests unitarios.

No hay nueva AAB. Este bloque entrega correcciones y QA; no implica producción publicada ni certificación de todas las combinaciones de dispositivo/idioma.

## Continuación física: Samsung A32

SM-A325M, Android 13, gestos, 1080×2400. La v29 instalada desde Play usa una firma diferente de la firma local de subida: se prepara una APK ARM64 con applicationId temporal com.blindly.studio.qa y etiqueta Blindly QA. Sólo cambian esos identificadores nativos generados e ignorados por Git; mismo código de aplicación y mismos permisos normales de Supabase. No se desinstala ni se actualiza com.blindly.studio, ni se borra su sesión. No se habilitan compras ni se genera una AAB.

Comprobaciones físicas:

- Invitado, inicio y Config→Atrás; perfil Free tras usar otra identidad.
- Google ya autorizado: selección de administración, callback a QA mediante «Sólo una vez», Mi cuenta; logout al formulario vacío sin error.
- Reviewer por email/password: Email verificado y Plus activo. Su partida existente sigue protegida; no se altera. El guard revela un aviso que hablaba de eliminar la cuenta también al cerrar sesión: se corrige su texto común en los tres idiomas, conservando el código y la protección.
- Nombre QA_A32 guardado en un invitado descartable y conservado al actualizar/reabrir QA. No se renombra ninguna cuenta real.
- Acceso en español con fuente 200%, Mi cuenta en inglés al 150% y portugués al 200%, controles multilínea y scroll; fuente original 110% registrada para restaurar.
- Temas Rojo/Negro/Verde seleccionados mediante Plus del Reviewer, cierres y arranques; capturas y grabaciones locales. La observación no es una certificación de cada frame/dispositivo.
- Mesa descartable NRLVQ: vuelta desde Opciones por evento KEYCODE_BACK, flecha visual y gesto lateral conserva la misma mesa/stack. Capturas back-comparacion.png. Una igualada del host descartable prepara el turno del A32; ninguna acción se ejecuta sobre partidas de usuarios reales.

La observación al 200% descubre el reloj partido entre líneas: nivel/ciegas ahora usan wrapping de tarjetas con ancho mínimo proporcional a fontScale y limitado al ancho disponible. El reloj conserva tamaño accesible; no se reduce ni se desactiva el escalado. La APK final se recompila e instala sobre QA: mesa200-reloj-final.png confirma reloj 03:26 y ciegas 25 / 50 completos al 200%, con Retirarse/Pasar/Subir accesibles. aviso-partida-activa-final.png confirma el nuevo mensaje en el Reviewer y su Plus preservado.

Limpieza completada: sala NRLVQ y su host eliminados mediante sus permisos normales; invitado QA_A32 eliminado desde su propia interfaz. La copia QA se desinstala, se restaura font_scale=1.1 y stay_on_while_plugged_in=0, y se abre la aplicación original. com.blindly.studio sigue en v29 con la misma fecha de instalación/actualización de Play. Los XML temporales se eliminan; no se borran datos ni cuentas reales. npm test, typecheck y lint vuelven a pasar después de ambos ajustes; compilación ARM64 final correcta. No se genera AAB.

Evidencias: G:/Blindly/entregas/qa-pulido/a32. Logs locales a32-final-typecheck.log, a32-final-lint.log, a32-final-tests.log y pulido-a32-qa-niveles-build.log en G:/Blindly/cache. XML y credenciales de prueba no se incorporan al repositorio ni al informe.
