const Super = require('../../../room/seatManager');
const _ = require('underscore');


class SeatManager extends Super {
    constructor(room) {
        super(room);
    }

    getBiddingSeats() {
        return _.filter(this.getSittingSeats(), s => s.isBidding());
    }

    getPlayingSeats() {
        return _.filter(this.getSittingSeats(), s => s.isPlaying());
    }

    getPlayedSeats() {
        return _.filter(this.getSeats(), s => {
            if (!this.room.isPlaying()) {
                return false;
            }

            if (!s.getHand() && !s.getBidTotal()) {
                return false;
            }

            return true;
        });
    }

    isEnough() {
        let seats = _.filter(this.getSittingSeats(), s => s.isReady());
        return seats.length >= this.room.getAttr('capacityMin');
    }
}


module.exports = SeatManager;