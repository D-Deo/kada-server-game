const RobotScheduler_Push = require('./robot/robotScheduler_Push');
const Super = require('../../../room/robotManager');
const _ = require('underscore');


class RobotManager extends Super {
    constructor(room) {
        super(room);

    }

    init() {
        super.init();

        if (!this.room.isMatch()) {
            return;
        }

        this.schedulers = [
            RobotScheduler_Push.create(this.room)
        ];
    }

    clear() {
        super.clear();

        _.each(this.schedulers, s => s.clear());
        this.schedulers = null;
    }
}


module.exports = RobotManager;