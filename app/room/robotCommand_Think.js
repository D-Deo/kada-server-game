const Super = require('./robotCommand');
const _ = require('underscore');


class RobotCommand extends Super {
    constructor(room, robot, tmin, tmax) {
        super(room, robot);

        this.tmin = tmin;
        this.tmax = tmax;
        this.handler = null;
    }

    clear() {
        super.clear();

        if (this.handler == null) {
            return;
        }
        
        clearTimeout(this.handler);
        this.handler = null;
    }

    isThinking() {
        return this.handler !== null;
    }

    run() {
        if (this.isThinking()) {
            console.error('RobotCommand_Thinking run: thinking');
            return;
        }

        this.handler = setTimeout(() => this.timeout(), _.random(this.tmin, this.tmax));

    }

    timeout() {
        this.clear();
    }
}


module.exports = RobotCommand;