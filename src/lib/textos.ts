export type Idioma = "es" | "en" | "pt";
// El español es la clave legible; las variables se interpolan después de traducir.
export const textos: Record<string, [string, string]> = {
  "Clubes y notificaciones": ["Clubs and notifications", "Clubes e notificações"],
  "Los clubes guardan miembros, roles, títulos, temporadas, resultados, fechas y tus preferencias de avisos. Si activás notificaciones y das permiso, guardamos el token de este dispositivo para enviar avisos mediante Expo y Google o Apple. Podés desactivarlos por club o en el sistema. Los tokens y eventos de MVP asociados se eliminan al borrar tu cuenta.": ["Clubs store members, roles, titles, seasons, results, game nights and your notification preferences. If you enable notifications and grant permission, we store this device's token to send alerts through Expo and Google or Apple. You can disable them for each club or in system settings. Associated tokens and MVP events are deleted when you delete your account.", "Os clubes armazenam membros, funções, títulos, temporadas, resultados, encontros e suas preferências de avisos. Se você ativar notificações e permitir, guardamos o token deste dispositivo para enviar avisos via Expo e Google ou Apple. Você pode desativá-los por clube ou no sistema. Os tokens e eventos de MVP associados são excluídos ao apagar sua conta."],
  "Última actualización: 8 de octubre de 2026": ["Last updated: October 8, 2026", "Última atualização: 8 de outubro de 2026"],
  "Ver partidas anteriores": ["View earlier games", "Ver partidas anteriores"],
  "Volver a las más recientes": ["Back to the latest games", "Voltar às partidas mais recentes"],
  "Vibraciones de momentos importantes": ["Haptics for important moments", "Vibrações em momentos importantes"],
  "Una vibración breve al confirmar all-in, clubes, títulos y fechas. Podés desactivarla.": ["A brief vibration when confirming all-in, clubs, titles and game nights. You can turn it off.", "Uma vibração breve ao confirmar all-in, clubes, títulos e encontros. Você pode desativá-la."],
  "GANADORES": ["WINNERS", "VENCEDORES"],
  "+{n} puntos": ["+{n} points", "+{n} pontos"],
  "Personalizar club": ["Customize club", "Personalizar clube"],
  "La identidad se conserva. Para editarla, el owner necesita Plus activo.": ["The identity is preserved. To edit it, the owner needs active Plus.", "A identidade é mantida. Para editá-la, o owner precisa do Plus ativo."],
  "Color del club": ["Club color", "Cor do clube"],
  "Emblema": ["Emblem", "Emblema"],
  "Fondo del club": ["Club background", "Fundo do clube"],
  "Guardar identidad": ["Save identity", "Salvar identidade"],
  "Oro": ["Gold", "Ouro"],
  "Esmeralda": ["Emerald", "Esmeralda"],
  "Rubí": ["Ruby", "Rubi"],
  "Zafiro": ["Sapphire", "Safira"],
  "Picas": ["Spades", "Espadas"],
  "Corazones": ["Hearts", "Copas"],
  "Diamantes": ["Diamonds", "Ouros"],
  "Tréboles": ["Clubs", "Paus"],
  "Liso": ["Plain", "Liso"],
  "Rayas": ["Stripes", "Listras"],
  "Elegí un color, emblema y fondo válidos para el club.": ["Choose a valid club color, emblem and background.", "Escolha uma cor, emblema e fundo válidos para o clube."],
  "NUEVO MVP": ["NEW MVP", "NOVO MVP"],
  "{nombre} tomó el MVP": ["{nombre} took the MVP", "{nombre} assumiu o MVP"],
  "Al guardar con avisos activados, te pediremos permiso en este dispositivo.": ["When saving with notifications enabled, we will ask for permission on this device.", "Ao salvar com avisos ativados, pediremos permissão neste dispositivo."],
  "Este dispositivo todavía no tiene notificaciones habilitadas.": ["Notifications are not enabled on this device yet.", "As notificações ainda não estão habilitadas neste dispositivo."],
  "Permití las notificaciones en los ajustes del sistema para recibir los avisos.": ["Allow notifications in your system settings to receive alerts.", "Permita notificações nas configurações do sistema para receber os avisos."],
  "Notificaciones del club": ["Club notifications", "Notificações do clube"],
  "Estas preferencias son tuyas y se conservan al recuperar tu cuenta.": ["These are your preferences and they are preserved when you recover your account.", "Estas preferências são suas e são mantidas ao recuperar sua conta."],
  "El envío push todavía no está habilitado en esta versión.": ["Push delivery is not enabled in this version yet.", "O envio push ainda não está habilitado nesta versão."],
  "Recibir avisos del club": ["Receive club notifications", "Receber avisos do clube"],
  "Modo pique": ["Friendly banter", "Modo provocação"],
  "Cambios de MVP": ["MVP changes", "Mudanças de MVP"],
  "Avisos de rivalidades": ["Rivalry notifications", "Avisos de rivalidades"],
  "Próximas fechas": ["Upcoming game nights", "Próximos encontros"],
  "Cierre de temporadas": ["Season endings", "Encerramento de temporadas"],
  "Recordatorios para juntarse": ["Reminders to get together", "Lembretes para se reunir"],
  "Modo pique cambia el tono, nunca los resultados. Desactivado, los mensajes son neutrales.": ["Friendly banter changes the tone, never the results. When off, messages are neutral.", "O modo provocação muda o tom, nunca os resultados. Desativado, as mensagens são neutras."],
  "Avisos sociales por semana en este club": ["Social notifications per week in this club", "Avisos sociais por semana neste clube"],
  "Máximo {n} avisos sociales por semana": ["At most {n} social notifications per week", "No máximo {n} avisos sociais por semana"],
  "MVP, fechas y cierres respetan su interruptor y no consumen el cupo social.": ["MVP, game nights and season endings respect their toggle and do not count towards the social limit.", "MVP, encontros e encerramentos respeitam seu controle e não consomem a cota social."],
  "Preferencias del club guardadas.": ["Club preferences saved.", "Preferências do clube salvas."],
  "Guardar preferencias": ["Save preferences", "Salvar preferências"],
  "La revancha se juega en la mesa. ¿Organizan otra noche?": ["The rematch happens at the table. Another game night?", "A revanche acontece na mesa. Vamos marcar outra noite?"],
  "Pueden organizar otra fecha para seguir jugando juntos.": ["You can schedule another game night to keep playing together.", "Vocês podem marcar outro encontro para continuar jogando juntos."],
  "Tus preferencias cambiaron en otro dispositivo. Actualizá el club antes de guardar.": ["Your preferences changed on another device. Refresh the club before saving.", "Suas preferências mudaram em outro dispositivo. Atualize o clube antes de salvar."],
  "Actividad del club": ["Club activity", "Atividade do clube"],
  "Lo que pasó en esta temporada y la próxima fecha del club.": ["This season's events and the club's next game night.", "Os acontecimentos desta temporada e o próximo encontro do clube."],
  "La historia del club empieza con su primera partida terminada.": ["The club's story starts with its first completed game.", "A história do clube começa com sua primeira partida concluída."],
  "TORNEO TERMINADO": ["TOURNAMENT COMPLETED", "TORNEIO CONCLUÍDO"],
  "TEMPORADA CERRADA": ["SEASON CLOSED", "TEMPORADA ENCERRADA"],
  "PRÓXIMA FECHA PROGRAMADA": ["NEXT GAME NIGHT SCHEDULED", "PRÓXIMO ENCONTRO AGENDADO"],
  "Terminó la partida {codigo}": ["Game {codigo} finished", "A partida {codigo} terminou"],
  "Terminó {nombre}": ["{nombre} finished", "{nombre} terminou"],
  "Mostrando los 20 eventos más recientes.": ["Showing the 20 most recent events.", "Mostrando os 20 eventos mais recentes."],
  "Rivalidades": ["Rivalries", "Rivalidades"],
  "TU NÉMESIS": ["YOUR NEMESIS", "SUA NÊMESIS"],
  "Compara posiciones finales de torneos de esta temporada. Requiere al menos 3 compartidos.": ["Compares final tournament positions this season. Requires at least 3 shared tournaments.", "Compara posições finais dos torneios desta temporada. Exige pelo menos 3 compartilhados."],
  "Entre tus balances desfavorables, es quien más veces terminó por encima de vos.": ["Among opponents with a winning record against you, this player finished ahead most often.", "Entre seus confrontos desfavoráveis, é quem mais vezes terminou à sua frente."],
  "Todavía faltan torneos compartidos para mostrar rivalidades.": ["More shared tournaments are needed to show rivalries.", "Ainda faltam torneios compartilhados para mostrar rivalidades."],
  "Por ahora no tenés una némesis con balance desfavorable.": ["You currently have no nemesis with a winning record against you.", "Por enquanto você não tem uma nêmesis com saldo desfavorável."],
  "{n} torneos juntos": ["{n} tournaments together", "{n} torneios juntos"],
  "Vos {vos} · Rival {rival} · Empates {empates}": ["You {vos} · Opponent {rival} · Ties {empates}", "Você {vos} · Rival {rival} · Empates {empates}"],
  "Terminó por encima de vos en {n} de los últimos 4 torneos compartidos.": ["Finished ahead of you in {n} of the last 4 shared tournaments.", "Terminou à sua frente em {n} dos últimos 4 torneios compartilhados."],
  "Tu respuesta: {respuesta}": ["Your response: {respuesta}", "Sua resposta: {respuesta}"],
  "Actualizar club": ["Refresh club", "Atualizar clube"],
  "Próxima fecha": ["Next game night", "Próximo encontro"],
  "Hora local de tu dispositivo": ["Your device's local time", "Horário local do seu dispositivo"],
  "{n} confirmados": ["{n} confirmed", "{n} confirmados"],
  "{n} pendientes": ["{n} pending", "{n} pendentes"],
  "{n} no pueden": ["{n} unavailable", "{n} não podem"],
  "Voy": ["I'm going", "Vou"],
  "No puedo": ["I can't make it", "Não posso"],
  "Pendiente": ["Pending", "Pendente"],
  "Todavía no hay una próxima fecha. Organicen la siguiente noche de póker.": ["No upcoming date yet. Arrange your next poker night.", "Ainda não há um próximo encontro. Organizem a próxima noite de pôquer."],
  "Reprogramar fecha": ["Reschedule", "Reagendar"],
  "Programar fecha": ["Schedule a game night", "Agendar encontro"],
  "Cancelar fecha": ["Cancel game night", "Cancelar encontro"],
  "Las respuestas anteriores se conservarán.": ["Previous responses will be kept.", "As respostas anteriores serão conservadas."],
  "Día (DD/MM/AAAA)": ["Date (DD/MM/YYYY)", "Dia (DD/MM/AAAA)"],
  "Hora (HH:MM)": ["Time (HH:MM)", "Hora (HH:MM)"],
  "Lugar (opcional)": ["Location (optional)", "Local (opcional)"],
  "Nota (opcional)": ["Note (optional)", "Nota (opcional)"],
  "Reprogramar pide confirmar asistencia de nuevo; las respuestas anteriores se conservan.": ["Rescheduling asks everyone to confirm again; previous responses are kept.", "Reagendar exige confirmar presença novamente; as respostas anteriores são conservadas."],
  "Guardar fecha": ["Save date", "Salvar encontro"],
  "Elegí una fecha futura dentro del próximo año y respetá los límites del lugar y la nota.": ["Choose a future date within the next year and keep the location and note within their limits.", "Escolha uma data futura no próximo ano e respeite os limites do local e da nota."],
  "La fecha cambió o ya pasó. Actualizá el club antes de confirmar.": ["The date changed or has passed. Refresh the club before confirming.", "A data mudou ou já passou. Atualize o clube antes de confirmar."],
  "Título personalizado": ["Custom title", "Título personalizado"],
  "De 2 a 24 caracteres. Sólo en este club; no se traduce.": ["2 to 24 characters. Only in this club; it is not translated.", "De 2 a 24 caracteres. Só neste clube; não é traduzido."],
  "Guardar título": ["Save title", "Salvar título"],
  "Quitar título": ["Remove title", "Remover título"],
  "Editar título": ["Edit title", "Editar título"],
  "Asignar título": ["Assign title", "Atribuir título"],
  "Los títulos personalizados requieren Plus vigente del owner. Los guardados siguen visibles.": ["Custom titles require the owner's active Plus. Saved titles remain visible.", "Títulos personalizados exigem Plus ativo do owner. Os títulos salvos continuam visíveis."],
  "El owner necesita Plus verificado para editar títulos del club.": ["The owner needs verified Plus to edit club titles.", "O owner precisa de Plus verificado para editar títulos do clube."],
  "El título debe tener entre 2 y 24 caracteres, sin enlaces ni etiquetas.": ["Titles must have 2 to 24 characters, without links or markup.", "O título deve ter de 2 a 24 caracteres, sem links ou marcações."],
  "Blindly Plus es necesario para esta función premium.": ["Blindly Plus is required for this premium feature.", "Blindly Plus é necessário para esta função premium."],
  "MVP": ["MVP", "MVP"],
  "TIBURÓN": ["SHARK", "TUBARÃO"],
  "REY DEL PODIO": ["PODIUM KING", "REI DO PÓDIO"],
  "Títulos automáticos": ["Automatic titles", "Títulos automáticos"],
  "Méritos Free de esta temporada. Se recalculan con cada resultado.": ["Free achievements for this season. Recalculated with each result.", "Conquistas Free desta temporada. Recalculadas a cada resultado."],
  "MVP: puesto 1 de la temporada activa, con el mismo desempate del ranking.": ["MVP: first place in the active season, using the standings tiebreaker.", "MVP: primeiro lugar da temporada ativa, usando o desempate do ranking."],
  "TIBURÓN: al menos 5 partidas y victoria en el 50% o más.": ["SHARK: at least 5 games and wins in 50% or more.", "TUBARÃO: pelo menos 5 partidas e vitórias em 50% ou mais."],
  "REY DEL PODIO: al menos 5 partidas y top 3 en el 80% o más.": ["PODIUM KING: at least 5 games and top 3 in 80% or more.", "REI DO PÓDIO: pelo menos 5 partidas e top 3 em 80% ou mais."],
  "Temporada en curso": ["Season in progress","Temporada em andamento"],
  "Temporada finalizada": ["Season completed","Temporada finalizada"],
  "MVP ACTUAL": ["CURRENT MVP","MVP ATUAL"],
  "CAMPEÓN DE TEMPORADA": ["SEASON CHAMPION","CAMPEÃO DA TEMPORADA"],
  "{n} victorias": ["{n} wins","{n} vitórias"],
  "{n} puntos": ["{n} points","{n} pontos"],
  "El puesto 1 del ranking es el MVP. Cambia con los resultados.": ["The player ranked first is the MVP. It changes with results.","O primeiro colocado do ranking é o MVP. Ele muda com os resultados."],
  "Esta temporada conserva sus partidas y su clasificación final.": ["This season retains its games and final standings.","Esta temporada conserva suas partidas e sua classificação final."],
  "Subió {n} posiciones": ["Up {n} places","Subiu {n} posições"],
  "Bajó {n} posiciones": ["Down {n} places","Caiu {n} posições"],
  "Mantiene su posición": ["Position unchanged","Mantém sua posição"],
  "RACE FOR MVP": ["RACE FOR MVP","DISPUTA PELO MVP"],
  "A {n} puntos del líder": ["{n} points behind the leader","A {n} pontos do líder"],
  "Una partida puede cambiar el líder.": ["One game can change the leader.","Uma partida pode mudar o líder."],
  "Ranking en vivo": ["Live standings","Ranking ao vivo"],
  "Podés actualizar el ranking manualmente.": ["You can update the standings manually.","Você pode atualizar o ranking manualmente."],
  "Actualizar ranking": ["Update standings","Atualizar ranking"],
  "Protegé tu cuenta para ver tu historial y participar en clubes.": ["Protect your account to view your history and participate in clubs.","Proteja sua conta para ver seu histórico e participar de clubes."],
  "Protegé tu historial con una clave de recuperación en Mi cuenta.": ["Protect your history with a recovery key in My account.","Proteja seu histórico com uma chave de recuperação em Minha conta."],
  "Primero aceptá la invitación del club para jugar esta partida de liga.": ["First accept the club invitation to play this league game.","Primeiro aceite o convite do clube para jogar esta partida da liga."],
  "Proteger mi historial": ["Protect my history","Proteger meu histórico"],
  "Unirme a un club": ["Join a club", "Entrar em um clube"],
  "Tu grupo, tus temporadas.": [
    "Your group, your seasons.",
    "Seu grupo, suas temporadas.",
  ],
  "Código o enlace de invitación": [
    "Invitation code or link",
    "Código ou link de convite",
  ],
  "Invitar al club": ["Invite to the club", "Convidar para o clube"],
  "Compartí el código o QR. Cada persona confirma su ingreso con una cuenta protegida.":
    [
      "Share the code or QR. Each person confirms joining with a protected account.",
      "Compartilhe o código ou QR. Cada pessoa confirma a entrada com uma conta protegida.",
    ],
  "Mostrar invitación": ["Show invitation", "Mostrar convite"],
  "Código de invitación: {codigo}": [
    "Invitation code: {codigo}",
    "Código de convite: {codigo}",
  ],
  "Vence: {fecha}": ["Expires: {fecha}", "Expira: {fecha}"],
  "Compartir invitación": ["Share invitation", "Compartilhar convite"],
  "Invitación al club de Blindly": [
    "Blindly club invitation",
    "Convite para o clube do Blindly",
  ],
  "Renovar código": ["Renew code", "Renovar código"],
  "El código anterior dejará de funcionar. Los miembros actuales conservan su lugar.":
    [
      "The previous code will stop working. Current members keep their place.",
      "O código anterior deixará de funcionar. Os membros atuais mantêm seu lugar.",
    ],
  "La invitación no es válida o venció.": [
    "The invitation is invalid or expired.",
    "O convite é inválido ou expirou.",
  ],
  "Un administrador retiró tu acceso a este club.": [
    "An administrator removed your access to this club.",
    "Um administrador removeu seu acesso a este clube.",
  ],
  "Protegé tu cuenta para aceptar la invitación. La partida casual sigue siendo gratis y sin registro.":
    [
      "Protect your account to accept the invitation. Casual games remain free without registration.",
      "Proteja sua conta para aceitar o convite. As partidas casuais continuam grátis e sem cadastro.",
    ],
  "Ver invitación": ["View invitation", "Ver convite"],
  "Ya sos miembro de este club.": [
    "You are already a member of this club.",
    "Você já é membro deste clube.",
  ],
  "Al confirmar, tu nombre y resultados de liga serán visibles para los miembros del club.":
    [
      "By confirming, your name and league results will be visible to club members.",
      "Ao confirmar, seu nome e resultados da liga serão visíveis aos membros do clube.",
    ],
  "Confirmar y unirme": ["Confirm and join", "Confirmar e entrar"],
  "Protegé tu cuenta para usar las funciones del club.": [
    "Protect your account to use club features.",
    "Proteja sua conta para usar as funções do clube.",
  ],
  "Solo el owner o un administrador puede hacer esto.": [
    "Only the owner or an administrator can do this.",
    "Somente o owner ou um administrador pode fazer isso.",
  ],
  "Este miembro ya no está activo en el club.": [
    "This member is no longer active in the club.",
    "Este membro não está mais ativo no clube.",
  ],
  "Nuestro club de póker": ["Our poker club", "Nosso clube de pôquer"],
  "Un grupo, muchas temporadas. El historial se queda en el club.": [
    "One group, many seasons. The history stays with the club.",
    "Um grupo, muitas temporadas. O histórico fica no clube.",
  ],
  Administrador: ["Administrator", "Administrador"],
  Miembro: ["Member", "Membro"],
  "Hacer admin": ["Make admin", "Tornar admin"],
  "Quitar admin": ["Remove admin role", "Remover função de admin"],
  "Descripción del club": ["Club description", "Descrição do clube"],
  "Guardar descripción": ["Save description", "Salvar descrição"],
  "Volver a mi club": ["Return to my club", "Voltar ao meu clube"],
  "Proteger mi cuenta": ["Protect my account", "Proteger minha conta"],
  "Protegé tu cuenta para crear tu club": [
    "Protect your account to create your club",
    "Proteja sua conta para criar seu clube",
  ],
  "Las ligas son Free. Una clave de recuperación conserva tu identidad, tus puntos y tus temporadas.":
    [
      "Leagues are Free. A recovery key preserves your identity, points and seasons.",
      "As ligas são Free. Uma chave de recuperação preserva sua identidade, pontos e temporadas.",
    ],
  "Tu club y sus temporadas son Free. Protegé tu cuenta para conservar tu lugar al cambiar de celular.":
    [
      "Your club and its seasons are Free. Protect your account to keep your place when changing phones.",
      "Seu clube e suas temporadas são Free. Proteja sua conta para manter seu lugar ao trocar de celular.",
    ],
  "Tus datos siguen guardados. Protegé esta identidad para administrar tu club.":
    [
      "Your data is still saved. Protect this identity to manage your club.",
      "Seus dados continuam salvos. Proteja esta identidade para administrar seu clube.",
    ],
  "Protección pendiente": ["Protection pending", "Proteção pendente"],
  "ID de tu identidad": ["Your identity ID", "ID da sua identidade"],
  "Este ID conserva tus puntos y tu lugar en las ligas aunque cambies tu nombre.":
    [
      "This ID keeps your points and league membership even if you change your name.",
      "Este ID mantém seus pontos e sua participação nas ligas mesmo se você mudar seu nome.",
    ],
  "Sonidos y ambiente": ["Sounds and ambience", "Sons e ambiente"],
  "Bajar volumen de {canal}": [
    "Lower {canal} volume",
    "Diminuir volume de {canal}",
  ],
  "Subir volumen de {canal}": [
    "Raise {canal} volume",
    "Aumentar volume de {canal}",
  ],
  "Conocer Blindly Plus": ["Discover Blindly Plus", "Conhecer Blindly Plus"],
  "Silenciar todo": ["Mute all", "Silenciar tudo"],
  Música: ["Music", "Música"],
  "Efectos de ronda": ["Round effects", "Efeitos de rodada"],
  "Ambiente de casino": ["Casino ambience", "Ambiente de cassino"],
  Botonera: ["Soundboard", "Painel de sons"],
  Volumen: ["Volume", "Volume"],
  "Detener ambiente": ["Stop ambience", "Parar ambiente"],
  "Reproducir ambiente": ["Play ambience", "Reproduzir ambiente"],
  "Escuchar una muestra": ["Listen to a sample", "Ouvir uma amostra"],
  "Los ajustes se guardan en este dispositivo. Al volver del fondo, los sonidos esperan a que los reproduzcas.":
    [
      "Settings are saved on this device. When you return to the app, sounds wait for you to play them.",
      "As configurações são salvas neste dispositivo. Ao voltar ao app, os sons aguardam você reproduzi-los.",
    ],
  "El ambiente combina sonidos suaves de fichas y cartas. Se inicia solo cuando lo elegís.":
    [
      "The ambience mixes soft chip and card sounds. It starts only when you choose to play it.",
      "O ambiente combina sons suaves de fichas e cartas. Começa apenas quando você escolhe reproduzi-lo.",
    ],
  "Reacciones que suenan en tu celular, para compartir en la mesa.": [
    "Reactions played on your phone, to share at the table.",
    "Reações reproduzidas no seu celular, para compartilhar na mesa.",
  ],
  "No hay sonidos seleccionados. Elegilos en Sonidos y ambiente.": [
    "No sounds selected. Choose them in Sounds and ambience.",
    "Nenhum som selecionado. Escolha em Sons e ambiente.",
  ],
  "Más sonidos y personalización · Plus": [
    "More sounds and customization · Plus",
    "Mais sons e personalização · Plus",
  ],
  "Personalizar botonera · Plus": [
    "Customize soundboard · Plus",
    "Personalizar painel de sons · Plus",
  ],
  "Elegí tus sonidos, marcá favoritos y cambiá el orden. Tus ajustes se conservan si vence Plus.":
    [
      "Choose your sounds, mark favorites and change the order. Your settings are kept if Plus expires.",
      "Escolha seus sons, marque favoritos e altere a ordem. Suas configurações são mantidas se o Plus expirar.",
    ],
  "Mostrar sonido": ["Show sound", "Mostrar som"],
  "Quitar de favoritos": ["Remove from favorites", "Remover dos favoritos"],
  "Añadir a favoritos": ["Add to favorites", "Adicionar aos favoritos"],
  "Mover hacia arriba": ["Move up", "Mover para cima"],
  Aplausos: ["Applause", "Aplausos"],
  Grillos: ["Crickets", "Grilos"],
  Campana: ["Bell", "Sino"],
  Bocina: ["Horn", "Buzina"],
  Trombón: ["Trombone", "Trombone"],
  "Caja registradora": ["Cash register", "Caixa registradora"],
  Respeto: ["Respect", "Respeito"],
  "Modo principiante": ["Beginner mode", "Modo iniciante"],
  "Activa ayuda sobre las reglas durante tu turno. No cambia las apuestas ni recomienda estrategia.":
    [
      "Enables rule explanations on your turn. It doesn't change bets or recommend strategy.",
      "Ativa explicações das regras na sua vez. Não altera apostas nem recomenda estratégia.",
    ],
  "? Ayuda de este turno": ["? Help for this turn", "? Ajuda nesta vez"],
  "Reglas de tu turno": ["Rules for your turn", "Regras na sua vez"],
  "Apuesta actual: {actual}. Tu aporte: {aporte}.": [
    "Current bet: {actual}. Your contribution: {aporte}.",
    "Aposta atual: {actual}. Sua contribuição: {aporte}.",
  ],
  "No podés pasar: hay una apuesta pendiente que igualar.": [
    "You can't check: there's an outstanding bet to call.",
    "Você não pode passar: há uma aposta pendente para pagar.",
  ],
  "Igualar agrega {n} fichas; tu total en esta ronda queda en {total}.": [
    "Calling adds {n} chips; your total for this round becomes {total}.",
    "Pagar adiciona {n} fichas; seu total nesta rodada fica em {total}.",
  ],
  "Tu stack no alcanza para igualar todo: la igualada será all-in por tus fichas restantes.":
    [
      "Your stack can't cover the full call: calling goes all-in with your remaining chips.",
      "Seu stack não cobre toda a aposta: pagar será all-in com suas fichas restantes.",
    ],
  "Solo podés subir all-in a {max}, por debajo del mínimo de una subida completa.":
    [
      "You can only raise all-in to {max}, below the minimum for a full raise.",
      "Você só pode aumentar all-in para {max}, abaixo do mínimo de um aumento completo.",
    ],
  "Mínimo para subir: total {min}. Máximo: total {max}.": [
    "Minimum raise: total {min}. Maximum: total {max}.",
    "Mínimo para aumentar: total {min}. Máximo: total {max}.",
  ],
  "Subir no está disponible en este turno. Puede faltar stack, otro jugador capaz de apostar o una subida que reabra la acción.":
    [
      "Raising isn't available this turn. There may be insufficient chips, no other player able to bet, or no raise that reopens the action.",
      "Aumentar não está disponível nesta vez. Pode faltar stack, outro jogador capaz de apostar ou um aumento que reabra a ação.",
    ],
  "Con fichas físicas, verificá en la mesa la apuesta pendiente y el mínimo antes de registrar tu acción.":
    [
      "With physical chips, check the outstanding bet and minimum at the table before recording your action.",
      "Com fichas físicas, confira na mesa a aposta pendente e o mínimo antes de registrar sua ação.",
    ],
  "Cerrar ayuda": ["Close help", "Fechar ajuda"],
  "Parte de tu mejor mano.": [
    "Part of your best hand.",
    "Parte da sua melhor mão.",
  ],
  "Las cartas ya usadas no se pueden repetir.": [
    "Cards already in use can't be selected again.",
    "As cartas já usadas não podem ser repetidas.",
  ],
  "Probar mis cartas": ["Try my cards", "Testar minhas cartas"],
  "Explorar manos": ["Explore hands", "Explorar mãos"],
  "Aprender póker": ["Learn poker", "Aprender poker"],
  "Reglas claras. Cartas reales.": [
    "Clear rules. Real cards.",
    "Regras claras. Cartas reais.",
  ],
  "Probá tus cartas y encontrá las cinco mejores.": [
    "Try your cards and find the best five.",
    "Teste suas cartas e encontre as cinco melhores.",
  ],
  "CÓMO SE JUEGA": ["HOW TO PLAY", "COMO JOGAR"],
  "Recibís dos cartas privadas. La mesa puede mostrar hasta cinco cartas compartidas. Gana la mejor mano de cinco, o el último jugador que no se retiró.":
    [
      "You get two private cards. The table can show up to five shared cards. The best five-card hand wins, or the last player who hasn't folded.",
      "Você recebe duas cartas privadas. A mesa pode mostrar até cinco cartas compartilhadas. Vence a melhor mão de cinco cartas, ou o último jogador que não desistiu.",
    ],
  "Las cuatro rondas": ["The four rounds", "As quatro rodadas"],
  "Preflop: dos cartas por jugador y primera ronda de apuestas.": [
    "Preflop: two cards per player and the first betting round.",
    "Preflop: duas cartas por jogador e a primeira rodada de apostas.",
  ],
  "Flop: se muestran tres cartas de la mesa y se apuesta otra vez.": [
    "Flop: three community cards are revealed, followed by another betting round.",
    "Flop: três cartas da mesa são reveladas e há outra rodada de apostas.",
  ],
  "Turn: se agrega la cuarta carta. River: se agrega la quinta. Cada etapa tiene su ronda de apuestas.":
    [
      "Turn: the fourth card is added. River: the fifth is added. Each stage has a betting round.",
      "Turn: entra a quarta carta. River: entra a quinta. Cada etapa tem sua rodada de apostas.",
    ],
  "Si queda más de un jugador, se comparan las manos. Si todos menos uno se retiran, ese jugador gana sin mostrar cartas.":
    [
      "If more than one player remains, hands are compared. If everyone but one folds, that player wins without showing cards.",
      "Se restar mais de um jogador, as mãos são comparadas. Se todos menos um desistirem, ele vence sem mostrar as cartas.",
    ],
  "Acciones de tu turno": ["Actions on your turn", "Ações na sua vez"],
  "Pasar (check): seguís sin agregar fichas, solo cuando no tenés una apuesta pendiente.":
    [
      "Check: continue without adding chips, only when you don't have an outstanding bet to call.",
      "Passar (check): continue sem adicionar fichas, somente quando não há uma aposta pendente para pagar.",
    ],
  "Igualar (call): agregás la diferencia hasta la apuesta actual, o tu stack restante si no te alcanza.":
    [
      "Call: add the difference up to the current bet, or your remaining stack if you don't have enough.",
      "Pagar (call): adicione a diferença até a aposta atual, ou seu stack restante se não tiver o suficiente.",
    ],
  "Subir (raise): aumentás el total de tu apuesta. La mesa indica el mínimo permitido.":
    [
      "Raise: increase your total bet. The table shows the minimum allowed.",
      "Aumentar (raise): aumente o total da sua aposta. A mesa indica o mínimo permitido.",
    ],
  "Retirarse (fold): dejás de participar en esa mano. Las fichas ya apostadas quedan en el pozo.":
    [
      "Fold: leave the hand. Chips already bet remain in the pot.",
      "Desistir (fold): saia da mão. As fichas já apostadas permanecem no pote.",
    ],
  "EJEMPLO DE IGUALADA": ["CALL EXAMPLE", "EXEMPLO DE CALL"],
  "La apuesta actual es 500 y ya pusiste 200. Igualar agrega 300; tu total en esa ronda queda en 500.":
    [
      "The current bet is 500 and you've already put in 200. Calling adds 300; your total for this round becomes 500.",
      "A aposta atual é 500 e você já colocou 200. Pagar adiciona 300; seu total nesta rodada fica em 500.",
    ],
  "Estas ayudas explican reglas, no recomiendan qué acción jugar.": [
    "These tips explain rules; they don't recommend which action to play.",
    "Estas dicas explicam regras; não recomendam qual ação jogar.",
  ],
  "Ciegas y botón": ["Blinds and button", "Blinds e botão"],
  "SB es la ciega pequeña y BB la grande: apuestas obligatorias al inicio. BTN marca el botón que rota con las ciegas.":
    [
      "SB is the small blind and BB the big blind: mandatory opening bets. BTN marks the button that rotates with the blinds.",
      "SB é o small blind e BB o big blind: apostas obrigatórias no início. BTN marca o botão que gira com os blinds.",
    ],
  "Antes del flop empieza quien sigue a BB. Después del flop empieza el primer jugador activo a la izquierda de BTN. En heads-up, BTN/SB empieza preflop y BB después del flop.":
    [
      "Before the flop, the player after BB acts first. After the flop, the first active player to BTN's left acts first. Heads-up: BTN/SB acts first preflop and BB after the flop.",
      "Antes do flop, começa quem vem depois de BB. Após o flop, começa o primeiro jogador ativo à esquerda de BTN. No heads-up, BTN/SB começa no preflop e BB após o flop.",
    ],
  "All-in": ["All-in", "All-in"],
  "All-in significa apostar todas tus fichas restantes. Seguís en la mano, pero solo podés ganar la parte del pozo cubierta por tu aporte.":
    [
      "All-in means betting all your remaining chips. You stay in the hand, but can only win the part of the pot covered by your contribution.",
      "All-in significa apostar todas as suas fichas restantes. Você continua na mão, mas só pode ganhar a parte do pote coberta por sua contribuição.",
    ],
  "Un all-in corto puede no reabrir la posibilidad de subir para quienes ya actuaron. Blindly muestra las acciones legales.":
    [
      "A short all-in may not reopen raising for players who have already acted. Blindly shows legal actions.",
      "Um all-in curto pode não reabrir aumentos para quem já agiu. Blindly mostra as ações legais.",
    ],
  "Pozos secundarios (side pots)": [
    "Side pots",
    "Potes secundários (side pots)",
  ],
  "Ejemplo: A aporta 100, B 300 y C 300. El pozo principal tiene 300 y pueden ganarlo A, B o C. El pozo secundario tiene 400 y solo pueden ganarlo B o C.":
    [
      "Example: A contributes 100, B 300 and C 300. The main pot has 300 and A, B or C can win it. The side pot has 400 and only B or C can win it.",
      "Exemplo: A contribui 100, B 300 e C 300. O pote principal tem 300 e A, B ou C podem ganhá-lo. O pote secundário tem 400 e só B ou C podem ganhá-lo.",
    ],
  "Si A gana la mejor mano, recibe el principal. B y C comparan sus manos para el secundario. La suma sigue siendo 700.":
    [
      "If A has the best hand, A receives the main pot. B and C compare their hands for the side pot. The total is still 700.",
      "Se A tiver a melhor mão, recebe o principal. B e C comparam suas mãos pelo secundário. A soma continua sendo 700.",
    ],
  "Blindly en la mesa": ["Blindly at the table", "Blindly na mesa"],
  "Con fichas físicas, las apuestas y el reparto se hacen en la mesa. Blindly organiza las ciegas y los turnos que correspondan al modo.":
    [
      "With physical chips, betting and distribution happen at the table. Blindly organizes the blinds and turns supported by the mode.",
      "Com fichas físicas, as apostas e a distribuição acontecem na mesa. Blindly organiza os blinds e turnos correspondentes ao modo.",
    ],
  "Editar {valor} de {palo}": [
    "Edit {valor} of {palo}",
    "Editar {valor} de {palo}",
  ],
  "Elegir carta {n} de {zona}": [
    "Choose card {n} from {zona}",
    "Escolher carta {n} de {zona}",
  ],
  "PROBÁ TU MANO · FREE": ["TRY YOUR HAND · FREE", "TESTE SUA MÃO · FREE"],
  "Elegí dos cartas propias y hasta cinco de la mesa. Tocá una carta para cambiarla.":
    [
      "Choose two hole cards and up to five community cards. Tap a card to change it.",
      "Escolha duas cartas próprias e até cinco da mesa. Toque em uma carta para trocá-la.",
    ],
  "Tus cartas": ["Your cards", "Suas cartas"],
  "Cartas de la mesa": ["Community cards", "Cartas da mesa"],
  "Elegí tus dos cartas": ["Choose your two cards", "Escolha suas duas cartas"],
  "Las cinco cartas doradas forman tu mejor mano; los kickers también cuentan.":
    [
      "The five gold cards form your best hand; kickers count too.",
      "As cinco cartas douradas formam sua melhor mão; os kickers também contam.",
    ],
  "Resultado provisional. Necesitás al menos tres cartas de la mesa para formar una mano de cinco.":
    [
      "Provisional result. You need at least three community cards to form a five-card hand.",
      "Resultado provisório. Você precisa de pelo menos três cartas da mesa para formar uma mão de cinco.",
    ],
  "Elegí valor y palo": ["Choose rank and suit", "Escolha valor e naipe"],
  "Editando carta {n} de {zona}": [
    "Editing card {n} from {zona}",
    "Editando carta {n} de {zona}",
  ],
  "Valor {valor}": ["Rank {valor}", "Valor {valor}"],
  "Seleccionar {palo}": ["Select {palo}", "Selecionar {palo}"],
  "Quitar esta carta": ["Remove this card", "Remover esta carta"],
  "Cerrar selector": ["Close card picker", "Fechar seletor"],
  "Ver ejemplo de escalera real": [
    "See royal flush example",
    "Ver exemplo de royal flush",
  ],
  "Limpiar cartas": ["Clear cards", "Limpar cartas"],
  "Herramienta de aprendizaje: no predice cartas ni decide el ganador de una partida real.":
    [
      "Learning tool: it doesn't predict cards or decide the winner of a real game.",
      "Ferramenta de aprendizado: não prevê cartas nem decide o vencedor de uma partida real.",
    ],
  "Tu mesa.\nTu liga.\nTus rivalidades.": [
    "Your table.\nYour league.\nYour rivalries.",
    "Sua mesa.\nSua liga.\nSuas rivalidades.",
  ],
  "Jugá ahora como invitado o protegé tu identidad para llevar tu historia a otro celular.":
    [
      "Play as a guest now or protect your identity to take your history to another phone.",
      "Jogue agora como convidado ou proteja sua identidade para levar seu histórico a outro celular.",
    ],
  "Continuar como invitado": [
    "Continue as a guest",
    "Continuar como convidado",
  ],
  "Crear o recuperar cuenta": [
    "Create or recover account",
    "Criar ou recuperar conta",
  ],
  "Podés proteger tu cuenta más adelante desde Opciones → Mi cuenta.": [
    "You can protect your account later in Settings → My account.",
    "Você pode proteger sua conta depois em Opções → Minha conta.",
  ],
  "No se pudo cargar tu inicio. Probá de nuevo.": [
    "Your introduction could not be loaded. Try again.",
    "Não foi possível carregar sua introdução. Tente novamente.",
  ],
  "No se pudo guardar tu progreso. Probá otra vez.": [
    "Your progress could not be saved. Try again.",
    "Não foi possível salvar seu progresso. Tente novamente.",
  ],
  "Paso {n} de 3": ["Step {n} of 3", "Passo {n} de 3"],
  "EN LA MISMA MESA": ["AT THE SAME TABLE", "NA MESMA MESA"],
  "CADA UNO JUEGA SU TURNO": [
    "EVERYONE PLAYS THEIR TURN",
    "CADA UM JOGA SUA VEZ",
  ],
  "LA HISTORIA DE TU GRUPO": [
    "YOUR GROUP'S HISTORY",
    "A HISTÓRIA DO SEU GRUPO",
  ],
  "Jugamos con cartas de verdad.": [
    "We play with real cards.",
    "Jogamos com cartas de verdade.",
  ],
  "Tu mesa bajo control.": [
    "Your table under control.",
    "Sua mesa sob controle.",
  ],
  "Convertí tus noches en una liga.": [
    "Turn your poker nights into a league.",
    "Transforme suas noites em uma liga.",
  ],
  "Blindly lleva el resto: ciegas, stacks y turnos. Las cartas se reparten en la mesa.":
    [
      "Blindly handles the rest: blinds, stacks and turns. Cards are dealt at the table.",
      "Blindly cuida do resto: blinds, stacks e turnos. As cartas são distribuídas na mesa.",
    ],
  "Con fichas virtuales, cada jugador pasa, iguala, sube o se retira desde su celular. El dealer indica al ganador y reparte el pozo.":
    [
      "With virtual chips, each player checks, calls, raises or folds from their phone. The dealer selects the winner and distributes the pot.",
      "Com fichas virtuais, cada jogador passa, paga, aumenta ou desiste pelo celular. O dealer indica o vencedor e distribui o pote.",
    ],
  "Temporadas · Ranking · Historia": [
    "Seasons · Rankings · History",
    "Temporadas · Ranking · História",
  ],
  "Juntá a tu grupo, sumen partidas y sigan su progreso. Para una partida casual podés seguir como invitado.":
    [
      "Bring your group together, play games and follow your progress. For a casual game, you can stay a guest.",
      "Reúna seu grupo, joguem partidas e acompanhem seu progresso. Para uma partida casual, você pode continuar como convidado.",
    ],
  Empezar: ["Get started", "Começar"],
  "Paso anterior": ["Previous step", "Passo anterior"],
  "Omitir tutorial": ["Skip tutorial", "Pular tutorial"],
  "Guía rápida": ["Quick guide", "Guia rápido"],
  "Protegé tu identidad con una clave privada o recuperá tu cuenta existente. Después seguimos con la guía rápida.":
    [
      "Protect your identity with a private recovery key or recover your existing account. Then we'll continue with the quick guide.",
      "Proteja sua identidade com uma chave privada ou recupere sua conta existente. Depois seguimos com o guia rápido.",
    ],
  "Guardé mi clave. Continuar": [
    "I've saved my key. Continue",
    "Salvei minha chave. Continuar",
  ],
  "Continuar con esta cuenta": [
    "Continue with this account",
    "Continuar com esta conta",
  ],
  "Poker presencial, sin vueltas": [
    "Poker with friends, made simple",
    "Poker presencial, sem complicações",
  ],
  "Crear sala": ["Create room", "Criar sala"],
  Unirme: ["Join", "Entrar"],
  Opciones: ["Settings", "Opções"],
  Volver: ["Back", "Voltar"],
  "¿Salir de la mesa?": ["Leave the table?", "Sair da mesa?"],
  "Seguir en la mesa": ["Stay at the table", "Continuar na mesa"],
  "Salir de la mesa": ["Leave the table", "Sair da mesa"],
  "La partida sigue en curso. Salir de esta pantalla no te retira de la mano ni pausa la mesa. Podés volver con el código de sala.":
    [
      "The game is still running. Leaving this screen does not fold your hand or pause the table. You can return with the room code.",
      "A partida continua. Sair desta tela não desiste da mão nem pausa a mesa. Você pode voltar com o código da sala.",
    ],
  Continuar: ["Continue", "Continuar"],
  Guardar: ["Save", "Salvar"],
  Cancelar: ["Cancel", "Cancelar"],
  "Cargando…": ["Loading…", "Carregando…"],
  "Guardando…": ["Saving…", "Salvando…"],
  Reintentar: ["Retry", "Tentar novamente"],
  "Tu nombre": ["Your name", "Seu nome"],
  "Código de sala": ["Room code", "Código da sala"],
  "Unirme a una sala": ["Join a room", "Entrar em uma sala"],
  "Escanear QR": ["Scan QR", "Escanear QR"],
  "Permitir cámara": ["Allow camera", "Permitir câmera"],
  "Apuntá al QR de Blindly": [
    "Point at the Blindly QR code",
    "Aponte para o QR do Blindly",
  ],
  "QR inválido": ["Invalid QR code", "QR inválido"],
  "Sala de espera": ["Waiting room", "Sala de espera"],
  Jugadores: ["Players", "Jogadores"],
  "Esperando al host": ["Waiting for the host", "Aguardando o anfitrião"],
  "Máximo 10 jugadores, incluido el dealer.": [
    "Up to 10 players, including the dealer.",
    "Máximo de 10 jogadores, incluindo o dealer.",
  ],
  "Ordenar sala": ["Arrange seats", "Organizar a mesa"],
  "Asiento {n}": ["Seat {n}", "Assento {n}"],
  "Elegir dealer": ["Choose dealer", "Escolher dealer"],
  "Ordená los jugadores como están sentados, en sentido horario.": [
    "Arrange players clockwise to match their seats.",
    "Ordene os jogadores no sentido horário, conforme seus assentos.",
  ],
  Subir: ["Move up", "Mover para cima"],
  Bajar: ["Move down", "Mover para baixo"],
  "Configuración de partida": ["Game setup", "Configuração da partida"],
  "Valor de fichas": ["Chip values", "Valores das fichas"],
  "Modo de juego": ["Game format", "Modo de jogo"],
  "Música de ambiente": ["Ambient music", "Música ambiente"],
  "Sin configurar": ["Not configured", "Não configurado"],
  Configurado: ["Configured", "Configurado"],
  "Iniciar partida": ["Start game", "Iniciar partida"],
  "Completá fichas, modo y asientos para iniciar.": [
    "Set chips, format and seats before starting.",
    "Defina fichas, modo e assentos antes de iniciar.",
  ],
  "Fichas físicas": ["Physical chips", "Fichas físicas"],
  "Fichas virtuales": ["Virtual chips", "Fichas virtuais"],
  Valor: ["Value", "Valor"],
  "Cantidad total": ["Total quantity", "Quantidade total"],
  "Stack inicial por jugador": [
    "Starting stack per player",
    "Stack inicial por jogador",
  ],
  "Reparto por jugador": [
    "Distribution per player",
    "Distribuição por jogador",
  ],
  Reserva: ["Reserve", "Reserva"],
  "{n} fichas de {valor}": ["{n} chips worth {valor}", "{n} fichas de {valor}"],
  "Stack: {n}": ["Stack: {n}", "Stack: {n}"],
  "Las cantidades corresponden al total disponible en la mesa. El sobrante queda en reserva.":
    [
      "Quantities are the total available at the table. Leftover chips stay in reserve.",
      "As quantidades são o total disponível na mesa. As sobras ficam na reserva.",
    ],
  "Sin fichas físicas: cada jugador apuesta desde su celular. Solo el dealer reparte el pozo.":
    [
      "No physical chips: players bet from their phones. Only the dealer distributes the pot.",
      "Sem fichas físicas: os jogadores apostam pelo celular. Somente o dealer distribui o pote.",
    ],
  "Recomendado: {modo}": ["Recommended: {modo}", "Recomendado: {modo}"],
  "Recomendación por cantidad de piezas por jugador: menos de 30, Turbo; de 30 a 59, Regular; desde 60, Deep stack. Podés elegir otro.":
    [
      "Suggested by pieces per player: under 30, Turbo; 30–59, Regular; 60 or more, Deep stack. You can choose another.",
      "Sugestão por peças por jogador: menos de 30, Turbo; 30–59, Regular; 60 ou mais, Deep stack. Você pode escolher outro.",
    ],
  "En virtual, Regular ofrece un ritmo equilibrado; podés elegir otro modo.": [
    "For virtual chips, Regular offers a balanced pace; you can choose another format.",
    "Com fichas virtuais, Regular oferece um ritmo equilibrado; você pode escolher outro modo.",
  ],
  "Deep stack": ["Deep stack", "Stack profundo"],
  Turbo: ["Turbo", "Turbo"],
  Regular: ["Regular", "Regular"],
  Personalizado: ["Custom", "Personalizado"],
  "Editar niveles": ["Edit levels", "Editar níveis"],
  "Nivel {n}": ["Level {n}", "Nível {n}"],
  Ciegas: ["Blinds", "Blinds"],
  Descanso: ["Break", "Intervalo"],
  "Fin de niveles": ["End of levels", "Fim dos níveis"],
  Pausar: ["Pause", "Pausar"],
  Reanudar: ["Resume", "Retomar"],
  Anterior: ["Previous", "Anterior"],
  Siguiente: ["Next", "Próximo"],
  "Mano {n}": ["Hand {n}", "Mão {n}"],
  Pozo: ["Pot", "Pote"],
  "Apuesta de esta mano": ["Bet this hand", "Aposta desta mão"],
  Apostar: ["Bet", "Apostar"],
  Monto: ["Amount", "Quantia"],
  "Repartir pozo": ["Distribute pot", "Distribuir pote"],
  "Cerrar mano y rotar dealer": [
    "Close hand and rotate dealer",
    "Encerrar mão e mudar dealer",
  ],
  "Repartí exactamente {n} fichas entre los ganadores.": [
    "Distribute exactly {n} chips among the winners.",
    "Distribua exatamente {n} fichas entre os vencedores.",
  ],
  "Por repartir: {n}": ["Remaining: {n}", "Restante: {n}"],
  "Confirmar reparto": ["Confirm distribution", "Confirmar distribuição"],
  "El dealer decide los ganadores y los pozos secundarios en la mesa.": [
    "The dealer determines winners and side pots at the table.",
    "O dealer determina os vencedores e os potes paralelos na mesa.",
  ],
  "Registrá también las ciegas como apuestas; la app no las descuenta automáticamente.":
    [
      "Also record blinds as bets; the app does not deduct them automatically.",
      "Registre também os blinds como apostas; o app não os desconta automaticamente.",
    ],
  "Las apuestas y el reparto se realizan con las fichas de la mesa.": [
    "Betting and distribution use the chips on the table.",
    "As apostas e a distribuição usam as fichas da mesa.",
  ],
  "Actualizar stack físico": [
    "Update physical stack",
    "Atualizar stack físico",
  ],
  Eliminado: ["Eliminated", "Eliminado"],
  "Partida finalizada": ["Game finished", "Partida encerrada"],
  "Combinaciones de poker": ["Poker hand rankings", "Combinações de poker"],
  Instrucciones: ["Instructions", "Instruções"],
  "Términos y condiciones": ["Terms and conditions", "Termos e condições"],
  "Sonido de ronda": ["Round sound", "Som da rodada"],
  "Volumen de ronda": ["Round volume", "Volume da rodada"],
  "Volumen de música": ["Music volume", "Volume da música"],
  Idioma: ["Language", "Idioma"],
  Tema: ["Theme", "Tema"],
  "Verde (paño)": ["Green (felt)", "Verde (feltro)"],
  Rojo: ["Red", "Vermelho"],
  Negro: ["Black", "Preto"],
  "Reproducir música": ["Play music", "Reproduzir música"],
  "Detener música": ["Stop music", "Parar música"],
  Conectado: ["Connected", "Conectado"],
  "Reconectando…": ["Reconnecting…", "Reconectando…"],
  "Cambios pendientes": ["Pending changes", "Alterações pendentes"],
  "No se pudo completar. Probá de nuevo.": [
    "Could not complete. Please try again.",
    "Não foi possível concluir. Tente novamente.",
  ],
  "Completá tu nombre y el código.": [
    "Enter your name and the code.",
    "Preencha seu nome e o código.",
  ],
  "Hace falta actualizar la base de datos de esta app.": [
    "The app database needs to be updated.",
    "O banco de dados do app precisa ser atualizado.",
  ],
  "La conexión no confirmó la operación. Usá Reintentar para consultar o enviar la misma operación sin duplicarla.":
    [
      "The connection did not confirm the operation. Use Retry to check or send the same operation without duplicating it.",
      "A conexão não confirmou a operação. Use Tentar novamente para consultar ou enviar a mesma operação sem duplicá-la.",
    ],
  "La lista cambió. Revisá el orden antes de guardar.": [
    "The player list changed. Review the order before saving.",
    "A lista mudou. Revise a ordem antes de salvar.",
  ],
  "Ejemplo: con 100 fichas, apostar 20 deja 80 en tu stack y suma 20 al pozo. Al terminar la mano, el dealer entrega el pozo a quien corresponda.":
    [
      "Example: with 100 chips, betting 20 leaves 80 in your stack and adds 20 to the pot. At the end of the hand, the dealer awards the pot.",
      "Exemplo: com 100 fichas, apostar 20 deixa 80 no seu stack e soma 20 ao pote. Ao final da mão, o dealer distribui o pote.",
    ],
  "Creá una sala, invitá por código o QR y ordená los asientos. Elegí fichas y modo antes de iniciar. DR reparte, SB es la ciega chica y BB la grande. Con dos jugadores, DR también es SB.":
    [
      "Create a room, invite by code or QR and arrange the seats. Choose chips and format before starting. DR deals, SB is the small blind and BB the big blind. With two players, DR is also SB.",
      "Crie uma sala, convide por código ou QR e organize os assentos. Escolha fichas e modo antes de iniciar. DR distribui, SB é o small blind e BB o big blind. Com dois jogadores, DR também é SB.",
    ],
  "Blindly organiza partidas presenciales entre amigos. No procesa dinero real, pagos ni premios. Los jugadores acuerdan las reglas y el dealer valida los resultados. La identidad anónima puede perderse al borrar los datos de la app.":
    [
      "Blindly organizes in-person games with friends. It does not process real money, payments or prizes. Players agree on rules and the dealer validates results. Anonymous identity may be lost when app data is cleared.",
      "Blindly organiza partidas presenciais entre amigos. Não processa dinheiro real, pagamentos ou prêmios. Os jogadores combinam as regras e o dealer valida os resultados. A identidade anônima pode ser perdida ao apagar os dados do app.",
    ],
  "Escalera real": ["Royal flush", "Royal flush"],
  "Escalera de color": ["Straight flush", "Straight flush"],
  Poker: ["Four of a kind", "Quadra"],
  "Full house": ["Full house", "Full house"],
  Color: ["Flush", "Flush"],
  Escalera: ["Straight", "Sequência"],
  Trío: ["Three of a kind", "Trinca"],
  "Doble pareja": ["Two pair", "Dois pares"],
  Pareja: ["One pair", "Um par"],
  "Carta alta": ["High card", "Carta alta"],
  "De mayor a menor. El as también puede ser bajo en A–2–3–4–5. Los palos no desempatan.":
    [
      "Highest to lowest. An ace can also be low in A–2–3–4–5. Suits do not break ties.",
      "Da maior para a menor. O ás pode ser baixo em A–2–3–4–5. Os naipes não desempatam.",
    ],
  "Mis niveles": ["My levels", "Meus níveis"],
  Borrar: ["Delete", "Excluir"],
  Minutos: ["Minutes", "Minutos"],
  "+ Nivel": ["+ Level", "+ Nível"],
  "+ Break": ["+ Break", "+ Intervalo"],
  "Revisá los datos": ["Check the values", "Revise os dados"],
  "Niveles inválidos": ["Invalid levels", "Níveis inválidos"],
};

