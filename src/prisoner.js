const ClientClass = require('./client').Client;

const LoggerUtil = require('./logger').Logger;
const logger = new LoggerUtil(`logs/prisoner/1.txt`);

const login = '[MNR]';
const password = 'lMHc1Sxpe4TaVBYGT9EyLg62j9gaRLis5KT13JqLMh6gByjlqf2fIdtHXfxJ7had';
const debug = true;

const games = {};

const msgHandler = msg => {
    if (msg.type === 'utf8') {
        logger.log("Received: '" + msg.utf8Data + "'");
    }

    const message = JSON.parse(msg.utf8Data);

    if (message.state === 'info') {
        client.loginToServer();
    }

    if (message.state === 'start') {
        logger.log(`Game ${message.game} started. Hand: ${message.hand}. Payoff: ${JSON.stringify(message.parameters.payoff)}`, true);
        games[message.game] = message;
        games[message.game].moves = [];
        client.send({game: message.game, state: "move", strategy: 1});
    }

    if (message.state === 'turnover') {
        addMove(message);
        const game = games[message.game];
        const opponentsMove = message.moves[(game.hand + 1) % 2];

        const isMirrorGamer = game.isMirrorGamer;

        client.send({game: message.game, state: "move", strategy: isMirrorGamer ? 1 : opponentsMove});
    }

    if (message.state === 'gameover') {
        logger.log(`Game ${message.game} is over. Hand: ${games[message.game].hand}. Scores: ${JSON.stringify(message.scores)}`, true);
    }

    function addMove(message) {
        games[message.game].moves.push(message.moves);
        const moves = games[message.game].moves;
        const hand = games[message.game].hand;

        if (moves.length < 7) {
            return;
        }

        let isMirrorGamer = true;

        for (let i = moves.length - 6; i < moves.length - 1; i++) {
            if (moves[i][hand] !== moves[i + 1][(hand + 1) % 2]) {
                isMirrorGamer = false;
                break;
            }
        }

        games[message.game].isMirrorGamer = isMirrorGamer;
    }
};

const client = new ClientClass(login, password, debug, 'ws://dmc.alepoydes.com:3012', msgHandler, logger);
client.connect();
