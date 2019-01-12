const WebSocketClient = require('websocket').client;
const fs = require('fs');

const logFile = `logs/prisoner/1.txt`;

function log(msg) {
    // console.log(msg);
    fs.appendFileSync(logFile, `${msg}\n`);
}

const login = '[MNR]';
const password = 'lMHc1Sxpe4TaVBYGT9EyLg62j9gaRLis5KT13JqLMh6gByjlqf2fIdtHXfxJ7had';
const debug = true;

let connection;

const client = new WebSocketClient();

const games = {};

function do_login() {
    send({state: 'login', login, debug, password});
}

function send(data) {
    if (connection === undefined) {
        log('Connection is undefined');
    }
    const data2 = JSON.stringify(data);
    log('Sending: ' + data2);
    connection.sendUTF(data2);
}

client.on('connectFailed', error => {
    log('Connect Error: ' + error.toString());
});

client.on('connect', conn => {
    connection = conn;

    log('WebSocket Client Connected');

    conn.on('error', error => {
        log('Connection Error: ' + error.toString());
    });

    conn.on('close', () => {
        log('Connection Closed');
    });

    conn.on('message', msg => {
        if (msg.type === 'utf8') {
            log("Received: '" + msg.utf8Data + "'");
        }

        const message = JSON.parse(msg.utf8Data);

        if (message.state === 'info') {
            do_login();
        }

        if (message.state === 'start') {
            games[message.game] = message;
            games[message.game].moves = [];
            send({game: message.game, state: "move", strategy: 1});
        }

        if (message.state === 'turnover') {
            addMove(message);
            const game = games[message.game];
            const opponents_move = message.moves[(game.hand + 1) % 2];

            const isMirrorGamer = game.isMirrorGamer;

            send({game: message.game, state: "move", strategy: isMirrorGamer ? 1 : opponents_move});
        }

        if (message.state === 'gameover') {
            console.log(message.game + ' is over');
        }

    });
});

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

client.connect('ws://dmc.alepoydes.com:3012');
