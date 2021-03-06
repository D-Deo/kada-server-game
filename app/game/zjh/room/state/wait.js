const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class WaitState extends Super {
    constructor(room) {
        super(room, zjhcons.RoomState.WAIT(), zjhcons.RoomStateInterval.WAIT());
    }

    action(seat, action, next) {
        utils.nextOK(next);
    }

    enter() {
        this.room.on(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);
        this.room.on(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
        this.room.on(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
        // this.room.on(cons.RoomEvent.PLAYER_READY(), this.onSeatAddPlayer, this);
        this.room.getComp('seat').removeHostingUsers();
        this.room.getComp('seat').removeNotEnoughScoreUsers();

        this.onSeatAddPlayer();
    }

    exit() {
        super.exit();

        this.room.off(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);
        this.room.off(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
        this.room.off(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
        // this.room.off(cons.RoomEvent.PLAYER_READY(), this.onSeatAddPlayer, this);
    }

    end() {
        super.end();
        this.room.getComp('round').begin();
    }

    onSeatAddPlayer() {
        if (this.timer.isRunning()) {
            return;
        }

        if (!this.room.getComp('seat').isEnough()) {
            return;
        }

        this.timer.start();
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_TIMER_START(), this.timer.remain());
    }

    onSeatRemovePlayer() {
        if (this.room.isPrivate() && this.room.getComp('seat').isEmpty()) {
            this.room.clear();
            return;
        }

        if (!this.timer.isRunning()) {
            return;
        }

        if (this.room.getComp('seat').isEnough()) {
            return;
        }

        this.timer.stop();
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_TIMER_STOP());
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


module.exports = WaitState;