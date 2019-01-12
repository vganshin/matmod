var WebSocketClient = require('websocket').client;
var fs = require('fs');

var logFile = `logs/chicken/${new Date()}.txt`;

function log(msg) {
    // console.log(msg);
    fs.appendFileSync(logFile, `${msg}\n`);
}

function hit_probability(probability) {
    return Math.random() < probability;
}

var login = '[MNR]';
var password = 'lMHc1Sxpe4TaVBYGT9EyLg62j9gaRLis5KT13JqLMh6gByjlqf2fIdtHXfxJ7had';
var debug = true;

var connection;

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

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    log('Connect Error: ' + error.toString());
});

const games = {};

function nash_balance_stategry(game) {
    return game.parameters.payoff[1][0][1] / game.parameters.payoff[1][1][1];
}

client.on('connect', function(conn) {
    connection = conn;

    log('WebSocket Client Connected');
    conn.on('error', function(error) {
        log('Connection Error: ' + error.toString());
    });
    conn.on('close', function() {
        log('Connection Closed');
    });
    conn.on('message', function(msg) {
        if (msg.type === 'utf8') {
            log("Received: '" + msg.utf8Data + "'");
        }

        const message = JSON.parse(msg.utf8Data);

        if (message.state === 'info') {
            do_login();
        }

        if (message.state === 'start') {
            games[message.game] = message;
            const balance = nash_balance_stategry(games[message.game]);
            const strategy = hit_probability(balance) ? 1 : 0;

            send({game:message.game, state:'move', strategy});
        }

        if (message.state === 'turnover') {
            const game = games[message.game];
            const balance = nash_balance_stategry(game);
            const strategy = hit_probability(balance) ? 1 : 0;

            send({game:message.game, state:'move', strategy});
        }

        if (message.state === 'gameover') {
            console.log(message.game + ' is over');
        }

    });
});

client.connect('ws://dmc.alepoydes.com:3013');
