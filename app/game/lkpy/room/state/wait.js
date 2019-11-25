const cons = require('../../../../common/constants');
const lkpycons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class WaitState extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.WAIT(), lkpycons.RoomStateInterval.WAIT());
    }

    onSeatAddPlayer() {
        if (this.timer.isRunning()) {
            return;
        }

        if (this.room.getComp('seat').isEmpty()) {
            return;
        }

        this.timer.start();
    }

    enter() {
        this.room.on(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);

        this.onSeatAddPlayer();
    }

    exit() {
        super.exit();

        this.room.off(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);
    }

    action(seat, action, next) {
        utils.nextOK(next);
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(lkpycons.RoomState.FREE());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}


module.exports = WaitState;