export const errores: Record<string, string> = {
  IDENTIDAD_CLUB_INVALIDA: "Elegí un color, emblema y fondo válidos para el club.",
  PUSH_NO_DISPONIBLE: "Este dispositivo todavía no tiene notificaciones habilitadas.",
  PUSH_PERMISO_DENEGADO: "Permití las notificaciones en los ajustes del sistema para recibir los avisos.",
  AVISOS_CAMBIARON: "Tus preferencias cambiaron en otro dispositivo. Actualizá el club antes de guardar.",
  NOMBRE_INVALIDO: "Completá tu nombre y el código.",
  SESION_REQUERIDA: "No se pudo completar. Probá de nuevo.",
  CUENTA_REQUERIDA: "Protegé tu cuenta para ver tu historial y participar en clubes.",
  INVITACION_INVALIDA: "La invitación no es válida o venció.",
  MIEMBRO_RETIRADO: "Un administrador retiró tu acceso a este club.",
  MEMBRESIA_REQUERIDA: "Primero aceptá la invitación del club para jugar esta partida de liga.",
  SOLO_ADMIN: "Solo el owner o un administrador puede hacer esto.",
  MIEMBRO_NO_EXISTE: "Este miembro ya no está activo en el club.",
  SALA_NO_EXISTE: "No existe una sala con ese código.",
  SALA_LLENA: "La sala ya tiene 10 jugadores.",
  PARTIDA_INICIADA: "La partida ya comenzó.",
  NO_PERTENECES: "No pertenecés a esta sala.",
  SOLO_HOST: "Solo el host puede hacer esto.",
  SOLO_DEALER: "Solo el dealer puede repartir o ajustar fichas.",
  ORDEN_INVALIDO: "Revisá y guardá los asientos de todos los jugadores.",
  DEALER_INVALIDO: "Elegí un dealer.",
  JUGADORES_INVALIDOS: "Se necesitan entre 2 y 10 jugadores.",
  CONFIGURACION_INCOMPLETA: "Completá fichas, modo y asientos para iniciar.",
  FICHAS_INVALIDAS:
    "Revisá las fichas: valores distintos, cantidades enteras y un reparto mayor a cero.",
  NIVELES_INVALIDOS: "Niveles inválidos",
  MONTO_INVALIDO: "Ingresá un entero válido que no supere tu stack.",
  MANO_CAMBIO: "La mano o el pozo cambiaron. Revisá los datos.",
  REPARTO_INVALIDO: "El reparto debe coincidir con el pozo.",
  ESTADO_INVALIDO: "Esta acción no está disponible en el estado actual.",
};
Object.assign(textos, {
  "No existe una sala con ese código.": [
    "No room exists with that code.",
    "Não existe sala com esse código.",
  ],
  "La sala ya tiene 10 jugadores.": [
    "The room already has 10 players.",
    "A sala já tem 10 jogadores.",
  ],
  "La partida ya comenzó.": [
    "The game has already started.",
    "A partida já começou.",
  ],
  "No pertenecés a esta sala.": [
    "You are not in this room.",
    "Você não está nesta sala.",
  ],
  "Solo el host puede hacer esto.": [
    "Only the host can do this.",
    "Somente o anfitrião pode fazer isso.",
  ],
  "Solo el dealer puede repartir fichas.": [
    "Only the dealer can distribute chips.",
    "Somente o dealer pode distribuir fichas.",
  ],
  "Solo el dealer puede repartir o ajustar fichas.": [
    "Only the dealer can distribute or adjust chips.",
    "Somente o dealer pode distribuir ou ajustar fichas.",
  ],
  "Revisá y guardá los asientos de todos los jugadores.": [
    "Review and save every player’s seat.",
    "Revise e salve os assentos de todos os jogadores.",
  ],
  "Elegí un dealer.": ["Choose a dealer.", "Escolha um dealer."],
  "Se necesitan entre 2 y 10 jugadores.": [
    "Between 2 and 10 players are required.",
    "São necessários entre 2 e 10 jogadores.",
  ],
  "Revisá las fichas: valores distintos, cantidades enteras y un reparto mayor a cero.":
    [
      "Check chips: unique values, whole quantities and a distribution greater than zero.",
      "Revise as fichas: valores distintos, quantidades inteiras e distribuição maior que zero.",
    ],
  "Ingresá un entero válido que no supere tu stack.": [
    "Enter a valid whole number within your stack.",
    "Insira um número inteiro válido que não ultrapasse seu stack.",
  ],
  "Ingresá el monto exacto necesario para igualar.": [
    "Enter the exact amount required to call.",
    "Insira o valor exato necessário para pagar.",
  ],
  "La mano o el pozo cambiaron. Revisá los datos.": [
    "The hand or pot changed. Review the values.",
    "A mão ou o pote mudaram. Revise os valores.",
  ],
  "El reparto debe coincidir con el pozo.": [
    "The distribution must match the pot.",
    "A distribuição deve corresponder ao pote.",
  ],
  "Esta acción no está disponible en el estado actual.": [
    "This action is unavailable in the current state.",
    "Esta ação não está disponível no estado atual.",
  ],
});

