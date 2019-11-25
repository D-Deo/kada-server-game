const Super = require('../../../room/seatManager');
const constants = require('../../../common/constants');
const ermjcons = require('../common/constants');
const utils = require('../../../utils/index');
const _ = require('underscore');


class SeatManager extends Super {
    constructor(room) {
        super(room);
    }

    // hostUser(userId) {
    //     let seat = this.getSeatByUserId(userId);
    //     if (!seat) {
    //         return;
    //     }

    //     seat.unbindUser();
    // }

    // addUser(user, cb) {
    //     if (this.room.isCleared()) {
    //         user.leaveRoom(null, () => utils.cb(cb, constants.ResultCode.ROOM_UNKNOWN()));
    //         return;
    //     }

    //     let seat = this.getEmptySeat(false);
    //     if (!seat) {
    //         user.leaveRoom(null, () => utils.cb(cb, constants.ResultCode.ROOM_FULL()));
    //         return;
    //     }

    //     let score = this.room.getAttr('score');
    //     let scoreMin = this.room.getAttr('scoreMin');
    //     if (score && scoreMin && user.getScore() < scoreMin) {
    //         user.leaveRoom(null, () => utils.cbItemNotEnough(cb, this.room.getAttr('score')));
    //         return;
    //     }

    //     let scoreMax = this.room.getAttr('scoreMax');
    //     if(score && scoreMax && user.getScore() > scoreMax) {
    //         user.leaveRoom(null, () => utils.cbItemTooMuch(cb, this.room.getAttr('score')));
    //         return;
    //     }

    //     seat.bindUser(user);
    //     utils.cbOK(cb);
    // }

    // isEnough() {
    //     return this.getSittingSeats().length >= 2;
    // }

    isEnough() {
        let seats = _.filter(this.getSittingSeats(), s => s.isReady());
        return seats.length >= this.room.getAttr('capacity');
    }
}

module.exports = SeatManager;