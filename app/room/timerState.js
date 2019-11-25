const IntervalTimer = require('../common/intervalTimer');
const State = require('./state');


class TimerState extends State {
    constructor(room, type, interval) {
        super(room, type);
        this.timer = new IntervalTimer(interval, () => this.timeout());
    }

    enter() {
        super.enter();
        this.timer.start();
    }

    exit() {
        super.exit();
        this.timer.stop();
    }

    timeout() {
        this.logger.info('状态超时', this.getType());
        this.end();
    }

    end() {
        this.logger.info('状态结束', this.getType());
        this.timer.stop();
    }

    toJson() {
        let json = super.toJson();
        json.time = this.timer.remain();
        json.interval = this.timer.getInterval();
        return json;
    }
}


module.exports = TimerState;