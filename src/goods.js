const ClientClass = require('./client').Client;

const LoggerUtil = require('./logger').Logger;
const logger = new LoggerUtil(`logs/goods/1.txt`);

const login = '[MNR]';
const password = 'lMHc1Sxpe4TaVBYGT9EyLg62j9gaRLis5KT13JqLMh6gByjlqf2fIdtHXfxJ7had';
const debug = true;

const games = {};

msgHandler = msg => {
    if (msg.type === 'utf8') {
        logger.log("Received: '" + msg.utf8Data + "'");
    }

    const message = JSON.parse(msg.utf8Data);

    if (message.state === 'info') {
        client.loginToServer();
    }

    if (message.state === 'start') {
        logger.log(`Game ${message.game} started. Hand: ${message.hand}. Income: ${JSON.stringify(message.parameters.income)}`, true);
        games[message.game] = message;
        games[message.game].moves = [];
        client.send({game: message.game, state: "move", strategy: 1});
    }

    if (message.state === 'turnover') {
        addMove(message);
        const game = games[message.game];

        client.send({game: message.game, state: "move", strategy: game.ones > 2 ? 0 : 1});
    }

    if (message.state === 'gameover') {
        logger.log(`Game ${message.game} is over. Hand: ${games[message.game].hand}. Scores: ${JSON.stringify(message.scores)}`, true);
    }

    function addMove(message) {
        games[message.game].moves.push(message.moves);
        const moves = games[message.game].moves;

        const lastMoves = message.moves;
        const ones = lastMoves.reduce((accumulator, currentValue) => accumulator + currentValue);
        games[message.game].ones = ones;
    }
};

const client = new ClientClass(login, password, debug, 'ws://dmc.alepoydes.com:3014', msgHandler, logger);
client.connect();
