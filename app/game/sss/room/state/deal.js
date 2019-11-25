const ssscons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');

class DealState extends Super {
    constructor(room) {
        super(room, ssscons.RoomState.DEAL(), ssscons.RoomStateInterval.DEAL());
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            seat.getHand().deal();
        });
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(ssscons.RoomState.PLAY());
    }
}

module.exports = DealState;