const WebSocketClient = require('websocket').client;
const constants = require('./constants');
const LoggerUtil = require('./logger').Logger;
const fs = require('fs');
const helpers = require('./helpers');

class Client {
    // constructor(login, password, debug, url, strategyFn, logger) {
    constructor(gameName, strategyFn, debug = true) {
        const gameInfo = constants.games[gameName];

        if (gameInfo === undefined) {
            throw new Error(`Unknown game '${gameName}'.`);
        }

        this.games = {};
        this.login = constants.login;
        this.password = constants.password;
        this.debug = debug;
        this.gameName = gameName;
        this.url = gameInfo.url;
        this.strategyFn = strategyFn;

        this.logger = new LoggerUtil(`logs/${gameName}/${new Date().getTime()}.txt`);;

        this.client = new WebSocketClient();

        this.client.on('connectFailed', error => {
            this.logger.log('Connect Error: ' + error.toString());
        });

        this.client.on('connect', conn => {
            this.onConnect(conn);
        });
    }

    connect() {
        this.client.connect(this.url);
    }

    onConnect(conn) {
        this.connection = conn;
        this.logger.log('WebSocket Client Connected');

        this.connection.on('error', error => {
            this.logger.log('Connection Error: ' + error.toString());
        });

        this.connection.on('close', () => {
            this.logger.log('Connection Closed');
        });

        this.connection.on('message', message => {
            if (message.type === 'utf8') {
                this.logger.log("Received: '" + message.utf8Data + "'");
            } else {
                throw new Error(`Unsupported message type ${message.type}`)
            }
            const data = JSON.parse(message.utf8Data);

            if (data.state === 'info') {
                this.loginToServer();
                return;
            }

            if (data.state === 'access') {
                console.log(`Loged as ${data.user}.`);
                return;
            }



            if (data.state === 'start') {

                this.screen();


                this.games[data.game] = data;
                data.moves = [];

                const strategy = this.strategyFn(this.games[data.game]);
                this.send({
                    game: data.game,
                    state:'move',
                    strategy: strategy
                });
            }

            if (data.state === 'turnover') {
                this.games[data.game].moves.push(data.moves);
                const strategy = this.strategyFn(this.games[data.game]);
                this.send({
                    game: data.game,
                    state:'move',
                    strategy: strategy
                });
            }

            if (data.state === 'gameover') {
                this.games[data.game].scores = data.scores;
                this.saveGame(data.game);
                delete this.games[data.game];
            }
        });
    }

    loginToServer() {
        this.send({state: 'login', login: this.login, debug: this.debug, password: this.password});
    }

    send(data) {
        if (this.connection === undefined) {
            this.logger.log('Failed to send a message. Connection is undefined');
            return;
        }
        const strData = JSON.stringify(data);
        this.logger.log('Sending: ' + strData);
        this.connection.sendUTF(strData);
    }

    saveGame(gameId) {
        const game = this.games[gameId];

        if (game === undefined) {
            throw new Error(`Game with id = ${gameId} not found.`);
        }

        fs.writeFileSync(`games/${this.gameName}/${gameId}.json`, JSON.stringify(game, 2, 2));
    }

    screen() {
        if (this.interval !== undefined) {
            return;
        }

        const screen = () => {
            console.clear();
            console.log(`${this.login} plays ${this.gameName}. ${new Date()}\n`);

            console.log(`ID\tMOVES\tTERM%\t\t\tMY_SCORE\t\tOP_SCORE\t\tA\t\t\tB\t\t\tB/A`);
            const game_ids = Object.keys(this.games).sort();
            game_ids.forEach(game_id => {
                const game = this.games[game_id];

                const myHand = helpers.myHand(game);
                const myScore = game.moves
                  .map(moves => game.parameters.payoff[moves[0]][moves[1]])
                  .map(scores => scores[myHand])
                  .reduce((acc, score) => acc + score, 0) / game.moves.length;

                const opHand = helpers.opHand(game);
                const opScore = game.moves
                  .map(moves => game.parameters.payoff[moves[0]][moves[1]])
                  .map(scores => scores[opHand])
                  .reduce((acc, score) => acc + score, 0) / game.moves.length;

                const a = Math.abs(game.parameters.payoff[1][0][1]);
                const b = Math.abs(game.parameters.payoff[1][1][1]);
                console.log(`${game_id}\t${game.moves.length}\t${game.parameters.termination_probability}\t${myScore}\t${opScore}\t${a}\t${b}\t${b / a}`);
            });
        };
        this.interval = setInterval(screen, 1000);
    }
}

/**
 *
 * @type {{Client: Client}}
 */
module.exports = {
    Client
};
