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

        if (this.handler === null) {
            return;
        }

        clearInterval(this.handler);
        this.handler = null;
    }

    isObserving() {
        return this.handler !== null;
    }

    run() {
        if (this.isObserving()) {
            console.error('RobotCommand_Observe run: observing');
            return;
        }

        this.handler = setInterval(() => this.call(), _.random(this.tmin, this.tmax));
    }

    call() {

    }
}


module.exports = RobotCommand;