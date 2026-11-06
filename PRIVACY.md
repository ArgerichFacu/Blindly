# Política de privacidad de Blindly

**Última actualización: 6 de noviembre de 2026**

Blindly organiza partidas presenciales de poker entre amigos. No procesa apuestas con dinero real, premios ni transferencias entre jugadores.

## Datos que tratamos

Blindly crea un identificador de cuenta para permitir la sincronización. Guarda el nombre elegido por el jugador, las salas a las que pertenece, la configuración y las acciones de la mesa, los stacks, la puntuación, el rango y el historial de partidas. El correo electrónico es opcional y solo se guarda cuando el usuario decide proteger o recuperar su cuenta. Si usa una clave de recuperación, la clave completa se muestra una sola vez: Supabase Auth conserva una contraseña derivada de forma segura y un alias técnico interno, no una copia legible de la clave.

La cámara se usa únicamente para leer el código QR de una sala. Blindly no almacena ni transmite fotografías. El tema, el idioma y los volúmenes se guardan localmente en el dispositivo.

Podés usar email y contraseña o vincular Google a tu identidad. Supabase Auth verifica el correo y almacena la contraseña de forma segura; Blindly no guarda una copia legible. Si elegís Google, recibimos el identificador de Google, el correo, el nombre y la referencia a la imagen de perfil que Google proporciona con tu autorización. No solicitamos acceso a tu buzón, contactos ni archivos de Google. Los mensajes de verificación y restablecimiento se envían mediante el proveedor SMTP configurado, actualmente Gmail, que procesa destinatario y contenido para entregarlos.

## Finalidad y proveedores

Los datos se usan para autenticar al usuario, sincronizar una partida entre celulares, mantener la integridad de turnos, fichas y puntos, mostrar el historial y recuperar una identidad protegida.

Supabase presta los servicios de autenticación, base de datos, sincronización y funciones de servidor. Cuando Blindly Plus está activado, RevenueCat recibe el identificador de cuenta de Supabase y el estado de las compras para validar el acceso, restaurarlo y atender la eliminación de datos. Expo, Apple y Google pueden procesar información técnica necesaria para compilar, distribuir, comprar y ejecutar la aplicación conforme a sus propias políticas. Blindly no vende datos personales.

## Publicidad y consentimiento

Blindly 1.35 incorpora Google AdMob para un interstitial opcional de Free, después de crear o unirse correctamente a una sala y antes del lobby, como máximo una vez por sesión. No incluye banners ni anuncios durante el poker. Cualquier acceso Plus, incluido Founder Trial y revisión de Play, elimina la publicidad. En el estado inicial de esta versión, los anuncios están desactivados para el público: sólo testers autorizados pueden recibir anuncios oficiales de prueba. No hay unidades monetizables configuradas.

Cuando se permiten solicitudes publicitarias, Google puede procesar dirección IP, interacciones con el anuncio, datos de diagnóstico, identificadores de dispositivo/cuenta y señales de consentimiento para prestar el servicio, medirlo y prevenir fraude. La IP puede permitir estimar una ubicación aproximada. Blindly no envía a AdMob nombres de jugadores, correo, clubes, códigos de sala ni resultados, ni pide ubicación GPS. La configuración Android de esta fase excluye el permiso Advertising ID; esto no elimina todos los demás datos técnicos del SDK. Los anuncios de prueba se solicitan como no personalizados.

La User Messaging Platform de Google verifica si se pueden solicitar anuncios antes de inicializar el flujo publicitario. Si falta consentimiento requerido, la verificación falla o el estado es incierto, se omite el anuncio. Con publicidad deshabilitada y sin autorización QA no se solicitan anuncios ni consentimiento publicitario. Esta fase no ofrece un panel de preferencias publicitarias: el flujo de consentimiento y sus opciones de revocación deben completarse antes de activar anuncios reales. No se interpreta la ausencia de un formulario como consentimiento. Consultá la [política de privacidad de Google](https://policies.google.com/privacy).

## Conservación, acceso y eliminación

Los datos se conservan mientras exista la cuenta y sean necesarios para ofrecer la sala y el historial. El usuario puede eliminar su cuenta, identidad, puntuación e historial desde **Opciones > Mi cuenta > Eliminar mi cuenta**. Para proteger a los demás participantes, una partida activa debe finalizar antes de completar la eliminación. La eliminación borra las filas asociadas mediante integridad referencial de Supabase y, cuando está configurado Blindly Plus, también elimina el perfil de cliente de RevenueCat. Borrar la cuenta no cancela una suscripción cobrada por Apple o Google; debe administrarse en la tienda correspondiente.

El usuario puede jugar sin facilitar un correo, vincular uno para recuperar su identidad en otro dispositivo, denegar el permiso de cámara e ingresar manualmente el código de sala.

## Contacto

Para consultas de privacidad o soporte, abrí una solicitud en el [repositorio oficial de Blindly](https://github.com/ArgerichFacu/Blindly/issues). No publiques códigos de acceso, contraseñas ni otra información sensible.

También podés escribir a administracionblindly@gmail.com para consultas privadas, sin enviar contraseñas ni claves de recuperación.
