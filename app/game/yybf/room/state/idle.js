const cons = require('../../../../common/constants');
const yybfcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class IdleState extends Super {
    constructor(room) {
        super(room, yybfcons.RoomState.IDLE(), yybfcons.RoomStateInterval.IDLE());
    }

    action(seat, action, next) {
        utils.nextOK(next);
    }

    enter() {
        super.enter();
        this.room.reset();
        this.room.on(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
        this.room.getComp('seat').removeHostingUsers();
        this.room.getComp('seat').removeNotEnoughScoreUsers();
    }

    exit() {
        super.exit();
        this.room.off(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
    }

    end() {
        super.end();
        this.room.getComp('round').begin();
    }

    onSeatHostPlayer() {
        if (this.room.isPrivate()) {
            return;
        }

        this.room.getComp('seat').removeHostingUsers();
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = IdleState;