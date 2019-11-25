const Component = require('./component');
const constants = require('../common/constants');
const pomelo = require('pomelo');
const _ = require('underscore');


class Channel extends Component {
    constructor(room) {
        super(room);
    }

    clear() {
        if (this.room) {
            pomelo.app.get('channelService').destroyChannel("room-" + this.room.getId());
        }
        this.room = null;
        this.channel = null;
    }

    init() {
        super.init();

        this.channel = pomelo.app.get('channelService').createChannel("room-" + this.room.getId());

        this.room.on(constants.RoomEvent.ROOM_CHANGE_PLAYING(), () => {
            this.sendAction(constants.RoomAction.ROOM_PLAYING(), this.room.isPlaying());
        });

        this.room.on(constants.RoomEvent.ROOM_ACTION(), this.sendAction.bind(this));
        this.room.on(constants.RoomEvent.PLAYER_ENTER_ROOM(), this.onPlayerEnterRoom.bind(this));
        this.room.on(constants.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer.bind(this));
        this.room.on(constants.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer.bind(this));
    }

    join(session) {
        if (!session || !session.getChannelSession() || !this.channel) {
            return;
        }

        this.channel.add(session.getUserSessionId(), session.getServerId());
    }

    leave(session) {
        if (!session || !session.getChannelSession() || !this.channel) {
            return;
        }

        this.channel.leave(session.getUserSessionId(), session.getServerId());
    }

    send(route, msg) {
        if (!this.channel) {
            return;
        }

        this.channel.pushMessage(route, msg, {}, () => { });
    }

    sendAction(name, msg) {
        if (!this.channel) {
            return;
        }

        msg = _.isUndefined(msg) ? {} : msg;
        this.send(constants.RoomAction.ROUTE(), { name, msg });
    }

    onPlayerEnterRoom(seat) {
        this.join(seat.getUserSession());
    }

    onSeatAddPlayer(seat) {
        this.sendAction(constants.RoomAction.SEAT_ADD_PLAYER(), seat.toJson());
        this.join(seat.getUserSession());
    }

    onSeatRemovePlayer(seat, user) {
        this.leave(user.getSession());
        this.sendAction(constants.RoomAction.SEAT_REMOVE_PLAYER(), seat.getIndex());
    }
}


module.exports = Channel;