Object.assign(textos, {
  "Mis ligas": ["My leagues", "Minhas ligas"],
  "Tus temporadas de poker entre amigos.": [
    "Your poker seasons with friends.",
    "Suas temporadas de poker entre amigos.",
  ],
  "BLINDLY LEAGUES": ["BLINDLY LEAGUES", "LIGAS BLINDLY"],
  "Convertí tus partidas en una temporada.": [
    "Turn your games into a season.",
    "Transforme suas partidas em uma temporada.",
  ],
  "Ranking, puntos y resultados compartidos para tu grupo. Los invitados juegan gratis.":
    [
      "Shared standings, points and results for your group. Guests play for free.",
      "Classificação, pontos e resultados compartilhados para seu grupo. Convidados jogam grátis.",
    ],
  "+ Crear liga": ["+ Create league", "+ Criar liga"],
  "Crear mi liga con Plus": [
    "Create my league with Plus",
    "Criar minha liga com Plus",
  ],
  "Todavía no participás en ninguna liga.": [
    "You are not in a league yet.",
    "Você ainda não participa de nenhuma liga.",
  ],
  "Sin temporada": ["No season", "Sem temporada"],
  "{n} miembros": ["{n} members", "{n} membros"],
  "Última partida: {fecha}": ["Last game: {fecha}", "Última partida: {fecha}"],
  "Sin partidas finalizadas": [
    "No completed games",
    "Sem partidas finalizadas",
  ],
  "Una liga existente permanece visible si el owner deja Plus. La administración queda en pausa hasta restaurarlo.":
    [
      "An existing league stays visible if its owner leaves Plus. Management pauses until Plus is restored.",
      "Uma liga existente continua visível se o owner deixar o Plus. A administração fica pausada até a restauração.",
    ],
  "Crear liga": ["Create league", "Criar liga"],
  "Esta función requiere Blindly Plus.": [
    "This feature requires Blindly Plus.",
    "Este recurso exige Blindly Plus.",
  ],
  "Solo el owner necesita Plus. Todos sus invitados pueden participar gratis.":
    [
      "Only the owner needs Plus. Every guest can participate for free.",
      "Somente o owner precisa do Plus. Todos os convidados podem participar grátis.",
    ],
  "Dale una identidad a tu grupo y empezá su primera temporada.": [
    "Give your group an identity and start its first season.",
    "Dê uma identidade ao seu grupo e comece a primeira temporada.",
  ],
  "Nombre de la liga": ["League name", "Nome da liga"],
  "Los Pibes Poker League": ["Friday Poker League", "Liga do Poker de Sexta"],
  "Nombre de la temporada": ["Season name", "Nome da temporada"],
  "Temporada 2026": ["2026 Season", "Temporada 2026"],
  "Tu nombre en la liga": ["Your league name", "Seu nome na liga"],
  "Nombre de jugador": ["Player name", "Nome do jogador"],
  "Los demás miembros se incorporan automáticamente al jugar su primera partida asociada.":
    [
      "Other members join automatically when they play their first associated game.",
      "Os outros membros entram automaticamente ao jogar a primeira partida associada.",
    ],
  Liga: ["League", "Liga"],
  Ranking: ["Standings", "Classificação"],
  "El ranking aparecerá al finalizar la primera partida de esta temporada.": [
    "The standings will appear after the first game of this season is completed.",
    "A classificação aparecerá após a primeira partida desta temporada ser concluída.",
  ],
  Jugador: ["Player", "Jogador"],
  PJ: ["GP", "PJ"],
  V: ["W", "V"],
  Podios: ["Podiums", "Pódios"],
  Pts: ["Pts", "Pts"],
  Partidas: ["Games", "Partidas"],
  "Todavía no hay partidas finalizadas en esta temporada.": [
    "There are no completed games in this season yet.",
    "Ainda não há partidas finalizadas nesta temporada.",
  ],
  "Ganó {nombre}": ["{nombre} won", "{nombre} venceu"],
  Miembros: ["Members", "Membros"],
  Owner: ["Owner", "Owner"],
  Quitar: ["Remove", "Remover"],
  "Quitar miembro": ["Remove member", "Remover membro"],
  "Dejará de ver la liga, pero sus resultados históricos se conservan.": [
    "They will no longer see the league, but their historical results will be preserved.",
    "A pessoa deixará de ver a liga, mas seus resultados históricos serão preservados.",
  ],
  "Liga en modo lectura": ["Read-only league", "Liga em modo de leitura"],
  "Tus datos siguen guardados. Restaurá Plus para crear temporadas o partidas asociadas y administrar miembros.":
    [
      "Your data remains saved. Restore Plus to create seasons or associated games and manage members.",
      "Seus dados continuam salvos. Restaure o Plus para criar temporadas ou partidas associadas e gerenciar membros.",
    ],
  "Restaurar Blindly Plus": ["Restore Blindly Plus", "Restaurar Blindly Plus"],
  "Administrar liga": ["Manage league", "Gerenciar liga"],
  "Editar nombre": ["Edit name", "Editar nome"],
  "Crear partida para esta temporada": [
    "Create game for this season",
    "Criar partida para esta temporada",
  ],
  "Finalizar temporada": ["End season", "Finalizar temporada"],
  "El ranking quedará guardado y luego podrás crear una temporada nueva.": [
    "The standings will be preserved and you can then create a new season.",
    "A classificação será preservada e depois você poderá criar uma nova temporada.",
  ],
  Finalizar: ["End", "Finalizar"],
  "Nombre de la nueva temporada": ["New season name", "Nome da nova temporada"],
  "Temporada 2027": ["2027 Season", "Temporada 2027"],
  "Crear temporada": ["Create season", "Criar temporada"],
  "Reactivar liga": ["Reactivate league", "Reativar liga"],
  "Archivar liga": ["Archive league", "Arquivar liga"],
  "PARTIDA DE LIGA": ["LEAGUE GAME", "PARTIDA DE LIGA"],
  "Temporada activa": ["Active season", "Temporada ativa"],
  "Al finalizar, los puntos se sumarán automáticamente al ranking de esta temporada.":
    [
      "When the game ends, points will be added automatically to this season's standings.",
      "Ao finalizar, os pontos serão somados automaticamente à classificação desta temporada.",
    ],
  "Temporadas, ranking y partidas de tu grupo.": [
    "Your group's seasons, standings and games.",
    "Temporadas, classificação e partidas do seu grupo.",
  ],
  "Ligas privadas": ["Private leagues", "Ligas privadas"],
  "Creá temporadas, reuní a tu grupo y seguí un ranking compartido.": [
    "Create seasons, bring your group together and follow shared standings.",
    "Crie temporadas, reúna seu grupo e acompanhe uma classificação compartilhada.",
  ],
  "Convertí tu mesa en una liga.": [
    "Turn your table into a league.",
    "Transforme sua mesa em uma liga.",
  ],
  "Blindly Plus es necesario para administrar ligas.": [
    "Blindly Plus is required to manage leagues.",
    "Blindly Plus é necessário para gerenciar ligas.",
  ],
  "No se pudo verificar Blindly Plus. Probá de nuevo.": [
    "Blindly Plus could not be verified. Try again.",
    "Não foi possível verificar o Blindly Plus. Tente novamente.",
  ],
  "La verificación de Plus todavía no está configurada en el servidor.": [
    "Plus verification is not configured on the server yet.",
    "A verificação do Plus ainda não está configurada no servidor.",
  ],
  "Solo el owner puede administrar esta liga.": [
    "Only the owner can manage this league.",
    "Somente o owner pode gerenciar esta liga.",
  ],
  "Finalizá la temporada activa antes de crear otra.": [
    "End the active season before creating another one.",
    "Finalize a temporada ativa antes de criar outra.",
  ],
  "No se puede finalizar mientras haya una partida activa.": [
    "The season cannot end while a game is active.",
    "Não é possível finalizar enquanto houver uma partida ativa.",
  ],
  "La liga no está disponible para esta cuenta.": [
    "This league is not available to this account.",
    "Esta liga não está disponível para esta conta.",
  ],
  "La temporada no está activa o no existe.": [
    "The season is not active or does not exist.",
    "A temporada não está ativa ou não existe.",
  ],
  "La liga está archivada.": [
    "The league is archived.",
    "A liga está arquivada.",
  ],
  "El owner no puede quitarse de su propia liga.": [
    "The owner cannot be removed from their own league.",
    "O owner não pode ser removido da própria liga.",
  ],
});

