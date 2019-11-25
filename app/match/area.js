const cons = require('../common/constants');
const GameManager = require('../game/manager');
const RoomManager = require('../zone/roomManager');
const UserSession = require('../session/userSession');
const utils = require('../utils');
const _ = require('underscore');
const model = require('../db/model');

class Area {
    constructor(zone, id, idGenerator, params) {
        this.zone = zone;

        this.id = id;
        this.idGenerator = idGenerator;
        this.params = params || {};
        this.cachingRooms = {};
        this.matchingRooms = {};
        this.users = 0;

        // 如果需要，一开始就创建一个
        if (this.params.created) {
            this.createMatchingRoom();
        }
    }

    getId() {
        return this.id;
    }

    getParam(key) {
        return this.params[key];
    }

    addCachingRoom(room) {
        if (this.getCachingRoom(room.getId())) {
            return;
        }

        if (this.getMatchingRoom(room.getId())) {
            this.removeMatchingRoom(room.getId());
        }

        this.cachingRooms[room.getId()] = room;
    }

    getCachingRoom(id) {
        return this.cachingRooms[id];
    }

    removeCachingRoom(id) {
        delete this.cachingRooms[id];
    }

    addMatchingRoom(room) {
        this.matchingRooms[room.getId()] = room;
        this.removeCachingRoom(room.getId());

        if (!room.isEmpty() || (_.size(this.matchingRooms) <= 1)) {
            return;
        }
        this.removeMatchingRoom(room.getId());
        room.remove();
    }

    createMatchingRoom(cb, count = 1) {
        _.times(count, () => {

            let [err1, params] = GameManager.getInstance().call1(this.zone.getGame(), 'zone.match.parseRoomParams', this);
            if (err1) {
                console.error('Err1 MatchArea createMatchingRoom: ', err1);
                return;
            }

            let [err2, room] = RoomManager.getInstance().createRoom(params, this.idGenerator);
            if (err2) {
                console.error('Err2 MatchArea createMatchingRoom: ', err2);
                return;
            }

            room.on('AddUser', this.onRoomAddUser.bind(this));
            room.on('RemoveUser', this.onRoomRemoveUser.bind(this));
            room.create(null, params.created ? 2000 : 0);
            this.matchingRooms[room.getId()] = room;

            cb && cb();

            // model.RoomParams.find({ where: { game: this.zone.getGame(), area: this.id } }).then(data => {
            //     let [err1, params] = GameManager.getInstance().call1(this.zone.getGame(), 'zone.match.parseRoomParams', this);
            //     if (err1 || !data) {
            //         console.error('Err1 MatchArea createMatchingRoom: ', err1 || !data);
            //         return;
            //     }

            //     // data.options = JSON.parse(data.options);
            //     // for (let key in data.options) {
            //     //     params[key] = data.options[key];
            //     // }
            //     // params.play = data.play;

            //     let [err2, room] = RoomManager.getInstance().createRoom(params, this.idGenerator);
            //     if (err2) {
            //         console.error('Err2 MatchArea createMatchingRoom: ', err2);
            //         return;
            //     }

            //     room.on('AddUser', this.onRoomAddUser.bind(this));
            //     room.on('RemoveUser', this.onRoomRemoveUser.bind(this));
            //     room.create();
            //     this.matchingRooms[room.getId()] = room;

            //     cb && cb();
            // });
        });
    }

    getMatchingRoom(id) {
        return this.matchingRooms[id];
    }

    randomMatchingRoom(cb) {
        if (_.isEmpty(this.matchingRooms)) {
            this.createMatchingRoom(() => {
                cb && cb(utils.randomObject(this.matchingRooms));
            });
            return;
        }

        cb && cb(utils.randomObject(this.matchingRooms));
        // return utils.randomObject(this.matchingRooms);
    }

    removeMatchingRoom(id) {
        delete this.matchingRooms[id];
    }

    match(user, cb) {
        this.randomMatchingRoom(room => {
            if (!room) {
                utils.cb(cb, cons.ResultCode.SERVER_BUSY());
                return;
            }

            utils.cbProm(cb, room.enter(user.getSession()));
        });
    }

    onRoomAddUser(room) {
        this.users += 1;
        room.isFull() && this.addCachingRoom(room);
    }

    onRoomRemoveUser(room) {
        this.users -= 1;
        this.addMatchingRoom(room);
    }

    toJson() {
        return _.pick(this, ['id', 'params', 'users']);
    }
}


module.exports = Area;