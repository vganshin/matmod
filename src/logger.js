const fs = require('fs');

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
        fs.appendFileSync(this.logFile, `${msg}\n`);
    }
}

/**
 *
 * @type {{Logger: Logger}}
 */
module.exports = {
    Logger
};