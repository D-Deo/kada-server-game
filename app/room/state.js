const utils = require('../utils');


class State {
    constructor(room, type) {
        this.room = room;
        this.type = type;

        this.logger = this.room.getComp('logger');
    }

    action(seat, action, next) {
        utils.nextError(next);
    }

    enter() {
        this.logger.info('状态开始', this.getType());
    }

    exit() {
        this.logger.info('状态完成', this.getType());
    }

    getType() {
        return this.type;
    }

    update(dt) { }

    toJson() {
        let json = {};
        json.type = this.type;
        return json;
    }
}


module.exports = State;