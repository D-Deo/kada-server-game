const Component = require('./component');
const constants = require('../common/constants');
const utils = require('../utils');
const _ = require('underscore');
const uuid = require('uuid/v4');


class RoundScheduler extends Component {
    constructor(room) {
        super(room);

        this.index = 0;
        this.balance = null;
        this.income = 0;
    }

    begin() {
        this.index += 1;
        this.balance = null;
        this.room.setAttr('gameId', uuid());
        this.room.setPlaying(true);
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.ROUND_BEGIN(), this.index);
        this.room.emit(constants.RoomEvent.ROUND_BEGIN());
    }

    result(balance, income = 0) {
        this.balance = balance;
        this.balance.timestamp = utils.date.timestamp();
        this.income = income;
        this.room.emit(constants.RoomEvent.ROUND_RESULT(), this.balance);
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.ROUND_RESULT(), this.balance);
        this.isEnded() && this.room.result();
    }

    end(playing = true) {
        this.room.setPlaying(playing);
        this.room.setAttr('gameId', null);
        this.room.emit(constants.RoomEvent.ROUND_END());
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.ROUND_END(), this.index);
        this.isEnded() ? this.room.clear(this.room.isPrivate() ? constants.RoomClearReason.ENDED() : constants.RoomClearReason.RESULT()) : this.room.reset();
    }

    getBalance() {
        return this.balance;
    }

    getIndex() {
        return this.index;
    }

    isEnded() {
        if (this.room.getComp('state').isEnded()) {
            return true;
        }

        if (this.room.getAttr('rounds') < 0) {
            return false;
        }

        return this.index >= this.room.getAttr('rounds');
    }

    isFirst() {
        return this.index <= 1;
    }

    toJson() {
        return _.pick(this, ['index', 'balance']);
    }

    toJson_Record() {
        let json = {};
        json.round = this.index;
        json.balance = this.balance;
        json.income = this.income;
        return json;
    }
}


module.exports = RoundScheduler;