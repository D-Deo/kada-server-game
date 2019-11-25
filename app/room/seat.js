const constants = require('../common/constants');
const utils = require('../utils/index');
const _ = require('underscore');


class Seat {
    constructor(room, index) {
        this.room = room;
        this.index = index;
        this.user = null;
        this.records = {};
        this.ready = false;

        this.clear();
    }

    onRoundBegin() {
        if (this.user && !this.user.isRobot()) {
            this.playUserId = this.user.getId();
            this.playScore = this.user.getScore();
        }
    }

    onRoundEnd() {
        this.playUserId = null;
        this.playScore = null;
    }

    bindUser(user) {
        this.user = user;
        if (this.user && !this.user.isRobot()) {
            this.playUserId = this.user.getId();
            this.playScore = this.user.getScore();
        }
        this.user.sendAction(constants.RoomAction.PLAYER_ENTER_ROOM(), this.room.toJson(this));
        this.room.emit(constants.RoomEvent.SEAT_ADD_PLAYER(), this, user);
    }

    unbindUser(reason, cb) {
        if (this.isEmpty()) {
            utils.cbOK(cb);
            return null;
        }

        let user = this.user;
        user.leaveRoom(reason, cb);
        this.user = null;
        this.clear();
        this.room.emit(constants.RoomEvent.SEAT_REMOVE_PLAYER(), this, user);
        return user;
    }

    hostUser() {
        if (this.isEmpty() || this.isHosting()) {
            return;
        }

        let session = this.user.unbindSession();
        this.room.getComp('channel').leave(session);
        this.room.getComp('channel').sendAction(constants.RoomAction.PLAYER_HOST(), { seat: this.index, hosting: this.isHosting() });
    }

    unhostUser(session) {
        if (this.isEmpty() || !this.isHosting()) {
            return;
        }

        this.user.bindSession(session);
        this.user.sendAction(constants.RoomAction.PLAYER_ENTER_ROOM(), this.room.toJson(this));

        let channel = this.room.getComp('channel');
        channel.sendAction(constants.RoomAction.PLAYER_HOST(), { seat: this.index, hosting: this.isHosting() });
        channel.join(this.user.getSession());
    }

    clear() {
        this.records = {};
        this.ready = false;
    }

    getIndex() {
        return this.index;
    }

    setIndex(index) {
        this.index = index;
    }

    getUser() {
        return this.user;
    }

    getUserId() {
        return this.user ? this.user.getId() : null;
    }

    getUserSession() {
        return this.user ? this.user.getSession() : null;
    }

    getPlayUserId() {
        return this.playUserId;
    }

    getPlayUserScore() {
        return this.playScore;
    }

    setReady(ready = true) {
        if (this.ready === ready) {
            return;
        }

        this.ready = ready;
        this.room.emit(constants.RoomEvent.PLAYER_READY(), this);

        this.sendChannelAction(constants.RoomAction.PLAYER_READY(), { ready });
    }

    isEmpty() {
        return !this.user;
    }

    isHosting() {
        return !!(this.user && !this.user.getSession());
    }

    isReady() {
        if (this.isEmpty()) {
            return false;
        }
        return this.ready || this.isRobot();
    }

    isTest() {
        return this.user && this.user.isTest();
    }

    isRobot() {
        return this.user && this.user.isRobot();
    }

    isPlaying() {
        if (this.isEmpty()) {
            return false;
        }

        return this.room.isPlaying();
    }

    isBlack() {
        return false;
    }

    next(sitting = false) {
        let iterator = (this.index + 1) % this.room.getAttr('capacity');
        while (iterator !== this.index) {
            let seat = this.room.getComp('seat').getSeat(iterator);
            if (!sitting || seat.isReady()) {
                return seat;
            }
            iterator = (iterator + 1) % this.room.getAttr('capacity');
        }
        return null;
    }

    nexts(self = false) {
        let seats = this.room.getComp('seat').getSeats();
        seats = _.sortBy(seats, s => (seats.length + s.getIndex() - this.index) % seats.length);
        !self && seats.shift();
        return seats;
    }

    prev(sitting = false) {
        let iterator = (this.index - 1 + this.room.getAttr('capacity')) % this.room.getAttr('capacity');
        while (iterator !== this.index) {
            let seat = this.room.getComp('seat').getSeat(iterator);
            if (!sitting || seat.isReady()) {
                return seat;
            }
            iterator = (iterator - 1 + this.room.getAttr('capacity')) % this.room.getAttr('capacity');
        }
        return null;
    }

    prevs(self = false) {
        let seats = this.room.getComp('seat').getSeats();
        seats = _.sortBy(seats, s => 10000 - (seats.length + s.getIndex() - this.index) % seats.length);
        seats.pop();
        self && seats.splice(0, 0, this);
        return seats;
    }

    record(key, value) {
        this.records[key] = (value || 0);
    }

    recordAdd(key, value) {
        this.records[key] = (this.records[key] || 0) + (value || 1);
    }

    recordMax(key, value) {
        this.records[key] = _.max([this.records[key] || 0, value || 1]);
    }

    reset() {

    }

    send(route, msg) {
        if (this.isEmpty() || this.isHosting()) {
            return;
        }

        this.user.getSession().send(route, msg);
    }

    sendAction(name, msg) {
        this.send(constants.RoomAction.ROUTE(), { name, msg });
    }

    sendChannelAction(name, msg) {
        msg = msg || {};
        msg.seat = this.getIndex();
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), name, msg);
    }

    toJson() {
        let json = _.pick(this, ['index', 'ready']);
        json.hosting = this.isHosting();
        json.user = this.user ? this.user.toJson() : null;
        return json;
    }

    toJsonForAgent() {
        if (this.isEmpty()) {
            return null;
        }

        return this.user.toJsonForAgent();
    }

    toJson_Result() {
        if (this.isEmpty()) {
            return null;
        }

        let json = _.extend(this.records, this.user.toJson_Result());
        json.timestamp = utils.date.timestamp();
        return json;
    }
}


module.exports = Seat;