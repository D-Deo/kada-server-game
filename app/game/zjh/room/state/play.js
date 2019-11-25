const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');
const Super = require('../../../../room/state');
const utils = require('../../../../utils');


class PlayState extends Super {
    constructor(room) {
        super(room, zjhcons.RoomState.PLAY());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        // let bblind = stateManager.getBblindSeat();
        let banker = stateManager.getBankerSeat();
        stateManager.createTurn(zjhcons.Turn.BID(), banker.nextBidding(), banker);
    }

}


module.exports = PlayState;