const cons = require('../../../../common/constants');
const dzcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const utils = require('../../../../utils');


class BidTurn extends Turn {
    static create(room, seat, to) {
        room.getComp('turn').schedule(new BidTurn(room, seat, to));
    }

    constructor(room, seat, to) {
        super(room, dzcons.Turn.BID(), dzcons.TurnInterval.BID());

        this.seat = seat;
        this.to = to;
    }

    action(seat, action, next) {
        if (seat !== this.seat) {
            super.action(seat, action, next);
            return;
        }

        if (action.name !== cons.RoomAction.PLAYER_BID()) {
            super.action(seat, action, next);
            return;
        }

        switch (action.type) {
            case dzcons.Bid.ADD():
                this.onBidAction_Add(action.count, next);
                break;

            case dzcons.Bid.ALLIN():
                this.onBidAction_Allin(next);
                break;

            case dzcons.Bid.FOLD():
                this.onBidAction_Fold(next);
                break;

            case dzcons.Bid.FOLLOW():
                this.onBidAction_Follow(next);
                break;

            case dzcons.Bid.PASS():
                this.onBidAction_Pass(next);
                break;

            default:
                utils.nextError(next);
                return;
        }
    }

    onBidAction_Add(count, next) {
        if (!utils.isNumber(count, 1)) {
            utils.nextError(next);
            return;
        }

        if (!this.seat.canBidAdd(count)) {
            utils.nextError(next);
            return;
        }

        this.seat.bid(dzcons.Bid.ADD(), count);
        this.end(next);
    }

    onBidAction_Allin(next) {
        this.seat.bidAllin();
        this.end(next);
    }

    onBidAction_Fold(next) {
        this.seat.bid(dzcons.Bid.FOLD());
        this.end(next);
    }

    onBidAction_Follow(next) {
        if (!this.seat.canBidFollow()) {
            utils.nextError(next);
            return;
        }

        this.seat.bidFollow();
        this.end(next);
    }

    onBidAction_Pass(next) {
        if (!this.seat.canBidPass()) {
            utils.nextError(next);
            return;
        }

        this.seat.bid(dzcons.Bid.PASS());
        this.end(next);
    }

    end(next) {
        super.end(next);

        let stateManager = this.room.getComp('state');
        if (!stateManager.isPlaying()) {
            stateManager.bidReset();
            stateManager.changeState(dzcons.RoomState.RESULT());
            return;
        }

        if (this.seat.isAddBidding() && stateManager.isBidding()) {
            stateManager.createTurn(dzcons.Turn.BID(), this.seat.nextBidding(), this.seat.prevBidding());
            return;
        }

        if (this.seat === this.to) {
            stateManager.createTurn(dzcons.Turn.DEAL());
            return;
        }

        stateManager.createTurn(dzcons.Turn.BID(), this.seat.nextBidding(), this.to);
    }

    timeout() {
        this.seat.bid(this.seat.canBidPass() ? dzcons.Bid.PASS() : dzcons.Bid.FOLD());
        this.end();
    }

    toJson() {
        let json = super.toJson();
        json.seat = this.seat.getIndex();
        return json;
    }
}


module.exports = BidTurn;