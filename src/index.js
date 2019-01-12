var WebSocketClient = require('websocket').client;
var fs = require('fs');

var logFile = `logs/${new Date()}.txt`;

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, `${msg}\n`);
}

var login = '[MNR]';
var password = 'lMHc1Sxpe4TaVBYGT9EyLg62j9gaRLis5KT13JqLMh6gByjlqf2fIdtHXfxJ7had';
var debug = true;

var connection;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    log('WebSocket Client Connected');
    connection.on('error', function(error) {
        log('Connection Error: ' + error.toString());
    });
    connection.on('close', function() {
        log('Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            log("Received: '" + message.utf8Data + "'");
        }
    });

    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    // sendNumber();
});

client.connect('ws://dmc.alepoydes.com:3012');