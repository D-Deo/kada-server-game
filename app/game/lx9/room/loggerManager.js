const Super = require('../../../room/loggerManager');
const _ = require('underscore');

class LoggerManager extends Super {
    constructor(room) {
        super(room);
    }

    initLogger() {
        this.logger = require('pomelo-logger').getLogger('game-lx9');
    }
}

module.exports = LoggerManager;
