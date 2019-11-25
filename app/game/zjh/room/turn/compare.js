const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const _ = require('underscore');


class CompareTurn extends Turn {
    static create(room, seat, to, loser, count) {
        room.getComp('turn').schedule(new CompareTurn(room, seat, to, loser, count));
    }

    constructor(room, seat, to, loser, count = 1) {
        super(room, zjhcons.Turn.COMPARE(), zjhcons.TurnInterval.COMPARE() * count);

        this.seat = seat;
        this.to = to;
        this.loser = loser;
    }

    end() {
        super.end();

        if (this.loser) {
            this.loser.bid(zjhcons.Bid.FOLD());
        }

        let stateManager = this.room.getComp('state');
        if (!stateManager.isPlaying()) {
            stateManager.bidReset();
            stateManager.changeState(zjhcons.RoomState.RESULT());
            return;
        }

        if (this.seat === this.to) {
            let ret = stateManager.nextRound();
            if (ret >= 0) {
                if (ret > 0) {
                    _.delay(() => {
                        stateManager.changeState(zjhcons.RoomState.RESULT());
                    }, zjhcons.TurnInterval.COMPARE() * ret);
                    // let id = setTimeout(() => {
                    //     clearTimeout(id);
                    //     stateManager.changeState(zjhcons.RoomState.RESULT());
                    // }, zjhcons.TurnInterval.COMPARE() * ret);
                    return;
                }

                stateManager.changeState(zjhcons.RoomState.RESULT());
                return;
            }

            this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROUND_CHANGE(), stateManager.getRound());
            stateManager.createTurn(zjhcons.Turn.BID(), this.seat.nextBidding(), this.seat.isPlaying() ? this.seat : this.seat.prevBidding());
            return;
        }

        stateManager.createTurn(zjhcons.Turn.BID(), this.seat.nextBidding(), this.to);
    }

    toJson() {
        let json = super.toJson();
        json.seat = this.seat.getIndex();
        return json;
    }

}


module.exports = CompareTurn;