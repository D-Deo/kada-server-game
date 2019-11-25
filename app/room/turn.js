const Timer = require('../common/intervalTimer');
const utils = require('../utils/index');


class Turn {
    constructor(room, type, interval, ignoreTimeout) {
        this.room = room;
        this.id = null;
        this.type = type;
        this.timer = new Timer(interval, () => !ignoreTimeout && this.timeout());
        this.ended = false;

        this.init();
    }

    action(seat, action, next) {
        utils.nextError(next);
    }

    begin() {
        this.timer.start();
    }

    clear() {
        this.timer.stop();
    }

    end(next) {
        this.clear();
        this.ended = true;
        next && utils.nextOK(next);
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getIndex() {
        return null;
    }

    init() {
        this.id = this.room.getComp('turn').createTurnId();
    }

    isEnded() {
        return this.ended;
    }

    timeout() {
        this.end();
    }

    toJson() {
        let json = {};
        json.id = this.id;
        json.type = this.type;
        json.time = this.timer.remain();
        return json;
    }

    update(dt) { }
}


module.exports = Turn;