Object.assign(errores, {
  PLUS_REQUERIDO: "Blindly Plus es necesario para esta función premium.",
  PLUS_CLUB_REQUERIDO: "El owner necesita Plus verificado para editar títulos del club.",
  TITULO_INVALIDO: "El título debe tener entre 2 y 24 caracteres, sin enlaces ni etiquetas.",
  FECHA_INVALIDA: "Elegí una fecha futura dentro del próximo año y respetá los límites del lugar y la nota.",
  FECHA_CAMBIO: "La fecha cambió o ya pasó. Actualizá el club antes de confirmar.",
  PLUS_NO_VERIFICADO: "No se pudo verificar Blindly Plus. Probá de nuevo.",
  PLUS_SERVIDOR_NO_CONFIGURADO:
    "La verificación de Plus todavía no está configurada en el servidor.",
  SOLO_OWNER: "Solo el owner puede administrar esta liga.",
  TEMPORADA_ACTIVA: "Finalizá la temporada activa antes de crear otra.",
  TEMPORADA_NO_FINALIZABLE:
    "No se puede finalizar mientras haya una partida activa.",
  LIGA_NO_DISPONIBLE: "La liga no está disponible para esta cuenta.",
  TEMPORADA_NO_EXISTE: "La temporada no está activa o no existe.",
  LIGA_ARCHIVADA: "La liga está archivada.",
  OWNER_REQUERIDO: "El owner no puede quitarse de su propia liga.",
});

