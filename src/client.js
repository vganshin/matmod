const WebSocketClient = require('websocket').client;

class Client {
    constructor(login, password, debug, url, msgHandler, logger) {
        this.login = login;
        this.password = password;
        this.debug = debug;
        this.url = url;
        this.funcMsgHandler = msgHandler;

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

        this.connection.on('message', this.funcMsgHandler);
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
}

/**
 *
 * @type {{Client: Client}}
 */
module.exports = {
    Client
};
