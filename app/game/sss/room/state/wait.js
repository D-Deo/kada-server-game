const cons = require('../../../../common/constants');
const ssscons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class WaitState extends Super {
    constructor(room) {
        super(room, ssscons.RoomState.WAIT(), room.isPlaying() ? ssscons.RoomStateInterval.WAIT_PLAYING() : ssscons.RoomStateInterval.WAIT());
    }

    action(seat, action, next) {
        switch (action.name) {
            case ssscons.RoomAction.PLAYER_CUT():
                if (seat.isReady()) {
                    return utils.nextError(next, "已准备，不能洗牌");
                }
                if (!seat.canCut()) {
                    return utils.nextError(next, "钻石不足");
                }
                seat.cut();
                return utils.nextOK(next);
        }

        super.action(seat, action, next);
    }

    enter() {
        this.room.on(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);
        this.room.on(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
        // this.room.on(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
        this.room.on(cons.RoomEvent.PLAYER_READY(), this.onSeatPlayerReady, this);
        // this.room.getComp('seat').removeHostingUsers();
        // this.room.getComp('seat').removeNotEnoughScoreUsers();
        if (!this.room.isPlaying()) {
            this.onSeatAddPlayer();
        }
    }

    exit() {
        super.exit();

        this.room.off(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer, this);
        this.room.off(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
        // this.room.off(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
        this.room.off(cons.RoomEvent.PLAYER_READY(), this.onSeatPlayerReady, this);
    }

    end() {
        super.end();

        // _.each(this.room.getComp('seat').getSittingSeats(), (s) => {
        //     if (!s.isReady()) s.setReady();
        // });

        this.room.getComp('round').begin();
    }

    timeout() {
        if (this.room.isPlaying()) {
            _.each(this.room.getComp('seat').getSittingSeats(), (s) => {
                if (!s.isReady()) s.setReady();
            });
        } else {
            this.end();
        }
    }

    onSeatAddPlayer() {
		if (this.room.isPlaying()) {
			return;
		}
		
        if (this.timer.isRunning()) {
			this.timer.stop();
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

        // if (!this.timer.isRunning()) {
        // return;
        // }

        if (this.room.getComp('seat').isEnough()) {
			if (this.room.isPlaying()) {
				this.end();
				return;
			}
		
            if (this.timer.isRunning()) {
                return;
            }
            this.timer.start();
            this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_TIMER_START(), this.timer.remain());
            return;
        }

		if (this.room.isPlaying()) {
			return;
		}
		
        this.timer.stop();
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_TIMER_STOP());
    }

    onSeatHostPlayer() {
        // if (this.room.isPrivate()) {
        // return;
        // }

        this.room.getComp('seat').removeHostingUsers();

        if (this.timer.isRunning()) {
            this.timer.stop();
            return;
        }
    }

    onSeatPlayerReady() {
        let seatMgr = this.room.getComp('seat');

        if (this.room.isPlaying()) {
            if (seatMgr.isEnough()) {
                this.end();
                return;
            }
        } else {
            if (!seatMgr.isEnough()) {
                return;
            }
        }

        if (this.timer.isRunning()) {
            return;
        }

        this.timer.start();
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_TIMER_START(), this.timer.remain());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = WaitState;