export function traducir(
  idioma: Idioma,
  clave: string,
  datos: Record<string, string | number> = {},
) {
  const texto =
    idioma === "es"
      ? clave
      : (textos[clave]?.[idioma === "en" ? 0 : 1] ?? clave);
  return texto.replace(/\{(\w+)\}/g, (_, nombre: string) =>
    String(datos[nombre] ?? `{${nombre}}`),
  );
}

Object.assign(textos, {
  "Dealer fijo": ["Fixed dealer", "Dealer fixo"],
  "Tu turno": ["Your turn", "Sua vez"],
  "Turno de {nombre}": ["{nombre}’s turn", "Vez de {nombre}"],
  "En turno": ["To act", "Na vez"],
  Retirado: ["Folded", "Desistiu"],
  Retirarse: ["Fold", "Desistir"],
  Pasar: ["Check", "Passar"],
  Subir: ["Raise", "Aumentar"],
  "Para igualar": ["To call", "Para pagar"],
  "Igualar {n}": ["Call {n}", "Pagar {n}"],
  "Subir a (total de la ronda)": [
    "Raise to (round total)",
    "Aumentar para (total da rodada)",
  ],
  "Total apostado en la ronda": [
    "Total wagered this round",
    "Total apostado na rodada",
  ],
  "Monto exacto para igualar: {n}": [
    "Exact amount to call: {n}",
    "Valor exato para pagar: {n}",
  ],
  "Confirmar igualar a {n}": [
    "Confirm call to {n}",
    "Confirmar pagamento para {n}",
  ],
  "Subida mínima a {n}": ["Minimum raise to {n}", "Aumento mínimo para {n}"],
  "Listo para repartir": ["Ready for payout", "Pronto para distribuir"],
  Pausado: ["Paused", "Pausado"],
  preflop: ["Preflop", "Pré-flop"],
  flop: ["Flop", "Flop"],
  turn: ["Turn", "Turn"],
  river: ["River", "River"],
  reparto: ["Payout", "Distribuição"],
  "Pozo principal": ["Main pot", "Pote principal"],
  "Pozo secundario": ["Side pot", "Pote lateral"],
  "Registrar acción de {nombre}": [
    "Record {nombre}’s action",
    "Registrar ação de {nombre}",
  ],
  "Pasó / igualó": ["Checked / called", "Passou / pagou"],
  "Apostó / subió": ["Bet / raised", "Apostou / aumentou"],
  "Se retiró": ["Folded", "Desistiu"],
  "Cerrar mano y rotar ciegas": [
    "End hand and rotate blinds",
    "Encerrar mão e girar blinds",
  ],
  "Las ciegas virtuales se descuentan al comenzar cada mano.": [
    "Virtual blinds are posted automatically at the start of each hand.",
    "Os blinds virtuais são descontados automaticamente no início de cada mão.",
  ],
  "El dealer elige los ganadores. Cada pozo muestra solo los jugadores elegibles.":
    [
      "The dealer chooses winners. Each pot shows only eligible players.",
      "O dealer escolhe os vencedores. Cada pote mostra apenas jogadores elegíveis.",
    ],
  "DR es el dealer fijo y reparte los pozos. BTN es el botón que rota con las ciegas. Con dos jugadores, BTN también es SB.":
    [
      "DR is the fixed dealer who pays out pots. BTN rotates with the blinds. Heads-up, BTN is also SB.",
      "DR é o dealer fixo que distribui os potes. BTN gira com os blinds. Com dois jogadores, BTN também é SB.",
    ],
  "Esperá tu turno. Antes del flop empieza quien está después de BB; en las demás rondas empieza el primer jugador activo después de BTN.":
    [
      "Wait for your turn. Preflop starts after BB; later rounds start with the first active player after BTN.",
      "Espere sua vez. Antes do flop começa quem está depois do BB; nas demais rodadas começa o primeiro jogador ativo depois do BTN.",
    ],
  "No es tu turno.": ["It is not your turn.", "Não é sua vez."],
  "Tenés una apuesta pendiente de igualar.": [
    "You have a bet to call.",
    "Você tem uma aposta para pagar.",
  ],
  "Revisá el mínimo de subida y los jugadores que pueden responder.": [
    "Check the minimum raise and players able to respond.",
    "Confira o aumento mínimo e os jogadores que podem responder.",
  ],
  "Esta subida corta no reabre tu derecho a subir.": [
    "This short raise does not reopen your right to raise.",
    "Este aumento curto não reabre seu direito de aumentar.",
  ],
  "Todavía hay apuestas por resolver.": [
    "Betting is still in progress.",
    "Ainda há apostas a resolver.",
  ],
});
Object.assign(errores, {
  TURNO_AJENO: "No es tu turno.",
  APUESTA_PENDIENTE: "Tenés una apuesta pendiente de igualar.",
  SUBIDA_INVALIDA:
    "Revisá el mínimo de subida y los jugadores que pueden responder.",
  SUBIDA_NO_REABIERTA: "Esta subida corta no reabre tu derecho a subir.",
  APUESTAS_ABIERTAS: "Todavía hay apuestas por resolver.",
  MONTO_IGUALAR_INVALIDO: "Ingresá el monto exacto necesario para igualar.",
});

