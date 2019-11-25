const cons = require('../../../../common/constants');
const _ = require('underscore');


class RobotScheduler_Push2 {
    static create(room) {
        return new RobotScheduler_Push2(room);
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

        let seats = this.room.getComp('seat').getSittingSeats();
        if(_.every(seats, s => s.getUser().isRobot())) {
            return;
        }

        if((seats.length < 2) || (seats.length > 6)) {
            return;
        }

        if((seats.length === 2) && (_.random(0, 100) > 90)) {
            return;
        }

        if((seats.length === 3) && (_.random(0, 100) > 70)) {
            return;
        }

        if((seats.length === 4) && (_.random(0, 100) > 40)) {
            return;
        }

        if((seats.length === 5) && (_.random(0, 100) > 30)) {
            return;
        }

        if((seats.length === 6) && (_.random(0, 100) > 10)) {
            return;
        }

        let scoreMin = this.room.getAttr('scoreMin');
        _.each(_.range(0, _.random(1, 2)), () => {
            let score =  {1: _.random(2 * scoreMin, 10 * scoreMin)};
            this.room.getComp('robot').scheduleRequire(score, _.random(2000, 15000));
        });
    }
}


module.exports = RobotScheduler_Push2;