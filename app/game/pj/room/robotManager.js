const RobotScheduler_Clear = require('./robot/robotScheduler_Clear');
const RobotScheduler_Leave = require('./robot/robotScheduler_Leave');
const RobotScheduler_Push1 = require('./robot/robotScheduler_Push1');
const RobotScheduler_Push2 = require('./robot/robotScheduler_Push2');
const Super = require('../../../room/robotManager');
const _ = require('underscore');


class RobotManager extends Super {
    constructor(room) {
        super(room);

    }

    init() {
        super.init();

        if(!this.room.isMatch()) {
            return;
        }

        this.schedulers = [
            RobotScheduler_Clear.create(this.room),
            RobotScheduler_Leave.create(this.room),
            RobotScheduler_Push1.create(this.room),
            RobotScheduler_Push2.create(this.room)
        ];
    }

    clear() {
        super.clear();

        _.each(this.schedulers, s => s.clear());
        this.schedulers = null;
    }
}


module.exports = RobotManager;