Object.assign(textos, {
  "POKER ENTRE AMIGOS": ["POKER WITH FRIENDS", "POKER ENTRE AMIGOS"],
  "La mesa está lista.\nFaltan ustedes.": [
    "The table is ready.\nBring your friends.",
    "A mesa está pronta.\nSó faltam vocês.",
  ],
  "Reuní a tus amigos. Blindly se ocupa de las ciegas, los turnos y las fichas.":
    [
      "Bring your friends together. Blindly handles blinds, turns and chips.",
      "Reúna seus amigos. Blindly cuida dos blinds, turnos e fichas.",
    ],
  "Organizá la partida e invitá a tu mesa.": [
    "Set up a game and invite your table.",
    "Organize a partida e convide sua mesa.",
  ],
  "Entrá con el código o escaneá el QR.": [
    "Enter a code or scan the QR.",
    "Entre com o código ou escaneie o QR.",
  ],
  "Cómo jugar": ["How to play", "Como jogar"],
  "EN LA MISMA MESA. EN CADA CELULAR.": [
    "ONE TABLE. EVERY PHONE.",
    "NA MESMA MESA. EM CADA CELULAR.",
  ],
  Invitar: ["Invite", "Convidar"],
  Asientos: ["Seats", "Assentos"],
  Preparar: ["Set up", "Preparar"],
  "Vos organizás. Tus amigos se suman.": [
    "You host. Your friends join.",
    "Você organiza. Seus amigos participam.",
  ],
  "Primero, ¿cómo te llamás? Después podrás invitar a tu mesa y elegir cómo jugar.":
    [
      "First, what is your name? Then invite your table and choose how to play.",
      "Primeiro, qual é seu nome? Depois convide sua mesa e escolha como jogar.",
    ],
  "Completá tu nombre.": ["Enter your name.", "Preencha seu nome."],
  "Tu lugar en la mesa te espera.": [
    "Your seat at the table is waiting.",
    "Seu lugar na mesa espera por você.",
  ],
  "Dealer elegido": ["Selected dealer", "Dealer escolhido"],
  "Prepará tu partida": ["Set up your game", "Prepare sua partida"],
  "Dos elecciones y a jugar.": [
    "Two choices, then play.",
    "Duas escolhas e vamos jogar.",
  ],
  "Todo listo para repartir las cartas.": [
    "Ready to deal the cards.",
    "Tudo pronto para distribuir as cartas.",
  ],
  "Elegí las fichas y el ritmo de la partida.": [
    "Choose chips and the pace of your game.",
    "Escolha as fichas e o ritmo da partida.",
  ],
  "Usá tus fichas o llevá el stack en el celular.": [
    "Use your chips or track stacks on your phone.",
    "Use suas fichas ou controle o stack no celular.",
  ],
  "Una partida rápida, equilibrada o sin apuro.": [
    "A fast, balanced or relaxed game.",
    "Uma partida rápida, equilibrada ou sem pressa.",
  ],
  "Un poco de ambiente para tu mesa.": [
    "Set the mood for your table.",
    "Um pouco de clima para sua mesa.",
  ],
  "Compartí este código o el QR con tus amigos.": [
    "Share this code or QR with your friends.",
    "Compartilhe este código ou QR com seus amigos.",
  ],
  "Tu mesa": ["Your table", "Sua mesa"],
  "Tu stack": ["Your stack", "Seu stack"],
  "Partida pausada": ["Game paused", "Partida pausada"],
  "Control de partida": ["Game controls", "Controles da partida"],
  "POZO TOTAL": ["TOTAL POT", "POTE TOTAL"],
  "Cancelar subida": ["Cancel raise", "Cancelar aumento"],
  "Cancelar monto": ["Cancel amount", "Cancelar valor"],
  "Confirmar all-in": ["Confirm all-in", "Confirmar all-in"],
  "Subir a {n}": ["Raise to {n}", "Aumentar para {n}"],
  "Más acción, ciegas más rápidas.": [
    "More action, faster blinds.",
    "Mais ação, blinds mais rápidos.",
  ],
  "El equilibrio para una noche entre amigos.": [
    "A balanced pace for a night with friends.",
    "O equilíbrio para uma noite entre amigos.",
  ],
  "Más fichas y tiempo para pensar.": [
    "More chips and time to think.",
    "Mais fichas e tempo para pensar.",
  ],
  "Elegí tus propios niveles y descansos.": [
    "Choose your own levels and breaks.",
    "Escolha seus próprios níveis e intervalos.",
  ],
  "Ver niveles": ["View levels", "Ver níveis"],
  "Elegí al ganador o editá los importes para un empate.": [
    "Choose the winner or edit amounts for a split pot.",
    "Escolha o vencedor ou edite os valores para um empate.",
  ],
  "Gana {nombre}": ["{nombre} wins", "{nombre} ganha"],
});

Object.assign(textos, {
  "Tu guía para leer la mesa.": [
    "Your guide to reading the table.",
    "Seu guia para entender a mesa.",
  ],
  "DE MAYOR A MENOR": ["HIGHEST TO LOWEST", "DA MAIOR PARA A MENOR"],
  "Diez manos, un vistazo. Tocá una combinación para ver cómo se desempata.": [
    "Ten hands at a glance. Tap a hand to see how ties are broken.",
    "Dez mãos em um olhar. Toque em uma combinação para ver o desempate.",
  ],
  "LA MANO MÁS ALTA": ["THE HIGHEST HAND", "A MÃO MAIS ALTA"],
  "Cómo se desempata": ["How ties are broken", "Como desempatar"],
  "Del 10 al as, todas del mismo palo.": [
    "Ten through ace, all of the same suit.",
    "Do dez ao ás, todas do mesmo naipe.",
  ],
  "Cinco cartas seguidas del mismo palo.": [
    "Five consecutive cards of the same suit.",
    "Cinco cartas consecutivas do mesmo naipe.",
  ],
  "Cuatro cartas del mismo valor.": [
    "Four cards of the same rank.",
    "Quatro cartas do mesmo valor.",
  ],
  "Un trío y una pareja.": [
    "Three of a kind and a pair.",
    "Uma trinca e um par.",
  ],
  "Cinco cartas del mismo palo, sin escalera.": [
    "Five cards of one suit, not consecutive.",
    "Cinco cartas do mesmo naipe, sem sequência.",
  ],
  "Cinco cartas seguidas, de distintos palos.": [
    "Five consecutive cards of mixed suits.",
    "Cinco cartas consecutivas de naipes diferentes.",
  ],
  "Tres cartas del mismo valor.": [
    "Three cards of the same rank.",
    "Três cartas do mesmo valor.",
  ],
  "Dos parejas de valores diferentes.": [
    "Two pairs of different ranks.",
    "Dois pares de valores diferentes.",
  ],
  "Dos cartas del mismo valor.": [
    "Two cards of the same rank.",
    "Duas cartas do mesmo valor.",
  ],
  "Sin combinación, cuenta la carta más alta.": [
    "With no combination, the highest card counts.",
    "Sem combinação, vale a carta mais alta.",
  ],
  "Es la mano más alta. Si ambos tienen escalera real, se divide el pozo.": [
    "This is the highest hand. Two royal flushes split the pot.",
    "É a mão mais alta. Dois royal flushes dividem o pote.",
  ],
  "Gana la escalera que termina en la carta más alta.": [
    "The straight ending in the highest card wins.",
    "Vence a sequência que termina na carta mais alta.",
  ],
  "Gana el grupo de cuatro más alto. Si es igual, decide la quinta carta.": [
    "The higher four of a kind wins. If tied, the fifth card decides.",
    "Vence a quadra mais alta. Se empatar, a quinta carta decide.",
  ],
  "Se compara primero el trío. Si es igual, gana la pareja más alta.": [
    "Compare the three of a kind first. If tied, the higher pair wins.",
    "Compare primeiro a trinca. Se empatar, vence o par mais alto.",
  ],
  "Compará las cartas de mayor a menor. La primera diferencia decide.": [
    "Compare cards from highest to lowest. The first difference decides.",
    "Compare as cartas da maior para a menor. A primeira diferença decide.",
  ],
  "Gana la carta más alta de la escalera. En A–2–3–4–5, el as vale bajo.": [
    "The highest card in the straight wins. In A–2–3–4–5, the ace is low.",
    "Vence a carta mais alta da sequência. Em A–2–3–4–5, o ás vale baixo.",
  ],
  "Gana el trío más alto. Si es igual, se comparan las otras dos cartas de mayor a menor.":
    [
      "The higher three of a kind wins. If tied, compare the remaining cards from highest to lowest.",
      "Vence a trinca mais alta. Se empatar, compare as outras duas cartas da maior para a menor.",
    ],
  "Compará la pareja más alta, después la otra pareja y, por último, la quinta carta.":
    [
      "Compare the higher pair, then the lower pair, then the fifth card.",
      "Compare o par mais alto, depois o outro par e, por fim, a quinta carta.",
    ],
  "Gana la pareja más alta. Si es igual, se comparan las otras tres cartas de mayor a menor.":
    [
      "The higher pair wins. If tied, compare the remaining three cards from highest to lowest.",
      "Vence o par mais alto. Se empatar, compare as outras três cartas da maior para a menor.",
    ],
  "Compará las cinco cartas de mayor a menor. La primera diferencia decide.": [
    "Compare all five cards from highest to lowest. The first difference decides.",
    "Compare as cinco cartas da maior para a menor. A primeira diferença decide.",
  ],
  "Acordate de esto": ["Keep in mind", "Lembre-se"],
  "En Texas Hold’em usás la mejor combinación de cinco cartas entre tus dos cartas y las cinco de la mesa.":
    [
      "In Texas Hold’em, use the best five-card hand from your two cards and the five community cards.",
      "No Texas Hold’em, use a melhor mão de cinco cartas entre suas duas cartas e as cinco da mesa.",
    ],
  "Los palos no tienen jerarquía. Si la combinación y los cinco valores son iguales, se divide el pozo.":
    [
      "Suits have no ranking. If the hand type and all five ranks match, split the pot.",
      "Naipes não têm hierarquia. Se a combinação e os cinco valores forem iguais, divida o pote.",
    ],
  "Resaltamos el grupo principal; las otras cartas también pueden desempatar.":
    [
      "We highlight the main group; the other cards can also break ties.",
      "Destacamos o grupo principal; as outras cartas também podem desempatar.",
    ],
  "{valor} de {palo}": ["{valor} of {palo}", "{valor} de {palo}"],
  As: ["Ace", "Ás"],
  Rey: ["King", "Rei"],
  Reina: ["Queen", "Dama"],
  Jota: ["Jack", "Valete"],
  picas: ["spades", "espadas"],
  corazones: ["hearts", "copas"],
  diamantes: ["diamonds", "ouros"],
  tréboles: ["clubs", "paus"],
});

Object.assign(textos, {
  "Créditos de música": ["Music credits", "Créditos da música"],
  "Jazz de salón para acompañar la mesa.": [
    "Lounge jazz to accompany your table.",
    "Jazz de salão para acompanhar a mesa.",
  ],
  "Licencia Creative Commons Atribución 4.0. Pista original sin modificaciones, reproducida en bucle.":
    [
      "Creative Commons Attribution 4.0 license. Original, unmodified track played on repeat.",
      "Licença Creative Commons Atribuição 4.0. Faixa original sem modificações, reproduzida em loop.",
    ],
  "Escuchar y conocer al autor": [
    "Listen and meet the artist",
    "Ouvir e conhecer o autor",
  ],
  "Ver licencia": ["View license", "Ver licença"],
});
Object.assign(textos, {
  "Mi puntuación": ["My score", "Minha pontuação"],
  "Tus puntos, tu progreso y tu rango.": [
    "Your points, progress and rank.",
    "Seus pontos, progresso e posição.",
  ],
  "SOLO VOS PODÉS VER TUS PUNTOS": [
    "ONLY YOU CAN SEE YOUR POINTS",
    "SÓ VOCÊ PODE VER SEUS PONTOS",
  ],
  "Puntos acumulados": ["Total points", "Pontos acumulados"],
  "Sin rango": ["Unranked", "Sem classificação"],
  "Rango global #{n}": ["Global rank #{n}", "Posição global #{n}"],
  "{n} partidas": ["{n} games", "{n} partidas"],
  "Tus compañeros de mesa ven tu rango, nunca tus puntos ni tu historial.": [
    "Your tablemates see your rank, never your points or history.",
    "Seus colegas de mesa veem sua posição, nunca seus pontos ou histórico.",
  ],
  "Mis últimas partidas": ["My recent games", "Minhas últimas partidas"],
  "Terminá tu primera partida para sumar puntos y obtener un rango.": [
    "Finish your first game to earn points and get a rank.",
    "Termine sua primeira partida para somar pontos e obter uma posição.",
  ],
  "Puesto {p} de {n}": ["Place {p} of {n}", "Posição {p} de {n}"],
  puntos: ["points", "pontos"],
  "Cómo se suman los puntos": ["How points work", "Como os pontos funcionam"],
  "Se quitan los puntajes más altos hasta quedar uno por jugador. Los puntos se acreditan una sola vez, al terminar la partida.":
    [
      "The highest scores are removed until one remains per player. Points are awarded once, when the game ends.",
      "As maiores pontuações são removidas até restar uma por jogador. Os pontos são creditados uma única vez, ao terminar a partida.",
    ],
  "Menos jugadores": ["Fewer players", "Menos jogadores"],
  "Más jugadores": ["More players", "Mais jogadores"],
  "{n} jugadores": ["{n} players", "{n} jogadores"],
  "Si hay eliminados en la misma mano, queda mejor quien empezó con más fichas. Si empatan, comparten puesto y promedian los puntos de esos lugares.":
    [
      "Players eliminated in the same hand are ranked by their starting stacks. Equal stacks share the place and average the points of those places.",
      "Eliminados na mesma mão são classificados pelas fichas no início da mão. Em caso de empate, dividem a posição e recebem a média dos pontos desses lugares.",
    ],
  "En partidas con fichas físicas, registrá los stacks antes de cerrar cada mano. Las partidas iniciadas antes de esta función no suman puntos.":
    [
      "With physical chips, record stacks before closing each hand. Games started before this feature do not earn points.",
      "Com fichas físicas, registre os stacks antes de encerrar cada mão. Partidas iniciadas antes desta função não somam pontos.",
    ],
  "Tu historial está guardado en la base de datos y vinculado a este invitado. Borrar los datos de la app o cambiar de dispositivo no recupera esta identidad automáticamente.":
    [
      "Your history is saved in the database and linked to this guest. Clearing app data or changing devices does not recover this identity automatically.",
      "Seu histórico está salvo no banco de dados e vinculado a este convidado. Apagar os dados do app ou mudar de dispositivo não recupera esta identidade automaticamente.",
    ],
  "Ver mis puntos": ["View my points", "Ver meus pontos"],
  "No se pudieron cargar los rangos.": [
    "Ranks could not be loaded.",
    "Não foi possível carregar as posições.",
  ],
  "Rango no disponible": ["Rank unavailable", "Posição indisponível"],
  "Debe quedar un ganador con fichas antes de finalizar.": [
    "One winner must have chips before the game can end.",
    "Deve restar um vencedor com fichas antes de finalizar.",
  ],
  "La eliminación ya se confirmó al cerrar la mano.": [
    "This elimination was confirmed when the hand closed.",
    "A eliminação já foi confirmada ao encerrar a mão.",
  ],
});
Object.assign(errores, {
  GANADOR_REQUERIDO: "Debe quedar un ganador con fichas antes de finalizar.",
  ELIMINACION_CONFIRMADA: "La eliminación ya se confirmó al cerrar la mano.",
});

