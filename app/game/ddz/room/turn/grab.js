const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const _ = require('underscore');
const utils = require('../../../../utils');


/**
 * 抢地主
 */
class GrabTurn extends Turn {

    static create(room, seat, to) {
        room.getComp('turn').schedule(new GrabTurn(room, seat, to));
    }

    constructor(room, seat, to) {
        super(room, ddzcons.Turn.GRAB(), ddzcons.TurnInterval.GRAB());

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

        if (action.name !== ddzcons.RoomAction.PLAYER_GRAB()) {
            super.action(seat, action, next);
            return;
        }

        this.onGrabAction(action.type, next);
        return;
    }

    onGrabAction(grab, next) {
        if (!utils.isNumber(grab, ddzcons.GRAB.NO(), ddzcons.GRAB.YES())) {
            return utils.nextError(next);
        }

        if (this.seat.isGrabbed()) {
            return utils.nextError(next);
        }

        this.seat.grab(grab);
        this.end(next);
    }

    end(next) {
        super.end(next);

        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');

        if (this.seat.getGrabbed() == ddzcons.GRAB.YES()) {
            stateMgr.setBanker(this.seat.getIndex());
        }

        if (this.seat == this.to) {
            _.delay(() => {
                stateMgr.changeState(ddzcons.RoomState.PLAY());
            }, 1500);
            return;
        }

        // 如果下一个玩家就是叫庄的玩家，则判断是否有人抢地主，如果无人抢，则直接归属叫庄玩家而无需进入他的回合判断，否则就需要再进入一次
        if (this.seat.next() == this.to) {
            let grabSeats = seatMgr.getGrabbedSeats();

            // 无人抢地主，自动归为叫地主的玩家
            if (!grabSeats.length) {
                _.delay(() => {
                    stateMgr.changeState(ddzcons.RoomState.PLAY());
                }, 1500);
                return;

                // _.each(seatManager.getSittingSeats(), (seat) => {
                //     seat.reset();
                // });
                // stateManager.reset();
                // stateManager.changeState(ddzcons.RoomState.DEAL());
                // return;
            }
        }

        stateMgr.createTurn(ddzcons.Turn.GRAB(), this.seat.next(), this.to);
    }

    timeout() {
        this.onGrabAction(ddzcons.GRAB.NO());
    }

    toJson() {
        let json = super.toJson();
        json.seat = this.seat.getIndex();
        return json;
    }
}


module.exports = GrabTurn;