const fs = require('fs');
const constants = require('./constants');

class Logger {
    constructor(fileName) {
        if (!fileName) {
            console.log("FileName is not defined. Use default name 'log.txt' and current directory");
            this.logFile = 'log.txt';
        } else {
            this.logFile = fileName;
        }
    }

    log(msg, toConsole) {
        if (toConsole) {
            console.log(msg);
        }
        if (constants.isLoggingOn) {
            fs.appendFileSync(this.logFile, `${msg}\n`);
        }
    }
}

/**
 *
 * @type {{Logger: Logger}}
 */
module.exports = {
    Logger
};