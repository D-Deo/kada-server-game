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
        if (playing) {
            return;
        }

        let seats = this.room.getComp('seat').getSittingSeats_Robot();

        if ((seats.length >= 2)) {
            return;
        }

        // if ((seats.length === 1) && (_.random(0, 100) > 80)) {
        //     return;
        // }

        // if ((seats.length === 0) && (_.random(0, 100) > 90)) {
        //     return;
        // }

        let scoreMin = this.room.getAttr('scoreMin');
        let scoreMax = this.room.getAttr('scoreMax') || (scoreMin * 100);
        _.each(_.range(2 - seats.length), () => {
            let score = { 1: _.random(scoreMin, scoreMax) };
            this.room.getComp('robot').scheduleRequire(score, _.random(1000, 1000));
        });
    }
}


module.exports = RobotScheduler_Push2;