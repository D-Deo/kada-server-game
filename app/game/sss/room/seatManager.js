const cons = require('../common/constants');
const Super = require('../../../room/seatManager');
const _ = require('underscore');
const pomelo = require('pomelo');


class SeatManager extends Super {
    constructor(room) {
        super(room);
    }

    isEnough() {
        let sittingSeats = this.getSittingSeats();
        let seats = _.filter(this.getSittingSeats(), s => s.isReady());
        let capacityMin = this.room.getAttr('capacityMin');
        return sittingSeats.length == seats.length && (capacityMin ? seats.length >= capacityMin : seats.length == this.room.getAttr('capacity'));
    }

    isPlayed() {
        return _.every(this.getPlayingSeats(), (s) => s.isPlayed());
    }

    /**
     * 是否存在黑名单
     */
    isBlackList() {
        let count = 0;
        count = _.reduce(this.getSittingSeats(), (count, seat) => {
            if (seat.isRobot() || !seat.isBlack()) {
                return count;
            }
            count += 1;
            return count;
        }, 0);
        return count;
    }

    /**
     * 是否存在白名单
     */
    isWhiteList() {
        let count = 0;
        count = _.reduce(this.getSittingSeats(), (count, seat) => {
            if (seat.isRobot() || !seat.getUser().isWhite()) {
                return count;
            }
            count += 1;
            return count;
        }, 0);
        return count;
    }

    refreshState() {
        _.each(this.getSittingSeats(), (seat) => {
            pomelo.app.rpc.user.roomRemote.getUserState(
                seat.getUserId(),
                seat.getUserId(),
                (err, state) => {
                    if (err) return console.error(err);
                    if (seat && seat.getUser()) {
                        seat.getUser().updateState(state);
                    }
                }
            );
        });
    }
}


module.exports = SeatManager;