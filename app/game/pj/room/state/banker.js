const cons = require('../../../../common/constants');
const p9cons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class BankerState extends Super {
    constructor(room) {
        super(room, p9cons.RoomState.BANKER(), p9cons.RoomStateInterval.BANKER());
    }

    action(seat, action, next) {
        if (action.name !== cons.RoomAction.PLAYER_BANKER()) {
            utils.nextOK(next);
            return;
        }

        if (!seat.isPlaying() ||
            seat.isBankered() ||
            !utils.isNumber(action.banker, 0, 1)) {
            utils.nextError(next);
            return;
        }

        seat.setBanker(action.banker);
        utils.nextOK(next);
        this.room.getComp('seat').isBankered() && this.end();
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            if (!seat.isHosting()) {
                return;
            }

            seat.setBanker(0, true);
        });

        this.room.getComp('seat').isBankered() && this.end();
    }

    end() {
        super.end();
        let seatManager = this.room.getComp('seat');
        let stateManager = this.room.getComp('state');

        let unbankSeats = _.filter(seatManager.getPlayingSeats(), s => !s.isBankered());
        _.each(unbankSeats, s => s.addTimeouts());

        let bankeringSeats = _.filter(seatManager.getPlayingSeats(), (s) => s.isBankering());
        bankeringSeats = _.isEmpty(bankeringSeats) ? seatManager.getPlayingSeats() : bankeringSeats;

        let banker = utils.randomArray(bankeringSeats);
        stateManager.setBanker(banker.getIndex());
        stateManager.changeState(p9cons.RoomState.BID());
    }
    
}


module.exports = BankerState;