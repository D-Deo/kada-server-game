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

        if ((seats.length >= 0)) {
            return;
        }

        if ((seats.length === 1) && (_.random(0, 100) > 80)) {
            return;
        }

        if ((seats.length === 0) && (_.random(0, 100) > 90)) {
            return;
        }

        let baseScore = this.room.getAttr('baseScore');
        let scoreMax = this.room.getAttr('scoreMax') || (baseScore * 10);
        _.each(_.range(2 - seats.length), () => {
            let score = { 1: _.random(baseScore * 10, scoreMax * 10) };
            this.room.getComp('robot').scheduleRequire(score, _.random(2000, 15000));
        });
    }
}


module.exports = RobotScheduler_Push2;