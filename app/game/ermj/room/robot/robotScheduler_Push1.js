const cons = require('../../../../common/constants');
const _ = require('underscore');


class RobotScheduler_Push1 {
    static create(room) {
        return new RobotScheduler_Push1(room);
    }

    constructor(room) {
        this.room = room;
        this.handler = null;

        this.room.on(cons.RoomEvent.SEAT_ADD_PLAYER(), this.refresh, this);
        this.room.on(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.refresh, this);
    }

    clear() {
        this.room.off(cons.RoomEvent.SEAT_ADD_PLAYER(), this.refresh, this);
        this.room.off(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.refresh, this);
        this.stop();
    }

    refresh() {
        let seats = this.room.getComp('seat').getSittingSeats_Robot();
        if (seats.length >= 1) {
            this.stop();
            return;
        }

        // let seat = _.first(seats);
        // if (seat.getUser().isRobot()) {
        //     this.stop();
        //     return;
        // }

        this.start();
    }

    run() {
        this.stop();

        let scoreMin = this.room.getAttr('scoreMin');
        _.each(_.range(1), () => {
            let score = { 1: _.random(2 * scoreMin, 10 * scoreMin) };
            this.room.getComp('robot').scheduleRequire(score, _.random(1000, 3500));
        });
    }

    start() {
        if (this.handler !== null) {
            return;
        }

        this.handler = setTimeout(() => this.run(), _.random(1000, 2000));
    }

    stop() {
        if (this.handler === null) {
            return;
        }

        clearTimeout(this.handler);
        this.handler = null;
    }
}


module.exports = RobotScheduler_Push1;