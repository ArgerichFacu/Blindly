# Plan de prueba cerrada de Google Play

Este plan prepara la prueba obligatoria para una cuenta personal de Play Console creada después del 13 de noviembre de 2023. Google exige al menos 12 testers inscritos de forma continua durante 14 días antes de solicitar acceso a producción. Conviene invitar a 14–16 personas para conservar un margen si alguien abandona.

Fuente vigente: [requisitos de pruebas para cuentas personales nuevas](https://support.google.com/googleplay/android-developer/answer/14151465).

## Preparación en Play Console

1. Crear `com.blindly.app` y completar la configuración básica de la aplicación.
2. Cargar `Blindly-1.0.0-playstore.aab` primero en **Prueba interna** y revisar el informe previo al lanzamiento.
3. Corregir cualquier bloqueo real antes de reutilizar ese bundle en una **Prueba cerrada**.
4. Crear una lista de correo o Google Group exclusivo para testers.
5. Publicar la versión cerrada y compartir el enlace de inscripción de Google Play.
6. Considerar como inicio del plazo la fecha en que al menos 12 personas estén inscritas simultáneamente. Cada tester debe permanecer inscrito hasta completar sus propios 14 días.

## Registro de participantes

Guardar este registro fuera del repositorio público. Usar alias en lugar de emails completos.

| N.º | Alias | Inscripción | Día 14 cumplido | Dispositivo/Android | Partida completa | Reconexión | Recuperación | Comentario recibido | Sigue inscrito |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |  |  |  |
| 7 |  |  |  |  |  |  |  |  |  |
| 8 |  |  |  |  |  |  |  |  |  |
| 9 |  |  |  |  |  |  |  |  |  |
| 10 |  |  |  |  |  |  |  |  |  |
| 11 |  |  |  |  |  |  |  |  |  |
| 12 |  |  |  |  |  |  |  |  |  |
| 13 |  |  |  |  |  |  |  |  |  |
| 14 |  |  |  |  |  |  |  |  |  |

## Recorrido mínimo de prueba

Distribuir estos recorridos entre los participantes y registrar resultados concretos:

1. Instalar desde Google Play, abrir en frío y comprobar splash, logo, idioma y tema.
2. Crear o unirse a una sala mediante código y QR.
3. Jugar con fichas virtuales: pasar, igualar, subir con monto, retirarse y all-in desde el celular propio.
4. Confirmar que otro jugador no pueda modificar stacks y que solo el dealer reparta el pozo final.
5. Revisar BTN, SB, BB y turno visible durante varias manos, incluido heads-up.
6. Bloquear el teléfono o cortar la red, reconectar y comprobar que no se dupliquen apuestas.
7. Generar una clave de recuperación, cerrar sesión y recuperar la misma identidad.
8. Finalizar una partida y comprobar puntuación, historial privado y ranking dentro de otra sala.
9. Pausar o enviar la app a segundo plano y comprobar que **Lobby Time** se detenga.
10. Probar en pantallas y versiones de Android distintas; registrar cualquier recorte, demora o cierre.

La matriz detallada de aceptación está en [`prueba-fisica.md`](prueba-fisica.md). Blindly Plus permanece desactivado en esta build de producción hasta que existan productos comerciales; sus compras simuladas se prueban con la build `development` separada.

## Seguimiento durante los 14 días

- Mantener al menos 12 testers inscritos de forma ininterrumpida; no retirar la lista ni cerrar la pista.
- Pedir uso real en varios momentos del período y conservar comentarios sobre estabilidad, facilidad de uso y reglas de mesa.
- Registrar fecha, versión, dispositivo, pasos del problema, resultado esperado y resultado observado.
- Corregir fallos críticos. Si una corrección necesita un AAB nuevo, incrementar `versionCode` y documentar qué cambió.
- Evitar publicar emails, UUID, códigos de recuperación, códigos de sala activos o capturas con datos personales.

## Evidencia para solicitar producción

Al terminar, conservar:

- listado de al menos 12 testers que completaron 14 días continuos;
- modelos y versiones de Android cubiertos;
- recorridos ejecutados y resultados;
- comentarios recibidos y cambios realizados;
- fechas de inicio y finalización de la prueba;
- versión y `versionCode` finalmente evaluados.

Play Console pedirá respuestas sobre el proceso, los comentarios y la preparación de la app. Responder con esta evidencia real; la inscripción por sí sola no reemplaza una prueba útil.
