const Component = require('./component');
const constants = require('../common/constants');
const pomelo = require('pomelo');


class Zone extends Component {
    constructor(room) {
        super(room);
    }

    clear() {
        pomelo.app.rpc.zone.roomRemote.removeRoom(
            this.room.getAttr('game'),
            this.room.getComp('session').toJson(),
            () => { }
        );
    }

    init() {
        super.init();

        this.room.on(constants.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer.bind(this));
    }

    onSeatRemovePlayer() {
        // if (this.room.isPrivate() && this.room.isPlaying()) {
            // return;
        // }

        pomelo.app.rpc.zone.roomRemote.removeUser(
            this.room.getAttr('game'),
            this.room.getComp('session').toJson(),
            () => { }
        );
    }
}


module.exports = Zone;