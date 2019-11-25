const Component = require('./component');
const constants = require('../common/constants');
const utils = require('../utils/index');
const _ = require('underscore');


class TurnScheduler extends Component {
    constructor(room) {
        super(room);

        this.idGenerator = 0;
    }

    action(seat, action, next) {
        if (!action.turn) {
            return false;
        }

        if (action.name == constants.RoomAction.PLAYER_ACTION()) {
            return false;
        }

        if (!this.running) {
            utils.next(next, constants.ResultCode.ROOM_TURN_EXPIRED());
            return true;
        }

        if (this.running.isEnded()) {
            utils.next(next, constants.ResultCode.ROOM_TURN_EXPIRED());
            return true;
        }

        if (this.running.getId() !== action.turn) {
            utils.next(next, constants.ResultCode.ROOM_TURN_EXPIRED());
            return true;
        }

        this.running.action(seat, action, next);
        return true;
    }

    clear() {
        this.turns = [];

        if (this.running) {
            this.running.clear();
            this.running = null;
        }
    }

    createTurnId() {
        return ++this.idGenerator;
    }

    forward() {
        this.running = this.turns.shift();
        if (!this.running) {
            return;
        }

        this.room.emit(constants.RoomEvent.TURN_START(), this.running);
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.TURN_START(), this.running.toJson());
        this.running.begin();
    }

    getRunning() {
        return this.running;
    }

    getTurnId() {
        return this.running ? this.running.getId() : null;
    }

    init() {
        super.init();
        this.turns = [];
        this.running = null;
        this.room.on(constants.RoomEvent.ROOM_UPDATE(), this.update.bind(this));
    }

    isEmpty() {
        return !this.running && _.isEmpty(this.turns);
    }

    schedule(turn) {
        this.turns.push(turn);
    }

    toJson() {
        return this.running ? this.running.toJson() : null;
    }

    update(dt) {
        if (!this.running || this.running.isEnded()) {
            this.forward();
            return;
        }

        this.running.update(dt);
    }
}


module.exports = TurnScheduler;