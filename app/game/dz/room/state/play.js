const cons = require('../../../../common/constants');
const dzcons = require('../../common/constants');
const Super = require('../../../../room/state');
const utils = require('../../../../utils');


class PlayState extends Super {
    constructor(room) {
        super(room, dzcons.RoomState.PLAY());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let bblind = stateManager.getBblindSeat();
        stateManager.createTurn(dzcons.Turn.BID(), bblind.nextBidding(), bblind);
    }

    action(seat, action, next) {
        let index = action.index;
        let show = !!action.show;

        if (!utils.isNumber(index, 0, 1)) {
            utils.nextError(next);
            return;
        }

        if (!seat.setShowHand(index, show)) {
            utils.nextError(next);
            return;
        }

        utils.nextOK(next);
    }
}


module.exports = PlayState;