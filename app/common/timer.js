const _ = require('underscore');


class Timer {
    constructor() {
        this.timestamp = null;
        this.reset();
    }

    dt() {
        let now = _.now();
        let dt = now - this.timestamp;
        this.timestamp = now;
        return dt;
    }

    reset() {
        this.timestamp = _.now();
    }
}


module.exports = Timer;