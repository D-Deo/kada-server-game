const Super = require('../../../room/roomController');
const utils = require('../../../utils');

class RoomContorller extends Super {
    constructor(room) {
        super(room);
    }

    action(userId, action, next) {
        let seat = this.room.getComp('seat').getSeatByUserId(userId);
        if (!seat) {
            utils.nextError(next);
            return;
        }

        this.room.getComp('turn').action(seat, action, next)
            || this.room.getComp('state').action(seat, action, next);
    }
}


module.exports = RoomContorller;
