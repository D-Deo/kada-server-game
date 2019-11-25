const Super = require('../../../room/seatManager');
const GameManager = require('../../../game/manager');
const constants = require('../../../common/constants');
const utils = require('../../../utils/index');
const _ = require('underscore');


class SeatManager extends Super {
    constructor(room) {
        super(room);
    }

    initSeats() {
        this.seats = [];
    }

    addUser(user, cb) {
        if (this.room.isCleared()) {
            user.leaveRoom(null, () => utils.cb(cb, constants.ResultCode.ROOM_UNKNOWN()));
            return;
        }

        let seat = this.getEmptySeat(user);
        if (!seat) {
            user.leaveRoom(null, () => utils.cb(cb, constants.ResultCode.ROOM_FULL()));
            return;
        }

        let score = this.room.getAttr('score');
        let scoreMin = this.room.getAttr('scoreMin');
        if (score && scoreMin && user.getScore() < scoreMin) {
            user.leaveRoom(null, () => utils.cbItemNotEnough(cb, this.room.getAttr('score')));
            return;
        }

        let scoreMax = this.room.getAttr('scoreMax');
        if (score && scoreMax && user.getScore() > scoreMax) {
            user.leaveRoom(null, () => utils.cbItemTooMuch(cb, this.room.getAttr('score')));
            return;
        }

        seat.bindUser(user);
        utils.cbOK(cb);
    }

    removeUser(userId, reason, cb) {
        super.removeUser(userId, reason, cb);
        this.removeEmptySeats();
    }

    removeHostingUsers() {
        _.each(this.getHostingSeats(), (seat) => {
            !seat.isPlaying() && seat.unbindUser(constants.RoomClearReason.KICK_HOSTING_USER());
        });
        this.removeEmptySeats();
    }

    removeNotEnoughScoreUsers() {
        super.removeNotEnoughScoreUsers();
        this.removeEmptySeats();
    }

    removeEmptySeats() {
        this.seats = _.filter(this.seats, (seat) => {
            return !seat.isEmpty();
        });
    }

    getEmptySeat(user) {
        let seat = GameManager.getInstance().new2(this.room.getGame(), 'room.seat', this.room, user.getId());
        this.seats.push(seat);
        return seat;
    }

    getSeatsSortByMoney() {
        this.removeEmptySeats();
        return _.sortBy(this.seats, (seat) => {
            return seat.getUser() ? -seat.getUser().getScore() : 0;
        });
    }
}


module.exports = SeatManager;