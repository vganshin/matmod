const WebSocketClient = require('websocket').client;

class Client {
    constructor(login, password, debug, url, strategyFn, logger) {
        this.games = {};
        this.login = login;
        this.password = password;
        this.debug = debug;
        this.url = url;
        this.runStrategy = strategyFn;

        this.logger = logger;

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
                logger.log("Received: '" + message.utf8Data + "'");
            } else {
                throw new Error(`Unsupported message type ${message.type}`)
            }
            const data = JSON.parse(message.utf8Data);

            if (data.state === 'info') {
                this.loginToServer();
                return;
            }

            if (data.state === 'start') {
                this.games[data.game] = data;
                data.moves = [];

                const strategy = this.runStrategy(this.games[data.game]);
                this.send({
                    game: data.game,
                    state:'move',
                    strategy: strategy
                });
            }

            if (data.state === 'turnover') {
                this.games[data.game].moves.push(data.moves);
                const strategy = this.runStrategy(this.games[data.game]);
                this.send({
                    game: data.game,
                    state:'move',
                    strategy: strategy
                });
            }

            if (data.state === 'gameover') {
                this.saveGame(games[data.game]);
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
}

/**
 *
 * @type {{Client: Client}}
 */
module.exports = {
    Client
};