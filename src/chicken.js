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

function save_game(game_id) {
    const game = games[game_id];

    if (game === undefined) {
        throw new Error(`Game with id = ${game_id} not found.`);
    }

    fs.writeFileSync(`games/chicken/${game_id}.json`, JSON.stringify(game, 2, 2));
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

function run_game(game_id) {
    const game = games[game_id];

    if (game === undefined) {
        throw new Error(`Game with id = ${game_id} not found.`);
    }

    game.state = 'in_progress';
    const balance = nash_balance_stategry(game);
    const strategy = hit_probability(balance) ? 1 : 0;

    send({game:game_id, state:'move', strategy});
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
        } else {
            throw new Error('Unexpected message type ' + msg.type);
        }

        const message = JSON.parse(msg.utf8Data);

        if (message.state === 'info') {
            do_login();
        }

        if (message.state === 'start') {
            message.moves = [];
            games[message.game] = message;
            run_game(message.game);
        }

        if (message.state === 'turnover') {
            const game = games[message.game];
            game.moves.push(message.moves);
            const balance = nash_balance_stategry(game);
            const strategy = hit_probability(balance) ? 1 : 0;

            send({game:message.game, state:'move', strategy: 1});
        }

        if (message.state === 'gameover') {
            const game = games[message.game];
            game.state = 'gameover';
            game.scores = message.scores;
            save_game(message.game);
            delete games[message.game];
            console.log(message.game + ' is over');
        }

    });
});

client.connect('ws://dmc.alepoydes.com:3013');