Object.assign(textos, { punto: ["point", "ponto"] });
Object.assign(textos, {
  "Mi cuenta": ["My account", "Minha conta"],
  "Jugás como invitado": ["Playing as a guest", "Jogando como convidado"],
  "Cuenta recuperable": ["Recoverable account", "Conta recuperável"],
  "Vinculá tu email para conservar tus puntos e historial al cambiar de celular. Podés seguir jugando como invitado.":
    [
      "Link your email to keep your points and history when changing phones. You can keep playing as a guest.",
      "Vincule seu email para manter pontos e histórico ao trocar de celular. Você pode continuar como convidado.",
    ],
  "Recuperar mi cuenta": ["Recover my account", "Recuperar minha conta"],
  "Proteger este invitado": ["Protect this guest", "Proteger este convidado"],
  "Al confirmar, entrarás a la cuenta del correo. Los puntos del invitado actual no se trasladan. Si tiene puntos, vinculalo antes a otro correo. No cambies de cuenta durante una partida.":
    [
      "Confirming signs you into the email's account. Current guest points are not transferred. Link a guest with points to another email first. Do not switch accounts during a game.",
      "Ao confirmar, você entra na conta do email. Pontos do convidado atual não são transferidos. Vincule um convidado com pontos a outro email primeiro. Não troque de conta durante uma partida.",
    ],
  Email: ["Email", "Email"],
  "Enviar código": ["Send code", "Enviar código"],
  "Ya tengo una cuenta": ["I already have an account", "Já tenho uma conta"],
  "Ingresá el código enviado a tu email.": [
    "Enter the code sent to your email.",
    "Digite o código enviado ao seu email.",
  ],
  "Código de verificación": ["Verification code", "Código de verificação"],
  "Confirmar código": ["Confirm code", "Confirmar código"],
  "Volver a ingresar email": ["Enter email again", "Inserir email novamente"],
  "En otro celular, elegí Ya tengo una cuenta e ingresá este mismo correo.": [
    "On another phone, choose I already have an account and enter this email.",
    "Em outro celular, escolha Já tenho uma conta e digite este email.",
  ],
  "Volver al inicio": ["Back to home", "Voltar ao início"],
  "Protegé tu historial vinculando un email en Mi cuenta.": [
    "Protect your history by linking an email in My account.",
    "Proteja seu histórico vinculando um email em Minha conta.",
  ],
  "Ingresá un email válido.": [
    "Enter a valid email.",
    "Digite um email válido.",
  ],
  "La sesión cambió. Volvé a abrir Mi cuenta.": [
    "Your session changed. Open My account again.",
    "Sua sessão mudou. Abra Minha conta novamente.",
  ],
  "El código venció o no es válido. Solicitá otro.": [
    "The code expired or is invalid. Request another.",
    "O código expirou ou é inválido. Solicite outro.",
  ],
  "Esperá un momento antes de solicitar otro código.": [
    "Wait a moment before requesting another code.",
    "Aguarde um momento antes de solicitar outro código.",
  ],
  "Este email ya tiene una cuenta. Usá otro para proteger este invitado.": [
    "This email already has an account. Use another to protect this guest.",
    "Este email já tem uma conta. Use outro para proteger este convidado.",
  ],
  "La cuenta ya está vinculada.": [
    "This account is already linked.",
    "Esta conta já está vinculada.",
  ],
  "Primero protegé este invitado y terminá sus partidas o suscripciones antes de recuperar otra cuenta.":
    [
      "Protect this guest and finish its games or subscriptions before recovering another account.",
      "Proteja este convidado e finalize suas partidas ou assinaturas antes de recuperar outra conta.",
    ],
  "El servicio de correo requiere configuración. Probá más tarde.": [
    "The email service needs configuration. Try again later.",
    "O serviço de email precisa de configuração. Tente mais tarde.",
  ],
});
Object.assign(errores, {
  EMAIL_INVALIDO: "Ingresá un email válido.",
  CUENTA_YA_VINCULADA: "La cuenta ya está vinculada.",
  SESION_CAMBIO: "La sesión cambió. Volvé a abrir Mi cuenta.",
  CODIGO_NO_CONFIRMADO: "El código venció o no es válido. Solicitá otro.",
  otp_expired: "El código venció o no es válido. Solicitá otro.",
  over_email_send_rate_limit:
    "Esperá un momento antes de solicitar otro código.",
  email_exists:
    "Este email ya tiene una cuenta. Usá otro para proteger este invitado.",
  identity_already_exists:
    "Este email ya tiene una cuenta. Usá otro para proteger este invitado.",
  PROTEGER_INVITADO:
    "Primero protegé este invitado y terminá sus partidas o suscripciones antes de recuperar otra cuenta.",
  email_provider_disabled:
    "El servicio de correo requiere configuración. Probá más tarde.",
  email_address_not_authorized:
    "El servicio de correo requiere configuración. Probá más tarde.",
  manual_linking_disabled:
    "El servicio de correo requiere configuración. Probá más tarde.",
});

Object.assign(textos, {
  "La recuperación por correo está en preparación. Podés seguir jugando como invitado.":
    [
      "Email recovery is being set up. You can keep playing as a guest.",
      "A recuperação por email está sendo preparada. Você pode continuar jogando como convidado.",
    ],
  "El correo está en preparación. La clave de recuperación ya está disponible.":
    [
      "Email is being set up. The recovery key is already available.",
      "O email está sendo preparado. A chave de recuperação já está disponível.",
    ],
});

Object.assign(textos, {
  Pasar: ["Check", "Passar"],
  Igualar: ["Call", "Pagar"],
  Retirarse: ["Fold", "Desistir"],
  "Apostar / subir": ["Bet / raise", "Apostar / aumentar"],
  "Cada jugador registra su propia acción desde el celular. El dealer solo cierra la mano y entrega el pozo.":
    [
      "Each player records their own action from their phone. The dealer only closes the hand and awards the pot.",
      "Cada jogador registra a própria ação pelo celular. O dealer apenas encerra a mão e entrega o pote.",
    ],
});

Object.assign(textos, {
  "Blindly Plus": ["Blindly Plus", "Blindly Plus"],
  "Más personalización, estadísticas y herramientas para el host.": [
    "More customization, statistics and host tools.",
    "Mais personalização, estatísticas e ferramentas para o host.",
  ],
  "Una experiencia más completa para quienes organizan y juegan seguido.": [
    "A richer experience for people who host and play often.",
    "Uma experiência mais completa para quem organiza e joga com frequência.",
  ],
  PLUS: ["PLUS", "PLUS"],
  "Tu mesa, a tu manera.": ["Your table, your way.", "Sua mesa, do seu jeito."],
  "Blindly Plus ampliará la personalización y el análisis sin quitar funciones esenciales de la versión gratuita.":
    [
      "Blindly Plus will expand customization and insights without removing essential features from the free version.",
      "Blindly Plus ampliará a personalização e as análises sem remover recursos essenciais da versão gratuita.",
    ],
  "Blindly Plus amplía la personalización y el análisis sin quitar funciones esenciales de la versión gratuita.":
    [
      "Blindly Plus expands customization and insights without removing essential features from the free version.",
      "Blindly Plus amplia a personalização e as análises sem remover recursos essenciais da versão gratuita.",
    ],
  "PLUS ACTIVO": ["PLUS ACTIVE", "PLUS ATIVO"],
  "Tu mesa ya es Plus.": ["Your table is now Plus.", "Sua mesa agora é Plus."],
  "Las funciones Plus están habilitadas para esta cuenta.": [
    "Plus features are enabled for this account.",
    "Os recursos Plus estão habilitados para esta conta.",
  ],
  "Acceso vigente hasta {fecha}": [
    "Access valid until {fecha}",
    "Acesso válido até {fecha}",
  ],
  "Estadísticas avanzadas": ["Advanced statistics", "Estatísticas avançadas"],
  "Analizá resultados, evolución y rendimiento de tus partidas.": [
    "Analyze results, progress and performance across your games.",
    "Analise resultados, evolução e desempenho das suas partidas.",
  ],
  "Temas y ambientaciones premium": [
    "Premium themes and ambience",
    "Temas e ambientações premium",
  ],
  "Personalizá la mesa, los sonidos y la experiencia del torneo.": [
    "Customize the table, sounds and tournament experience.",
    "Personalize a mesa, os sons e a experiência do torneio.",
  ],
  "Presets ilimitados": ["Unlimited presets", "Predefinições ilimitadas"],
  "Guardá estructuras de ciegas y configuraciones para volver a usarlas.": [
    "Save blind structures and settings to use again.",
    "Salve estruturas de blinds e configurações para reutilizar.",
  ],
  "Herramientas avanzadas para el host": [
    "Advanced host tools",
    "Ferramentas avançadas para o host",
  ],
  "Administrá torneos frecuentes con más control y menos preparación.": [
    "Run recurring tournaments with more control and less setup.",
    "Gerencie torneios frequentes com mais controle e menos preparação.",
  ],
  "El poker entre amigos sigue siendo gratis": [
    "Poker with friends stays free",
    "O poker entre amigos continua grátis",
  ],
  "Crear y unirse a salas, gestionar turnos, usar fichas físicas o virtuales y repartir el pozo seguirán disponibles para todos.":
    [
      "Creating and joining rooms, managing turns, using physical or virtual chips and awarding the pot will remain available to everyone.",
      "Criar e entrar em salas, gerenciar turnos, usar fichas físicas ou virtuais e entregar o pote continuarão disponíveis para todos.",
    ],
  "Ver planes de Blindly Plus": [
    "View Blindly Plus plans",
    "Ver planos do Blindly Plus",
  ],
  "Administrar suscripción": ["Manage subscription", "Gerenciar assinatura"],
  "Restaurar compras": ["Restore purchases", "Restaurar compras"],
  "Estructura personalizada": [
    "Custom blind structure",
    "Estrutura personalizada",
  ],
  "Creá tus propios niveles de ciegas y descansos para la mesa.": [
    "Create your own blind levels and breaks for the table.",
    "Crie seus próprios níveis de blinds e intervalos para a mesa.",
  ],
  "Crear niveles y descansos personalizados es una función de Blindly Plus.": [
    "Creating custom levels and breaks is a Blindly Plus feature.",
    "Criar níveis e intervalos personalizados é um recurso do Blindly Plus.",
  ],
  "Métricas Plus": ["Plus metrics", "Métricas Plus"],
  "Puntos por partida": ["Points per game", "Pontos por partida"],
  "Victorias en las últimas 30": [
    "Wins in the last 30",
    "Vitórias nas últimas 30",
  ],
  "Podios en las últimas 30": [
    "Podiums in the last 30",
    "Pódios nas últimas 30",
  ],
  "Mejor puesto en las últimas 30": [
    "Best finish in the last 30",
    "Melhor posição nas últimas 30",
  ],
  "Activá Blindly Plus para ver promedios, victorias, podios y tu mejor resultado.":
    [
      "Activate Blindly Plus to see averages, wins, podiums and your best result.",
      "Ative o Blindly Plus para ver médias, vitórias, pódios e seu melhor resultado.",
    ],
  "Blindly Plus está en preparación": [
    "Blindly Plus is being prepared",
    "Blindly Plus está em preparação",
  ],
  "Todavía no hay compras ni suscripciones activas.": [
    "Purchases and subscriptions are not active yet.",
    "Compras e assinaturas ainda não estão ativas.",
  ],
});

Object.assign(textos, {
  "Eliminar mi cuenta": ["Delete my account", "Excluir minha conta"],
  "Cuenta protegida con clave": [
    "Account protected with a recovery key",
    "Conta protegida com chave de recuperação",
  ],
  "Protección sin correo": ["Protection without email", "Proteção sem email"],
  "Tu cuenta tiene una clave de recuperación": [
    "Your account has a recovery key",
    "Sua conta tem uma chave de recuperação",
  ],
  "Guardá una clave privada para recuperar este mismo usuario, sus puntos, historial y compras en otro celular.":
    [
      "Save a private key to recover this same user, points, history and purchases on another phone.",
      "Guarde uma chave privada para recuperar este mesmo usuário, pontos, histórico e compras em outro celular.",
    ],
  "Guardala ahora en un lugar seguro. Blindly no puede mostrarla de nuevo; crear otra reemplaza la anterior.":
    [
      "Save it somewhere safe now. Blindly cannot show it again; creating another key replaces the previous one.",
      "Guarde-a agora em um local seguro. O Blindly não pode exibi-la novamente; criar outra substitui a anterior.",
    ],
  "Crear una clave nueva": ["Create a new key", "Criar uma nova chave"],
  "Crear clave de recuperación": [
    "Create recovery key",
    "Criar chave de recuperação",
  ],
  "Ya tengo una clave": ["I already have a key", "Já tenho uma chave"],
  "Clave de recuperación": ["Recovery key", "Chave de recuperação"],
  "Agregar un email": ["Add an email", "Adicionar um email"],
  "Tu identidad ya se puede recuperar con la clave privada. También podrás agregar un email cuando el correo esté habilitado.":
    [
      "Your identity can now be recovered with the private key. You can also add an email when email service is enabled.",
      "Sua identidade já pode ser recuperada com a chave privada. Você também poderá adicionar um email quando o serviço estiver habilitado.",
    ],
  "La clave no es válida. Revisala o creá una nueva desde el dispositivo donde todavía tenés acceso.":
    [
      "The key is invalid. Check it or create a new one on a device where you still have access.",
      "A chave é inválida. Confira-a ou crie uma nova em um dispositivo no qual você ainda tenha acesso.",
    ],
  "No se pudo crear la clave de recuperación. Probá de nuevo.": [
    "The recovery key could not be created. Try again.",
    "Não foi possível criar a chave de recuperação. Tente novamente.",
  ],
  "Elimina tu identidad, tus puntos y tu historial. No se puede deshacer.": [
    "Deletes your identity, points and history. This cannot be undone.",
    "Exclui sua identidade, pontos e histórico. Esta ação não pode ser desfeita.",
  ],
  "Confirmá solo si querés borrar definitivamente todos tus datos de Blindly.":
    [
      "Confirm only if you want to permanently delete all your Blindly data.",
      "Confirme apenas se quiser excluir definitivamente todos os seus dados do Blindly.",
    ],
  "Eliminar definitivamente": ["Delete permanently", "Excluir definitivamente"],
  "Terminá o abandoná la partida activa antes de eliminar tu cuenta.": [
    "Finish or leave the active game before deleting your account.",
    "Termine ou saia da partida ativa antes de excluir sua conta.",
  ],
  "No se pudo eliminar la cuenta. Probá de nuevo.": [
    "The account could not be deleted. Please try again.",
    "Não foi possível excluir a conta. Tente novamente.",
  ],
  "Eliminar tu cuenta no cancela tu suscripción de Apple o Google. Administrala antes de borrar la cuenta.":
    [
      "Deleting your account does not cancel your Apple or Google subscription. Manage it before deleting the account.",
      "Excluir sua conta não cancela a assinatura da Apple ou do Google. Gerencie-a antes de excluir a conta.",
    ],
  "Blindly Plus todavía no está disponible en este dispositivo.": [
    "Blindly Plus is not available on this device yet.",
    "O Blindly Plus ainda não está disponível neste dispositivo.",
  ],
  "No se pudo abrir la administración de la suscripción.": [
    "Subscription management could not be opened.",
    "Não foi possível abrir o gerenciamento da assinatura.",
  ],
});
Object.assign(errores, {
  PARTIDA_ACTIVA_CUENTA:
    "Terminá o abandoná la partida activa antes de eliminar tu cuenta.",
  CUENTA_NO_ELIMINADA: "No se pudo eliminar la cuenta. Probá de nuevo.",
  PLUS_NO_CONFIGURADO:
    "Blindly Plus todavía no está disponible en este dispositivo.",
  PLUS_SIN_GESTION: "No se pudo abrir la administración de la suscripción.",
  CLAVE_INVALIDA:
    "La clave no es válida. Revisala o creá una nueva desde el dispositivo donde todavía tenés acceso.",
  CLAVE_NO_CREADA: "No se pudo crear la clave de recuperación. Probá de nuevo.",
});

