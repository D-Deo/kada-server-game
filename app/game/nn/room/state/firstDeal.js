const nncons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');


class FirstDealState extends Super {
    constructor(room) {
        super(room, nncons.RoomState.FIRST_DEAL(), nncons.RoomStateInterval.FIRST_DEAL());
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getSittingSeats(), (seat) => {
            // seat.getHand().addCards(this.room.getComp('state').getLibrary().draw(4));
            seat.getHand().firstDeal();
            seat.getHand().sendCards();
        });
    }

    end() {
        super.end();

        if (this.room.getAttr('bankerMode') === nncons.BankerMode.ASK()) {
            this.room.getComp('state').changeState(nncons.RoomState.BANKER());
        } else {
            this.room.getComp('state').changeState(nncons.RoomState.BID());
        }
    }

}


module.exports = FirstDealState;