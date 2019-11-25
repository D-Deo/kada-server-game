const cons = require('../../../common/constants');
const IdGenerator = require('../../../room/idGenerator');
const RoomManager = require('../../../zone/roomManager');
const utils = require('../../../utils');
const _ = require('underscore');


class PrivateService {
    constructor(app) {
        this.app = app;
        this.idGenerator = IdGenerator.create(cons.PRIVATE_ROOM_ID_LENGTH());
        this.rooms = {};
    }

    addRoom(room) {
        this.rooms[room.getGame()] = this.rooms[room.getGame()] || {};
        this.rooms[room.getGame()][room.getId()] = room;
        room.on('Remove', this.onRoomRemove.bind(this));
    }

    createRoom(params) {
        let [err, room] = RoomManager.getInstance().createRoom(params, this.idGenerator);
        if(err) {
            return [err];
        }

        this.addRoom(room);
        return [null, room];
    }

    getRoom(game, id) {
        if(!_.has(this.rooms, game)) {
            return null;
        }

        return this.rooms[game][id];
    }

    onRoomRemove(room) {
        this.removeRoom(room.getGame(), room.getId());
    }

    removeRoom(game, id) {
        delete this.rooms[game][id];
    }
}


module.exports = (app) => new PrivateService(app);