Object.assign(textos, {
  "Política de privacidad": ["Privacy policy", "Política de privacidade"],
  "Última actualización: 1 de octubre de 2026": [
    "Last updated: October 1, 2026",
    "Última atualização: 1 de outubro de 2026",
  ],
  "Datos que guarda Blindly": [
    "Data Blindly stores",
    "Dados que o Blindly armazena",
  ],
  "Guardamos un identificador de cuenta, tu nombre de jugador, salas, acciones de mesa, stacks, puntuación e historial. El email es opcional y solo se guarda si protegés tu cuenta.":
    [
      "We store an account identifier, player name, rooms, table actions, stacks, score and history. Email is optional and is stored only when you protect your account.",
      "Armazenamos um identificador de conta, nome de jogador, salas, ações da mesa, stacks, pontuação e histórico. O email é opcional e só é salvo quando você protege a conta.",
    ],
  "Para qué se usan": ["How data is used", "Como os dados são usados"],
  "Los datos permiten autenticarte, sincronizar la partida entre celulares, calcular rangos, recuperar tu historial y proteger la integridad de fichas y puntos.":
    [
      "Data is used to authenticate you, sync games across phones, calculate ranks, restore history and protect chip and score integrity.",
      "Os dados permitem autenticar você, sincronizar partidas entre celulares, calcular posições, recuperar o histórico e proteger fichas e pontos.",
    ],
  "Cámara y dispositivo": ["Camera and device", "Câmera e dispositivo"],
  "La cámara solo lee códigos QR de salas. Blindly no guarda ni envía fotos. El tema, el idioma y el volumen se guardan localmente en tu dispositivo.":
    [
      "The camera only reads room QR codes. Blindly does not store or send photos. Theme, language and volume are stored locally on your device.",
      "A câmera apenas lê códigos QR das salas. O Blindly não salva nem envia fotos. Tema, idioma e volume ficam armazenados localmente no dispositivo.",
    ],
  Servicios: ["Services", "Serviços"],
  "Supabase aloja la autenticación y la base de datos. RevenueCat gestiona el estado de Blindly Plus cuando está activado. Apple, Google y Expo pueden procesar datos técnicos al distribuir o ejecutar la app. Blindly no vende datos ni usa publicidad.":
    [
      "Supabase hosts authentication and the database. RevenueCat manages Blindly Plus status when enabled. Apple, Google and Expo may process technical data when distributing or running the app. Blindly does not sell data or use advertising.",
      "O Supabase hospeda a autenticação e o banco de dados. A RevenueCat gerencia o estado do Blindly Plus quando ativado. Apple, Google e Expo podem processar dados técnicos ao distribuir ou executar o app. O Blindly não vende dados nem usa publicidade.",
    ],
  "Conservación y eliminación": [
    "Retention and deletion",
    "Retenção e exclusão",
  ],
  "Los datos se conservan mientras exista tu cuenta. Desde Mi cuenta podés eliminar la identidad, los puntos y el historial. Una partida activa debe finalizar antes para no romper la mesa de otros jugadores.":
    [
      "Data is retained while your account exists. In My account you can delete your identity, points and history. An active game must finish first to avoid disrupting other players.",
      "Os dados são mantidos enquanto a conta existir. Em Minha conta, você pode excluir identidade, pontos e histórico. Uma partida ativa deve terminar antes para não interromper os outros jogadores.",
    ],
  "Tus opciones": ["Your choices", "Suas opções"],
  "Podés jugar sin email, vincular uno para recuperar la cuenta o eliminar todos tus datos. La cámara es opcional porque también podés ingresar el código de sala.":
    [
      "You can play without email, link one to recover the account, or delete all your data. Camera access is optional because you can enter the room code instead.",
      "Você pode jogar sem email, vincular um para recuperar a conta ou excluir todos os dados. A câmera é opcional porque também é possível digitar o código da sala.",
    ],
  "Para consultas de privacidad, usá el canal de soporte publicado en el repositorio oficial de Blindly.":
    [
      "For privacy questions, use the support channel published in the official Blindly repository.",
      "Para dúvidas de privacidade, use o canal de suporte publicado no repositório oficial do Blindly.",
    ],
  "Blindly organiza partidas presenciales entre amigos. No procesa apuestas con dinero real ni premios. Los jugadores acuerdan las reglas y el dealer valida los resultados.":
    [
      "Blindly organizes in-person games with friends. It does not process real-money wagers or prizes. Players agree on the rules and the dealer validates results.",
      "O Blindly organiza partidas presenciais entre amigos. Não processa apostas com dinheiro real nem prêmios. Os jogadores combinam as regras e o dealer valida os resultados.",
    ],
  "Blindly Plus podrá ofrecer funciones digitales opcionales mediante las tiendas oficiales. La partida esencial seguirá disponible sin una suscripción.":
    [
      "Blindly Plus may offer optional digital features through official stores. Essential gameplay will remain available without a subscription.",
      "O Blindly Plus poderá oferecer recursos digitais opcionais pelas lojas oficiais. A partida essencial continuará disponível sem assinatura.",
    ],
  "Jugadores habituales esperados": [
    "Expected regular players",
    "Jogadores habituais esperados",
  ],
  "Es una referencia: cada jugador debe entrar con el código o QR.": [
    "This is a reference: every player must join with the code or QR.",
    "Esta é uma referência: cada jogador deve entrar com o código ou QR.",
  ],
  "MESA HABITUAL": ["REGULAR TABLE", "MESA HABITUAL"],
  "Mesa habitual": ["Regular table", "Mesa habitual"],
  "La sala se creará con la configuración guardada. Podrás ajustarla antes de iniciar.":
    [
      "The room will use the saved settings. You can adjust them before starting.",
      "A sala usará as configurações salvas. Você poderá ajustá-las antes de iniciar.",
    ],
  "Entre amigos": ["Among friends", "Entre amigos"],
  "Compará resultados con quienes compartiste mesa.": [
    "Compare results with people who shared your table.",
    "Compare resultados com quem compartilhou sua mesa.",
  ],
  "BLINDLY PLUS": ["BLINDLY PLUS", "BLINDLY PLUS"],
  "Descubrí quién terminó más veces arriba, sus victorias y sus podios compartidos.":
    [
      "See who finished ahead more often, with shared wins and podiums.",
      "Veja quem terminou mais vezes na frente, com vitórias e pódios compartilhados.",
    ],
  "Solo aparecen jugadores con los que compartiste partidas finalizadas.": [
    "Only players from completed games you shared are shown.",
    "Apenas jogadores de partidas concluídas que vocês compartilharam aparecem.",
  ],
  "Jugá y finalizá una partida con amigos para comparar resultados.": [
    "Play and finish a game with friends to compare results.",
    "Jogue e finalize uma partida com amigos para comparar resultados.",
  ],
  VOS: ["YOU", "VOCÊ"],
  "{n} partidas juntos": ["{n} games together", "{n} partidas juntos"],
  "Terminó arriba": ["Finished ahead", "Terminou na frente"],
  Victorias: ["Wins", "Vitórias"],
  "{n} empates": ["{n} ties", "{n} empates"],
  "La comparación usa solo resultados de partidas que ambos compartieron. No muestra el historial privado de otra persona.":
    [
      "The comparison only uses results from games you both shared. It does not show another person's private history.",
      "A comparação usa apenas resultados de partidas que ambos compartilharam. Ela não mostra o histórico privado de outra pessoa.",
    ],
  "Mis mesas": ["My tables", "Minhas mesas"],
  "Plantillas listas para tu grupo habitual.": [
    "Templates ready for your regular group.",
    "Modelos prontos para seu grupo habitual.",
  ],
  "Editar mesa habitual": ["Edit regular table", "Editar mesa habitual"],
  "Nueva mesa habitual": ["New regular table", "Nova mesa habitual"],
  "Una plantilla privada para el host.": [
    "A private template for the host.",
    "Um modelo privado para o host.",
  ],
  "Nombre de la mesa": ["Table name", "Nome da mesa"],
  "Jugadores habituales": ["Regular players", "Jogadores habituais"],
  "Son una lista de referencia. Cada persona igualmente entra con el código o QR.":
    [
      "This is a reference list. Each person still joins with the code or QR.",
      "Esta é uma lista de referência. Cada pessoa ainda entra com o código ou QR.",
    ],
  "Nombre del jugador": ["Player name", "Nome do jogador"],
  "Agregar jugador": ["Add player", "Adicionar jogador"],
  Fichas: ["Chips", "Fichas"],
  Virtuales: ["Virtual", "Virtuais"],
  Físicas: ["Physical", "Físicas"],
  "Se usará el reparto físico estándar; podés ajustarlo en la sala antes de iniciar.":
    [
      "The standard physical chip setup will be used; you can adjust it in the room before starting.",
      "A distribuição física padrão será usada; você poderá ajustá-la na sala antes de iniciar.",
    ],
  "Estructura y duración": ["Structure and duration", "Estrutura e duração"],
  "Minutos por nivel": ["Minutes per level", "Minutos por nível"],
  "Los descansos conservan la duración del preset elegido.": [
    "Breaks keep the duration from the selected preset.",
    "Os intervalos mantêm a duração do preset escolhido.",
  ],
  "Liga opcional": ["Optional league", "Liga opcional"],
  "Sin liga": ["No league", "Sem liga"],
  "Guardar mesa": ["Save table", "Salvar mesa"],
  "Eliminar mesa": ["Delete table", "Excluir mesa"],
  "La plantilla se eliminará. Las partidas anteriores no cambian.": [
    "The template will be deleted. Previous games will not change.",
    "O modelo será excluído. As partidas anteriores não serão alteradas.",
  ],
  Eliminar: ["Delete", "Excluir"],
  "Solo vos podés ver y administrar esta plantilla.": [
    "Only you can see and manage this template.",
    "Somente você pode ver e gerenciar este modelo.",
  ],
  "Tu partida de siempre, lista en pocos toques.": [
    "Your usual game, ready in a few taps.",
    "Sua partida de sempre, pronta em poucos toques.",
  ],
  "Guardá la mesa de tu grupo": [
    "Save your group's table",
    "Salve a mesa do seu grupo",
  ],
  "Reutilizá jugadores habituales, fichas, ciegas, duración, tema y liga sin configurar todo otra vez.":
    [
      "Reuse regular players, chips, blinds, duration, theme and league without setting everything up again.",
      "Reutilize jogadores habituais, fichas, blinds, duração, tema e liga sem configurar tudo novamente.",
    ],
  "Todavía no guardaste una mesa habitual.": [
    "You have not saved a regular table yet.",
    "Você ainda não salvou uma mesa habitual.",
  ],
  "{n} jugadores habituales": [
    "{n} regular players",
    "{n} jogadores habituais",
  ],
  "SOLO LECTURA": ["READ ONLY", "SOMENTE LEITURA"],
  "de stack": ["starting stack", "de stack"],
  "min por nivel": ["min per level", "min por nível"],
  "Crear partida": ["Create game", "Criar partida"],
  "Editar mesa": ["Edit table", "Editar mesa"],
  "Recuperar Blindly Plus": ["Restore Blindly Plus", "Recuperar Blindly Plus"],
  "Guardá una plantilla para tu próxima partida.": [
    "Save a template for your next game.",
    "Salve um modelo para sua próxima partida.",
  ],
  "Rendimiento por mes": ["Performance by month", "Desempenho por mês"],
  "{n} partidas · {p} pts": ["{n} games · {p} pts", "{n} partidas · {p} pts"],
  "Comparar con amigos": ["Compare with friends", "Comparar com amigos"],
  "Blindly Plus muestra tu historial completo.": [
    "Blindly Plus shows your complete history.",
    "O Blindly Plus mostra seu histórico completo.",
  ],
  "Blindly Free muestra tus últimas 10 partidas. Tu historial anterior sigue guardado.":
    [
      "Blindly Free shows your last 10 games. Your earlier history remains saved.",
      "O Blindly Free mostra suas últimas 10 partidas. Seu histórico anterior continua salvo.",
    ],
  "Resultado final": ["Final result", "Resultado final"],
  "Compartir resultado": ["Share result", "Compartilhar resultado"],
  "Resumen de la partida": ["Game recap", "Resumo da partida"],
  "Una noche para recordar.": [
    "A night to remember.",
    "Uma noite para lembrar.",
  ],
  GANADOR: ["WINNER", "VENCEDOR"],
  "Tu resultado: puesto {p} · +{n} puntos": [
    "Your result: place {p} · +{n} points",
    "Seu resultado: posição {p} · +{n} pontos",
  ],
  "Preparando imagen…": ["Preparing image…", "Preparando imagem…"],
  "La tarjeta para compartir es una función de Blindly Plus.": [
    "The share card is a Blindly Plus feature.",
    "O cartão para compartilhar é um recurso do Blindly Plus.",
  ],
  "Ver resumen de la partida": ["View game recap", "Ver resumo da partida"],
  "NOCHE DE POKER": ["POKER NIGHT", "NOITE DE POKER"],
  "JUGADO CON BLINDLY": ["PLAYED WITH BLINDLY", "JOGADO COM BLINDLY"],
  "Partidas jugadas": ["Games played", "Partidas jogadas"],
  "Posición promedio": ["Average position", "Posição média"],
  "Mejor posición": ["Best position", "Melhor posição"],
  "Peor posición": ["Worst position", "Pior posição"],
  "Mejor racha de victorias": [
    "Best win streak",
    "Melhor sequência de vitórias",
  ],
  "Historial completo": ["Complete history", "Histórico completo"],
  "Revisá todas tus partidas y compará resultados entre amigos.": [
    "Review every game and compare results among friends.",
    "Revise todas as partidas e compare resultados entre amigos.",
  ],
  "Mesas habituales": ["Regular tables", "Mesas habituais"],
  "Guardá la configuración de tu grupo y creá la próxima partida en segundos.":
    [
      "Save your group's setup and create the next game in seconds.",
      "Salve a configuração do seu grupo e crie a próxima partida em segundos.",
    ],
  "Recaps para compartir": ["Shareable recaps", "Resumos para compartilhar"],
  "Convertí el resultado final en una tarjeta lista para tus redes.": [
    "Turn the final result into a card ready for social sharing.",
    "Transforme o resultado final em um cartão pronto para suas redes.",
  ],
});
