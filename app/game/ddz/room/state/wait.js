const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class WaitState extends Super {
    constructor(room) {
        super(room, ddzcons.RoomState.WAIT());
    }

    enter() {
        this.room.on(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);
        this.room.on(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
        this.room.on(cons.RoomEvent.PLAYER_READY(), this.onSeatAddPlayer, this);

        this.room.getComp('seat').removeSittingUser();
    }

    exit() {
        super.exit();

        this.room.off(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);
        this.room.off(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
        this.room.off(cons.RoomEvent.PLAYER_READY(), this.onSeatAddPlayer, this);
    }

    end() {
        super.end();
        this.room.getComp('round').begin();
    }

    onSeatAddPlayer() {
        if (!this.room.getComp('seat').isEnough()) {
            this.room.getComp('logger').info('WaitState !this.room.getComp(seat).isEnough()...');
            return;
        }

        this.room.getComp('round').begin();
    }

    onSeatHostPlayer() {
        this.room.getComp('seat').removeHostingUsers();
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = WaitState;