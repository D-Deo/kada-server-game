const constants = require('../common/constants');
const utils = require('../utils/index');


class RoomContorller {
    constructor(room) {
        this.room = room;
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

    dismiss(userId, cb) {
        if (!this.room.getAttr('dismissable')) {
            utils.cbError(cb);
            return;
        }

        if (!this.room.isPlaying() && this.room.isOwner(userId)) {
            this.room.emit(constants.RoomEvent.ROOM_DISMISS(), constants.RoomClearReason.OWNER_DISMISS());
            this.room.clear(constants.RoomClearReason.OWNER_DISMISS());
            utils.cbOK(cb);
            return;
        }

        if (!this.room.isPlaying()) {
            utils.cb(cb, constants.ResultCode.ROOM_DISMISS_ERROR());
            return;
        }

        this.room.getComp('dismiss').start(userId);
        utils.cbOK(cb);
    }

    result() {
        let balance = this.room.getComp('state').result();
        balance = this.room.getComp('meter').result(balance);
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.ROOM_RESULT(), balance);
        this.room.emit(constants.RoomEvent.ROOM_RESULT(), balance);
    }
}


module.exports = RoomContorller;
