const Room = require('../../../room/room');
const _ = require('underscore');
const uuid = require('uuid/v4');


class RoomService {
    constructor(app) {
        this.app = app;
        this.rooms = {};
    }

    addRoom(room) {
        this.rooms[room.getGame()] = this.rooms[room.getGame()] || {};
        this.rooms[room.getGame()][room.getId()] = room;
    }

    createRoom(params) {
        let room = new Room(params);
        this.addRoom(room);
        return room;
    }

    getRoom(game, id) {
        if(!_.has(this.rooms, game)) {
            return null;
        }

        return this.rooms[game][id];
    }

    getWhiteRoom(game, id, user) {
        if (!_.has(this.rooms, game)) {
            return null;
        }

        let keys = Object.keys(this.rooms[game]);
        let rooms = [];
        keys.forEach(key => {
            if (!this.rooms[game][key].isBlack(user) && !this.rooms[game][key].isPlayed(user) && !this.rooms[game][key].getComp('seat').isFull()) {
                rooms.push(this.rooms[game][key]);
            }
        });
        if (rooms.length > 0) {
            return rooms[_.random(0, rooms.length - 1)];
        }

        let params = this.rooms[game][id].attrs;
        params.uuid = uuid();
        let room = new Room(params);
        this.addRoom(room);
        return room;
    }

    getRoomByArea(game, area) {
        if(!_.has(this.rooms, game)) {
            return null;
        }
        let room  = _.find(this.rooms[game], (room) => {
            return room.getAttr('area') == area;
        })
        return room;
    }

    getRooms(game, area) {
        if(!_.has(this.rooms, game)) {
            return [];
        }
        let room  = _.filter(this.rooms[game], (room) => {
            return room.getAttr('area') == area;
        })
        return room;
    }

    removeRoom(game, id) {
        delete this.rooms[game][id];
    }
    
    getPlayingRoom() {
        let roomIds = [];
        _.each(this.rooms, (rooms) => {
            _.each(rooms, (room, roomid) => {
                (!room.isPlaying()) || roomIds.push(roomid);
            })
        })
        return roomIds;
    }
}


module.exports = (app) => new RoomService(app);