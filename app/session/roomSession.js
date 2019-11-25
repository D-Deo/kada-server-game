const pomelo = require('pomelo');
const _ = require('underscore');


class RoomSession {
    static fromBackendSession(session) {
        let json = session.get('room');
        return json ? RoomSession.fromJson(json) : null;
    }

    static fromJson(json) {
        return new RoomSession(json.serverId, json.game, json.roomId, json.owner, json.guild);
    }

    static fromRoom(room) {
        return new RoomSession(
            pomelo.app.getServerId(),
            room.getAttr('game'),
            room.getAttr('id'),
            room.getAttr('owner'),
            room.getAttr('guild')
        );
    }

    constructor(serverId, game, roomId, owner, guild) {
        this.serverId = serverId;
        this.game = game;
        this.roomId = roomId;
        this.owner = owner;
        this.guild = guild;
    }

    getServerId() {
        return this.serverId;
    }

    getGame() {
        return this.game;
    }

    getRoomId() {
        return this.roomId;
    }

    getOwner() {
        return this.owner;
    }

    getGuild() {
        return this.guild;
    }

    toJson() {
        return _.pick(this, ['serverId', 'game', 'roomId', 'owner', 'guild']);
    }
}


module.exports = RoomSession;