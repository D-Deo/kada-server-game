const utils = require('../utils');
const _ = require('underscore');


class IntervalTimer {
    constructor(interval, callback) {
        this.interval = interval;
        this.callback = callback;
        this.timestamp = null;
        this.handle = null;
    }

    elapsed() {
        return this.timestamp === null ? 0 : (_.now() - this.timestamp);
    }

    isRunning() {
        return !_.isNull(this.timestamp);
    }

    remain() {
        let r = this.interval - this.elapsed();
        return r <= 0.0 ? 0.0 : r;
    }

    getInterval() {
        return this.interval;
    }

    start() {
        !this.handle && this.stop();
        this.handle = setTimeout(() => utils.invokeCallback(this.callback), this.interval);
        this.timestamp = _.now();
    }

    stop() {
        if(!this.handle) {
            return;
        }

        clearTimeout(this.handle);
        this.handle = null;
        this.timestamp = null;
    }
}


module.exports = IntervalTimer;