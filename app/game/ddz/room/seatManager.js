const Super = require('../../../room/seatManager');
const cons = require('../../../common/constants');
const _ = require('underscore');

class SeatManager extends Super {

    constructor(room) {
        super(room);
    }

    /**
     * 获取叫庄的玩家座位
     */
    getSpeakingSeats() {
        return _.filter(this.getSittingSeats(), s => s.getSpeaked());
    }

    /**
     * 获取叫地主的玩家，如果是叫分模式，取叫分最大的玩家
     */
    getSpeakedSeats() {
        return _.max(this.getSittingSeats(), s => s.getSpeaked());
    }

    /**
     * 获取抢地主的玩家座位
     */
    getGrabbedSeats() {
        return _.filter(this.getSittingSeats(), s => s.getGrabbed());
    }

    /**
     * 获取加倍的玩家座位
     */
    getDoublingSeats() {
        return _.filter(this.getSittingSeats(), s => s.getDoubled());
    }

    /**
     * 当前座位是否已满
     */
    isEnough() {
        let seats = _.filter(this.getSittingSeats(), s => s.isReady());
        return seats.length >= this.room.getAttr('capacity');
    }

    /**
     * 当前座位是否都操作过抢庄行为
     */
    isBankered() {
        return _.every(this.getPlayingSeats(), (s) => s.isBankered());
    }

    /**
     * 是否所有玩家都进行过加不加倍行为
     */
    isDoubled() {
        return _.every(this.getPlayingSeats(), (s) => s.isDoubled());
    }

    /**
     * 当前座位是否存在黑名单，且有两个真人玩家
     */
    isBlackList() {
        if (!this.room.getAttr('blacklist')) return false;

        let count = 0;
        if (this.immortalCnt() >= 2) {
            count = _.reduce(this.getSittingSeats(), (count, seat) => {
                if (seat.isRobot() || !seat.isBlack()) {
                    return count;
                }
                count += 1;
                return count;
            }, 0);
        }
        return count > 1;
    }

    removeBlackList() {
        _.each(this.getSittingSeats(), (seat) => {
            seat.isBlack() && seat.unbindUser(cons.RoomClearReason.RESULT());
        });
    }
}

module.exports = SeatManager;