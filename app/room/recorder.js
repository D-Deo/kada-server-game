const Comp = require('./component');
const cons = require('../common/constants');
const _ = require('underscore');


class Recorder extends Comp {
    constructor(room) {
        super(room);

    }

    init() {
        super.init();

        this.actions = null;
        this.state = null;

        this.room.on(cons.RoomEvent.ROOM_ACTION(), this.onRoomAction.bind(this));
        this.room.on(cons.RoomEvent.ROUND_BEGIN(), this.onRoundBegin.bind(this));
        this.room.on(cons.RoomEvent.ROUND_END(), this.onRoundEnd.bind(this));
    }

    isEmpty() {
        return !this.actions || _.isEmpty(this.actions);
    }

    onRoomAction(name, msg) {
        if (this.actions === null) {
            return;
        }

        if (name === cons.RoomAction.CHAT()) {
            return;
        }

        this.actions.push({ name, msg });
    }

    onRoundBegin() {
        if (!this.room.getAttr('recording')) {
            return;
        }

        this.actions = [];
        this.state = this.room.toJson();
    }

    onRoundEnd() {
        if (!this.room.getAttr('recording')) {
            return;
        }
        // this.room.getComp('db').onRoundRecord(this.state, this.actions);
    }

    reset() {
        this.actions = null;
        this.round = null;
        this.state = null;
    }
}


module.exports = Recorder;