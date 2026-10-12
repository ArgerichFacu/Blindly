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
