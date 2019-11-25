const Super = require('../../../common/intervalTimer');

class IntervalTimer extends Super {
    constructor(interval, callback) {
        super(interval, callback);
        this.isFrozen = false;
        this.intervalOri = interval;
    }

    // 冰冻
    freeze() {
        if (this.isFrozen || !this.isRunning())
            return false;

        this.interval = this.remain();
        this.isFrozen = true;
        this.stop();

        return true;
    }

    // 解冻
    unfreeze() {
        if (!this.isFrozen) {
            return false;
        }

        this.start();

        this.isFrozen = false;

        return true;
    }

    restart() {
        this.interval = this.intervalOri;
        this.start();
    }
}

module.exports = IntervalTimer;