const Component = require('./component');

class LoggerManager extends Component {
    constructor(room) {
        super(room);
    }

    init() {
        super.init();
        this.initLogger();
    }

    initLogger() {
        this.logger = require('pomelo-logger').getLogger('game');
    }

    debug(...args) {
        this.logger.debug(this.room.getAttr('game'), this.room.getAttr('gameId'), this.room.getAttr('area'), ...args);
    }

    info(...args) {
        this.logger.info(this.room.getAttr('game'), this.room.getAttr('gameId'), this.room.getAttr('area'), ...args);
    }

    warn(...args) {
        this.logger.warn(this.room.getAttr('game'), this.room.getAttr('gameId'), this.room.getAttr('area'), ...args);
    }

    error(...args) {
        this.logger.error(this.room.getAttr('game'), this.room.getAttr('gameId'), this.room.getAttr('area'), ...args);
    }

    /**
     * 不建议使用，内部调用的就是info，只是为了容错
     * @deprecated
     */
    log(...args) {
        this.info(...args);
    }

    /**
     * 不建议使用，内部调用的就是error，只是为了容错
     * @deprecated
     */
    fatal() {
        this.error();
    }
}

module.exports = LoggerManager;
