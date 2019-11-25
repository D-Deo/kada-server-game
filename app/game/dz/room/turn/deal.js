const cons = require('../../../../common/constants');
const dzcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const _ = require('underscore');


class DealTurn extends Turn {
    static create(room) {
        let stateManager = room.getComp('state');
        stateManager.bidReset();
        stateManager.setShowhand();

        if(!stateManager.canDeal()) {
            stateManager.setShowhand();
            stateManager.changeState(dzcons.RoomState.RESULT());
            return;
        }

        room.getComp('turn').schedule(new DealTurn(room));
    }

    constructor(room) {
        super(room, dzcons.Turn.DEAL(), dzcons.TurnInterval.DEAL());
    }

    begin() {
        super.begin();

        this.room.getComp('state').deal();
    }

    end() {
        super.end();

        let stateManager = this.room.getComp('state');
        let biddings = this.room.getComp('seat').getBiddingSeats();
        if(biddings.length <= 1) {
            stateManager.createTurn(dzcons.Turn.DEAL());
            return;
        }

        let banker = stateManager.getBankerSeat();
        let seats = banker.nexts();
        seats.push(banker);
        seats = _.filter(seats, s => s.isBidding());
        stateManager.createTurn(dzcons.Turn.BID(), _.first(seats), _.last(seats));
    }
}


module.exports = DealTurn;