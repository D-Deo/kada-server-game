const p9cons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');


class DealState extends Super {
    constructor(room) {
        super(room, p9cons.RoomState.DEAL(), p9cons.RoomStateInterval.DEAL());
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            seat.getHand().deal();
        });
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(p9cons.RoomState.PLAY());
    }
}


module.exports = DealState;