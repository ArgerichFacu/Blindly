Entrega Android más reciente: [Alpha v30 — AAB validado para carga manual](release-alpha-v30.md). Historial previo: [Founder Trial v29](founder-entrega.md). Las secciones siguientes conservan el cierre histórico v22.

# Cierre del producto — v22

**Feature freeze activo desde 2026-10-12.** El usuario aprobó Redoble y Cuac de v22 tras rechazar los anteriores. No se agregan features antes de publicar: sólo bugs críticos, seguridad, crashes y bloqueos de compras/publicación.

## Informe de los 27 puntos solicitados

| Nº | Punto | Resultado |
| --- | --- | --- |
| 1 | Reemplazos | Pack anterior de 18 pasa a 12 grabaciones; chips, risa, buzzer y percusión reemplazados; bocina recortada correctamente, trombón sin acelerar. Cuac y percusión v21 rechazados y reemplazados en v22. |
| 2–4 | Catálogo, duraciones, fuentes/licencias | Fichas 1,90 s; Barajar 1,80; Carta 0,56; Aplausos 3,00; Sorpresa 1,70; Bocina 1,60; Grillos 3,00; Trombón 4,95; Redoble 4,73; Risa 2,65; Buzzer 1,10; Cuac 1,04. Todas CC0-1.0. Tabla autor/enlace/medición en [audio.md](audio.md). |
| 5–6 | Procesamiento / normalización | Cortes, DC, fades 3/25 ms, compresión moderada, PCM mono 22.050/16 bits; objetivo −23 LUFS con techo muestral −3 dBFS. Sin síntesis, pitch ni aceleración. Niveles reales en niveles.json. |
| 7 | Latencia | Preload y player existente; isLoaded/seekTo/exclusión/cooldown 350 ms. No se midió latencia física tap-audio en milisegundos. |
| 8 | Recientes | Máximo cuatro únicos; persistencia; legacy seis recortado a cuatro. |
| 9 | Favoritos | Free, corazones con área propia 44 dp y estado seleccionado. Sin reproducir sonido; disponibles con mute. Añadir/quitar y persistencia tras reinicio verificados en A32. |
| 10–11 | Personalizados / límites | Orden/visibilidad Plus existentes preservados. No existe aún grabación/upload de audios por liga; 3/usuario y 10/liga no se presentan como funcionales. No se añade esta feature durante freeze. |
| 12 | Soundboard QA | Suite carga/mute/blur/fondo/exclusión/cooldown/search/recientes/favoritos verde; grid y favoritos probados en A32. Usuario revisó el pack, rechazó dos y aprobó ambos reemplazos de v22. Comprobación física adicional de mute rechazada por revisión automática de permisos; no se declara realizada. |
| 13 | QA general | Suite completa aprobada; en A32 apertura de Home/Profile/Settings, crear sala, unirse, ligas, instrucciones, combinaciones y Plus sin cierre. Rutas protegidas siguen requiriendo cuenta. No se afirma nueva partida multiusuario completa sobre v22. |
| 14 | Android físico | Samsung A32, instalado com.blindly.studio v22; arranque/splash y rutas comprobados. |
| 15 | 16 KB | ZIP/ELF estáticos aprobados; 29 bibliotecas ARM64. Evidencia x86_64 histórica preservada. Runtime ARM64/16 KB sigue pendiente. |
| 16–18 | Tests / tipos / lint | npm test, npm run typecheck y npm run lint aprobados sobre código v22. |
| 19 | CI | [Verificar Blindly 38197558293](https://github.com/ArgerichFacu/Blindly/actions/runs/38197558293): success, commit 9cd39ab demo. |
| 20–21 | Versión | versionName 1.0.0 / versionCode 22 / com.blindly.studio. |
| 22 | EAS ID | No aplica: build local Gradle. Contador remoto EAS confirmado 22, siguiente autoIncrement 23. |
| 23 | SHA-256 | APK 09204CD9B5BBFFC51BAA7FB99DABFBF8E653FA115EE1A0F57348EEBF446E98D4; AAB 89D74B1FFD3373E063068AF177B0B9F6BA84CFFB404A6725D452CFFEE4DFE229. |
| 24 | AAB | G:/Blindly/entregas/Blindly-1.0.0-release-v22.aab; firma, bundletool, assets y alineación validados. |
| 25 | Play | AAB v22 aceptado; v20 retirado del borrador, permanece en biblioteca. Tester autorizado configurado; canal activo y v22 disponible para testers internos, publicación 2026-10-12 00:00 (hora local). |
| 26 | Plus | Compras reales desactivadas; Test Store todavía asociado y app Google RevenueCat usa paquete anterior. Falta configuración autorizada del paquete nuevo, credenciales privadas Google/productos y compra/restore reales. |
| 27 | Restante | Para prueba interna: propagación de Google y adhesión del tester. Para producción: ficha/declaraciones Play y prueba cerrada exigida, validación ARM64/16 KB, configuración y validación comercial si se lanza Plus. No existe un único pendiente que permita afirmar publicación comercial completa. |

## Notas históricas de preparación

# Release Android — Blindly 1.0.0

Referencia vigente para publicación. Las entregas v5–v19 son históricas; v19 fue
descartada tras detectar en el A32 que el splash permanecía sobre la navegación.
Se corrigió quitando la dependencia de un nuevo evento onLayout y se agregó una
prueba que verifica la salida de carga sin ese evento, también para iOS/web.

## Alcance cerrado

Última pasada de producto: 12 sonidos oficiales CC0, duraciones naturales,
normalización, catálogo Free, buscador, 4 recientes y favoritos gratuitos.
Distribución fija de dos columnas confirmada como requisito por el titular.
Se preservan reproducción exclusiva, mute, sliders y personalización Plus.
No se implementan grabación ni upload de audios de liga: no existen actualmente;
los límites 3 por usuario / 10 por liga no se declaran implementados ni testeados.
[Inventario, fuentes, licencias, duración y producción](audio.md).

Una vez aprobados los reemplazos de audio y la QA física, se activa el freeze: sólo bugs críticos,
crashes, seguridad, errores de compra/publicación y bloqueos de uso. Las ideas nuevas
van al backlog posterior. El cierre de aceptación exige escucha humana y QA del
binario corregido; no se sustituye con tests o mediciones offline.

## Paquete y cuentas externas

- Android: `com.blindly.studio`, autorizado por el titular al comprobar que
  `com.blindly.app` ya estaba ocupado y no era suyo. iOS conserva su configuración.
- Google Play: app creada en Blindly Studio, ID `4973954735614463132`, español
  latinoamericano, aplicación gratuita. El titular aceptó personalmente las tres
  declaraciones legales. Prueba interna disponible; producción exige terminar
  la ficha y prueba cerrada de 12 testers durante 14 días (estado observado).
- Las APK anteriores usan otro paquete. La instalación nueva conserva esas apps
  intactas y tiene datos locales separados. Para recuperar una identidad previa
  debe utilizarse su clave de recuperación; no se pierde el UUID del servidor.
- RevenueCat: `blindly_plus` y offering `default` existen. Mensual USD0,99, anual
  USD9,99 recomendado, Founder vitalicio USD24,99; los tres packages siguen
  asociados a Test Store. El paywall `wf129e2551f5834fa2` está vinculado al offering.
- La configuración Google actual `appcd50009f1f` corresponde al paquete anterior.
  La sesión consultada no permite agregar configuraciones de apps. Falta configurar
  el paquete nuevo con un usuario autorizado, credenciales Google privadas del
  servidor, productos Google y mapping de los packages. Compras/restore reales
  no se consideran verificadas. El build de testing mantiene Plus desactivado.

## QA y artefactos

Tipos, lint y suite completa aprobados, incluido el caso de splash bloqueado.
CI y aceptación física del build corregido: pendientes de registrar al cerrar.

La validación x86_64/16KB anterior se conserva como evidencia histórica. No se
agregan dependencias nativas; se revisa alineación ZIP y ELF ARM64 del artefacto.
La ejecución en hardware ARM64/16KB sigue pendiente, no se afirma certificada.

Compilación local firmada con credenciales existentes, sin subida de código fuente,
keystore ni secretos a Google. EAS build ID: **no aplica**, no se ejecutó un build
remoto. El contador EAS se sincroniza para que la próxima build no reutilice un
código cargado en Play. Versión, hash, archivos y resultado final de QA se registran
al finalizar la prueba física.

## Candidato v22 — revisión solicitada por el usuario

Rimshot y Cuac de v21 fueron rechazados en escucha humana. Se reemplazan por Redoble acústico y otra grabación de pato real; aprobación nueva pendiente. Favoritos pasan a un corazón junto a cada sonido, con estado relleno/seleccionado y área independiente de 44 dp. Se elimina la lista duplicada de botones de favoritos, manteniendo dos columnas y cuatro recientes. El AAB v20 cargado en Play es un borrador anterior y no debe lanzarse: debe reemplazarse por el candidato aceptado.

### Artefactos v22

1.0.0 / versionCode 22, `com.blindly.studio`, compilación local (EAS ID no aplica), contador EAS verificado 22. APK y AAB en `G:/Blindly/entregas/`. Firma APK/AAB y bundletool válidos; 29 bibliotecas ARM64 alineadas a 16 KB, ZIP verificado. Esto no sustituye la prueba runtime en ARM64/16 KB.

- SHA-256 APK: `09204CD9B5BBFFC51BAA7FB99DABFBF8E653FA115EE1A0F57348EEBF446E98D4`
- SHA-256 AAB: `89D74B1FFD3373E063068AF177B0B9F6BA84CFFB404A6725D452CFFEE4DFE229`

Suite completa, TypeScript y lint aprobados. Las pruebas incluyen corazón independiente sin playback, favoritos Free con mute, dos columnas y cuatro recientes.

QA física v22: instalada en A32 (versionCode confirmado 22), arranque y ruta Sonidos funcionando. Dos columnas, cuatro recientes y corazones verificados por captura. Añadir favorito no alteró recientes; favorito Barajar persistió tras force-stop/reapertura; preferencia de prueba retirada. Se restauró stay_on_while_plugged_in=0. Escucha de Redoble/Cuac pendiente de respuesta del usuario.

## Google Play — resultado verificado

Canal interno activo, 1.0.0 (22) disponible para testers internos. Un tester autorizado configurado (el correo no se incorpora a Git). Nombre temporal mostrado por Play: com.blindly.studio (unreviewed), hasta completar ficha y revisión. Enlace de adhesión: https://play.google.com/apps/internaltest/4701360983662374083. El usuario debe entrar con la cuenta Google autorizada; no se ha publicado en producción. Sólo queda advertencia no bloqueante por archivo de desofuscación (minifyEnabled falso). Evidencia local: G:/Blindly/evidencias/release-v18/play-v22-publicada.jpg.
