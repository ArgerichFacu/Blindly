# Bienvenida y guía rápida

## Comportamiento

La primera apertura del menú muestra «Tu mesa. Tu liga. Tus rivalidades.». Ofrece **Continuar como invitado** y **Crear o recuperar cuenta**. Jugar casualmente no requiere registrarse. El invitado puede proteger después su misma identidad desde Opciones → Mi cuenta mediante el flujo ya existente.

La segunda opción abre `/cuenta?inicio=1`. Una identidad anónima no permite confirmar «Continuar con esta cuenta»: antes debe protegerse con una clave o recuperarse. Generar una clave conserva el UUID, la muestra y espera a que el usuario confirme que la guardó. Recuperar una cuenta mantiene el contexto de bienvenida; las restricciones previas de seguridad de recuperación siguen vigentes. Elegir invitado o leer la guía no invoca auth ni cambia cuentas.

La guía tiene tres pasos: cartas físicas, acciones de cada jugador/dealer y ligas con temporadas/ranking/historia. Puede omitirse, retrocederse y repetirse desde Opciones → Guía rápida sin alterar la elección ni la sesión. La ayuda contextual adicional corresponde a los próximos bloques de aprendizaje y modo principiante.

Google/Apple no se muestran como accesos operativos: todavía requieren proveedores y credenciales externos. El correo sigue condicionado a `EXPO_PUBLIC_EMAIL_AUTH_READY` y SMTP. Este bloque utiliza la recuperación privada que ya funciona; no activa un proveedor nuevo ni cambia Supabase.

## Persistencia y compatibilidad

`src/lib/inicio.ts` guarda exclusivamente `blindly.inicio.v1` en AsyncStorage: versión, elección, fase y paso. `InicioContext` comparte el estado entre menú y cuenta. No contiene UUID, claves de recuperación ni tokens; la elección es una preferencia de experiencia, no una autoridad para permisos o identidad. La sesión continúa bajo el control de Supabase.

La escritura debe terminar antes de avanzar visualmente. Los toques concurrentes se bloquean. Un error de lectura no sobreescribe el progreso guardado; un error de escritura mantiene el paso y permite reintentar. Un registro corrupto reinicia solo la introducción. Los usuarios existentes pueden ver la bienvenida una vez, conservando intactos sus datos y su sesión.

La introducción se presenta solo en `/`; no intercepta enlaces directos a salas, ligas o invitaciones. El stack continúa disponible durante la carga. Después de guardar «terminado», las aperturas del menú no repiten el tutorial.

## Validación

- `tests/inicio.cjs`: reinicio, elección, pasos, omisión, datos inválidos, errores de lectura/escritura, carga lenta, doble toque, suscripciones y conservación de la clave ajena de sesión.
- `tests/inicio-cuenta.cjs`: handlers reales de Cuenta con dependencias controladas; anónimo sin confirmación, clave visible antes de continuar, error de persistencia, recuperación y contexto de navegación.
- `tests/sesion.cjs`: conserva las comprobaciones anteriores de UUID, historial, Plus y restricciones de recuperación.
- Validación web manual: invitado → tres pasos → menú; recargar en paso 2 restaura el paso; recargar después de terminar conserva el menú; guía repetible desde Opciones.
- Traducciones completas en ES/EN/PT y controles accesibles, sin animaciones obligatorias. La aceptación Android/iOS física sigue pendiente; los mocks y el navegador no la sustituyen.

Para aceptación física: completar como invitado, cerrar/reabrir a mitad de la guía, terminar y reabrir; repetirla desde Opciones; proteger una identidad con clave, guardarla y continuar; recuperar en otro dispositivo; comprobar que abrir un enlace de sala no exige tutorial. No borrar una cuenta real para probar.
