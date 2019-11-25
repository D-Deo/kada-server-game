const cons = require('../../../../common/constants');
const p9cons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class BidState extends Super {
    constructor(room) {
        super(room, p9cons.RoomState.BID(), p9cons.RoomStateInterval.BID());
    }

    action(seat, action, next) {
        if (action.name !== cons.RoomAction.PLAYER_BID()) {
            utils.nextOK(next);
            return;
        }

        if (seat.isBanker() ||
            !seat.isPlaying() ||
            seat.isBidded() ||
            !utils.isNumber(action.bid, 1, 3)) {
            utils.nextError(next);
            return;
        }

        seat.setBid(action.bid);
        utils.nextOK(next);
        this.room.getComp('seat').isBidded() && this.end();
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            if (seat.isBanker() || !seat.isHosting()) {
                return;
            }

            seat.setBid(1, true);
        });

        this.room.getComp('seat').isBidded() && this.end();
    }

    end() {
        super.end();
        let stateManager = this.room.getComp('state');
        _.each(this.room.getComp('seat').getSittingSeats(), (seat) => {
            if (stateManager.isBankerSeat(seat) || seat.isBidded()) {
                return;
            }

            seat.setBid(1, true);
        });

        stateManager.changeState(p9cons.RoomState.DEAL());
    }

}


module.exports = BidState;