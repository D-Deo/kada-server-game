const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const _ = require('underscore');
const utils = require('../../../../utils');

/**
 * 叫分或叫地主
 */
class SpeakTurn extends Turn {

    static create(room, seat, to) {
        room.getComp('turn').schedule(new SpeakTurn(room, seat, to));
    }

    constructor(room, seat, to) {
        super(room, ddzcons.Turn.SPEAK(), ddzcons.TurnInterval.SPEAK());

        this.seat = seat;
        this.to = to;
        this.logger = this.room.getComp('logger');
    }

    action(seat, action, next) {
        this.logger.info('玩家消息', seat.getIndex(), seat.getUserId(), action);

        if (seat !== this.seat) {
            super.action(seat, action, next);
            return;
        }

        if (action.name !== ddzcons.RoomAction.PLAYER_SPEAK()) {
            super.action(seat, action, next);
            return;
        }

        this.onSpeakAction(action.type, next);
        return;
    }

    onSpeakAction(score, next) {
        if (!utils.isNumber(score, ddzcons.SPEAK.NO(), ddzcons.SPEAK.YES())) {
            return utils.nextError(next);
        }

        if (this.seat.isSpeaked()) {
            return utils.nextError(next);
        }

        this.seat.speak(score);
        this.end(next);
    }

    end(next) {
        super.end(next);

        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');
        // 3分即表示叫地主
        if (this.seat.getSpeaked() >= ddzcons.SPEAK.YES()) {
            stateMgr.setBanker(this.seat.getIndex());
            stateMgr.createTurn(ddzcons.Turn.GRAB(), this.seat.next(), this.seat);
            // stateMgr.setBanker(this.seat.getIndex());
            // _.delay(() => {
            //     this.room.getComp('state').changeState(ddzcons.RoomState.PLAY());
            // }, 1500);
            return;
        }

        if (this.seat == this.to) {
            _.delay(() => {
                _.each(seatMgr.getSittingSeats(), (seat) => {
                    seat.reset();
                });
                stateMgr.reset();
                stateMgr.changeState(ddzcons.RoomState.DEAL());
            }, 1500);
            return;
        }

        stateMgr.createTurn(ddzcons.Turn.SPEAK(), this.seat.next(true), this.to);
    }

    timeout() {
        this.onSpeakAction(ddzcons.SPEAK.NO());
    }

    toJson() {
        let json = super.toJson();
        json.seat = this.seat.getIndex();
        return json;
    }
}


module.exports = SpeakTurn;