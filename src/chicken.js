const ClientClass = require('./client').Client;

const LoggerUtil = require('./logger').Logger;
const logger = new LoggerUtil(`logs/chicken/1.txt`);

const login = '[MNR]';
const password = 'lMHc1Sxpe4TaVBYGT9EyLg62j9gaRLis5KT13JqLMh6gByjlqf2fIdtHXfxJ7had';
const debug = true;

const games = {};

let winGamesCount = 0;
let loseGamesCount = 0;

let points = 0;
let opponentPoints = 0;

function nash_balance_stategry(game) {
    return game.parameters.payoff[1][0][1] / game.parameters.payoff[1][1][1];
}

const msgHandler = msg => {
    if (msg.type === 'utf8') {
        logger.log("Received: '" + msg.utf8Data + "'");
    }

    const message = JSON.parse(msg.utf8Data);

    if (message.state === 'info') {
        client.loginToServer();
    }

    if (message.state === 'start') {
        // logger.log(`Game ${message.game} started. Hand: ${message.hand}. Payoff: ${JSON.stringify(message.parameters.payoff)}`, true);
        games[message.game] = message;
        games[message.game].movesHistory = [];
        games[message.game].aggressiveMovesCount = 0;
        client.send({game: message.game, state: "move", strategy: 0});
    }

    if (message.state === 'turnover') {
        // addMove(message);
        // const game = games[message.game];
        // const opponentsPreviousMove = message.moves[(game.hand + 1) % 2];
        // const mirrorAroundMove = opponentsPreviousMove === 1 ? 0 : 1;
        //
        // client.send({game: message.game, state: "move", strategy: game.isMirrorAroundGamer ? 1 : mirrorAroundMove});
        // ------
        addMove(message);
        const game2 = games[message.game];

        if (game2.isMirrorAroundGamer) {
            return client.send({game: message.game, state: "move", strategy: 1});
        }
// --------
        const game = games[message.game];
        const balance = nash_balance_stategry(game);

        if (message.moves[(game.hand + 1) % 2] === 1) {
            game.moves = 1;
        }

        

        if (game.moves * (balance - balance**2) < 0.4) {
            game.moves++;
            return client.send({game:message.game, state:'move', strategy: 1});
        }

        return client.send({game:message.game, state:'move', strategy: 0});
    }

    if (message.state === 'gameover') {
        const game = games[message.game];

        const iWon = message.scores[game.hand] > message.scores[(game.hand + 1) % 2];
        const difference = Math.abs(message.scores[game.hand] - message.scores[(game.hand + 1) % 2]);

        logger.log(`Game ${message.game} is over.
Hand: ${games[message.game].hand}.
Winner: ${iWon}.
Difference: ${difference}.
Scores: ${JSON.stringify(message.scores)}
`, true);

        if (iWon) {
            winGamesCount++;
        } else {
            loseGamesCount++;
        }

        points += message.scores[game.hand];

        console.log(`WinCount: ${winGamesCount}. LoseCount: ${loseGamesCount}. Avg Score: ${points/(winGamesCount + loseGamesCount)}\n`)
    }

    function addMove(message) {
        games[message.game].movesHistory.push(message.moves);
        
        if (moves[i][(hand + 1) % 2] === 1) {

        }
        
        const moves = games[message.game].movesHistory;
        const hand = games[message.game].hand;

        if (moves.length < 7) {
            return;
        }

        let isMirrorAroundGamer = true;

        for (let i = moves.length - 6; i < moves.length - 1; i++) {
            if (moves[i][hand] === moves[i + 1][(hand + 1) % 2]) {
                isMirrorAroundGamer = false;
                break;
            }
        }

        games[message.game].isMirrorAroundGamer = isMirrorAroundGamer;
    }
};

const client = new ClientClass(login, password, debug, 'ws://dmc.alepoydes.com:3013', msgHandler, logger);
client.connect();
