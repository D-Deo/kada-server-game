const Component = require('./component');
const constants = require('../common/constants');
const Timer = require('../common/timer');


class Updater extends Component {
    constructor(room) {
        super(room);
    }

    clear() {
        if(!this.handler) {
            return;
        }

        clearInterval(this.handler);
        this.handler = null;
    }

    init() {
        super.init();

        this.handler = setInterval(() => this.update(), this.room.getAttr('interval') || constants.ROOM_UPDATE_INTERVAL());
        this.timer = new Timer();
    }

    update() {
        this.room.emit(constants.RoomEvent.ROOM_UPDATE(), this.timer.dt());
    }
}


module.exports = Updater;