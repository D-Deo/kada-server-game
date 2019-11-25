const cons = require('../../../common/constants');
const Super = require('../../../room/db');
const utils = require('../../../utils');

class Db extends Super {
    init() {
        super.init();

        this.room.on(cons.RoomEvent.ROOM_CREATE(), this.onRoomCreate.bind(this));
        this.room.on(cons.RoomEvent.ROOM_CLEAR(), this.onRoomClear.bind(this));
    }

    onRoomCreate() {
        this.update({
            state: cons.RoomRecord.PLAYING(),
            beginTime: utils.date.timestamp()
        });
    }
}

module.exports = Db;