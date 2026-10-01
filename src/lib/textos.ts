export type Idioma = "es" | "en" | "pt";
// El español es la clave legible; las variables se interpolan después de traducir.
export const textos: Record<string, [string, string]> = {
  "Poker presencial, sin vueltas": [
    "Poker with friends, made simple",
    "Poker presencial, sem complicações",
  ],
  "Crear sala": ["Create room", "Criar sala"],
  Unirme: ["Join", "Entrar"],
  Opciones: ["Settings", "Opções"],
  Volver: ["Back", "Voltar"],
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
  NOMBRE_INVALIDO: "Completá tu nombre y el código.",
  SESION_REQUERIDA: "No se pudo completar. Probá de nuevo.",
  SALA_NO_EXISTE: "No existe una sala con ese código.",
  SALA_LLENA: "La sala ya tiene 10 jugadores.",
  PARTIDA_INICIADA: "La partida ya comenzó.",
  NO_PERTENECES: "No pertenecés a esta sala.",
  SOLO_HOST: "Solo el host puede hacer esto.",
  SOLO_DEALER: "Solo el dealer puede repartir fichas.",
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
  "Primero protegé este invitado y terminá sus partidas antes de recuperar otra cuenta.":
    [
      "Protect this guest and finish its games before recovering another account.",
      "Proteja este convidado e termine suas partidas antes de recuperar outra conta.",
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
    "Primero protegé este invitado y terminá sus partidas antes de recuperar otra cuenta.",
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
});

Object.assign(textos, {
  Pasar: ["Check", "Passar"],
  Igualar: ["Call", "Pagar"],
  Retirarse: ["Fold", "Desistir"],
  "Apostar / subir": ["Bet / raise", "Apostar / aumentar"],
  "Cada jugador registra su propia acción desde el celular. El dealer solo cierra la mano y entrega el pozo.": [
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
  "Blindly Plus ampliará la personalización y el análisis sin quitar funciones esenciales de la versión gratuita.": [
    "Blindly Plus will expand customization and insights without removing essential features from the free version.",
    "Blindly Plus ampliará a personalização e as análises sem remover recursos essenciais da versão gratuita.",
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
  "Crear y unirse a salas, gestionar turnos, usar fichas físicas o virtuales y repartir el pozo seguirán disponibles para todos.": [
    "Creating and joining rooms, managing turns, using physical or virtual chips and awarding the pot will remain available to everyone.",
    "Criar e entrar em salas, gerenciar turnos, usar fichas físicas ou virtuais e entregar o pote continuarão disponíveis para todos.",
  ],
  "Ver planes de Blindly Plus": [
    "View Blindly Plus plans",
    "Ver planos do Blindly Plus",
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
  "Elimina tu identidad, tus puntos y tu historial. No se puede deshacer.": [
    "Deletes your identity, points and history. This cannot be undone.",
    "Exclui sua identidade, pontos e histórico. Esta ação não pode ser desfeita.",
  ],
  "Confirmá solo si querés borrar definitivamente todos tus datos de Blindly.": [
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
});
Object.assign(errores, {
  PARTIDA_ACTIVA_CUENTA:
    "Terminá o abandoná la partida activa antes de eliminar tu cuenta.",
  CUENTA_NO_ELIMINADA: "No se pudo eliminar la cuenta. Probá de nuevo.",
});
