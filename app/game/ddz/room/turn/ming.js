const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const utils = require('../../../../utils');
const _ = require('underscore');

class MingTurn extends Turn {

    static create(room, seat, to) {
        room.getComp('turn').schedule(new MingTurn(room, seat, to));
    }

    constructor(room, seat, to) {
        super(room, ddzcons.Turn.MING(), ddzcons.TurnInterval.MING());

        this.seat = seat;
        this.to = to;
        this.logger = this.room.getComp('logger');
    }

    action(seat, action, next) {
        if (seat !== this.seat) {
            super.action(seat, action, next);
            return;
        }

        if (action.name !== ddzcons.RoomAction.PLAYER_ACTION()) {
            super.action(seat, action, next);
            return;
        }

        this.onMingPai(seat, action, next);
    }

    onMingPai(seat, action, next) {
        action.ming && seat.mingPai();
        this.end(next);
    }

    end(next) {
        super.end(next);

        _.delay(() => {
            let statMgr = this.room.getComp('state');
            statMgr.createTurn(ddzcons.Turn.PLAY(), this.seat, null);
        }, 1500);
    }

    timeout() {
        this.end();
    }


    toJson() {
        let json = super.toJson();
        json.seat = this.seat.getIndex();
        return json;
    }
}


module.exports = MingTurn;