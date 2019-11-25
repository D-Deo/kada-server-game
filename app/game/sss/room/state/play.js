const cons = require('../../../../common/constants');
const ssscons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class PlayState extends Super {
    constructor(room) {
        super(room, ssscons.RoomState.PLAY(), ssscons.RoomStateInterval.PLAY());
    }

    action(seat, action, next) {
		if (!this.timer.isRunning()) {
            return utils.nextError(next);
        }
		
        switch (action.name) {
            case cons.RoomAction.PLAYER_PLAY():
                if (!seat.isPlaying() || seat.isPlayed()) {
                    return utils.nextError(next);
                }
                if (!seat.setPlayed(action.special, action.cards)) {
                    return utils.nextError(next, '牌型有误!');
                }
                utils.nextOK(next);
                this.room.getComp('seat').isPlayed() && this.end();
                break;
            case cons.RoomAction.PLAYER_BACK():
                if (!seat.isPlaying()) {
                    return utils.nextError(next);
                }
                if (!seat.canBack()) {
                    return utils.nextError(next, "钻石不足");
                }
                seat.setBack();
                utils.nextOK(next);
                break;
        }

        super.action(seat, action, next);
    }

    enter() {
        // if (this.room.isMatch()) {
        //     super.enter();
        //     return;
        // }
        super.enter();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            seat.getHand().deal();
        });

        // this.room.on(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
        // this.room.on(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
    }

    exit() {
        super.exit();

        if (this.room.isMatch()) {
            return;
        }

        // this.room.off(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
        // this.room.off(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onSeatHostPlayer, this);
    }

    // onSeatRemovePlayer() {
    //     if (this.room.isPrivate() && this.room.getComp('seat').isEmpty()) {
    //         this.room.clear();
    //         return;
    //     }
    // }

    // onSeatHostPlayer() {
    //     if (this.room.isPrivate()
    //         && _.size(this.room.getComp('seat').getSittingSeats()) != _.size(this.room.getComp('seat').getHostingSeats())) {
    //         return;
    //     }

    //     this.room.getComp('seat').removeHostingUsers();
    // }

    end() {
        super.end();

        let hands = _.map(this.room.getComp('seat').getSeats(), (s) => {
            if (!s.isPlaying()) {
                return null;
            }
            if (!s.isPlayed()) {
                s.setPlayed(false);
            }
            s.setShowed();
            return s.hand;
        });

        this.room.getComp('channel').sendAction(cons.RoomAction.PLAYER_SHOW_HAND(), _.map(hands, hand => {
            return hand ? hand.toJson(true) : null;
        }));

        _.delay(() => {
            this.room.getComp('state').changeState(ssscons.RoomState.RESULT());
        }, 1000); //_.size(this.room.getComp('seat').getPlayingSeats()) * 5000 + 2);
    }
}

module.exports = PlayState;