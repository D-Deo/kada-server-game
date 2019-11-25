const constants = require('../common/constants');


class Component {
    constructor(room) {
        this.room = room;

        this.init();
    }

    clear() {}

    init() {
        this.room.on(constants.RoomEvent.ROOM_CLEAR(), this.clear, this);
        this.room.on(constants.RoomEvent.ROOM_RESET(), this.reset, this);
    }

    reset() {}
}


module.exports = Component;