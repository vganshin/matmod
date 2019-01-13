const WebSocketClient = require('websocket').client;
const fs = require('fs');
const constants = require('./constants');



function send(data) {
    if (connection === undefined) {
        log('Connection is undefined');
    }
    const data2 = JSON.stringify(data);
    log('Sending: ' + data2);
    connection.sendUTF(data2);
}

function login() {
  send({
    state: 'login',
    login: constants.login,
    debug: constants.debug,
    password: constants.password
  });
}
