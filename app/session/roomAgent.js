const pomelo = require('pomelo');
const RoomSession = require('./roomSession');
const utils = require('../utils');


class RoomAgent {
    static fromJson(json) {
        return new RoomAgent(RoomSession.fromJson(json.session), json.playing, json.attrs, json.seats);
    }

    constructor(session, playing, attrs, seats) {
        this.session = session;
        this.playing = playing;
        this.attrs = attrs;
        this.seats = seats;
    }

    getServerId() {
        return this.session.getServerId();
    }

    getGame() {
        return this.session.getGame();
    }

    getRoomId() {
        return this.session.getRoomId();
    }

    getOwner() {
        return this.session.getOwner();
    }

    getGuild() {
        return this.session.getGuild();
    }

    setPlayer(index, player) {
        this.seats[index] = player;
    }

    setPlaying(value) {
        this.playing = value;
    }

    toJson() {
        let json = {};
        json.session = this.session.toJson();
        json.playing = this.playing;
        json.attrs = this.attrs;
        json.seats = this.seats;
        return json;
    }

    join(session, cb) {
        pomelo.app.rpc.room.roomRemote.enterRoom(this.getServerId(), this.getGame(), this.getRoomId(), session.toJson(), (err) => {
            utils.cb(cb, err);
        });
    }
}


module.exports = RoomAgent;