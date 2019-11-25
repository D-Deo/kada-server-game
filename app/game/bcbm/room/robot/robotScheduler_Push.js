const cons = require('../../../../common/constants');
const _ = require('underscore');

const ROBOT_MAX = 25;
const ROBOT_BATCH = 25;

class RobotScheduler_Push {
    static create(room) {
        return new RobotScheduler_Push(room);
    }

    constructor(room) {
        this.room = room;

        this.room.on(cons.RoomEvent.ROOM_CREATE(), this.run, this);
        this.room.on(cons.RoomEvent.ROOM_CHANGE_PLAYING(), this.run, this);
        
        this.room.on(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer.bind(this));
    }

    clear() {
        this.room.off(cons.RoomEvent.ROOM_CREATE(), this.run, this);
        this.room.off(cons.RoomEvent.ROOM_CHANGE_PLAYING(), this.run, this);

        this.room.off(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer.bind(this));
    }

    onSeatAddPlayer(seat, user) {
        if (!user.isRobot()) {
            return;
        }

        let robot = this.room.getComp('robot').getRobot(user.getId());
        if (!robot) {
            return;
        }

        robot.onEnterRoom();
    }

    run() {
        let seats = this.room.getComp('seat').getSittingSeats_Robot();
        if (seats.length >= ROBOT_MAX) {
            return;
        }

        let scoreMin = this.room.getAttr('scoreMin');
        let scoreMax = this.room.getAttr('scoreMax') || (scoreMin * 10000);
        _.each(_.range(0, _.random(1, ROBOT_BATCH)), () => {
            let score = { 1: _.random(scoreMin, scoreMax) };
            this.room.getComp('robot').scheduleRequire(score, _.random(1000, 5000));
        });
    }
}


module.exports = RobotScheduler_Push;