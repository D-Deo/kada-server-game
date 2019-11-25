const cons = require('../../../../common/constants');
const _ = require('underscore');


class RobotScheduler_Leave {
    static create(room) {
        return new RobotScheduler_Leave(room);
    }

    constructor(room) {
        this.room = room;

        this.room.on(cons.RoomEvent.ROOM_CHANGE_PLAYING(), this.run, this);
    }

    clear() {
        this.room.off(cons.RoomEvent.ROOM_CHANGE_PLAYING(), this.run, this);
    }

    run(playing) {
        if(playing) {
            return;
        }

        let robots = this.room.getComp('robot').getRobots();
        _.each(robots, r => {
            if(_.random(0, 100) > 20) {
                return;
            }

            this.room.getComp('robot').scheduleRelease(r.getId(), _.random(1000, 4000));
        });
    }
}


module.exports = RobotScheduler_Leave;