const cons = require('../common/constants');
const Super = require('../../../room/seatManager');
const _ = require('underscore');


class SeatManager extends Super {
    constructor(room) {
        super(room);
    }

    getPlayingSeats() {
        return _.filter(this.getSittingSeats(), (seat) => seat.isPlaying());
    }

    isBankered() {
        return _.every(this.getPlayingSeats(), (s) => s.isBankered());
    }

    isBidded() {
        return _.every(this.getPlayingSeats(), (s) => s.isBanker() || s.isBidded());
    }

    isEnough() {
        let seats = _.filter(this.getSittingSeats(), s => s.isReady());
        return seats.length >= cons.PLAYER_MIN();
        // return _.size(this.getSittingSeats()) >= cons.PLAYER_MIN();
    }

    isPlayed() {
        return _.every(this.getPlayingSeats(), (s) => s.isPlayed());
    }
}


module.exports = SeatManager;