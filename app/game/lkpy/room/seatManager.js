const Super = require('../../../room/seatManager');
const GameManager = require('../../../game/manager');
const constants = require('../../../common/constants');
const utils = require('../../../utils/index');
const _ = require('underscore');


class SeatManager extends Super {
    constructor(room) {
        super(room);
    }

    hostUser(userId) {
        let seat = this.getSeatByUserId(userId);
        if (!seat) {
            return;
        }

        seat.unbindUser();
    }
}


module.exports = SeatManager;