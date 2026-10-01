# Política de privacidad de Blindly

**Última actualización: 1 de octubre de 2026**

Blindly organiza partidas presenciales de poker entre amigos. No procesa apuestas con dinero real, premios ni transferencias entre jugadores.

## Datos que tratamos

Blindly crea un identificador de cuenta para permitir la sincronización. Guarda el nombre elegido por el jugador, las salas a las que pertenece, la configuración y las acciones de la mesa, los stacks, la puntuación, el rango y el historial de partidas. El correo electrónico es opcional y solo se guarda cuando el usuario decide proteger o recuperar su cuenta. Si usa una clave de recuperación, la clave completa se muestra una sola vez: Supabase Auth conserva una contraseña derivada de forma segura y un alias técnico interno, no una copia legible de la clave.

La cámara se usa únicamente para leer el código QR de una sala. Blindly no almacena ni transmite fotografías. El tema, el idioma y los volúmenes se guardan localmente en el dispositivo.

## Finalidad y proveedores

Los datos se usan para autenticar al usuario, sincronizar una partida entre celulares, mantener la integridad de turnos, fichas y puntos, mostrar el historial y recuperar una identidad protegida.

Supabase presta los servicios de autenticación, base de datos, sincronización y funciones de servidor. Cuando Blindly Plus está activado, RevenueCat recibe el identificador de cuenta de Supabase y el estado de las compras para validar el acceso, restaurarlo y atender la eliminación de datos. Expo, Apple y Google pueden procesar información técnica necesaria para compilar, distribuir, comprar y ejecutar la aplicación conforme a sus propias políticas. Blindly no vende datos personales, no incluye publicidad y no integra herramientas de seguimiento publicitario.

## Conservación, acceso y eliminación

Los datos se conservan mientras exista la cuenta y sean necesarios para ofrecer la sala y el historial. El usuario puede eliminar su cuenta, identidad, puntuación e historial desde **Opciones > Mi cuenta > Eliminar mi cuenta**. Para proteger a los demás participantes, una partida activa debe finalizar antes de completar la eliminación. La eliminación borra las filas asociadas mediante integridad referencial de Supabase y, cuando está configurado Blindly Plus, también elimina el perfil de cliente de RevenueCat. Borrar la cuenta no cancela una suscripción cobrada por Apple o Google; debe administrarse en la tienda correspondiente.

El usuario puede jugar sin facilitar un correo, vincular uno para recuperar su identidad en otro dispositivo, denegar el permiso de cámara e ingresar manualmente el código de sala.

## Contacto

Para consultas de privacidad o soporte, abrí una solicitud en el [repositorio oficial de Blindly](https://github.com/ArgerichFacu/Blindly/issues). No publiques códigos de acceso, contraseñas ni otra información sensible.
