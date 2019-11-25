const _ = require('underscore');


class RobotScheduler_Clear {
    static create(room) {
        return new RobotScheduler_Clear(room);
    }

    constructor(room) {
        this.room = room;
        this.handler = setInterval(() => this.run(), 500);
    }

    run() {
        let users = this.room.getComp('seat').getSittingSeats_User();
        if(!_.isEmpty(users)) {
            return;
        }

        this.room.getComp('robot').clearRobots();
    }

    clear() {
        if(this.handler === null) {
            return;
        }

        clearInterval(this.handler);
        this.handler = null;
    }
}


module.exports = RobotScheduler_Clear;